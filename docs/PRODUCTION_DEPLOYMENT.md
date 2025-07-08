# Production Deployment Guide

This guide covers deploying the Digital Platform to a production server with the domain `https://app.clevercompany.ai`.

## Table of Contents

1. [Overview](#overview)
2. [Server Requirements](#server-requirements)
3. [Initial Server Setup](#initial-server-setup)
4. [Application Deployment](#application-deployment)
5. [Nginx Configuration](#nginx-configuration)
6. [Process Management with PM2](#process-management-with-pm2)
7. [SSL Certificate Setup](#ssl-certificate-setup)
8. [Environment Configuration](#environment-configuration)
9. [Monitoring & Maintenance](#monitoring--maintenance)
10. [Troubleshooting](#troubleshooting)

## Overview

The Digital Platform consists of 4 Next.js applications that will be deployed as follows:

- **Platform**: `https://app.clevercompany.ai` (main entry point)
- **Benchmark**: `https://app.clevercompany.ai/benchmark`
- **CSRD**: `https://app.clevercompany.ai/csrd`
- **Support**: `https://app.clevercompany.ai/support`

Each app runs on a different port internally (3000-3003) and Nginx routes requests based on URL paths.

## Server Requirements

### Minimum System Requirements
- **OS**: Ubuntu 20.04 LTS or newer (recommended)
- **RAM**: 4GB minimum, 8GB recommended
- **CPU**: 2 cores minimum, 4 cores recommended
- **Storage**: 20GB minimum, 50GB recommended
- **Network**: Public IP address with domain pointing to server

### Software Requirements
- Node.js 18+ (LTS recommended)
- npm or yarn
- Nginx
- PM2 (process manager)
- Git
- Certbot (for SSL certificates)

## Initial Server Setup

### 1. Update System
```bash
sudo apt update && sudo apt upgrade -y
```

### 2. Install Node.js (via NodeSource)
```bash
# Install Node.js 20 LTS
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# Verify installation
node --version  # Should show v20.x.x
npm --version
```

### 3. Install Required Software
```bash
# Install Nginx
sudo apt install -y nginx

# Install PM2 globally
sudo npm install -g pm2

# Install Git (if not already installed)
sudo apt install -y git

# Install Certbot for SSL
sudo apt install -y certbot python3-certbot-nginx
```

### 4. Create Application User
```bash
# Create user for the application
sudo adduser --system --group --shell /bin/bash clevercompany
sudo mkdir -p /home/clevercompany
sudo chown clevercompany:clevercompany /home/clevercompany
```

### 5. Configure Firewall
```bash
# Enable UFW firewall
sudo ufw enable

# Allow SSH, HTTP, and HTTPS
sudo ufw allow ssh
sudo ufw allow 'Nginx Full'

# Check status
sudo ufw status
```

## Application Deployment

### 1. Clone Repository
```bash
# Switch to application user
sudo su - clevercompany

# Clone your repository
git clone https://github.com/your-username/platform-app.git /home/clevercompany/app
cd /home/clevercompany/app
```

### 2. Install Dependencies
```bash
# Install dependencies
npm install

# Build shared packages
npm run build -w packages/ui
npm run build -w packages/config
```

### 3. Configure Environment Variables
```bash
# Create production environment file
cat > .env.production << 'EOF'
NODE_ENV=production
NEXT_PUBLIC_BASE_URL=https://app.clevercompany.ai
PORT_RANGE_START=3000

# Add any other environment variables your apps need
# DATABASE_URL=...
# API_KEYS=...
EOF
```

### 4. Build Applications
```bash
# Build all applications for production
NEXT_PUBLIC_BASE_URL=https://app.clevercompany.ai make build

# Verify build succeeded
ls -la apps/*/(.next|build)/
```

## Nginx Configuration

### 1. Create Nginx Configuration
```bash
# Exit from clevercompany user back to sudo user
exit

# Create Nginx configuration
sudo tee /etc/nginx/sites-available/clevercompany << 'EOF'
server {
    listen 80;
    server_name app.clevercompany.ai;

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;

    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css text/xml text/javascript application/javascript application/xml+rss application/json;

    # Main platform app (root)
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        proxy_read_timeout 86400;
    }

    # Benchmark app
    location /benchmark {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        proxy_read_timeout 86400;
    }

    # CSRD app
    location /csrd {
        proxy_pass http://localhost:3002;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        proxy_read_timeout 86400;
    }

    # Support app
    location /support {
        proxy_pass http://localhost:3003;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        proxy_read_timeout 86400;
    }

    # Static files caching
    location /_next/static/ {
        proxy_pass http://localhost:3000;
        add_header Cache-Control "public, max-age=31536000, immutable";
    }

    # Favicon and other static assets
    location ~* \.(ico|css|js|gif|jpeg|jpg|png|svg|woff|woff2|ttf|eot)$ {
        proxy_pass http://localhost:3000;
        add_header Cache-Control "public, max-age=86400";
    }
}
EOF
```

### 2. Enable Site and Test Configuration
```bash
# Enable the site
sudo ln -s /etc/nginx/sites-available/clevercompany /etc/nginx/sites-enabled/

# Remove default site
sudo rm -f /etc/nginx/sites-enabled/default

# Test Nginx configuration
sudo nginx -t

# Restart Nginx
sudo systemctl restart nginx
sudo systemctl enable nginx
```

## Process Management with PM2

### 1. Create PM2 Ecosystem File
```bash
# Switch to application user
sudo su - clevercompany
cd /home/clevercompany/app

# Create PM2 ecosystem configuration
cat > ecosystem.config.js << 'EOF'
module.exports = {
  apps: [
    {
      name: 'platform',
      cwd: './apps/platform',
      script: 'npm',
      args: 'start',
      env: {
        NODE_ENV: 'production',
        PORT: 3000,
        NEXT_PUBLIC_BASE_URL: 'https://app.clevercompany.ai'
      },
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      log_file: '/home/clevercompany/logs/platform.log',
      error_file: '/home/clevercompany/logs/platform-error.log',
      out_file: '/home/clevercompany/logs/platform-out.log'
    },
    {
      name: 'benchmark',
      cwd: './apps/benchmark',
      script: 'npm',
      args: 'start',
      env: {
        NODE_ENV: 'production',
        PORT: 3001,
        NEXT_PUBLIC_BASE_URL: 'https://app.clevercompany.ai'
      },
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      log_file: '/home/clevercompany/logs/benchmark.log',
      error_file: '/home/clevercompany/logs/benchmark-error.log',
      out_file: '/home/clevercompany/logs/benchmark-out.log'
    },
    {
      name: 'csrd',
      cwd: './apps/csrd',
      script: 'npm',
      args: 'start',
      env: {
        NODE_ENV: 'production',
        PORT: 3002,
        NEXT_PUBLIC_BASE_URL: 'https://app.clevercompany.ai'
      },
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      log_file: '/home/clevercompany/logs/csrd.log',
      error_file: '/home/clevercompany/logs/csrd-error.log',
      out_file: '/home/clevercompany/logs/csrd-out.log'
    },
    {
      name: 'support',
      cwd: './apps/support',
      script: 'npm',
      args: 'start',
      env: {
        NODE_ENV: 'production',
        PORT: 3003,
        NEXT_PUBLIC_BASE_URL: 'https://app.clevercompany.ai'
      },
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      log_file: '/home/clevercompany/logs/support.log',
      error_file: '/home/clevercompany/logs/support-error.log',
      out_file: '/home/clevercompany/logs/support-out.log'
    }
  ]
};
EOF
```

### 2. Create Log Directory and Start Applications
```bash
# Create logs directory
mkdir -p /home/clevercompany/logs

# Start all applications
pm2 start ecosystem.config.js

# Save PM2 configuration
pm2 save

# Setup PM2 to start on boot (exit from clevercompany user first)
exit
sudo env PATH=$PATH:/usr/bin /usr/lib/node_modules/pm2/bin/pm2 startup systemd -u clevercompany --hp /home/clevercompany
```

## SSL Certificate Setup

### 1. Obtain SSL Certificate with Certbot
```bash
# Stop Nginx temporarily
sudo systemctl stop nginx

# Obtain SSL certificate
sudo certbot certonly --standalone -d app.clevercompany.ai

# Start Nginx again
sudo systemctl start nginx
```

### 2. Update Nginx Configuration for HTTPS
```bash
# Backup original configuration
sudo cp /etc/nginx/sites-available/clevercompany /etc/nginx/sites-available/clevercompany.backup

# Update Nginx configuration to include SSL
sudo tee /etc/nginx/sites-available/clevercompany << 'EOF'
# Redirect HTTP to HTTPS
server {
    listen 80;
    server_name app.clevercompany.ai;
    return 301 https://$server_name$request_uri;
}

# HTTPS server
server {
    listen 443 ssl http2;
    server_name app.clevercompany.ai;

    # SSL Configuration
    ssl_certificate /etc/letsencrypt/live/app.clevercompany.ai/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/app.clevercompany.ai/privkey.pem;
    ssl_session_timeout 1d;
    ssl_session_cache shared:MozTLS:10m;
    ssl_session_tickets off;

    # Modern SSL configuration
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES128-GCM-SHA256:ECDHE-ECDSA-AES256-GCM-SHA384:ECDHE-RSA-AES256-GCM-SHA384;
    ssl_prefer_server_ciphers off;

    # HSTS (ngx_http_headers_module is required)
    add_header Strict-Transport-Security "max-age=63072000" always;

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;

    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css text/xml text/javascript application/javascript application/xml+rss application/json;

    # Main platform app (root)
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        proxy_read_timeout 86400;
    }

    # Benchmark app
    location /benchmark {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        proxy_read_timeout 86400;
    }

    # CSRD app
    location /csrd {
        proxy_pass http://localhost:3002;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        proxy_read_timeout 86400;
    }

    # Support app
    location /support {
        proxy_pass http://localhost:3003;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        proxy_read_timeout 86400;
    }

    # Static files caching
    location /_next/static/ {
        proxy_pass http://localhost:3000;
        add_header Cache-Control "public, max-age=31536000, immutable";
    }

    # Favicon and other static assets
    location ~* \.(ico|css|js|gif|jpeg|jpg|png|svg|woff|woff2|ttf|eot)$ {
        proxy_pass http://localhost:3000;
        add_header Cache-Control "public, max-age=86400";
    }
}
EOF

# Test and reload Nginx
sudo nginx -t
sudo systemctl reload nginx
```

### 3. Setup Auto-renewal for SSL Certificate
```bash
# Test auto-renewal
sudo certbot renew --dry-run

# Add cron job for auto-renewal
echo "0 12 * * * /usr/bin/certbot renew --quiet" | sudo crontab -
```

## Environment Configuration

### Production Environment Variables
Create a comprehensive environment configuration:

```bash
# Switch to application user
sudo su - clevercompany
cd /home/clevercompany/app

# Create production environment file
cat > .env.production << 'EOF'
# Base configuration
NODE_ENV=production
NEXT_PUBLIC_BASE_URL=https://app.clevercompany.ai
PORT_RANGE_START=3000

# Security
SESSION_SECRET=your-super-secret-session-key-here
JWT_SECRET=your-jwt-secret-here

# Database (if applicable)
# DATABASE_URL=postgresql://user:password@localhost:5432/clevercompany
# REDIS_URL=redis://localhost:6379

# Third-party APIs (if applicable)
# STRIPE_SECRET_KEY=sk_live_...
# SENDGRID_API_KEY=SG....
# GOOGLE_ANALYTICS_ID=GA-...

# Logging
LOG_LEVEL=info
EOF

# Secure the environment file
chmod 600 .env.production
```

## Monitoring & Maintenance

### 1. PM2 Monitoring Commands
```bash
# Check status of all applications
sudo su - clevercompany
pm2 status

# View logs
pm2 logs
pm2 logs platform
pm2 logs benchmark

# Monitor resources
pm2 monit

# Restart applications
pm2 restart all
pm2 restart platform

# Stop/Start applications
pm2 stop all
pm2 start all
```

### 2. System Monitoring
```bash
# Check system resources
htop
df -h
free -h

# Check Nginx status
sudo systemctl status nginx

# Check Nginx logs
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log
```

### 3. Application Updates
```bash
# Switch to application user
sudo su - clevercompany
cd /home/clevercompany/app

# Pull latest changes
git pull origin main

# Install any new dependencies
npm install

# Rebuild shared packages
npm run build -w packages/ui
npm run build -w packages/config

# Build applications
NEXT_PUBLIC_BASE_URL=https://app.clevercompany.ai make build

# Restart applications
pm2 restart all

# Check status
pm2 status
```

### 4. Backup Strategy
```bash
# Create backup script
sudo tee /home/clevercompany/backup.sh << 'EOF'
#!/bin/bash
BACKUP_DIR="/home/clevercompany/backups"
DATE=$(date +%Y%m%d_%H%M%S)

# Create backup directory
mkdir -p $BACKUP_DIR

# Backup application code
tar -czf $BACKUP_DIR/app_$DATE.tar.gz -C /home/clevercompany app --exclude=node_modules --exclude=.next

# Backup PM2 configuration
pm2 save
cp /home/clevercompany/.pm2/dump.pm2 $BACKUP_DIR/pm2_$DATE.json

# Clean old backups (keep last 7 days)
find $BACKUP_DIR -name "*.tar.gz" -mtime +7 -delete
find $BACKUP_DIR -name "*.json" -mtime +7 -delete

echo "Backup completed: $DATE"
EOF

# Make backup script executable
chmod +x /home/clevercompany/backup.sh

# Add to crontab (daily backup at 2 AM)
echo "0 2 * * * /home/clevercompany/backup.sh" | crontab -
```

## Troubleshooting

### Common Issues and Solutions

#### 1. Applications Not Starting
```bash
# Check PM2 logs
pm2 logs

# Check if ports are available
sudo netstat -tlnp | grep :3000

# Restart applications
pm2 restart all
```

#### 2. Nginx Issues
```bash
# Test Nginx configuration
sudo nginx -t

# Check Nginx logs
sudo tail -f /var/log/nginx/error.log

# Restart Nginx
sudo systemctl restart nginx
```

#### 3. SSL Certificate Issues
```bash
# Check certificate status
sudo certbot certificates

# Renew certificate manually
sudo certbot renew

# Check certificate expiry
openssl x509 -in /etc/letsencrypt/live/app.clevercompany.ai/cert.pem -text -noout | grep "Not After"
```

#### 4. Memory Issues
```bash
# Check memory usage
free -h
pm2 monit

# Restart applications with high memory usage
pm2 restart <app-name>
```

#### 5. Disk Space Issues
```bash
# Check disk usage
df -h

# Clean PM2 logs
pm2 flush

# Clean old logs
sudo find /var/log -name "*.log" -type f -mtime +30 -delete
```

### Health Check Script
```bash
# Create health check script
sudo tee /home/clevercompany/health-check.sh << 'EOF'
#!/bin/bash

echo "=== Health Check $(date) ==="

# Check if all PM2 processes are running
echo "PM2 Status:"
pm2 jlist | jq -r '.[] | "\(.name): \(.pm2_env.status)"'

# Check if ports are responding
echo -e "\nPort Status:"
for port in 3000 3001 3002 3003; do
  if curl -f http://localhost:$port > /dev/null 2>&1; then
    echo "Port $port: OK"
  else
    echo "Port $port: FAILED"
  fi
done

# Check SSL certificate
echo -e "\nSSL Certificate:"
if curl -f https://app.clevercompany.ai > /dev/null 2>&1; then
  echo "HTTPS: OK"
else
  echo "HTTPS: FAILED"
fi

# Check disk space
echo -e "\nDisk Usage:"
df -h / | tail -1

# Check memory usage
echo -e "\nMemory Usage:"
free -h | head -2

echo "=== End Health Check ==="
EOF

chmod +x /home/clevercompany/health-check.sh
```

## Quick Reference Commands

```bash
# Application Management
sudo su - clevercompany
pm2 status                    # Check app status
pm2 restart all              # Restart all apps
pm2 logs                     # View logs

# System Management
sudo systemctl status nginx  # Check Nginx
sudo nginx -t                # Test Nginx config
sudo systemctl reload nginx  # Reload Nginx

# SSL Management
sudo certbot certificates    # Check certificates
sudo certbot renew          # Renew certificates

# Monitoring
htop                         # System resources
pm2 monit                    # PM2 monitoring
sudo tail -f /var/log/nginx/access.log  # Nginx logs
```

---

This deployment guide provides a complete production setup for your Digital Platform on `https://app.clevercompany.ai`. Follow the steps in order, and your applications will be running securely with proper SSL, process management, and monitoring.