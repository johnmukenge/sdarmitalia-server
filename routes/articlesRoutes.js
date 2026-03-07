/**
 * @file articlesRoutes.js
 * @description Routes per la gestione degli articoli
 * @version 1.0
 * @author SDA Italia Dev Team
 */

const express = require('express');
const router = express.Router();
const {
  getAllArticles,
  getArticle,
  createArticle,
  updateArticle,
  deleteArticle,
  incrementArticleViews,
  getViewsStatistics,
} = require('./../controller/articlesController');

// Statistiche views
router.route('/statistics/views').get(getViewsStatistics);

// Incrementa views
router.route('/:id/views').patch(incrementArticleViews);

// CRUD routes
router.route('/').get(getAllArticles).post(createArticle);

router.route('/:id').get(getArticle).patch(updateArticle).delete(deleteArticle);

module.exports = router;
