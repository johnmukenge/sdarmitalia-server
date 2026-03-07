# 🚀 GUIDA RAPIDA - Comandi Pronti all'Uso

## ⚡ Setup Iniziale (Da Fare Una Sola Volta)

### 1. Risolvi Connessione MongoDB Atlas
```bash
# 1. Vai su https://cloud.mongodb.com/
# 2. Network Access → ADD IP ADDRESS
# 3. Aggiungi 0.0.0.0/0 (per sviluppo) o il tuo IP
# 4. Attendi 2-3 minuti
```

### 2. Importa i Documenti nel Database
```bash
cd sdarmitalia-server
node seed-biblioteca-documenti.js
```

**Output Atteso:**
```
✅ DB connection successful!
📚 Inizio importazione documenti nella Biblioteca Digitale...
🗑️  Rimossi X documenti esistenti (lezionari e settimane)
✅ 6 documenti importati con successo!

📊 Riepilogo:
   - Lezionari: 5
   - Settimane di Preghiera: 1
   - Featured: 3

🎉 Importazione completata!
```

---

## 🧪 Test API (Copia-Incolla)

### Avvia Server
```bash
cd sdarmitalia-server
npm run dev
```

### Test Rapidi (Copia uno alla volta)

```bash
# 1. Tutti i lezionari
curl http://localhost:5000/api/v1/libri/lezionari

# 2. Lezionari 2026
curl http://localhost:5000/api/v1/libri/lezionari?anno=2026

# 3. Lezionario Q1 2026 (più recente)
curl http://localhost:5000/api/v1/libri/lezionari?anno=2026&trimestre=1

# 4. Settimana Preghiera 2025
curl http://localhost:5000/api/v1/libri/settimane-preghiera?anno=2025

# 5. Anni disponibili
curl http://localhost:5000/api/v1/libri/anni-disponibili

# 6. Statistiche biblioteca (include lezionari)
curl http://localhost:5000/api/v1/libri/stats

# 7. Tutti i libri (include lezionari)
curl http://localhost:5000/api/v1/libri

# 8. Solo categoria lezionario
curl http://localhost:5000/api/v1/libri?category=lezionario

# 9. Ricerca full-text
curl http://localhost:5000/api/v1/libri/search?q=lezionario+2026
```

### Test Completo Automatico (con jq)
```bash
cd sdarmitalia-server
./test-lezionari-api.sh
```

---

## 📊 Query Utili con jq (Output Formattato)

```bash
# Titoli di tutti i lezionari
curl -s http://localhost:5000/api/v1/libri/lezionari | jq '.data.lezionari[].title'

# Lezionario Q1 2026 con dettagli
curl -s http://localhost:5000/api/v1/libri/lezionari?anno=2026&trimestre=1 | jq '.data.lezionari[] | {title, anno, trimestre, downloads, views}'

# Lista anni
curl -s http://localhost:5000/api/v1/libri/anni-disponibili | jq '.data.anni'

# Statistiche per categoria
curl -s http://localhost:5000/api/v1/libri/stats | jq '.data.byCategory'

# Featured lezionari
curl -s http://localhost:5000/api/v1/libri/lezionari | jq '.data.lezionari[] | select(.featured == true) | {title, anno, trimestre}'

# Top 3 più scaricati
curl -s http://localhost:5000/api/v1/libri?category=lezionario&sort=-downloads&limit=3 | jq '.data.libri[] | {title, downloads}'
```

---

## 🔧 Comandi Manutenzione

### Reimporta Documenti
```bash
cd sdarmitalia-server
node seed-biblioteca-documenti.js
```

### Rimuovi Solo Lezionari e Settimane
```bash
cd sdarmitalia-server
node seed-biblioteca-documenti.js --delete
```

### Verifica Connessione MongoDB
```bash
node -e "const mongoose = require('mongoose'); require('dotenv').config({ path: './config.env' }); const DB = process.env.DATABASE.replace('<PASSWORD>', process.env.DATABASE_PASSWORD); mongoose.connect(DB).then(() => { console.log('✅ Connected!'); process.exit(0); }).catch(err => { console.error('❌ Failed:', err.message); process.exit(1); });"
```

---

## 🗄️ Query MongoDB Dirette

```bash
# Apri MongoDB Shell
mongosh "mongodb+srv://cluster0.xxxxx.mongodb.net/adsgmdr" --apiVersion 1 --username YOUR_USERNAME

# Nel mongo shell:
use adsgmdr

# Conta lezionari
db.libri.countDocuments({ category: "lezionario" })

# Lista lezionari 2026
db.libri.find({ category: "lezionario", anno: 2026 }).pretty()

# Settimane di preghiera
db.libri.find({ category: "settimana_preghiera" }).pretty()

# Lezionario più scaricato
db.libri.find({ category: "lezionario" }).sort({ downloads: -1 }).limit(1).pretty()

# Update manuale downloads (esempio)
db.libri.updateOne(
  { title: "Lezionario Biblico - Primo Trimestre 2026" },
  { $inc: { downloads: 100, views: 50 } }
)

# Aggiungi cover image
db.libri.updateOne(
  { title: "Lezionario Biblico - Primo Trimestre 2026" },
  { $set: { cover: "https://example.com/cover.jpg" } }
)
```

---

## 📝 Comandi Git (Per Committare)

```bash
cd sdarmitalia-server

# Verifica modifiche
git status

# Aggiungi file modificati
git add models/libriModel.js
git add controller/libriController.js
git add routes/libriRoutes.js
git add seed-biblioteca-documenti.js
git add *.md

# Commit
git commit -m "feat: Integra Lezionari e Settimane Preghiera nella Biblioteca Digitale

- Aggiunte categorie lezionario e settimana_preghiera al modello Libro
- Aggiunti campi anno e trimestre con validazioni
- Nuovi endpoint API per filtri specifici (anno/trimestre)
- Script di seed per importare 6 documenti dalla cartella /documents
- Documentazione completa e script di test"

# Push
git push origin main
```

---

## 🐛 Troubleshooting Rapido

### Problema: "Cannot connect to MongoDB"
```bash
# Soluzione: Whitelist IP su Atlas
# 1. https://cloud.mongodb.com/
# 2. Network Access → ADD IP ADDRESS → 0.0.0.0/0
# 3. Attendi 2-3 minuti
```

### Problema: "Collection not found"
```bash
# Soluzione: Importa i dati
cd sdarmitalia-server
node seed-biblioteca-documenti.js
```

### Problema: "Port 5000 already in use"
```bash
# Trova processo sulla porta 5000
lsof -ti:5000

# Killalo
kill -9 $(lsof -ti:5000)

# O usa porta diversa
PORT=5001 npm run dev
```

### Problema: "Module not found"
```bash
# Reinstalla dipendenze
cd sdarmitalia-server
rm -rf node_modules package-lock.json
npm install
```

### Problema: "Validation error: Anno is required"
```bash
# I lezionari e settimane DEVONO avere anno
# Usa lo script di seed che lo fa automaticamente
node seed-biblioteca-documenti.js
```

---

## 📦 Package.json Scripts (Aggiungi se mancano)

Aggiungi questi script in `sdarmitalia-server/package.json`:

```json
{
  "scripts": {
    "dev": "nodemon server.js",
    "start": "node server.js",
    "seed:libri": "node seed-biblioteca-documenti.js",
    "seed:delete": "node seed-biblioteca-documenti.js --delete",
    "test:api": "./test-lezionari-api.sh"
  }
}
```

Uso:
```bash
npm run dev              # Avvia server in modalità sviluppo
npm start                # Avvia server in produzione
npm run seed:libri       # Importa lezionari nel DB
npm run seed:delete      # Rimuovi lezionari dal DB
npm run test:api         # Test API automatico
```

---

## 🎯 Checklist Deployment

Prima di deployare in produzione:

```bash
# 1. Test locale
cd sdarmitalia-server
npm run dev

# 2. Importa dati
npm run seed:libri

# 3. Test API
npm run test:api

# 4. Verifica errori
npm run lint  # se hai eslint

# 5. Build (se necessario)
npm run build

# 6. Commit
git add .
git commit -m "feat: Lezionari in Biblioteca Digitale"
git push

# 7. Deploy su server produzione
ssh user@server
cd /var/www/sdarmitalia-server
git pull
npm install
npm run seed:libri
pm2 restart server
```

---

## 🔑 Variabili Ambiente (.env)

Verifica che `config.env` contenga:

```env
DATABASE=mongodb+srv://cluster0.xxxxx.mongodb.net/adsgmdr
DATABASE_PASSWORD=your_password
PORT=5000
NODE_ENV=development
```

---

## 📱 Test Frontend (Quando integri)

```bash
cd sdarmitalia  # frontend folder

# Crea pagina Lezionari
# Copia da FRONTEND_LEZIONARI.md

# Test in dev
npm run dev

# Verifica:
# http://localhost:3000/biblioteca/lezionari
```

---

## 💾 Backup Database

```bash
# Backup completo
mongodump --uri="mongodb+srv://USER:PASS@cluster0.xxxxx.mongodb.net/adsgmdr" --out=./backup

# Backup solo collection libri
mongodump --uri="mongodb+srv://USER:PASS@cluster0.xxxxx.mongodb.net/adsgmdr" --collection=libri --out=./backup

# Restore
mongorestore --uri="mongodb+srv://USER:PASS@cluster0.xxxxx.mongodb.net/adsgmdr" ./backup/adsgmdr
```

---

## 🆘 Link Utili

- **MongoDB Atlas**: https://cloud.mongodb.com/
- **Documentazione Completa**: `LEZIONARI_BIBLIOTECA_INTEGRAZIONE.md`
- **Frontend Examples**: `FRONTEND_LEZIONARI.md`
- **Riepilogo**: `RIEPILOGO_LEZIONARI.md`
- **IP Whitelist**: `MONGODB_IP_WHITELIST.md`

---

**✅ Copia-incolla i comandi e sei pronto!**
