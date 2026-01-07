const Conferenza = require('../models/conferenzaModel');
const APIFeatures = require('../utils/apiFeatures');

const getAllRegistrations = async (req, res) => {
    try {
        // Execute the query
        const features = new APIFeatures(Conferenza.find(), req.query)
                            .filter()
                            .sort()
                            .limitFields()
                            .paginate();
        const registrazioni = await features.query;

        // Send the response
        res.status(200).json({
            status: 'success',
            results: registrazioni.length,
            data: {
                registrazioni,
            },
        });
    } catch (error) {
        res.status(404).json({
            status: 'fail',
            message: error.message,
        });
    }
};
const getRegistration = async (req, res) => {
    try {
        const registrazione = await Conferenza.findById(req.params.id);
        res.status(200).json({
            status: 'success',
            data: {
                registrazione: registrazione,
            },
        });
    } catch (error) {
        res.status(404).json({
            status: 'fail',
            message: error,
        });
    }
};
const getMember = async (req, res) => {
    try {
        const registrazione = await Conferenza.findById(req.params.nome);
        res.status(200).json({
            status: 'success',
            data: {
                registrazione: registrazione,
            },
        });
    } catch (error) {
        res.status(404).json({
            status: 'fail',
            message: error,
        });
    }
};
const createRegistration = async (req, res) => {
    try {
        const registrazione = await Conferenza.create(req.body);
        res.status(201).json({
            status: 'success',
            data: {
                registrazione: registrazione,
            },
        });
    } catch (error) {
        res.status(400).json({
            status: 'fail',
            message: error.message,
        });
    }
};
const updateRegistration = async (req, res) => {
    try {
        const registration = await Conferenza
            .findByIdAndUpdate(req.params.id, req.body, {
                new: true,
                runValidators: true,
            });
        res.status(200).json({
            status: 'success',
            data: {
                registration: registration,
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
const deleteRegistration = async (req, res) => {
    try {
        await Conferenza.findByIdAndDelete(req.params.id);
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
    getAllRegistrations,
    getRegistration,
    createRegistration,
    updateRegistration,
    deleteRegistration,
    getMember,
};