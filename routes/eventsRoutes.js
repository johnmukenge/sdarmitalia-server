const express = require('express');

const {
  getAllEvents,
  getEvent,
  createEvent,
  updateEvent,
  deleteEvent,
  incrementEventViews,
  getViewsStatistics,
} = require('../controller/eventsController');

const eventsRoutes = express.Router();

/**
 * Routes per gli eventi
 */

// Statistiche views
eventsRoutes.get('/statistics/views', getViewsStatistics);

// Incrementa views
eventsRoutes.patch('/:id/views', incrementEventViews);

// Rotte per ID
eventsRoutes.route('/').get(getAllEvents).post(createEvent);

eventsRoutes.route('/:id').get(getEvent).patch(updateEvent).delete(deleteEvent);

module.exports = eventsRoutes;
