## 💝 Sistema di Donazioni - Setup Rapido (5 minuti)

### ⚡ Prerequisiti

- [ ] Account Stripe (gratuito: https://stripe.com)
- [ ] Node.js installato
- [ ] MongoDB Atlas connesso
- [ ] Server backend avviato

---

## Step 1️⃣: Ottenere Credenziali Stripe (2 min)

1. Accedi a https://dashboard.stripe.com
2. Clicca **Developers** nel menu a sinistra
3. Clicca **API Keys**
4. Copia questi due valori:
   - **Secret Key** (inizia con `sk_test_`)
   - **Publishable Key** (inizia con `pk_test_`)

---

## Step 2️⃣: Aggiornare config.env (1 min)

Apri `sdarmitalia-server/config.env` e aggiungi:

```env
# STRIPE - Incolla le chiavi ottenute sopra
STRIPE_SECRET_KEY=sk_test_INCOLLA_QUI_tua_secret_key
STRIPE_PUBLIC_KEY=pk_test_INCOLLA_QUI_tua_public_key
STRIPE_WEBHOOK_SECRET=whsec_test_1234567890  # Per ora lascia così

# Beneficiario (personalizza se necessario)
BENEFICIARY_NAME=SDA ITALIA
BENEFICIARY_IBAN=IT60X0542811101000000123456
BENEFICIARY_BIC=BPPPIT2P
BENEFICIARY_EMAIL=pagamenti@sdarmitalia.it
BENEFICIARY_PHONE=+39-333-1234567

# Sicurezza
PAYMENT_RATE_LIMIT=10
CORS_ORIGINS=http://localhost:5173,http://localhost:3000
```

---

## Step 3️⃣: Installare Librerie (1 min)

```bash
cd sdarmitalia-server
npm install stripe express-rate-limit
```

---

## Step 4️⃣: Avviare il Server (1 min)

```bash
npm start
```

Dovresti vedere:

```
✅ MongoDB connected
🚀 Server is running on port 5000
```

---

## Step 5️⃣: Testare Donazione (1 min)

1. Apri http://localhost:5173/donazioni
2. Clicca il pulsante "Dona"
3. Compila il form:

   - **Nome:** Mario Rossi
   - **Email:** mario@example.com
   - **Importo:** 10.00

4. Dati della carta (CARD TEST DI STRIPE):

   - **Numero:** 4242 4242 4242 4242
   - **Scadenza:** 12/25
   - **CVC:** 123

5. Clicca **Dona €10.00**

### ✅ Se tutto va bene vedrai:

- ✅ Payment Intent creato
- ✅ Pagamento elaborato
- ✅ Messaggio di successo
- ✅ Donazione nel database

### ❌ Se ricevi errore:

- Verifica STRIPE_SECRET_KEY in config.env
- Verifica che il server è avviato (porta 5000)
- Controlla browser console (F12) per errori

---

## 🔗 URL Importanti

| Descrizione        | URL                                    |
| ------------------ | -------------------------------------- |
| Stripe Dashboard   | https://dashboard.stripe.com           |
| API Keys           | https://dashboard.stripe.com/apikeys   |
| Test Transactions  | https://dashboard.stripe.com/payments  |
| Webhooks           | https://dashboard.stripe.com/webhooks  |
| Frontend Donazioni | http://localhost:5173/donazioni        |
| API Endpoints      | http://localhost:5000/api/donazioni/\* |

---

## 📊 Verificare i Dati

### Nel Database

```bash
# Apri MongoDB e esegui:
use sdarmitalia
db.donazioni.find()
# Dovresti vedere la tua donazione di test
```

### In Stripe Dashboard

1. Vai su **Payments**
2. Dovresti vedere transazione "succeeded"
3. Importo: €10.00
4. Cliente: mario@example.com

---

## 🧪 Altre Carte di Test

Stripe fornisce diverse carte per simulare scenari:

```
💳 Pagamento Riuscito
4242 4242 4242 4242

❌ Pagamento Rifiutato
4000 0000 0000 0002

🔐 Autenticazione Richiesta (3D Secure)
4000 0025 0000 3155

💳 Numero Scaduto
4000 0000 0000 0069
```

Tutti: Data: 12/25, CVC: 123

---

## 🚨 Problemi Comuni

### ❌ "Invalid API Key"

**Soluzione:** Verifica di aver copiato esattamente STRIPE_SECRET_KEY da Stripe Dashboard

### ❌ "CORS error"

**Soluzione:** Assicurati che http://localhost:5173 sia in CORS_ORIGINS

### ❌ "Cannot POST /api/donazioni/create-payment-intent"

**Soluzione:**

1. Verifica server è avviato (npm start)
2. Verifica porta 5000 non è occupata
3. Controlla che le route siano registrate in index.js

### ❌ "Webhook secret invalid"

**Soluzione:** Per il testing locale, puoi lasciare il valore di default. Lo configurerai quando crei il webhook vero in Stripe Dashboard.

---

## 📖 Documentazione Completa

Per dettagli approfonditi, vedi:

- **DONATIONS_DOCUMENTATION.md** - Guida completa API
- **DONATIONS_SETUP.js** - Setup dettagliato passo-passo
- **DEPLOYMENT_CHECKLIST.html** - Checklist deployment

---

## ✨ Prossimi Passi (Opzionali)

### Configurare Webhook Stripe (per production)

1. Stripe Dashboard > Developers > Webhooks
2. Click "Add endpoint"
3. URL: `https://tuodominio.com/api/donazioni/webhook`
4. Seleziona eventi:
   - `payment_intent.succeeded`
   - `payment_intent.payment_failed`
   - `charge.refunded`
5. Copia il Signing Secret e aggiorna STRIPE_WEBHOOK_SECRET in config.env

### Configurare Email Notifiche

1. Aggiungere nodemailer al progetto
2. Modificare webhook handler per inviare email
3. Configurare transporter email (Gmail, SendGrid, etc.)

### Setup Dashboard Admin

Crea pagina admin per monitorare donazioni:

- Elenco donazioni
- Statistiche per categoria
- Filtri per data/status
- Esporta in CSV

---

## 🎯 Success! 🎉

Se sei qui e il test è passato, il sistema di donazioni è **OPERATIVO**!

Puoi ora:

- ✅ Accettare donazioni reali (con live keys)
- ✅ Monitorare statistiche
- ✅ Gestire webhook
- ✅ Inviare ricevute
- ✅ Tracciare IBAN beneficiario

**Domande?** Vedi DONATIONS_DOCUMENTATION.md

---

**Documento creato:** 08/01/2026
**Tempo setup:** ~5 minuti
**Difficulty:** Easy ⭐
