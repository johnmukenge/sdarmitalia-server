# 🚀 Guida Deployment Produzione - Movimento di Riforma Italia

Guida completa per il deployment del sito in produzione su **movimentodiriforma.it**

---

## 📋 Indice

1. [Prerequisiti](#prerequisiti)
2. [Setup Iniziale](#setup-iniziale)
3. [Configurazione Backend](#configurazione-backend)
4. [Configurazione Frontend](#configurazione-frontend)
5. [Nginx Setup](#nginx-setup)
6. [SSL Certificate](#ssl-certificate)
7. [Primo Deployment](#primo-deployment)
8. [Deploy Successivi](#deploy-successivi)
9. [Monitoraggio](#monitoraggio)
10. [Troubleshooting](#troubleshooting)

---

## 🔧 Prerequisiti

### Server Requirements
- Ubuntu 20.04+ o Debian 11+
- Node.js 18+ e npm
- nginx
- PM2 (process manager)
- Git
- Certbot (per SSL)

### Installazione Base

```bash
# Update sistema
sudo apt update && sudo apt upgrade -y

# Install Node.js 18.x
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# Install nginx
sudo apt install -y nginx

# Install PM2 globalmente
sudo npm install -g pm2

# Install certbot per SSL
sudo apt install -y certbot python3-certbot-nginx

# Install git
sudo apt install -y git
```

---

## 🎯 Setup Iniziale

### 1. Crea Struttura Directory

```bash
# Crea cartelle per produzione
sudo mkdir -p /var/www/movimentodiriforma
cd /var/www/movimentodiriforma

# Clone repositories
sudo git clone https://github.com/TUO_USERNAME/sdarmitalia.git
sudo git clone https://github.com/TUO_USERNAME/sdarmitalia-server.git

# Crea directory per log e backup
sudo mkdir -p /var/log/pm2
sudo mkdir -p /var/backups/movimentodiriforma
```

### 2. Configura Permessi

```bash
# Assegna ownership corretta
sudo chown -R $USER:$USER /var/www/movimentodiriforma

# Permessi per nginx
sudo chmod -R 755 /var/www/movimentodiriforma
```

---

## ⚙️ Configurazione Backend

### 1. Setup Environment Variables

```bash
cd /var/www/movimentodiriforma/sdarmitalia-server

# Copia template
cp config.env.example config.env

# Modifica con editor
nano config.env
```

### 2. Configurazione config.env per PRODUZIONE

```bash
# ===== ENVIRONMENT =====
NODE_ENV=production
PORT=5001

# ===== MONGODB ATLAS =====
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/movimentodiriforma_prod?retryWrites=true&w=majority

# ===== CORS =====
CORS_ORIGIN=https://movimentodiriforma.it,https://www.movimentodiriforma.it

# ===== STRIPE (PRODUZIONE) =====
STRIPE_SECRET_KEY=sk_live_xxxxxxxxxxxxx
STRIPE_WEBHOOK_SECRET=whsec_xxxxxxxxxxxxx
STRIPE_PUBLISHABLE_KEY=pk_live_xxxxxxxxxxxxx

# ===== EMAIL =====
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=info@movimentodiriforma.it
EMAIL_PASSWORD=tu_app_password
BENEFICIARY_EMAIL=movimentodiriforma.media@gmail.com

# ===== SECURITY =====
JWT_SECRET=genera_stringa_random_lunga_e_sicura_per_produzione
JWT_EXPIRES_IN=7d
BCRYPT_ROUNDS=12

# ===== FRONTEND URL =====
FRONTEND_URL=https://movimentodiriforma.it

# ===== RATE LIMITING =====
RATE_LIMIT_WINDOW=15
RATE_LIMIT_MAX_REQUESTS=100
```

### 3. Installa Dipendenze

```bash
npm ci --production
```

---

## 🎨 Configurazione Frontend

### 1. Setup Environment Variables

```bash
cd /var/www/movimentodiriforma/sdarmitalia

# Crea file .env per produzione
nano .env.production
```

### 2. Contenuto .env.production

```bash
# API URL per produzione
VITE_API_URL=https://movimentodiriforma.it/api/v1

# Stripe Public Key (LIVE)
VITE_STRIPE_PUBLIC_KEY=pk_live_xxxxxxxxxxxxx

# App Info
VITE_APP_NAME=Avventisti Del Settimo Giorno Movimento Di Riforma Italia
VITE_APP_VERSION=1.0.0
```

### 3. Build Frontend

```bash
npm ci
npm run build

# Verifica che dist/ sia stato creato
ls -la dist/
```

---

## 🌐 Nginx Setup

### 1. Copia Configurazione

```bash
# Copia il file di configurazione
sudo cp /var/www/movimentodiriforma/sdarmitalia-server/movimentodiriforma-nginx.conf \
        /etc/nginx/sites-available/movimentodiriforma.it

# Crea symlink
sudo ln -s /etc/nginx/sites-available/movimentodiriforma.it \
           /etc/nginx/sites-enabled/

# Rimuovi default se presente
sudo rm /etc/nginx/sites-enabled/default
```

### 2. Test Configurazione

```bash
# Test syntax
sudo nginx -t

# Se OK, reload
sudo systemctl reload nginx
```

---

## 🔒 SSL Certificate

### 1. Ottieni Certificato Let's Encrypt

```bash
# Primo certificato (commenta le linee SSL in nginx.conf prima)
sudo certbot --nginx -d movimentodiriforma.it -d www.movimentodiriforma.it

# Inserisci email per notifiche
# Accetta Terms of Service
# Scegli redirect HTTP -> HTTPS
```

### 2. Auto-Renewal

```bash
# Test auto-renewal
sudo certbot renew --dry-run

# Certbot installa automaticamente un cron job
# Verifica:
sudo systemctl status certbot.timer
```

---

## 🚀 Primo Deployment

### 1. Rendi Eseguibile lo Script

```bash
cd /var/www/movimentodiriforma/sdarmitalia-server
chmod +x deploy-production.sh
```

### 2. Esegui Deploy Completo

```bash
sudo ./deploy-production.sh
```

Lo script eseguirà automaticamente:
- ✅ Verifica prerequisiti
- ✅ Crea backup
- ✅ Git pull (branch main)
- ✅ npm install
- ✅ Build frontend
- ✅ Avvia PM2
- ✅ Reload nginx
- ✅ Health check

### 3. Verifica Deployment

```bash
# Verifica PM2
pm2 status
pm2 logs sdarmitalia-prod

# Verifica Backend
curl http://localhost:5001/api/v1/health

# Verifica Nginx
curl https://movimentodiriforma.it

# Test API
curl https://movimentodiriforma.it/api/v1/events
```

---

## 🔄 Deploy Successivi

### Deploy Completo

```bash
sudo ./deploy-production.sh
```

### Deploy Veloce (senza npm install)

```bash
sudo ./deploy-production.sh --no-install
```

### Solo Restart PM2

```bash
sudo ./deploy-production.sh --restart-only
```

### Verifica Salute

```bash
sudo ./deploy-production.sh --health-check
```

### Visualizza Log

```bash
sudo ./deploy-production.sh --logs

# Oppure direttamente:
pm2 logs sdarmitalia-prod
pm2 logs sdarmitalia-prod --lines 100
```

---

## 📊 Monitoraggio

### PM2 Dashboard

```bash
# Real-time monitoring
pm2 monit

# Lista processi
pm2 status

# Informazioni dettagliate
pm2 show sdarmitalia-prod

# Metriche
pm2 describe sdarmitalia-prod
```

### Log Files

```bash
# Log applicazione
tail -f /var/log/pm2/sdarmitalia-prod.log
tail -f /var/log/pm2/sdarmitalia-prod-error.log

# Log nginx
tail -f /var/log/nginx/movimentodiriforma.it-access.log
tail -f /var/log/nginx/movimentodiriforma.it-error.log

# Tutti i log insieme
multitail /var/log/pm2/sdarmitalia-prod.log \
          /var/log/nginx/movimentodiriforma.it-access.log
```

### Comandi PM2 Utili

```bash
# Restart
pm2 restart sdarmitalia-prod

# Stop
pm2 stop sdarmitalia-prod

# Riavvio con zero-downtime
pm2 reload sdarmitalia-prod

# Elimina processo
pm2 delete sdarmitalia-prod

# Salva configurazione
pm2 save

# Startup automatico
pm2 startup systemd
```

---

## 🔧 Troubleshooting

### Backend non risponde

```bash
# Verifica processo PM2
pm2 list
pm2 logs sdarmitalia-prod --err

# Verifica porta
sudo netstat -tlnp | grep 5001
sudo lsof -i :5001

# Restart manuale
pm2 restart sdarmitalia-prod

# Test diretto
node /var/www/movimentodiriforma/sdarmitalia-server/server.js
```

### Nginx 502 Bad Gateway

```bash
# Verifica backend attivo
curl http://localhost:5001/api/v1/health

# Controlla log nginx
sudo tail -f /var/log/nginx/movimentodiriforma.it-error.log

# Test configurazione
sudo nginx -t

# Reload nginx
sudo systemctl reload nginx

# Restart nginx
sudo systemctl restart nginx
```

### Frontend non carica

```bash
# Verifica build
ls -la /var/www/movimentodiriforma/sdarmitalia/dist/

# Rebuild frontend
cd /var/www/movimentodiriforma/sdarmitalia
npm run build

# Controlla permessi
sudo chmod -R 755 /var/www/movimentodiriforma/sdarmitalia/dist/
```

### Database Connection Failed

```bash
# Test connessione MongoDB
cd /var/www/movimentodiriforma/sdarmitalia-server
node -e "require('dotenv').config({path:'./config.env'}); \
const mongoose = require('mongoose'); \
mongoose.connect(process.env.MONGODB_URI).then(() => console.log('OK'))"

# Verifica MONGODB_URI in config.env
cat config.env | grep MONGODB_URI

# Verifica IP whitelist su MongoDB Atlas
# Aggiungi IP del server in MongoDB Atlas Network Access
```

### SSL Certificate Issues

```bash
# Rinnova manualmente
sudo certbot renew

# Test renewal
sudo certbot renew --dry-run

# Ricrea certificato
sudo certbot delete -d movimentodiriforma.it
sudo certbot --nginx -d movimentodiriforma.it -d www.movimentodiriforma.it
```

### Rollback Deployment

```bash
# Usa lo script
sudo ./deploy-production.sh --rollback

# Oppure manualmente
cd /var/www/movimentodiriforma/sdarmitalia-server
git reset --hard HEAD~1
npm ci --production
pm2 restart sdarmitalia-prod
```

---

## 📱 Setup Notifiche

### PM2 Telegram Notifications (Opzionale)

```bash
# Install PM2 module
pm2 install pm2-telegram

# Configure
pm2 set pm2-telegram:token YOUR_TELEGRAM_BOT_TOKEN
pm2 set pm2-telegram:chatid YOUR_CHAT_ID
```

---

## 🔐 Security Checklist

- [ ] SSL certificate attivo e auto-renewal configurato
- [ ] `NODE_ENV=production` in config.env
- [ ] Password database sicure e uniche
- [ ] JWT_SECRET lungo e random
- [ ] Stripe API keys LIVE (non test)
- [ ] CORS configurato solo per domini autorizzati
- [ ] Firewall configurato (ufw)
- [ ] Fail2ban installato e configurato
- [ ] Backup automatici configurati
- [ ] MongoDB Atlas IP whitelist configurata
- [ ] Rate limiting attivo in nginx
- [ ] Headers di sicurezza configurati

---

## 📅 Maintenance Schedule

### Giornaliero
- Controlla log per errori: `pm2 logs --lines 100`
- Verifica uptime: `pm2 status`

### Settimanale  
- Review log nginx: `tail -100 /var/log/nginx/movimentodiriforma.it-error.log`
- Controlla disk space: `df -h`
- Test backup: verificare `/var/backups/movimentodiriforma/`

### Mensile
- Update sistema: `sudo apt update && sudo apt upgrade`
- Test disaster recovery
- Review metriche PM2

---

## 📞 Support

Per problemi o domande:
- Email: dev@movimentodiriforma.it
- Repository: [GitHub Issues]
- Documentazione: `/var/www/movimentodiriforma/sdarmitalia-server/README.md`

---

**✅ Setup Completato! Il sito è ora in produzione su https://movimentodiriforma.it**
