/**
 * @file documentiController.js
 * @description Controller per la gestione dei documenti (Lezionari, Settimane di Preghiera, etc.)
 * @version 1.0
 * @author SDA Italia Dev Team
 *
 * Gestisce le operazioni CRUD per i documenti
 * Supporta ricerca, filtri per tipo, anno, trimestre
 * Traccia automaticamente downloads e views
 */

const Documento = require('./../models/documentiModel');
const APIFeatures = require('./../utils/apiFeatures');

/**
 * Recupera tutti i documenti con filtri, ordinamento e paginazione
 * @async
 * @function getAllDocumenti
 * @param {Object} req - Express request
 * @param {Object} res - Express response
 * @returns {Object} JSON con lista di documenti
 *
 * @example
 * GET /api/v1/documenti?tipo=lezionario&anno=2026&limit=10
 */
const getAllDocumenti = async (req, res) => {
  try {
    const features = new APIFeatures(Documento.find(), req.query)
      .filter()
      .sort()
      .limitFields()
      .paginate();

    const documenti = await features.query;

    res.status(200).json({
      status: 'success',
      results: documenti.length,
      data: {
        documenti,
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
 * Recupera un singolo documento per ID
 * Incrementa automaticamente le views
 * @async
 * @function getDocumento
 * @param {Object} req - Express request con documento ID
 * @param {Object} res - Express response
 * @returns {Object} JSON con i dati del documento
 */
const getDocumento = async (req, res) => {
  try {
    // 📈 Incrementa automaticamente le views quando un documento viene visualizzato
    const documento = await Documento.findByIdAndUpdate(
      req.params.id,
      { $inc: { views: 1 } },
      { new: true, runValidators: false }
    );

    if (!documento) {
      return res.status(404).json({
        status: 'fail',
        message: 'Documento non trovato',
      });
    }

    console.log(
      `📄 Documento "${documento.titolo}" visualizzato. Total views: ${documento.views}`
    );

    res.status(200).json({
      status: 'success',
      data: {
        documento,
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
 * Recupera lezionari per anno e trimestre
 * @async
 * @function getLezionari
 * @param {Object} req - Express request
 * @param {Object} res - Express response
 * @returns {Object} JSON con lezionari filtrati
 *
 * @example
 * GET /api/v1/documenti/lezionari?anno=2026&trimestre=1
 */
const getLezionari = async (req, res) => {
  try {
    const { anno, trimestre } = req.query;

    if (!anno) {
      return res.status(400).json({
        status: 'fail',
        message: 'Anno è obbligatorio',
      });
    }

    const lezionari = await Documento.getLezionari(
      parseInt(anno),
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
    res.status(404).json({
      status: 'fail',
      message: error.message,
    });
  }
};

/**
 * Recupera settimane di preghiera per anno
 * @async
 * @function getSettimanePreghiera
 * @param {Object} req - Express request
 * @param {Object} res - Express response
 * @returns {Object} JSON con settimane di preghiera
 *
 * @example
 * GET /api/v1/documenti/settimane-preghiera?anno=2025
 */
const getSettimanePreghiera = async (req, res) => {
  try {
    const { anno } = req.query;

    if (!anno) {
      return res.status(400).json({
        status: 'fail',
        message: 'Anno è obbligatorio',
      });
    }

    const settimane = await Documento.getSettimanePreghiera(parseInt(anno));

    res.status(200).json({
      status: 'success',
      results: settimane.length,
      data: {
        settimane,
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
 * Recupera documenti per tipo
 * @async
 * @function getDocumentiByTipo
 * @param {Object} req - Express request con tipo
 * @param {Object} res - Express response
 * @returns {Object} JSON con documenti del tipo specificato
 *
 * @example
 * GET /api/v1/documenti/tipo/guida_studio
 */
const getDocumentiByTipo = async (req, res) => {
  try {
    const { tipo } = req.params;
    const limit = parseInt(req.query.limit, 10) || 20;

    const documenti = await Documento.getByTipo(tipo, limit);

    res.status(200).json({
      status: 'success',
      results: documenti.length,
      data: {
        documenti,
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
 * Recupera documenti in evidenza
 * @async
 * @function getDocumentiInEvidenza
 * @param {Object} req - Express request
 * @param {Object} res - Express response
 * @returns {Object} JSON con documenti in evidenza
 *
 * @example
 * GET /api/v1/documenti/in-evidenza?limit=6
 */
const getDocumentiInEvidenza = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit, 10) || 6;

    const documenti = await Documento.getInEvidenza(limit);

    res.status(200).json({
      status: 'success',
      results: documenti.length,
      data: {
        documenti,
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
 * Recupera i documenti più scaricati
 * @async
 * @function getDocumentiTopDownloads
 * @param {Object} req - Express request
 * @param {Object} res - Express response
 * @returns {Object} JSON con documenti più scaricati
 *
 * @example
 * GET /api/v1/documenti/top-downloads?limit=10
 */
const getDocumentiTopDownloads = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit, 10) || 10;

    const documenti = await Documento.getMostDownloaded(limit);

    res.status(200).json({
      status: 'success',
      results: documenti.length,
      data: {
        documenti,
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
 * Recupera gli anni disponibili
 * @async
 * @function getAnniDisponibili
 * @param {Object} req - Express request
 * @param {Object} res - Express response
 * @returns {Object} JSON con anni disponibili
 *
 * @example
 * GET /api/v1/documenti/anni-disponibili
 */
const getAnniDisponibili = async (req, res) => {
  try {
    const anni = await Documento.getAvailableYears();

    res.status(200).json({
      status: 'success',
      data: {
        anni,
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
 * Crea un nuovo documento
 * @async
 * @function createDocumento
 * @param {Object} req - Express request con dati documento
 * @param {Object} res - Express response
 * @returns {Object} JSON con documento creato
 */
const createDocumento = async (req, res) => {
  try {
    const documento = await Documento.create(req.body);

    res.status(201).json({
      status: 'success',
      data: {
        documento,
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
 * Aggiorna un documento
 * @async
 * @function updateDocumento
 * @param {Object} req - Express request con ID e dati da aggiornare
 * @param {Object} res - Express response
 * @returns {Object} JSON con documento aggiornato
 */
const updateDocumento = async (req, res) => {
  try {
    const documento = await Documento.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true,
      }
    );

    if (!documento) {
      return res.status(404).json({
        status: 'fail',
        message: 'Documento non trovato',
      });
    }

    res.status(200).json({
      status: 'success',
      data: {
        documento,
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
 * Elimina un documento
 * @async
 * @function deleteDocumento
 * @param {Object} req - Express request con ID documento
 * @param {Object} res - Express response
 * @returns {void}
 */
const deleteDocumento = async (req, res) => {
  try {
    const documento = await Documento.findByIdAndDelete(req.params.id);

    if (!documento) {
      return res.status(404).json({
        status: 'fail',
        message: 'Documento non trovato',
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
 * Incrementa il contatore di download
 * @async
 * @function downloadDocumento
 * @param {Object} req - Express request con ID documento
 * @param {Object} res - Express response
 * @returns {Object} JSON con numero di download aggiornato
 */
const downloadDocumento = async (req, res) => {
  try {
    const documento = await Documento.findByIdAndUpdate(
      req.params.id,
      { $inc: { downloads: 1 } },
      { new: true, runValidators: false }
    );

    if (!documento) {
      return res.status(404).json({
        status: 'fail',
        message: 'Documento non trovato',
      });
    }

    console.log(
      `⬇️ Documento "${documento.titolo}" scaricato. Total downloads: ${documento.downloads}`
    );

    res.status(200).json({
      status: 'success',
      data: {
        documentoId: documento._id,
        downloads: documento.downloads,
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
 * Incrementa il conteggio delle visualizzazioni per un documento
 * @async
 * @param {Object} req - Express request object
 * @param {string} req.params.id - Documento ID
 * @returns {Object} Updated documento document with incremented views
 */
const incrementDocumentoViews = async (req, res) => {
  try {
    const documentoId = req.params.id;
    console.log(`📈 Incrementing views for documento: ${documentoId}`);

    const documento = await Documento.findByIdAndUpdate(
      documentoId,
      { $inc: { views: 1 } },
      { new: true, runValidators: false }
    );

    if (!documento) {
      return res.status(404).json({
        status: 'fail',
        message: 'Documento non trovato',
      });
    }

    console.log(`✅ Views incremented. Total views: ${documento.views}`);

    res.status(200).json({
      status: 'success',
      data: {
        documentoId: documento._id,
        views: documento.views,
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
 * Ottiene statistiche dei documenti
 * @async
 * @function getDocumentiStats
 * @param {Object} req - Express request
 * @param {Object} res - Express response
 * @returns {Object} JSON con statistiche
 */
const getDocumentiStats = async (req, res) => {
  try {
    const stats = await Documento.getStats();

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
 * Ottiene le statistiche complete delle visualizzazioni dei documenti
 * @async
 * @param {Object} req - Express request object
 * @returns {Object} Statistiche: totale views, media views, documento più visto, etc.
 */
const getViewsStatistics = async (req, res) => {
  try {
    console.log('📊 Fetching documento views statistics');

    const stats = await Documento.aggregate([
      {
        $group: {
          _id: null,
          totalViews: { $sum: '$views' },
          averageViews: { $avg: '$views' },
          maxViews: { $max: '$views' },
          minViews: { $min: '$views' },
          totalDocumenti: { $sum: 1 },
        },
      },
    ]);

    // Ottieni i documenti più visti (top 10)
    const topDocumenti = await Documento.find({
      status: 'published',
      isPublic: true,
    })
      .select('_id titolo tipo anno trimestre views downloads')
      .sort({ views: -1 })
      .limit(10);

    // Ottieni statistiche per tipo
    const tipoStats = await Documento.aggregate([
      { $match: { status: 'published', isPublic: true } },
      {
        $group: {
          _id: '$tipo',
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
          totalDocumenti: 0,
        },
        topDocumenti,
        tipoStats,
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

module.exports = {
  getAllDocumenti,
  getDocumento,
  getLezionari,
  getSettimanePreghiera,
  getDocumentiByTipo,
  getDocumentiInEvidenza,
  getDocumentiTopDownloads,
  getAnniDisponibili,
  createDocumento,
  updateDocumento,
  deleteDocumento,
  downloadDocumento,
  incrementDocumentoViews,
  getDocumentiStats,
  getViewsStatistics,
};
