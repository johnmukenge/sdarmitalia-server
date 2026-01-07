/**
 * @file newsModel.js
 * @description News/Notizie collection schema and model
 * @version 2.0
 * @author SDA Italia Dev Team
 *
 * Represents news articles published on the website
 * Supports categorization, tagging, and advanced filtering
 * Tracks publication status and view statistics
 *
 * @example
 * const news = await News.find({ status: 'published' })
 *   .sort({ publishedAt: -1 })
 *   .limit(10);
 */

const mongoose = require('mongoose');

/**
 * News Schema Definition
 *
 * @typedef {Object} News
 * @property {string} title - News headline (required, 5-200 chars)
 * @property {string} subtitle - Brief description (optional, 5-500 chars)
 * @property {string} content - Full article content (required, 20+ chars)
 * @property {string} author - Author name (required, 2-100 chars)
 * @property {string} category - Article category (default: 'generale')
 * @property {Array<string>} tags - Search tags for categorization
 * @property {string} image - Featured image URL (optional)
 * @property {number} views - Number of times article was viewed (default: 0)
 * @property {boolean} featured - Whether article is featured on homepage (default: false)
 * @property {string} status - Publication status: 'draft', 'published', 'archived' (default: 'draft')
 * @property {string} [youtubeId] - Embedded YouTube video ID (11 chars)
 * @property {Date} publishedAt - Publication timestamp
 * @property {Date} updatedAt - Last update timestamp
 * @property {Date} createdAt - Creation timestamp
 */
const NewsSchema = new mongoose.Schema(
  {
    // Core content fields
    title: {
      type: String,
      required: [true, 'News title is required'],
      minlength: [5, 'Title must be at least 5 characters'],
      maxlength: [200, 'Title cannot exceed 200 characters'],
      trim: true,
    },

    subtitle: {
      type: String,
      minlength: [5, 'Subtitle must be at least 5 characters'],
      maxlength: [500, 'Subtitle cannot exceed 500 characters'],
      trim: true,
    },

    content: {
      type: String,
      required: [true, 'News content is required'],
      minlength: [20, 'Content must be at least 20 characters'],
      maxlength: [50000, 'Content cannot exceed 50000 characters'],
    },

    author: {
      type: String,
      required: [true, 'Author name is required'],
      minlength: [2, 'Author name must be at least 2 characters'],
      maxlength: [100, 'Author name cannot exceed 100 characters'],
      trim: true,
    },

    // Categorization
    category: {
      type: String,
      enum: [
        'notizie',
        'chiesa',
        'comunita',
        'spirituale',
        'evento',
        'generale',
      ],
      default: 'generale',
      lowercase: true,
    },

    tags: {
      type: [String],
      default: [],
      lowercase: true,
      trim: true,
      // Limit to 10 tags per article
      validate: {
        validator: function (tags) {
          return tags.length <= 10;
        },
        message: 'Maximum 10 tags allowed per article',
      },
    },

    // Media
    image: {
      type: String,
      // Optional URL validation could be added here
    },

    youtubeId: {
      type: String,
      // YouTube IDs are exactly 11 characters
      validate: {
        validator: function (id) {
          return !id || /^[a-zA-Z0-9_-]{11}$/.test(id);
        },
        message: 'Invalid YouTube video ID format (must be 11 characters)',
      },
    },

    // Engagement metrics
    views: {
      type: Number,
      default: 0,
      min: [0, 'Views cannot be negative'],
    },

    featured: {
      type: Boolean,
      default: false,
    },

    // Status management
    status: {
      type: String,
      enum: ['draft', 'published', 'archived'],
      default: 'draft',
    },

    // Timestamps
    publishedAt: {
      type: Date,
      // Auto-set to now when status changes to 'published'
      default: null,
    },

    updatedAt: {
      type: Date,
      default: Date.now,
    },

    createdAt: {
      type: Date,
      default: Date.now,
      immutable: true, // Cannot be changed after creation
    },
  },
  {
    // Schema options
    timestamps: false, // We manage timestamps manually
    collection: 'news', // Explicitly set collection name
  },
);

/**
 * Pre-save middleware
 * Updates 'updatedAt' timestamp before saving
 * Sets publishedAt when status changes to 'published'
 *
 * @event pre:save
 */
NewsSchema.pre('save', function (next) {
  // Always update the 'updatedAt' timestamp
  this.updatedAt = Date.now();

  // Set publishedAt if status just changed to 'published'
  if (
    this.isModified('status') &&
    this.status === 'published' &&
    !this.publishedAt
  ) {
    this.publishedAt = Date.now();
  }

  next();
});

/**
 * Instance method to increment view counter
 *
 * @method incrementViews
 * @async
 * @returns {Promise<Object>} Updated document
 *
 * @example
 * const news = await News.findById(id);
 * await news.incrementViews();
 */
NewsSchema.methods.incrementViews = function () {
  this.views = (this.views || 0) + 1;
  return this.save();
};

/**
 * Instance method to toggle featured status
 *
 * @method toggleFeatured
 * @async
 * @returns {Promise<Object>} Updated document
 *
 * @example
 * await news.toggleFeatured();
 */
NewsSchema.methods.toggleFeatured = function () {
  this.featured = !this.featured;
  return this.save();
};

/**
 * Static method to get published articles
 *
 * @static
 * @method getPublished
 * @param {number} [limit=10] - Number of articles to return
 * @returns {Promise<Array>} Published articles sorted by date
 *
 * @example
 * const recent = await News.getPublished(5);
 */
NewsSchema.statics.getPublished = function (limit = 10) {
  return this.find({ status: 'published' })
    .sort({ publishedAt: -1 })
    .limit(limit)
    .select('-content'); // Exclude full content for list view
};

/**
 * Static method to get featured articles
 *
 * @static
 * @method getFeatured
 * @param {number} [limit=5] - Number of featured articles to return
 * @returns {Promise<Array>} Featured published articles
 *
 * @example
 * const featured = await News.getFeatured(3);
 */
NewsSchema.statics.getFeatured = function (limit = 5) {
  return this.find({ status: 'published', featured: true })
    .sort({ publishedAt: -1 })
    .limit(limit);
};

/**
 * Index definitions for query optimization
 */
// Index for common queries
NewsSchema.index({ status: 1, publishedAt: -1 });
NewsSchema.index({ featured: 1, publishedAt: -1 });
NewsSchema.index({ author: 1 });
NewsSchema.index({ category: 1, status: 1 });
NewsSchema.index({ tags: 1 }); // For tag-based searches
NewsSchema.index({ title: 'text', subtitle: 'text', content: 'text' }); // For full-text search

module.exports = mongoose.model('News', NewsSchema, 'news');
