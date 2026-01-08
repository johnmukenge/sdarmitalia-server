/**
 * @file projectPhaseRoutes.js
 * @description Routes per le fasi del progetto NewCampus
 * @version 1.0
 */

const express = require('express');
const {
  getAllPhases,
  getPhaseByNumber,
  getPhaseById,
  getPhaseMedia,
  getPhaseMilestones,
  getProjectStats,
  createPhase,
  updatePhase,
  updatePhaseProgress,
  addPhaseMedia,
  deletePhase,
} = require('../controller/projectPhaseController');

const router = express.Router();

/**
 * Routes per le fasi del progetto
 * Le route specifiche DEVONO venire prima di quelle parametrizzate
 */

// Rotte generali (specifiche)
router.get('/stats', getProjectStats);
router.get('/progress/all', getAllPhases);

// Rotte per numero fase (PRIMA di :id)
router.get('/number/:phaseNumber', getPhaseByNumber);
router.get('/number/:phaseNumber/media', getPhaseMedia);
router.get('/number/:phaseNumber/milestones', getPhaseMilestones);
router.patch('/number/:phaseNumber/progress', updatePhaseProgress);
router.post('/number/:phaseNumber/media', addPhaseMedia);

// Rotte per ID fase
router.get('/:id', getPhaseById);
router.patch('/:id', updatePhase);
router.delete('/:id', deletePhase);

// Rotte principali
router.get('/', getAllPhases);
router.post('/', createPhase);

module.exports = router;
