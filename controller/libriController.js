/**
 * @file libriController.js
 * @description Controller per la gestione della biblioteca (libri)
 * @version 1.0
 * @author SDA Italia Dev Team
 *
 * Gestisce le operazioni CRUD per i libri
 * Supporta ricerca full-text, filtri, ordinamento e paginazione
 */

const Libro = require('./../models/libriModel');
const APIFeatures = require('./../utils/apiFeatures');

/**
 * Recupera tutti i libri con filtri, ordinamento e paginazione
 * @async
 * @function getAllLibri
 * @param {Object} req - Express request
 * @param {Object} res - Express response
 * @returns {Object} JSON con lista di libri
 *
 * @example
 * GET /api/v1/libri?category=bibbia&sort=-rating&page=1&limit=10
 * Response: { status: 'success', results: 5, data: { libri: [...] } }
 */
const getAllLibri = async (req, res) => {
  try {
    // Esegui la query con filtri, ordinamento e paginazione
    const features = new APIFeatures(Libro.find(), req.query)
      .filter()
      .sort()
      .limitFields()
      .paginate();

    const libri = await features.query;

    // Invia la risposta
    res.status(200).json({
      status: 'success',
      results: libri.length,
      data: {
        libri,
      },
    });
  } catch (error) {
    res.status(404).json({
      status: 'fail',
      message: error.message,
    });
  }
};

/**
 * Recupera un singolo libro per ID
 * @async
 * @function getLibro
 * @param {Object} req - Express request con libro ID
 * @param {Object} res - Express response
 * @returns {Object} JSON con i dati del libro
 *
 * @example
 * GET /api/v1/libri/507f1f77bcf86cd799439011
 * Response: { status: 'success', data: { libro: {...} } }
 */
const getLibro = async (req, res) => {
  try {
    // 📈 Incrementa automaticamente le views quando un libro viene visualizzato
    const libro = await Libro.findByIdAndUpdate(
      req.params.id,
      { $inc: { views: 1 } },
      { new: true, runValidators: false }
    );

    if (!libro) {
      return res.status(404).json({
        status: 'fail',
        message: 'Libro non trovato',
      });
    }

    console.log(`📚 Libro "${libro.title}" visualizzato. Total views: ${libro.views}`);

    res.status(200).json({
      status: 'success',
      data: {
        libro,
      },
    });
  } catch (error) {
    res.status(404).json({
      status: 'fail',
      message: error.message,
    });
  }
};

/**
 * Ricerca libri con full-text search
 * @async
 * @function searchLibri
 * @param {Object} req - Express request con query di ricerca
 * @param {Object} res - Express response
 * @returns {Object} JSON con risultati della ricerca
 *
 * @example
 * GET /api/v1/libri/search?q=grande+controversia
 * Response: { status: 'success', results: 2, data: { libri: [...] } }
 */
const searchLibri = async (req, res) => {
  try {
    const { q } = req.query;

    if (!q) {
      return res.status(400).json({
        status: 'fail',
        message: 'Query di ricerca non fornita',
      });
    }

    // Esegui ricerca full-text
    const libri = await Libro.find(
      { $text: { $search: q } },
      { score: { $meta: 'textScore' } },
    )
      .sort({ score: { $meta: 'textScore' } })
      .limit(20);

    res.status(200).json({
      status: 'success',
      results: libri.length,
      data: {
        libri,
      },
    });
  } catch (error) {
    res.status(400).json({
      status: 'fail',
      message: error.message,
    });
  }
};

/**
 * Recupera libri per categoria
 * @async
 * @function getLibriByCategory
 * @param {Object} req - Express request con categoria
 * @param {Object} res - Express response
 * @returns {Object} JSON con libri della categoria
 *
 * @example
 * GET /api/v1/libri/category/teologia
 * Response: { status: 'success', results: 5, data: { libri: [...] } }
 */
const getLibriByCategory = async (req, res) => {
  try {
    const { category } = req.params;
    const libri = await Libro.find({
      category,
      status: 'published',
      isPublic: true,
    }).sort({ featured: -1, rating: -1 });

    res.status(200).json({
      status: 'success',
      results: libri.length,
      data: {
        libri,
      },
    });
  } catch (error) {
    res.status(404).json({
      status: 'fail',
      message: error.message,
    });
  }
};

/**
 * Recupera libri consigliati (featured e top-rated)
 * @async
 * @function getLibriConsigliati
 * @param {Object} req - Express request
 * @param {Object} res - Express response
 * @returns {Object} JSON con libri consigliati
 *
 * @example
 * GET /api/v1/libri/consigliati
 * Response: { status: 'success', results: 10, data: { libri: [...] } }
 */
const getLibriConsigliati = async (req, res) => {
  try {
    const libri = await Libro.find({
      status: 'published',
      isPublic: true,
      $or: [{ featured: true }, { rating: { $gte: 4.5 } }],
    })
      .sort({ featured: -1, rating: -1, downloads: -1 })
      .limit(12);

    res.status(200).json({
      status: 'success',
      results: libri.length,
      data: {
        libri,
      },
    });
  } catch (error) {
    res.status(404).json({
      status: 'fail',
      message: error.message,
    });
  }
};

/**
 * Recupera i libri più scaricati
 * @async
 * @function getLibriTopDownloads
 * @param {Object} req - Express request
 * @param {Object} res - Express response
 * @returns {Object} JSON con libri più scaricati
 *
 * @example
 * GET /api/v1/libri/top-downloads?limit=10
 * Response: { status: 'success', results: 10, data: { libri: [...] } }
 */
const getLibriTopDownloads = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit, 10) || 10;

    const libri = await Libro.find({
      status: 'published',
      isPublic: true,
    })
      .sort({ downloads: -1 })
      .limit(limit);

    res.status(200).json({
      status: 'success',
      results: libri.length,
      data: {
        libri,
      },
    });
  } catch (error) {
    res.status(404).json({
      status: 'fail',
      message: error.message,
    });
  }
};

/**
 * Crea un nuovo libro
 * @async
 * @function createLibro
 * @param {Object} req - Express request con dati libro
 * @param {Object} res - Express response
 * @returns {Object} JSON con libro creato
 */
const createLibro = async (req, res) => {
  try {
    const libro = await Libro.create(req.body);
    res.status(201).json({
      status: 'success',
      data: {
        libro,
      },
    });
  } catch (error) {
    res.status(400).json({
      status: 'fail',
      message: error.message,
    });
  }
};

/**
 * Aggiorna un libro
 * @async
 * @function updateLibro
 * @param {Object} req - Express request con ID e dati da aggiornare
 * @param {Object} res - Express response
 * @returns {Object} JSON con libro aggiornato
 */
const updateLibro = async (req, res) => {
  try {
    const libro = await Libro.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!libro) {
      return res.status(404).json({
        status: 'fail',
        message: 'Libro non trovato',
      });
    }

    res.status(200).json({
      status: 'success',
      data: {
        libro,
      },
    });
  } catch (error) {
    res.status(404).json({
      status: 'fail',
      message: error.message,
    });
  }
};

/**
 * Elimina un libro
 * @async
 * @function deleteLibro
 * @param {Object} req - Express request con ID libro
 * @param {Object} res - Express response
 * @returns {void}
 */
const deleteLibro = async (req, res) => {
  try {
    const libro = await Libro.findByIdAndDelete(req.params.id);

    if (!libro) {
      return res.status(404).json({
        status: 'fail',
        message: 'Libro non trovato',
      });
    }

    res.status(204).json({
      status: 'success',
      data: null,
    });
  } catch (error) {
    res.status(404).json({
      status: 'fail',
      message: error.message,
    });
  }
};

/**
 * Incrementa il contador di download
 * @async
 * @function downloadLibro
 * @param {Object} req - Express request con ID libro
 * @param {Object} res - Express response
 * @returns {Object} JSON con numero di download aggiornato
 */
const downloadLibro = async (req, res) => {
  try {
    const libro = await Libro.findByIdAndUpdate(
      req.params.id,
      { $inc: { downloads: 1 } },
      { new: true },
    );

    if (!libro) {
      return res.status(404).json({
        status: 'fail',
        message: 'Libro non trovato',
      });
    }

    res.status(200).json({
      status: 'success',
      data: {
        libro,
      },
    });
  } catch (error) {
    res.status(404).json({
      status: 'fail',
      message: error.message,
    });
  }
};

/**
 * Ottiene statistiche dei libri
 * @async
 * @function getLibriStats
 * @param {Object} req - Express request
 * @param {Object} res - Express response
 * @returns {Object} JSON con statistiche
 */
const getLibriStats = async (req, res) => {
  try {
    const stats = await Libro.getLibriStats();

    res.status(200).json({
      status: 'success',
      data: stats,
    });
  } catch (error) {
    res.status(404).json({
      status: 'fail',
      message: error.message,
    });
  }
};

/**
 * Incrementa il conteggio delle visualizzazioni per un libro
 * @async
 * @param {Object} req - Express request object
 * @param {string} req.params.id - Libro ID
 * @returns {Object} Updated libro document with incremented views
 */
const incrementLibroViews = async (req, res) => {
  try {
    const libroId = req.params.id;
    console.log(`📈 Incrementing views for libro: ${libroId}`);

    const libro = await Libro.findByIdAndUpdate(
      libroId,
      { $inc: { views: 1 } },
      { new: true, runValidators: false }
    );

    if (!libro) {
      return res.status(404).json({
        status: 'fail',
        message: 'Libro non trovato',
      });
    }

    console.log(`✅ Views incremented. Total views: ${libro.views}`);

    res.status(200).json({
      status: 'success',
      data: {
        libroId: libro._id,
        views: libro.views,
      },
    });
  } catch (error) {
    console.error('Error incrementing views:', error);
    res.status(500).json({
      status: 'fail',
      message: 'Error updating views: ' + error.message,
    });
  }
};

/**
 * Ottiene le statistiche complete delle visualizzazioni dei libri
 * @async
 * @param {Object} req - Express request object
 * @returns {Object} Statistiche: totale views, media views, libro più visto, etc.
 */
const getViewsStatistics = async (req, res) => {
  try {
    console.log('📊 Fetching libro views statistics');

    const stats = await Libro.aggregate([
      {
        $group: {
          _id: null,
          totalViews: { $sum: '$views' },
          averageViews: { $avg: '$views' },
          maxViews: { $max: '$views' },
          minViews: { $min: '$views' },
          totalLibri: { $sum: 1 },
        },
      },
    ]);

    // Ottieni i libri più visti (top 10)
    const topLibri = await Libro.find({ status: 'published', isPublic: true })
      .select('_id title author views category downloads')
      .sort({ views: -1 })
      .limit(10);

    // Ottieni statistiche per categoria
    const categoryStats = await Libro.aggregate([
      { $match: { status: 'published', isPublic: true } },
      {
        $group: {
          _id: '$category',
          totalViews: { $sum: '$views' },
          averageViews: { $avg: '$views' },
          count: { $sum: 1 },
        },
      },
      { $sort: { totalViews: -1 } },
    ]);

    const result = {
      status: 'success',
      data: {
        overview: stats[0] || {
          totalViews: 0,
          averageViews: 0,
          maxViews: 0,
          minViews: 0,
          totalLibri: 0,
        },
        topLibri,
        categoryStats,
        timestamp: new Date(),
      },
    };

    console.log(
      `✅ Statistics retrieved. Total views: ${result.data.overview.totalViews}`
    );

    res.status(200).json(result);
  } catch (error) {
    console.error('Error fetching statistics:', error);
    res.status(500).json({
      status: 'fail',
      message: 'Error fetching statistics: ' + error.message,
    });
  }
};

/**
 * Ottieni Lezionari filtrati per anno e trimestre
 * @async
 * @function getLezionari
 * @param {Object} req - Express request
 * @param {Object} req.query.anno - Anno (opzionale)
 * @param {Object} req.query.trimestre - Trimestre 1-4 (opzionale)
 * @param {Object} res - Express response
 *
 * @example
 * GET /api/v1/libri/lezionari?anno=2026&trimestre=1
 */
const getLezionari = async (req, res) => {
  try {
    const { anno, trimestre } = req.query;
    const lezionari = await Libro.getLezionari(
      anno ? parseInt(anno) : null,
      trimestre ? parseInt(trimestre) : null
    );

    res.status(200).json({
      status: 'success',
      results: lezionari.length,
      data: {
        lezionari,
      },
    });
  } catch (error) {
    res.status(500).json({
      status: 'fail',
      message: error.message,
    });
  }
};

/**
 * Ottieni Settimane di Preghiera filtrate per anno
 * @async
 * @function getSettimanePreghiera
 * @param {Object} req - Express request
 * @param {Object} req.query.anno - Anno (opzionale)
 * @param {Object} res - Express response
 *
 * @example
 * GET /api/v1/libri/settimane-preghiera?anno=2025
 */
const getSettimanePreghiera = async (req, res) => {
  try {
    const { anno } = req.query;
    const settimane = await Libro.getSettimanePreghiera(
      anno ? parseInt(anno) : null
    );

    res.status(200).json({
      status: 'success',
      results: settimane.length,
      data: {
        settimane,
      },
    });
  } catch (error) {
    res.status(500).json({
      status: 'fail',
      message: error.message,
    });
  }
};

/**
 * Ottieni gli anni disponibili per Lezionari e Settimane
 * @async
 * @function getAnniDisponibili
 * @param {Object} req - Express request
 * @param {Object} res - Express response
 *
 * @example
 * GET /api/v1/libri/anni-disponibili
 */
const getAnniDisponibili = async (req, res) => {
  try {
    const anni = await Libro.getAnniDisponibili();

    res.status(200).json({
      status: 'success',
      data: {
        anni,
      },
    });
  } catch (error) {
    res.status(500).json({
      status: 'fail',
      message: error.message,
    });
  }
};

module.exports = {
  getAllLibri,
  getLibro,
  searchLibri,
  getLibriByCategory,
  getLibriConsigliati,
  getLibriTopDownloads,
  createLibro,
  updateLibro,
  deleteLibro,
  downloadLibro,
  getLibriStats,
  incrementLibroViews,
  getViewsStatistics,
  getLezionari,
  getSettimanePreghiera,
  getAnniDisponibili,
};
