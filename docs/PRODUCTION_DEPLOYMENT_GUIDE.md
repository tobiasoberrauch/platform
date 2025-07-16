# 🚀 Digital Platform - Production Deployment Guide

Vollständige Anleitung für die Bereitstellung der Digital Platform auf einem Linux Root Server.

## 📋 Inhaltsverzeichnis

1. [Server-Vorbereitung](#server-vorbereitung)
2. [Node.js & Dependencies Installation](#nodejs--dependencies-installation)
3. [Nginx Setup](#nginx-setup)
4. [SSL/HTTPS Konfiguration](#sslhttps-konfiguration)
5. [Application Deployment](#application-deployment)
6. [Process Management (PM2)](#process-management-pm2)
7. [Environment Configuration](#environment-configuration)
8. [Database Setup (Optional)](#database-setup-optional)
9. [Monitoring & Logs](#monitoring--logs)
10. [Updates & Maintenance](#updates--maintenance)
11. [Troubleshooting](#troubleshooting)

---

## 🖥️ Server-Vorbereitung

### System Requirements
- **OS**: Ubuntu 20.04+ oder CentOS 8+
- **RAM**: Mindestens 2GB (empfohlen: 4GB+)
- **Storage**: Mindestens 20GB freier Speicher
- **CPU**: 2+ Cores empfohlen
- **Network**: Öffentliche IP-Adresse

### Initiale Server-Konfiguration

```bash
# 1. System aktualisieren
sudo apt update && sudo apt upgrade -y

# 2. Firewall konfigurieren
sudo ufw enable
sudo ufw allow ssh
sudo ufw allow 80
sudo ufw allow 443

# 3. Swap-Datei erstellen (wenn < 4GB RAM)
sudo fallocate -l 2G /swapfile
sudo chmod 600 /swapfile
sudo mkswap /swapfile
sudo swapon /swapfile
echo '/swapfile none swap sw 0 0' | sudo tee -a /etc/fstab

# 4. Benutzer für Deployment erstellen
sudo adduser deploy
sudo usermod -aG sudo deploy
sudo mkdir -p /home/deploy/.ssh
sudo cp ~/.ssh/authorized_keys /home/deploy/.ssh/
sudo chown -R deploy:deploy /home/deploy/.ssh
sudo chmod 700 /home/deploy/.ssh
sudo chmod 600 /home/deploy/.ssh/authorized_keys

# 5. Wechsel zum deploy-Benutzer
su - deploy
```

---

## 🟢 Node.js & Dependencies Installation

### Node.js Installation (über NodeSource)

```bash
# 1. NodeSource Repository hinzufügen
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -

# 2. Node.js installieren
sudo apt-get install -y nodejs

# 3. Version überprüfen
node --version  # Sollte v18.x.x zeigen
npm --version

# 4. NPM global packages
sudo npm install -g pm2
sudo npm install -g yarn

# 5. Build-Tools installieren
sudo apt-get install -y build-essential python3
```

### Alternative: Node.js via NVM (empfohlen für Flexibilität)

```bash
# 1. NVM installieren
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
source ~/.bashrc

# 2. Node.js installieren
nvm install 18
nvm use 18
nvm alias default 18

# 3. Global packages
npm install -g pm2 yarn
```

---

## 🌐 Nginx Setup

### Nginx Installation

```bash
# 1. Nginx installieren
sudo apt update
sudo apt install nginx -y

# 2. Nginx starten und aktivieren
sudo systemctl start nginx
sudo systemctl enable nginx

# 3. Status überprüfen
sudo systemctl status nginx
```

### Nginx Konfiguration für Digital Platform

```bash
# 1. Alte Default-Konfiguration entfernen
sudo rm /etc/nginx/sites-enabled/default

# 2. Neue Konfiguration erstellen
sudo nano /etc/nginx/sites-available/digital-platform
```

**Nginx Konfigurationsdatei** (`/etc/nginx/sites-available/digital-platform`):

```nginx
# Digital Platform Nginx Configuration
# Domain: app.clevercompany.ai

# Rate Limiting
limit_req_zone $binary_remote_addr zone=api:10m rate=10r/s;
limit_req_zone $binary_remote_addr zone=login:10m rate=5r/m;

# Upstream Servers
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

# Main Server Block
server {
    listen 80;
    server_name app.clevercompany.ai;
    
    # Redirect all HTTP to HTTPS
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name app.clevercompany.ai;

    # SSL Configuration (wird später mit Certbot konfiguriert)
    ssl_certificate /etc/letsencrypt/live/app.clevercompany.ai/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/app.clevercompany.ai/privkey.pem;
    
    # SSL Settings
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-RSA-AES128-GCM-SHA256:ECDHE-RSA-AES256-GCM-SHA384;
    ssl_prefer_server_ciphers on;
    ssl_session_cache shared:SSL:10m;
    ssl_session_timeout 1d;
    ssl_stapling on;
    ssl_stapling_verify on;

    # Security Headers
    add_header X-Frame-Options DENY;
    add_header X-Content-Type-Options nosniff;
    add_header X-XSS-Protection "1; mode=block";
    add_header Referrer-Policy "strict-origin-when-cross-origin";
    add_header Content-Security-Policy "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:; connect-src 'self' https:;";

    # Gzip Compression
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

    # Main Platform (Root)
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

    # Benchmark App
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
        
        # Rewrite URL path
        rewrite ^/benchmark(.*)$ $1 break;
    }

    # CSRD App
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
        
        # Rewrite URL path
        rewrite ^/csrd(.*)$ $1 break;
    }

    # Support App
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
        
        # Rewrite URL path
        rewrite ^/support(.*)$ $1 break;
    }

    # Static Assets Caching
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
        access_log off;
        
        # Try to serve static files, fallback to app
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

    # Health Check Endpoint
    location /health {
        access_log off;
        return 200 "healthy\n";
        add_header Content-Type text/plain;
    }

    # Block access to sensitive files
    location ~ /\. {
        deny all;
        access_log off;
        log_not_found off;
    }
}
```

```bash
# 3. Konfiguration aktivieren
sudo ln -s /etc/nginx/sites-available/digital-platform /etc/nginx/sites-enabled/

# 4. Nginx Konfiguration testen
sudo nginx -t

# 5. Nginx neu laden
sudo systemctl reload nginx
```

---

## 🔒 SSL/HTTPS Konfiguration

### Certbot Installation

```bash
# 1. Certbot installieren
sudo apt install snapd
sudo snap install --classic certbot

# 2. Certbot Symlink erstellen
sudo ln -s /snap/bin/certbot /usr/bin/certbot

# 3. SSL-Zertifikat erstellen
sudo certbot --nginx -d app.clevercompany.ai

# 4. Auto-Renewal testen
sudo certbot renew --dry-run
```

### Firewall für SSL

```bash
# HTTPS Port öffnen
sudo ufw allow 'Nginx Full'
sudo ufw delete allow 'Nginx HTTP'
```

---

## 📦 Application Deployment

### Git Repository Setup

```bash
# 1. Deployment-Verzeichnis erstellen
sudo mkdir -p /var/www/digital-platform
sudo chown deploy:deploy /var/www/digital-platform

# 2. Repository klonen
cd /var/www/digital-platform
git clone https://github.com/your-username/platform-app.git .

# Oder via SSH (empfohlen für private Repos)
git clone git@github.com:your-username/platform-app.git .
```

### Dependencies Installation

```bash
# 1. NPM Dependencies installieren
npm install

# 2. Build-Prozess ausführen
npm run build

# 3. Produktions-Dependencies
npm prune --production
```

### Environment Configuration

```bash
# 1. Environment-Datei erstellen
cp .env.example .env.production

# 2. Production Environment konfigurieren
nano .env.production
```

**Production Environment** (`.env.production`):

```env
# Production Configuration
NODE_ENV=production

# Base URL für Production
NEXT_PUBLIC_BASE_URL=https://app.clevercompany.ai

# NextAuth Configuration
NEXTAUTH_URL=https://app.clevercompany.ai
NEXTAUTH_SECRET=SUPER_SECURE_SECRET_HERE_64_CHARS_MINIMUM_GENERATE_RANDOM

# Cidaas OIDC Configuration
CIDAAS_CLIENT_ID=1401d46e-ad31-4b36-98e3-9a740a14a64b
CIDAAS_CLIENT_SECRET=fe7f18a5-4497-4a02-ad20-23f9cc30bd3b

# Supabase Configuration (if using)
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-role-key
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key

# Port Configuration (für interne Services)
PORT_RANGE_START=3000

# Logging
LOG_LEVEL=info
LOG_FILE=/var/log/digital-platform/app.log

# Performance
NODE_OPTIONS="--max-old-space-size=2048"
```

### Secure Secrets Generation

```bash
# 1. NEXTAUTH_SECRET generieren
openssl rand -base64 64

# 2. Weitere Secrets generieren falls benötigt
openssl rand -hex 32
```

---

## ⚙️ Process Management (PM2)

### PM2 Konfiguration

```bash
# 1. PM2 Ecosystem-Datei erstellen
nano ecosystem.config.js
```

**PM2 Ecosystem Configuration** (`ecosystem.config.js`):

```javascript
module.exports = {
  apps: [
    {
      name: 'platform-main',
      cwd: '/var/www/digital-platform/apps/platform',
      script: 'npm',
      args: 'start',
      env: {
        NODE_ENV: 'production',
        PORT: 3000,
        ...require('/var/www/digital-platform/.env.production')
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
        NODE_ENV: 'production',
        PORT: 3001,
        ...require('/var/www/digital-platform/.env.production')
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
        NODE_ENV: 'production',
        PORT: 3002,
        ...require('/var/www/digital-platform/.env.production')
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
        NODE_ENV: 'production',
        PORT: 3003,
        ...require('/var/www/digital-platform/.env.production')
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
```

### PM2 Setup und Start

```bash
# 1. Log-Verzeichnis erstellen
sudo mkdir -p /var/log/digital-platform
sudo chown deploy:deploy /var/log/digital-platform

# 2. Applications mit PM2 starten
pm2 start ecosystem.config.js

# 3. PM2 Status überprüfen
pm2 status
pm2 logs

# 4. PM2 Auto-Start konfigurieren
pm2 startup
pm2 save

# 5. PM2 Monitoring (optional)
pm2 install pm2-logrotate
pm2 set pm2-logrotate:max_size 10M
pm2 set pm2-logrotate:retain 7
```

---

## 🗄️ Database Setup (Optional)

### PostgreSQL Installation (falls erforderlich)

```bash
# 1. PostgreSQL installieren
sudo apt install postgresql postgresql-contrib

# 2. PostgreSQL starten
sudo systemctl start postgresql
sudo systemctl enable postgresql

# 3. Database und User erstellen
sudo -u postgres psql

-- In PostgreSQL:
CREATE DATABASE digital_platform;
CREATE USER platform_user WITH PASSWORD 'secure_password_here';
GRANT ALL PRIVILEGES ON DATABASE digital_platform TO platform_user;
\q
```

### Database Backup Script

```bash
# 1. Backup-Script erstellen
sudo nano /usr/local/bin/backup-db.sh
```

```bash
#!/bin/bash
# Database Backup Script

DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/var/backups/digital-platform"
DB_NAME="digital_platform"

mkdir -p $BACKUP_DIR

pg_dump -U platform_user -h localhost $DB_NAME > $BACKUP_DIR/db_backup_$DATE.sql

# Alte Backups löschen (älter als 7 Tage)
find $BACKUP_DIR -name "db_backup_*.sql" -mtime +7 -delete

echo "Database backup completed: $BACKUP_DIR/db_backup_$DATE.sql"
```

```bash
# 2. Script ausführbar machen
sudo chmod +x /usr/local/bin/backup-db.sh

# 3. Cron-Job für tägliche Backups
crontab -e
# Hinzufügen: 0 2 * * * /usr/local/bin/backup-db.sh
```

---

## 📊 Monitoring & Logs

### Log-Rotation Setup

```bash
# 1. Logrotate-Konfiguration erstellen
sudo nano /etc/logrotate.d/digital-platform
```

```
/var/log/digital-platform/*.log {
    daily
    missingok
    rotate 14
    compress
    delaycompress
    notifempty
    create 0644 deploy deploy
    postrotate
        pm2 reloadLogs
    endscript
}
```

### System Monitoring

```bash
# 1. htop installieren
sudo apt install htop

# 2. Disk usage monitoring
sudo nano /usr/local/bin/check-disk-space.sh
```

```bash
#!/bin/bash
# Disk Space Monitoring

THRESHOLD=80
USAGE=$(df / | grep / | awk '{ print $5}' | sed 's/%//g')

if [ $USAGE -gt $THRESHOLD ]; then
    echo "WARNING: Disk usage is ${USAGE}% (threshold: ${THRESHOLD}%)"
    # Optional: Send notification or email
fi
```

### Application Health Checks

```bash
# 1. Health Check Script erstellen
sudo nano /usr/local/bin/health-check.sh
```

```bash
#!/bin/bash
# Application Health Check

APPS=("platform-main" "benchmark-app" "csrd-app" "support-app")
PORTS=(3000 3001 3002 3003)

echo "=== Digital Platform Health Check $(date) ==="

# PM2 Status Check
echo "--- PM2 Status ---"
pm2 jlist | jq '.[] | {name: .name, status: .pm2_env.status, memory: .monit.memory, cpu: .monit.cpu}'

# Port Connectivity Check
echo "--- Port Connectivity ---"
for i in "${!PORTS[@]}"; do
    PORT=${PORTS[$i]}
    APP=${APPS[$i]}
    
    if curl -f -s -o /dev/null "http://localhost:$PORT"; then
        echo "✅ $APP (port $PORT): OK"
    else
        echo "❌ $APP (port $PORT): FAILED"
        # Restart app if needed
        pm2 restart $APP
    fi
done

# Nginx Status
echo "--- Nginx Status ---"
if systemctl is-active --quiet nginx; then
    echo "✅ Nginx: Running"
else
    echo "❌ Nginx: Stopped"
    sudo systemctl restart nginx
fi

# SSL Certificate Check
echo "--- SSL Certificate ---"
SSL_EXPIRY=$(openssl x509 -enddate -noout -in /etc/letsencrypt/live/app.clevercompany.ai/cert.pem | cut -d= -f2)
echo "SSL expires: $SSL_EXPIRY"
```

```bash
# 2. Script ausführbar machen
sudo chmod +x /usr/local/bin/health-check.sh

# 3. Cron-Job für regelmäßige Checks
crontab -e
# Hinzufügen: */5 * * * * /usr/local/bin/health-check.sh >> /var/log/digital-platform/health-check.log 2>&1
```

---

## 🔄 Updates & Maintenance

### Neue App hinzufügen

Wenn Sie eine neue App zum System hinzufügen möchten, folgen Sie diesen Schritten:

#### 1. App im Repository erstellen

```bash
# Im Development-Environment
cd /path/to/platform-app/apps
npx create-next-app@latest new-app --typescript --tailwind --app=false
```

#### 2. Nginx-Konfiguration erweitern

```bash
sudo nano /etc/nginx/sites-available/digital-platform
```

Fügen Sie einen neuen Upstream und Location-Block hinzu:

```nginx
# Neue App Upstream
upstream newapp_backend {
    server 127.0.0.1:3004;  # Nächster freier Port
    keepalive 64;
}

# Im server Block hinzufügen:
location /newapp {
    limit_req zone=api burst=20 nodelay;
    
    proxy_pass http://newapp_backend;
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection 'upgrade';
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
    proxy_cache_bypass $http_upgrade;
    
    # Rewrite URL path
    rewrite ^/newapp(.*)$ $1 break;
}
```

#### 3. PM2 Ecosystem aktualisieren

```bash
nano /var/www/digital-platform/ecosystem.config.js
```

Neue App-Konfiguration hinzufügen:

```javascript
{
  name: 'newapp',
  cwd: '/var/www/digital-platform/apps/newapp',
  script: 'npm',
  args: 'start',
  env: {
    NODE_ENV: 'production',
    PORT: 3004,  // Nächster freier Port
    ...require('/var/www/digital-platform/.env.production')
  },
  instances: 1,
  exec_mode: 'cluster',
  autorestart: true,
  watch: false,
  max_memory_restart: '512M',
  error_file: '/var/log/digital-platform/newapp-error.log',
  out_file: '/var/log/digital-platform/newapp-out.log',
  time: true
}
```

#### 4. App-Konfiguration in packages/config aktualisieren

```typescript
// packages/config/src/env.ts
const appConfigs: AppConfig[] = [
  // ... existing apps ...
  {
    id: 'newapp',
    name: 'New App',
    description: 'Beschreibung der neuen App',
    icon: '🆕',
    url: getAppUrl('newapp'),
    color: 'purple',
    gradient: 'from-purple-500 to-indigo-500',
    functions: [
      // Funktionen der App
    ],
    requiredRole: 'user',
    requiredPermissions: ['newapp.access'],
    isEnabled: true,
    isClickable: true
  }
];
```

#### 5. Deployment ausführen

```bash
# Auf dem Server
cd /var/www/digital-platform

# Updates holen
git pull origin main

# Dependencies installieren
npm install

# Build
npm run build

# Nginx neu laden
sudo nginx -t && sudo systemctl reload nginx

# PM2 mit neuer App starten
pm2 reload ecosystem.config.js

# Status prüfen
pm2 status
```

#### 6. Health Check aktualisieren

```bash
sudo nano /usr/local/bin/health-check.sh
```

Neue App zu den Arrays hinzufügen:

```bash
APPS=("platform-main" "benchmark-app" "csrd-app" "support-app" "newapp")
PORTS=(3000 3001 3002 3003 3004)
```

### App entfernen

Wenn Sie eine App aus dem System entfernen möchten:

#### 1. PM2 App stoppen und entfernen

```bash
# App stoppen
pm2 stop app-name
pm2 delete app-name

# Aus ecosystem.config.js entfernen
nano /var/www/digital-platform/ecosystem.config.js
# App-Konfiguration entfernen

# PM2 speichern
pm2 save
```

#### 2. Nginx-Konfiguration bereinigen

```bash
sudo nano /etc/nginx/sites-available/digital-platform
```

Entfernen Sie:
- Den upstream Block der App
- Den location Block der App

```bash
# Nginx testen und neu laden
sudo nginx -t && sudo systemctl reload nginx
```

#### 3. App-Verzeichnis archivieren

```bash
# Backup erstellen bevor Löschen
cd /var/www/digital-platform/apps
tar -czf removed-app-backup-$(date +%Y%m%d).tar.gz app-name/
mv removed-app-backup-*.tar.gz /var/backups/digital-platform/

# App-Verzeichnis entfernen
rm -rf app-name/
```

#### 4. Konfiguration bereinigen

```typescript
// packages/config/src/env.ts
// App aus appConfigs Array entfernen
```

```bash
# Rebuild
cd /var/www/digital-platform
npm run build

# Cleanup
pm2 reload ecosystem.config.js
```

#### 5. Logs archivieren

```bash
# Logs archivieren
cd /var/log/digital-platform
tar -czf app-name-logs-$(date +%Y%m%d).tar.gz app-name-*.log
mv app-name-logs-*.tar.gz /var/backups/digital-platform/

# Alte Logs entfernen
rm -f app-name-*.log
```

### App-Migration

Wenn Sie eine App umbenennen oder migrieren möchten:

```bash
#!/bin/bash
# migrate-app.sh

OLD_NAME="old-app"
NEW_NAME="new-app"
OLD_PORT=3004
NEW_PORT=3005

echo "🔄 Migrating $OLD_NAME to $NEW_NAME"

# 1. PM2 App stoppen
pm2 stop $OLD_NAME

# 2. App-Verzeichnis umbenennen
cd /var/www/digital-platform/apps
mv $OLD_NAME $NEW_NAME

# 3. Ecosystem aktualisieren
sed -i "s/$OLD_NAME/$NEW_NAME/g" /var/www/digital-platform/ecosystem.config.js
sed -i "s/$OLD_PORT/$NEW_PORT/g" /var/www/digital-platform/ecosystem.config.js

# 4. Nginx aktualisieren
sudo sed -i "s/$OLD_NAME/$NEW_NAME/g" /etc/nginx/sites-available/digital-platform
sudo sed -i "s/$OLD_PORT/$NEW_PORT/g" /etc/nginx/sites-available/digital-platform

# 5. Reload Services
sudo nginx -t && sudo systemctl reload nginx
pm2 delete $OLD_NAME
pm2 reload ecosystem.config.js

echo "✅ Migration completed"
```

### Update-Script erstellen

```bash
# 1. Update-Script erstellen
nano /home/deploy/update-platform.sh
```

**Update Script** (`update-platform.sh`):

```bash
#!/bin/bash
# Digital Platform Update Script

set -e

APP_DIR="/var/www/digital-platform"
BACKUP_DIR="/var/backups/digital-platform"
DATE=$(date +%Y%m%d_%H%M%S)

echo "🚀 Starting Digital Platform Update - $DATE"

# 1. Erstelle Backup
echo "📦 Creating backup..."
mkdir -p $BACKUP_DIR
cp -r $APP_DIR $BACKUP_DIR/platform_backup_$DATE

# 2. Git Updates abrufen
echo "📥 Fetching updates from repository..."
cd $APP_DIR
git fetch origin

# 3. Zeige verfügbare Updates
echo "📋 Available updates:"
git log --oneline HEAD..origin/main

# 4. Benutzer-Bestätigung
read -p "🤔 Do you want to continue with the update? (y/N): " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "❌ Update aborted by user"
    exit 1
fi

# 5. Update anwenden
echo "⬇️ Pulling latest changes..."
git pull origin main

# 6. Dependencies aktualisieren
echo "📚 Updating dependencies..."
npm install

# 7. Build-Prozess
echo "🔨 Building applications..."
npm run build

# 8. PM2 Apps neu starten
echo "🔄 Restarting applications..."
pm2 reload ecosystem.config.js --update-env

# 9. Nginx Konfiguration neu laden
echo "🌐 Reloading Nginx..."
sudo nginx -t && sudo systemctl reload nginx

# 10. Health Check
echo "🏥 Performing health check..."
sleep 10
/usr/local/bin/health-check.sh

# 11. Alte Backups bereinigen (älter als 30 Tage)
echo "🧹 Cleaning old backups..."
find $BACKUP_DIR -name "platform_backup_*" -mtime +30 -exec rm -rf {} \;

echo "✅ Update completed successfully!"
echo "📊 Check application status: pm2 status"
echo "📝 Check logs: pm2 logs"
```

```bash
# 2. Script ausführbar machen
chmod +x /home/deploy/update-platform.sh
```

### Rollback-Script

```bash
# 1. Rollback-Script erstellen
nano /home/deploy/rollback-platform.sh
```

```bash
#!/bin/bash
# Digital Platform Rollback Script

set -e

APP_DIR="/var/www/digital-platform"
BACKUP_DIR="/var/backups/digital-platform"

echo "⏪ Digital Platform Rollback"

# 1. Verfügbare Backups anzeigen
echo "📋 Available backups:"
ls -la $BACKUP_DIR/platform_backup_* 2>/dev/null || echo "No backups found"

# 2. Backup auswählen
read -p "📁 Enter backup directory name (e.g., platform_backup_20231207_143022): " BACKUP_NAME

if [ ! -d "$BACKUP_DIR/$BACKUP_NAME" ]; then
    echo "❌ Backup not found: $BACKUP_DIR/$BACKUP_NAME"
    exit 1
fi

# 3. Bestätigung
read -p "⚠️ This will replace current installation with backup. Continue? (y/N): " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "❌ Rollback aborted"
    exit 1
fi

# 4. Applications stoppen
echo "⏹️ Stopping applications..."
pm2 stop all

# 5. Aktuelle Installation sichern
echo "💾 Backing up current state..."
mv $APP_DIR ${APP_DIR}_pre_rollback_$(date +%Y%m%d_%H%M%S)

# 6. Backup wiederherstellen
echo "📦 Restoring backup..."
cp -r $BACKUP_DIR/$BACKUP_NAME $APP_DIR

# 7. Dependencies neu installieren
echo "📚 Installing dependencies..."
cd $APP_DIR
npm install

# 8. Applications neu starten
echo "🚀 Starting applications..."
pm2 start ecosystem.config.js

echo "✅ Rollback completed!"
echo "📊 Check status: pm2 status"
```

```bash
# 2. Script ausführbar machen
chmod +x /home/deploy/rollback-platform.sh
```

### Automatische Updates (Optional)

```bash
# 1. Automatisches Update-Script für Minor Releases
nano /home/deploy/auto-update.sh
```

```bash
#!/bin/bash
# Automatic Security Updates

# Nur Security-Updates automatisch installieren
sudo apt update
sudo apt upgrade -y --only-upgrade

# Certbot Renewal
sudo certbot renew --quiet

# PM2 Update
npm update -g pm2

echo "🔒 Security updates completed - $(date)"
```

```bash
# 2. Cron-Job für wöchentliche Security Updates
crontab -e
# Hinzufügen: 0 3 * * 0 /home/deploy/auto-update.sh >> /var/log/digital-platform/auto-update.log 2>&1
```

---

## 🔧 Troubleshooting

### Häufige Probleme und Lösungen

#### 1. Application startet nicht

```bash
# Logs überprüfen
pm2 logs
pm2 show platform-main

# Port-Konflikte prüfen
sudo netstat -tulpn | grep :3000

# Permissions prüfen
ls -la /var/www/digital-platform
```

#### 2. 502 Bad Gateway Error

```bash
# Nginx Error Logs
sudo tail -f /var/log/nginx/error.log

# Upstream-Services prüfen
curl http://localhost:3000
curl http://localhost:3001
curl http://localhost:3002
curl http://localhost:3003

# PM2 Status
pm2 status
pm2 restart all
```

#### 3. SSL-Probleme

```bash
# Zertifikat-Status prüfen
sudo certbot certificates

# Zertifikat erneuern
sudo certbot renew --force-renewal

# Nginx SSL-Test
sudo nginx -t
```

#### 4. Memory Issues

```bash
# Memory Usage prüfen
free -h
pm2 monit

# Memory-Limits anpassen
pm2 stop all
# ecosystem.config.js bearbeiten: max_memory_restart
pm2 start ecosystem.config.js
```

#### 5. Build-Fehler

```bash
# Node-Version prüfen
node --version
npm --version

# Cache leeren
npm cache clean --force
rm -rf node_modules package-lock.json
npm install

# Build-Logs prüfen
npm run build 2>&1 | tee build.log
```

### Debug-Commands

```bash
# System-Status
systemctl status nginx
pm2 status
df -h
free -h
top

# Network-Status
sudo netstat -tulpn | grep -E ":(80|443|3000|3001|3002|3003)"
ss -tulpn | grep -E ":(80|443|3000|3001|3002|3003)"

# Log-Analyse
tail -f /var/log/nginx/access.log
tail -f /var/log/nginx/error.log
pm2 logs --lines 50

# Performance-Test
curl -w "@curl-format.txt" -o /dev/null -s https://app.clevercompany.ai/
```

### Performance-Optimierung

```bash
# 1. Nginx Performance-Tuning
sudo nano /etc/nginx/nginx.conf
```

```nginx
# Nginx Performance Settings
worker_processes auto;
worker_rlimit_nofile 65535;

events {
    worker_connections 65535;
    use epoll;
    multi_accept on;
}

http {
    # ... existing config ...
    
    # Performance Optimizations
    sendfile on;
    tcp_nopush on;
    tcp_nodelay on;
    keepalive_timeout 30;
    keepalive_requests 100;
    
    # Buffer Sizes
    client_body_buffer_size 128k;
    client_max_body_size 10m;
    client_header_buffer_size 1k;
    large_client_header_buffers 4 4k;
    output_buffers 1 32k;
    postpone_output 1460;
}
```

---

## 📈 Maintenance Checklist

### Tägliche Aufgaben (Automatisiert)
- ✅ Health Checks
- ✅ Log-Rotation
- ✅ Database Backups
- ✅ SSL Certificate Monitoring

### Wöchentliche Aufgaben
- 🔍 Log-Analyse
- 📊 Performance-Monitoring
- 🧹 Backup-Bereinigung
- 🔒 Security Updates

### Monatliche Aufgaben
- 📦 Application Updates
- 🔧 System Updates
- 💾 Full System Backup
- 📈 Performance Review

### Quartalsweise Aufgaben
- 🔐 Security Audit
- 📊 Capacity Planning
- 🔄 Disaster Recovery Test
- 📚 Documentation Update

---

## 🎯 Quick Commands Reference

```bash
# Application Management
pm2 status                          # Status aller Apps
pm2 restart all                     # Alle Apps neu starten
pm2 reload all                      # Zero-downtime reload
pm2 logs                            # Live logs anzeigen
pm2 monit                          # Performance monitoring

# Nginx Management
sudo nginx -t                       # Konfiguration testen
sudo systemctl reload nginx         # Konfiguration neu laden
sudo systemctl restart nginx        # Nginx neu starten

# SSL Management
sudo certbot certificates           # Zertifikate anzeigen
sudo certbot renew                  # Zertifikate erneuern

# Updates
/home/deploy/update-platform.sh     # Application Update
/home/deploy/rollback-platform.sh   # Rollback zu Backup

# Monitoring
/usr/local/bin/health-check.sh      # Manual health check
tail -f /var/log/digital-platform/  # Logs verfolgen
htop                                # System resources
```

---

## 🆘 Support und Wartung

### Emergency Contacts
- **System Administrator**: [Ihre Kontaktdaten]
- **Application Developer**: [Entwickler Kontakt]
- **Hosting Provider**: [Provider Support]

### Disaster Recovery
1. **Vollständiger Server-Ausfall**: Neue Server-Instanz aus Backup wiederherstellen
2. **Application-Crash**: Automatisches PM2 Restart
3. **Database-Corruption**: Backup einspielen
4. **SSL-Expiry**: Automatische Certbot-Erneuerung

### Backup-Strategie
- **Application**: Täglich, 30 Tage aufbewahren
- **Database**: Täglich, 14 Tage aufbewahren
- **System**: Wöchentlich, 4 Wochen aufbewahren
- **Off-site**: Monatlich, 12 Monate aufbewahren

---

**🎉 Gratulation! Ihre Digital Platform ist jetzt produktionsbereit und vollständig überwacht!**

Für weitere Fragen oder Support kontaktieren Sie das Development-Team oder konsultieren Sie die Projekt-Dokumentation.