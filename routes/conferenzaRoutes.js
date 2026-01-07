const express = require('express');

const {
    getAllRegistrations, 
    createRegistration, 
    getRegistration, 
    updateRegistration, 
    deleteRegistration,
    getMember,
} = require('../controller/conferenzaController');


const conferenzaRoutes = express.Router();

conferenzaRoutes.route('/')
    .get(getAllRegistrations)
    .post(createRegistration);

conferenzaRoutes.route('/:id')
    .get(getRegistration)
    .patch(updateRegistration)
    .delete(deleteRegistration);

conferenzaRoutes.route('/:nome')
    .get(getMember);

module.exports = conferenzaRoutes;