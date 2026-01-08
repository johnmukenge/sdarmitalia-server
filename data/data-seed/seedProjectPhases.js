/**
 * Seed script for Project Phases
 * Populates MongoDB with comprehensive data for all 4 project phases
 */

const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
const ProjectPhase = require('../../models/projectPhaseModel');

dotenv.config({ path: path.join(__dirname, '../../config.env') });

// Database connection
const DB = process.env.MONGODB_URI;

mongoose
  .connect(DB, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log('✅ DB connection successful'))
  .catch((err) => {
    console.log('❌ DB connection failed:', err);
    process.exit(1);
  });

// Seed function
const seedDatabase = async () => {
  try {
    // Clear existing data
    await ProjectPhase.deleteMany({});
    console.log('🗑️ Previous data cleared');

    // Define phases data
    const phases = [
      {
        phaseNumber: 1,
        title: 'Acquisto del Terreno',
        description:
          'Studio preliminare, approvazioni amministrative e acquisizione struttura',
        status: 'Completato',
        percentage: 100,
        timeline:
          'Settembre - Novembre 2025: Studio dello stabile e acquisizione della proprietà',
        fullDescription:
          "La prima fase ha visto il successo nell'identificazione e acquisizione di un terreno con uno stabile già edificato di +2000 metri quadrati in una zona residenziale accessibile, vicino ad una stazione ferroviaria.",
        objectives: [
          {
            title: 'Trovare terreno/ stabile idoneo',
            description: 'Ricerca di terreno/stabile idoneo',
            completed: true,
          },
          {
            title: 'Completare valutazione ambientale',
            description: 'Valutazione ambientale',
            completed: true,
          },
          {
            title: 'Finalizzare contratti legali',
            description: 'Contratti legali',
            completed: true,
          },
          {
            title: 'Registrazione proprietà',
            description: 'Registrazione',
            completed: true,
          },
        ],
        gallery: {
          coverImage:
            'https://images.unsplash.com/photo-1511884642898-4c92249e20b6?w=1200',
          images: [
            {
              url: 'https://images.unsplash.com/photo-1511884642898-4c92249e20b6?w=800',
              title: 'Veduta aerea',
              description: 'Vista aerea mostrando estensione del terreno',
              order: 1,
            },
            {
              url: 'https://images.unsplash.com/photo-1441808063764-999cccb3d6d3?w=800',
              title: 'Ingresso',
              description: 'Punto di accesso principale alla proprietà',
              order: 2,
            },
          ],
        },
        mainVideo: {
          youtubeId: 'dQw4w9WgXcQ',
          title: 'Presentazione del Terreno Acquisito',
          description: 'Video di presentazione della proprietà',
        },
        budget: {
          allocated: 474000,
          spent: 474000,
          currency: 'EUR',
        },
        team: [
          {
            name: 'Giordano T./Franck V.',
            role: 'Coordinatori del Progetto',
            email: 'belinivitorassi@gmail.com',
            phone: '+39-333-1234567',
          },
        ],
        milestones: [
          {
            name: 'Identificazione del terreno',
            dueDate: new Date('2025-11-01'),
            completed: true,
          },
          {
            name: 'Acquisizione proprietà',
            dueDate: new Date('2025-11-20'),
            completed: true,
          },
        ],
        challenges: [
          {
            title: 'Complessità della documentazione legale',
            description:
              'La raccolta della documentazione ha richiesto più tempo',
            solution: 'Coinvolgimento di consulenti legali esperti',
            resolved: true,
          },
        ],
        views: 156,
        isPublished: true,
      },
      {
        phaseNumber: 2,
        title: 'Sala Culto Provvisoria',
        description:
          'Finiture interne ed esterne, impianti specifici e allestimento',
        status: 'Completato',
        percentage: 60,
        timeline:
          'Dicembre 2025 - Marzo 2026: Allestimento della sala di culto provvisoria',
        fullDescription:
          'La seconda fase ha riguardato la trasformazione dello stabile esistente in una sala di culto provvisoria con capacità di +100 persone, inclusi servizi igienici, impianti elettrici e di riscaldamento.',
        objectives: [
          {
            title: 'Pianificare layout interni',
            description: 'Layout interni',
            completed: false,
          },
          {
            title: 'Montare la struttura',
            description: 'Montaggio struttura',
            completed: true,
          },
          {
            title: 'Completare gli impianti',
            description: 'Impianti',
            completed: true,
          },
          {
            title: 'Ottenere i certificati di conformità',
            description: 'Certificati di conformità',
            completed: true,
          },
        ],
        gallery: {
          coverImage:
            'https://images.unsplash.com/photo-1486325212027-8081e485255e?w=1200',
          images: [
            {
              url: 'https://images.unsplash.com/photo-1464207687429-7505649dae38?w=800',
              title: 'Costruzione',
              description: 'Fase di montaggio della struttura',
              order: 1,
            },
            {
              url: 'https://images.unsplash.com/photo-1486325212027-8081e485255e?w=800',
              title: 'Completamento',
              description: 'Struttura completata',
              order: 2,
            },
          ],
        },
        mainVideo: {
          youtubeId: 'jNQXAC9IVRw',
          title: 'Inaugurazione della Sala Provvisoria',
          description: 'Video della cerimonia di inaugurazione',
        },
        budget: {
          allocated: 0.0,
          spent: 0.0,
          currency: 'EUR',
        },
        team: [
          {
            name: 'Ovidiu B./Nello P.',
            role: 'Responsabili Tecnici',
            email: 'email@example.com',
            phone: '+39-333-4567890',
          },
        ],
        milestones: [
          {
            name: 'Pianificare layout interni',
            dueDate: new Date('2026-03-31'),
            completed: true,
          },
          {
            name: 'Inaugurazione',
            dueDate: new Date('2023-02-28'),
            completed: true,
          },
        ],
        challenges: [
          {
            title: 'Condizioni meteorologiche',
            description: 'Pioggia e neve hanno ritardato i lavori',
            solution: 'Protezioni temporanee e estensione calendario',
            resolved: true,
          },
        ],
        views: 234,
        isPublished: true,
      },
      {
        phaseNumber: 3,
        title: 'Sala Culto Definitiva',
        description:
          'Costruzione della sala culto definitiva, aule e aree comuni',
        status: 'In corso',
        percentage: 15,
        timeline:
          'Aprile 2026 - Dicembre 2026: Costruzione della struttura principale',
        fullDescription:
          'La terza fase rappresenta il progetto principale: la costruzione della sala di culto definitiva con capacità di +180 persone.',
        objectives: [
          {
            title: 'Completare la progettazione',
            description: 'Progettazione',
            completed: true,
          },
          {
            title: 'Ottenere i permessi',
            description: 'Autorizzazioni',
            completed: true,
          },
          {
            title: 'Completare gli separatori strutturali',
            description: 'Struttura',
            completed: true,
          },
          {
            title: 'Impianti e finiture',
            description: 'Impianti',
            completed: false,
          },
          {
            title: 'Acquisto arredi',
            description: 'Arredi',
            completed: false,
          },
        ],
        gallery: {
          coverImage:
            'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=1200',
          images: [
            {
              url: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800',
              title: 'Rendering',
              description: 'Visione artistica della struttura completata',
              order: 1,
            },
            {
              url: 'https://images.unsplash.com/photo-1503387762-592deb58ef4e?w=800',
              title: 'Cantiere',
              description: 'Stato del cantiere oggi',
              order: 2,
            },
          ],
        },
        mainVideo: {
          youtubeId: '2Vv-BfVoq4g',
          title: 'Tour del Progetto',
          description: 'Tour video della progettazione e dei progressi',
        },
        budget: {
          allocated: 0.0,
          spent: 0.0,
          currency: 'EUR',
        },
        team: [
          {
            name: 'Ovidiu B./Nello P./Levente I.',
            role: 'Responsabili Tecnici',
            email: 'mail@example.com',
            phone: '+39-333-7890123',
          },
        ],
        milestones: [
          {
            name: 'Progettazione',
            dueDate: new Date('2023-05-31'),
            completed: true,
          },
          {
            name: 'Permessi',
            dueDate: new Date('2023-07-31'),
            completed: true,
          },
          {
            name: 'Fondazioni',
            dueDate: new Date('2023-12-31'),
            completed: true,
          },
          {
            name: 'Struttura',
            dueDate: new Date('2024-06-30'),
            completed: true,
          },
          {
            name: 'Impianti',
            dueDate: new Date('2024-11-30'),
            completed: false,
          },
        ],
        challenges: [
          {
            title: 'Complessità fondazioni',
            description: 'Livelli di falda più alti del previsto',
            solution: 'Sistema di drenaggio avanzato',
            resolved: true,
          },
        ],
        views: 312,
        isPublished: true,
      },
      {
        phaseNumber: 4,
        title: 'Inaugurazione Ufficiale',
        description: 'Finalizzazione, ispezioni e inaugurazione ufficiale',
        status: 'In pianificazione',
        percentage: 0,
        timeline: "Dicembre 2025: Preparazione per l'evento inaugurale",
        fullDescription:
          "La quarta fase rappresenta il culmine del progetto: l'inaugurazione ufficiale della sala di culto definitiva.",
        objectives: [
          {
            title: 'Completare finiture',
            description: 'Finiture finali',
            completed: false,
          },
          {
            title: 'Collaudi tecnici',
            description: 'Collaudi',
            completed: false,
          },
          {
            title: 'Certificati finali',
            description: 'Certificazioni',
            completed: false,
          },
          {
            title: 'Organizzare celebrazioni',
            description: 'Evento',
            completed: false,
          },
        ],
        gallery: {
          coverImage:
            'https://images.unsplash.com/photo-1511632765486-a01980e01a18?w=1200',
          images: [
            {
              url: 'https://images.unsplash.com/photo-1511632765486-a01980e01a18?w=800',
              title: 'Rendering',
              description: 'Struttura completata pronta per inaugurazione',
              order: 1,
            },
            {
              url: 'https://images.unsplash.com/photo-1511379938547-c1f69b13d835?w=800',
              title: 'Sala',
              description: 'Area principale durante eventi',
              order: 2,
            },
          ],
        },
        mainVideo: {
          youtubeId: '9bZkp7q19f0',
          title: 'Visione della Comunità',
          description: 'Video sulla visione della comunità',
        },
        budget: {
          allocated: 50000,
          spent: 5000,
          currency: 'EUR',
        },
        team: [
          {
            name: 'Pastor Marco Rossi',
            role: 'Coordinatore Generale',
            email: 'marco.rossi@example.com',
            phone: '+39-333-1234567',
          },
        ],
        milestones: [
          {
            name: 'Completamento finiture',
            dueDate: new Date('2026-12-31'),
            completed: false,
          },
          {
            name: 'Inaugurazione',
            dueDate: new Date('2026-12-31'),
            completed: false,
          },
        ],
        challenges: [
          {
            title: 'Coordinamento tempi',
            description: 'Garantire completamento in tempo',
            solution: 'Milestone settimanali e coordinamento',
            resolved: false,
          },
        ],
        views: 89,
        isPublished: true,
      },
    ];

    // Insert all phases
    const result = await ProjectPhase.insertMany(phases);
    console.log(`✅ ${result.length} phases successfully created!`);

    // Calculate and display summary
    let totalBudget = 0;
    let totalSpent = 0;
    let totalCompletion = 0;

    phases.forEach((phase) => {
      totalBudget += phase.budget.allocated;
      totalSpent += phase.budget.spent;
      totalCompletion += phase.percentage;
    });

    const avgCompletion = (totalCompletion / phases.length).toFixed(2);
    const budgetUtilization = ((totalSpent / totalBudget) * 100).toFixed(2);

    console.log(`
📊 Database Seed Summary
========================
Total Phases: ${phases.length}
Total Budget: €${totalBudget.toLocaleString('it-IT')}
Total Spent: €${totalSpent.toLocaleString('it-IT')}
Budget Utilization: ${budgetUtilization}%
🎯 Total Project Progress: ${avgCompletion}%
    `);

    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  }
};

// Run seed function
seedDatabase();
