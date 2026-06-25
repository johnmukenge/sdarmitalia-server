/**
 * @file seed.js
 * @description Script per popolare il database MongoDB con dati fittiizi
 * @version 1.0
 * @author SDA Italia Dev Team
 *
 * Usage:
 *   node seed.js              // Popola il database
 *   node seed.js --reset      // Reset database + popola
 *   node seed.js --clean      // Solo pulisce le collezioni
 *
 * @example
 * node seed.js
 * Output:
 * ✓ Connected to MongoDB Atlas
 * ✓ Cleaned existing collections
 * ✓ Created 10 news articles
 * ✓ Seeded database successfully!
 */

require('dotenv').config({ path: './config.env' });
const mongoose = require('mongoose');

// Importa i modelli
const News = require('./models/newsModel');
const Contact = require('./models/contactModel');
const Event = require('./models/eventiModel');
const Libro = require('./models/libriModel');
const Donazione = require('./models/donazioniModel');

/**
 * Dati fittiizi per le notizie
 * @constant
 */
const newsData = [
  {
    title: 'Nuova Chiesa Inaugurata a Roma',
    subtitle: 'Una bellissima comunità si riunisce per celebrare',
    content:
      'Con grande gioia abbiamo inaugurato la nuova chiesa a Roma. La cerimonia è stata un grande successo con oltre 500 persone presenti. Pastor Giuseppe ha guidato una meravigliosa celebrazione di apertura con musica, preghiere e testimonianze dai membri della comunità.',
    author: 'Marco Rossi',
    category: 'chiesa',
    tags: ['chiesa', 'inaugrazione', 'roma', 'celebrazione'],
    image: 'https://images.unsplash.com/photo-1516542252446-e0e9ad8b0ff0?w=800',
    status: 'published',
    featured: true,
    views: 1250,
    youtubeId: 'dQw4w9WgXcQ',
  },
  {
    title: 'Conferenza Annuale 2026 - Iscrizioni Aperte',
    subtitle: 'Unisciti a noi per una settimana di insegnamenti e comunione',
    content:
      'Le iscrizioni sono aperte per la nostra conferenza annuale 2026! Ospiteremo oratori straordinari che parleranno di fede, speranza e amore. Verranno offerti workshop, studi biblici e sessioni di preghiera. Partecipa a questa meravigliosa esperienza!',
    author: 'Elena Bianchi',
    category: 'evento',
    tags: ['conferenza', 'educazione', 'comunità'],
    image: 'https://images.unsplash.com/photo-1505228395891-9a51e7e86e81?w=800',
    status: 'published',
    featured: true,
    views: 856,
  },
  {
    title: 'Progetto Missionario in Africa',
    subtitle: "Aiutiamo le comunità locali a costruire pozzi d'acqua",
    content:
      "Il nostro progetto missionario in Africa sta andando bene. Abbiamo già costruito 3 pozzi d'acqua potabile in villaggi remoti. Molti bambini ora hanno accesso ad acqua pulita. Grazie ai vostri contributi, possiamo continuare questa missione importante.",
    author: 'Giuseppe Nero',
    category: 'comunita',
    tags: ['missioni', 'carità', 'africa', 'acqua'],
    image: 'https://images.unsplash.com/photo-1559027615-cd4628902d4a?w=800',
    status: 'published',
    views: 2100,
  },
  {
    title: 'Seminario sulla Salute Spirituale',
    subtitle: 'Come mantenere un equilibrio tra corpo, mente e spirito',
    content:
      "Partecipa al nostro seminario sulla salute spirituale. Impareremo come equilibrare il lavoro, la famiglia e la fede. Esperti condivideranno consigli pratici per una vita più consapevole e felice. L'evento si terrà ogni domenica per 4 settimane.",
    author: 'Lucia Verdi',
    category: 'spirituale',
    tags: ['salute', 'spirituale', 'benessere'],
    status: 'published',
    featured: true,
    views: 542,
  },
  {
    title: 'Studi Biblici Gratuiti Online',
    subtitle: 'Accedi ai nostri corsi biblici ogni mercoledì sera',
    content:
      'Siamo felici di annunciare i nostri studi biblici gratuiti online! Ogni mercoledì sera, dalle 20:00 alle 21:30, esamineremo libri della Bibbia. I corsi sono aperti a tutti e non è necessaria alcuna iscrizione anticipata. Unisciti a centinaia di studenti biblici da tutto il mondo!',
    author: 'David Rossini',
    category: 'spirituale',
    tags: ['bibbia', 'studio', 'online', 'gratuito'],
    status: 'published',
    views: 1876,
  },
  {
    title: 'Raccolta Fondi per la Carità',
    subtitle: 'Aiuta le famiglie in difficoltà economica',
    content:
      'Abbiamo lanciato una raccolta fondi per aiutare 10 famiglie della nostra comunità che stanno affrontando difficoltà economiche. Ogni contributo, grande o piccolo, farà una differenza. Il 100% dei fondi raccolti andrà direttamente alle famiglie bisognose.',
    author: 'Anna Martini',
    category: 'generale',
    tags: ['carità', 'raccoltaffondi', 'comunità'],
    image: 'https://images.unsplash.com/photo-1532996122724-8f3c2cd83c5d?w=800',
    status: 'published',
    views: 923,
  },
  {
    title: 'Campeggio Giovani Estate 2026',
    subtitle: "Un'estate indimenticabile con amici e natura",
    content:
      'Ragazzi e ragazze dai 13 ai 18 anni sono invitati al nostro campeggio estivo! Avremo attività ricreative, studi biblici, sport, musica e tanto divertimento. Il campeggio dura una settimana intensa e formativa. Le iscrizioni sono aperte!',
    author: 'Marco Giovani',
    category: 'evento',
    tags: ['giovani', 'campeggio', 'estate', 'avventura'],
    image: 'https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?w=800',
    status: 'published',
    featured: true,
    views: 567,
  },
  {
    title: 'Testimonianza di Guarigione Miracolosa',
    subtitle: 'Come la fede e la preghiera hanno cambiato una vita',
    content:
      'Voglio condividere la mia testimonianza personale di come la fede e la preghiera mi hanno salvato. Due anni fa, i medici mi avevano dato solo pochi mesi di vita. Però ho scelto di credere, pregare e fidarmi di Dio. Oggi sono completamente guarito e più forte di prima!',
    author: 'Paolo Miretti',
    category: 'spirituale',
    tags: ['testimonianza', 'miracolo', 'fede', 'guarigione'],
    status: 'published',
    views: 3450,
  },
  {
    title: 'Nuovo Programma di Educazione Biblica per Bambini',
    subtitle: 'Insegniamo ai bambini i valori biblici attraverso il gioco',
    content:
      'Abbiamo sviluppato un nuovo programma educativo per bambini dai 4 ai 10 anni. Attraverso giochi, canzoni e storie bibliche, i bambini imparano i valori cristiani in modo divertente. Le lezioni si tengono ogni sabato mattina presso la chiesa principale.',
    author: 'Francesca Rossi',
    category: 'spirituale',
    tags: ['bambini', 'educazione', 'bibbia'],
    status: 'published',
    featured: true,
    views: 712,
  },
  {
    title: 'Progetto di Sostenibilità Ambientale',
    subtitle: 'La chiesa si impegna per un ambiente più pulito',
    content:
      'La nostra chiesa ha lanciato un iniziativa di sostenibilità ambientale. Incoraggiamo i nostri membri a ridurre i rifiuti, riciclare e vivere in modo più consapevole. Abbiamo già piantato 500 alberi nel nostro territorio. Unisciti a noi in questa missione!',
    author: 'Roberto Verde',
    category: 'generale',
    tags: ['ambiente', 'sostenibilità', 'natura'],
    image: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=800',
    status: 'published',
    views: 634,
  },
];

/**
 * Dati fittiizi per i contatti
 * @constant
 */
const contactData = [
  {
    nome: 'Giovanni Rossi',
    email: 'giovanni.rossi@email.com',
    telefono: '+39 348 123 4567',
    messaggio:
      'Vorrei saperne di più sui vostri programmi educativi per i bambini.',
    type: 'info',
    status: 'new',
    priority: 'normal',
  },
  {
    nome: 'Maria Bianchi',
    email: 'maria.bianchi@email.com',
    telefono: '+39 349 234 5678',
    messaggio:
      "Ho avuto un'ottima esperienza alla conferenza. Desidero iscrivermi per il prossimo anno!",
    type: 'feedback',
    status: 'read',
    priority: 'normal',
  },
  {
    nome: 'Luca Ferrari',
    email: 'luca.ferrari@email.com',
    telefono: '+39 350 345 6789',
    messaggio:
      'Cerco aiuto con un problema personale. Potete contattarmi al più presto?',
    type: 'support',
    status: 'new',
    priority: 'high',
  },
  {
    nome: 'Elena Conti',
    email: 'elena.conti@email.com',
    telefono: '+39 351 456 7890',
    messaggio:
      'Voglio donare per il progetto missionario in Africa. Come faccio?',
    type: 'info',
    status: 'read',
    priority: 'normal',
  },
  {
    nome: 'Antonio Lombardi',
    email: 'antonio.lombardi@email.com',
    telefono: '+39 352 567 8901',
    messaggio:
      'Ho una segnalazione importante riguardo la sicurezza della chiesa.',
    type: 'support',
    status: 'new',
    priority: 'urgent',
  },
];

/**
 * Dati fittiizi per gli eventi
 * @constant
 */
const eventData = [
  {
    title: 'Conferenza Maggio 2026',
    shortDescription: 'Un evento di comunione e crescita spirituale.',
    description: 'Settimana di incontri, preghiera, musica e studio biblico. Ospiti internazionali, workshop tematici, momenti di lode e comunione.',
    date: new Date(2026, 4, 10), // 10 maggio 2026
    endDate: new Date(2026, 4, 12), // 12 maggio 2026
    location: 'Centro Congressi, Roma',
    gallery: [
      { src: '/assets/events/aprile2026/sii tu una benedizione 1.jpeg', caption: 'Sii tu una benedizione: la gioia della comunione fraterna si riflette nei nostri volti.' },
      { src: '/assets/events/aprile2026/sii tu una benedizione 2.jpeg', caption: 'La presenza di Dio si manifesta dove due o tre sono riuniti nel Suo nome.' },
      { src: '/assets/events/aprile2026/sii tu una benedizione 3.jpeg', caption: 'Ogni sorriso è un dono che illumina il cuore del prossimo.' },
      { src: '/assets/events/aprile2026/sii tu una benedizione 4.jpeg', caption: 'La lode e il canto elevano lo spirito e uniscono la comunità.' },
      { src: '/assets/events/aprile2026/sii tu una benedizione 5.jpeg', caption: 'Insieme, come famiglia spirituale, cresciamo nella fede e nell’amore.' },
      { src: '/assets/events/aprile2026/sii tu una benedizione 6.jpeg', caption: 'La Parola condivisa accende nuove speranze e rafforza la nostra missione.' },
      { src: '/assets/events/aprile2026/sii tu una benedizione 7.jpeg', caption: 'La preghiera ci unisce e ci rende strumenti di pace.' },
      { src: '/assets/events/aprile2026/sii tu una benedizione 8.jpeg', caption: 'Ogni incontro è un’opportunità per testimoniare la grazia di Cristo.' },
      { src: '/assets/events/aprile2026/sii tu una benedizione 9.jpeg', caption: 'La benedizione si moltiplica quando viene condivisa con gioia.' },
      { src: '/assets/events/aprile2026/sii tu una benedizione 10.jpeg', caption: 'Ringraziamo il Signore per ogni momento vissuto insieme nella Sua presenza.' }
    ],
    tags: ['conferenza', 'spiritualità', 'comunione'],
    organizer: 'SDA Italia',
    status: 'scheduled',
    featured: true
  },
  {
    title: 'Culto Domenicale',
    shortDescription: 'Celebrazione settimanale con musica, preghiera e insegnamento biblico.',
    description: 'Tutti sono benvenuti! Ogni domenica alle 10:00 presso la Chiesa Principale di Roma.',
    date: new Date(2026, 5, 7, 10, 0), // 7 giugno 2026
    location: 'Chiesa Principale di Roma, Via del Corso 100',
    gallery: [
      { src: '/assets/events/culto/culto1.jpg', caption: 'Momento di preghiera durante il culto.' },
      { src: '/assets/events/culto/culto2.jpg', caption: 'Coro della comunità in azione.' }
    ],
    tags: ['culto', 'settimanale', 'preghiera'],
    organizer: 'Pastore Giuseppe',
    status: 'scheduled',
    featured: false
  },
  {
    title: 'Campeggio Giovani Primavera',
    shortDescription: 'Tre giorni di divertimento e crescita spirituale per ragazzi e ragazze.',
    description: 'Attività ricreative, giochi, studi biblici e momenti di comunione immersi nella natura.',
    date: new Date(2026, 6, 15, 8, 0), // 15 luglio 2026
    endDate: new Date(2026, 6, 18, 17, 0), // 18 luglio 2026
    location: 'Campeggio del Lago, Via della Natura 20',
    gallery: [
      { src: '/assets/events/campeggio/campeggio1.jpg', caption: 'Giochi di gruppo all’aperto.' },
      { src: '/assets/events/campeggio/campeggio2.jpg', caption: 'Momenti di riflessione e preghiera.' }
    ],
    tags: ['giovani', 'campeggio', 'divertimento'],
    organizer: 'Coordinatore Giovani',
    status: 'scheduled',
    featured: false
  },
  {
    title: 'Seminario sulla Salute Olistica',
    shortDescription: 'Imparare come prendersi cura della salute fisica, mentale e spirituale.',
    description: 'Esperti condivideranno consigli pratici per una vita più consapevole e felice.',
    date: new Date(2026, 7, 2, 14, 0), // 2 agosto 2026
    location: 'Centro Wellness, Via della Salute 15',
    gallery: [
      { src: '/assets/events/salute/salute1.jpg', caption: 'Sessione di gruppo sul benessere.' }
    ],
    tags: ['salute', 'benessere', 'seminario'],
    organizer: 'Dott. Marco',
    status: 'scheduled',
    featured: false
  },
  {
    title: 'Raccolta Fondi Charity Dinner',
    shortDescription: 'Cena di beneficenza per sostenere il progetto missionario in Africa.',
    description: 'Musica dal vivo, testimonianze e raccolta fondi per progetti missionari.',
    date: new Date(2026, 8, 20, 19, 0), // 20 settembre 2026
    location: 'Ristorante Italia Palace, Piazza Venezia 5',
    gallery: [
      { src: '/assets/events/charity/charity1.jpg', caption: 'Cena di beneficenza con la comunità.' }
    ],
    tags: ['carità', 'raccoltaffondi', 'cena'],
    organizer: 'Comitato Missioni',
    status: 'scheduled',
    featured: false
  },
  {
    title: 'Lezioni di Pianoforte Cristiano',
    shortDescription: 'Lezioni settimanali per imparare a suonare musica cristiana al pianoforte.',
    description: 'Aperte a tutti i livelli. Ogni martedì alle 16:00.',
    date: new Date(2026, 9, 6, 16, 0), // 6 ottobre 2026
    location: 'Sala Musica, Via della Musica 30',
    gallery: [
      { src: '/assets/events/pianoforte/piano1.jpg', caption: 'Lezione di pianoforte in corso.' }
    ],
    tags: ['musica', 'lezioni', 'pianoforte'],
    organizer: 'Maestro Giulio',
    status: 'scheduled',
    featured: false
  },
  {
    title: 'Visita Missionaria in Africa',
    shortDescription: 'Viaggio di due settimane per servire nelle comunità locali.',
    description: 'Visita ai progetti missionari, attività di volontariato e supporto alle famiglie.',
    date: new Date(2026, 10, 10, 6, 0), // 10 novembre 2026
    endDate: new Date(2026, 10, 24, 20, 0), // 24 novembre 2026
    location: 'Tanzania - Africa',
    gallery: [
      { src: '/assets/events/missioni/missione1.jpg', caption: 'Volontari in azione in Africa.' }
    ],
    tags: ['missioni', 'viaggio', 'africa'],
    organizer: 'Coordinatore Missioni',
    status: 'scheduled',
    featured: false
  }
];

/**
 * Dati fittiizi per la biblioteca
 * @constant
 */
const libriData = [
  {
    title: 'La Grande Controversia',
    author: 'Ellen G. White',
    description:
      "Un'affascinante storia del grande conflitto tra il bene e il male attraverso i secoli. Una prospettiva cristiana sui principali eventi della storia umana.",
    category: 'teologia',
    subcategories: ['storia', 'spirituale'],
    tags: ['grande-controversia', 'storia', 'battaglia-spirituale', 'classico'],
    filePath: '/books/la-grande-controversia.pdf',
    fileSize: 2500000,
    language: 'it',
    isbn: '9788875080015',
    publisher: 'ADEP',
    publicationDate: new Date(1888, 0, 1),
    version: '1.0',
    pages: 688,
    rating: 4.8,
    ratingCount: 125,
    downloads: 5420,
    featured: true,
    status: 'published',
    isPublic: true,
  },
  {
    title: 'Patriarchi e Profeti',
    author: 'Ellen G. White',
    description:
      'La storia dei patriarchi e dei profeti della Bibbia raccontata in modo affascinante. Scopri i loro insegnamenti e le loro esperienze spirituali.',
    category: 'bibbia',
    subcategories: ['storia', 'insegnamento'],
    tags: ['patriarchi', 'profeti', 'antico-testamento', 'storia-biblica'],
    filePath: '/books/patriarchi-profeti.pdf',
    fileSize: 3200000,
    language: 'it',
    isbn: '9788875080022',
    publisher: 'ADEP',
    publicationDate: new Date(1890, 0, 1),
    version: '1.0',
    pages: 752,
    rating: 4.9,
    ratingCount: 98,
    downloads: 4850,
    featured: true,
    status: 'published',
    isPublic: true,
  },
  {
    title: 'I Disacordi Fondamentali della Fede Cristiana',
    author: 'David J. Gushee',
    description:
      "Un'analisi profonda dei principi essenziali della fede cristiana e come viverli nella vita quotidiana.",
    category: 'teologia',
    subcategories: ['dottrina', 'fede'],
    tags: ['fede', 'dottrina', 'cristianesimo', 'pratica'],
    filePath: '/books/disaccordi-fondamentali.pdf',
    fileSize: 1800000,
    language: 'it',
    isbn: '9788875080039',
    publisher: 'ADEP',
    publicationDate: new Date(2005, 0, 1),
    version: '1.0',
    pages: 512,
    rating: 4.6,
    ratingCount: 78,
    downloads: 3210,
    featured: false,
    status: 'published',
    isPublic: true,
  },
  {
    title: 'La Bibbia Commentata',
    author: 'Vari Autori',
    description:
      'Un commento completo della Bibbia con note esplicative, riferimenti storici e spirituali.',
    category: 'bibbia',
    subcategories: ['commento', 'studio'],
    tags: ['bibbia', 'commento', 'studio', 'riferimento'],
    filePath: '/books/bibbia-commentata.pdf',
    fileSize: 5600000,
    language: 'it',
    isbn: '9788875080046',
    publisher: 'ADEP',
    publicationDate: new Date(2010, 0, 1),
    version: '2.0',
    pages: 1456,
    rating: 4.7,
    ratingCount: 156,
    downloads: 6780,
    featured: true,
    status: 'published',
    isPublic: true,
  },
  {
    title: 'La Scienza della Nutrizione',
    author: 'Dr. Caldwell Esselstyn',
    description:
      'Come mantenere una buona salute attraverso una corretta alimentazione basata su principi biblici.',
    category: 'salute',
    subcategories: ['nutrizione', 'salute'],
    tags: ['nutrizione', 'salute', 'dieta', 'benessere'],
    filePath: '/books/scienza-nutrizione.pdf',
    fileSize: 2100000,
    language: 'it',
    isbn: '9788875080053',
    publisher: 'ADEP',
    publicationDate: new Date(2015, 0, 1),
    version: '1.0',
    pages: 384,
    rating: 4.5,
    ratingCount: 89,
    downloads: 2950,
    featured: false,
    status: 'published',
    isPublic: true,
  },
  {
    title: 'Gesù di Nazareth',
    author: 'Ellen G. White',
    description:
      'La vita di Gesù descritta con dettagli biblici e spirituali. Una meditazione profonda sul suo ministero terrestre.',
    category: 'bibbia',
    subcategories: ['vangeli', 'cristologia'],
    tags: ['gesù', 'cristo', 'vangelo', 'nuovo-testamento'],
    filePath: '/books/gesu-nazareth.pdf',
    fileSize: 2800000,
    language: 'it',
    isbn: '9788875080060',
    publisher: 'ADEP',
    publicationDate: new Date(1898, 0, 1),
    version: '1.0',
    pages: 832,
    rating: 4.9,
    ratingCount: 142,
    downloads: 5670,
    featured: true,
    status: 'published',
    isPublic: true,
  },
  {
    title: 'Profezie Bibliche Moderne',
    author: 'Mark Finley',
    description:
      'Un esame affascinante delle profezie bibliche e del loro significato per il nostro tempo.',
    category: 'proposta',
    subcategories: ['profezia', 'ultimità'],
    tags: ['profezie', 'apocalittica', 'ultimità', 'tempo-fine'],
    filePath: '/books/profezie-bibliche.pdf',
    fileSize: 1950000,
    language: 'it',
    isbn: '9788875080077',
    publisher: 'ADEP',
    publicationDate: new Date(2008, 0, 1),
    version: '1.0',
    pages: 456,
    rating: 4.7,
    ratingCount: 105,
    downloads: 4230,
    featured: true,
    status: 'published',
    isPublic: true,
  },
  {
    title: "L'Arte della Comunicazione Cristiana",
    author: 'John Graz',
    description:
      'Come comunicare efficacemente i principi cristiani in un mondo moderno.',
    category: 'educazione',
    subcategories: ['comunicazione', 'testimonianza'],
    tags: ['comunicazione', 'testimonianza', 'dialogo', 'missione'],
    filePath: '/books/arte-comunicazione.pdf',
    fileSize: 1600000,
    language: 'it',
    isbn: '9788875080084',
    publisher: 'ADEP',
    publicationDate: new Date(2012, 0, 1),
    version: '1.0',
    pages: 368,
    rating: 4.4,
    ratingCount: 67,
    downloads: 2100,
    featured: false,
    status: 'published',
    isPublic: true,
  },
  {
    title: 'La Famiglia nella Bibbia',
    author: 'Varios Autores',
    description:
      "Uno studio biblico completo sul valore, l'importanza e la struttura della famiglia secondo la Bibbia.",
    category: 'famiglia',
    subcategories: ['matrimonio', 'genitori'],
    tags: ['famiglia', 'matrimonio', 'genitori', 'figli'],
    filePath: '/books/famiglia-bibbia.pdf',
    fileSize: 1850000,
    language: 'it',
    isbn: '9788875080091',
    publisher: 'ADEP',
    publicationDate: new Date(2014, 0, 1),
    version: '1.0',
    pages: 420,
    rating: 4.6,
    ratingCount: 94,
    downloads: 3450,
    featured: true,
    status: 'published',
    isPublic: true,
  },
  {
    title: 'Storie di Fede e Coraggio',
    author: 'Colportori Avventisti',
    description:
      'Testimonianze reali di uomini e donne che hanno vivuto la loro fede in circostanze difficili.',
    category: 'storia',
    subcategories: ['testimonianze', 'biografie'],
    tags: ['testimonianze', 'biografie', 'storie-vere', 'ispirazione'],
    filePath: '/books/storie-fede-coraggio.pdf',
    fileSize: 1400000,
    language: 'it',
    isbn: '9788875080108',
    publisher: 'ADEP',
    publicationDate: new Date(2016, 0, 1),
    version: '1.0',
    pages: 312,
    rating: 4.5,
    ratingCount: 72,
    downloads: 2340,
    featured: false,
    status: 'published',
    isPublic: true,
  },
  {
    title: 'Guida al Sabbath',
    author: 'Ellen G. White',
    description:
      'Una guida completa su come celebrare il Sabbath nel modo che Dio ha insegnato.',
    category: 'teologia',
    subcategories: ['festa', 'pratica'],
    tags: ['sabbath', 'riposo', 'celebrazione', 'santo'],
    filePath: '/books/guida-sabbath.pdf',
    fileSize: 980000,
    language: 'it',
    isbn: '9788875080115',
    publisher: 'ADEP',
    publicationDate: new Date(2001, 0, 1),
    version: '1.0',
    pages: 256,
    rating: 4.8,
    ratingCount: 118,
    downloads: 4560,
    featured: true,
    status: 'published',
    isPublic: true,
  },
  {
    title: 'La Preghiera Potente',
    author: 'Andrew Murray',
    description:
      'Un insegnamento profondo su come pregare in modo efficace e ricevere risposte da Dio.',
    category: 'teologia',
    subcategories: ['preghiera', 'devozione'],
    tags: ['preghiera', 'devozione', 'intimità-con-dio', 'spirito'],
    filePath: '/books/preghiera-potente.pdf',
    fileSize: 1200000,
    language: 'it',
    isbn: '9788875080122',
    publisher: 'ADEP',
    publicationDate: new Date(2003, 0, 1),
    version: '1.0',
    pages: 288,
    rating: 4.7,
    ratingCount: 96,
    downloads: 3780,
    featured: false,
    status: 'published',
    isPublic: true,
  },
];

/**
 * Dati fittiizi per le donazioni
 * @constant
 */
const donazioniData = [
  {
    importo: 5000, // €50
    email: 'giovanni@email.com',
    nome: 'Giovanni Rossi',
    telefono: '+39 348 123 4567',
    messaggio: 'Voglio contribuire al progetto missionario!',
    anonimo: false,
    tipo: 'singola',
    categoria: 'missioni',
    status: 'completed',
    metodoPagamento: 'card',
    ricevuta: true,
    dataPagamento: new Date(2026, 0, 1),
    stripePaymentIntentId: 'pi_test_001',
  },
  {
    importo: 10000, // €100
    email: 'maria@email.com',
    nome: 'Maria Bianchi',
    telefono: '+39 349 234 5678',
    anonimo: false,
    tipo: 'ricorrente',
    categoria: 'generale',
    status: 'completed',
    metodoPagamento: 'card',
    ricevuta: true,
    dataPagamento: new Date(2026, 0, 5),
    stripePaymentIntentId: 'pi_test_002',
    recurringDetails: {
      frequency: 'monthly',
      nextDueDate: new Date(2026, 1, 5),
      isActive: true,
    },
  },
  {
    importo: 2500, // €25
    email: 'luca@email.com',
    nome: 'Luca Ferrari',
    anonimo: true,
    tipo: 'singola',
    categoria: 'chiesa',
    status: 'completed',
    metodoPagamento: 'card',
    dataPagamento: new Date(2026, 0, 3),
    stripePaymentIntentId: 'pi_test_003',
  },
  {
    importo: 15000, // €150
    email: 'elena@email.com',
    nome: 'Elena Conti',
    telefono: '+39 351 456 7890',
    messaggio: "Per l'educazione dei bambini",
    anonimo: false,
    tipo: 'singola',
    categoria: 'educazione',
    status: 'completed',
    metodoPagamento: 'card',
    ricevuta: true,
    dataPagamento: new Date(2026, 0, 2),
    stripePaymentIntentId: 'pi_test_004',
  },
  {
    importo: 3000, // €30
    email: 'antonio@email.com',
    nome: 'Antonio Lombardi',
    tipo: 'ricorrente',
    categoria: 'progetti',
    status: 'completed',
    metodoPagamento: 'card',
    dataPagamento: new Date(2025, 11, 15),
    stripePaymentIntentId: 'pi_test_005',
    recurringDetails: {
      frequency: 'quarterly',
      nextDueDate: new Date(2026, 2, 15),
      isActive: true,
    },
  },
];

/**
 * Pulisce tutte le collezioni dal database
 * @async
 * @function cleanDatabase
 * @returns {Promise<void>}
 */
async function cleanDatabase() {
  console.log('\n🧹 Pulizia collezioni...');

  try {
    await News.deleteMany({});
    console.log('   ✓ News pulite');

    await Contact.deleteMany({});
    console.log('   ✓ Contatti puliti');

    await Event.deleteMany({});
    console.log('   ✓ Eventi puliti');

    await Libro.deleteMany({});
    console.log('   ✓ Libri puliti');

    await Donazione.deleteMany({});
    console.log('   ✓ Donazioni pulite');
  } catch (error) {
    console.error('❌ Errore nella pulizia:', error.message);
    throw error;
  }
}

/**
 * Popola il database con dati fittiizi
 * @async
 * @function seedDatabase
 * @returns {Promise<void>}
 */
async function seedDatabase() {
  try {
    // Connessione al database
    const mongoUri = process.env.MONGODB_URI;

    if (!mongoUri) {
      throw new Error('MONGODB_URI non definito in config.env');
    }

    console.log('\n🔗 Connessione a MongoDB Atlas...');
    await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 10000,
      socketTimeoutMS: 45000,
    });
    console.log('✓ Connesso a MongoDB Atlas');

    // Drop indice duplicato da Donazioni se esiste
    try {
      await mongoose.connection
        .collection('donazioni')
        .dropIndex('stripePaymentIntentId_1');
      console.log('   ✓ Indice duplicato rimosso');
    } catch (err) {
      // Indice non esiste, continua
    }

    // Pulisci il database
    await cleanDatabase();

    // Popola con dati
    console.log('\n📝 Popolazione database...');

    const createdNews = await News.insertMany(newsData);
    console.log(`   ✓ ${createdNews.length} articoli di news creati`);

    const createdContacts = await Contact.insertMany(contactData);
    console.log(`   ✓ ${createdContacts.length} messaggi di contatto creati`);

    const createdEvents = await Event.insertMany(eventData);
    console.log(`   ✓ ${createdEvents.length} eventi creati`);

    const createdLibri = await Libro.insertMany(libriData);
    console.log(`   ✓ ${createdLibri.length} libri creati`);

    const createdDonazioni = await Donazione.insertMany(donazioniData);
    console.log(`   ✓ ${createdDonazioni.length} donazioni create`);

    // Statistiche finali
    const totalDocs =
      createdNews.length +
      createdContacts.length +
      createdEvents.length +
      createdLibri.length +
      createdDonazioni.length;

    console.log('\n✅ Database popolato con successo!');
    console.log(`\n📊 Statistiche finali:`);
    console.log(`   Database: sdarmitalia`);
    console.log(`   Collezioni: 5`);
    console.log(`   Documenti totali: ${totalDocs}`);
    console.log(`   - News: ${createdNews.length}`);
    console.log(`   - Contatti: ${createdContacts.length}`);
    console.log(`   - Eventi: ${createdEvents.length}`);
    console.log(`   - Libri: ${createdLibri.length}`);
    console.log(`   - Donazioni: ${createdDonazioni.length}`);
  } catch (error) {
    console.error('❌ Errore seeding database:', error.message);
    throw error;
  } finally {
    // Disconnessione
    await mongoose.disconnect();
    console.log('\n🔌 Disconnesso da MongoDB');
    process.exit(0);
  }
}

/**
 * Script principale
 */
async function main() {
  console.log('\n╔════════════════════════════════════════╗');
  console.log('║   SDA Italia - Database Seed Script   ║');
  console.log('╚════════════════════════════════════════╝');

  try {
    await seedDatabase();
  } catch (error) {
    console.error('\n❌ Errore fatale:', error.message);
    process.exit(1);
  }
}

// Esegui lo script
main();
