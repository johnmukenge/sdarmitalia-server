/**
 * @file documentiRoutes.js
 * @description Route API per la gestione dei documenti (Lezionari, Settimane di Preghiera, etc.)
 * @version 1.0
 * @author SDA Italia Dev Team
 */

const express = require('express');
const documentiController = require('./../controller/documentiController');

const router = express.Router();

/**
 * @route GET /api/v1/documenti/stats
 * @desc Recupera statistiche sui documenti
 * @example GET /api/v1/documenti/stats
 */
router.get('/stats', documentiController.getDocumentiStats);

/**
 * @route GET /api/v1/documenti/statistics/views
 * @desc Recupera statistiche views sui documenti
 * @example GET /api/v1/documenti/statistics/views
 */
router.get('/statistics/views', documentiController.getViewsStatistics);

/**
 * @route GET /api/v1/documenti/in-evidenza
 * @desc Recupera documenti in evidenza
 * @query {number} limit - Numero di documenti da recuperare (default: 6)
 * @example GET /api/v1/documenti/in-evidenza?limit=6
 */
router.get('/in-evidenza', documentiController.getDocumentiInEvidenza);

/**
 * @route GET /api/v1/documenti/top-downloads
 * @desc Recupera i documenti più scaricati
 * @query {number} limit - Numero di documenti da recuperare (default: 10)
 * @example GET /api/v1/documenti/top-downloads?limit=10
 */
router.get('/top-downloads', documentiController.getDocumentiTopDownloads);

/**
 * @route GET /api/v1/documenti/anni-disponibili
 * @desc Recupera tutti gli anni disponibili
 * @example GET /api/v1/documenti/anni-disponibili
 */
router.get('/anni-disponibili', documentiController.getAnniDisponibili);

/**
 * @route GET /api/v1/documenti/lezionari
 * @desc Recupera lezionari filtrati per anno e trimestre
 * @query {number} anno - Anno (required)
 * @query {number} trimestre - Trimestre 1-4 (optional)
 * @example GET /api/v1/documenti/lezionari?anno=2026&trimestre=1
 */
router.get('/lezionari', documentiController.getLezionari);

/**
 * @route GET /api/v1/documenti/settimane-preghiera
 * @desc Recupera settimane di preghiera per anno
 * @query {number} anno - Anno (required)
 * @example GET /api/v1/documenti/settimane-preghiera?anno=2025
 */
router.get('/settimane-preghiera', documentiController.getSettimanePreghiera);

/**
 * @route GET /api/v1/documenti/tipo/:tipo
 * @desc Recupera documenti per tipo
 * @param {string} tipo - Tipo documento (lezionario, settimana_preghiera, etc.)
 * @query {number} limit - Numero di documenti (default: 20)
 * @example GET /api/v1/documenti/tipo/guida_studio?limit=10
 */
router.get('/tipo/:tipo', documentiController.getDocumentiByTipo);

/**
 * @route GET /api/v1/documenti
 * @desc Recupera tutti i documenti con paginazione, filtri e ordinamento
 * @query {number} page - Numero pagina (default: 1)
 * @query {number} limit - Documenti per pagina (default: 10)
 * @query {string} tipo - Filtro per tipo
 * @query {number} anno - Filtro per anno
 * @query {number} trimestre - Filtro per trimestre
 * @query {string} sort - Campo per ordinamento (es: -downloads)
 * @example GET /api/v1/documenti?page=1&limit=10&tipo=lezionario&anno=2026
 */
router.get('/', documentiController.getAllDocumenti);

/**
 * @route GET /api/v1/documenti/:id
 * @desc Recupera un singolo documento per ID (incrementa views automaticamente)
 * @param {string} id - ID documento (MongoDB ObjectId)
 * @example GET /api/v1/documenti/507f1f77bcf86cd799439011
 */
router.get('/:id', documentiController.getDocumento);

/**
 * @route POST /api/v1/documenti
 * @desc Crea un nuovo documento
 * @body {Object} documento - Dati del documento
 * @example
 * POST /api/v1/documenti
 * { titolo: "...", tipo: "lezionario", anno: 2026, ... }
 */
router.post('/', documentiController.createDocumento);

/**
 * @route PATCH /api/v1/documenti/:id
 * @desc Aggiorna un documento
 * @param {string} id - ID documento
 * @body {Object} updates - Campi da aggiornare
 * @example
 * PATCH /api/v1/documenti/507f1f77bcf86cd799439011
 * { inEvidenza: true }
 */
router.patch('/:id', documentiController.updateDocumento);

/**
 * @route POST /api/v1/documenti/:id/download
 * @desc Incrementa il contatore di download per un documento
 * @param {string} id - ID documento
 * @example POST /api/v1/documenti/507f1f77bcf86cd799439011/download
 */
router.post('/:id/download', documentiController.downloadDocumento);

/**
 * @route PATCH /api/v1/documenti/:id/views
 * @desc Incrementa il contatore di views per un documento
 * @param {string} id - ID documento
 * @example PATCH /api/v1/documenti/507f1f77bcf86cd799439011/views
 */
router.patch('/:id/views', documentiController.incrementDocumentoViews);

/**
 * @route DELETE /api/v1/documenti/:id
 * @desc Elimina un documento
 * @param {string} id - ID documento
 * @example DELETE /api/v1/documenti/507f1f77bcf86cd799439011
 */
router.delete('/:id', documentiController.deleteDocumento);

module.exports = router;
