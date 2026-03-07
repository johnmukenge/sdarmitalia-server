# Sistema di Tracciamento Views - Documentazione Completa

## 📊 Panoramica

È stato implementato un sistema automatico di tracciamento delle visualizzazioni (views) per tutti i contenuti principali del sito:
- **News** (già esistente, migliorato)
- **Libri** (nuova implementazione)
- **Eventi** (nuova implementazione)
- **Articoli** (nuova implementazione)

## 🎯 Funzionalità Implementate

### 1. Campo Views nei Modelli

Ogni modello ora include:
```javascript
views: {
  type: Number,
  default: 0,
  min: [0, 'Views cannot be negative'],
}
```

### 2. Metodo incrementViews()

Ogni modello ha un metodo per incrementare le views:
```javascript
Schema.methods.incrementViews = function () {
  this.views = (this.views || 0) + 1;
  return this.save();
};
```

### 3. Incremento Automatico

Quando un utente visualizza un contenuto tramite GET /:id, le views vengono automaticamente incrementate:

#### News
```javascript
// GET /api/v1/news/:id
const news = await News.findByIdAndUpdate(
  req.params.id,
  { $inc: { views: 1 } },
  { new: true, runValidators: false }
);
```

#### Libri
```javascript
// GET /api/v1/libri/:id
const libro = await Libro.findByIdAndUpdate(
  req.params.id,
  { $inc: { views: 1 } },
  { new: true, runValidators: false }
);
```

#### Eventi
```javascript
// GET /api/v1/events/:id
const eventi = await Eventi.findByIdAndUpdate(
  req.params.id,
  { $inc: { views: 1 } },
  { new: true, runValidators: false }
);
```

#### Articoli
```javascript
// GET /api/v1/articles/:id
const article = await Article.findByIdAndUpdate(
  req.params.id,
  { $inc: { views: 1 } },
  { new: true, runValidators: false }
);
```

## 📡 Endpoints API

### News

#### Ottieni tutte le news
```
GET /api/v1/news
```

#### Ottieni una news (incrementa views automaticamente)
```
GET /api/v1/news/:id
```

#### Incrementa views manualmente (se necessario)
```
PATCH /api/v1/news/:id/views
```

#### Statistiche views
```
GET /api/v1/news/statistics/views
```

**Risposta:**
```json
{
  "status": "success",
  "data": {
    "overview": {
      "totalViews": 1250,
      "averageViews": 25.5,
      "maxViews": 150,
      "minViews": 0,
      "totalArticles": 49
    },
    "topNews": [...],
    "categoryStats": [...]
  }
}
```

### Libri

#### Ottieni tutti i libri
```
GET /api/v1/libri
```

#### Ottieni un libro (incrementa views automaticamente)
```
GET /api/v1/libri/:id
```

#### Incrementa views manualmente
```
PATCH /api/v1/libri/:id/views
```

#### Statistiche views
```
GET /api/v1/libri/statistics/views
```

**Risposta:**
```json
{
  "status": "success",
  "data": {
    "overview": {
      "totalViews": 5420,
      "averageViews": 108.4,
      "maxViews": 350,
      "minViews": 5,
      "totalLibri": 50
    },
    "topLibri": [...],
    "categoryStats": [...]
  }
}
```

### Eventi

#### Ottieni tutti gli eventi
```
GET /api/v1/events
```

#### Ottieni un evento (incrementa views automaticamente)
```
GET /api/v1/events/:id
```

#### Incrementa views manualmente
```
PATCH /api/v1/events/:id/views
```

#### Statistiche views
```
GET /api/v1/events/statistics/views
```

**Risposta:**
```json
{
  "status": "success",
  "data": {
    "overview": {
      "totalViews": 3200,
      "averageViews": 64,
      "maxViews": 200,
      "minViews": 10,
      "totalEvents": 50
    },
    "topEvents": [...],
    "statusStats": [...]
  }
}
```

### Articoli

#### Ottieni tutti gli articoli
```
GET /api/v1/articles
```

#### Ottieni un articolo (incrementa views automaticamente)
```
GET /api/v1/articles/:id
```

#### Incrementa views manualmente
```
PATCH /api/v1/articles/:id/views
```

#### Statistiche views
```
GET /api/v1/articles/statistics/views
```

**Risposta:**
```json
{
  "status": "success",
  "data": {
    "overview": {
      "totalViews": 2100,
      "averageViews": 42,
      "maxViews": 180,
      "minViews": 2,
      "totalArticles": 50
    },
    "topArticles": [...],
    "categoryStats": [...]
  }
}
```

## 🔧 File Modificati

### Modelli
1. **newsModel.js** - Campo views già esistente
2. **libriModel.js** - Aggiunto campo `views` e metodo `incrementViews()`
3. **eventiModel.js** - Aggiunto campo `views` e metodo `incrementViews()`
4. **articlesModel.js** - Aggiunto campo `views` e metodo `incrementViews()`

### Controller
1. **newsController.js** - Aggiornato (già aveva incremento automatico)
2. **libriController.js** - Aggiunto incremento automatico in `getLibro()` e nuove funzioni statistiche
3. **eventsController.js** - Aggiunto incremento automatico in `getEvent()` e nuove funzioni statistiche
4. **articlesController.js** - Creato nuovo controller completo con tutte le funzionalità

### Routes
1. **newsRoutes.js** - Già completo
2. **libriRoutes.js** - Aggiunti endpoint per views
3. **eventsRoutes.js** - Aggiunti endpoint per views
4. **articlesRoutes.js** - Creato nuovo file routes

### Server
1. **index.js** - Registrate routes per eventi e articoli

## 📝 Logging

Ogni incremento di views viene loggato nella console con emoji per facile identificazione:

- 📰 News: `News "Titolo" viewed. Total views: 42`
- 📚 Libro: `Libro "Titolo" visualizzato. Total views: 108`
- 📅 Evento: `Event "Titolo" viewed. Total views: 67`
- 📄 Articolo: `Article "Titolo" viewed. Total views: 35`

## 💾 Persistenza Database

Tutte le views vengono automaticamente salvate nel database MongoDB tramite:
- Operatore `$inc` di MongoDB per atomicità
- `runValidators: false` per evitare validazioni non necessarie sull'incremento
- `new: true` per restituire il documento aggiornato

## 🚀 Utilizzo nel Frontend

### Esempio con Fetch API

```javascript
// Visualizza una news (incrementa automaticamente le views)
async function viewNews(newsId) {
  const response = await fetch(`/api/v1/news/${newsId}`);
  const data = await response.json();
  console.log(`Views: ${data.data.news.views}`);
}

// Ottieni statistiche views
async function getNewsStats() {
  const response = await fetch('/api/v1/news/statistics/views');
  const stats = await response.json();
  console.log(`Total views: ${stats.data.overview.totalViews}`);
}
```

### Esempio con Axios

```javascript
// Visualizza un libro (incrementa automaticamente le views)
const libro = await axios.get(`/api/v1/libri/${libroId}`);
console.log(`Views: ${libro.data.data.libro.views}`);

// Incremento manuale (se necessario)
await axios.patch(`/api/v1/libri/${libroId}/views`);
```

## ✅ Vantaggi del Sistema

1. **Automatico**: Le views si incrementano automaticamente quando l'utente visualizza il contenuto
2. **Persistente**: Tutti i dati vengono salvati nel database MongoDB
3. **Atomico**: Usa `$inc` per evitare race conditions
4. **Statistiche**: Endpoint dedicati per analisi e reporting
5. **Consistente**: Stesso pattern per tutti i tipi di contenuto
6. **Tracciabile**: Log chiari per debugging e monitoring

## 🔍 Query Utili MongoDB

### Contenuti più visti
```javascript
// News più viste
db.news.find({ status: 'published' }).sort({ views: -1 }).limit(10)

// Libri più visti
db.libri.find({ status: 'published', isPublic: true }).sort({ views: -1 }).limit(10)

// Eventi più visti
db.events.find({ status: { $ne: 'cancelled' } }).sort({ views: -1 }).limit(10)

// Articoli più visti
db.articles.find().sort({ views: -1 }).limit(10)
```

### Statistiche aggregate
```javascript
// Media views per categoria (News)
db.news.aggregate([
  { $group: {
    _id: '$category',
    avgViews: { $avg: '$views' },
    totalViews: { $sum: '$views' }
  }}
])
```

## 🔐 Sicurezza

- Le views non possono essere negative (validazione a livello di schema)
- L'incremento usa `runValidators: false` per performance ma mantiene la validazione min/max
- Gli endpoint di incremento manuale sono disponibili per casi d'uso specifici

## 📊 Monitoraggio

Per monitorare le performance del sistema:

```javascript
// Controlla i log del server per messaggi come:
// 📈 Incrementing views for news: 507f1f77bcf86cd799439011
// ✅ Views incremented. Total views: 42
```

## 🎉 Conclusione

Il sistema è ora completo e pronto per l'uso in produzione. Ogni visualizzazione di contenuto viene automaticamente tracciata e persistita nel database, fornendo statistiche utili per analytics e content management.
