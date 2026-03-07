
# 📚 Sistema di Gestione Documenti - Documentazione Completa

## 📋 Panoramica

Sistema completo per la gestione di documenti digitali (Lezionari, Settimane di Preghiera, Guide di Studio, etc.) con:
- **Persistenza dati** in MongoDB
- **Tracciamento automatico** di downloads e views
- **Categorizzazione avanzata** per tipo, anno, trimestre
- **API RESTful** completa
- **Script di gestione** per import e aggiornamenti

## 🎯 Funzionalità Implementate

### 1. Modello Dati (MongoDB)

Schema completo con i seguenti campi:

```javascript
{
  titolo: String,              // Titolo documento (required)
  descrizione: String,         // Descrizione (optional)
  tipo: String,                // 'lezionario', 'settimana_preghiera', etc.
  anno: Number,                // Anno (required)
  trimestre: Number,           // 1-4 (required solo per lezionari)
  lingua: String,              // 'it', 'en', etc. (default: 'it')
  filePath: String,            // Percorso file PDF (required)
  fileUrl: String,             // URL esterno (optional)
  fileSize: Number,            // Dimensione in bytes
  pagine: Number,              // Numero pagine
  copertina: String,           // URL immagine copertina
  tags: [String],              // Tag per ricerca
  autore: String,              // Autore/Creatore
  editore: String,             // Editore (default: 'SDA Italia')
  dataPubblicazione: Date,     // Data pubblicazione
  versione: String,            // Versione documento
  downloads: Number,           // Contatore download (auto)
  views: Number,               // Contatore views (auto)
  inEvidenza: Boolean,         // Featured document
  status: String,              // 'draft', 'published', 'archived'
  isPublic: Boolean,           // Pubblico o riservato
  createdAt: Date,             // Timestamp creazione
  updatedAt: Date              // Timestamp aggiornamento
}
```

### 2. Tipi di Documenti Supportati

- `lezionario` - Lezionari della Scuola del Sabato (con trimestre)
- `settimana_preghiera` - Settimane di Preghiera
- `guida_studio` - Guide di Studio Biblico
- `materiale_evangelismo` - Materiale per Evangelismo
- `rivista` - Riviste e Pubblicazioni
- `bollettino` - Bollettini Informativi
- `altro` - Altri tipi di documenti

### 3. Incremento Automatico

#### Views (Visualizzazioni)
Quando un documento viene visualizzato tramite `GET /api/v1/documenti/:id`, le views si incrementano automaticamente:

```javascript
const documento = await Documento.findByIdAndUpdate(
  req.params.id,
  { $inc: { views: 1 } },
  { new: true, runValidators: false }
);
```

#### Downloads (Scaricamenti)
Quando un documento viene scaricato tramite `POST /api/v1/documenti/:id/download`, i downloads si incrementano automaticamente:

```javascript
const documento = await Documento.findByIdAndUpdate(
  req.params.id,
  { $inc: { downloads: 1 } },
  { new: true, runValidators: false }
);
```

## 📡 Endpoints API

### Documenti Generali

#### GET /api/v1/documenti
Recupera tutti i documenti con filtri, ordinamento e paginazione.

**Query Parameters:**
- `page` - Numero pagina (default: 1)
- `limit` - Documenti per pagina (default: 10)
- `tipo` - Filtra per tipo
- `anno` - Filtra per anno
- `trimestre` - Filtra per trimestre
- `sort` - Ordinamento (es: `-downloads`)

**Esempio:**
```bash
GET /api/v1/documenti?tipo=lezionario&anno=2026&limit=10
```

**Risposta:**
```json
{
  "status": "success",
  "results": 4,
  "data": {
    "documenti": [...]
  }
}
```

#### GET /api/v1/documenti/:id
Recupera un singolo documento per ID. **Incrementa automaticamente le views.**

**Esempio:**
```bash
GET /api/v1/documenti/507f1f77bcf86cd799439011
```

**Risposta:**
```json
{
  "status": "success",
  "data": {
    "documento": {
      "_id": "507f1f77bcf86cd799439011",
      "titolo": "Lezionario del 1° Trimestre 2026",
      "tipo": "lezionario",
      "anno": 2026,
      "trimestre": 1,
      "views": 142,
      "downloads": 89,
      ...
    }
  }
}
```

### Lezionari

#### GET /api/v1/documenti/lezionari
Recupera lezionari filtrati per anno e trimestre.

**Query Parameters:**
- `anno` - Anno (required)
- `trimestre` - Trimestre 1-4 (optional)

**Esempi:**
```bash
# Tutti i lezionari del 2026
GET /api/v1/documenti/lezionari?anno=2026

# Solo Q1 2026
GET /api/v1/documenti/lezionari?anno=2026&trimestre=1
```

**Risposta:**
```json
{
  "status": "success",
  "results": 4,
  "data": {
    "lezionari": [
      {
        "titolo": "Lezionario del 1° Trimestre 2026",
        "anno": 2026,
        "trimestre": 1,
        "filePath": "/documents/Lezionario-1-2026.pdf",
        ...
      },
      ...
    ]
  }
}
```

### Settimane di Preghiera

#### GET /api/v1/documenti/settimane-preghiera
Recupera settimane di preghiera per anno.

**Query Parameters:**
- `anno` - Anno (required)

**Esempio:**
```bash
GET /api/v1/documenti/settimane-preghiera?anno=2025
```

**Risposta:**
```json
{
  "status": "success",
  "results": 1,
  "data": {
    "settimane": [
      {
        "titolo": "Settimana di Preghiera Speciale 2025",
        "anno": 2025,
        "tipo": "settimana_preghiera",
        ...
      }
    ]
  }
}
```

### Filtri e Ricerca

#### GET /api/v1/documenti/tipo/:tipo
Recupera documenti per tipo specifico.

**Parametri:**
- `:tipo` - Tipo documento (lezionario, settimana_preghiera, etc.)

**Query:**
- `limit` - Numero risultati (default: 20)

**Esempio:**
```bash
GET /api/v1/documenti/tipo/guida_studio?limit=10
```

#### GET /api/v1/documenti/in-evidenza
Recupera documenti in evidenza.

**Query:**
- `limit` - Numero risultati (default: 6)

**Esempio:**
```bash
GET /api/v1/documenti/in-evidenza?limit=6
```

#### GET /api/v1/documenti/top-downloads
Recupera i documenti più scaricati.

**Query:**
- `limit` - Numero risultati (default: 10)

**Esempio:**
```bash
GET /api/v1/documenti/top-downloads?limit=10
```

#### GET /api/v1/documenti/anni-disponibili
Recupera tutti gli anni disponibili.

**Esempio:**
```bash
GET /api/v1/documenti/anni-disponibili
```

**Risposta:**
```json
{
  "status": "success",
  "data": {
    "anni": [2024, 2025, 2026]
  }
}
```

### Azioni

#### POST /api/v1/documenti/:id/download
Incrementa il contatore di download.

**Esempio:**
```bash
POST /api/v1/documenti/507f1f77bcf86cd799439011/download
```

**Risposta:**
```json
{
  "status": "success",
  "data": {
    "documentoId": "507f1f77bcf86cd799439011",
    "downloads": 90
  }
}
```

#### PATCH /api/v1/documenti/:id/views
Incrementa manualmente il contatore di views (se necessario).

**Esempio:**
```bash
PATCH /api/v1/documenti/507f1f77bcf86cd799439011/views
```

### Statistiche

#### GET /api/v1/documenti/stats
Ottiene statistiche generali sui documenti.

**Esempio:**
```bash
GET /api/v1/documenti/stats
```

**Risposta:**
```json
{
  "status": "success",
  "data": {
    "totalDocumenti": 6,
    "pubblicati": 6,
    "totalDownloads": 523,
    "totalViews": 1248,
    "perTipo": {
      "lezionario": 5,
      "settimana_preghiera": 1
    }
  }
}
```

#### GET /api/v1/documenti/statistics/views
Ottiene statistiche dettagliate sulle views.

**Esempio:**
```bash
GET /api/v1/documenti/statistics/views
```

**Risposta:**
```json
{
  "status": "success",
  "data": {
    "overview": {
      "totalViews": 1248,
      "averageViews": 208,
      "maxViews": 356,
      "minViews": 87,
      "totalDocumenti": 6
    },
    "topDocumenti": [...],
    "tipoStats": [...],
    "timestamp": "2026-02-26T..."
  }
}
```

### CRUD Operations

#### POST /api/v1/documenti
Crea un nuovo documento.

**Body:**
```json
{
  "titolo": "Lezionario del 2° Trimestre 2026",
  "descrizione": "Studi biblici per Q2 2026",
  "tipo": "lezionario",
  "anno": 2026,
  "trimestre": 2,
  "filePath": "/documents/Lezionario-2-2026.pdf",
  "tags": ["lezionario", "2026", "q2"]
}
```

#### PATCH /api/v1/documenti/:id
Aggiorna un documento esistente.

**Body:**
```json
{
  "inEvidenza": true,
  "descrizione": "Descrizione aggiornata"
}
```

#### DELETE /api/v1/documenti/:id
Elimina un documento.

```bash
DELETE /api/v1/documenti/507f1f77bcf86cd799439011
```

## 🛠️ Script di Gestione

### 1. Seed Script - Popolamento Database

Importa i documenti esistenti nel database.

**Utilizzo:**
```bash
# Importa documenti
node seed-documenti.js

# Elimina tutti i documenti
node seed-documenti.js --delete
```

**Documenti inclusi:**
- Lezionario Q4 2024
- Lezionario Q1, Q2, Q3 2025
- Lezionario Q1 2026
- Settimana di Preghiera Speciale 2025

**Output:**
```
✅ Connessione al database riuscita!
✅ Documenti importati con successo!
📄 Totale documenti importati: 6

📊 Riepilogo:
   - Lezionari: 5
   - Settimane di Preghiera: 1

🔗 API Endpoints disponibili:
   GET /api/v1/documenti
   GET /api/v1/documenti/lezionari?anno=2026&trimestre=1
   ...
```

### 2. Upload Script - Gestione Interattiva

Script interattivo per gestire documenti.

**Utilizzo:**
```bash
node upload-documents.js
```

**Funzionalità:**
1. ✨ Aggiungi nuovo documento (guidato)
2. 📋 Lista tutti i documenti
3. 🔍 Cerca documento per titolo
4. 🗑️ Elimina documento
5. 📊 Statistiche
0. Esci

**Esempio Aggiunta Documento:**
```
📄 AGGIUNGI NUOVO DOCUMENTO AL DATABASE
========================================

Scegli il tipo (1-7): 1
📝 Titolo del documento: Lezionario del 2° Trimestre 2026
📄 Descrizione: Studi biblici per il secondo trimestre 2026
📅 Anno: 2026
📊 Trimestre: 2
📁 Percorso file: /documents/Lezionario-2-2026.pdf
...

✅ Confermi l'inserimento? (s/n): s
✅ Documento creato con successo!
📄 ID: 507f1f77bcf86cd799439011
```

## 🎨 Integrazione Frontend

### Esempio Fetch API

```javascript
// Recupera tutti i lezionari del 2026
async function getLezionari2026() {
  const response = await fetch('/api/v1/documenti/lezionari?anno=2026');
  const data = await response.json();
  return data.data.lezionari;
}

// Visualizza un documento (incrementa views automaticamente)
async function viewDocumento(id) {
  const response = await fetch(`/api/v1/documenti/${id}`);
  const data = await response.json();
  console.log(`Views: ${data.data.documento.views}`);
  return data.data.documento;
}

// Scarica un documento (incrementa downloads)
async function downloadDocumento(id) {
  await fetch(`/api/v1/documenti/${id}/download`, {
    method: 'POST'
  });
  // Poi apri il PDF o inizia il download
  window.open(documento.filePath, '_blank');
}

// Ottieni documenti in evidenza
async function getFeaturedDocuments() {
  const response = await fetch('/api/v1/documenti/in-evidenza?limit=6');
  const data = await response.json();
  return data.data.documenti;
}

// Filtra per anno e trimestre
async function filterDocuments(anno, trimestre) {
  const response = await fetch(
    `/api/v1/documenti?anno=${anno}&trimestre=${trimestre}`
  );
  const data = await response.json();
  return data.data.documenti;
}
```

### Esempio React Component

```jsx
import { useState, useEffect } from 'react';
import apiClient from '../../services/apiClient';

const DocumentiPage = () => {
  const [documenti, setDocumenti] = useState([]);
  const [anni, setAnni] = useState([]);
  const [selectedAnno, setSelectedAnno] = useState('');
  const [selectedTipo, setSelectedTipo] = useState('');

  // Carica anni disponibili
  useEffect(() => {
    const fetchAnni = async () => {
      const response = await fetch('/api/v1/documenti/anni-disponibili');
      const data = await response.json();
      setAnni(data.data.anni);
    };
    fetchAnni();
  }, []);

  // Carica documenti filtrati
  useEffect(() => {
    const fetchDocumenti = async () => {
      let url = '/api/v1/documenti?';
      if (selectedAnno) url += `anno=${selectedAnno}&`;
      if (selectedTipo) url += `tipo=${selectedTipo}&`;
      
      const response = await fetch(url);
      const data = await response.json();
      setDocumenti(data.data.documenti);
    };
    fetchDocumenti();
  }, [selectedAnno, selectedTipo]);

  const handleDownload = async (documento) => {
    // Incrementa downloads
    await fetch(`/api/v1/documenti/${documento._id}/download`, {
      method: 'POST'
    });
    
    // Apri PDF
    window.open(documento.filePath, '_blank');
  };

  return (
    <div>
      {/* Filtri */}
      <select value={selectedAnno} onChange={(e) => setSelectedAnno(e.target.value)}>
        <option value="">Tutti gli anni</option>
        {anni.map(anno => (
          <option key={anno} value={anno}>{anno}</option>
        ))}
      </select>

      <select value={selectedTipo} onChange={(e) => setSelectedTipo(e.target.value)}>
        <option value="">Tutti i tipi</option>
        <option value="lezionario">Lezionari</option>
        <option value="settimana_preghiera">Settimane di Preghiera</option>
      </select>

      {/* Lista documenti */}
      {documenti.map(doc => (
        <div key={doc._id}>
          <h3>{doc.titolo}</h3>
          <p>{doc.descrizione}</p>
          <p>📊 Downloads: {doc.downloads} | Views: {doc.views}</p>
          <button onClick={() => handleDownload(doc)}>
            Scarica PDF
          </button>
        </div>
      ))}
    </div>
  );
};
```

## 📝 Logging

Ogni azione viene loggata nella console:

- 📄 **View**: `Documento "Titolo" visualizzato. Total views: 142`
- ⬇️ **Download**: `Documento "Titolo" scaricato. Total downloads: 89`
- 📈 **Stats**: `Statistics retrieved. Total views: 1248`

## 💾 Persistenza Database

- Usa MongoDB con Mongoose ODM
- Operatore `$inc` per atomicità
- Indexes ottimizzati per query comuni
- Full-text search su titolo, descrizione, tags, autore

## 🔍 Query MongoDB Utili

```javascript
// Lezionari del 2026
db.documenti.find({ tipo: 'lezionario', anno: 2026 })

// Documenti più scaricati
db.documenti.find({ status: 'published' }).sort({ downloads: -1 }).limit(10)

// Statistiche per tipo
db.documenti.aggregate([
  { $group: {
    _id: '$tipo',
    totalDownloads: { $sum: '$downloads' },
    avgViews: { $avg: '$views' }
  }}
])

// Documenti in evidenza
db.documenti.find({ inEvidenza: true, status: 'published' })
```

## 📂 Struttura File

```
sdarmitalia-server/
├── models/
│   └── documentiModel.js          # Schema MongoDB
├── controller/
│   └── documentiController.js     # Business logic
├── routes/
│   └── documentiRoutes.js         # API endpoints
├── seed-documenti.js              # Import documenti esistenti
└── upload-documents.js            # Gestione interattiva

sdarmitalia/
└── src/
    └── documents/
        ├── Lezionario-1-2026.pdf
        ├── Lezionario-3-2025.pdf
        ├── Lezionario1-2025.pdf
        ├── Lezionario2-2025.pdf
        ├── Lezionario2024_4_it.pdf
        └── Sett. Pregh. Speciale 2025.pdf
```

## 🚀 Quick Start

### 1. Setup Database

```bash
# Importa documenti esistenti
cd sdarmitalia-server
node seed-documenti.js
```

### 2. Test API

```bash
# Lista documenti
curl http://localhost:5000/api/v1/documenti

# Lezionari 2026
curl http://localhost:5000/api/v1/documenti/lezionari?anno=2026

# Statistiche
curl http://localhost:5000/api/v1/documenti/stats
```

### 3. Aggiungi Nuovo Documento

```bash
# Modalità interattiva
node upload-documents.js

# Oppure tramite API
curl -X POST http://localhost:5000/api/v1/documenti \
  -H "Content-Type: application/json" \
  -d '{
    "titolo": "Nuovo Documento",
    "tipo": "lezionario",
    "anno": 2026,
    "trimestre": 3,
    "filePath": "/documents/..."
  }'
```

## ✅ Checklist Implementazione

- [x] Modello MongoDB con validazione
- [x] Controller con CRUD completo
- [x] Routes API RESTful
- [x] Incremento automatico views e downloads
- [x] Filtri per tipo, anno, trimestre
- [x] Statistiche aggregate
- [x] Script seed per import
- [x] Script interattivo per gestione
- [x] Documentazione completa
- [x] Logging con emoji
- [x] Indexes per performance
- [x] Full-text search

## 🎉 Conclusione

Il sistema è completo e pronto per l'uso in produzione! Offre:

✅ Persistenza dati completa in MongoDB  
✅ Tracciamento automatico di downloads e views  
✅ API RESTful ben strutturata  
✅ Filtri avanzati (tipo, anno, trimestre)  
✅ Script di gestione user-friendly  
✅ Pronto per integrazione frontend  
✅ Scalabile e manutenibile  

🔗 **Prossimi Step**: Integrare le API nel frontend React/Vue per visualizzare e gestire i documenti.
