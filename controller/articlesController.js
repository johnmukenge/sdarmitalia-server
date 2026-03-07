/**
 * @file articlesController.js
 * @description Controller per la gestione degli articoli
 * @version 1.0
 * @author SDA Italia Dev Team
 *
 * Gestisce le operazioni CRUD per gli articoli
 * Supporta filtri, ordinamento e paginazione
 */

const Article = require('./../models/articlesModel');
const APIFeatures = require('./../utils/apiFeatures');

/**
 * Recupera tutti gli articoli con filtri, ordinamento e paginazione
 * @async
 * @function getAllArticles
 * @param {Object} req - Express request
 * @param {Object} res - Express response
 * @returns {Object} JSON con lista di articoli
 */
const getAllArticles = async (req, res) => {
  try {
    const features = new APIFeatures(Article.find(), req.query)
      .filter()
      .sort()
      .limitFields()
      .paginate();

    const articles = await features.query;

    res.status(200).json({
      status: 'success',
      results: articles.length,
      data: {
        articles,
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
 * Recupera un singolo articolo per ID
 * Incrementa automaticamente le views
 * @async
 * @function getArticle
 * @param {Object} req - Express request con articolo ID
 * @param {Object} res - Express response
 * @returns {Object} JSON con i dati dell'articolo
 */
const getArticle = async (req, res) => {
  try {
    // 📈 Incrementa automaticamente le views quando un articolo viene visualizzato
    const article = await Article.findByIdAndUpdate(
      req.params.id,
      { $inc: { views: 1 } },
      { new: true, runValidators: false }
    );

    if (!article) {
      return res.status(404).json({
        status: 'fail',
        message: 'Article not found',
      });
    }

    console.log(`📄 Article "${article.title}" viewed. Total views: ${article.views}`);

    res.status(200).json({
      status: 'success',
      data: {
        article,
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
 * Crea un nuovo articolo
 * @async
 * @function createArticle
 * @param {Object} req - Express request con dati articolo
 * @param {Object} res - Express response
 * @returns {Object} JSON con articolo creato
 */
const createArticle = async (req, res) => {
  try {
    const article = await Article.create(req.body);
    res.status(201).json({
      status: 'success',
      data: {
        article,
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
 * Aggiorna un articolo
 * @async
 * @function updateArticle
 * @param {Object} req - Express request con ID e dati da aggiornare
 * @param {Object} res - Express response
 * @returns {Object} JSON con articolo aggiornato
 */
const updateArticle = async (req, res) => {
  try {
    const article = await Article.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!article) {
      return res.status(404).json({
        status: 'fail',
        message: 'Article not found',
      });
    }

    res.status(200).json({
      status: 'success',
      data: {
        article,
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
 * Elimina un articolo
 * @async
 * @function deleteArticle
 * @param {Object} req - Express request con ID articolo
 * @param {Object} res - Express response
 * @returns {void}
 */
const deleteArticle = async (req, res) => {
  try {
    const article = await Article.findByIdAndDelete(req.params.id);

    if (!article) {
      return res.status(404).json({
        status: 'fail',
        message: 'Article not found',
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
 * Incrementa il conteggio delle visualizzazioni per un articolo
 * @async
 * @param {Object} req - Express request object
 * @param {string} req.params.id - Article ID
 * @returns {Object} Updated article document with incremented views
 */
const incrementArticleViews = async (req, res) => {
  try {
    const articleId = req.params.id;
    console.log(`📈 Incrementing views for article: ${articleId}`);

    const article = await Article.findByIdAndUpdate(
      articleId,
      { $inc: { views: 1 } },
      { new: true, runValidators: false }
    );

    if (!article) {
      return res.status(404).json({
        status: 'fail',
        message: 'Article not found',
      });
    }

    console.log(`✅ Views incremented. Total views: ${article.views}`);

    res.status(200).json({
      status: 'success',
      data: {
        articleId: article._id,
        views: article.views,
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
 * Ottiene le statistiche complete delle visualizzazioni degli articoli
 * @async
 * @param {Object} req - Express request object
 * @returns {Object} Statistiche: totale views, media views, articolo più visto, etc.
 */
const getViewsStatistics = async (req, res) => {
  try {
    console.log('📊 Fetching article views statistics');

    const stats = await Article.aggregate([
      {
        $group: {
          _id: null,
          totalViews: { $sum: '$views' },
          averageViews: { $avg: '$views' },
          maxViews: { $max: '$views' },
          minViews: { $min: '$views' },
          totalArticles: { $sum: 1 },
        },
      },
    ]);

    // Ottieni gli articoli più visti (top 10)
    const topArticles = await Article.find()
      .select('_id title views category publishedAt')
      .sort({ views: -1 })
      .limit(10);

    // Ottieni statistiche per categoria
    const categoryStats = await Article.aggregate([
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
          totalArticles: 0,
        },
        topArticles,
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

module.exports = {
  getAllArticles,
  getArticle,
  createArticle,
  updateArticle,
  deleteArticle,
  incrementArticleViews,
  getViewsStatistics,
};
