const mongoose = require('mongoose');
const News = require('./../../models/newsModel');
require('dotenv').config();

const DB = process.env.MONGODB_URI; // Replace with your actual DB URI

const newsData = [
  {
    title:
      'Conferenza dei Giovani Torino 2025 - Mini Concerto con il Coro di Trieste',
    subtitle:
      'Un evento da non perdere! Ingresso gratuito per tutti i partecipanti',
    content:
      'Unisciti a noi per una giornata dei momenti di preghiera e celebrazione...',
    image: 'https://via.placeholder.com/600',
    author: 'Pastore Franck Vitorassi',
    publishedAt: new Date(),
  },
  {
    title: 'Conferenza del campo Italiano Giugno 2025',
    subtitle: 'Unisciti a noi per una due giorni di preghiera e celebrazione',
    content: 'Unisciti a noi per una due giorni di preghiera e celebrazione...',
    image: 'https://via.placeholder.com/600',
    author: 'Pastore Sorin Suceava e Pastore Radu Ionita',
    publishedAt: new Date(),
  },
  {
    title: 'Missione Sicilia 2025 con i Giovani',
    subtitle:
      "Un'esperienza unica per condividere il vangelo con la gente di Sicilia e rafforzare la propria fede",
    content:
      'Prenota ora il tuo posto per il momento di condivisione del valgelo...',
    image: 'https://via.placeholder.com/600',
    author: 'Pastore Giordano Tinta',
    publishedAt: new Date(),
  },
];

const seedDatabase = async () => {
  try {
    await mongoose.connect(DB);
    console.log('✅ Database connected');

    await News.deleteMany(); // Clears old data
    console.log('🗑️ Old news removed');

    await News.insertMany(newsData);
    console.log('📰 News data inserted');

    mongoose.connection.close();
    console.log('🔌 Connection closed');
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    mongoose.connection.close();
  }
};

seedDatabase();
