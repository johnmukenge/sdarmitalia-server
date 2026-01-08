/**
 * @file donazioniModel.js
 * @description Donations collection schema and model
 * @version 1.0
 * @author SDA Italia Dev Team
 *
 * Tracks monetary donations through Stripe payment processing
 * Integrates with Stripe webhooks for payment status updates
 * Supports recurring donations and donor management
 *
 * @example
 * const donation = await Donazione.create({
 *   importo: 5000, // €50.00
 *   email: 'donor@example.com',
 *   nome: 'John Doe'
 * });
 *
 * // After Stripe webhook:
 * await donation.markAsPaid(stripePaymentIntentId);
 */

const mongoose = require('mongoose');

/**
 * Donation Schema Definition
 *
 * @typedef {Object} Donazione
 * @property {number} importo - Donation amount in cents (required, €0.01 minimum)
 * @property {string} email - Donor email (required, valid format)
 * @property {string} nome - Donor name (required, 2-100 chars)
 * @property {string} [telefono] - Contact phone (optional, valid format)
 * @property {string} [messaggio] - Donor message (optional, up to 500 chars)
 * @property {boolean} anonimo - Anonymous donation flag (default: false)
 * @property {string} tipo - Donation type: 'singola', 'ricorrente', 'campagna' (default: 'singola')
 * @property {string} categoria - Donation purpose: 'generale', 'chiesa', 'progetti', 'educazione', 'carità' (default: 'generale')
 * @property {string} status - Payment status: 'pending', 'completed', 'failed', 'refunded' (default: 'pending')
 * @property {string} stripeSessionId - Stripe checkout session ID
 * @property {string} stripePaymentIntentId - Stripe payment intent ID
 * @property {string} stripeCusomerId - Stripe customer ID (for recurring)
 * @property {string} stripeChargeId - Stripe charge ID (after payment)
 * @property {string} stripePriceId - Stripe price ID (for recurring)
 * @property {string} stripeSubscriptionId - Stripe subscription ID (for recurring)
 * @property {Object} recurringDetails - Recurring donation configuration
 *   @property {string} frequency - 'monthly', 'quarterly', 'yearly'
 *   @property {Date} nextDueDate - Next payment date
 *   @property {boolean} isActive - Subscription is active
 *   @property {Date} cancelledAt - Cancellation timestamp
 * @property {boolean} ricevuta - Receipt requested flag (default: false)
 * @property {string} metodoPagamento - Payment method: 'card', 'bank_transfer', 'other' (default: 'card')
 * @property {string} stripeErrorMessage - Error message if payment failed
 * @property {number} tentativi - Failed payment retry count
 * @property {Date} dataProcessamento - Payment processing timestamp
 * @property {Date} dataPagamento - Actual payment date
 * @property {Date} createdAt - Donation creation timestamp
 * @property {Date} updatedAt - Last update timestamp
 */
const DonazioneSchema = new mongoose.Schema(
  {
    // Donation amount (in cents for precision)
    importo: {
      type: Number,
      required: [true, 'Donation amount is required'],
      min: [1, 'Minimum donation is €0.01'],
      validate: {
        validator: function (amount) {
          return Number.isInteger(amount);
        },
        message: 'Amount must be in cents (whole number)',
      },
    },

    // Donor information
    email: {
      type: String,
      required: [true, 'Donor email is required'],
      lowercase: true,
      trim: true,
      validate: {
        validator: function (email) {
          return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
        },
        message: 'Invalid email format',
      },
    },

    nome: {
      type: String,
      required: [true, 'Donor name is required'],
      minlength: [2, 'Name must be at least 2 characters'],
      maxlength: [100, 'Name cannot exceed 100 characters'],
      trim: true,
    },

    telefono: {
      type: String,
      trim: true,
      validate: {
        validator: function (phone) {
          return (
            !phone ||
            /^(\+?\d{1,3}[\s\-]?)?\(?\d{1,4}\)?[\s\-]?\d{1,4}[\s\-]?\d{1,9}$/.test(
              phone,
            )
          );
        },
        message: 'Invalid phone number format',
      },
    },

    messaggio: {
      type: String,
      maxlength: [500, 'Message cannot exceed 500 characters'],
      trim: true,
    },

    anonimo: {
      type: Boolean,
      default: false,
    },

    // Donation classification
    tipo: {
      type: String,
      enum: ['singola', 'ricorrente', 'campagna'],
      default: 'singola',
    },

    categoria: {
      type: String,
      enum: [
        'generale',
        'chiesa',
        'progetti',
        'educazione',
        'carità',
        'missioni',
      ],
      default: 'generale',
    },

    // Payment status and Stripe integration
    status: {
      type: String,
      enum: [
        'pending',
        'processing',
        'completed',
        'failed',
        'refunded',
        'cancelled',
      ],
      default: 'pending',
      index: true,
    },

    // Stripe identifiers
    stripeSessionId: {
      type: String,
      trim: true,
      index: true,
    },

    stripePaymentIntentId: {
      type: String,
      trim: true,
      index: true,
      // Removed unique constraint to allow multiple donations without Stripe
    },

    stripeCustomerId: {
      type: String,
      trim: true,
    },

    stripeChargeId: {
      type: String,
      trim: true,
    },

    stripePriceId: {
      type: String, // For recurring donations
      trim: true,
    },

    stripeSubscriptionId: {
      type: String, // For recurring donations
      trim: true,
      index: { sparse: true },
    },

    // Recurring donation details
    recurringDetails: {
      type: {
        frequency: {
          type: String,
          enum: ['monthly', 'quarterly', 'yearly'],
          required: true,
        },
        nextDueDate: {
          type: Date,
          required: true,
        },
        isActive: {
          type: Boolean,
          default: true,
        },
        cancelledAt: {
          type: Date,
          default: null,
        },
      },
      default: null, // null for single donations
    },

    // Additional options
    ricevuta: {
      type: Boolean,
      default: false,
    },

    metodoPagamento: {
      type: String,
      enum: ['card', 'bank_transfer', 'other'],
      default: 'card',
    },

    // Error tracking
    stripeErrorMessage: {
      type: String,
      trim: true,
    },

    tentativi: {
      type: Number,
      default: 0,
      min: [0, 'Retry count cannot be negative'],
    },

    // Timestamps
    dataProcessamento: {
      type: Date,
      default: null,
    },

    dataPagamento: {
      type: Date,
      default: null,
    },

    createdAt: {
      type: Date,
      default: Date.now,
      immutable: true,
      index: true,
    },

    updatedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    // Schema options
    timestamps: false,
    collection: 'donazioni', // Italian name for donations
  },
);

/**
 * Pre-save middleware
 * Updates 'updatedAt' timestamp before saving
 * Validates recurring donation details
 *
 * @event pre:save
 */
DonazioneSchema.pre('save', function (next) {
  this.updatedAt = Date.now();

  // Validate recurring details
  if (this.tipo === 'ricorrente' && !this.recurringDetails) {
    return next(new Error('Recurring donations must have recurringDetails'));
  }

  next();
});

/**
 * Instance method to mark donation as paid
 * Called when Stripe webhook confirms payment
 *
 * @method markAsPaid
 * @async
 * @param {string} stripeChargeId - Stripe charge ID
 * @param {string} [stripeCustomerId] - Stripe customer ID (for recurring)
 * @returns {Promise<Object>} Updated document
 *
 * @example
 * await donation.markAsPaid('ch_1234567890');
 */
DonazioneSchema.methods.markAsPaid = function (
  stripeChargeId,
  stripeCustomerId = null,
) {
  this.status = 'completed';
  this.stripeChargeId = stripeChargeId;
  if (stripeCustomerId) {
    this.stripeCustomerId = stripeCustomerId;
  }
  this.dataPagamento = Date.now();
  this.dataProcessamento = Date.now();

  return this.save();
};

/**
 * Instance method to mark donation as failed
 * Called when payment processing fails
 *
 * @method markAsFailed
 * @async
 * @param {string} errorMessage - Error message from Stripe
 * @returns {Promise<Object>} Updated document
 *
 * @example
 * await donation.markAsFailed('Card declined');
 */
DonazioneSchema.methods.markAsFailed = function (errorMessage) {
  this.status = 'failed';
  this.stripeErrorMessage = errorMessage;
  this.tentativi = (this.tentativi || 0) + 1;
  this.dataProcessamento = Date.now();

  return this.save();
};

/**
 * Instance method to process refund
 * Called when donor requests refund or payment needs to be reversed
 *
 * @method refund
 * @async
 * @param {string} [reason] - Reason for refund
 * @returns {Promise<Object>} Updated document
 *
 * @example
 * await donation.refund('Requested by donor');
 */
DonazioneSchema.methods.refund = function (reason = 'requested_by_customer') {
  if (this.status !== 'completed') {
    throw new Error('Only completed donations can be refunded');
  }

  this.status = 'refunded';
  this.messaggio = `Refund processed - ${reason}`;

  return this.save();
};

/**
 * Instance method to cancel recurring subscription
 *
 * @method cancelRecurring
 * @async
 * @returns {Promise<Object>} Updated document
 * @throws {Error} If donation is not recurring
 *
 * @example
 * await donation.cancelRecurring();
 */
DonazioneSchema.methods.cancelRecurring = function () {
  if (!this.recurringDetails) {
    throw new Error('This donation is not recurring');
  }

  this.recurringDetails.isActive = false;
  this.recurringDetails.cancelledAt = Date.now();

  return this.save();
};

/**
 * Instance method to get formatted amount in euros
 *
 * @method getFormattedAmount
 * @returns {string} Formatted amount (e.g., "€50.00")
 *
 * @example
 * const formatted = donation.getFormattedAmount();
 * // Returns: "€50.00"
 */
DonazioneSchema.methods.getFormattedAmount = function () {
  const euros = (this.importo / 100).toFixed(2);
  return `€${euros}`;
};

/**
 * Instance method to get donor display name
 * Respects anonymous flag
 *
 * @method getDonorName
 * @returns {string} Donor name or "Anonymous"
 *
 * @example
 * const name = donation.getDonorName();
 */
DonazioneSchema.methods.getDonorName = function () {
  return this.anonimo ? 'Anonymous' : this.nome;
};

/**
 * Static method to get total donations for a period
 *
 * @static
 * @method getTotalByPeriod
 * @param {Date} startDate - Period start date
 * @param {Date} endDate - Period end date
 * @returns {Promise<number>} Total amount in cents
 *
 * @example
 * const thisMonth = new Date();
 * thisMonth.setDate(1);
 * const total = await Donazione.getTotalByPeriod(thisMonth, new Date());
 */
DonazioneSchema.statics.getTotalByPeriod = async function (startDate, endDate) {
  const result = await this.aggregate([
    {
      $match: {
        status: 'completed',
        dataPagamento: { $gte: startDate, $lte: endDate },
      },
    },
    { $group: { _id: null, total: { $sum: '$importo' } } },
  ]);

  return result.length > 0 ? result[0].total : 0;
};

/**
 * Static method to get donations by category
 *
 * @static
 * @method getByCategory
 * @param {string} category - Category name
 * @returns {Promise<Array>} Donations in category
 *
 * @example
 * const churchDonations = await Donazione.getByCategory('chiesa');
 */
DonazioneSchema.statics.getByCategory = function (category) {
  return this.find({
    categoria: category,
    status: 'completed',
  }).sort({ dataPagamento: -1 });
};

/**
 * Static method to get pending donations
 *
 * @static
 * @method getPending
 * @returns {Promise<Array>} Pending donations
 *
 * @example
 * const pending = await Donazione.getPending();
 */
DonazioneSchema.statics.getPending = function () {
  return this.find({ status: 'pending' }).sort({ createdAt: -1 });
};

/**
 * Static method to get active recurring donations
 *
 * @static
 * @method getActiveRecurring
 * @returns {Promise<Array>} Active recurring subscriptions
 *
 * @example
 * const recurring = await Donazione.getActiveRecurring();
 */
DonazioneSchema.statics.getActiveRecurring = function () {
  return this.find({
    tipo: 'ricorrente',
    'recurringDetails.isActive': true,
  }).sort({ 'recurringDetails.nextDueDate': 1 });
};

/**
 * Static method to get donation statistics
 *
 * @static
 * @method getStats
 * @returns {Promise<Object>} Comprehensive donation statistics
 *
 * @example
 * const stats = await Donazione.getStats();
 */
DonazioneSchema.statics.getStats = async function () {
  const stats = await this.aggregate([
    { $match: { status: 'completed' } },
    {
      $group: {
        _id: null,
        totalAmount: { $sum: '$importo' },
        count: { $sum: 1 },
        avgAmount: { $avg: '$importo' },
      },
    },
  ]);

  const recurringCount = await this.countDocuments({
    tipo: 'ricorrente',
    'recurringDetails.isActive': true,
  });

  const failedCount = await this.countDocuments({ status: 'failed' });

  const byCategory = await this.aggregate([
    { $match: { status: 'completed' } },
    {
      $group: {
        _id: '$categoria',
        total: { $sum: '$importo' },
        count: { $sum: 1 },
      },
    },
  ]);

  return {
    totalDonations: stats.length > 0 ? stats[0].totalAmount : 0,
    donationCount: stats.length > 0 ? stats[0].count : 0,
    averageDonation: stats.length > 0 ? Math.round(stats[0].avgAmount) : 0,
    activeRecurring: recurringCount,
    failedPayments: failedCount,
    byCategory: Object.fromEntries(
      byCategory.map((item) => [
        item._id,
        {
          total: item.total,
          count: item.count,
        },
      ]),
    ),
  };
};

/**
 * Index definitions for query optimization
 */
DonazioneSchema.index({ status: 1, dataPagamento: -1 });
DonazioneSchema.index({ email: 1 });
DonazioneSchema.index({ categoria: 1, status: 1 });
DonazioneSchema.index({ tipo: 1, 'recurringDetails.isActive': 1 });
DonazioneSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Donazione', DonazioneSchema, 'donazioni');
