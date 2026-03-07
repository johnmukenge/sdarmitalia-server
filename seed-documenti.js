/**
 * @file seed-documenti.js
 * @description Script per popolare il database con i documenti esistenti
 * @version 1.0
 * @author SDA Italia Dev Team
 *
 * Questo script analizza i file PDF nella cartella documents del frontend
 * e li inserisce nel database MongoDB
 *
 * Usage: node seed-documenti.js
 */

const mongoose = require('mongoose');
const Documento = require('./models/documentiModel');
require('dotenv').config({ path: './config.env' });

// Documenti basati sui file esistenti nella cartella /documents
const documentiData = [
  // Lezionari 2024
  {
    titolo: 'Lezionario del 4° Trimestre 2024',
    descrizione:
      'Lezionario della Scuola del Sabato per il quarto trimestre 2024. Studi biblici quotidiani per approfondire la Parola di Dio.',
    tipo: 'lezionario',
    anno: 2024,
    trimestre: 4,
    lingua: 'it',
    filePath: '/documents/Lezionario2024_4_it.pdf',
    fileSize: 2500000, // Stima 2.5MB
    pagine: 120,
    copertina: '', // Da aggiungere se disponibile
    tags: [
      'lezionario',
      'scuola sabato',
      '2024',
      'q4',
      'studio biblico',
      'trimestre',
    ],
    autore: 'Conferenza Generale degli Avventisti del 7° Giorno',
    editore: 'SDA Italia',
    dataPubblicazione: new Date(2024, 9, 1), // Ottobre 2024
    versione: '1.0',
    downloads: 0,
    views: 0,
    inEvidenza: false,
    status: 'published',
    isPublic: true,
  },

  // Lezionari 2025
  {
    titolo: 'Lezionario del 1° Trimestre 2025',
    descrizione:
      'Lezionario della Scuola del Sabato per il primo trimestre 2025. Meditazioni e studi per iniziare l\'anno con la Parola di Dio.',
    tipo: 'lezionario',
    anno: 2025,
    trimestre: 1,
    lingua: 'it',
    filePath: '/documents/Lezionario1-2025.pdf',
    fileSize: 2400000,
    pagine: 115,
    copertina: '',
    tags: [
      'lezionario',
      'scuola sabato',
      '2025',
      'q1',
      'studio biblico',
      'trimestre',
    ],
    autore: 'Conferenza Generale degli Avventisti del 7° Giorno',
    editore: 'SDA Italia',
    dataPubblicazione: new Date(2025, 0, 1), // Gennaio 2025
    versione: '1.0',
    downloads: 0,
    views: 0,
    inEvidenza: true, // In evidenza perché è recente
    status: 'published',
    isPublic: true,
  },

  {
    titolo: 'Lezionario del 2° Trimestre 2025',
    descrizione:
      'Lezionario della Scuola del Sabato per il secondo trimestre 2025. Continua il tuo percorso di crescita spirituale.',
    tipo: 'lezionario',
    anno: 2025,
    trimestre: 2,
    lingua: 'it',
    filePath: '/documents/Lezionario2-2025.pdf',
    fileSize: 2450000,
    pagine: 118,
    copertina: '',
    tags: [
      'lezionario',
      'scuola sabato',
      '2025',
      'q2',
      'studio biblico',
      'trimestre',
    ],
    autore: 'Conferenza Generale degli Avventisti del 7° Giorno',
    editore: 'SDA Italia',
    dataPubblicazione: new Date(2025, 3, 1), // Aprile 2025
    versione: '1.0',
    downloads: 0,
    views: 0,
    inEvidenza: true,
    status: 'published',
    isPublic: true,
  },

  {
    titolo: 'Lezionario del 3° Trimestre 2025',
    descrizione:
      'Lezionario della Scuola del Sabato per il terzo trimestre 2025. Approfondimenti biblici per l\'estate.',
    tipo: 'lezionario',
    anno: 2025,
    trimestre: 3,
    lingua: 'it',
    filePath: '/documents/Lezionario-3-2025.pdf',
    fileSize: 2480000,
    pagine: 122,
    copertina: '',
    tags: [
      'lezionario',
      'scuola sabato',
      '2025',
      'q3',
      'studio biblico',
      'trimestre',
    ],
    autore: 'Conferenza Generale degli Avventisti del 7° Giorno',
    editore: 'SDA Italia',
    dataPubblicazione: new Date(2025, 6, 1), // Luglio 2025
    versione: '1.0',
    downloads: 0,
    views: 0,
    inEvidenza: true,
    status: 'published',
    isPublic: true,
  },

  // Lezionari 2026
  {
    titolo: 'Lezionario del 1° Trimestre 2026',
    descrizione:
      'Lezionario della Scuola del Sabato per il primo trimestre 2026. Inizia il nuovo anno con studi biblici approfonditi.',
    tipo: 'lezionario',
    anno: 2026,
    trimestre: 1,
    lingua: 'it',
    filePath: '/documents/Lezionario-1-2026.pdf',
    fileSize: 2520000,
    pagine: 125,
    copertina: '',
    tags: [
      'lezionario',
      'scuola sabato',
      '2026',
      'q1',
      'studio biblico',
      'trimestre',
      'nuovo',
    ],
    autore: 'Conferenza Generale degli Avventisti del 7° Giorno',
    editore: 'SDA Italia',
    dataPubblicazione: new Date(2026, 0, 1), // Gennaio 2026
    versione: '1.0',
    downloads: 0,
    views: 0,
    inEvidenza: true, // In evidenza perché è il più recente
    status: 'published',
    isPublic: true,
  },

  // Settimana di Preghiera Speciale 2025
  {
    titolo: 'Settimana di Preghiera Speciale 2025',
    descrizione:
      'Materiale per la Settimana di Preghiera Speciale 2025. Riflessioni quotidiane per rinnovare la tua comunione con Dio.',
    tipo: 'settimana_preghiera',
    anno: 2025,
    trimestre: null, // Non applicabile per settimane di preghiera
    lingua: 'it',
    filePath: '/documents/Sett. Pregh. Speciale 2025.pdf',
    fileSize: 1800000,
    pagine: 85,
    copertina: '',
    tags: [
      'settimana preghiera',
      '2025',
      'preghiera',
      'devozione',
      'spiritualità',
      'meditazione',
    ],
    autore: 'SDA Italia',
    editore: 'SDA Italia',
    dataPubblicazione: new Date(2025, 0, 15), // Metà gennaio 2025
    versione: '1.0',
    downloads: 0,
    views: 0,
    inEvidenza: true,
    status: 'published',
    isPublic: true,
  },
];

/**
 * Connessione al database MongoDB
 */
const connectDB = async () => {
  try {
    const DB = process.env.MONGODB_URI;
    
    if (!DB) {
      throw new Error('MONGODB_URI non trovata in config.env');
    }

    await mongoose.connect(DB, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log('✅ Connessione al database riuscita!');
  } catch (err) {
    console.error('❌ Errore di connessione al database:', err);
    process.exit(1);
  }
};

/**
 * Importa i documenti nel database
 */
const importData = async () => {
  try {
    await Documento.deleteMany(); // Rimuovi documenti esistenti
    await Documento.create(documentiData);

    console.log('✅ Documenti importati con successo!');
    console.log(`📄 Totale documenti importati: ${documentiData.length}`);
    console.log('');
    console.log('📊 Riepilogo:');
    console.log(
      `   - Lezionari: ${
        documentiData.filter((d) => d.tipo === 'lezionario').length
      }`
    );
    console.log(
      `   - Settimane di Preghiera: ${
        documentiData.filter((d) => d.tipo === 'settimana_preghiera').length
      }`
    );
    console.log('');
    console.log('🔗 API Endpoints disponibili:');
    console.log('   GET /api/v1/documenti');
    console.log('   GET /api/v1/documenti/lezionari?anno=2026&trimestre=1');
    console.log('   GET /api/v1/documenti/settimane-preghiera?anno=2025');
    console.log('   GET /api/v1/documenti/in-evidenza');
    console.log('   GET /api/v1/documenti/anni-disponibili');
  } catch (err) {
    console.error('❌ Errore durante l\'importazione:', err);
  }

  process.exit();
};

/**
 * Elimina tutti i documenti dal database
 */
const deleteData = async () => {
  try {
    await Documento.deleteMany();
    console.log('🗑️ Documenti eliminati con successo!');
  } catch (err) {
    console.error('❌ Errore durante l\'eliminazione:', err);
  }

  process.exit();
};

// Esecuzione dello script
const run = async () => {
  await connectDB();

  if (process.argv[2] === '--delete') {
    await deleteData();
  } else {
    await importData();
  }
};

run();

/**
 * Usage:
 *
 * Import data:
 *   node seed-documenti.js
 *
 * Delete all data:
 *   node seed-documenti.js --delete
 */
