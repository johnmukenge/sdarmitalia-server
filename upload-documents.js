/**
 * @file upload-documents.js
 * @description Script interattivo per aggiungere nuovi documenti al database
 * @version 1.0
 * @author SDA Italia Dev Team
 *
 * Questo script permette di aggiungere facilmente nuovi documenti
 * (Lezionari, Settimane di Preghiera, etc.) al database MongoDB
 *
 * Usage: node upload-documents.js
 */

const mongoose = require('mongoose');
const readline = require('readline');
const Documento = require('./models/documentiModel');
require('dotenv').config({ path: './config.env' });

// Configurazione readline per input utente
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

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

    console.log('✅ Connessione al database riuscita!\n');
  } catch (err) {
    console.error('❌ Errore di connessione al database:', err);
    process.exit(1);
  }
};

/**
 * Chiede input all'utente
 */
const question = (prompt) => {
  return new Promise((resolve) => {
    rl.question(prompt, (answer) => {
      resolve(answer);
    });
  });
};

/**
 * Script interattivo per aggiungere un documento
 */
const addDocument = async () => {
  console.log('='.repeat(60));
  console.log('📄 AGGIUNGI NUOVO DOCUMENTO AL DATABASE');
  console.log('='.repeat(60));
  console.log('');

  try {
    // Tipo di documento
    console.log('Tipi disponibili:');
    console.log('1. lezionario');
    console.log('2. settimana_preghiera');
    console.log('3. guida_studio');
    console.log('4. materiale_evangelismo');
    console.log('5. rivista');
    console.log('6. bollettino');
    console.log('7. altro');
    console.log('');

    const tipoScelta = await question('Scegli il tipo (1-7): ');
    const tipiMap = {
      1: 'lezionario',
      2: 'settimana_preghiera',
      3: 'guida_studio',
      4: 'materiale_evangelismo',
      5: 'rivista',
      6: 'bollettino',
      7: 'altro',
    };
    const tipo = tipiMap[tipoScelta];

    if (!tipo) {
      throw new Error('Tipo non valido');
    }

    // Informazioni base
    const titolo = await question('\n📝 Titolo del documento: ');
    const descrizione = await question('📄 Descrizione (min 20 caratteri): ');
    const anno = parseInt(await question('📅 Anno (es. 2026): '));

    let trimestre = null;
    if (tipo === 'lezionario') {
      trimestre = parseInt(await question('📊 Trimestre (1-4): '));
      if (trimestre < 1 || trimestre > 4) {
        throw new Error('Trimestre deve essere tra 1 e 4');
      }
    }

    const filePath = await question(
      '📁 Percorso file (es. /documents/Lezionario-1-2026.pdf): '
    );

    // Informazioni opzionali
    const fileSize = await question(
      '💾 Dimensione file in bytes (premi Enter per saltare): '
    );
    const pagine = await question(
      '📄 Numero pagine (premi Enter per saltare): '
    );
    const autore = await question(
      '✍️ Autore (default: SDA Italia, premi Enter per confermare): '
    );
    const tags = await question(
      '🏷️ Tags separati da virgola (es. lezionario,2026,q1): '
    );

    const inEvidenzaInput = await question(
      '⭐ In evidenza? (s/n, default: n): '
    );
    const inEvidenza =
      inEvidenzaInput.toLowerCase() === 's' ||
      inEvidenzaInput.toLowerCase() === 'si';

    // Creazione documento
    const nuovoDocumento = {
      titolo,
      descrizione,
      tipo,
      anno,
      trimestre,
      lingua: 'it',
      filePath,
      fileSize: fileSize ? parseInt(fileSize) : undefined,
      pagine: pagine ? parseInt(pagine) : undefined,
      tags: tags ? tags.split(',').map((t) => t.trim().toLowerCase()) : [],
      autore: autore || 'SDA Italia',
      editore: 'SDA Italia',
      dataPubblicazione: new Date(),
      versione: '1.0',
      downloads: 0,
      views: 0,
      inEvidenza,
      status: 'published',
      isPublic: true,
    };

    // Conferma
    console.log('\n' + '='.repeat(60));
    console.log('📋 RIEPILOGO DOCUMENTO:');
    console.log('='.repeat(60));
    console.log(JSON.stringify(nuovoDocumento, null, 2));
    console.log('='.repeat(60));

    const conferma = await question(
      '\n✅ Confermi l\'inserimento? (s/n): '
    );

    if (
      conferma.toLowerCase() === 's' ||
      conferma.toLowerCase() === 'si'
    ) {
      const documento = await Documento.create(nuovoDocumento);
      console.log('\n✅ Documento creato con successo!');
      console.log(`📄 ID: ${documento._id}`);
      console.log(`📝 Titolo: ${documento.titolo}`);
      console.log(
        `🔗 Endpoint: GET /api/v1/documenti/${documento._id}`
      );
    } else {
      console.log('\n❌ Inserimento annullato.');
    }
  } catch (error) {
    console.error('\n❌ Errore durante l\'inserimento:', error.message);
  }
};

/**
 * Menu principale
 */
const mainMenu = async () => {
  console.log('\n' + '='.repeat(60));
  console.log('📚 GESTIONE DOCUMENTI - MENU PRINCIPALE');
  console.log('='.repeat(60));
  console.log('1. Aggiungi nuovo documento');
  console.log('2. Lista tutti i documenti');
  console.log('3. Cerca documento per titolo');
  console.log('4. Elimina documento');
  console.log('5. Statistiche');
  console.log('0. Esci');
  console.log('='.repeat(60));

  const scelta = await question('\nScegli un\'opzione (0-5): ');

  switch (scelta) {
    case '1':
      await addDocument();
      await mainMenu();
      break;

    case '2':
      await listAllDocuments();
      await mainMenu();
      break;

    case '3':
      await searchDocument();
      await mainMenu();
      break;

    case '4':
      await deleteDocument();
      await mainMenu();
      break;

    case '5':
      await showStats();
      await mainMenu();
      break;

    case '0':
      console.log('\n👋 Arrivederci!\n');
      rl.close();
      process.exit(0);
      break;

    default:
      console.log('\n❌ Opzione non valida!');
      await mainMenu();
  }
};

/**
 * Lista tutti i documenti
 */
const listAllDocuments = async () => {
  try {
    const documenti = await Documento.find()
      .select('titolo tipo anno trimestre downloads views')
      .sort({ anno: -1, trimestre: -1 });

    console.log('\n' + '='.repeat(60));
    console.log('📚 LISTA DOCUMENTI');
    console.log('='.repeat(60));

    if (documenti.length === 0) {
      console.log('Nessun documento trovato.');
    } else {
      documenti.forEach((doc, index) => {
        console.log(
          `\n${index + 1}. ${doc.titolo}`
        );
        console.log(`   ID: ${doc._id}`);
        console.log(
          `   Tipo: ${doc.tipo} | Anno: ${doc.anno}${
            doc.trimestre ? ` | Q${doc.trimestre}` : ''
          }`
        );
        console.log(
          `   📊 Downloads: ${doc.downloads} | Views: ${doc.views}`
        );
      });

      console.log(`\n📄 Totale: ${documenti.length} documenti`);
    }

    console.log('='.repeat(60));
  } catch (error) {
    console.error('❌ Errore:', error.message);
  }
};

/**
 * Cerca documento per titolo
 */
const searchDocument = async () => {
  try {
    const termineRicerca = await question(
      '\n🔍 Inserisci termine di ricerca: '
    );

    const documenti = await Documento.find({
      $or: [
        { titolo: { $regex: termineRicerca, $options: 'i' } },
        { descrizione: { $regex: termineRicerca, $options: 'i' } },
      ],
    });

    console.log('\n' + '='.repeat(60));
    console.log(`📚 RISULTATI RICERCA: "${termineRicerca}"`);
    console.log('='.repeat(60));

    if (documenti.length === 0) {
      console.log('Nessun documento trovato.');
    } else {
      documenti.forEach((doc, index) => {
        console.log(`\n${index + 1}. ${doc.titolo}`);
        console.log(`   ID: ${doc._id}`);
        console.log(`   Tipo: ${doc.tipo} | Anno: ${doc.anno}`);
        console.log(`   Descrizione: ${doc.descrizione.substring(0, 80)}...`);
      });

      console.log(`\n📄 Trovati: ${documenti.length} risultati`);
    }

    console.log('='.repeat(60));
  } catch (error) {
    console.error('❌ Errore:', error.message);
  }
};

/**
 * Elimina documento
 */
const deleteDocument = async () => {
  try {
    const documentoId = await question(
      '\n🗑️ Inserisci ID del documento da eliminare: '
    );

    const documento = await Documento.findById(documentoId);

    if (!documento) {
      console.log('❌ Documento non trovato!');
      return;
    }

    console.log(`\n📄 Documento trovato: ${documento.titolo}`);
    const conferma = await question(
      '⚠️ Sei sicuro di voler eliminare questo documento? (s/n): '
    );

    if (
      conferma.toLowerCase() === 's' ||
      conferma.toLowerCase() === 'si'
    ) {
      await Documento.findByIdAndDelete(documentoId);
      console.log('✅ Documento eliminato con successo!');
    } else {
      console.log('❌ Eliminazione annullata.');
    }
  } catch (error) {
    console.error('❌ Errore:', error.message);
  }
};

/**
 * Mostra statistiche
 */
const showStats = async () => {
  try {
    const stats = await Documento.getStats();

    console.log('\n' + '='.repeat(60));
    console.log('📊 STATISTICHE DOCUMENTI');
    console.log('='.repeat(60));
    console.log(`Totale documenti: ${stats.totalDocumenti}`);
    console.log(`Documenti pubblicati: ${stats.pubblicati}`);
    console.log(`Totale downloads: ${stats.totalDownloads}`);
    console.log(`Totale views: ${stats.totalViews}`);
    console.log('\nDocumenti per tipo:');

    Object.entries(stats.perTipo).forEach(([tipo, count]) => {
      console.log(`  - ${tipo}: ${count}`);
    });

    console.log('='.repeat(60));
  } catch (error) {
    console.error('❌ Errore:', error.message);
  }
};

/**
 * Avvio applicazione
 */
const run = async () => {
  await connectDB();
  await mainMenu();
};

run();
