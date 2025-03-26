const express = require('express');

const {
    getAllNews, 
    createNews, 
    getNews, 
    updateNews, 
    deleteNews,
} = require('./../controller/newsController');


const newsRoutes = express.Router();

newsRoutes.route('/')
    .get(getAllNews)
    .post(createNews);

newsRoutes.route('/:id')
    .get(getNews)
    .patch(updateNews)
    .delete(deleteNews);

module.exports = newsRoutes;