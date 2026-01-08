# Project Phases Database Seed

## Descrizione

Questo script popola il database MongoDB con i dati completi delle 4 fasi del progetto NewCampus, includendo:

- Informazioni di base (titolo, descrizione, percentuale di completamento)
- Media (immagini, video, documenti)
- Gallerie fotografiche
- Milestone con date e stato di completamento
- Budget allocation
- Informazioni del team
- Sfide e soluzioni

## Come eseguire

### 1. Configurare MongoDB Atlas IP Whitelist

Se ricevi l'errore: "Could not connect to any servers in your MongoDB Atlas cluster"

Accedi a MongoDB Atlas e aggiungi il tuo indirizzo IP alla whitelist:

1. Accedi a [MongoDB Atlas](https://cloud.mongodb.com)
2. Vai a **Security** → **Network Access**
3. Clicca **Add IP Address**
4. Inserisci il tuo indirizzo IP o usa `0.0.0.0/0` per consentire tutti gli indirizzi (NON CONSIGLIATO in produzione)
5. Clicca **Confirm**

### 2. Verificare le credenziali in config.env

Assicurati che il file `config.env` contenga:

```
MONGODB_URI=mongodb+srv://[username]:[password]@[cluster].mongodb.net/[database]
```

### 3. Eseguire il seed script

```bash
cd c:\projects\personal\sdarmitalia-server
node data/data-seed/seedProjectPhases.js
```

### Output atteso

```
✅ DB connection successful
🗑️ Previous data cleared
✅ 4 phases successfully created!

📊 Database Seed Summary:
- Phase 1: Acquisto del Terreno (Completato) - 100% complete
- Phase 2: Sala Culto Provvisoria (Completato) - 100% complete
- Phase 3: Sala Culto Definitiva (In corso) - 65% complete
- Phase 4: Inaugurazione (In pianificazione) - 0% complete

🎯 Total Project Progress: 66.2%

📈 Project Statistics:
- Total Phases: 4
- Completed Phases: 2
- In Progress: 1
- Planned: 1
```

## Struttura dei dati

Ogni fase contiene:

### Campi Base

- `phaseNumber` (1-4): Numero della fase
- `title`: Nome della fase
- `status`: Completato | In corso | In pianificazione | In attesa
- `percentage`: Percentuale di completamento (0-100)
- `description`: Breve descrizione
- `fullDescription`: Descrizione completa
- `startDate` / `endDate`: Date inizio/fine

### Timeline e Dettagli

- `timeline`: Array di stringhe con tappe importanti
- `details`: Array di attività/compiti
- `objectives`: Array di obiettivi con stato di completamento

### Media

- `media`: Array di media (immagini, video, documenti)
- `gallery`: Galleria organizzata con copertina e immagini
- `mainVideo`: Video YouTube principale

### Informazioni Progetto

- `budget`: Allocazione e spesa (allocated, spent, currency)
- `team`: Array di membri del team con ruoli
- `milestones`: Array di milestone con date e completamento
- `challenges`: Array di sfide con soluzioni

### Statistiche

- `views`: Contatore visualizzazioni
- `isPublished`: Flag di pubblicazione
- `lastUpdated`: Timestamp ultimo aggiornamento

## API Endpoints utilizzabili dopo il seed

### Recuperare tutte le fasi

```
GET /api/v1/project-phases
```

### Recuperare una fase per numero

```
GET /api/v1/project-phases/number/1
GET /api/v1/project-phases/number/2
GET /api/v1/project-phases/number/3
GET /api/v1/project-phases/number/4
```

### Recuperare media di una fase

```
GET /api/v1/project-phases/number/1/media
```

### Recuperare milestone di una fase

```
GET /api/v1/project-phases/number/1/milestones
```

### Statistiche complessive

```
GET /api/v1/project-phases/stats
```

## Dati di esempio

Le 4 fasi includono dati realistici con:

- **Fase 1**: Completata (100%) - Acquisto terreno con team legale
- **Fase 2**: Completata (100%) - Sala provvisoria con team costruttivo
- **Fase 3**: In corso (65%) - Sala definitiva con architettura moderna
- **Fase 4**: In pianificazione (0%) - Inaugurazione ufficiale

Ogni fase ha:

- 3-4 immagini di esempio (da Unsplash)
- 1 video YouTube (ID di esempio)
- Team members con ruoli specifici
- 4-6 milestone con date realistiche
- Budget allocation (€145k-€1.2M)
- Descrizioni complete e sfide documentate

## Troubleshooting

### Errore: "Cannot connect to database"

- Verifica che MONGODB_URI sia corretto in config.env
- Aggiungi il tuo IP address alla MongoDB Atlas IP whitelist

### Errore: "Model is not defined"

- Assicurati che il path al model sia corretto
- Verifica che projectPhaseModel.js esista in `/models`

### Errore: "Cannot find module"

- Esegui `npm install` nella cartella server
- Verifica di essere nella directory corretta

## Cleanup (resettare i dati)

Se vuoi cancellare i dati e rifare il seed:

```javascript
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const ProjectPhase = require('./models/projectPhaseModel');

dotenv.config();

mongoose.connect(process.env.MONGODB_URI).then(async () => {
  await ProjectPhase.deleteMany({});
  console.log('✅ All project phases deleted');
  process.exit(0);
});
```
