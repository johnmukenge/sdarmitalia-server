const express = require('express');

const {
    getAllRegistrations, 
    createRegistration, 
    getRegistration, 
    updateRegistration, 
    deleteRegistration,
} = require('../controller/conferenzaController');


const conferenzaRoutes = express.Router();

conferenzaRoutes.route('/')
    .get(getAllRegistrations)
    .post(createRegistration);

conferenzaRoutes.route('/:id')
    .get(getRegistration)
    .patch(updateRegistration)
    .delete(deleteRegistration);

module.exports = conferenzaRoutes;