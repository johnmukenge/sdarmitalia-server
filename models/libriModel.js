/**
 * @file libriModel.js
 * @description Digital Library/Books collection schema and model
 * @version 1.0
 * @author SDA Italia Dev Team
 *
 * Represents digital books and documents in the library
 * Supports advanced search, categorization, and filtering
 * Tracks download statistics and user ratings
 *
 * @example
 * const books = await Libro.search('biblical prophecy');
 * const theological = await Libro.getByCategory('teologia');
 * await libro.incrementDownloads();
 */

const mongoose = require('mongoose');

/**
 * Digital Library Book/Document Schema Definition
 *
 * @typedef {Object} Libro
 * @property {string} title - Book title (required, 3-300 chars)
 * @property {string} author - Author name (required, 2-100 chars)
 * @property {string} description - Book synopsis (required, 20-2000 chars)
 * @property {string} category - Primary category (required)
 * @property {Array<string>} subcategories - Secondary categorization
 * @property {Array<string>} tags - Search tags
 * @property {string} cover - Cover image URL (optional)
 * @property {string} filePath - Path or URL to PDF file (required)
 * @property {number} fileSize - File size in bytes
 * @property {string} language - Language code: 'it', 'en', 'es', 'fr', 'de' (default: 'it')
 * @property {string} isbn - ISBN-13 (optional)
 * @property {string} publisher - Publisher name
 * @property {Date} publicationDate - Original publication date
 * @property {string} version - Document version (default: '1.0')
 * @property {number} pages - Number of pages (optional)
 * @property {number} rating - Average rating 0-5
 * @property {number} ratingCount - Number of ratings received
 * @property {number} downloads - Total download count (default: 0)
 * @property {boolean} featured - Featured in library (default: false)
 * @property {string} status - Publication status: 'draft', 'published', 'archived' (default: 'draft')
 * @property {boolean} isPublic - Available to all or members only (default: false)
 * @property {Date} createdAt - Upload timestamp
 * @property {Date} updatedAt - Last update timestamp
 */
const LibroSchema = new mongoose.Schema(
  {
    // Core information
    title: {
      type: String,
      required: [true, 'Book title is required'],
      minlength: [3, 'Title must be at least 3 characters'],
      maxlength: [300, 'Title cannot exceed 300 characters'],
      trim: true,
      index: 'text', // Full-text search index
    },

    author: {
      type: String,
      required: [true, 'Author name is required'],
      minlength: [2, 'Author name must be at least 2 characters'],
      maxlength: [100, 'Author name cannot exceed 100 characters'],
      trim: true,
    },

    description: {
      type: String,
      required: [true, 'Book description is required'],
      minlength: [20, 'Description must be at least 20 characters'],
      maxlength: [2000, 'Description cannot exceed 2000 characters'],
      index: 'text', // Full-text search index
    },

    // Categorization
    category: {
      type: String,
      enum: [
        'bibbia',
        'teologia',
        'storia',
        'proposta',
        'salute',
        'chiesa',
        'cultura',
        'educazione',
        'famiglia',
        'giovani',
        'adulti',
        'bambini',
        'altro',
      ],
      required: [true, 'Category is required'],
    },

    subcategories: {
      type: [String],
      default: [],
      validate: {
        validator: function (categories) {
          return categories.length <= 5;
        },
        message: 'Maximum 5 subcategories allowed',
      },
    },

    tags: {
      type: [String],
      default: [],
      lowercase: true,
      validate: {
        validator: function (tags) {
          return tags.length <= 15;
        },
        message: 'Maximum 15 tags allowed',
      },
      index: true,
    },

    // Media
    cover: {
      type: String,
      trim: true,
    },

    filePath: {
      type: String,
      required: [true, 'File path is required'],
      trim: true,
    },

    fileSize: {
      type: Number,
      min: [0, 'File size cannot be negative'],
    },

    // Publication details
    language: {
      type: String,
      enum: ['it', 'en', 'es', 'fr', 'de'],
      default: 'it',
    },

    isbn: {
      type: String,
      trim: true,
      validate: {
        validator: function (isbn) {
          // ISBN-13: 13 digits with hyphens optional
          return (
            !isbn || /^(?:\d{9}[\dXx]|\d{13})$/.test(isbn.replace(/-/g, ''))
          );
        },
        message: 'Invalid ISBN format',
      },
    },

    publisher: {
      type: String,
      maxlength: [100, 'Publisher name cannot exceed 100 characters'],
      trim: true,
    },

    publicationDate: {
      type: Date,
    },

    version: {
      type: String,
      default: '1.0',
      trim: true,
    },

    pages: {
      type: Number,
      min: [1, 'Pages must be at least 1'],
    },

    // Engagement metrics
    rating: {
      type: Number,
      default: 0,
      min: [0, 'Rating cannot be less than 0'],
      max: [5, 'Rating cannot exceed 5'],
      // Calculate average from ratings collection
    },

    ratingCount: {
      type: Number,
      default: 0,
      min: [0, 'Rating count cannot be negative'],
    },

    downloads: {
      type: Number,
      default: 0,
      min: [0, 'Downloads cannot be negative'],
    },

    // Visibility and status
    featured: {
      type: Boolean,
      default: false,
    },

    status: {
      type: String,
      enum: ['draft', 'published', 'archived'],
      default: 'draft',
    },

    isPublic: {
      type: Boolean,
      default: false,
    },

    // Timestamps
    createdAt: {
      type: Date,
      default: Date.now,
      immutable: true,
    },

    updatedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    // Schema options
    timestamps: false,
    collection: 'libri', // Italian name for books
  },
);

/**
 * Pre-save middleware
 * Updates 'updatedAt' timestamp before saving
 *
 * @event pre:save
 */
LibroSchema.pre('save', function (next) {
  this.updatedAt = Date.now();
  next();
});

/**
 * Instance method to increment download counter
 *
 * @method incrementDownloads
 * @async
 * @param {number} [count=1] - Number of downloads to add
 * @returns {Promise<Object>} Updated document
 *
 * @example
 * await libro.incrementDownloads();
 */
LibroSchema.methods.incrementDownloads = function (count = 1) {
  this.downloads = (this.downloads || 0) + count;
  return this.save();
};

/**
 * Instance method to add rating and update average
 *
 * @method addRating
 * @async
 * @param {number} newRating - Rating value (1-5)
 * @returns {Promise<Object>} Updated document
 * @throws {Error} If rating is invalid
 *
 * @example
 * await libro.addRating(4);
 */
LibroSchema.methods.addRating = function (newRating) {
  if (newRating < 1 || newRating > 5) {
    throw new Error('Rating must be between 1 and 5');
  }

  // Calculate new average rating
  const totalRating = this.rating * this.ratingCount + newRating;
  this.ratingCount += 1;
  this.rating = totalRating / this.ratingCount;

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
 * await libro.toggleFeatured();
 */
LibroSchema.methods.toggleFeatured = function () {
  this.featured = !this.featured;
  return this.save();
};

/**
 * Instance method to publish the book
 *
 * @method publish
 * @async
 * @returns {Promise<Object>} Updated document
 *
 * @example
 * await libro.publish();
 */
LibroSchema.methods.publish = function () {
  this.status = 'published';
  return this.save();
};

/**
 * Instance method to archive the book
 *
 * @method archive
 * @async
 * @returns {Promise<Object>} Updated document
 *
 * @example
 * await libro.archive();
 */
LibroSchema.methods.archive = function () {
  this.status = 'archived';
  return this.save();
};

/**
 * Static method to search books by keyword
 *
 * @static
 * @method search
 * @param {string} keyword - Search term
 * @param {number} [limit=20] - Number of results
 * @returns {Promise<Array>} Matching books
 *
 * @example
 * const results = await Libro.search('profezia biblica', 10);
 */
LibroSchema.statics.search = function (keyword, limit = 20) {
  return this.find(
    { $text: { $search: keyword } },
    { score: { $meta: 'textScore' } },
  )
    .sort({ score: { $meta: 'textScore' } })
    .limit(limit);
};

/**
 * Static method to get books by category
 *
 * @static
 * @method getByCategory
 * @param {string} category - Category name
 * @param {number} [limit=20] - Number of results
 * @returns {Promise<Array>} Books in category
 *
 * @example
 * const theological = await Libro.getByCategory('teologia');
 */
LibroSchema.statics.getByCategory = function (category, limit = 20) {
  return this.find({
    category,
    status: 'published',
    isPublic: true,
  })
    .sort({ featured: -1, rating: -1, createdAt: -1 })
    .limit(limit);
};

/**
 * Static method to get featured books
 *
 * @static
 * @method getFeatured
 * @param {number} [limit=6] - Number of featured books to return
 * @returns {Promise<Array>} Featured published books
 *
 * @example
 * const featured = await Libro.getFeatured(6);
 */
LibroSchema.statics.getFeatured = function (limit = 6) {
  return this.find({
    featured: true,
    status: 'published',
    isPublic: true,
  })
    .sort({ rating: -1, downloads: -1 })
    .limit(limit);
};

/**
 * Static method to get books by author
 *
 * @static
 * @method getByAuthor
 * @param {string} author - Author name
 * @returns {Promise<Array>} Books by author
 *
 * @example
 * const books = await Libro.getByAuthor('Ellen White');
 */
LibroSchema.statics.getByAuthor = function (author) {
  return this.find({
    author: new RegExp(author, 'i'), // Case-insensitive
    status: 'published',
    isPublic: true,
  }).sort({ publicationDate: -1 });
};

/**
 * Static method to get most downloaded books
 *
 * @static
 * @method getMostDownloaded
 * @param {number} [limit=10] - Number of books to return
 * @returns {Promise<Array>} Most downloaded books
 *
 * @example
 * const popular = await Libro.getMostDownloaded(10);
 */
LibroSchema.statics.getMostDownloaded = function (limit = 10) {
  return this.find({
    status: 'published',
    isPublic: true,
  })
    .sort({ downloads: -1 })
    .limit(limit);
};

/**
 * Static method to get highest rated books
 *
 * @static
 * @method getTopRated
 * @param {number} [limit=10] - Number of books to return
 * @param {number} [minRatings=5] - Minimum ratings required
 * @returns {Promise<Array>} Highest rated books
 *
 * @example
 * const topRated = await Libro.getTopRated(10, 3);
 */
LibroSchema.statics.getTopRated = function (limit = 10, minRatings = 5) {
  return this.find({
    status: 'published',
    isPublic: true,
    ratingCount: { $gte: minRatings },
  })
    .sort({ rating: -1, ratingCount: -1 })
    .limit(limit);
};

/**
 * Static method to get library statistics
 *
 * @static
 * @method getStats
 * @returns {Promise<Object>} Library statistics
 *   @property {number} totalBooks - Total books in library
 *   @property {number} publishedBooks - Published and public books
 *   @property {number} totalDownloads - Total downloads across library
 *   @property {number} draftBooks - Books in draft status
 *   @property {Object} byCategory - Books count by category
 *
 * @example
 * const stats = await Libro.getStats();
 */
LibroSchema.statics.getStats = async function () {
  const totalBooks = await this.countDocuments();
  const publishedBooks = await this.countDocuments({
    status: 'published',
    isPublic: true,
  });
  const draftBooks = await this.countDocuments({ status: 'draft' });

  const downloads = await this.aggregate([
    { $match: { status: 'published', isPublic: true } },
    { $group: { _id: null, total: { $sum: '$downloads' } } },
  ]);

  const totalDownloads = downloads.length > 0 ? downloads[0].total : 0;

  const byCategory = await this.aggregate([
    { $match: { status: 'published', isPublic: true } },
    { $group: { _id: '$category', count: { $sum: 1 } } },
  ]);

  return {
    totalBooks,
    publishedBooks,
    draftBooks,
    totalDownloads,
    byCategory: Object.fromEntries(
      byCategory.map((item) => [item._id, item.count]),
    ),
  };
};

/**
 * Full-text search index
 */
LibroSchema.index({
  title: 'text',
  author: 'text',
  description: 'text',
  tags: 'text',
});

/**
 * Compound indexes for common queries
 */
LibroSchema.index({ status: 1, isPublic: 1, featured: -1 });
LibroSchema.index({ category: 1, status: 1, isPublic: 1 });
LibroSchema.index({ rating: -1, ratingCount: -1 });
LibroSchema.index({ downloads: -1 });
LibroSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Libro', LibroSchema, 'libri');
