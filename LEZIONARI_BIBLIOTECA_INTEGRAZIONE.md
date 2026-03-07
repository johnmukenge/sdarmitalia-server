# 📚 Lezionari e Settimane di Preghiera - Integrazione Biblioteca Digitale

## 🎯 Panoramica

I Lezionari e le Settimane di Preghiera sono ora **integrati nella Biblioteca Digitale** come nuove categorie di libri, non come sistema separato.

## 🔧 Modifiche Implementate

### 1. **Modello Libro Esteso** (`models/libriModel.js`)

Aggiunte nuove categorie e campi:

```javascript
category: {
  enum: [
    'bibbia',
    'teologia',
    'storia',
    // ... altre categorie esistenti
    'lezionario',           // ✨ NUOVO
    'settimana_preghiera',  // ✨ NUOVO
    'altro',
  ]
}

// Campi specifici per Lezionari e Settimane
anno: {
  type: Number,
  required: function() { 
    return ['lezionario', 'settimana_preghiera'].includes(this.category);
  }
}

trimestre: {
  type: Number,
  enum: [1, 2, 3, 4],
  required: function() { 
    return this.category === 'lezionario';
  }
}
```

#### Metodi Statici Aggiunti:

- `Libro.getLezionari(anno, trimestre)` - Filtra lezionari per anno/trimestre
- `Libro.getSettimanePreghiera(anno)` - Filtra settimane per anno
- `Libro.getAnniDisponibili()` - Ottieni lista anni disponibili

### 2. **Controller Esteso** (`controller/libriController.js`)

Nuove funzioni:

- `getLezionari` - GET lezionari filtrati
- `getSettimanePreghiera` - GET settimane filtrate
- `getAnniDisponibili` - GET anni disponibili

### 3. **Nuove Routes** (`routes/libriRoutes.js`)

```
GET /api/v1/libri/lezionari?anno=2026&trimestre=1
GET /api/v1/libri/settimane-preghiera?anno=2025
GET /api/v1/libri/anni-disponibili
```

### 4. **Script di Seed** (`seed-biblioteca-documenti.js`)

Importa i 6 PDF dalla cartella `/documents`:

- ✅ Lezionario Q4 2024
- ✅ Lezionario Q1 2025
- ✅ Lezionario Q2 2025
- ✅ Lezionario Q3 2025
- ✅ Lezionario Q1 2026
- ✅ Settimana Preghiera 2025

## 🚀 Uso Rapido

### 1. Importa i Documenti nel Database

```bash
cd sdarmitalia-server

# Prima volta: importa tutti i documenti
node seed-biblioteca-documenti.js

# Per reimportare (cancella e ricrea)
node seed-biblioteca-documenti.js

# Per rimuovere solo lezionari e settimane
node seed-biblioteca-documenti.js --delete
```

### 2. Testa le API

```bash
# Tutti i lezionari
curl http://localhost:5000/api/v1/libri/lezionari

# Lezionari 2026 primo trimestre
curl http://localhost:5000/api/v1/libri/lezionari?anno=2026&trimestre=1

# Settimane di preghiera 2025
curl http://localhost:5000/api/v1/libri/settimane-preghiera?anno=2025

# Anni disponibili
curl http://localhost:5000/api/v1/libri/anni-disponibili

# Tutti i libri della biblioteca (inclusi lezionari)
curl http://localhost:5000/api/v1/libri

# Filtra solo per categoria lezionario
curl http://localhost:5000/api/v1/libri?category=lezionario

# Statistiche biblioteca (include lezionari e settimane)
curl http://localhost:5000/api/v1/libri/stats
```

## 📊 Struttura Dati

### Esempio Lezionario:

```json
{
  "_id": "...",
  "title": "Lezionario Biblico - Primo Trimestre 2026",
  "author": "Chiesa Cristiana Avventista del Settimo Giorno",
  "description": "Studio biblico trimestrale per il primo trimestre 2026...",
  "category": "lezionario",
  "subcategories": ["studio-biblico", "devozione"],
  "tags": ["lezionario", "bibbia", "studio", "2026", "q1", "trimestre"],
  "filePath": "/documents/Lezionario-1-2026.pdf",
  "fileUrl": "https://adsgmdr.it/documents/Lezionario-1-2026.pdf",
  "language": "it",
  "publisher": "Edizioni ADV",
  "publicationDate": "2026-01-01T00:00:00.000Z",
  "anno": 2026,
  "trimestre": 1,
  "featured": true,
  "status": "published",
  "isPublic": true,
  "downloads": 0,
  "views": 0,
  "rating": 0,
  "ratingCount": 0,
  "createdAt": "2026-02-26T...",
  "updatedAt": "2026-02-26T..."
}
```

### Esempio Settimana di Preghiera:

```json
{
  "_id": "...",
  "title": "Settimana di Preghiera Speciale 2025",
  "author": "Chiesa Cristiana Avventista del Settimo Giorno",
  "description": "Guida per la settimana di preghiera speciale 2025...",
  "category": "settimana_preghiera",
  "subcategories": ["preghiera", "devozione", "comunità"],
  "tags": ["settimana", "preghiera", "devozione", "2025", "spiritualità"],
  "filePath": "/documents/Sett. Pregh. Speciale 2025.pdf",
  "fileUrl": "https://adsgmdr.it/documents/Sett.%20Pregh.%20Speciale%202025.pdf",
  "anno": 2025,
  "trimestre": null,
  "featured": true,
  "status": "published",
  "isPublic": true,
  "downloads": 0,
  "views": 0
}
```

## 🎨 Frontend - Integrazione React

### Esempio Componente per Lezionari

```jsx
import { useState, useEffect } from 'react';

const LezionariPage = () => {
  const [lezionari, setLezionari] = useState([]);
  const [anni, setAnni] = useState([]);
  const [annoSelezionato, setAnnoSelezionato] = useState('');
  const [trimestreSelezionato, setTrimestreSelezionato] = useState('');

  useEffect(() => {
    // Carica anni disponibili
    fetch('/api/v1/libri/anni-disponibili')
      .then(res => res.json())
      .then(data => setAnni(data.data.anni));
  }, []);

  useEffect(() => {
    // Carica lezionari filtrati
    let url = '/api/v1/libri/lezionari';
    const params = new URLSearchParams();
    if (annoSelezionato) params.append('anno', annoSelezionato);
    if (trimestreSelezionato) params.append('trimestre', trimestreSelezionato);
    if (params.toString()) url += '?' + params.toString();

    fetch(url)
      .then(res => res.json())
      .then(data => setLezionari(data.data.lezionari));
  }, [annoSelezionato, trimestreSelezionato]);

  return (
    <div className="lezionari-page">
      <h1>Lezionari Biblici</h1>
      
      {/* Filtri */}
      <div className="filtri">
        <select 
          value={annoSelezionato} 
          onChange={(e) => setAnnoSelezionato(e.target.value)}
        >
          <option value="">Tutti gli anni</option>
          {anni.map(anno => (
            <option key={anno} value={anno}>{anno}</option>
          ))}
        </select>

        <select 
          value={trimestreSelezionato}
          onChange={(e) => setTrimestreSelezionato(e.target.value)}
        >
          <option value="">Tutti i trimestri</option>
          <option value="1">Trimestre 1</option>
          <option value="2">Trimestre 2</option>
          <option value="3">Trimestre 3</option>
          <option value="4">Trimestre 4</option>
        </select>
      </div>

      {/* Lista Lezionari */}
      <div className="lezionari-grid">
        {lezionari.map(libro => (
          <div key={libro._id} className="libro-card">
            <h3>{libro.title}</h3>
            <p>{libro.description}</p>
            <div className="meta">
              <span>Anno: {libro.anno}</span>
              <span>Trimestre: {libro.trimestre}</span>
              <span>👁️ {libro.views} visualizzazioni</span>
              <span>⬇️ {libro.downloads} download</span>
            </div>
            <a 
              href={libro.fileUrl} 
              target="_blank" 
              className="btn-download"
              onClick={() => {
                // Incrementa downloads
                fetch(`/api/v1/libri/${libro._id}/download`, { method: 'POST' });
              }}
            >
              Scarica PDF
            </a>
          </div>
        ))}
      </div>
    </div>
  );
};
```

## 🔍 Query di Esempio

### 1. Tutti i lezionari del 2026

```bash
curl http://localhost:5000/api/v1/libri/lezionari?anno=2026
```

### 2. Lezionario Q1 2026

```bash
curl http://localhost:5000/api/v1/libri/lezionari?anno=2026&trimestre=1
```

### 3. Settimane di preghiera 2025

```bash
curl http://localhost:5000/api/v1/libri/settimane-preghiera?anno=2025
```

### 4. Lista anni disponibili

```bash
curl http://localhost:5000/api/v1/libri/anni-disponibili
```

### 5. Tutti i libri con categoria lezionario (usando filtro generico)

```bash
curl http://localhost:5000/api/v1/libri?category=lezionario
```

### 6. Ricerca full-text

```bash
curl http://localhost:5000/api/v1/libri/search?q=lezionario+2026
```

### 7. Incrementa views

```bash
curl -X PATCH http://localhost:5000/api/v1/libri/LIBRO_ID/views
```

### 8. Incrementa downloads

```bash
curl -X POST http://localhost:5000/api/v1/libri/LIBRO_ID/download
```

## 📈 Statistiche

Le statistiche della biblioteca ora includono automaticamente lezionari e settimane:

```bash
curl http://localhost:5000/api/v1/libri/stats
```

Risposta:

```json
{
  "status": "success",
  "data": {
    "totalBooks": 18,
    "publishedBooks": 18,
    "draftBooks": 0,
    "totalDownloads": 49340,
    "byCategory": {
      "bibbia": 2,
      "teologia": 3,
      "storia": 1,
      "educazione": 2,
      "famiglia": 1,
      "lezionario": 5,
      "settimana_preghiera": 1,
      "altro": 3
    }
  }
}
```

## ✅ Vantaggi di Questa Integrazione

1. **Unified System**: Un solo database, un solo modello, un solo endpoint base
2. **Riuso Codice**: Tutte le funzionalità esistenti (views, downloads, rating, search) funzionano automaticamente
3. **Filtri Flessibili**: Usa sia gli endpoint specifici che i filtri generici
4. **Statistiche Unificate**: Dashboard unico per tutta la biblioteca
5. **Ricerca Full-Text**: I lezionari sono indicizzati e ricercabili
6. **Frontend Semplificato**: Un solo componente biblioteca, filtri aggiuntivi per lezionari

## 🔄 Confronto con Sistema Precedente (Documenti Separati)

| Aspetto | Sistema Separato | Sistema Integrato ✅ |
|---------|-----------------|---------------------|
| Modelli | 2 (Libro + Documento) | 1 (Libro) |
| Controllers | 2 | 1 |
| Routes | 2 set separati | 1 set unificato |
| Database | 2 collections | 1 collection |
| Statistiche | Separate | Unificate |
| Ricerca | Doppia implementazione | Unica |
| Manutenzione | Più complessa | Più semplice |

## 🎯 Prossimi Step

1. ✅ Importa i documenti: `node seed-biblioteca-documenti.js`
2. ✅ Testa le API con curl/Postman
3. 🔲 Integra frontend React con i nuovi endpoint
4. 🔲 Aggiungi cover images ai lezionari
5. 🔲 Opzionale: Upload UI per nuovi documenti

## 📝 Note Importanti

- ⚠️ Il campo `trimestre` è **richiesto solo per lezionario**, opzionale per altre categorie
- ⚠️ Il campo `anno` è **richiesto per lezionario E settimana_preghiera**
- ✅ Le validazioni sono gestite automaticamente da Mongoose
- ✅ Gli indici sono ottimizzati per query su category/anno/trimestre
- ✅ Views e downloads si incrementano automaticamente
