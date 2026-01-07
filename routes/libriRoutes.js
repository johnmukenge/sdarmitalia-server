/**
 * @file libriRoutes.js
 * @description Route API per la gestione della biblioteca (libri)
 * @version 1.0
 * @author SDA Italia Dev Team
 *
 * Definisce gli endpoint per operazioni CRUD su libri
 * Supporta ricerca, filtri, ordinamento e paginazione
 */

const express = require('express');
const libriController = require('./../controller/libriController');

const router = express.Router();

/**
 * @route GET /api/v1/libri
 * @desc Recupera tutti i libri con paginazione, filtri e ordinamento
 * @query {number} page - Numero pagina (default: 1)
 * @query {number} limit - Documenti per pagina (default: 10)
 * @query {string} category - Filtro per categoria
 * @query {string} sort - Campo per ordinamento (es: -rating)
 * @example
 * GET /api/v1/libri?page=1&limit=10&category=bibbia&sort=-rating
 */
router.get('/', libriController.getAllLibri);

/**
 * @route GET /api/v1/libri/consigliati
 * @desc Recupera libri consigliati (featured e top-rated)
 * @example
 * GET /api/v1/libri/consigliati
 */
router.get('/consigliati', libriController.getLibriConsigliati);

/**
 * @route GET /api/v1/libri/top-downloads
 * @desc Recupera i libri più scaricati
 * @query {number} limit - Numero di libri da recuperare (default: 10)
 * @example
 * GET /api/v1/libri/top-downloads?limit=10
 */
router.get('/top-downloads', libriController.getLibriTopDownloads);

/**
 * @route GET /api/v1/libri/stats
 * @desc Recupera statistiche sui libri
 * @example
 * GET /api/v1/libri/stats
 */
router.get('/stats', libriController.getLibriStats);

/**
 * @route GET /api/v1/libri/search
 * @desc Esegue ricerca full-text nei libri
 * @query {string} q - Query di ricerca (required)
 * @example
 * GET /api/v1/libri/search?q=grande+controversia
 */
router.get('/search', libriController.searchLibri);

/**
 * @route GET /api/v1/libri/category/:category
 * @desc Recupera libri per categoria
 * @param {string} category - Categoria libro
 * @example
 * GET /api/v1/libri/category/teologia
 */
router.get('/category/:category', libriController.getLibriByCategory);

/**
 * @route GET /api/v1/libri/:id
 * @desc Recupera un singolo libro per ID
 * @param {string} id - ID libro (MongoDB ObjectId)
 * @example
 * GET /api/v1/libri/507f1f77bcf86cd799439011
 */
router.get('/:id', libriController.getLibro);

/**
 * @route POST /api/v1/libri
 * @desc Crea un nuovo libro
 * @body {Object} libro - Dati del libro
 * @example
 * POST /api/v1/libri
 * { title: "...", author: "...", category: "..." }
 */
router.post('/', libriController.createLibro);

/**
 * @route PATCH /api/v1/libri/:id
 * @desc Aggiorna un libro
 * @param {string} id - ID libro
 * @body {Object} updates - Campi da aggiornare
 * @example
 * PATCH /api/v1/libri/507f1f77bcf86cd799439011
 * { rating: 4.8, featured: true }
 */
router.patch('/:id', libriController.updateLibro);

/**
 * @route POST /api/v1/libri/:id/download
 * @desc Incrementa il contatore di download per un libro
 * @param {string} id - ID libro
 * @example
 * POST /api/v1/libri/507f1f77bcf86cd799439011/download
 */
router.post('/:id/download', libriController.downloadLibro);

/**
 * @route DELETE /api/v1/libri/:id
 * @desc Elimina un libro
 * @param {string} id - ID libro
 * @example
 * DELETE /api/v1/libri/507f1f77bcf86cd799439011
 */
router.delete('/:id', libriController.deleteLibro);

module.exports = router;
