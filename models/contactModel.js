const mongoose = require('mongoose');

const ContactSchema = new mongoose.Schema({
  nome: { type: String, required: true },
  email: { type: String, required: true},
  telefono: { type: String, required: true },
  messaggio: { type: String, required: true, },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Contact', ContactSchema, 'contacts');