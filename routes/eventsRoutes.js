const express = require('express');

const {
  getAllEvents,
  getEvent,
  searchEvents,
  getEventsByCategory,
  getUpcomingEvents,
  getEventsStats,
  createEvent,
  updateEvent,
  deleteEvent,
  registerForEvent,
} = require('../controller/eventsController');

const eventsRoutes = express.Router();

/**
 * Routes per gli eventi
 */

// Rotte specifiche (DEVONO venire prima di /:id)
eventsRoutes.get('/search', searchEvents);
eventsRoutes.get('/upcoming', getUpcomingEvents);
eventsRoutes.get('/stats', getEventsStats);
eventsRoutes.get('/category/:category', getEventsByCategory);

// Rotte per ID
eventsRoutes.route('/').get(getAllEvents).post(createEvent);

eventsRoutes.route('/:id').get(getEvent).patch(updateEvent).delete(deleteEvent);

// Registrazione a evento
eventsRoutes.post('/:id/register', registerForEvent);

module.exports = eventsRoutes;
