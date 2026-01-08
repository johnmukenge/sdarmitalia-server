/**
 * @file donazioniRoutes.js
 * @description Donation payment endpoints with security middleware
 * @version 1.0
 * @author SDA Italia Dev Team
 *
 * Routes:
 * POST   /api/donazioni/create-payment-intent - Create Stripe payment intent
 * POST   /api/donazioni/confirm-payment       - Confirm donation after payment
 * POST   /api/donazioni/webhook               - Stripe webhook handler
 * GET    /api/donazioni/stats                 - Get donation statistics
 * GET    /api/donazioni/recent                - Get recent donations (public)
 * GET    /api/donazioni/beneficiary           - Get beneficiary information
 */

const express = require('express');
const router = express.Router();
const donazioniController = require('../controller/donazioniController');
const {
  validatePaymentInput,
  rateLimitPayments,
  validateWebhookSignature,
} = require('../middleware/donationMiddleware');

// ===== PUBLIC ENDPOINTS =====

/**
 * Get beneficiary information
 * Public endpoint - no auth required
 *
 * GET /api/donazioni/beneficiary
 *
 * @returns {200} Beneficiary details
 */
router.get('/beneficiary', donazioniController.getBeneficiaryInfo);

/**
 * Get recent completed donations
 * Public endpoint - no auth required
 * Respects anonymous flag
 *
 * GET /api/donazioni/recent?limit=10
 *
 * @query {number} limit - Number of donations to fetch (max 50)
 * @returns {200} Array of recent donations
 */
router.get('/recent', donazioniController.getRecentDonations);

/**
 * Get donation statistics
 * Public endpoint - aggregate data only
 *
 * GET /api/donazioni/stats
 *
 * @returns {200} Statistics and summaries
 */
router.get('/stats', donazioniController.getDonationStats);

// ===== PROTECTED ENDPOINTS WITH SECURITY =====

/**
 * Create payment intent for new donation
 * Validates input and creates Stripe payment intent
 * Protected by rate limiting and input validation
 *
 * POST /api/donazioni/create-payment-intent
 *
 * @body {number} importo - Donation amount in euros (€0.01 minimum)
 * @body {string} email - Donor email address
 * @body {string} nome - Donor full name (2-100 chars)
 * @body {string} [telefono] - Donor phone (optional)
 * @body {string} [messaggio] - Donor message (optional, max 500 chars)
 * @body {boolean} [anonimo] - Anonymous donation flag
 * @body {string} [categoria] - Donation category (generale|chiesa|progetti|educazione|carità|missioni)
 * @body {boolean} [ricevuta] - Receipt requested flag
 *
 * @returns {200} clientSecret for Stripe.js confirmation
 * @returns {400} Validation error
 * @returns {429} Rate limit exceeded
 * @returns {500} Server error
 */
router.post(
  '/create-payment-intent',
  rateLimitPayments,
  validatePaymentInput,
  donazioniController.createPaymentIntent,
);

/**
 * Confirm donation after Stripe payment
 * Called after client confirms with Stripe.js
 *
 * POST /api/donazioni/confirm-payment
 *
 * @body {string} paymentIntentId - Stripe payment intent ID
 *
 * @returns {200} Donation confirmed
 * @returns {400} Invalid request
 * @returns {404} Donation not found
 * @returns {500} Server error
 */
router.post(
  '/confirm-payment',
  rateLimitPayments,
  donazioniController.confirmPayment,
);

/**
 * Stripe Webhook Handler
 * Processes payment status updates from Stripe
 * Signature verified using raw body
 *
 * POST /api/donazioni/webhook
 *
 * @header {string} stripe-signature - Stripe webhook signature
 * @rawBody {Object} Stripe event
 *
 * Events handled:
 * - payment_intent.succeeded
 * - payment_intent.payment_failed
 * - charge.refunded
 *
 * @returns {200} Webhook received
 * @returns {400} Invalid signature or error
 *
 * @note MUST be registered BEFORE body parser middleware for raw body access
 */
router.post(
  '/webhook',
  express.raw({ type: 'application/json' }),
  donazioniController.handleWebhook,
);

module.exports = router;
