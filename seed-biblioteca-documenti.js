/**
 * @file seed-biblioteca-documenti.js
 * @description Script di seed per importare Lezionari e Settimane di Preghiera dalla cartella /documents nella Biblioteca Digitale
 * @version 1.0
 * @author SDA Italia Dev Team
 *
 * Importa i documenti dalla cartella sdarmitalia/public/documents/ nel modello Libro
 * 
 * Usage:
 *   node seed-biblioteca-documenti.js           # Importa i documenti
 *   node seed-biblioteca-documenti.js --delete  # Rimuove solo lezionari e settimane di preghiera
 */

const mongoose = require('mongoose');
const dotenv = require('dotenv');

// Carica variabili d'ambiente PRIMA di tutto
dotenv.config({ path: './config.env' });

// Verifica che le variabili siano caricate
if (!process.env.MONGODB_URI) {
  console.error('❌ Errore: variabile MONGODB_URI non trovata in config.env');
  console.error('   Assicurati che il file config.env esista e contenga:');
  console.error('   MONGODB_URI=mongodb+srv://...');
  process.exit(1);
}

const Libro = require('./models/libriModel');

// Connetti al database
const DB = process.env.MONGODB_URI;

const connectDB = async () => {
  try {
    await mongoose.connect(DB);
    console.log('✅ DB connection successful!');
  } catch (err) {
    console.error('❌ DB connection failed:', err);
    process.exit(1);
  }
};

// Dati dei documenti dalla cartella /documents
const documentiData = [
  {
    title: 'Lezionario Biblico - Quarto Trimestre 2024',
    author: 'Chiesa Cristiana Avventista del Settimo Giorno',
    description: 'Studio biblico trimestrale per il quarto trimestre 2024. Approfondimenti e riflessioni per la crescita spirituale quotidiana.',
    category: 'lezionario',
    subcategories: ['studio-biblico', 'devozione'],
    tags: ['lezionario', 'bibbia', 'studio', '2024', 'q4', 'trimestre'],
    filePath: '/documents/Lezionario2024_4_it.pdf',
    fileUrl: 'http://localhost:5000/documents/Lezionario2024_4_it.pdf',
    cover: 'https://via.placeholder.com/300x400/667eea/ffffff?text=Lezionario+Q4+2024',
    language: 'it',
    publisher: 'Edizioni ADV',
    publicationDate: new Date('2024-10-01'),
    version: '1.0',
    anno: 2024,
    trimestre: 4,
    featured: false,
    status: 'published',
    isPublic: true,
    downloads: 0,
    views: 0,
    rating: 0,
    ratingCount: 0,
  },
  {
    title: 'Lezionario Biblico - Primo Trimestre 2025',
    author: 'Chiesa Cristiana Avventista del Settimo Giorno',
    description: 'Studio biblico trimestrale per il primo trimestre 2025. Approfondimenti e riflessioni per iniziare il nuovo anno nella fede.',
    category: 'lezionario',
    subcategories: ['studio-biblico', 'devozione'],
    tags: ['lezionario', 'bibbia', 'studio', '2025', 'q1', 'trimestre'],
    filePath: '/documents/Lezionario1-2025.pdf',
    fileUrl: 'http://localhost:5000/documents/Lezionario1-2025.pdf',
    cover: 'https://via.placeholder.com/300x400/48bb78/ffffff?text=Lezionario+Q1+2025',
    language: 'it',
    publisher: 'Edizioni ADV',
    publicationDate: new Date('2025-01-01'),
    version: '1.0',
    anno: 2025,
    trimestre: 1,
    featured: true,
    status: 'published',
    isPublic: true,
    downloads: 0,
    views: 0,
    rating: 0,
    ratingCount: 0,
  },
  {
    title: 'Lezionario Biblico - Secondo Trimestre 2025',
    author: 'Chiesa Cristiana Avventista del Settimo Giorno',
    description: 'Studio biblico trimestrale per il secondo trimestre 2025. Guida spirituale per la crescita nella conoscenza della Parola.',
    category: 'lezionario',
    subcategories: ['studio-biblico', 'devozione'],
    tags: ['lezionario', 'bibbia', 'studio', '2025', 'q2', 'trimestre'],
    filePath: '/documents/Lezionario2-2025.pdf',
    fileUrl: 'http://localhost:5000/documents/Lezionario2-2025.pdf',
    cover: 'https://via.placeholder.com/300x400/f6ad55/ffffff?text=Lezionario+Q2+2025',
    language: 'it',
    publisher: 'Edizioni ADV',
    publicationDate: new Date('2025-04-01'),
    version: '1.0',
    anno: 2025,
    trimestre: 2,
    featured: false,
    status: 'published',
    isPublic: true,
    downloads: 0,
    views: 0,
    rating: 0,
    ratingCount: 0,
  },
  {
    title: 'Lezionario Biblico - Terzo Trimestre 2025',
    author: 'Chiesa Cristiana Avventista del Settimo Giorno',
    description: 'Studio biblico trimestrale per il terzo trimestre 2025. Percorso di approfondimento biblico per l\'estate.',
    category: 'lezionario',
    subcategories: ['studio-biblico', 'devozione'],
    tags: ['lezionario', 'bibbia', 'studio', '2025', 'q3', 'trimestre'],
    filePath: '/documents/Lezionario-3-2025.pdf',
    fileUrl: 'http://localhost:5000/documents/Lezionario-3-2025.pdf',
    cover: 'https://via.placeholder.com/300x400/ed8936/ffffff?text=Lezionario+Q3+2025',
    language: 'it',
    publisher: 'Edizioni ADV',
    publicationDate: new Date('2025-07-01'),
    version: '1.0',
    anno: 2025,
    trimestre: 3,
    featured: false,
    status: 'published',
    isPublic: true,
    downloads: 0,
    views: 0,
    rating: 0,
    ratingCount: 0,
  },
  {
    title: 'Lezionario Biblico - Primo Trimestre 2026',
    author: 'Chiesa Cristiana Avventista del Settimo Giorno',
    description: 'Studio biblico trimestrale per il primo trimestre 2026. Nuovi approfondimenti per l\'anno nuovo.',
    category: 'lezionario',
    subcategories: ['studio-biblico', 'devozione'],
    tags: ['lezionario', 'bibbia', 'studio', '2026', 'q1', 'trimestre'],
    filePath: '/documents/Lezionario-1-2026.pdf',
    fileUrl: 'http://localhost:5000/documents/Lezionario-1-2026.pdf',
    cover: 'https://via.placeholder.com/300x400/667eea/ffffff?text=Lezionario+Q1+2026',
    language: 'it',
    publisher: 'Edizioni ADV',
    publicationDate: new Date('2026-01-01'),
    version: '1.0',
    anno: 2026,
    trimestre: 1,
    featured: true,
    status: 'published',
    isPublic: true,
    downloads: 0,
    views: 0,
    rating: 0,
    ratingCount: 0,
  },
  {
    title: 'Settimana di Preghiera Speciale 2025',
    author: 'Chiesa Cristiana Avventista del Settimo Giorno',
    description: 'Guida per la settimana di preghiera speciale 2025. Materiale devozionale per un tempo di rinnovamento spirituale e comunione con Dio.',
    category: 'settimana_preghiera',
    subcategories: ['preghiera', 'devozione', 'comunità'],
    tags: ['settimana', 'preghiera', 'devozione', '2025', 'spiritualità', 'comunità'],
    filePath: '/documents/Sett. Pregh. Speciale 2025.pdf',
    fileUrl: 'http://localhost:5000/documents/Sett.%20Pregh.%20Speciale%202025.pdf',
    cover: 'https://via.placeholder.com/300x400/9f7aea/ffffff?text=Settimana+Preghiera+2025',
    language: 'it',
    publisher: 'Edizioni ADV',
    publicationDate: new Date('2025-01-15'),
    version: '1.0',
    anno: 2025,
    featured: true,
    status: 'published',
    isPublic: true,
    downloads: 0,
    views: 0,
    rating: 0,
    ratingCount: 0,
  },
];

// Importa i documenti
const importData = async () => {
  try {
    console.log('📚 Inizio importazione documenti nella Biblioteca Digitale...\n');
    
    // Rimuovi solo lezionari e settimane di preghiera esistenti
    const deleteResult = await Libro.deleteMany({ 
      category: { $in: ['lezionario', 'settimana_preghiera'] } 
    });
    console.log(`🗑️  Rimossi ${deleteResult.deletedCount} documenti esistenti (lezionari e settimane)\n`);

    // Inserisci i nuovi documenti
    const created = await Libro.insertMany(documentiData);
    console.log(`✅ ${created.length} documenti importati con successo!\n`);

    // Statistiche
    console.log('📊 Riepilogo:');
    console.log(`   - Lezionari: ${created.filter(d => d.category === 'lezionario').length}`);
    console.log(`   - Settimane di Preghiera: ${created.filter(d => d.category === 'settimana_preghiera').length}`);
    console.log(`   - Featured: ${created.filter(d => d.featured).length}`);
    console.log('\n🎉 Importazione completata!');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Errore durante l\'importazione:', error);
    process.exit(1);
  }
};

// Elimina i documenti
const deleteData = async () => {
  try {
    console.log('🗑️  Eliminazione documenti in corso...\n');
    
    const deleteResult = await Libro.deleteMany({ 
      category: { $in: ['lezionario', 'settimana_preghiera'] } 
    });
    
    console.log(`✅ ${deleteResult.deletedCount} documenti eliminati (solo lezionari e settimane)!`);
    console.log('ℹ️  Gli altri libri della biblioteca non sono stati toccati.\n');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Errore durante l\'eliminazione:', error);
    process.exit(1);
  }
};

// Esegui lo script
connectDB().then(() => {
  if (process.argv[2] === '--delete') {
    deleteData();
  } else {
    importData();
  }
});
