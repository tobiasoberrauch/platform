#!/bin/bash
# Digital Platform - Non-Root Deployment Script (Shared Hosting/VPS without sudo)
# Supports: Any Linux with user-level access
# Usage: curl -sSL https://raw.githubusercontent.com/your-repo/deploy-nosudo.sh | bash

set -e

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
DOMAIN="${DOMAIN:-app.clevercompany.ai}"
APP_DIR="$HOME/digital-platform"
NODE_VERSION="18"
GIT_REPO="${GIT_REPO:-https://github.com/your-username/platform-app.git}"
PORT_BASE="${PORT_BASE:-8000}"  # Starting port for apps (8000-8003)

# User-specific paths
LOCAL_BIN="$HOME/.local/bin"
NVM_DIR="$HOME/.nvm"
LOG_DIR="$HOME/logs"
LOG_FILE="$LOG_DIR/digital-platform-install.log"

# Create necessary directories
mkdir -p "$LOCAL_BIN" "$LOG_DIR"

# Logging
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

# Check if we have required commands
check_requirements() {
    log "Checking system requirements..."
    
    local missing_deps=()
    
    # Check for required commands
    for cmd in git curl wget; do
        if ! command -v $cmd &> /dev/null; then
            missing_deps+=($cmd)
        fi
    done
    
    if [[ ${#missing_deps[@]} -ne 0 ]]; then
        error "Missing required commands: ${missing_deps[*]}. Please contact your hosting provider to install them."
    fi
    
    log "All requirements satisfied"
}

# Install Node.js via NVM (user-level)
install_nodejs() {
    log "Installing Node.js $NODE_VERSION via NVM..."
    
    # Install NVM if not present
    if [[ ! -d "$NVM_DIR" ]]; then
        log "Installing NVM..."
        curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
        
        # Load NVM
        export NVM_DIR="$HOME/.nvm"
        [ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"
    else
        log "NVM already installed, loading..."
        [ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"
    fi
    
    # Install Node.js
    nvm install $NODE_VERSION
    nvm use $NODE_VERSION
    nvm alias default $NODE_VERSION
    
    # Verify installation
    local node_version=$(node --version)
    local npm_version=$(npm --version)
    log "Node.js installed: $node_version, npm: $npm_version"
    
    # Install PM2 locally
    npm install -g pm2
    
    # Add node/npm to PATH permanently
    if ! grep -q "NVM_DIR" "$HOME/.bashrc"; then
        cat >> "$HOME/.bashrc" << 'EOF'

# NVM Configuration
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"
[ -s "$NVM_DIR/bash_completion" ] && \. "$NVM_DIR/bash_completion"
EOF
    fi
}

# Setup application
setup_application() {
    log "Setting up application..."
    
    # Clone repository
    if [[ -d "$APP_DIR/.git" ]]; then
        log "Repository exists, pulling latest changes..."
        cd "$APP_DIR"
        git pull origin main
    else
        log "Cloning repository..."
        git clone "$GIT_REPO" "$APP_DIR"
        cd "$APP_DIR"
    fi
    
    # Install dependencies
    log "Installing dependencies..."
    npm install
    
    # Build application
    log "Building application..."
    npm run build
    
    log "Application setup completed"
}

# Create environment file
create_environment() {
    log "Creating production environment file..."
    
    # Generate secrets
    local nextauth_secret=$(openssl rand -base64 64 2>/dev/null || cat /dev/urandom | tr -dc 'a-zA-Z0-9' | fold -w 64 | head -n 1)
    
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

# Port Configuration (non-standard ports for non-root)
PORT_RANGE_START=$PORT_BASE

# Logging
LOG_LEVEL=info
LOG_FILE=$LOG_DIR/app.log

# Performance
NODE_OPTIONS="--max-old-space-size=1024"
EOF

    chmod 600 "$APP_DIR/.env.production"
    
    log "Environment file created"
}

# Setup PM2 for user-level
setup_pm2() {
    log "Setting up PM2 process manager..."
    
    # Create PM2 ecosystem file
    cat > "$APP_DIR/ecosystem.config.js" << EOF
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
      cwd: path.join(__dirname, 'apps/platform'),
      script: 'npm',
      args: 'start',
      env: {
        ...env,
        NODE_ENV: 'production',
        PORT: ${PORT_BASE}
      },
      instances: 1,  // Single instance for shared hosting
      exec_mode: 'fork',  // Fork mode for shared hosting
      autorestart: true,
      watch: false,
      max_memory_restart: '512M',
      error_file: '${LOG_DIR}/platform-error.log',
      out_file: '${LOG_DIR}/platform-out.log',
      log_file: '${LOG_DIR}/platform-combined.log',
      time: true
    },
    {
      name: 'benchmark-app',
      cwd: path.join(__dirname, 'apps/benchmark'),
      script: 'npm',
      args: 'start',
      env: {
        ...env,
        NODE_ENV: 'production',
        PORT: ${PORT_BASE + 1}
      },
      instances: 1,
      exec_mode: 'fork',
      autorestart: true,
      watch: false,
      max_memory_restart: '256M',
      error_file: '${LOG_DIR}/benchmark-error.log',
      out_file: '${LOG_DIR}/benchmark-out.log',
      time: true
    },
    {
      name: 'csrd-app',
      cwd: path.join(__dirname, 'apps/csrd'),
      script: 'npm',
      args: 'start',
      env: {
        ...env,
        NODE_ENV: 'production',
        PORT: ${PORT_BASE + 2}
      },
      instances: 1,
      exec_mode: 'fork',
      autorestart: true,
      watch: false,
      max_memory_restart: '256M',
      error_file: '${LOG_DIR}/csrd-error.log',
      out_file: '${LOG_DIR}/csrd-out.log',
      time: true
    },
    {
      name: 'support-app',
      cwd: path.join(__dirname, 'apps/support'),
      script: 'npm',
      args: 'start',
      env: {
        ...env,
        NODE_ENV: 'production',
        PORT: ${PORT_BASE + 3}
      },
      instances: 1,
      exec_mode: 'fork',
      autorestart: true,
      watch: false,
      max_memory_restart: '256M',
      error_file: '${LOG_DIR}/support-error.log',
      out_file: '${LOG_DIR}/support-out.log',
      time: true
    }
  ]
};
EOF
    
    # Start applications with PM2
    cd "$APP_DIR"
    pm2 start ecosystem.config.js
    pm2 save
    
    log "PM2 configured and applications started"
}

# Create nginx/Apache configuration examples
create_webserver_configs() {
    log "Creating webserver configuration examples..."
    
    local config_dir="$APP_DIR/webserver-configs"
    mkdir -p "$config_dir"
    
    # Apache .htaccess configuration
    cat > "$config_dir/apache-htaccess-example" << EOF
# Digital Platform - Apache Configuration (.htaccess)
# Place this in your public_html or web root directory

RewriteEngine On

# Force HTTPS
RewriteCond %{HTTPS} off
RewriteRule ^(.*)$ https://%{HTTP_HOST}/$1 [R=301,L]

# Platform App (main)
RewriteCond %{REQUEST_URI} !^/benchmark
RewriteCond %{REQUEST_URI} !^/csrd
RewriteCond %{REQUEST_URI} !^/support
RewriteRule ^(.*)$ http://localhost:$PORT_BASE/$1 [P,L]

# Benchmark App
RewriteRule ^benchmark/(.*)$ http://localhost:$((PORT_BASE + 1))/$1 [P,L]

# CSRD App
RewriteRule ^csrd/(.*)$ http://localhost:$((PORT_BASE + 2))/$1 [P,L]

# Support App
RewriteRule ^support/(.*)$ http://localhost:$((PORT_BASE + 3))/$1 [P,L]

# Security Headers
Header set X-Frame-Options "DENY"
Header set X-Content-Type-Options "nosniff"
Header set X-XSS-Protection "1; mode=block"
Header set Referrer-Policy "strict-origin-when-cross-origin"
EOF

    # Nginx configuration for cPanel/DirectAdmin users
    cat > "$config_dir/nginx-userconfig-example" << EOF
# Digital Platform - Nginx User Configuration
# For cPanel/DirectAdmin: Add via control panel's custom nginx configuration

location / {
    proxy_pass http://localhost:$PORT_BASE;
    proxy_http_version 1.1;
    proxy_set_header Upgrade \$http_upgrade;
    proxy_set_header Connection 'upgrade';
    proxy_set_header Host \$host;
    proxy_set_header X-Real-IP \$remote_addr;
    proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto \$scheme;
    proxy_cache_bypass \$http_upgrade;
}

location /benchmark {
    proxy_pass http://localhost:$((PORT_BASE + 1));
    proxy_http_version 1.1;
    proxy_set_header Upgrade \$http_upgrade;
    proxy_set_header Connection 'upgrade';
    proxy_set_header Host \$host;
    proxy_set_header X-Real-IP \$remote_addr;
    proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto \$scheme;
    proxy_cache_bypass \$http_upgrade;
    rewrite ^/benchmark(.*)$ \$1 break;
}

location /csrd {
    proxy_pass http://localhost:$((PORT_BASE + 2));
    proxy_http_version 1.1;
    proxy_set_header Upgrade \$http_upgrade;
    proxy_set_header Connection 'upgrade';
    proxy_set_header Host \$host;
    proxy_set_header X-Real-IP \$remote_addr;
    proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto \$scheme;
    proxy_cache_bypass \$http_upgrade;
    rewrite ^/csrd(.*)$ \$1 break;
}

location /support {
    proxy_pass http://localhost:$((PORT_BASE + 3));
    proxy_http_version 1.1;
    proxy_set_header Upgrade \$http_upgrade;
    proxy_set_header Connection 'upgrade';
    proxy_set_header Host \$host;
    proxy_set_header X-Real-IP \$remote_addr;
    proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto \$scheme;
    proxy_cache_bypass \$http_upgrade;
    rewrite ^/support(.*)$ \$1 break;
}
EOF

    log "Webserver configurations created in $config_dir"
}

# Setup user scripts
setup_user_scripts() {
    log "Setting up maintenance scripts..."
    
    # Health check script
    cat > "$LOCAL_BIN/health-check.sh" << EOF
#!/bin/bash
APPS=("platform-main" "benchmark-app" "csrd-app" "support-app")
PORTS=($PORT_BASE $((PORT_BASE + 1)) $((PORT_BASE + 2)) $((PORT_BASE + 3)))

echo "=== Digital Platform Health Check \$(date) ==="

echo "--- PM2 Status ---"
pm2 list

echo "--- Port Connectivity ---"
for i in "\${!PORTS[@]}"; do
    PORT=\${PORTS[\$i]}
    APP=\${APPS[\$i]}
    
    if curl -f -s -o /dev/null "http://localhost:\$PORT"; then
        echo "✅ \$APP (port \$PORT): OK"
    else
        echo "❌ \$APP (port \$PORT): FAILED"
        pm2 restart \$APP
    fi
done
EOF

    chmod +x "$LOCAL_BIN/health-check.sh"
    
    # Update script
    cat > "$LOCAL_BIN/update-platform.sh" << EOF
#!/bin/bash
set -e

APP_DIR="$APP_DIR"
BACKUP_DIR="$HOME/backups/digital-platform"
DATE=\$(date +%Y%m%d_%H%M%S)

echo "🚀 Starting Digital Platform Update - \$DATE"

mkdir -p \$BACKUP_DIR
cp -r \$APP_DIR \$BACKUP_DIR/platform_backup_\$DATE

cd \$APP_DIR
git fetch origin

echo "📋 Available updates:"
git log --oneline HEAD..origin/main

read -p "🤔 Continue with update? (y/N): " -n 1 -r
echo
if [[ ! \$REPLY =~ ^[Yy]$ ]]; then
    echo "❌ Update aborted"
    exit 1
fi

git pull origin main
npm install
npm run build

pm2 reload ecosystem.config.js --update-env

sleep 10
$LOCAL_BIN/health-check.sh

# Keep only last 5 backups
cd \$BACKUP_DIR
ls -t | tail -n +6 | xargs rm -rf

echo "✅ Update completed!"
EOF

    chmod +x "$LOCAL_BIN/update-platform.sh"
    
    # Start/Stop scripts
    cat > "$LOCAL_BIN/start-platform.sh" << EOF
#!/bin/bash
cd $APP_DIR
pm2 start ecosystem.config.js
echo "✅ Digital Platform started"
pm2 status
EOF

    cat > "$LOCAL_BIN/stop-platform.sh" << EOF
#!/bin/bash
pm2 stop all
echo "⏹️ Digital Platform stopped"
pm2 status
EOF

    chmod +x "$LOCAL_BIN/start-platform.sh" "$LOCAL_BIN/stop-platform.sh"
    
    # Add scripts to PATH
    if ! grep -q "LOCAL_BIN" "$HOME/.bashrc"; then
        echo "export PATH=\"\$HOME/.local/bin:\$PATH\"" >> "$HOME/.bashrc"
    fi
    
    log "User scripts created in $LOCAL_BIN"
}

# Setup cron jobs (user-level)
setup_cron() {
    log "Setting up cron jobs..."
    
    # Create cron entries
    local cron_entries="
# Digital Platform Health Check (every 5 minutes)
*/5 * * * * $LOCAL_BIN/health-check.sh >> $LOG_DIR/health-check.log 2>&1

# PM2 resurrection (on reboot)
@reboot cd $APP_DIR && pm2 resurrect

# Log cleanup (daily)
0 2 * * * find $LOG_DIR -name '*.log' -mtime +14 -delete
"

    # Add to crontab
    (crontab -l 2>/dev/null || true; echo "$cron_entries") | crontab -
    
    log "Cron jobs configured"
}

# Final verification
verify_installation() {
    log "Verifying installation..."
    
    # Check PM2 apps
    local pm2_status=$(pm2 list --silent | grep -c "online" || echo "0")
    log "PM2 applications online: $pm2_status/4"
    
    # Check ports
    local ports=($PORT_BASE $((PORT_BASE + 1)) $((PORT_BASE + 2)) $((PORT_BASE + 3)))
    for port in "${ports[@]}"; do
        if curl -f -s -o /dev/null "http://localhost:$port"; then
            log "✅ Port $port is responding"
        else
            warn "❌ Port $port is not responding"
        fi
    done
    
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
    echo "📁 App Directory: $APP_DIR"
    echo "🔧 Node.js Version: $(node --version)"
    echo "📋 PM2 Status: pm2 status"
    echo "📊 Health Check: $LOCAL_BIN/health-check.sh"
    echo "🔄 Update Script: $LOCAL_BIN/update-platform.sh"
    echo "📝 Logs: $LOG_DIR/"
    echo
    echo "🌐 Application Ports:"
    echo "   - Platform: http://localhost:$PORT_BASE"
    echo "   - Benchmark: http://localhost:$((PORT_BASE + 1))"
    echo "   - CSRD: http://localhost:$((PORT_BASE + 2))"
    echo "   - Support: http://localhost:$((PORT_BASE + 3))"
    echo
    echo "⚠️  IMPORTANT NEXT STEPS:"
    echo "1. Configure your web server (Apache/Nginx) to proxy to these ports"
    echo "   - Apache config: $APP_DIR/webserver-configs/apache-htaccess-example"
    echo "   - Nginx config: $APP_DIR/webserver-configs/nginx-userconfig-example"
    echo
    echo "2. Update environment variables in $APP_DIR/.env.production"
    echo
    echo "3. Configure your domain's DNS to point to this server"
    echo
    echo "📚 Quick Commands:"
    echo "   Start apps: $LOCAL_BIN/start-platform.sh"
    echo "   Stop apps: $LOCAL_BIN/stop-platform.sh"
    echo "   Check status: pm2 status"
    echo "   View logs: pm2 logs"
    echo "   Update platform: $LOCAL_BIN/update-platform.sh"
    echo
    
    # Create quick reference
    cat > "$HOME/digital-platform-quickref.txt" << EOF
Digital Platform Quick Reference
================================

Commands:
- Start: ~/digital-platform/start-platform.sh
- Stop: ~/digital-platform/stop-platform.sh
- Status: pm2 status
- Logs: pm2 logs
- Update: ~/digital-platform/update-platform.sh

Ports:
- Platform: $PORT_BASE
- Benchmark: $((PORT_BASE + 1))
- CSRD: $((PORT_BASE + 2))
- Support: $((PORT_BASE + 3))

Directories:
- App: $APP_DIR
- Logs: $LOG_DIR
- Scripts: $LOCAL_BIN

Troubleshooting:
- Check health: ~/digital-platform/health-check.sh
- Restart all: pm2 restart all
- View errors: pm2 logs --err

Webserver Config Examples:
- $APP_DIR/webserver-configs/
EOF
    
    echo "📄 Quick reference saved to: ~/digital-platform-quickref.txt"
    echo
}

# Main installation function
main() {
    echo "🚀 Digital Platform - Non-Root User Installation"
    echo "================================================"
    echo
    echo "This script will install Digital Platform without requiring sudo/root access."
    echo "Perfect for shared hosting, managed VPS, or restricted environments."
    echo
    
    read -p "Installation directory (default: $APP_DIR): " input_dir
    APP_DIR=${input_dir:-$APP_DIR}
    
    read -p "Starting port number (default: $PORT_BASE): " input_port
    PORT_BASE=${input_port:-$PORT_BASE}
    
    read -p "Git repository URL (default: $GIT_REPO): " input_repo
    GIT_REPO=${input_repo:-$GIT_REPO}
    
    echo
    log "Starting installation..."
    log "Directory: $APP_DIR"
    log "Ports: $PORT_BASE-$((PORT_BASE + 3))"
    log "Repository: $GIT_REPO"
    echo
    
    check_requirements
    install_nodejs
    setup_application
    create_environment
    setup_pm2
    create_webserver_configs
    setup_user_scripts
    setup_cron
    verify_installation
    print_summary
}

# Run main function
main "$@"