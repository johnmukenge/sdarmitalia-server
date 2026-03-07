/**
 * @file documentiModel.js
 * @description Documents collection schema and model (Lezionari, Settimane di Preghiera, etc.)
 * @version 1.0
 * @author SDA Italia Dev Team
 *
 * Rappresenta i documenti scaricabili come Lezionari, Settimane di Preghiera, etc.
 * Supporta categorizzazione per tipo, anno, trimestre
 * Traccia download e views per analytics
 *
 * @example
 * const lezionari = await Documento.find({ tipo: 'lezionario', anno: 2026 });
 * await documento.incrementDownloads();
 */

const mongoose = require('mongoose');

/**
 * Documento Schema Definition
 *
 * @typedef {Object} Documento
 * @property {string} titolo - Document title (required, 5-200 chars)
 * @property {string} descrizione - Document description (optional, 20-1000 chars)
 * @property {string} tipo - Document type: 'lezionario', 'settimana_preghiera', 'guida_studio', 'altro'
 * @property {number} anno - Year (required for most types)
 * @property {number} trimestre - Quarter: 1, 2, 3, 4 (for lezionari)
 * @property {string} lingua - Language code: 'it', 'en', etc. (default: 'it')
 * @property {string} filePath - Path or URL to PDF file (required)
 * @property {string} fileUrl - External URL if hosted elsewhere
 * @property {number} fileSize - File size in bytes
 * @property {number} pagine - Number of pages
 * @property {string} copertina - Cover image URL (optional)
 * @property {Array<string>} tags - Search tags for categorization
 * @property {string} autore - Author/Creator name
 * @property {string} editore - Publisher name (default: 'SDA Italia')
 * @property {Date} dataPubblicazione - Publication date
 * @property {string} versione - Document version (default: '1.0')
 * @property {number} downloads - Total download count (default: 0)
 * @property {number} views - Total view count (default: 0)
 * @property {boolean} inEvidenza - Featured document (default: false)
 * @property {string} status - Publication status: 'draft', 'published', 'archived' (default: 'draft')
 * @property {boolean} isPublic - Available to all or members only (default: true)
 * @property {Date} createdAt - Upload timestamp
 * @property {Date} updatedAt - Last update timestamp
 */
const DocumentoSchema = new mongoose.Schema(
  {
    // Core information
    titolo: {
      type: String,
      required: [true, 'Il titolo del documento è obbligatorio'],
      minlength: [5, 'Il titolo deve essere di almeno 5 caratteri'],
      maxlength: [200, 'Il titolo non può superare 200 caratteri'],
      trim: true,
      index: true,
    },

    descrizione: {
      type: String,
      minlength: [20, 'La descrizione deve essere di almeno 20 caratteri'],
      maxlength: [1000, 'La descrizione non può superare 1000 caratteri'],
      trim: true,
    },

    // Categorization
    tipo: {
      type: String,
      enum: {
        values: [
          'lezionario',
          'settimana_preghiera',
          'guida_studio',
          'materiale_evangelismo',
          'rivista',
          'bollettino',
          'altro',
        ],
        message: '{VALUE} non è un tipo di documento valido',
      },
      required: [true, 'Il tipo di documento è obbligatorio'],
      lowercase: true,
      index: true,
    },

    anno: {
      type: Number,
      required: [true, 'L\'anno è obbligatorio'],
      min: [1900, 'L\'anno deve essere >= 1900'],
      max: [2100, 'L\'anno deve essere <= 2100'],
      index: true,
    },

    trimestre: {
      type: Number,
      enum: {
        values: [1, 2, 3, 4],
        message: 'Il trimestre deve essere 1, 2, 3 o 4',
      },
      // Richiesto solo per lezionari
      validate: {
        validator: function (val) {
          if (this.tipo === 'lezionario') {
            return val >= 1 && val <= 4;
          }
          return true;
        },
        message: 'Il trimestre è obbligatorio per i lezionari (1-4)',
      },
      index: true,
    },

    lingua: {
      type: String,
      enum: ['it', 'en', 'es', 'fr', 'de'],
      default: 'it',
    },

    // File information
    filePath: {
      type: String,
      required: [true, 'Il percorso del file è obbligatorio'],
      trim: true,
    },

    fileUrl: {
      type: String,
      trim: true,
      // URL esterno se il file è hostato altrove
    },

    fileSize: {
      type: Number,
      min: [0, 'La dimensione del file non può essere negativa'],
    },

    pagine: {
      type: Number,
      min: [1, 'Il numero di pagine deve essere almeno 1'],
    },

    copertina: {
      type: String,
      trim: true,
    },

    // Metadata
    tags: {
      type: [String],
      default: [],
      lowercase: true,
      validate: {
        validator: function (tags) {
          return tags.length <= 10;
        },
        message: 'Massimo 10 tag consentiti per documento',
      },
    },

    autore: {
      type: String,
      maxlength: [100, 'Il nome dell\'autore non può superare 100 caratteri'],
      trim: true,
      default: 'SDA Italia',
    },

    editore: {
      type: String,
      maxlength: [100, 'Il nome dell\'editore non può superare 100 caratteri'],
      trim: true,
      default: 'SDA Italia',
    },

    dataPubblicazione: {
      type: Date,
      default: Date.now,
    },

    versione: {
      type: String,
      default: '1.0',
      trim: true,
    },

    // Engagement metrics
    downloads: {
      type: Number,
      default: 0,
      min: [0, 'Il numero di download non può essere negativo'],
      index: true,
    },

    views: {
      type: Number,
      default: 0,
      min: [0, 'Il numero di visualizzazioni non può essere negativo'],
      index: true,
    },

    // Visibility and status
    inEvidenza: {
      type: Boolean,
      default: false,
      index: true,
    },

    status: {
      type: String,
      enum: ['draft', 'published', 'archived'],
      default: 'published',
      index: true,
    },

    isPublic: {
      type: Boolean,
      default: true,
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
    collection: 'documenti',
  }
);

/**
 * Pre-save middleware
 * Updates 'updatedAt' timestamp before saving
 *
 * @event pre:save
 */
DocumentoSchema.pre('save', function (next) {
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
 * await documento.incrementDownloads();
 */
DocumentoSchema.methods.incrementDownloads = function (count = 1) {
  this.downloads = (this.downloads || 0) + count;
  return this.save();
};

/**
 * Instance method to increment view counter
 *
 * @method incrementViews
 * @async
 * @returns {Promise<Object>} Updated document
 *
 * @example
 * const documento = await Documento.findById(id);
 * await documento.incrementViews();
 */
DocumentoSchema.methods.incrementViews = function () {
  this.views = (this.views || 0) + 1;
  return this.save();
};

/**
 * Instance method to toggle featured status
 *
 * @method toggleInEvidenza
 * @async
 * @returns {Promise<Object>} Updated document
 *
 * @example
 * await documento.toggleInEvidenza();
 */
DocumentoSchema.methods.toggleInEvidenza = function () {
  this.inEvidenza = !this.inEvidenza;
  return this.save();
};

/**
 * Static method to get lezionari by year and quarter
 *
 * @static
 * @method getLezionari
 * @param {number} anno - Year
 * @param {number} [trimestre] - Quarter (optional)
 * @returns {Promise<Array>} Lezionari documents
 *
 * @example
 * const lezionari2026 = await Documento.getLezionari(2026);
 * const q1_2026 = await Documento.getLezionari(2026, 1);
 */
DocumentoSchema.statics.getLezionari = function (anno, trimestre = null) {
  const query = {
    tipo: 'lezionario',
    anno,
    status: 'published',
    isPublic: true,
  };

  if (trimestre) {
    query.trimestre = trimestre;
  }

  return this.find(query).sort({ trimestre: 1, dataPubblicazione: -1 });
};

/**
 * Static method to get settimane di preghiera by year
 *
 * @static
 * @method getSettimanePreghiera
 * @param {number} anno - Year
 * @returns {Promise<Array>} Settimane di preghiera documents
 *
 * @example
 * const settimane2025 = await Documento.getSettimanePreghiera(2025);
 */
DocumentoSchema.statics.getSettimanePreghiera = function (anno) {
  return this.find({
    tipo: 'settimana_preghiera',
    anno,
    status: 'published',
    isPublic: true,
  }).sort({ dataPubblicazione: -1 });
};

/**
 * Static method to get documents by type
 *
 * @static
 * @method getByTipo
 * @param {string} tipo - Document type
 * @param {number} [limit=20] - Number of results
 * @returns {Promise<Array>} Documents of specified type
 *
 * @example
 * const guide = await Documento.getByTipo('guida_studio');
 */
DocumentoSchema.statics.getByTipo = function (tipo, limit = 20) {
  return this.find({
    tipo,
    status: 'published',
    isPublic: true,
  })
    .sort({ anno: -1, trimestre: -1, dataPubblicazione: -1 })
    .limit(limit);
};

/**
 * Static method to get featured documents
 *
 * @static
 * @method getInEvidenza
 * @param {number} [limit=6] - Number of featured documents to return
 * @returns {Promise<Array>} Featured published documents
 *
 * @example
 * const featured = await Documento.getInEvidenza(6);
 */
DocumentoSchema.statics.getInEvidenza = function (limit = 6) {
  return this.find({
    inEvidenza: true,
    status: 'published',
    isPublic: true,
  })
    .sort({ dataPubblicazione: -1 })
    .limit(limit);
};

/**
 * Static method to get most downloaded documents
 *
 * @static
 * @method getMostDownloaded
 * @param {number} [limit=10] - Number of documents to return
 * @returns {Promise<Array>} Most downloaded documents
 *
 * @example
 * const popular = await Documento.getMostDownloaded(10);
 */
DocumentoSchema.statics.getMostDownloaded = function (limit = 10) {
  return this.find({
    status: 'published',
    isPublic: true,
  })
    .sort({ downloads: -1 })
    .limit(limit);
};

/**
 * Static method to get available years
 *
 * @static
 * @method getAvailableYears
 * @returns {Promise<Array>} Array of available years
 *
 * @example
 * const years = await Documento.getAvailableYears();
 */
DocumentoSchema.statics.getAvailableYears = function () {
  return this.distinct('anno', {
    status: 'published',
    isPublic: true,
  }).sort();
};

/**
 * Static method to get documents statistics
 *
 * @static
 * @method getStats
 * @returns {Promise<Object>} Documents statistics
 *
 * @example
 * const stats = await Documento.getStats();
 */
DocumentoSchema.statics.getStats = async function () {
  const totalDocumenti = await this.countDocuments();
  const pubblicati = await this.countDocuments({
    status: 'published',
    isPublic: true,
  });

  const downloads = await this.aggregate([
    { $match: { status: 'published', isPublic: true } },
    { $group: { _id: null, total: { $sum: '$downloads' } } },
  ]);

  const views = await this.aggregate([
    { $match: { status: 'published', isPublic: true } },
    { $group: { _id: null, total: { $sum: '$views' } } },
  ]);

  const perTipo = await this.aggregate([
    { $match: { status: 'published', isPublic: true } },
    { $group: { _id: '$tipo', count: { $sum: 1 } } },
  ]);

  return {
    totalDocumenti,
    pubblicati,
    totalDownloads: downloads.length > 0 ? downloads[0].total : 0,
    totalViews: views.length > 0 ? views[0].total : 0,
    perTipo: Object.fromEntries(perTipo.map((item) => [item._id, item.count])),
  };
};

/**
 * Compound indexes for common queries
 */
DocumentoSchema.index({ tipo: 1, anno: -1, trimestre: 1 });
DocumentoSchema.index({ status: 1, isPublic: 1, inEvidenza: -1 });
DocumentoSchema.index({ downloads: -1 });
DocumentoSchema.index({ views: -1 });
DocumentoSchema.index({ tags: 1 });
DocumentoSchema.index({ dataPubblicazione: -1 });

/**
 * Full-text search index
 */
DocumentoSchema.index({
  titolo: 'text',
  descrizione: 'text',
  tags: 'text',
  autore: 'text',
});

module.exports = mongoose.model('Documento', DocumentoSchema, 'documenti');
