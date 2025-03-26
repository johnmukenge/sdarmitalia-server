const express = require('express');

const {
    getAllContacts, 
    createContact, 
    getContact, 
    updateContact, 
    deleteContact,
} = require('./../controller/contactController');


const contactRoutes = express.Router();

contactRoutes.route('/')
    .get(getAllContacts)
    .post(createContact);

contactRoutes.route('/:id')
    .get(getContact)
    .patch(updateContact)
    .delete(deleteContact);

module.exports = contactRoutes;