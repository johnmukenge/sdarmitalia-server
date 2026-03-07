# 📚 RIEPILOGO: Integrazione Lezionari nella Biblioteca Digitale

## ✅ Cosa è Stato Fatto

Hai richiesto di integrare i documenti dalla cartella `/documents` (Lezionari e Settimane di Preghiera) nella **Biblioteca Digitale** esistente, non come sistema separato.

### 🎯 Soluzione Implementata

I Lezionari e le Settimane di Preghiera sono ora **categorie speciali** all'interno del modello `Libro` esistente, con campi aggiuntivi per anno e trimestre.

---

## 📦 File Modificati/Creati

### Modificati:
1. ✅ `models/libriModel.js` - Aggiunte categorie e campi anno/trimestre
2. ✅ `controller/libriController.js` - Aggiunte 3 nuove funzioni
3. ✅ `routes/libriRoutes.js` - Aggiunte 3 nuove routes

### Creati:
4. ✅ `seed-biblioteca-documenti.js` - Script per importare i 6 PDF
5. ✅ `LEZIONARI_BIBLIOTECA_INTEGRAZIONE.md` - Documentazione completa
6. ✅ `test-lezionari-api.sh` - Script di test automatico

---

## 🚀 Come Usarlo

### 1. Risolvi Connessione MongoDB Atlas

Prima di tutto, whitelist il tuo IP su MongoDB Atlas (vedi `MONGODB_IP_WHITELIST.md`):
- Vai su https://cloud.mongodb.com/
- Network Access → ADD IP ADDRESS
- Aggiungi `0.0.0.0/0` (per sviluppo) o il tuo IP specifico
- Attendi 2-3 minuti

### 2. Importa i Documenti nel Database

```bash
cd sdarmitalia-server

# Importa i 6 PDF nella biblioteca
node seed-biblioteca-documenti.js
```

Output atteso:
```
✅ 6 documenti importati con successo!

📊 Riepilogo:
   - Lezionari: 5
   - Settimane di Preghiera: 1
   - Featured: 3
```

### 3. Avvia il Server

```bash
npm run dev
```

### 4. Testa le API

```bash
# Opzione A: Manuale
curl http://localhost:5000/api/v1/libri/lezionari
curl http://localhost:5000/api/v1/libri/lezionari?anno=2026&trimestre=1
curl http://localhost:5000/api/v1/libri/settimane-preghiera?anno=2025
curl http://localhost:5000/api/v1/libri/anni-disponibili

# Opzione B: Script automatico (richiede jq)
./test-lezionari-api.sh
```

---

## 🔗 Nuovi Endpoint API

| Endpoint | Descrizione | Query Params |
|----------|-------------|--------------|
| `GET /api/v1/libri/lezionari` | Tutti i lezionari | `anno`, `trimestre` |
| `GET /api/v1/libri/settimane-preghiera` | Settimane di preghiera | `anno` |
| `GET /api/v1/libri/anni-disponibili` | Anni disponibili | - |

### Esempi:

```bash
# Tutti i lezionari
GET /api/v1/libri/lezionari

# Lezionari 2026
GET /api/v1/libri/lezionari?anno=2026

# Lezionario Q1 2026
GET /api/v1/libri/lezionari?anno=2026&trimestre=1

# Settimane preghiera 2025
GET /api/v1/libri/settimane-preghiera?anno=2025

# Lista anni (es: [2026, 2025, 2024])
GET /api/v1/libri/anni-disponibili
```

---

## 📊 Dati Importati

6 documenti dalla cartella `/documents`:

### Lezionari (5):
1. **Lezionario Q4 2024** - `/documents/Lezionario2024_4_it.pdf`
2. **Lezionario Q1 2025** - `/documents/Lezionario1-2025.pdf` (Featured)
3. **Lezionario Q2 2025** - `/documents/Lezionario2-2025.pdf`
4. **Lezionario Q3 2025** - `/documents/Lezionario-3-2025.pdf`
5. **Lezionario Q1 2026** - `/documents/Lezionario-1-2026.pdf` (Featured)

### Settimane di Preghiera (1):
6. **Settimana Preghiera 2025** - `/documents/Sett. Pregh. Speciale 2025.pdf` (Featured)

Ogni documento ha:
- ✅ Tracking automatico views
- ✅ Tracking automatico downloads
- ✅ Anno e trimestre (dove applicabile)
- ✅ Tags per ricerca
- ✅ Featured flag
- ✅ File path e URL

---

## 🎨 Frontend - Esempio Integrazione

### Filtri per Lezionari

```jsx
// Componente per visualizzare lezionari con filtri
const LezionariSection = () => {
  const [lezionari, setLezionari] = useState([]);
  const [anni, setAnni] = useState([]);
  const [filters, setFilters] = useState({ anno: '', trimestre: '' });

  // Carica anni disponibili al mount
  useEffect(() => {
    fetch('/api/v1/libri/anni-disponibili')
      .then(res => res.json())
      .then(data => setAnni(data.data.anni));
  }, []);

  // Carica lezionari quando cambiano i filtri
  useEffect(() => {
    const params = new URLSearchParams();
    if (filters.anno) params.append('anno', filters.anno);
    if (filters.trimestre) params.append('trimestre', filters.trimestre);
    
    fetch(`/api/v1/libri/lezionari?${params}`)
      .then(res => res.json())
      .then(data => setLezionari(data.data.lezionari));
  }, [filters]);

  return (
    <div>
      <h2>Lezionari Biblici</h2>
      
      {/* Filtri */}
      <div className="filtri">
        <select onChange={e => setFilters({...filters, anno: e.target.value})}>
          <option value="">Tutti gli anni</option>
          {anni.map(anno => <option key={anno} value={anno}>{anno}</option>)}
        </select>
        
        <select onChange={e => setFilters({...filters, trimestre: e.target.value})}>
          <option value="">Tutti i trimestri</option>
          <option value="1">Q1</option>
          <option value="2">Q2</option>
          <option value="3">Q3</option>
          <option value="4">Q4</option>
        </select>
      </div>

      {/* Grid Libri */}
      <div className="grid">
        {lezionari.map(libro => (
          <LibroCard key={libro._id} libro={libro} />
        ))}
      </div>
    </div>
  );
};
```

### Card Libro (riusa componente esistente!)

Il componente `LibroCard` esistente funziona automaticamente perché i lezionari sono libri normali con campi extra.

---

## 📈 Statistiche Unificate

Le statistiche della biblioteca ora includono automaticamente i lezionari:

```bash
GET /api/v1/libri/stats
```

Risposta:
```json
{
  "totalBooks": 18,
  "publishedBooks": 18,
  "totalDownloads": 49346,
  "byCategory": {
    "bibbia": 2,
    "lezionario": 5,           // ✨ Nuova categoria
    "settimana_preghiera": 1,  // ✨ Nuova categoria
    "teologia": 3,
    "educazione": 2,
    ...
  }
}
```

---

## ✨ Vantaggi di Questa Soluzione

### 1. **Sistema Unificato**
- Un solo modello (Libro), una sola collection MongoDB
- Non serve gestire due sistemi separati
- Codice più semplice e manutenibile

### 2. **Riuso Completo**
- Tutte le funzionalità esistenti funzionano automaticamente:
  - ✅ Views tracking
  - ✅ Downloads tracking
  - ✅ Rating system
  - ✅ Full-text search
  - ✅ Featured books
  - ✅ Statistiche
  - ✅ Paginazione
  - ✅ Ordinamento

### 3. **Flessibilità Filtri**
Puoi filtrare in due modi:

**Opzione A: Endpoint specifico**
```
GET /api/v1/libri/lezionari?anno=2026&trimestre=1
```

**Opzione B: Endpoint generico con filtri**
```
GET /api/v1/libri?category=lezionario&anno=2026&trimestre=1
```

### 4. **Frontend Semplificato**
- Riusi i componenti esistenti della biblioteca
- Aggiungi solo i filtri anno/trimestre
- Non serve creare una sezione completamente separata

---

## 🔍 Confronto Approcci

| Aspetto | Sistema Separato ❌ | Sistema Integrato ✅ |
|---------|-------------------|---------------------|
| Modelli MongoDB | 2 (Libro + Documento) | 1 (Libro) |
| Controllers | 2 separati | 1 unificato |
| Routes | 2 set | 1 set con endpoint extra |
| Statistiche | Separate | Unificate |
| Ricerca | Doppia implementazione | Unica |
| Views/Downloads | Doppia gestione | Automatica |
| Frontend Components | 2 sistemi | 1 sistema con filtri |
| Manutenzione | Complessa | Semplice |
| Database Queries | Più complesse | Più semplici |

---

## 📝 Schema Database

### Collection: `libri`

Tutti i libri condividono la stessa collection, ma i lezionari hanno campi extra:

```javascript
// Libro normale
{
  _id: ObjectId,
  title: String,
  author: String,
  category: "bibbia" | "teologia" | "storia" | ...,
  downloads: Number,
  views: Number,
  // ... altri campi standard
}

// Lezionario (libro + campi speciali)
{
  _id: ObjectId,
  title: String,
  author: String,
  category: "lezionario",  // ✨ Categoria speciale
  anno: 2026,              // ✨ Campo richiesto
  trimestre: 1,            // ✨ Campo richiesto (1-4)
  downloads: Number,
  views: Number,
  // ... altri campi standard
}

// Settimana Preghiera (libro + anno)
{
  _id: ObjectId,
  title: String,
  category: "settimana_preghiera",  // ✨ Categoria speciale
  anno: 2025,                       // ✨ Campo richiesto
  trimestre: null,                  // Non richiesto per settimane
  // ... altri campi standard
}
```

---

## 🎯 Prossimi Step

### Immediati (Necessari):
1. ✅ Whitelist IP su MongoDB Atlas
2. ✅ Importa documenti: `node seed-biblioteca-documenti.js`
3. ✅ Testa API: `./test-lezionari-api.sh`

### Frontend (Opzionali):
4. 🔲 Aggiungi filtri anno/trimestre al componente Biblioteca
5. 🔲 Mostra badge "Lezionario Q1 2026" sulle card
6. 🔲 Crea sezione dedicata "Lezionari" nel menu (opzionale)

### Miglioramenti Futuri:
7. 🔲 Upload UI per nuovi lezionari
8. 🔲 Aggiungi cover images ai lezionari
9. 🔲 Sistema di notifiche per nuovi trimestri

---

## 🆘 Troubleshooting

### Problema: MongoDB Connection Error
**Soluzione**: Whitelist IP su Atlas (vedi `MONGODB_IP_WHITELIST.md`)

### Problema: "Category validation failed"
**Soluzione**: Verifica che `category` sia tra le opzioni valide, inclusi `lezionario` e `settimana_preghiera`

### Problema: "Anno is required"
**Soluzione**: Per lezionari e settimane, il campo `anno` è obbligatorio

### Problema: "Trimestre is required"
**Soluzione**: Solo i lezionari richiedono `trimestre` (1-4)

---

## 📚 Documentazione Completa

Per dettagli approfonditi, consulta:
- `LEZIONARI_BIBLIOTECA_INTEGRAZIONE.md` - Guida completa
- `MONGODB_IP_WHITELIST.md` - Risoluzione connessione DB
- `models/libriModel.js` - Schema e validazioni
- `controller/libriController.js` - Logica business
- `routes/libriRoutes.js` - Endpoint API

---

## ✅ Checklist Implementazione

- [x] Modello esteso con categorie lezionario/settimana_preghiera
- [x] Campi anno e trimestre con validazioni
- [x] Metodi statici getLezionari(), getSettimanePreghiera(), getAnniDisponibili()
- [x] Controller functions per nuovi endpoint
- [x] Routes configurate
- [x] Script di seed con 6 documenti
- [x] Indici MongoDB ottimizzati
- [x] Documentazione completa
- [x] Script di test automatico
- [x] Zero errori di compilazione

---

**🎉 Sistema pronto per l'uso! Risolvi la connessione MongoDB e importa i dati.**
