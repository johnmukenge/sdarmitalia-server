const Eventi = require('./../models/eventiModel');
const APIFeatures = require('./../utils/apiFeatures');

const getAllEvents = async (req, res) => {
    try {
        // Execute the query
        const features = new APIFeatures(Eventi.find(), req.query)
                            .filter()
                            .sort()
                            .limitFields()
                            .paginate();
        const eventi = await features.query;

        // Send the response
        res.status(200).json({
            status: 'success',
            results: eventi.length,
            data: {
                eventi,
            },
        });
    } catch (error) {
        res.status(404).json({
            status: 'fail',
            message: error.message,
        });
    }
};
const getEvent = async (req, res) => {
    try {
        const eventi = await Eventi.findById(req.params.id);
        res.status(200).json({
            status: 'success',
            data: {
                eventi,
            },
        });
    } catch (error) {
        res.status(404).json({
            status: 'fail',
            message: error,
        });
    }
};
const createEvent = async (req, res) => {
    try {
        const eventi = await Eventi.create(req.body);
        res.status(201).json({
            status: 'success',
            data: {
                eventi: eventi,
            },
        });
    } catch (error) {
        res.status(400).json({
            status: 'fail',
            message: 'Invalid data received',
        });
    }
};
const updateEvent = async (req, res) => {
    try {
        const eventi = await Eventi
            .findByIdAndUpdate(req.params.id, req.body, {
                new: true,
                runValidators: true,
            });
        res.status(200).json({
            status: 'success',
            data: {
                eventi,
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
const deleteEvent = async (req, res) => {
    try {
        await Eventi.findByIdAndDelete(req.params.id);
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
    getAllEvents,
    getEvent,
    createEvent,
    updateEvent,
    deleteEvent,
};