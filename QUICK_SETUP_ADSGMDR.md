# 🚀 QUICK SETUP - ADSGMDR.IT

## Esecuzione Rapida (5 minuti)

### Prerequisiti

- Server Linux con Node.js, npm, nginx, git installati
- Domini adsgmdr.it puntato al server
- Certificato SSL da Certbot (già configurato)

### Step 1: Prepara i File

```bash
# SSH nel server
ssh root@adsgmdr.it

# Naviga alla cartella
cd /var/www/adsgmdr/sdarmitalia-server

# Controlla che gli script sono presenti
ls -la adsgmdr-nginx.conf setup-adsgmdr.sh deploy.sh
```

### Step 2: Configura Variabili di Ambiente

```bash
# Controlla che config.env esiste
cat config.env

# Deve contenere:
# - MONGODB_URI (valido)
# - STRIPE_SECRET_KEY
# - STRIPE_PUBLIC_KEY
# - STRIPE_WEBHOOK_SECRET
# - BENEFICIARY_* (dati organizzazione)
```

⚠️ **Se config.env non esiste:**

```bash
cp config.env.example config.env
nano config.env  # Modifica con i tuoi dati
```

### Step 3: Esegui Setup Automatico

```bash
# Rendi eseguibile
chmod +x /var/www/adsgmdr/sdarmitalia-server/setup-adsgmdr.sh

# Esegui setup
sudo /var/www/adsgmdr/sdarmitalia-server/setup-adsgmdr.sh
```

Lo script automaticamente:

1. ✅ Installa dipendenze backend
2. ✅ Costruisce il frontend React
3. ✅ Configura PM2 per il backend
4. ✅ Configura Nginx come reverse proxy
5. ✅ Verifica tutto funziona

### Step 4: Verifica

```bash
# Controlla stato PM2
pm2 status

# Mostra log
pm2 logs sdarmitalia-server

# Testa il sito
curl https://adsgmdr.it/
curl http://localhost:5000/api/health
```

---

## 📋 Cosa Fa Questo Setup

```
┌─────────────────────────────────────────────────────────┐
│                   ADSGMDR.IT                            │
│              (https://adsgmdr.it)                       │
└────────────────────┬────────────────────────────────────┘
                     │
                     │ Nginx (Reverse Proxy)
                     │
        ┌────────────┴────────────┐
        │                         │
   Static Files              API Requests
   (HTML, CSS, JS)          (to Node.js)
        │                         │
        ▼                         ▼
  /var/www/adsgmdr/       localhost:5000
     frontend             (PM2 managed)
   (React Build)          (Node.js + Express)
                               │
                               ▼
                          MongoDB Atlas
                         (Database Cloud)
```

---

## 🔄 Deploy Continuo

Dopo il setup iniziale, usa per i deployment:

```bash
# Deploy completo (git pull + npm install + PM2 restart)
sudo /var/www/adsgmdr/sdarmitalia-server/deploy.sh

# Solo restart
sudo /var/www/adsgmdr/sdarmitalia-server/deploy.sh --restart-only

# Mostra log
sudo /var/www/adsgmdr/sdarmitalia-server/deploy.sh --logs

# Rollback ultimo commit
sudo /var/www/adsgmdr/sdarmitalia-server/deploy.sh --rollback
```

---

## 🐛 Troubleshooting

### ❌ "Port 5000 is already in use"

```bash
# Killare il processo
lsof -i :5000 -t | xargs kill -9

# Riavviare
sudo pm2 restart sdarmitalia-server
```

### ❌ "Nginx 502 Bad Gateway"

```bash
# Controlla se Node.js è running
pm2 status

# Se no, riavvia
pm2 restart sdarmitalia-server

# Vedi log
pm2 logs sdarmitalia-server
```

### ❌ "Cannot connect to MongoDB"

```bash
# Verifica connection string
grep MONGODB_URI /var/www/adsgmdr/sdarmitalia-server/config.env

# Controlla che IP del server è whitelisted in MongoDB Atlas
# https://cloud.mongodb.com/v2/{projectId}#security/network/access
```

### ❌ "Frontend 404 - file not found"

```bash
# Verifica build esiste
ls -la /var/www/adsgmdr/frontend/

# Se vuoto, rebuilda
cd /var/www/adsgmdr/sdarmitalia
npm run build
mkdir -p /var/www/adsgmdr/frontend
cp -r dist/* /var/www/adsgmdr/frontend/

# Ricarica nginx
sudo systemctl reload nginx
```

---

## 📊 Monitoraggio

```bash
# Stato applicazione
pm2 status

# Log in tempo reale
pm2 logs sdarmitalia-server --tail

# Statistiche
pm2 monit

# Log nginx
tail -f /var/log/nginx/adsgmdr.it-access.log
tail -f /var/log/nginx/adsgmdr.it-error.log

# Status nginx
systemctl status nginx
```

---

## 🔐 Sicurezza

```bash
# Verifica HTTPS funziona
curl -I https://adsgmdr.it/

# Verifica certificato SSL
certbot certificates

# Rinnova certificato (auto, ma puoi forzare)
sudo certbot renew --force-renewal

# Verifica permessi config.env
ls -la /var/www/adsgmdr/sdarmitalia-server/config.env
# Deve essere: -rw------- (600) - solo root può leggere
```

---

## 📱 Test

### Test Frontend

```bash
# Accedi dal browser
https://adsgmdr.it/

# Verifica React carica
# Apri DevTools (F12) e controlla console per errori
```

### Test Backend

```bash
# Health check
curl http://localhost:5000/api/health

# Statistiche donazioni
curl https://adsgmdr.it/api/donazioni/stats

# Beneficiario info
curl https://adsgmdr.it/api/donazioni/beneficiary
```

### Test Donazioni (Stripe Test Mode)

```bash
# Apri https://adsgmdr.it/donazioni
# Usa carta test Stripe: 4242 4242 4242 4242
# Data: 12/25
# CVC: 123

# Verifica donazione in MongoDB
# (Mongodb Atlas Dashboard > Collections > donazioni)
```

---

## 💾 Backup e Restore

```bash
# MongoDB Atlas fa backup automatico
# Ma puoi anche fare export manuale:

# Export donazioni
mongoexport --uri "mongodb+srv://..." --collection donazioni --out donazioni.json

# Import
mongoimport --uri "mongodb+srv://..." --collection donazioni --file donazioni.json
```

---

## 📞 Support

Se hai problemi:

1. **Controlla i log:**

   ```bash
   pm2 logs sdarmitalia-server
   tail -f /var/log/nginx/adsgmdr.it-error.log
   ```

2. **Riavvia tutto:**

   ```bash
   pm2 restart sdarmitalia-server
   sudo systemctl reload nginx
   ```

3. **Reset completo (last resort):**
   ```bash
   sudo /var/www/adsgmdr/sdarmitalia-server/setup-adsgmdr.sh
   ```

---

**Versione:** 1.0  
**Data:** Gennaio 2026  
**Autore:** SDA Italia Dev Team
