#!/bin/bash
# Digital Platform - Automated Debian Deployment Script
# Supports: Debian 11/12, Ubuntu 20.04+
# Usage: curl -sSL https://raw.githubusercontent.com/your-repo/deploy-debian.sh | bash

set -e

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
DOMAIN="${DOMAIN:-app.clevercompany.ai}"
APP_DIR="/var/www/digital-platform"
DEPLOY_USER="deploy"
NODE_VERSION="18"
GIT_REPO="${GIT_REPO:-https://github.com/your-username/platform-app.git}"

# Logging
LOG_FILE="/var/log/digital-platform-install.log"
exec 1> >(tee -a "$LOG_FILE")
exec 2> >(tee -a "$LOG_FILE" >&2)

log() {
    echo -e "${GREEN}[$(date +'%Y-%m-%d %H:%M:%S')]${NC} $1"
}

warn() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

error() {
    echo -e "${RED}[ERROR]${NC} $1"
    exit 1
}

# Check if running as root
check_root() {
    if [[ $EUID -ne 0 ]]; then
        error "This script must be run as root (use sudo)"
    fi
}

# Detect OS
detect_os() {
    if [[ -f /etc/os-release ]]; then
        . /etc/os-release
        OS=$ID
        OS_VERSION=$VERSION_ID
    else
        error "Cannot detect operating system"
    fi
    
    log "Detected OS: $PRETTY_NAME"
    
    case $OS in
        debian|ubuntu)
            log "Supported OS detected"
            ;;
        *)
            error "Unsupported OS: $OS. This script supports Debian and Ubuntu only."
            ;;
    esac
}

# Update system packages
update_system() {
    log "Updating system packages..."
    apt update
    apt upgrade -y
    
    # Install essential packages
    apt install -y \
        curl \
        wget \
        gnupg2 \
        software-properties-common \
        apt-transport-https \
        ca-certificates \
        lsb-release \
        build-essential \
        python3 \
        python3-pip \
        git \
        htop \
        ufw \
        fail2ban \
        logrotate \
        cron \
        jq
}

# Configure firewall
setup_firewall() {
    log "Configuring firewall..."
    ufw --force enable
    ufw default deny incoming
    ufw default allow outgoing
    ufw allow ssh
    ufw allow 80
    ufw allow 443
    
    # Rate limiting for SSH
    ufw limit ssh
    
    log "Firewall configured successfully"
}

# Create swap if needed
create_swap() {
    local total_mem=$(free -m | awk 'NR==2{printf "%.0f", $2}')
    
    if [[ $total_mem -lt 4096 ]] && [[ ! -f /swapfile ]]; then
        log "Creating 2GB swap file (system has ${total_mem}MB RAM)..."
        fallocate -l 2G /swapfile
        chmod 600 /swapfile
        mkswap /swapfile
        swapon /swapfile
        echo '/swapfile none swap sw 0 0' >> /etc/fstab
        log "Swap file created successfully"
    else
        log "Sufficient RAM or swap already exists, skipping swap creation"
    fi
}

# Create deploy user
create_deploy_user() {
    log "Creating deploy user..."
    
    if id "$DEPLOY_USER" &>/dev/null; then
        log "User $DEPLOY_USER already exists"
    else
        adduser --disabled-password --gecos "" $DEPLOY_USER
        usermod -aG sudo $DEPLOY_USER
        log "User $DEPLOY_USER created successfully"
    fi
    
    # Setup SSH keys
    mkdir -p /home/$DEPLOY_USER/.ssh
    if [[ -f /root/.ssh/authorized_keys ]]; then
        cp /root/.ssh/authorized_keys /home/$DEPLOY_USER/.ssh/
    fi
    chown -R $DEPLOY_USER:$DEPLOY_USER /home/$DEPLOY_USER/.ssh
    chmod 700 /home/$DEPLOY_USER/.ssh
    chmod 600 /home/$DEPLOY_USER/.ssh/authorized_keys 2>/dev/null || true
}

# Install Node.js
install_nodejs() {
    log "Installing Node.js $NODE_VERSION..."
    
    # Remove existing Node.js
    apt remove -y nodejs npm 2>/dev/null || true
    
    # Install via NodeSource repository
    curl -fsSL https://deb.nodesource.com/setup_${NODE_VERSION}.x | bash -
    apt install -y nodejs
    
    # Install global packages
    npm install -g pm2 yarn
    
    # Verify installation
    local node_version=$(node --version)
    local npm_version=$(npm --version)
    log "Node.js installed: $node_version, npm: $npm_version"
}

# Install and configure Nginx
install_nginx() {
    log "Installing and configuring Nginx..."
    
    apt install -y nginx
    systemctl start nginx
    systemctl enable nginx
    
    # Remove default site
    rm -f /etc/nginx/sites-enabled/default
    
    # Create Digital Platform configuration
    cat > /etc/nginx/sites-available/digital-platform << 'EOF'
# Digital Platform Nginx Configuration
limit_req_zone $binary_remote_addr zone=api:10m rate=10r/s;
limit_req_zone $binary_remote_addr zone=login:10m rate=5r/m;

upstream platform_backend {
    server 127.0.0.1:3000;
    keepalive 64;
}

upstream benchmark_backend {
    server 127.0.0.1:3001;
    keepalive 64;
}

upstream csrd_backend {
    server 127.0.0.1:3002;
    keepalive 64;
}

upstream support_backend {
    server 127.0.0.1:3003;
    keepalive 64;
}

server {
    listen 80;
    server_name DOMAIN_PLACEHOLDER;
    
    location /.well-known/acme-challenge/ {
        root /var/www/html;
    }
    
    location / {
        return 301 https://$server_name$request_uri;
    }
}

server {
    listen 443 ssl http2;
    server_name DOMAIN_PLACEHOLDER;

    # Temporary self-signed certificate (will be replaced by Let's Encrypt)
    ssl_certificate /etc/ssl/certs/ssl-cert-snakeoil.pem;
    ssl_certificate_key /etc/ssl/private/ssl-cert-snakeoil.key;
    
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-RSA-AES128-GCM-SHA256:ECDHE-RSA-AES256-GCM-SHA384;
    ssl_prefer_server_ciphers on;
    ssl_session_cache shared:SSL:10m;
    ssl_session_timeout 1d;

    add_header X-Frame-Options DENY;
    add_header X-Content-Type-Options nosniff;
    add_header X-XSS-Protection "1; mode=block";
    add_header Referrer-Policy "strict-origin-when-cross-origin";

    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_proxied any;
    gzip_comp_level 6;
    gzip_types
        text/plain
        text/css
        text/xml
        text/javascript
        application/json
        application/javascript
        application/xml+rss
        application/atom+xml
        image/svg+xml;

    location / {
        limit_req zone=api burst=20 nodelay;
        proxy_pass http://platform_backend;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        proxy_connect_timeout 30s;
        proxy_send_timeout 30s;
        proxy_read_timeout 30s;
    }

    location /benchmark {
        limit_req zone=api burst=20 nodelay;
        proxy_pass http://benchmark_backend;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        rewrite ^/benchmark(.*)$ $1 break;
    }

    location /csrd {
        limit_req zone=api burst=20 nodelay;
        proxy_pass http://csrd_backend;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        rewrite ^/csrd(.*)$ $1 break;
    }

    location /support {
        limit_req zone=api burst=20 nodelay;
        proxy_pass http://support_backend;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        rewrite ^/support(.*)$ $1 break;
    }

    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
        access_log off;
        try_files $uri @app;
    }

    location @app {
        proxy_pass http://platform_backend;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    location /health {
        access_log off;
        return 200 "healthy\n";
        add_header Content-Type text/plain;
    }

    location ~ /\. {
        deny all;
        access_log off;
        log_not_found off;
    }
}
EOF

    # Replace domain placeholder
    sed -i "s/DOMAIN_PLACEHOLDER/$DOMAIN/g" /etc/nginx/sites-available/digital-platform
    
    # Enable site
    ln -sf /etc/nginx/sites-available/digital-platform /etc/nginx/sites-enabled/
    
    # Test configuration
    nginx -t
    systemctl reload nginx
    
    log "Nginx configured successfully"
}

# Install SSL certificate
install_ssl() {
    log "Installing Let's Encrypt SSL certificate..."
    
    # Install snapd if not present
    if ! command -v snap &> /dev/null; then
        apt install -y snapd
        systemctl enable --now snapd.socket
        sleep 5
    fi
    
    # Install certbot
    snap install --classic certbot
    ln -sf /snap/bin/certbot /usr/bin/certbot
    
    # Create directory for webroot
    mkdir -p /var/www/html
    
    # Get certificate
    if certbot --nginx -d "$DOMAIN" --non-interactive --agree-tos --email "admin@$DOMAIN" --redirect; then
        log "SSL certificate installed successfully"
        
        # Test auto-renewal
        certbot renew --dry-run
        log "SSL auto-renewal test passed"
    else
        warn "SSL certificate installation failed. You can run 'sudo certbot --nginx -d $DOMAIN' manually later"
    fi
}

# Setup application
setup_application() {
    log "Setting up application..."
    
    # Create application directory
    mkdir -p "$APP_DIR"
    chown $DEPLOY_USER:$DEPLOY_USER "$APP_DIR"
    
    # Clone repository as deploy user
    sudo -u $DEPLOY_USER bash << EOF
cd $APP_DIR
if [[ -d .git ]]; then
    git pull origin main
else
    git clone $GIT_REPO .
fi
EOF

    # Install dependencies
    sudo -u $DEPLOY_USER bash << EOF
cd $APP_DIR
npm install
npm run build
EOF

    log "Application setup completed"
}

# Create environment file
create_environment() {
    log "Creating production environment file..."
    
    # Generate secrets
    local nextauth_secret=$(openssl rand -base64 64)
    
    cat > "$APP_DIR/.env.production" << EOF
# Production Configuration
NODE_ENV=production

# Base URL
NEXT_PUBLIC_BASE_URL=https://$DOMAIN

# NextAuth Configuration
NEXTAUTH_URL=https://$DOMAIN
NEXTAUTH_SECRET=$nextauth_secret

# Cidaas OIDC Configuration
CIDAAS_CLIENT_ID=1401d46e-ad31-4b36-98e3-9a740a14a64b
CIDAAS_CLIENT_SECRET=fe7f18a5-4497-4a02-ad20-23f9cc30bd3b

# Supabase Configuration (update with your values)
# NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
# SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-role-key
# NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key

# Port Configuration
PORT_RANGE_START=3000

# Logging
LOG_LEVEL=info
LOG_FILE=/var/log/digital-platform/app.log

# Performance
NODE_OPTIONS="--max-old-space-size=2048"
EOF

    chown $DEPLOY_USER:$DEPLOY_USER "$APP_DIR/.env.production"
    chmod 600 "$APP_DIR/.env.production"
    
    log "Environment file created"
}

# Setup PM2
setup_pm2() {
    log "Setting up PM2 process manager..."
    
    # Create log directory
    mkdir -p /var/log/digital-platform
    chown $DEPLOY_USER:$DEPLOY_USER /var/log/digital-platform
    
    # Create PM2 ecosystem file
    cat > "$APP_DIR/ecosystem.config.js" << 'EOF'
const fs = require('fs');
const path = require('path');

// Load environment variables
const envFile = path.join(__dirname, '.env.production');
const env = {};

if (fs.existsSync(envFile)) {
  const envContent = fs.readFileSync(envFile, 'utf8');
  envContent.split('\n').forEach(line => {
    const [key, ...values] = line.split('=');
    if (key && !key.startsWith('#')) {
      env[key.trim()] = values.join('=').trim();
    }
  });
}

module.exports = {
  apps: [
    {
      name: 'platform-main',
      cwd: '/var/www/digital-platform/apps/platform',
      script: 'npm',
      args: 'start',
      env: {
        ...env,
        NODE_ENV: 'production',
        PORT: 3000
      },
      instances: 2,
      exec_mode: 'cluster',
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      error_file: '/var/log/digital-platform/platform-error.log',
      out_file: '/var/log/digital-platform/platform-out.log',
      log_file: '/var/log/digital-platform/platform-combined.log',
      time: true,
      merge_logs: true
    },
    {
      name: 'benchmark-app',
      cwd: '/var/www/digital-platform/apps/benchmark',
      script: 'npm',
      args: 'start',
      env: {
        ...env,
        NODE_ENV: 'production',
        PORT: 3001
      },
      instances: 1,
      exec_mode: 'cluster',
      autorestart: true,
      watch: false,
      max_memory_restart: '512M',
      error_file: '/var/log/digital-platform/benchmark-error.log',
      out_file: '/var/log/digital-platform/benchmark-out.log',
      time: true
    },
    {
      name: 'csrd-app',
      cwd: '/var/www/digital-platform/apps/csrd',
      script: 'npm',
      args: 'start',
      env: {
        ...env,
        NODE_ENV: 'production',
        PORT: 3002
      },
      instances: 1,
      exec_mode: 'cluster',
      autorestart: true,
      watch: false,
      max_memory_restart: '512M',
      error_file: '/var/log/digital-platform/csrd-error.log',
      out_file: '/var/log/digital-platform/csrd-out.log',
      time: true
    },
    {
      name: 'support-app',
      cwd: '/var/www/digital-platform/apps/support',
      script: 'npm',
      args: 'start',
      env: {
        ...env,
        NODE_ENV: 'production',
        PORT: 3003
      },
      instances: 1,
      exec_mode: 'cluster',
      autorestart: true,
      watch: false,
      max_memory_restart: '512M',
      error_file: '/var/log/digital-platform/support-error.log',
      out_file: '/var/log/digital-platform/support-out.log',
      time: true
    }
  ]
};
EOF

    chown $DEPLOY_USER:$DEPLOY_USER "$APP_DIR/ecosystem.config.js"
    
    # Start applications with PM2
    sudo -u $DEPLOY_USER bash << EOF
cd $APP_DIR
pm2 start ecosystem.config.js
pm2 save
EOF

    # Setup PM2 startup
    local startup_cmd=$(sudo -u $DEPLOY_USER pm2 startup | grep "sudo env" | tail -1)
    eval "$startup_cmd"
    
    log "PM2 configured and applications started"
}

# Setup monitoring and maintenance scripts
setup_monitoring() {
    log "Setting up monitoring and maintenance scripts..."
    
    # Health check script
    cat > /usr/local/bin/health-check.sh << 'EOF'
#!/bin/bash
APPS=("platform-main" "benchmark-app" "csrd-app" "support-app")
PORTS=(3000 3001 3002 3003)

echo "=== Digital Platform Health Check $(date) ==="

echo "--- PM2 Status ---"
sudo -u deploy pm2 jlist | jq '.[] | {name: .name, status: .pm2_env.status, memory: .monit.memory, cpu: .monit.cpu}'

echo "--- Port Connectivity ---"
for i in "${!PORTS[@]}"; do
    PORT=${PORTS[$i]}
    APP=${APPS[$i]}
    
    if curl -f -s -o /dev/null "http://localhost:$PORT"; then
        echo "✅ $APP (port $PORT): OK"
    else
        echo "❌ $APP (port $PORT): FAILED"
        sudo -u deploy pm2 restart $APP
    fi
done

echo "--- Nginx Status ---"
if systemctl is-active --quiet nginx; then
    echo "✅ Nginx: Running"
else
    echo "❌ Nginx: Stopped"
    systemctl restart nginx
fi

if [[ -f /etc/letsencrypt/live/DOMAIN_PLACEHOLDER/cert.pem ]]; then
    echo "--- SSL Certificate ---"
    SSL_EXPIRY=$(openssl x509 -enddate -noout -in /etc/letsencrypt/live/DOMAIN_PLACEHOLDER/cert.pem | cut -d= -f2)
    echo "SSL expires: $SSL_EXPIRY"
fi
EOF

    sed -i "s/DOMAIN_PLACEHOLDER/$DOMAIN/g" /usr/local/bin/health-check.sh
    chmod +x /usr/local/bin/health-check.sh
    
    # Update script
    cat > /home/$DEPLOY_USER/update-platform.sh << 'EOF'
#!/bin/bash
set -e

APP_DIR="/var/www/digital-platform"
BACKUP_DIR="/var/backups/digital-platform"
DATE=$(date +%Y%m%d_%H%M%S)

echo "🚀 Starting Digital Platform Update - $DATE"

mkdir -p $BACKUP_DIR
cp -r $APP_DIR $BACKUP_DIR/platform_backup_$DATE

cd $APP_DIR
git fetch origin

echo "📋 Available updates:"
git log --oneline HEAD..origin/main

read -p "🤔 Continue with update? (y/N): " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "❌ Update aborted"
    exit 1
fi

git pull origin main
npm install
npm run build

pm2 reload ecosystem.config.js --update-env
sudo nginx -t && sudo systemctl reload nginx

sleep 10
/usr/local/bin/health-check.sh

find $BACKUP_DIR -name "platform_backup_*" -mtime +30 -exec rm -rf {} \;

echo "✅ Update completed!"
EOF

    chmod +x /home/$DEPLOY_USER/update-platform.sh
    chown $DEPLOY_USER:$DEPLOY_USER /home/$DEPLOY_USER/update-platform.sh
    
    # Log rotation
    cat > /etc/logrotate.d/digital-platform << EOF
/var/log/digital-platform/*.log {
    daily
    missingok
    rotate 14
    compress
    delaycompress
    notifempty
    create 0644 $DEPLOY_USER $DEPLOY_USER
    postrotate
        sudo -u $DEPLOY_USER pm2 reloadLogs
    endscript
}
EOF

    # Cron jobs
    sudo -u $DEPLOY_USER bash << 'EOF'
(crontab -l 2>/dev/null; echo "*/5 * * * * /usr/local/bin/health-check.sh >> /var/log/digital-platform/health-check.log 2>&1") | crontab -
(crontab -l 2>/dev/null; echo "0 2 * * * certbot renew --quiet") | crontab -
EOF

    log "Monitoring and maintenance scripts configured"
}

# Setup fail2ban
setup_fail2ban() {
    log "Configuring fail2ban..."
    
    cat > /etc/fail2ban/jail.local << EOF
[DEFAULT]
bantime = 10m
findtime = 10m
maxretry = 5

[sshd]
enabled = true
port = ssh
filter = sshd
logpath = /var/log/auth.log
maxretry = 3

[nginx-http-auth]
enabled = true
filter = nginx-http-auth
port = http,https
logpath = /var/log/nginx/error.log

[nginx-noscript]
enabled = true
port = http,https
filter = nginx-noscript
logpath = /var/log/nginx/access.log
maxretry = 6

[nginx-badbots]
enabled = true
port = http,https
filter = nginx-badbots
logpath = /var/log/nginx/access.log
maxretry = 2

[nginx-noproxy]
enabled = true
port = http,https
filter = nginx-noproxy
logpath = /var/log/nginx/access.log
maxretry = 2
EOF

    systemctl enable fail2ban
    systemctl restart fail2ban
    
    log "Fail2ban configured"
}

# Final verification
verify_installation() {
    log "Verifying installation..."
    
    # Check services
    local services=("nginx" "fail2ban")
    for service in "${services[@]}"; do
        if systemctl is-active --quiet "$service"; then
            log "✅ $service is running"
        else
            warn "❌ $service is not running"
        fi
    done
    
    # Check PM2 apps
    local pm2_status=$(sudo -u $DEPLOY_USER pm2 list --silent | grep -c "online" || echo "0")
    log "✅ PM2 applications online: $pm2_status/4"
    
    # Check ports
    local ports=(80 443 3000 3001 3002 3003)
    for port in "${ports[@]}"; do
        if ss -tulpn | grep -q ":$port "; then
            log "✅ Port $port is listening"
        else
            warn "❌ Port $port is not listening"
        fi
    done
    
    # Check SSL
    if [[ -f "/etc/letsencrypt/live/$DOMAIN/cert.pem" ]]; then
        log "✅ SSL certificate installed"
    else
        warn "❌ SSL certificate not found"
    fi
    
    log "Installation verification completed"
}

# Print final information
print_summary() {
    log "🎉 Digital Platform installation completed!"
    echo
    echo "=================================="
    echo "     INSTALLATION SUMMARY"
    echo "=================================="
    echo
    echo "🌐 Domain: https://$DOMAIN"
    echo "📁 App Directory: $APP_DIR"
    echo "👤 Deploy User: $DEPLOY_USER"
    echo "📋 PM2 Status: sudo -u $DEPLOY_USER pm2 status"
    echo "📊 Health Check: /usr/local/bin/health-check.sh"
    echo "🔄 Update Script: /home/$DEPLOY_USER/update-platform.sh"
    echo "📝 Logs: /var/log/digital-platform/"
    echo
    echo "Next Steps:"
    echo "1. Update Supabase credentials in $APP_DIR/.env.production"
    echo "2. Configure DNS: $DOMAIN -> $(curl -s ifconfig.me)"
    echo "3. Test the application: https://$DOMAIN"
    echo "4. Setup monitoring alerts"
    echo
    echo "🔐 Security:"
    echo "- Firewall: Active (ports 22, 80, 443)"
    echo "- Fail2ban: Active"
    echo "- SSL: Auto-renewal enabled"
    echo
    echo "📚 Documentation: $APP_DIR/PRODUCTION_DEPLOYMENT_GUIDE.md"
    echo
}

# Main installation function
main() {
    echo "🚀 Digital Platform - Automated Debian/Ubuntu Deployment"
    echo "========================================================="
    echo
    
    read -p "Domain name (default: $DOMAIN): " input_domain
    DOMAIN=${input_domain:-$DOMAIN}
    
    read -p "Git repository URL (default: $GIT_REPO): " input_repo
    GIT_REPO=${input_repo:-$GIT_REPO}
    
    echo
    log "Starting installation for domain: $DOMAIN"
    log "Repository: $GIT_REPO"
    echo
    
    check_root
    detect_os
    update_system
    setup_firewall
    create_swap
    create_deploy_user
    install_nodejs
    install_nginx
    install_ssl
    setup_application
    create_environment
    setup_pm2
    setup_monitoring
    setup_fail2ban
    verify_installation
    print_summary
}

# Run main function
main "$@"