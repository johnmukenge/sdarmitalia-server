const mongoose = require('mongoose');

const NewsSchema = new mongoose.Schema({
  title: { type: String, required: true },
  subtitle: { type: String },
  content: { type: String, required: true },
  image: { type: String },
  author: { type: String, required: true },
  publishedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('News', NewsSchema, 'news');