/**
 * @file contactModel.js
 * @description Contact form submissions collection schema
 * @version 2.0
 * @author SDA Italia Dev Team
 *
 * Stores messages from website contact form
 * Tracks response status and priority
 * Supports filtering and management by admin
 *
 * @example
 * const unread = await Contact.find({ status: 'new' })
 *   .sort({ createdAt: -1 });
 */

const mongoose = require('mongoose');

/**
 * Email validation regex pattern
 * Simplified RFC 5322 compliant pattern
 * @constant
 */
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Phone validation regex pattern
 * Accepts international format with optional formatting characters
 * @constant
 */
const PHONE_REGEX =
  /^(\+?\d{1,3}[\s\-]?)?\(?\d{1,4}\)?[\s\-]?\d{1,4}[\s\-]?\d{1,9}$/;

/**
 * Contact Schema Definition
 *
 * @typedef {Object} Contact
 * @property {string} nome - Sender's name (required, 2-100 chars)
 * @property {string} email - Sender's email (required, valid format)
 * @property {string} telefono - Contact phone number (optional, valid format)
 * @property {string} messaggio - Message content (required, 10-5000 chars)
 * @property {string} type - Message type: 'info', 'support', 'feedback', 'other' (default: 'other')
 * @property {string} status - Response status: 'new', 'read', 'responded', 'archived' (default: 'new')
 * @property {string} priority - Priority level: 'low', 'normal', 'high', 'urgent' (default: 'normal')
 * @property {string} [response] - Admin response message (optional)
 * @property {Date} readAt - Timestamp when marked as read
 * @property {Date} respondedAt - Timestamp when response was sent
 * @property {Date} createdAt - Message submission timestamp
 * @property {Date} updatedAt - Last update timestamp
 */
const ContactSchema = new mongoose.Schema(
  {
    // Sender information
    nome: {
      type: String,
      required: [true, 'Name is required'],
      minlength: [2, 'Name must be at least 2 characters'],
      maxlength: [100, 'Name cannot exceed 100 characters'],
      trim: true,
    },

    email: {
      type: String,
      required: [true, 'Email is required'],
      lowercase: true,
      trim: true,
      validate: {
        validator: function (email) {
          return EMAIL_REGEX.test(email);
        },
        message: 'Invalid email format',
      },
    },

    telefono: {
      type: String,
      validate: {
        validator: function (phone) {
          // Optional field: empty or valid format
          return !phone || PHONE_REGEX.test(phone);
        },
        message: 'Invalid phone number format',
      },
      trim: true,
    },

    // Message content
    messaggio: {
      type: String,
      required: [true, 'Message is required'],
      minlength: [10, 'Message must be at least 10 characters'],
      maxlength: [5000, 'Message cannot exceed 5000 characters'],
    },

    // Message classification
    type: {
      type: String,
      enum: ['info', 'support', 'feedback', 'other'],
      default: 'other',
    },

    status: {
      type: String,
      enum: ['new', 'read', 'responded', 'archived'],
      default: 'new',
    },

    priority: {
      type: String,
      enum: ['low', 'normal', 'high', 'urgent'],
      default: 'normal',
    },

    // Response tracking
    response: {
      type: String,
      maxlength: [2000, 'Response cannot exceed 2000 characters'],
      trim: true,
    },

    respondedBy: {
      type: String, // Admin name/id who responded (future: reference to User model)
      maxlength: [100, 'Responder name cannot exceed 100 characters'],
    },

    // Timestamps
    readAt: {
      type: Date,
      default: null,
    },

    respondedAt: {
      type: Date,
      default: null,
    },

    createdAt: {
      type: Date,
      default: Date.now,
      immutable: true, // Cannot be changed after creation
    },

    updatedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    // Schema options
    timestamps: false, // We manage timestamps manually
    collection: 'contacts', // Explicitly set collection name
  },
);

/**
 * Pre-save middleware
 * Updates 'updatedAt' timestamp before saving
 * Auto-sets readAt when status changes to 'read'
 * Auto-sets respondedAt when response is added
 *
 * @event pre:save
 */
ContactSchema.pre('save', function (next) {
  // Always update the 'updatedAt' timestamp
  this.updatedAt = Date.now();

  // Auto-set readAt if status changed to 'read'
  if (this.isModified('status') && this.status === 'read' && !this.readAt) {
    this.readAt = Date.now();
  }

  // Auto-set respondedAt if response was added
  if (this.isModified('response') && this.response && !this.respondedAt) {
    this.respondedAt = Date.now();
    // Auto-update status to 'responded' if response is added
    if (this.status !== 'responded') {
      this.status = 'responded';
    }
  }

  next();
});

/**
 * Instance method to mark message as read
 *
 * @method markAsRead
 * @async
 * @returns {Promise<Object>} Updated document
 *
 * @example
 * const contact = await Contact.findById(id);
 * await contact.markAsRead();
 */
ContactSchema.methods.markAsRead = function () {
  this.status = 'read';
  this.readAt = Date.now();
  return this.save();
};

/**
 * Instance method to add response to message
 *
 * @method addResponse
 * @async
 * @param {string} responseText - Response message
 * @param {string} [responderName] - Name of admin responding (optional)
 * @returns {Promise<Object>} Updated document
 *
 * @example
 * await contact.addResponse('Thank you for your message...', 'Admin Name');
 */
ContactSchema.methods.addResponse = function (
  responseText,
  responderName = null,
) {
  this.response = responseText;
  if (responderName) {
    this.respondedBy = responderName;
  }
  this.status = 'responded';
  this.respondedAt = Date.now();
  return this.save();
};

/**
 * Instance method to archive message
 *
 * @method archive
 * @async
 * @returns {Promise<Object>} Updated document
 *
 * @example
 * await contact.archive();
 */
ContactSchema.methods.archive = function () {
  this.status = 'archived';
  return this.save();
};

/**
 * Static method to get unread messages count
 *
 * @static
 * @method getUnreadCount
 * @returns {Promise<number>} Count of unread messages
 *
 * @example
 * const unread = await Contact.getUnreadCount();
 */
ContactSchema.statics.getUnreadCount = function () {
  return this.countDocuments({ status: 'new' });
};

/**
 * Static method to get high-priority messages
 *
 * @static
 * @method getHighPriority
 * @returns {Promise<Array>} Urgent and high priority messages not yet archived
 *
 * @example
 * const urgent = await Contact.getHighPriority();
 */
ContactSchema.statics.getHighPriority = function () {
  return this.find({
    priority: { $in: ['urgent', 'high'] },
    status: { $ne: 'archived' },
  }).sort({ priority: -1, createdAt: -1 });
};

/**
 * Static method to get statistics
 *
 * @static
 * @method getStats
 * @returns {Promise<Object>} Statistics about messages
 *   @property {number} total - Total messages
 *   @property {number} unread - Unread messages
 *   @property {number} responded - Messages with responses
 *   @property {number} urgent - Urgent priority messages
 *
 * @example
 * const stats = await Contact.getStats();
 */
ContactSchema.statics.getStats = async function () {
  const total = await this.countDocuments();
  const unread = await this.countDocuments({ status: 'new' });
  const responded = await this.countDocuments({ status: 'responded' });
  const urgent = await this.countDocuments({ priority: 'urgent' });

  return { total, unread, responded, urgent };
};

/**
 * Index definitions for query optimization
 */
// Index for common queries
ContactSchema.index({ status: 1, createdAt: -1 });
ContactSchema.index({ email: 1 });
ContactSchema.index({ priority: 1, status: 1 });
ContactSchema.index({ createdAt: -1 }); // For sorting by date
ContactSchema.index({ respondedAt: 1 }); // For finding unresponded messages

module.exports = mongoose.model('Contact', ContactSchema, 'contacts');
