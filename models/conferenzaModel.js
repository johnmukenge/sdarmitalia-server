const mongoose = require('mongoose');

const ConferenzaSchema = new mongoose.Schema({
  email: { type: String, required: true},
  nome: { type: String, required: true },
  cognome: { type: String, required: true },
  telefono: { type: String, required: true },
  dataNascita: { type: Date, required: true },
  luogoNascita: { type: String, required: true },
  sesso: { type: String, required: true },
  tipoAlloggio: { type: String, required: true },
  messaggio: { type: String, required: true, },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Conferenza', ConferenzaSchema, 'conferences');