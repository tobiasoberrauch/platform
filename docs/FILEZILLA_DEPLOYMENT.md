# 🚀 Filezilla + Manual Server Deployment Guide

Complete guide for deploying the Digital Platform using only Filezilla file transfer and manual server commands - no central repository required.

## 📋 Prerequisites

- **SSH access** to your server
- **Node.js 18+** installed on server
- **PM2** process manager (will be installed)
- **Web server** (Apache/Nginx) with proxy capabilities
- **Filezilla** FTP client installed locally

## 🏗️ Step 1: Build Production Files Locally

Run these commands on your local development machine:

```bash
# Ensure dependencies are installed
npm install

# Build all applications for production
npm run build

# Create deployment package
tar -czf platform-deploy.tar.gz \
  apps/*/next.config.js \
  apps/*/.next/ \
  apps/*/package.json \
  apps/*/public/ \
  packages/ \
  package.json \
  package-lock.json \
  turbo.json \
  scripts/

# Create environment file
cp .env.example .env.production
# Edit .env.production with your production values
```

### Required Environment Variables

Edit `.env.production` with your production settings:

```bash
# Base URL for your domain
NEXT_PUBLIC_BASE_URL=https://yourdomain.com

# NextAuth configuration
NEXTAUTH_URL=https://yourdomain.com
NEXTAUTH_SECRET=your-secret-key-here

# Database configuration (if applicable)
DATABASE_URL=your-database-url

# CIDAAS configuration (if using authentication)
CIDAAS_BASE_URL=your-cidaas-url
CIDAAS_CLIENT_ID=your-client-id
CIDAAS_CLIENT_SECRET=your-client-secret

# Add any other environment variables your app needs
```

## 📁 Step 2: Upload Files via Filezilla - Detaillierte Anleitung

### 2.1 Connect to Your Server

1. Open **Filezilla**
2. Enter your server credentials:
   - **Host**: your-server-ip-or-domain
   - **Username**: your-username
   - **Password**: your-password
   - **Port**: 22 (for SFTP)
3. Click **Connect**

### 2.2 Create Directory Structure

Navigate to your home directory and create the following structure:

```text
/home/youruser/digital-platform/
├── apps/
│   ├── platform/
│   ├── benchmark/
│   ├── csrd/
│   └── support/
├── packages/
├── scripts/
└── logs/
```

### 2.3 Welche Dateien müssen händisch übertragen werden

**WICHTIG**: Diese Dateien und Ordner müssen Sie mit Filezilla auf den Server übertragen:

#### 2.3.1 Hauptdateien (Root-Verzeichnis)

Übertragen Sie diese Dateien ins `/home/youruser/digital-platform/` Verzeichnis:

- `package.json` - Hauptkonfiguration
- `package-lock.json` - Dependency-Versionen
- `turbo.json` - Turbo-Konfiguration
- `.env.production` - Produktionsumgebung (selbst erstellt)

#### 2.3.2 Apps-Verzeichnis - **JA, KOMPLETTE ORDNER!**

**EINFACHER ANSATZ**: Übertragen Sie das **komplette `apps/` Verzeichnis** mit allen Unterordnern:

```text
apps/ (kompletter Ordner)
├── platform/ (kompletter Ordner)
├── benchmark/ (kompletter Ordner)
├── csrd/ (kompletter Ordner)
└── support/ (kompletter Ordner)
```

**WICHTIG**: Stellen Sie sicher, dass Sie vorher `npm run build` ausgeführt haben, damit alle `.next/` Ordner vorhanden sind!

#### 2.3.3 Packages-Verzeichnis - **JA, KOMPLETTER ORDNER!**

**EINFACHER ANSATZ**: Übertragen Sie das **komplette `packages/` Verzeichnis**:

```text
packages/ (kompletter Ordner)
├── config/ (kompletter Ordner)
└── ui/ (kompletter Ordner)
```

#### 2.3.4 NICHT ÜBERTRAGEN (werden nicht benötigt)

Diese Ordner/Dateien müssen Sie **NICHT** übertragen:
- `node_modules/` (wird auf dem Server neu installiert)
- `src/` Ordner in den Apps (nur `.next/` wird benötigt)
- `.git/` (Git-Verzeichnis)
- `.env.local` oder `.env.example`
- `README.md` und andere Dokumentation

#### 2.3.5 Schritt-für-Schritt Filezilla Upload - **VEREINFACHT!**

1. **Verbinden Sie sich mit dem Server**
2. **Erstellen Sie das Hauptverzeichnis**: `digital-platform`
3. **Navigieren Sie in das Verzeichnis**
4. **Übertragen Sie die Dateien in dieser Reihenfolge**:

   **Schritt 1**: Root-Dateien (einzeln)
   - Ziehen Sie `package.json` vom lokalen zum Server-Verzeichnis
   - Ziehen Sie `package-lock.json` vom lokalen zum Server-Verzeichnis
   - Ziehen Sie `turbo.json` vom lokalen zum Server-Verzeichnis
   - Ziehen Sie `.env.production` vom lokalen zum Server-Verzeichnis

   **Schritt 2**: Apps-Verzeichnis (kompletter Ordner)
   - Ziehen Sie den **kompletten `apps/` Ordner** vom lokalen zum Server-Verzeichnis
   - Filezilla wird automatisch alle Unterordner und Dateien übertragen

   **Schritt 3**: Packages-Verzeichnis (kompletter Ordner)
   - Ziehen Sie den **kompletten `packages/` Ordner** vom lokalen zum Server-Verzeichnis
   - Filezilla wird automatisch alle Unterordner und Dateien übertragen

   **Schritt 4**: Logs-Verzeichnis
   - Erstellen Sie den Ordner `logs/` auf dem Server (leer)

## 🖥️ Step 3: Server Setup Commands

SSH into your server and run these commands:

```bash
# Navigate to the deployment directory
cd ~/digital-platform

# Extract the deployment package
tar -xzf platform-deploy.tar.gz

# Install production dependencies
npm install --production

# Install PM2 globally (if not already installed)
npm install -g pm2

# Create environment files for each app
cp .env.production apps/platform/.env.local
cp .env.production apps/benchmark/.env.local
cp .env.production apps/csrd/.env.local
cp .env.production apps/support/.env.local

# Create logs directory
mkdir -p logs

# Set proper permissions
chmod 600 .env.production
chmod 600 apps/*/.env.local
```

## ⚙️ Step 4: Create PM2 Configuration

Create the PM2 ecosystem configuration file:

```bash
cat > ecosystem.config.js << 'EOF'
module.exports = {
  apps: [
    {
      name: 'platform-main',
      script: 'npm',
      args: 'start',
      cwd: './apps/platform',
      env: {
        NODE_ENV: 'production',
        PORT: 8000
      },
      error_file: './logs/platform-error.log',
      out_file: './logs/platform-out.log',
      log_file: './logs/platform-combined.log',
      time: true,
      max_memory_restart: '512M'
    },
    {
      name: 'benchmark-app',
      script: 'npm',
      args: 'start',
      cwd: './apps/benchmark',
      env: {
        NODE_ENV: 'production',
        PORT: 8001
      },
      error_file: './logs/benchmark-error.log',
      out_file: './logs/benchmark-out.log',
      log_file: './logs/benchmark-combined.log',
      time: true,
      max_memory_restart: '512M'
    },
    {
      name: 'csrd-app',
      script: 'npm',
      args: 'start',
      cwd: './apps/csrd',
      env: {
        NODE_ENV: 'production',
        PORT: 8002
      },
      error_file: './logs/csrd-error.log',
      out_file: './logs/csrd-out.log',
      log_file: './logs/csrd-combined.log',
      time: true,
      max_memory_restart: '512M'
    },
    {
      name: 'support-app',
      script: 'npm',
      args: 'start',
      cwd: './apps/support',
      env: {
        NODE_ENV: 'production',
        PORT: 8003
      },
      error_file: './logs/support-error.log',
      out_file: './logs/support-out.log',
      log_file: './logs/support-combined.log',
      time: true,
      max_memory_restart: '512M'
    }
  ]
};
EOF
```

## 🚀 Step 5: Start Applications

```bash
# Start all applications
pm2 start ecosystem.config.js

# Save the PM2 process list
pm2 save

# Set up PM2 to restart on server reboot
pm2 startup

# Verify all apps are running
pm2 status
```

## 🌐 Step 6: Web Server Configuration

Configure your web server to proxy requests to the Node.js applications:

### Apache Configuration (.htaccess)

Create or edit `.htaccess` in your web root:

```apache
RewriteEngine On

# Force HTTPS (optional)
RewriteCond %{HTTPS} off
RewriteRule ^(.*)$ https://%{HTTP_HOST}/$1 [R=301,L]

# Platform App (main) - catch all except specific paths
RewriteCond %{REQUEST_URI} !^/benchmark
RewriteCond %{REQUEST_URI} !^/csrd
RewriteCond %{REQUEST_URI} !^/support
RewriteRule ^(.*)$ http://localhost:8000/$1 [P,L]

# Benchmark App
RewriteRule ^benchmark/(.*)$ http://localhost:8001/$1 [P,L]
RewriteRule ^benchmark$ http://localhost:8001/ [P,L]

# CSRD App
RewriteRule ^csrd/(.*)$ http://localhost:8002/$1 [P,L]
RewriteRule ^csrd$ http://localhost:8002/ [P,L]

# Support App
RewriteRule ^support/(.*)$ http://localhost:8003/$1 [P,L]
RewriteRule ^support$ http://localhost:8003/ [P,L]
```

### Nginx Configuration

Add to your server block in nginx configuration:

```nginx
# Platform App (main)
location / {
    proxy_pass http://localhost:8000;
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection 'upgrade';
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
    proxy_cache_bypass $http_upgrade;
}

# Benchmark App
location /benchmark {
    proxy_pass http://localhost:8001;
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

# CSRD App
location /csrd {
    proxy_pass http://localhost:8002;
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

# Support App
location /support {
    proxy_pass http://localhost:8003;
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
```

## 📊 Step 7: Monitoring and Management

### PM2 Management Commands

```bash
# Check application status
pm2 status

# View logs
pm2 logs

# View logs for specific app
pm2 logs platform-main

# Monitor resource usage
pm2 monit

# Restart all applications
pm2 restart all

# Restart specific application
pm2 restart platform-main

# Stop all applications
pm2 stop all

# Delete all applications from PM2
pm2 delete all

# Show detailed info about an app
pm2 info platform-main
```

### Log Files

Application logs are stored in the `logs/` directory:

```bash
# View real-time logs
tail -f ~/digital-platform/logs/platform-combined.log
tail -f ~/digital-platform/logs/benchmark-combined.log

# View error logs
tail -f ~/digital-platform/logs/platform-error.log

# View all logs
ls -la ~/digital-platform/logs/
```

## 🔄 Step 8: Updates and Maintenance

### For Application Updates

1. **Build locally**:

   ```bash
   npm run build
   ```

2. **Upload via Filezilla**:
   - Upload new `.next/` folders for each app
   - Upload updated `package.json` files if dependencies changed

3. **Deploy on server**:

   ```bash
   cd ~/digital-platform
   pm2 stop all
   npm install --production
   pm2 start ecosystem.config.js
   ```

### For Environment Changes

1. **Update .env.production locally**
2. **Upload via Filezilla**
3. **Update on server**:

   ```bash
   cd ~/digital-platform
   cp .env.production apps/platform/.env.local
   cp .env.production apps/benchmark/.env.local
   cp .env.production apps/csrd/.env.local
   cp .env.production apps/support/.env.local
   pm2 restart all
   ```

## 🔧 Troubleshooting

### Common Issues

#### 1. Applications won't start

```bash
# Check logs
pm2 logs

# Check if ports are available
netstat -tulpn | grep -E ":(8000|8001|8002|8003)"

# Check environment variables
cat apps/platform/.env.local
```

#### 2. Web server proxy not working

```bash
# Test direct connection to apps
curl http://localhost:8000
curl http://localhost:8001
curl http://localhost:8002
curl http://localhost:8003

# Check web server configuration
# For Apache: check .htaccess syntax
# For Nginx: test configuration with nginx -t
```

#### 3. Memory issues

```bash
# Check memory usage
pm2 monit

# Restart apps if needed
pm2 restart all

# Check server resources
free -h
df -h
```

## 🔒 Security Considerations

1. **File Permissions**:
   ```bash
   chmod 600 .env.production
   chmod 600 apps/*/.env.local
   ```

2. **Firewall**:
   - Only expose ports 80/443 publicly
   - Keep ports 8000-8003 internal only

3. **SSL Certificate**:
   - Use Let's Encrypt or purchased SSL
   - Configure HTTPS redirects

4. **Regular Updates**:
   - Keep Node.js and PM2 updated
   - Monitor security advisories

## 📞 Support

### Health Check Script

Create a health check script:

```bash
cat > ~/digital-platform/health-check.sh << 'EOF'
#!/bin/bash
echo "=== Digital Platform Health Check ==="
echo "Date: $(date)"
echo ""

echo "PM2 Status:"
pm2 status

echo ""
echo "Port Check:"
for port in 8000 8001 8002 8003; do
    if curl -s http://localhost:$port > /dev/null; then
        echo "Port $port: OK"
    else
        echo "Port $port: FAILED"
    fi
done

echo ""
echo "Recent Logs:"
tail -5 ~/digital-platform/logs/platform-combined.log
EOF

chmod +x ~/digital-platform/health-check.sh
```

Run with: `~/digital-platform/health-check.sh`

---

## 🎯 Summary

This deployment method provides:

✅ **No central repository required**  
✅ **Full control over files with Filezilla**  
✅ **Production-ready PM2 process management**  
✅ **Comprehensive logging and monitoring**  
✅ **Easy updates and maintenance**  
✅ **Scalable architecture with 4 separate apps**  

Your platform will be accessible at:
- Main Platform: `https://yourdomain.com`
- Benchmark: `https://yourdomain.com/benchmark`
- CSRD: `https://yourdomain.com/csrd`
- Support: `https://yourdomain.com/support`

**Perfect for deployments where you want full control without git dependencies!** 🚀
