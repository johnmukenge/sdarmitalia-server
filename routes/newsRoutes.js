const express = require('express');

const {
  getAllNews,
  createNews,
  getNews,
  updateNews,
  deleteNews,
  getViewsStatistics,
} = require('./../controller/newsController');

const newsRoutes = express.Router();

newsRoutes.route('/').get(getAllNews).post(createNews);

// 📊 Statistiche views
newsRoutes.get('/stats/views', getViewsStatistics);

newsRoutes.route('/:id').get(getNews).patch(updateNews).delete(deleteNews);

module.exports = newsRoutes;
