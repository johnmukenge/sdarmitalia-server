const express = require('express');

const {
    getAllEvents, 
    createEvent, 
    getEvent, 
    updateEvent, 
    deleteEvent,
} = require('../controller/eventsController');


const eventsRoutes = express.Router();

eventsRoutes.route('/')
    .get(getAllEvents)
    .post(createEvent);

eventsRoutes.route('/:id')
    .get(getEvent)
    .patch(updateEvent)
    .delete(deleteEvent);

module.exports = eventsRoutes;