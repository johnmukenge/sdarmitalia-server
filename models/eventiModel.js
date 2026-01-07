/**
 * @file eventiModel.js
 * @description Events/Meetings collection schema and model
 * @version 2.0
 * @author SDA Italia Dev Team
 *
 * Represents church events, meetings, and activities
 * Tracks registrations and capacity management
 * Supports location-based queries and filtering
 *
 * @example
 * const upcoming = await Event.getUpcoming();
 * const registered = await event.getRegistrations();
 */

const mongoose = require('mongoose');

/**
 * Event Schema Definition
 *
 * @typedef {Object} Event
 * @property {string} title - Event name (required, 5-200 chars)
 * @property {string} description - Event details (required, 20+ chars)
 * @property {Date} date - Event start date/time (required, future date)
 * @property {Date} endDate - Event end date/time (optional, must be after start date)
 * @property {string} location - Event location (required)
 * @property {Object} coordinates - GPS coordinates for map display
 *   @property {number} latitude - Latitude coordinate
 *   @property {number} longitude - Longitude coordinate
 * @property {string} image - Featured image URL (optional)
 * @property {number} capacity - Maximum attendees (default: unlimited)
 * @property {number} registrations - Current registration count (default: 0)
 * @property {string} status - Event status: 'scheduled', 'ongoing', 'completed', 'cancelled' (default: 'scheduled')
 * @property {Array<string>} tags - Event categories and tags
 * @property {string} organizer - Organizer name or group
 * @property {string} contact - Contact email or phone for the event
 * @property {Date} createdAt - Creation timestamp
 * @property {Date} updatedAt - Last update timestamp
 */
const EventSchema = new mongoose.Schema(
  {
    // Core event information
    title: {
      type: String,
      required: [true, 'Event title is required'],
      minlength: [5, 'Title must be at least 5 characters'],
      maxlength: [200, 'Title cannot exceed 200 characters'],
      trim: true,
    },

    description: {
      type: String,
      required: [true, 'Event description is required'],
      minlength: [20, 'Description must be at least 20 characters'],
      maxlength: [5000, 'Description cannot exceed 5000 characters'],
    },

    // Event timing
    date: {
      type: Date,
      required: [true, 'Event start date is required'],
      validate: {
        validator: function (date) {
          // Event date should be in the future or present
          return date >= new Date();
        },
        message: 'Event date must be in the future',
      },
    },

    endDate: {
      type: Date,
      validate: {
        validator: function (endDate) {
          // If endDate is provided, it must be after startDate
          return !endDate || endDate > this.date;
        },
        message: 'End date must be after start date',
      },
    },

    // Location information
    location: {
      type: String,
      required: [true, 'Event location is required'],
      trim: true,
    },

    coordinates: {
      type: {
        type: String,
        enum: ['Point'],
        default: 'Point',
      },
      coordinates: {
        type: [Number], // [longitude, latitude]
        // GeoJSON expects [longitude, latitude]
        validate: {
          validator: function (coords) {
            return (
              !coords ||
              (coords.length === 2 &&
                coords[0] >= -180 &&
                coords[0] <= 180 &&
                coords[1] >= -90 &&
                coords[1] <= 90)
            );
          },
          message: 'Invalid coordinates format',
        },
      },
    },

    // Media
    image: {
      type: String,
      trim: true,
    },

    // Attendance management
    capacity: {
      type: Number,
      default: null, // null = unlimited capacity
      min: [1, 'Capacity must be at least 1'],
      validate: {
        validator: function (capacity) {
          // If capacity is set, registrations should not exceed it
          return (
            !capacity || !this.registrations || this.registrations <= capacity
          );
        },
        message: 'Registrations cannot exceed capacity',
      },
    },

    registrations: {
      type: Number,
      default: 0,
      min: [0, 'Registrations cannot be negative'],
    },

    // Event metadata
    status: {
      type: String,
      enum: ['scheduled', 'ongoing', 'completed', 'cancelled'],
      default: 'scheduled',
    },

    tags: {
      type: [String],
      default: [],
      lowercase: true,
      validate: {
        validator: function (tags) {
          return tags.length <= 10;
        },
        message: 'Maximum 10 tags allowed per event',
      },
    },

    // Organizer information
    organizer: {
      type: String,
      maxlength: [100, 'Organizer name cannot exceed 100 characters'],
      trim: true,
    },

    contact: {
      type: String,
      trim: true,
      // Could validate as email or phone
    },

    // Timestamps
    createdAt: {
      type: Date,
      default: Date.now,
      immutable: true,
    },

    updatedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    // Schema options
    timestamps: false,
    collection: 'events',
  },
);

/**
 * Create geospatial index for location-based queries
 * Enables finding nearby events using $near operator
 */
EventSchema.index({ 'coordinates.coordinates': '2dsphere' });

/**
 * Pre-save middleware
 * Updates 'updatedAt' timestamp before saving
 * Auto-sets status to 'ongoing' if event time has passed
 *
 * @event pre:save
 */
EventSchema.pre('save', function (next) {
  // Update timestamp
  this.updatedAt = Date.now();

  // Update status based on dates
  const now = Date.now();
  if (this.status !== 'cancelled' && this.status !== 'completed') {
    if (now > this.date) {
      this.status = 'ongoing';
    }
    if (this.endDate && now > this.endDate) {
      this.status = 'completed';
    }
  }

  next();
});

/**
 * Instance method to register attendee
 * Increments registration count if capacity allows
 *
 * @method registerAttendee
 * @async
 * @param {number} [count=1] - Number of attendees to register
 * @returns {Promise<Object>} Updated event document
 * @throws {Error} If registration would exceed capacity
 *
 * @example
 * await event.registerAttendee(2);
 */
EventSchema.methods.registerAttendee = function (count = 1) {
  if (this.capacity && this.registrations + count > this.capacity) {
    throw new Error(
      `Cannot register ${count} attendees. Event capacity is ${this.capacity}, current: ${this.registrations}`,
    );
  }

  this.registrations += count;
  return this.save();
};

/**
 * Instance method to unregister attendee
 * Decrements registration count
 *
 * @method unregisterAttendee
 * @async
 * @param {number} [count=1] - Number of attendees to unregister
 * @returns {Promise<Object>} Updated event document
 *
 * @example
 * await event.unregisterAttendee(1);
 */
EventSchema.methods.unregisterAttendee = function (count = 1) {
  this.registrations = Math.max(0, this.registrations - count);
  return this.save();
};

/**
 * Instance method to check if event has availability
 *
 * @method hasAvailability
 * @param {number} [needed=1] - Number of spots needed
 * @returns {boolean} True if spots are available
 *
 * @example
 * if (event.hasAvailability(2)) {
 *   await event.registerAttendee(2);
 * }
 */
EventSchema.methods.hasAvailability = function (needed = 1) {
  if (!this.capacity) return true; // Unlimited capacity
  return this.registrations + needed <= this.capacity;
};

/**
 * Instance method to get remaining capacity
 *
 * @method getRemainingCapacity
 * @returns {number|null} Number of remaining spots, or null for unlimited
 *
 * @example
 * const remaining = event.getRemainingCapacity();
 */
EventSchema.methods.getRemainingCapacity = function () {
  if (!this.capacity) return null;
  return Math.max(0, this.capacity - this.registrations);
};

/**
 * Static method to get upcoming events
 *
 * @static
 * @method getUpcoming
 * @param {number} [limit=10] - Number of events to return
 * @returns {Promise<Array>} Upcoming events sorted by date
 *
 * @example
 * const upcoming = await Event.getUpcoming(5);
 */
EventSchema.statics.getUpcoming = function (limit = 10) {
  const now = new Date();
  return this.find({
    date: { $gte: now },
    status: { $ne: 'cancelled' },
  })
    .sort({ date: 1 })
    .limit(limit);
};

/**
 * Static method to get past events
 *
 * @static
 * @method getPast
 * @param {number} [limit=10] - Number of events to return
 * @returns {Promise<Array>} Past events sorted by date (newest first)
 *
 * @example
 * const past = await Event.getPast(5);
 */
EventSchema.statics.getPast = function (limit = 10) {
  const now = new Date();
  return this.find({
    date: { $lt: now },
    status: { $ne: 'cancelled' },
  })
    .sort({ date: -1 })
    .limit(limit);
};

/**
 * Static method to find events near location
 *
 * @static
 * @method findNearby
 * @param {number} latitude - Latitude coordinate
 * @param {number} longitude - Longitude coordinate
 * @param {number} [maxDistance=5000] - Search radius in meters (default: 5km)
 * @returns {Promise<Array>} Events within specified distance
 *
 * @example
 * const nearby = await Event.findNearby(41.9028, 12.4964, 10000);
 */
EventSchema.statics.findNearby = function (
  latitude,
  longitude,
  maxDistance = 5000,
) {
  return this.find({
    'coordinates.coordinates': {
      $near: {
        $geometry: {
          type: 'Point',
          coordinates: [longitude, latitude],
        },
        $maxDistance: maxDistance,
      },
    },
    status: { $ne: 'cancelled' },
  });
};

/**
 * Index definitions for query optimization
 */
EventSchema.index({ date: 1, status: 1 });
EventSchema.index({ status: 1 });
EventSchema.index({ tags: 1 });
EventSchema.index({ organizer: 1 });

module.exports = mongoose.model('Event', EventSchema, 'events');
