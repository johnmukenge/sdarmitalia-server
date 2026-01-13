# 📦 GUIDA DEPLOYMENT - SDA ITALIA

## 🎯 Panoramica

Questo documento descrive come deployare il progetto SDA Italia su un server Linux con:

- **Node.js** + **Express** (Backend)
- **React** (Frontend)
- **Nginx** (Web Server / Reverse Proxy)
- **PM2** (Process Manager)
- **MongoDB Atlas** (Database)
- **Let's Encrypt** (HTTPS/SSL)

---

## 🚀 SETUP INIZIALE (Una volta sola)

### 1. Preparazione Server

```bash
# Aggiorna il sistema
sudo apt-get update && sudo apt-get upgrade -y

# Installa Node.js (v18 LTS consigliato)
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Installa Git
sudo apt-get install -y git

# Installa Nginx
sudo apt-get install -y nginx

# Avvia Nginx
sudo systemctl start nginx
sudo systemctl enable nginx
```

### 2. Setup PM2 (Process Manager)

```bash
# Installa PM2 globalmente
sudo npm install -g pm2

# Abilita avvio automatico al boot
sudo pm2 startup systemd -u root --hp /root
sudo pm2 save
```

### 3. Setup Let's Encrypt (HTTPS)

```bash
# Installa Certbot
sudo apt-get install -y certbot python3-certbot-nginx

# Genera certificato (sostituisci adsgmdr.it con il tuo dominio)
sudo certbot certonly --nginx -d adsgmdr.it -d www.adsgmdr.it

# Configura auto-renewal
sudo systemctl enable certbot.timer
```

### 4. Clona il Progetto

```bash
# Crea directory base
sudo mkdir -p /var/www/adsgmdr
cd /var/www/adsgmdr

# Clona i repository
git clone https://github.com/johnmukenge/sdarmitalia.git
git clone https://github.com/johnmukenge/sdarmitalia-server.git

# Imposta permessi
sudo chown -R $USER:$USER /var/www/adsgmdr
chmod -R 755 /var/www/adsgmdr
```

### 5. Configura Variabili di Ambiente

```bash
# Backend
cd /var/www/adsgmdr/sdarmitalia-server
cp config.env.example config.env

# Modifica config.env con i tuoi dati
sudo nano config.env

# Necessita:
# - MONGODB_URI (da MongoDB Atlas)
# - STRIPE_SECRET_KEY (da Stripe Dashboard)
# - STRIPE_PUBLIC_KEY
# - STRIPE_WEBHOOK_SECRET
# - BENEFICIARY_* (IBAN, email, ecc.)
```

### 6. Installa Dipendenze

```bash
# Backend
cd /var/www/adsgmdr/sdarmitalia-server
npm ci --production

# Frontend (build React)
cd /var/www/adsgmdr/sdarmitalia
npm ci --production
npm run build

# Output build: sdarmitalia/dist/
```

### 7. Configura Nginx

```bash
# Copia il file di configurazione
sudo cp /var/www/adsgmdr/sdarmitalia-server/nginx-config.conf \
        /etc/nginx/sites-available/adsgmdr.it

# Abilita il sito
sudo ln -s /etc/nginx/sites-available/adsgmdr.it \
          /etc/nginx/sites-enabled/adsgmdr.it

# Disabilita default (opzionale)
sudo rm /etc/nginx/sites-enabled/default

# Testa la configurazione
sudo nginx -t

# Ricarica nginx
sudo systemctl reload nginx
```

### 8. Avvia l'Applicazione con PM2

```bash
cd /var/www/adsgmdr/sdarmitalia-server

# Avvia il server
sudo pm2 start server.js --name "sdarmitalia-server" \
    --output /var/log/pm2/sdarmitalia-server.log \
    --error /var/log/pm2/sdarmitalia-server-error.log

# Salva la configurazione
sudo pm2 save
```

### 9. Verifica Tutto Funzioni

```bash
# Controlla stato PM2
sudo pm2 status

# Controlla log
sudo pm2 logs sdarmitalia-server

# Testa il sito
curl https://adsgmdr.it/
curl http://localhost:5000/api/health
```

---

## 📤 DEPLOYMENT CONTINUO

Una volta fatto il setup iniziale, usa il **script di deployment automatico**:

### Opzione 1: Script Deploy Automatico (Consigliato)

```bash
# Rendi lo script eseguibile
chmod +x /var/www/adsgmdr/sdarmitalia-server/deploy.sh

# Esegui il deploy
sudo /var/www/adsgmdr/sdarmitalia-server/deploy.sh

# Opzioni disponibili:
# sudo ./deploy.sh                 # Deploy completo
# sudo ./deploy.sh --no-install    # Senza npm install
# sudo ./deploy.sh --restart-only  # Solo restart PM2
# sudo ./deploy.sh --logs          # Mostra i log
# sudo ./deploy.sh --health-check  # Verifica integrità
# sudo ./deploy.sh --rollback      # Rollback ultimo commit
```

### Opzione 2: Deploy Manuale

```bash
# 1. Aggiorna il codice
cd /var/www/adsgmdr/sdarmitalia-server
git pull origin main

# 2. Installa dipendenze
npm ci --production

# 3. Frontend (se modificato)
cd /var/www/adsgmdr/sdarmitalia
git pull origin main
npm ci --production
npm run build

# 4. Riavvia il server
cd /var/www/adsgmdr/sdarmitalia-server
sudo pm2 restart sdarmitalia-server

# 5. Verifica
curl https://adsgmdr.it/
```

---

## 🔧 TROUBLESHOOTING

### ❌ Errore: "EADDRINUSE: address already in use :::5000"

```bash
# Trova il processo sulla porta 5000
lsof -i :5000

# Killalo
kill -9 <PID>

# Oppure usa lo script
sudo ./deploy.sh --restart-only
```

### ❌ Errore: "Cannot find module 'express-rate-limit'"

```bash
cd /var/www/adsgmdr/sdarmitalia-server
npm install express-rate-limit
sudo pm2 restart sdarmitalia-server
```

### ❌ Errore: "MONGODB_URI not found"

```bash
# Controlla config.env
cat /var/www/adsgmdr/sdarmitalia-server/config.env

# Deve contenere:
# MONGODB_URI=mongodb+srv://username:password@...
```

### ❌ Nginx ritorna 502 Bad Gateway

```bash
# Controlla se il server Node.js è running
sudo pm2 status

# Controlla i log
sudo pm2 logs sdarmitalia-server

# Verifica che Node.js ascolta sulla porta 5000
netstat -tuln | grep 5000

# Se non c'è, riavvia
sudo pm2 restart sdarmitalia-server
```

### ❌ "Connection refused" a MongoDB

```bash
# Verifica che MONGODB_URI è corretto
grep MONGODB_URI /var/www/adsgmdr/sdarmitalia-server/config.env

# Testa la connessione
node -e "require('dotenv').config(); console.log(process.env.MONGODB_URI)"

# Verifica che la tua IP è autorizzata in MongoDB Atlas
# (vedi https://cloud.mongodb.com/v2/{projectId}#security/network/access)
```

---

## 📊 MONITORAGGIO

### Controlla lo Status

```bash
# Status di PM2
sudo pm2 status

# Dettagli di un'app
sudo pm2 show sdarmitalia-server

# Visualizza i log
sudo pm2 logs sdarmitalia-server --lines 50

# Statistiche in tempo reale
sudo pm2 monit
```

### Log Files

```bash
# Log PM2
sudo tail -f /var/log/pm2/sdarmitalia-server.log
sudo tail -f /var/log/pm2/sdarmitalia-server-error.log

# Log Nginx
sudo tail -f /var/log/nginx/adsgmdr.it-access.log
sudo tail -f /var/log/nginx/adsgmdr.it-error.log

# Certificato SSL
sudo certbot certificates
```

---

## 🔄 ROLLBACK

Se qualcosa va storto:

```bash
# Usa lo script di rollback
sudo /var/www/adsgmdr/sdarmitalia-server/deploy.sh --rollback

# Oppure manuale:
cd /var/www/adsgmdr/sdarmitalia-server
git reset --hard HEAD~1
npm ci --production
sudo pm2 restart sdarmitalia-server
```

---

## 🔐 SICUREZZA

### Checklist Sicurezza

- [ ] HTTPS/SSL abilitato su adsgmdr.it
- [ ] config.env è in `.gitignore` e non è nel repository
- [ ] STRIPE_SECRET_KEY non è mai committato
- [ ] MongoDB Atlas ha autenticazione e IP whitelist abilitati
- [ ] Nginx ha rate limiting configurato (opzionale)
- [ ] Firewall blocca tutte le porte tranne 80, 443, 22

### Comandi Sicurezza

```bash
# Controlla che config.env non è in git
git status | grep config.env

# Controlla i permessi dei file
ls -la /var/www/adsgmdr/sdarmitalia-server/config.env
# Deve essere -rw------- (solo root)

# Abilita firewall (UFW)
sudo ufw allow 22/tcp
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw enable
```

---

## 📝 PROCESS CHECKLIST

### Deployment Settimanale

1. ✅ Controlla i log per errori

   ```bash
   sudo pm2 logs sdarmitalia-server
   ```

2. ✅ Verifica il certificato SSL

   ```bash
   sudo certbot renew --dry-run
   ```

3. ✅ Backup del database

   ```bash
   # MongoDB Atlas: Backup automatico abilitato
   ```

4. ✅ Controlla gli aggiornamenti di Node.js
   ```bash
   node --version
   ```

---

## 💡 TIPS & TRICKS

### Restart Veloce

```bash
# Alias per rendere più veloce il deploy
alias deploy='cd /var/www/adsgmdr/sdarmitalia-server && sudo ./deploy.sh'

# Uso:
deploy
deploy --no-install
deploy --logs
```

### Update Certificato SSL

```bash
# Let's Encrypt rinnova automaticamente, ma puoi forzare:
sudo certbot renew --force-renewal

# Verifica la data di scadenza:
sudo certbot certificates
```

### Monitor Uptime

```bash
# Installa Uptime Monitor di PM2 (opzionale)
sudo pm2 install pm2-auto-restart
pm2 restart ecosystem.config.js
```

---

## 📞 SUPPORTO

Per problemi o domande:

1. Controlla i log: `sudo pm2 logs sdarmitalia-server`
2. Verifica la configurazione: `nginx -t`
3. Testa manualmente: `curl http://localhost:5000/api/health`

---

**Ultimo aggiornamento:** Gennaio 2026
**Versione:** 1.0
**Autore:** SDA Italia Dev Team
