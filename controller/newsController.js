const News = require('./../models/newsModel');
const APIFeatures = require('./../utils/apiFeatures');

const getAllNews = async (req, res) => {
  try {
    // Execute the query
    console.log('req.query', req.query);
    const features = new APIFeatures(News.find(), req.query)
      .filter()
      .sort()
      .limitFields()
      .paginate();
    const news = await features.query;

    // Send the response
    res.status(200).json({
      status: 'success',
      results: news.length,
      data: {
        news,
      },
    });
  } catch (error) {
    res.status(404).json({
      status: 'fail',
      message: error.message,
    });
  }
};
const getNews = async (req, res) => {
  try {
    // 📈 Incrementa automaticamente le views quando una notizia viene caricata
    const news = await News.findByIdAndUpdate(
      req.params.id,
      { $inc: { views: 1 } },
      { new: true, runValidators: false },
    );

    if (!news) {
      return res.status(404).json({
        status: 'fail',
        message: 'News not found',
      });
    }

    console.log(`📰 News "${news.title}" viewed. Total views: ${news.views}`);

    res.status(200).json({
      status: 'success',
      data: {
        news,
      },
    });
  } catch (error) {
    console.log('errore', error);
    res.status(404).json({
      status: 'fail',
      message: error,
    });
  }
};
const createNews = async (req, res) => {
  try {
    const news = await News.create(req.body);
    res.status(201).json({
      status: 'success',
      data: {
        news: news,
      },
    });
  } catch (error) {
    res.status(400).json({
      status: 'fail',
      message: 'Invalid data received',
    });
  }
};
const updateNews = async (req, res) => {
  try {
    const news = await News.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    res.status(200).json({
      status: 'success',
      data: {
        news,
      },
    });
  } catch (error) {
    res.status(404).json({
      status: 'fail',
      message: error,
    });
  }
};
const deleteNews = async (req, res) => {
  try {
    await News.findByIdAndDelete(req.params.id);
    res.status(204).json({
      status: 'success',
      data: null,
    });
  } catch (error) {
    res.status(404).json({
      status: 'fail',
      message: error,
    });
  }
};

/**
 * Incrementa il conteggio delle visualizzazioni per una notizia
 * @async
 * @param {Object} req - Express request object
 * @param {string} req.params.id - News ID
 * @returns {Object} Updated news document with incremented views
 */
const incrementNewsViews = async (req, res) => {
  try {
    const newsId = req.params.id;
    console.log(`📈 Incrementing views for news: ${newsId}`);

    const news = await News.findByIdAndUpdate(
      newsId,
      { $inc: { views: 1 } },
      { new: true, runValidators: false },
    );

    if (!news) {
      return res.status(404).json({
        status: 'fail',
        message: 'News not found',
      });
    }

    console.log(`✅ Views incremented. Total views: ${news.views}`);

    res.status(200).json({
      status: 'success',
      data: {
        newsId: news._id,
        views: news.views,
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
 * Ottiene le statistiche complete delle visualizzazioni
 * @async
 * @param {Object} req - Express request object
 * @returns {Object} Statistiche: totale views, media views, news più vista, etc.
 */
const getViewsStatistics = async (req, res) => {
  try {
    console.log('📊 Fetching views statistics');

    const stats = await News.aggregate([
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

    // Ottieni le news più viste (top 10)
    const topNews = await News.find({ status: 'published' })
      .select('_id title views category publishedAt')
      .sort({ views: -1 })
      .limit(10);

    // Ottieni statistiche per categoria
    const categoryStats = await News.aggregate([
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
        topNews,
        categoryStats,
        timestamp: new Date(),
      },
    };

    console.log(
      `✅ Statistics retrieved. Total views: ${result.data.overview.totalViews}`,
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
  getAllNews,
  getNews,
  createNews,
  updateNews,
  deleteNews,
  incrementNewsViews,
  getViewsStatistics,
};
