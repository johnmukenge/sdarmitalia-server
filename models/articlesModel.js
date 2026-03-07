const mongoose = require('mongoose');

const ArticleSchema = new mongoose.Schema({
  title: { type: String, required: true },
  content: { type: String, required: true },
  author: { type: String, required: true },
  image: { type: String },
  category: { type: String },
  views: {
    type: Number,
    default: 0,
    min: [0, 'Views cannot be negative'],
  },
  publishedAt: { type: Date, default: Date.now }
});

/**
 * Instance method to increment view counter
 *
 * @method incrementViews
 * @async
 * @returns {Promise<Object>} Updated document
 *
 * @example
 * const article = await Article.findById(id);
 * await article.incrementViews();
 */
ArticleSchema.methods.incrementViews = function () {
  this.views = (this.views || 0) + 1;
  return this.save();
};

module.exports = mongoose.model('Article', ArticleSchema);
