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
    const libro = await Libro.findById(req.params.id);

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
};
