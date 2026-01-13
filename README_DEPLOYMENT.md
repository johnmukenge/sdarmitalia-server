# 🚀 DEPLOYMENT ADSGMDR.IT - GUIDA COMPLETA

## 📋 Panoramica

Questo repository contiene gli script e la configurazione per deployare **SDA Italia** su **adsgmdr.it**.

**Architettura:**

```
HTTPS://ADSGMDR.IT
    │
    └─ Nginx (Reverse Proxy)
       ├─ Frontend: /var/www/adsgmdr/frontend (React)
       └─ API: localhost:5000 (Node.js + PM2)
            └─ MongoDB Atlas (Database)
```

---

## ⚡ Quick Start (5 minuti)

### 1. Prepara il Server

```bash
ssh root@adsgmdr.it
cd /var/www/adsgmdr/sdarmitalia-server

# Verifica configurazione
ls -la config.env nginx-config.conf setup-adsgmdr.sh deploy.sh
```

### 2. Configura Variabili di Ambiente

```bash
# Controlla config.env
cat config.env

# Se manca, copialo da example e modifica
cp config.env.example config.env
nano config.env
```

**Che deve contenere:**

- ✅ MONGODB_URI (da MongoDB Atlas)
- ✅ STRIPE_SECRET_KEY (da Stripe Dashboard)
- ✅ STRIPE_PUBLIC_KEY
- ✅ STRIPE_WEBHOOK_SECRET
- ✅ BENEFICIARY_IBAN, BENEFICIARY_EMAIL, ecc.

### 3. Esegui Pre-Deployment Check

```bash
chmod +x check-deployment.sh
sudo ./check-deployment.sh

# Verifica che tutto è OK (0 failed)
```

### 4. Deploy Automatico

```bash
chmod +x setup-adsgmdr.sh
sudo ./setup-adsgmdr.sh
```

Lo script farà:

1. ✅ Installa dipendenze backend
2. ✅ Costruisce frontend React
3. ✅ Configura PM2
4. ✅ Configura Nginx
5. ✅ Verifica tutto funziona

### 5. Verifica Risultato

```bash
# Controlla stato
pm2 status

# Mostra log
pm2 logs sdarmitalia-server

# Testa il sito
curl https://adsgmdr.it/
```

---

## 📁 File Inclusi

### Script di Deployment

| File                  | Descrizione                              |
| --------------------- | ---------------------------------------- |
| `setup-adsgmdr.sh`    | Setup completo (eseguire una sola volta) |
| `deploy.sh`           | Deploy continuo (git pull + rebuild)     |
| `check-deployment.sh` | Verifica prerequisiti prima di deployare |
| `restart-server.sh`   | Killare processo e riavviare             |

### Configurazione

| File                 | Descrizione                              |
| -------------------- | ---------------------------------------- |
| `adsgmdr-nginx.conf` | Configurazione Nginx (reverse proxy)     |
| `nginx-config.conf`  | Template nginx alternativo               |
| `config.env.example` | Template variabili ambiente (NO secrets) |

### Documentazione

| File                         | Descrizione                              |
| ---------------------------- | ---------------------------------------- |
| `QUICK_SETUP_ADSGMDR.md`     | Guida rapida (questo file)               |
| `DEPLOYMENT_GUIDE.md`        | Guida completa (setup + troubleshooting) |
| `DONATIONS_DOCUMENTATION.md` | API donazioni Stripe                     |
| `DONATIONS_SETUP.js`         | Setup donazioni con esempi               |

---

## 🔄 Deploy Continuo

Dopo il primo setup, usa questo per i futuri deployment:

```bash
# Deploy completo (git pull + npm install + restart)
sudo /var/www/adsgmdr/sdarmitalia-server/deploy.sh

# Deploy senza npm install
sudo /var/www/adsgmdr/sdarmitalia-server/deploy.sh --no-install

# Solo restart PM2
sudo /var/www/adsgmdr/sdarmitalia-server/deploy.sh --restart-only

# Mostra log
sudo /var/www/adsgmdr/sdarmitalia-server/deploy.sh --logs

# Rollback ultimo commit
sudo /var/www/adsgmdr/sdarmitalia-server/deploy.sh --rollback
```

---

## 🔧 Comandi Comuni

### Monitoraggio

```bash
# Status dell'app
pm2 status

# Log in tempo reale
pm2 logs sdarmitalia-server --tail

# Statistiche
pm2 monit

# Status nginx
systemctl status nginx
tail -f /var/log/nginx/adsgmdr.it-error.log
```

### Restart

```bash
# Restart backend
pm2 restart sdarmitalia-server

# Restart nginx
sudo systemctl reload nginx

# Restart tutto
sudo /var/www/adsgmdr/sdarmitalia-server/deploy.sh --restart-only
```

### Logs

```bash
# Log backend
pm2 logs sdarmitalia-server

# Log nginx access
tail -f /var/log/nginx/adsgmdr.it-access.log

# Log nginx error
tail -f /var/log/nginx/adsgmdr.it-error.log

# Vedi tutto
pm2 logs sdarmitalia-server --lines 100
```

---

## 🐛 Troubleshooting Rapido

### ❌ "Port 5000 already in use"

```bash
lsof -i :5000 -t | xargs kill -9
pm2 restart sdarmitalia-server
```

### ❌ "502 Bad Gateway"

```bash
# Controlla se app è running
pm2 status

# Se no, riavvia
pm2 restart sdarmitalia-server

# Vedi errore
pm2 logs sdarmitalia-server
```

### ❌ "Cannot connect to MongoDB"

```bash
# Verifica MONGODB_URI
grep MONGODB_URI /var/www/adsgmdr/sdarmitalia-server/config.env

# Controlla whitelist IP in MongoDB Atlas
# https://cloud.mongodb.com/v2/{projectId}#security/network/access
```

### ❌ "Nginx 404 - Not Found"

```bash
# Controlla che frontend è stato buildato
ls -la /var/www/adsgmdr/frontend/

# Testa nginx config
sudo nginx -t

# Ricarica
sudo systemctl reload nginx
```

### ❌ "Cannot find module 'express-rate-limit'"

```bash
cd /var/www/adsgmdr/sdarmitalia-server
npm install express-rate-limit
pm2 restart sdarmitalia-server
```

Per altri problemi, vedi **DEPLOYMENT_GUIDE.md**.

---

## 🔐 Sicurezza

### ⚠️ IMPORTANTE: Variabili di Ambiente

**NEVER commit secrets to git!**

1. `config.env` è in `.gitignore` ✅
2. Usa solo `config.env.example` nel repo
3. Sul server copia da example e riempi manualmente
4. I secrets rimangono solo locali sul server

```bash
# ✅ Corretto - config.env locale, non in git
/var/www/adsgmdr/sdarmitalia-server/config.env  (ignorato da git)

# ❌ Sbagliato - mai committare secrets
git add config.env  (NO!)
git commit "Add secrets"  (NO!)
```

### Checklist Sicurezza

- [ ] HTTPS/SSL abilitato
- [ ] config.env è locale, non in git
- [ ] STRIPE_SECRET_KEY non è mai committato
- [ ] MongoDB Atlas ha IP whitelist
- [ ] Firewall blocca porte non necessarie

```bash
# Verifica HTTPS
curl -I https://adsgmdr.it/

# Verifica certificato
certbot certificates

# Controlla permessi config.env
ls -la /var/www/adsgmdr/sdarmitalia-server/config.env
# Deve essere: -rw------- (600)
```

---

## 📊 Architettura Finale

```
┌─────────────────────────────────────────────────────┐
│           ADSGMDR.IT (Domain)                       │
│         (https://adsgmdr.it)                        │
└──────────────────┬──────────────────────────────────┘
                   │ HTTPS (Port 443)
                   │
         ┌─────────▼──────────┐
         │   Nginx            │
         │ (Reverse Proxy)    │
         └─────────┬──────────┘
                   │
        ┌──────────┴──────────┐
        │                     │
    ┌───▼──────┐         ┌───▼─────────┐
    │ Frontend │         │   Backend   │
    │  React   │         │ Node.js:5000│
    │  Build   │         │  + PM2      │
    │          │         │             │
    │ /var/www/│         │ /var/www/   │
    │ adsgmdr/ │         │ adsgmdr/    │
    │ frontend │         │ sdarmitalia-│
    │          │         │ server      │
    └──────────┘         └───┬─────────┘
                              │
                        ┌─────▼──────┐
                        │  MongoDB   │
                        │  Atlas     │
                        │ (Cloud)    │
                        └────────────┘
```

---

## 📈 Performance Tips

```bash
# Abilita gzip compression
# Già configurato in nginx-config.conf ✅

# Cache busting per assets
# Già configurato (expires 365d) ✅

# PM2 cluster mode (opzionale)
pm2 start server.js -i max  # Usa tutti i cores

# Monitor resources
pm2 monit
```

---

## 🎯 Checklist Pre-Deployment

Prima di deployare, controlla:

- [ ] Code commits sono "puliti" (no secrets)
- [ ] config.env è compilato con dati reali
- [ ] MongoDB Atlas IP whitelist include server
- [ ] Stripe credentials sono corrette
- [ ] Certificato SSL è valido
- [ ] Nginx config passa il test (`nginx -t`)
- [ ] Front-end build è aggiornato
- [ ] Backend dipendenze sono installate

```bash
# Esegui il check automatico
sudo /var/www/adsgmdr/sdarmitalia-server/check-deployment.sh
```

---

## 📞 Supporto

Se hai problemi:

1. **Vedi i log:**

   ```bash
   pm2 logs sdarmitalia-server --lines 100
   tail -f /var/log/nginx/adsgmdr.it-error.log
   ```

2. **Controlla la configurazione:**

   ```bash
   sudo nginx -t
   pm2 status
   ```

3. **Leggi la guida completa:**
   ```
   DEPLOYMENT_GUIDE.md
   ```

---

## 📝 File di Reference

### Per Admin/DevOps

- Guida completa: `DEPLOYMENT_GUIDE.md`
- Pre-check script: `check-deployment.sh`
- Setup script: `setup-adsgmdr.sh`

### Per Developers

- API docs: `DONATIONS_DOCUMENTATION.md`
- Quick reference: `QUICK_REFERENCE.md`
- Setup code: `DONATIONS_SETUP.js`

### Per Deployment

- Quick setup: `QUICK_SETUP_ADSGMDR.md` (questo)
- Deploy script: `deploy.sh`
- Nginx config: `adsgmdr-nginx.conf`

---

## 🚀 Workflow Tipico

### Primo Deployment

```bash
# Sul server
sudo /var/www/adsgmdr/sdarmitalia-server/check-deployment.sh
sudo /var/www/adsgmdr/sdarmitalia-server/setup-adsgmdr.sh
```

### Futuri Deployment

```bash
# Dal tuo PC
git push origin main

# Sul server (opzione 1: manuale)
ssh root@adsgmdr.it
cd /var/www/adsgmdr/sdarmitalia-server
sudo ./deploy.sh

# Oppure (opzione 2: automatico via CI/CD)
# GitHub Actions / GitLab CI eseguono lo script
```

---

# Troubleshooting:

# Quando 2 app tentano di ascoltare nella stessa porta: 5000

ssh root@adsgmdr.it

# 1. Ferma adsgmdr-server (la vecchia)

pm2 stop adsgmdr-server
pm2 delete adsgmdr-server

# 2. Verifica che è cancellata

pm2 status

# Deve mostrare solo: sdarmitalia-server

# 3. Riavvia sdarmitalia-server

pm2 restart sdarmitalia-server

# 4. Verifica status

## pm2 status

ssh root@adsgmdr.it

# 1. Killare tutto

pm2 kill

# 2. Attendere

sleep 2

# 3. Naviga nella cartella giusta

cd /var/www/adsgmdr/sdarmitalia-server

# 4. Avvia CORRETTAMENTE

pm2 start server.js --name "sdarmitalia-server"

# 5. Verifica

pm2 status

# Deve mostrare: online ✅

# 6. Log

pm2 logs sdarmitalia-server --tail 10

# Deve mostrare: online ✅

**Versione:** 1.0  
**Data:** Gennaio 2026  
**Autore:** SDA Italia Dev Team  
**Status:** ✅ Production Ready
