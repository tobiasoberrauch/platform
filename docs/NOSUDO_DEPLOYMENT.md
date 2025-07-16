# 🔒 Digital Platform - Deployment ohne sudo/root Rechte

Vollständige Anleitung für die Installation der Digital Platform auf Shared Hosting, Managed VPS oder anderen Umgebungen ohne Administratorrechte.

## 🚀 One-Line Installation

```bash
# Standard Installation
curl -sSL https://raw.githubusercontent.com/your-repo/scripts/deploy-nosudo.sh | bash

# Mit Custom-Konfiguration
curl -sSL https://raw.githubusercontent.com/your-repo/scripts/deploy-nosudo.sh | \
DOMAIN=ihre-domain.de \
PORT_BASE=8000 \
GIT_REPO=https://github.com/ihr-repo/platform.git \
bash
```

## 🎯 Für wen ist das geeignet?

### ✅ Ideal für:

- **Shared Hosting** (Strato, 1&1, HostEurope, etc.)
- **Managed VPS** ohne root-Zugang
- **Corporate Environments** mit eingeschränkten Rechten
- **cPanel/DirectAdmin** Hosting-Accounts
- **Plesk** Hosting-Umgebungen
- **Entwicklungsserver** ohne Administratorrechte

### ❌ Nicht geeignet für:
- Dedizierte Server mit vollen Root-Rechten (nutzen Sie dann `deploy-debian.sh`)
- Produktionsumgebungen mit hohem Traffic (aufgrund Port-Limitierungen)

## 🔧 Was das Script macht

### Ohne root/sudo erforderlich:

1. **Node.js Installation** via NVM (user-space)
2. **Application Setup** im User-Verzeichnis
3. **PM2 Process Manager** für App-Verwaltung
4. **User-level Cron Jobs** für Monitoring
5. **Webserver-Konfigurationen** als Beispiele
6. **Maintenance Scripts** für Updates und Monitoring

### Verwendete Ports:

| App | Standard Port | Anpassbar |
|-----|---------------|-----------|
| Platform | 8000 | ✅ |
| Benchmark | 8001 | ✅ |
| CSRD | 8002 | ✅ |
| Support | 8003 | ✅ |

## 📋 Systemanforderungen

### Minimal:
- **Linux/Unix** System (Shared Hosting reicht)
- **SSH-Zugang** zum Server
- **Git, curl, wget** verfügbar
- **~500MB freier Speicher**
- **Node.js-Support** vom Hoster (meist vorhanden)

### Empfohlen:
- **1GB+ RAM** für alle Apps
- **Port 8000-8003** verfügbar
- **Reverse Proxy** Unterstützung (Apache/Nginx)

## 🛠️ Schritt-für-Schritt Installation

### 1. SSH-Verbindung

```bash
# Mit SSH auf Ihren Server verbinden
ssh username@ihr-server.de

# Oder bei cPanel: SSH Terminal verwenden
```

### 2. Installation ausführen

```bash
# Einfache Installation
curl -sSL https://raw.githubusercontent.com/your-repo/scripts/deploy-nosudo.sh | bash

# Oder mit Custom-Ports (falls 8000-8003 belegt sind)
curl -sSL https://raw.githubusercontent.com/your-repo/scripts/deploy-nosudo.sh | PORT_BASE=9000 bash
```

### 3. Webserver konfigurieren

Das Script erstellt Beispiel-Konfigurationen für Apache und Nginx:

#### Apache (.htaccess)

```bash
# Konfiguration für Apache finden
cat ~/digital-platform/webserver-configs/apache-htaccess-example

# In Ihre public_html kopieren (Beispiel)
cp ~/digital-platform/webserver-configs/apache-htaccess-example ~/public_html/.htaccess
```

#### Nginx (für cPanel/DirectAdmin)

```bash
# Nginx-Konfiguration anzeigen
cat ~/digital-platform/webserver-configs/nginx-userconfig-example

# Diese Konfiguration in Ihrem Control Panel hinzufügen
```

## 🎛️ Control Panel Integration

### cPanel Integration

1. **NodeJS App erstellen:**
   - cPanel → Software → NodeJS
   - Create Application
   - Node.js Version: 18
   - Application Root: `digital-platform/apps/platform`
   - Application URL: Ihre Domain

2. **Environment Variables:**
   - cPanel → NodeJS App → Environment Variables
   - Variablen aus `.env.production` hinzufügen

3. **Reverse Proxy:**
   - cPanel → Domains → Subdomains
   - Proxy-Konfiguration für alle 4 Apps

### DirectAdmin Integration

```bash
# 1. NodeJS aktivieren (falls verfügbar)
# Domain → SubDomains → NodeJS Apps

# 2. Custom Nginx config
# Domain → Nginx Config → Custom Configuration
```

### Plesk Integration

1. **Node.js Extension installieren**
2. **Application erstellen** mit PM2
3. **Reverse Proxy** für Subpaths konfigurieren

## 🔄 App-Management

### PM2 Commands

```bash
# Status aller Apps
pm2 status

# Logs anzeigen
pm2 logs

# Apps neu starten
pm2 restart all

# Einzelne App neu starten
pm2 restart platform-main

# Apps stoppen
pm2 stop all

# Memory-Monitoring
pm2 monit
```

### Maintenance Scripts

```bash
# Health Check
~/.local/bin/health-check.sh

# Platform Update
~/.local/bin/update-platform.sh

# Start/Stop Scripts
~/.local/bin/start-platform.sh
~/.local/bin/stop-platform.sh
```

## 🌐 Webserver-Konfiguration

### Apache mod_rewrite (.htaccess)

```apache
RewriteEngine On

# Force HTTPS
RewriteCond %{HTTPS} off
RewriteRule ^(.*)$ https://%{HTTP_HOST}/$1 [R=301,L]

# Platform App (main)
RewriteCond %{REQUEST_URI} !^/benchmark
RewriteCond %{REQUEST_URI} !^/csrd
RewriteCond %{REQUEST_URI} !^/support
RewriteRule ^(.*)$ http://localhost:8000/$1 [P,L]

# Benchmark App
RewriteRule ^benchmark/(.*)$ http://localhost:8001/$1 [P,L]

# CSRD App
RewriteRule ^csrd/(.*)$ http://localhost:8002/$1 [P,L]

# Support App
RewriteRule ^support/(.*)$ http://localhost:8003/$1 [P,L]
```

### Nginx Reverse Proxy

```nginx
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

location /benchmark {
    proxy_pass http://localhost:8001;
    # ... weitere Header ...
    rewrite ^/benchmark(.*)$ $1 break;
}

location /csrd {
    proxy_pass http://localhost:8002;
    # ... weitere Header ...
    rewrite ^/csrd(.*)$ $1 break;
}

location /support {
    proxy_pass http://localhost:8003;
    # ... weitere Header ...
    rewrite ^/support(.*)$ $1 break;
}
```

## 📊 Monitoring & Logs

### Automatisches Monitoring

```bash
# Cron Jobs (automatisch konfiguriert)
crontab -l

# Health Check alle 5 Minuten
*/5 * * * * ~/.local/bin/health-check.sh >> ~/logs/health-check.log 2>&1

# PM2 Resurrection nach Reboot
@reboot cd ~/digital-platform && pm2 resurrect
```

### Log-Dateien

```bash
# Application Logs
tail -f ~/logs/platform-combined.log
tail -f ~/logs/benchmark-out.log

# PM2 Logs
pm2 logs --lines 100

# Health Check Logs
tail -f ~/logs/health-check.log
```

## 🔧 Troubleshooting

### Häufige Probleme

#### 1. Ports bereits belegt

```bash
# Andere Ports verwenden
curl -sSL script-url | PORT_BASE=9000 bash

# Belegte Ports prüfen
netstat -tulpn | grep -E ":(8000|8001|8002|8003)"
```

#### 2. Node.js nicht gefunden

```bash
# NVM manuell laden
source ~/.bashrc
nvm use 18

# Node.js Version prüfen
which node
node --version
```

#### 3. PM2 Apps starten nicht

```bash
# Logs prüfen
pm2 logs

# Einzeln starten
cd ~/digital-platform
pm2 start ecosystem.config.js

# Environment prüfen
cat .env.production
```

#### 4. Webserver Proxy funktioniert nicht

```bash
# Port-Konnektivität testen
curl http://localhost:8000
curl http://localhost:8001

# Apache mod_proxy aktiviert?
# (Bei Shared Hosting meist automatisch)

# Nginx-Konfiguration testen
# (Control Panel → Test Configuration)
```

### Debug-Modus

```bash
# Detaillierte Logs
pm2 logs --raw

# einzelne App debuggen
cd ~/digital-platform/apps/platform
npm start
```

## 🔒 Sicherheit bei Shared Hosting

### Wichtige Überlegungen

1. **Port-Exposition**: Apps laufen auf nicht-Standard-Ports
2. **File Permissions**: Automatisch auf User-Level beschränkt
3. **Process Isolation**: PM2 läuft als Ihr User
4. **Log-Sicherheit**: Logs nur für Ihren User lesbar

### Sicherheits-Checks

```bash
# File Permissions prüfen
ls -la ~/.env.production  # Sollte 600 (-rw-------) sein

# Laufende Prozesse
ps aux | grep node

# Offene Ports (nur Ihre)
ss -tulpn | grep $(id -u)
```

## 💡 Performance-Optimierung

### Memory-Limits

```javascript
// ecosystem.config.js anpassen
max_memory_restart: '256M'  // Für Shared Hosting
instances: 1                // Single instance für Shared Hosting
exec_mode: 'fork'          // Fork statt Cluster
```

### Resource-Monitoring

```bash
# Memory Usage
free -h

# Disk Usage
df -h ~

# Process Resources
pm2 monit

# App Performance
curl -w "@curl-format.txt" http://localhost:8000
```

## 📦 Updates & Wartung

### Automatische Updates

```bash
# Update ausführen
~/.local/bin/update-platform.sh

# Backup überprüfen
ls -la ~/backups/digital-platform/
```

### Manuelle Wartung

```bash
# Dependencies aktualisieren
cd ~/digital-platform
npm update

# PM2 aktualisieren
npm update -g pm2

# Log-Bereinigung
find ~/logs -name "*.log" -mtime +14 -delete
```

## 🏢 Hosting-Provider-Spezifisch

### Strato

```bash
# SSH aktivieren in Strato-Kundencenter
# Standard SSH-Port: 22
ssh username@ihre-domain.de
```

### 1&1 IONOS

```bash
# Server-Zugang über Control Panel
# NodeJS meist verfügbar
# Port-Range: 8000-8999 meist frei
```

### HostEurope

```bash
# SSH über Control Panel aktivieren
# NodeJS-Support verfügbar
# PM2 Installation meist erlaubt
```

### Hetzner Cloud

```bash
# Volle SSH-Rechte verfügbar
# Auch Root-Script möglich
# Flexible Port-Konfiguration
```

## 📞 Support & Hilfe

### Bei Problemen

1. **Logs prüfen**: `pm2 logs`
2. **Health Check**: `~/.local/bin/health-check.sh`
3. **Provider kontaktieren**: Bei Port/NodeJS-Problemen
4. **Community**: GitHub Issues für App-spezifische Probleme

### Debugging-Info sammeln

```bash
# System-Info sammeln
uname -a
cat /etc/os-release
which node npm pm2
node --version
npm --version

# App-Status
pm2 status
pm2 logs --lines 50

# Port-Status
netstat -tulpn | grep $(id -u)
```

---

## 🎯 Zusammenfassung

Das Non-Sudo-Deployment ermöglicht es Ihnen, die Digital Platform auch in eingeschränkten Umgebungen zu betreiben:

✅ **Keine root-Rechte erforderlich**  
✅ **Shared Hosting kompatibel**  
✅ **Automatisches Setup mit einem Befehl**  
✅ **Vollständiges Process Management**  
✅ **Monitoring und Updates**  
✅ **Webserver-Integration**  

**Perfect für Shared Hosting und Managed Environments!** 🚀