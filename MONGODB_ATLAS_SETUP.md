/\*\*

- @file MONGODB_ATLAS_SETUP.md
- @description Guida completa per configurare MongoDB Atlas
- @version 1.0
- @author SDA Italia Dev Team
- @language it
  \*/

# Guida MongoDB Atlas - Setup Completo

## 📋 Indice

1. [Creazione Account](#creazione-account)
2. [Creazione Cluster](#creazione-cluster)
3. [Configurazione Accesso](#configurazione-accesso)
4. [Connection String](#connection-string)
5. [Esecuzione Script Seed](#esecuzione-script-seed)
6. [Testing](#testing)
7. [Troubleshooting](#troubleshooting)

---

## 🎯 Creazione Account

### Step 1: Registrazione

1. Vai su https://www.mongodb.com/cloud/atlas
2. Clicca **"Try Free"** (gratuito)
3. Scegli una opzione di registrazione:
   - Email personale
   - GitHub
   - Google
4. Accetta i termini di servizio
5. Clicca **"Create your MongoDB Account"**

### Step 2: Verifica Email

1. Controlla la tua email (inbox o spam)
2. Clicca il link di verifica
3. Accedi a MongoDB Atlas

### Step 3: Completamento Profilo

1. **Nome Completo**: Inserisci il tuo nome
2. **Company Name**: "SDA Italia" (opzionale)
3. **Type of work**: Seleziona "Building a new application"
4. **Preferred Language**: Scegli l'italiano o inglese
5. Accetto le **privacy policy**
6. Clicca **"Finish"**

---

## 🗂️ Creazione Cluster

### Step 1: Crea il Primo Cluster

1. Dalla dashboard, clicca **"Create"** (o il pulsante verde)
2. Scegli **"Shared"** (gratuito - perfetto per testing)

### Step 2: Configurazione Cluster

**Impostazioni di base:**

- **Cloud Provider**: AWS (predefinito - va bene)
- **Region**: Scegli la più vicina:
  - 🇮🇹 **Europe (Milan)** - `eu-south-1` (MIGLIORE per Italia)
  - 🇪🇺 **Europe (Ireland)** - `eu-west-1`
  - 🇬🇧 **Europe (London)** - `eu-west-2`

**Nome del Cluster:**

```
sdarmitalia-cluster (cluster0)
```

### Step 3: Crea il Cluster

1. Clicca **"Create Deployment"**
2. Aspetta il completamento (~5-10 minuti)
3. Vedrai lo stato: "Creating" → "Active" ✓

### Step 4: Attendi il Provisioning

Mentre il cluster si crea, puoi procedere con i prossimi step. Riceverai un'email quando è pronto.

---

## 🔐 Configurazione Accesso

### Step 1: Crea Utente Database

1. Vai a **"Database Access"** (menu a sinistra)
2. Clicca **"Add New Database User"**
3. Compila i dati:

```
Username: sdaadmin
Password: (genera una password sicura)
```

**Opzioni di Autenticazione:**

- ✅ Seleziona "Password"
- Clicca **"Autogenerate Secure Password"** (consigliato)
- **COPIA la password e salvala da qualche parte!**

**Database User Privileges:**

- Seleziona **"Built-in Role"** → **"Atlas admin"**

4. Clicca **"Add User"**

**IMPORTANTE**: Salva questa password in un luogo sicuro!

```
Username: sdaadmin
Password: [LA_TUA_PASSWORD_GENERATA]
```

### Step 2: Configura IP Whitelist

1. Vai a **"Network Access"** (menu a sinistra)
2. Clicca **"Add IP Address"**

**Opzioni:**

- **Sviluppo locale**:

  - Clicca **"Add My Current IP Address"**
  - Oppure aggiungi `127.0.0.1`

- **Accesso da ovunque** (meno sicuro, solo per testing):
  - Aggiungi `0.0.0.0/0` (accesso da qualsiasi IP)
  - ⚠️ **Non raccomandato in produzione!**

3. Clicca **"Confirm"**

```
Opzioni IP:
✅ 127.0.0.1 - Solo localhost
✅ 192.168.x.x - Rete locale
✅ 0.0.0.0/0 - Da qualsiasi IP (testing)
```

---

## 🔗 Connection String

### Step 1: Ottieni la Connection String

1. Vai a **"Deployment"** (Database)
2. Clicca il pulsante **"Connect"**
3. Seleziona **"Drivers"**
4. Scegli **"Node.js"** come driver
5. Copia la connection string:

```
mongodb+srv://sdaadmin:<password>@sdarmitalia-cluster.xxxxx.mongodb.net/?retryWrites=true&w=majority
```

### Step 2: Compila i Dati

Sostituisci i placeholder:

- `<password>` → La password che hai salvato
- `xxxxx` → I caratteri del tuo cluster (già compilati)

**Esempio completo:**

```
mongodb+srv://sdaadmin:MySecurePassword123!@sdarmitalia-cluster.abcde.mongodb.net/?retryWrites=true&w=majority
```

### Step 3: Aggiungi Nome Database

La connection string di default usa `test`. Aggiungi il nome del database:

```
mongodb+srv://sdaadmin:MySecurePassword123!@sdarmitalia-cluster.abcde.mongodb.net/sdarmitalia?retryWrites=true&w=majority
```

### Step 4: Aggiungi a config.env

Apri il file `config.env`:

```bash
NODE_ENV=development
PORT=5000
MONGODB_URI=mongodb+srv://sdaadmin:MySecurePassword123!@sdarmitalia-cluster.abcde.mongodb.net/sdarmitalia?retryWrites=true&w=majority
```

**Variabili opzionali** (aggiungile se usi i servizi):

```bash
STRIPE_SECRET_KEY=sk_test_...
STRIPE_PUBLIC_KEY=pk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
```

---

## 🌱 Esecuzione Script Seed

### Step 1: Verifica Connection

Prima di eseguire lo script, testa la connessione:

```bash
cd c:\projects\personal\sdarmitalia-server
npm test
# Oppure:
node -e "require('./config/database').connect().then(() => console.log('✓ Connesso a Atlas')).catch(e => console.error('✗ Errore:', e.message))"
```

### Step 2: Esegui lo Script Seed

```bash
node scripts/seed.js
```

**Output atteso:**

```
✓ Connected to MongoDB Atlas
✓ Dropped existing collections
✓ Created 10 news articles
✓ Created 5 contacts
✓ Created 8 events
✓ Created 20 books (Libri)
✓ Created 15 donations
✓ Seeded database successfully!

Database: sdarmitalia
Collections created: 5
Documents created: 58
```

### Step 3: Verifica i Dati

Accedi a MongoDB Atlas per visualizzare i dati:

1. Vai a **"Deployment"** → **"Browse Collections"**
2. Seleziona il database `sdarmitalia`
3. Naviga tra le collezioni:
   - news
   - contacts
   - events
   - libri
   - donazioni

---

## 🧪 Testing Applicativo

### Test 1: Start Server

```bash
npm run dev
# Oppure:
npm start
```

**Output atteso:**

```
✓ MongoDB Connected Successfully
  Database: sdarmitalia
  Host: sdarmitalia-cluster.abcde.mongodb.net
  Environment: development

Server running on port 5000
```

### Test 2: API Endpoints

Usa **Postman** o **cURL** per testare:

**Ottenere tutte le notizie:**

```bash
curl http://localhost:5000/api/v1/news
```

**Ottenere articoli pubblicati:**

```bash
curl http://localhost:5000/api/v1/news?status=published
```

**Cercare libri:**

```bash
curl "http://localhost:5000/api/v1/libri?search=bibbia"
```

**Ottenere statistiche donazioni:**

```bash
curl http://localhost:5000/api/v1/donazioni/stats
```

---

## 🐛 Troubleshooting

### Errore: "connect ECONNREFUSED"

**Causa**: MongoDB non raggiungibile
**Soluzione**:

1. Verifica la connection string in `config.env`
2. Verifica che il cluster sia "Active" in Atlas
3. Verifica che il tuo IP sia nella whitelist
4. Controlla che la password sia corretta

### Errore: "authentication failed"

**Causa**: Credenziali sbagliate
**Soluzione**:

1. Vai a **Database Access** in Atlas
2. Reset la password dell'utente
3. Usa la nuova password nella connection string

### Errore: "Timeout connecting to server"

**Causa**: Network issue
**Soluzione**:

1. Verifica la connessione internet
2. Aggiungi il tuo IP a Network Access
3. Controlla il firewall

### Errore: "Command create requires authentication"

**Causa**: Connection string non include le credenziali
**Soluzione**:

1. Usa il formato completo con username e password
2. Assicurati che la password sia URL-encoded se contiene caratteri speciali

---

## 🔒 Sicurezza

### Best Practices

- ✅ **Password complessa**: Almeno 12 caratteri, numeri, simboli
- ✅ **IP Whitelist**: Limita a IP specifici in produzione
- ✅ **Credenziali in .env**: Non commitare config.env su Git
- ✅ **Backup**: Atlas fa backup automatici
- ✅ **2FA**: Abilita two-factor authentication sul tuo account

### File .gitignore

Assicurati che `config.env` sia nel `.gitignore`:

```
config.env
.env
.env.local
```

---

## 📊 Monitoraggio

### Monitoraggio Atlas

1. Vai a **"Monitoring"** nel menu
2. Vedi statistiche real-time:
   - Operazioni al secondo
   - Storage utilizzato
   - Connessioni attive
   - Latenza queries

### Logs

1. Vai a **"Deployment"** → **"Logs"**
2. Filtra per:
   - Log Level
   - Type (Replica Set, Mongod, etc.)
   - Host

---

## 💡 Tips & Tricks

### Creare Backup

```bash
# Atlas fa backup automatici ogni 6 ore (piano gratuito)
# Piano Pro: backup ogni ora
# Non necessaria azione manuale
```

### Reset Database Completamente

```bash
node scripts/seed.js --reset
# Oppure elimina tutti i documenti da Atlas UI
```

### Esportare Dati

Da Atlas UI: **Deployment** → **Tools** → **Export Data**

### Importare Dati

Da Atlas UI: **Deployment** → **Tools** → **Import Data**

---

## 📞 Supporto

- **MongoDB Docs**: https://docs.mongodb.com/atlas/
- **Community**: https://community.mongodb.com/
- **Atlas Help**: https://www.mongodb.com/support

---

**Configurazione completata! ✅**

Ora sei pronto per:

1. ✅ Eseguire lo script seed
2. ✅ Testare l'applicazione in locale
3. ✅ Sviluppare i controller e route
4. ✅ Deploy in produzione quando pronto
