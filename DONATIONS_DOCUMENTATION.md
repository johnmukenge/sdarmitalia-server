## 💝 Sistema di Donazioni - Documentazione Completa

### Indice

1. [Panoramica](#panoramica)
2. [Configurazione](#configurazione)
3. [API Endpoints](#api-endpoints)
4. [Sicurezza](#sicurezza)
5. [Webhook Stripe](#webhook-stripe)
6. [Testing](#testing)
7. [Deployment](#deployment)

---

## Panoramica

Il sistema di donazioni integra Stripe per elaborare pagamenti in modo sicuro. Le donazioni vengono salvate nel database MongoDB con tracciamento completo dello stato del pagamento.

### Caratteristiche Principali

✅ **Pagamenti sicuri** - Integrazione Stripe completa
✅ **Donazioni ricorrenti** - Supporto per abbonamenti mensili
✅ **Tracciamento IBAN** - Beneficiario configurabile
✅ **Rate limiting** - Protezione da abuso
✅ **Webhook** - Aggiornamento automatico dello stato
✅ **Statistiche** - Dashboard per monitorare donazioni
✅ **Anonimo** - Opzione per donazioni anonime
✅ **Ricevute** - Email di conferma opzionale

---

## Configurazione

### 1. Installare dipendenze

```bash
cd sdarmitalia-server
npm install stripe express-rate-limit
```

### 2. Configurare Stripe

1. Creare account su https://stripe.com
2. Andare a Dashboard > API Keys
3. Copiare **Secret Key** e **Public Key**
4. Creare un Webhook per `http://localhost:5000/api/donazioni/webhook`
5. Copiare il **Webhook Secret**

### 3. Impostare variabili di ambiente

Aprire `config.env` e aggiungere:

```env
# ===== STRIPE CONFIGURATION =====
STRIPE_SECRET_KEY=sk_test_51234567890abcdef...
STRIPE_PUBLIC_KEY=pk_test_1234567890abcdef...
STRIPE_WEBHOOK_SECRET=whsec_1234567890abcdef...

# ===== BENEFICIARY CONFIGURATION =====
BENEFICIARY_NAME=SDA ITALIA
BENEFICIARY_IBAN=IT60X0542811101000000123456
BENEFICIARY_BIC=BPPPIT2P
BENEFICIARY_EMAIL=pagamenti@sdarmitalia.it
BENEFICIARY_PHONE=+39-333-1234567

# ===== PAYMENT SECURITY =====
PAYMENT_RATE_LIMIT=10
CORS_ORIGINS=http://localhost:5173,http://localhost:3000,https://sdarmitalia.it
```

### 4. Setup Frontend

Nel componente `Donazioni.jsx`, aggiungere le chiavi Stripe:

```jsx
import { loadStripe } from '@stripe/js';
import { Elements } from '@stripe/react-stripe-js';

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY);

<Elements stripe={stripePromise}>
  <DonationForm />
</Elements>;
```

Nel file `.env.local`:

```
VITE_STRIPE_PUBLIC_KEY=pk_test_1234567890abcdef...
VITE_API_URL=http://localhost:5000
```

---

## API Endpoints

### 1. **Creare Payment Intent**

```http
POST /api/donazioni/create-payment-intent
Content-Type: application/json

{
  "importo": 50.00,                    // Importo in euro
  "email": "donor@example.com",        // Email valida (obbligatorio)
  "nome": "Mario Rossi",               // Nome completo 2-100 car (obbligatorio)
  "telefono": "+39-333-1234567",      // Opzionale
  "messaggio": "Per il progetto chiese",  // Max 500 car (opzionale)
  "anonimo": false,                    // Default false
  "categoria": "progetti",             // generale|chiesa|progetti|educazione|carità|missioni
  "ricevuta": true                     // Invia ricevuta email
}
```

**Risposta (200 OK)**

```json
{
  "success": true,
  "message": "Payment intent creato con successo",
  "clientSecret": "pi_1234567890_secret_abcdef",
  "paymentIntentId": "pi_1234567890",
  "donationId": "507f1f77bcf86cd799439011",
  "amount": "50.00",
  "currency": "EUR",
  "beneficiary": {
    "name": "SDA ITALIA",
    "iban": "****3456" // IBAN mascherato
  }
}
```

### 2. **Confermare Pagamento**

```http
POST /api/donazioni/confirm-payment
Content-Type: application/json

{
  "paymentIntentId": "pi_1234567890"
}
```

**Risposta (200 OK)**

```json
{
  "success": true,
  "message": "Donazione confermata",
  "donation": {
    "id": "507f1f77bcf86cd799439011",
    "amount": "50.00",
    "status": "completed",
    "recipientName": "Mario Rossi"
  }
}
```

### 3. **Ottenere Statistiche**

```http
GET /api/donazioni/stats
```

**Risposta (200 OK)**

```json
{
  "success": true,
  "data": {
    "totalDonations": 500000,
    "totalDonationsFormatted": "€5000.00",
    "donationCount": 45,
    "averageDonation": 11111,
    "averageDonationFormatted": "€111.11",
    "activeRecurring": 5,
    "failedPayments": 2,
    "byCategory": [
      {
        "category": "generale",
        "total": "€2500.00",
        "count": 20
      }
    ]
  }
}
```

### 4. **Ottenere Donazioni Recenti**

```http
GET /api/donazioni/recent?limit=10
```

**Risposta (200 OK)**

```json
{
  "success": true,
  "count": 10,
  "donations": [
    {
      "name": "Mario Rossi",
      "amount": "€50.00",
      "date": "08/01/2026",
      "category": "progetti"
    }
  ]
}
```

### 5. **Ottenere Info Beneficiario**

```http
GET /api/donazioni/beneficiary
```

**Risposta (200 OK)**

```json
{
  "success": true,
  "beneficiary": {
    "name": "SDA ITALIA",
    "iban": "****3456", // Mascherato per sicurezza
    "bic": "BPPPIT2P",
    "email": "pagamenti@sdarmitalia.it",
    "phone": "+39-333-1234567"
  }
}
```

---

## Sicurezza

### 🔒 Implementato:

1. **Rate Limiting**

   - Max 10 tentativi di pagamento per IP per ora
   - Protezione da brute force

2. **Validazione Input**

   - Email valida richiesta
   - Nome 2-100 caratteri
   - Importo minimo €0.01, massimo €100,000
   - Telefono in formato internazionale
   - Messaggio max 500 caratteri

3. **CORS Origin Validation**

   - Solo origini whitelisted possono fare richieste
   - Configurabile via `CORS_ORIGINS` in config.env

4. **Stripe Webhook Security**

   - Firma verificata con `stripe-signature` header
   - Raw body required per validazione

5. **Data Sanitization**

   - String trimmate
   - Email lowercase
   - Lunghezza massima rispettata
   - Rimozione caratteri pericolosi

6. **IBAN Masking**

   - Solo ultimi 4 caratteri visibili
   - IBAN completo mai trasmesso al client

7. **Encryption**
   - HTTPS obbligatorio in produzione
   - Dati carta elaborati solo da Stripe
   - Database MongoDB con SSL/TLS

### 🔐 Best Practices:

```javascript
// ❌ NON FARE:
- Salvare dati carta
- Loggare dati sensibili
- Esporre IBAN completo

// ✅ FARE:
- Usare sempre HTTPS
- Validare su client E server
- Loggare solo ID di pagamento
- Maskare IBAN/dati sensibili
```

---

## Webhook Stripe

### Setup Webhook

1. Stripe Dashboard > Webhooks
2. Aggiungere endpoint: `https://sdarmitalia.it/api/donazioni/webhook`
3. Selezionare eventi:

   - `payment_intent.succeeded`
   - `payment_intent.payment_failed`
   - `charge.refunded`

4. Copiare signing secret in `STRIPE_WEBHOOK_SECRET`

### Eventi Gestiti

#### 1. `payment_intent.succeeded`

- Marca donazione come "completed"
- Salva Stripe Charge ID
- Registra data pagamento
- ✅ Trigger per email di ringraziamento

#### 2. `payment_intent.payment_failed`

- Marca come "failed"
- Salva messaggio errore
- Incrementa contatore tentativi
- 📧 Trigger per notifica fallimento

#### 3. `charge.refunded`

- Marca donazione come "refunded"
- Salva motivo rimborso
- 💰 Trigger per notifica rimborso

### Testing Webhook

```bash
# Simulare evento di successo
stripe trigger payment_intent.succeeded

# Simulare evento di fallimento
stripe trigger payment_intent.payment_failed

# Visualizzare log
stripe logs tail
```

---

## Testing

### 1. Carte di test Stripe

```
Pagamento riuscito:
4242 4242 4242 4242
CVC: 123
Data: 12/25

Pagamento rifiutato:
4000 0000 0000 0002
CVC: 123
Data: 12/25

Autenticazione richiesta:
4000 0025 0000 3155
CVC: 123
Data: 12/25
```

### 2. Test Manuale

```bash
# 1. Avviare server
cd sdarmitalia-server
npm start

# 2. Avviare frontend
cd sdarmitalia
npm run dev

# 3. Navigare a http://localhost:5173/donazioni

# 4. Compilare form con:
Nome: Test User
Email: test@example.com
Importo: 10
Carta: 4242 4242 4242 4242

# 5. Controllare:
# - Database: donazione creata con status "processing"
# - Stripe Dashboard: Payment Intent creato
# - Webhook: Log di successo

# 6. Verificare donazione completata:
# - Status aggiornato a "completed"
# - Stripe Charge ID salvato
# - Data pagamento registrata
```

### 3. Test Automatico

```javascript
// test/donations.test.js
describe('Donation API', () => {
  it('should create payment intent', async () => {
    const res = await request(app)
      .post('/api/donazioni/create-payment-intent')
      .send({
        importo: 50,
        email: 'test@example.com',
        nome: 'Test User',
      });

    expect(res.status).toBe(200);
    expect(res.body.clientSecret).toBeDefined();
    expect(res.body.beneficiary.iban).toMatch(/\*\*\*\*/);
  });

  it('should validate email', async () => {
    const res = await request(app)
      .post('/api/donazioni/create-payment-intent')
      .send({
        importo: 50,
        email: 'invalid',
        nome: 'Test User',
      });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  it('should reject amount too low', async () => {
    const res = await request(app)
      .post('/api/donazioni/create-payment-intent')
      .send({
        importo: 0.001,
        email: 'test@example.com',
        nome: 'Test User',
      });

    expect(res.status).toBe(400);
  });
});
```

---

## Deployment

### 1. Stripe Live Keys

Una volta pronto per la produzione:

1. Attivare live mode su Stripe Dashboard
2. Ottenere **Live Secret Key** e **Live Public Key**
3. Aggiornare config.env (o env secrets su server)

### 2. Webhook in Produzione

1. Cambiare endpoint webhook da localhost a dominio reale
2. Ottenere nuovo Webhook Secret
3. Aggiornare `STRIPE_WEBHOOK_SECRET`

### 3. Variabili di Ambiente

```bash
# Production config.env
NODE_ENV=production
STRIPE_SECRET_KEY=sk_live_... # Live key
STRIPE_PUBLIC_KEY=pk_live_...
STRIPE_WEBHOOK_SECRET=whsec_live_...
CORS_ORIGINS=https://sdarmitalia.it,https://www.sdarmitalia.it
BENEFICIARY_NAME=SDA ITALIA
BENEFICIARY_IBAN=IT60X0542811101000000123456  # Live IBAN
```

### 4. HTTPS Obbligatorio

```javascript
// index.js
if (process.env.NODE_ENV === 'production') {
  // Reindirizzare HTTP a HTTPS
  app.use((req, res, next) => {
    if (req.header('x-forwarded-proto') !== 'https') {
      res.redirect(`https://${req.header('host')}${req.url}`);
    } else {
      next();
    }
  });
}
```

### 5. Monitoraggio

```bash
# Controllare log webhook
curl -H "Authorization: Bearer sk_test_..." \
  https://api.stripe.com/v1/events

# Ricevere alertsStripe Dashboard > Account Settings > Alerts

# Monitorare database
db.donazioni.find({ status: 'failed' })
```

---

## Guida Rapida Clienti

### Per donare:

1. ✅ Cliccare "Dona"
2. ✅ Inserire importo (min €0.01)
3. ✅ Compilare dati personali
4. ✅ Inserire dati carta
5. ✅ Cliccare "Dona €XX.XX"
6. ✅ Riceverai email di conferma (se richiesta)

### Per visualizzare:

- Statistiche donazioni: `/api/donazioni/stats`
- Ultimi donatori: `/api/donazioni/recent`
- Info beneficiario: `/api/donazioni/beneficiary`

---

## Support & FAQ

### D: Come cambio l'IBAN beneficiario?

**R:** Modifica `BENEFICIARY_IBAN` in config.env e rideploy

### D: Posso avere donazioni ricorrenti?

**R:** Sì! Il modello supporta `tipo: 'ricorrente'` con `recurringDetails`

### D: I dati della carta sono al sicuro?

**R:** Sì, Stripe gestisce tutto. Noi non salvamo mai i dati della carta

### D: Come rimborso una donazione?

**R:** Usa Stripe Dashboard > Charges > Refund
Il nostro webhook aggiornerà automaticamente lo stato

### D: Posso avere il PDF ricevuta?

**R:** Stripe invia automaticamente via email se ricevuta=true

---

**Documento creato:** 08/01/2026
**Versione:** 1.0
**Ultima modifica:** 08/01/2026
