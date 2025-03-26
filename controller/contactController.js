const Contact = require('../models/contactModel');
const APIFeatures = require('../utils/apiFeatures');

const getAllContacts = async (req, res) => {
    try {
        // Execute the query
        const features = new APIFeatures(Contact.find(), req.query)
                            .filter()
                            .sort()
                            .limitFields()
                            .paginate();
        const contacts = await features.query;

        // Send the response
        res.status(200).json({
            status: 'success',
            results: contacts.length,
            data: {
                news,
            },
        });
    } catch (error) {
        res.status(404).json({
            status: 'fail',
            message: error.message,
        });
    }
};
const getContact = async (req, res) => {
    try {
        const contact = await Contact.findById(req.params.id);
        res.status(200).json({
            status: 'success',
            data: {
                contact,
            },
        });
    } catch (error) {
        res.status(404).json({
            status: 'fail',
            message: error,
        });
    }
};
const createContact = async (req, res) => {
    try {
        console.log(req.body);
        const contact = await Contact.create(req.body);
        res.status(201).json({
            status: 'success',
            data: {
                contact: contact,
            },
        });
    } catch (error) {
        res.status(400).json({
            status: 'fail',
            message: error.message,
        });
    }
};
const updateContact = async (req, res) => {
    try {
        const contact = await News
            .findByIdAndUpdate(req.params.id, req.body, {
                new: true,
                runValidators: true,
            });
        res.status(200).json({
            status: 'success',
            data: {
                contact,
            },
        });
    }
    catch (error) {
        res.status(404).json({
            status: 'fail',
            message: error,
        });
    }
    
};
const deleteContact = async (req, res) => {
    try {
        await Contact.findByIdAndDelete(req.params.id);
        res.status(204).json({
            status: 'success',
            data: null,
        });
    } catch (error) {
        res.status(404).json({
            status: 'fail',
            message: error,
        });
    }
};

module.exports = {
    getAllContacts,
    getContact,
    createContact,
    updateContact,
    deleteContact,
};