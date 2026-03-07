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
        // 📈 Incrementa automaticamente le views quando un evento viene visualizzato
        const eventi = await Eventi.findByIdAndUpdate(
            req.params.id,
            { $inc: { views: 1 } },
            { new: true, runValidators: false }
        );

        if (!eventi) {
            return res.status(404).json({
                status: 'fail',
                message: 'Event not found',
            });
        }

        console.log(`📅 Event "${eventi.title}" viewed. Total views: ${eventi.views}`);

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

/**
 * Incrementa il conteggio delle visualizzazioni per un evento
 * @async
 * @param {Object} req - Express request object
 * @param {string} req.params.id - Event ID
 * @returns {Object} Updated event document with incremented views
 */
const incrementEventViews = async (req, res) => {
    try {
        const eventId = req.params.id;
        console.log(`📈 Incrementing views for event: ${eventId}`);

        const event = await Eventi.findByIdAndUpdate(
            eventId,
            { $inc: { views: 1 } },
            { new: true, runValidators: false }
        );

        if (!event) {
            return res.status(404).json({
                status: 'fail',
                message: 'Event not found',
            });
        }

        console.log(`✅ Views incremented. Total views: ${event.views}`);

        res.status(200).json({
            status: 'success',
            data: {
                eventId: event._id,
                views: event.views,
            },
        });
    } catch (error) {
        console.error('Error incrementing views:', error);
        res.status(500).json({
            status: 'fail',
            message: 'Error updating views: ' + error.message,
        });
    }
};

/**
 * Ottiene le statistiche complete delle visualizzazioni degli eventi
 * @async
 * @param {Object} req - Express request object
 * @returns {Object} Statistiche: totale views, media views, evento più visto, etc.
 */
const getViewsStatistics = async (req, res) => {
    try {
        console.log('📊 Fetching event views statistics');

        const stats = await Eventi.aggregate([
            {
                $group: {
                    _id: null,
                    totalViews: { $sum: '$views' },
                    averageViews: { $avg: '$views' },
                    maxViews: { $max: '$views' },
                    minViews: { $min: '$views' },
                    totalEvents: { $sum: 1 },
                },
            },
        ]);

        // Ottieni gli eventi più visti (top 10)
        const topEvents = await Eventi.find({ status: { $ne: 'cancelled' } })
            .select('_id title views location date')
            .sort({ views: -1 })
            .limit(10);

        // Ottieni statistiche per status
        const statusStats = await Eventi.aggregate([
            {
                $group: {
                    _id: '$status',
                    totalViews: { $sum: '$views' },
                    averageViews: { $avg: '$views' },
                    count: { $sum: 1 },
                },
            },
            { $sort: { totalViews: -1 } },
        ]);

        const result = {
            status: 'success',
            data: {
                overview: stats[0] || {
                    totalViews: 0,
                    averageViews: 0,
                    maxViews: 0,
                    minViews: 0,
                    totalEvents: 0,
                },
                topEvents,
                statusStats,
                timestamp: new Date(),
            },
        };

        console.log(
            `✅ Statistics retrieved. Total views: ${result.data.overview.totalViews}`
        );

        res.status(200).json(result);
    } catch (error) {
        console.error('Error fetching statistics:', error);
        res.status(500).json({
            status: 'fail',
            message: 'Error fetching statistics: ' + error.message,
        });
    }
};

module.exports = {
    getAllEvents,
    getEvent,
    createEvent,
    updateEvent,
    deleteEvent,
    incrementEventViews,
    getViewsStatistics,
};