# 🐧 Digital Platform - Debian/Ubuntu Automated Deployment

Vollautomatisiertes Deployment-Script für Debian 11/12 und Ubuntu 20.04+

## 🚀 One-Line Installation

### Schnelle Installation (Empfohlen)

```bash
# Mit Standard-Domain (app.clevercompany.ai)
curl -sSL https://raw.githubusercontent.com/your-repo/scripts/deploy-debian.sh | sudo bash

# Mit Custom Domain
curl -sSL https://raw.githubusercontent.com/your-repo/scripts/deploy-debian.sh | sudo DOMAIN=ihre-domain.de bash

# Mit Custom Repository
curl -sSL https://raw.githubusercontent.com/your-repo/scripts/deploy-debian.sh | sudo DOMAIN=ihre-domain.de GIT_REPO=https://github.com/ihr-repo/platform.git bash
```

### Lokale Installation

```bash
# Script herunterladen
wget https://raw.githubusercontent.com/your-repo/scripts/deploy-debian.sh
chmod +x deploy-debian.sh

# Ausführen
sudo ./deploy-debian.sh
```

## ⚙️ Script-Features

### ✅ Vollautomatisiert

- **OS-Erkennung**: Debian 11/12, Ubuntu 20.04+
- **System-Updates**: Automatische Package-Updates
- **Firewall-Setup**: UFW mit SSH, HTTP, HTTPS
- **Swap-Erstellung**: Automatisch bei <4GB RAM
- **User-Management**: Deploy-User mit sudo-Rechten
- **Node.js**: Automatische Installation (v18)
- **Nginx**: Reverse Proxy für alle Apps
- **SSL/HTTPS**: Let's Encrypt mit Auto-Renewal
- **PM2**: Process Manager mit Clustering
- **Monitoring**: Health Checks und Logging
- **Security**: Fail2ban und Rate Limiting

### 🔧 Was das Script installiert

1. **System-Packages**:
   - curl, wget, git, htop, build-essential
   - ufw (Firewall), fail2ban (Intrusion Prevention)
   - nginx, certbot (SSL), jq, python3

2. **Node.js Ecosystem**:
   - Node.js 18.x via NodeSource
   - npm, yarn global
   - PM2 Process Manager

3. **Application Stack**:
   - Git Repository Clone
   - NPM Dependencies
   - Production Build
   - Environment Configuration
   - PM2 Clustering (2x Platform, 1x andere Apps)

4. **Security & Monitoring**:
   - UFW Firewall (SSH, HTTP, HTTPS)
   - Fail2ban für SSH/HTTP Protection
   - SSL Certificate mit Auto-Renewal
   - Health Check Scripts
   - Log Rotation

## 📋 Unterschiede zu Ubuntu

### Debian-spezifische Anpassungen

Das Script erkennt automatisch das OS und macht entsprechende Anpassungen:

```bash
# OS-Erkennung
detect_os() {
    if [[ -f /etc/os-release ]]; then
        . /etc/os-release
        OS=$ID
        OS_VERSION=$VERSION_ID
    fi
    
    case $OS in
        debian|ubuntu)
            log "Supported OS detected: $PRETTY_NAME"
            ;;
        *)
            error "Unsupported OS"
            ;;
    esac
}
```

### Package-Unterschiede

| Feature | Ubuntu | Debian | Script-Lösung |
|---------|--------|--------|---------------|
| Snapd | Vorinstalliert | Manuell | Automatische Installation |
| UFW | Standard | Verfügbar | Einheitliche Konfiguration |
| Fail2ban | Standard | Standard | Identische Konfiguration |
| NodeSource | Unterstützt | Unterstützt | Einheitliches Setup |

## 🔧 Manuelle Konfiguration

### Environment Variables anpassen

Nach der Installation können Sie die Umgebungsvariablen anpassen:

```bash
sudo nano /var/www/digital-platform/.env.production
```

```env
# Ihre Supabase-Daten
NEXT_PUBLIC_SUPABASE_URL=https://ihr-projekt.supabase.co
SUPABASE_SERVICE_ROLE_KEY=ihr-service-role-key
NEXT_PUBLIC_SUPABASE_ANON_KEY=ihr-anon-key

# Weitere Anpassungen...
```

### Services neu starten

```bash
sudo -u deploy pm2 reload all
sudo systemctl reload nginx
```

## 📊 Monitoring & Management

### Health Check

```bash
# Manueller Health Check
/usr/local/bin/health-check.sh

# Live Monitoring
watch -n 5 '/usr/local/bin/health-check.sh'
```

### PM2 Management

```bash
# Als deploy User wechseln
sudo su - deploy

# Status anzeigen
pm2 status

# Logs anzeigen
pm2 logs

# Apps neu starten
pm2 restart all

# Memory Monitoring
pm2 monit
```

### Nginx Management

```bash
# Status prüfen
sudo systemctl status nginx

# Konfiguration testen
sudo nginx -t

# Neu laden
sudo systemctl reload nginx

# Error Logs
sudo tail -f /var/log/nginx/error.log
```

## 🔄 Updates

### Automatischer Update-Prozess

```bash
# Als deploy User
sudo su - deploy

# Update ausführen
./update-platform.sh
```

Das Update-Script:
1. Erstellt automatisches Backup
2. Zeigt verfügbare Updates
3. Fragt nach Bestätigung
4. Führt Git Pull aus
5. Installiert Dependencies
6. Rebuilt Application
7. Startet Services neu
8. Führt Health Check aus

### Rollback bei Problemen

```bash
# Verfügbare Backups anzeigen
ls -la /var/backups/digital-platform/

# Rollback durchführen
sudo ./rollback-platform.sh
```

## 🔐 Security Features

### Firewall-Konfiguration

```bash
# Status prüfen
sudo ufw status verbose

# Neue Ports öffnen (falls nötig)
sudo ufw allow 8080

# Rate Limiting für SSH
sudo ufw limit ssh
```

### Fail2ban Status

```bash
# Status anzeigen
sudo fail2ban-client status

# Jail-Status prüfen
sudo fail2ban-client status sshd
sudo fail2ban-client status nginx-http-auth

# Gesperrte IPs anzeigen
sudo fail2ban-client get sshd banip
```

### SSL Certificate Management

```bash
# Certificates anzeigen
sudo certbot certificates

# Manueller Renewal
sudo certbot renew

# Auto-Renewal testen
sudo certbot renew --dry-run
```

## 📁 File Structure nach Installation

```
/var/www/digital-platform/
├── apps/
│   ├── platform/
│   ├── benchmark/
│   ├── csrd/
│   └── support/
├── packages/
│   ├── config/
│   └── ui/
├── .env.production
├── ecosystem.config.js
├── package.json
└── README.md

/var/log/digital-platform/
├── platform-*.log
├── benchmark-*.log
├── csrd-*.log
├── support-*.log
└── health-check.log

/home/deploy/
├── update-platform.sh
└── rollback-platform.sh

/usr/local/bin/
└── health-check.sh
```

## 🧩 Script-Konfiguration

### Environment Variables

Das Script unterstützt folgende Umgebungsvariablen:

```bash
# Domain konfigurieren
DOMAIN="ihre-domain.de"

# Repository URL
GIT_REPO="https://github.com/ihr-repo/platform.git"

# Node.js Version (default: 18)
NODE_VERSION="18"

# Deploy User (default: deploy)
DEPLOY_USER="deploy"

# Application Directory (default: /var/www/digital-platform)
APP_DIR="/var/www/digital-platform"
```

### Beispiel für Custom Installation

```bash
# Custom Domain und Repository
curl -sSL https://raw.githubusercontent.com/your-repo/scripts/deploy-debian.sh | \
sudo DOMAIN=myapp.example.com \
     GIT_REPO=https://github.com/mycompany/myplatform.git \
     DEPLOY_USER=webuser \
     bash
```

## 🐛 Troubleshooting

### Häufige Probleme

#### 1. Script-Ausführung schlägt fehl

```bash
# Logs prüfen
tail -f /var/log/digital-platform-install.log

# Berechtigungen prüfen
ls -la deploy-debian.sh
chmod +x deploy-debian.sh
```

#### 2. SSL-Installation schlägt fehl

```bash
# Domain-DNS prüfen
nslookup ihre-domain.de

# Manueller SSL-Setup
sudo certbot --nginx -d ihre-domain.de
```

#### 3. Apps starten nicht

```bash
# PM2 Status
sudo -u deploy pm2 status

# Port-Konflikte prüfen
sudo netstat -tulpn | grep -E ":(3000|3001|3002|3003)"

# Logs prüfen
sudo -u deploy pm2 logs
```

#### 4. Nginx 502 Error

```bash
# Upstream Services prüfen
curl http://localhost:3000
curl http://localhost:3001

# Nginx Error Logs
sudo tail -f /var/log/nginx/error.log
```

### Debug-Modus

```bash
# Script mit Debug-Output ausführen
bash -x deploy-debian.sh
```

### Service-Restart

```bash
# Alle Services neu starten
sudo systemctl restart nginx
sudo systemctl restart fail2ban
sudo -u deploy pm2 restart all
```

## 📞 Support & Wartung

### Regelmäßige Wartung

```bash
# Wöchentliche Aufgaben
sudo apt update && sudo apt upgrade -y
sudo -u deploy pm2 update

# Monatliche Aufgaben
sudo apt autoremove -y
sudo apt autoclean
/usr/local/bin/health-check.sh

# Backup-Bereinigung
find /var/backups/digital-platform -name "platform_backup_*" -mtime +30 -delete
```

### Performance-Monitoring

```bash
# System Resources
htop
free -h
df -h

# Application Performance
sudo -u deploy pm2 monit

# Network Connections
ss -tulpn | grep -E ":(80|443|3000|3001|3002|3003)"
```

### Log-Analyse

```bash
# Application Logs
sudo -u deploy pm2 logs --lines 100

# Nginx Logs
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log

# System Logs
journalctl -u nginx -f
journalctl -u fail2ban -f
```

## 🎯 Production Checklist

### Nach der Installation

- [ ] DNS auf Server-IP zeigt
- [ ] SSL-Zertifikat installiert
- [ ] Alle 4 Apps laufen (PM2 Status)
- [ ] Nginx Reverse Proxy funktioniert
- [ ] Health Checks sind grün
- [ ] Firewall ist aktiv
- [ ] Fail2ban läuft
- [ ] Auto-Backups konfiguriert
- [ ] Monitoring-Alerts eingerichtet

### Sicherheit

- [ ] SSH Key-basierte Authentifizierung
- [ ] Root-Login deaktiviert
- [ ] Regelmäßige Updates geplant
- [ ] Backup-Strategie implementiert
- [ ] Disaster Recovery getestet
- [ ] SSL A+ Rating (SSLLabs Test)

### Performance

- [ ] Gzip-Kompression aktiv
- [ ] Static File Caching
- [ ] PM2 Clustering optimal
- [ ] Memory Limits konfiguriert
- [ ] Log Rotation aktiv

---

## 🎉 Fertig!

Ihre Digital Platform ist jetzt vollautomatisch auf Debian/Ubuntu deployed!

**Zugriff**: https://ihre-domain.de  
**Monitoring**: `/usr/local/bin/health-check.sh`  
**Updates**: `/home/deploy/update-platform.sh`  
**Support**: Siehe Troubleshooting-Sektion