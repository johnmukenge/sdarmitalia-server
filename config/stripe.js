/**
 * @file stripe.js
 * @description Stripe payment processing configuration
 * @version 1.0
 * @author SDA Italia Dev Team
 *
 * Initializes Stripe client with API keys from environment variables
 * Provides helper functions for common payment operations
 * Handles Stripe webhook validation and event processing
 *
 * Environment Variables:
 * - STRIPE_SECRET_KEY: Secret API key from Stripe Dashboard (never expose publicly)
 * - STRIPE_PUBLIC_KEY: Publishable API key (safe to expose on frontend)
 * - STRIPE_WEBHOOK_SECRET: Secret for validating webhook signatures
 * - STRIPE_SUCCESS_URL: Redirect URL after successful payment
 * - STRIPE_CANCEL_URL: Redirect URL if payment is cancelled
 *
 * @example
 * const stripe = require('./config/stripe');
 * const session = await stripe.createCheckoutSession({ amount: 1000 });
 */

const Stripe = require('stripe');

/**
 * Validates that Stripe API key is configured
 * Throws error if key is missing
 *
 * @function validateStripeKey
 * @throws {Error} If STRIPE_SECRET_KEY is not configured
 * @returns {void}
 *
 * @private
 */
const validateStripeKey = () => {
  if (!process.env.STRIPE_SECRET_KEY) {
    throw new Error(
      'STRIPE_SECRET_KEY is not configured. ' +
        'Please set it in your environment variables.',
    );
  }
};

// Initialize Stripe client only if key is configured
let stripe = null;
try {
  validateStripeKey();
  stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
    apiVersion: '2024-04-10', // Use specific API version for consistency
  });
  console.log('✓ Stripe API initialized successfully');
} catch (error) {
  console.warn('⚠ Stripe not fully configured:', error.message);
  console.warn('Stripe features will not be available until key is configured');
}

/**
 * Creates a Stripe Checkout Session for payment
 * Used for one-time donations and payments
 *
 * @async
 * @function createCheckoutSession
 * @param {Object} options - Session configuration
 * @param {number} options.amount - Amount in cents (e.g., 1000 = $10.00)
 * @param {string} options.email - Customer email address
 * @param {string} [options.name] - Donor/customer name
 * @param {string} [options.description] - Payment description
 * @param {string} [options.currency] - Currency code (default: 'eur')
 * @param {string} [options.successUrl] - URL to redirect after successful payment
 * @param {string} [options.cancelUrl] - URL to redirect if payment is cancelled
 * @param {Object} [options.metadata] - Custom data to attach to session
 *
 * @returns {Promise<Object>} Stripe session object with checkout URL
 * @throws {Error} If Stripe is not configured or API call fails
 *
 * Session Response Properties:
 * - id: Session ID (used in webhooks)
 * - url: Stripe Checkout page URL (redirect user here)
 * - payment_intent: Payment intent ID (for tracking)
 * - customer_email: Customer email address
 * - status: Session status
 * - expires_at: Session expiration timestamp
 *
 * @example
 * const session = await stripe.createCheckoutSession({
 *   amount: 5000, // $50.00
 *   email: 'donor@example.com',
 *   name: 'John Doe',
 *   description: 'Donation to SDA Italia',
 *   metadata: {
 *     donationId: '123',
 *     churchName: 'SDA Italia'
 *   }
 * });
 *
 * // Redirect user to:
 * // window.location.href = session.url;
 */
const createCheckoutSession = async (options) => {
  if (!stripe) {
    throw new Error('Stripe is not configured');
  }

  try {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'payment',

      // Line items for checkout
      line_items: [
        {
          price_data: {
            currency: options.currency || 'eur',
            product_data: {
              name: options.description || 'Donation',
              description: options.name ? `Donor: ${options.name}` : undefined,
            },
            unit_amount: Math.round(options.amount), // Ensure amount is integer
          },
          quantity: 1,
        },
      ],

      // Customer email (optional but recommended for better user experience)
      customer_email: options.email,

      // Redirect URLs after payment
      success_url:
        options.successUrl ||
        process.env.STRIPE_SUCCESS_URL ||
        `${process.env.BACKEND_URL}/donazioni/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url:
        options.cancelUrl ||
        process.env.STRIPE_CANCEL_URL ||
        `${process.env.BACKEND_URL}/donazioni/cancel`,

      // Metadata for tracking in database
      metadata: {
        email: options.email,
        name: options.name || 'Anonymous',
        ...options.metadata,
      },

      // Consent collection for marketing emails
      consent_collection: {
        promotions: 'implied', // Implicit consent
      },

      // Automatic tax calculation (if enabled in Stripe account)
      automatic_tax: {
        enabled: false, // Set to true if tax rates are configured
      },
    });

    return session;
  } catch (error) {
    console.error('Error creating checkout session:', error.message);
    throw new Error(`Failed to create payment session: ${error.message}`);
  }
};

/**
 * Retrieves session details from Stripe
 * Used to verify payment status and retrieve session information
 *
 * @async
 * @function getSession
 * @param {string} sessionId - Stripe checkout session ID
 * @returns {Promise<Object>} Complete session object
 * @throws {Error} If session not found or API call fails
 *
 * Session Properties Useful for Verification:
 * - payment_status: 'paid', 'unpaid', or 'no_payment_required'
 * - customer_email: Customer email address
 * - created: Unix timestamp of creation
 * - expires_at: Unix timestamp of expiration
 * - metadata: Custom data attached to session
 *
 * @example
 * const session = await stripe.getSession('cs_test_1234567890');
 *
 * if (session.payment_status === 'paid') {
 *   // Process successful payment
 * }
 */
const getSession = async (sessionId) => {
  if (!stripe) {
    throw new Error('Stripe is not configured');
  }

  try {
    const session = await stripe.checkout.sessions.retrieve(sessionId);
    return session;
  } catch (error) {
    console.error('Error retrieving session:', error.message);
    throw new Error(`Failed to retrieve session: ${error.message}`);
  }
};

/**
 * Retrieves payment intent details
 * Used to get detailed payment information
 *
 * @async
 * @function getPaymentIntent
 * @param {string} paymentIntentId - Stripe payment intent ID
 * @returns {Promise<Object>} Payment intent object
 * @throws {Error} If payment intent not found
 *
 * Payment Intent Properties:
 * - status: 'succeeded', 'processing', 'requires_payment_method', etc.
 * - amount: Amount in cents
 * - currency: Currency code
 * - charges: Array of charge objects with card details
 * - metadata: Custom data attached to intent
 *
 * @example
 * const intent = await stripe.getPaymentIntent('pi_1234567890');
 * console.log(`Payment status: ${intent.status}`);
 */
const getPaymentIntent = async (paymentIntentId) => {
  if (!stripe) {
    throw new Error('Stripe is not configured');
  }

  try {
    const intent = await stripe.paymentIntents.retrieve(paymentIntentId);
    return intent;
  } catch (error) {
    console.error('Error retrieving payment intent:', error.message);
    throw new Error(`Failed to retrieve payment intent: ${error.message}`);
  }
};

/**
 * Validates webhook signature from Stripe
 * Ensures webhook came from Stripe and hasn't been tampered with
 *
 * @function validateWebhookSignature
 * @param {Buffer|string} payload - Raw request body (must not be parsed as JSON)
 * @param {string} signature - Stripe-Signature header from request
 * @returns {Object} Parsed webhook event object
 * @throws {Error} If signature is invalid or WEBHOOK_SECRET not configured
 *
 * Event Types Available:
 * - 'checkout.session.completed': User completed payment
 * - 'payment_intent.succeeded': Payment was successful
 * - 'payment_intent.payment_failed': Payment failed
 * - 'charge.refunded': Customer requested refund
 *
 * @example
 * // In your webhook endpoint:
 * app.post('/webhook', express.raw({type: 'application/json'}), (req, res) => {
 *   try {
 *     const event = stripe.validateWebhookSignature(
 *       req.body,
 *       req.headers['stripe-signature']
 *     );
 *
 *     if (event.type === 'checkout.session.completed') {
 *       // Handle successful payment
 *     }
 *   } catch (error) {
 *     res.status(400).send(`Webhook Error: ${error.message}`);
 *   }
 * });
 */
const validateWebhookSignature = (payload, signature) => {
  if (!process.env.STRIPE_WEBHOOK_SECRET) {
    throw new Error(
      'STRIPE_WEBHOOK_SECRET is not configured. ' +
        'Cannot validate webhook signatures.',
    );
  }

  try {
    const event = stripe.webhooks.constructEvent(
      payload,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET,
    );
    return event;
  } catch (error) {
    console.error('Webhook signature validation failed:', error.message);
    throw new Error(`Invalid webhook signature: ${error.message}`);
  }
};

/**
 * Creates a refund for a payment
 * Used when customer requests a refund
 *
 * @async
 * @function createRefund
 * @param {string} paymentIntentId - Stripe payment intent ID to refund
 * @param {Object} [options] - Additional refund options
 * @param {number} [options.amount] - Amount in cents (omit for full refund)
 * @param {string} [options.reason] - Reason for refund ('duplicate', 'fraudulent', 'requested_by_customer')
 * @param {Object} [options.metadata] - Custom data to attach to refund
 *
 * @returns {Promise<Object>} Refund object
 * @throws {Error} If refund fails
 *
 * @example
 * const refund = await stripe.createRefund('pi_1234567890', {
 *   reason: 'requested_by_customer',
 *   metadata: { refundId: '456' }
 * });
 *
 * console.log(`Refund created: ${refund.id}`);
 */
const createRefund = async (paymentIntentId, options = {}) => {
  if (!stripe) {
    throw new Error('Stripe is not configured');
  }

  try {
    const refund = await stripe.refunds.create({
      payment_intent: paymentIntentId,
      amount: options.amount,
      reason: options.reason || 'requested_by_customer',
      metadata: options.metadata,
    });

    return refund;
  } catch (error) {
    console.error('Error creating refund:', error.message);
    throw new Error(`Failed to create refund: ${error.message}`);
  }
};

/**
 * Gets Stripe account status and configuration
 * Useful for verifying API key validity and account features
 *
 * @async
 * @function getAccountStatus
 * @returns {Promise<Object>} Account information
 * @throws {Error} If API key is invalid
 *
 * @example
 * const account = await stripe.getAccountStatus();
 * console.log(`Account ID: ${account.id}`);
 * console.log(`Business Name: ${account.business_profile.name}`);
 */
const getAccountStatus = async () => {
  if (!stripe) {
    throw new Error('Stripe is not configured');
  }

  try {
    const account = await stripe.account.retrieve();
    return account;
  } catch (error) {
    console.error('Error retrieving account:', error.message);
    throw new Error(`Failed to retrieve account status: ${error.message}`);
  }
};

module.exports = {
  // Main client instance
  stripe,

  // Payment operations
  createCheckoutSession,
  getSession,
  getPaymentIntent,
  createRefund,

  // Webhook operations
  validateWebhookSignature,

  // Account management
  getAccountStatus,

  // Configuration
  isConfigured: !!stripe,
};
