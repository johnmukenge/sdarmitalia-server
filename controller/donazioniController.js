/**
 * @file donazioniController.js
 * @description Donations controller with Stripe payment processing
 * @version 1.0
 * @author SDA Italia Dev Team
 *
 * Handles:
 * - Payment intent creation with Stripe
 * - Donation record creation
 * - Webhook processing
 * - Statistics and reporting
 * - Security validation and error handling
 */

const Stripe = require('stripe');
const Donazione = require('../models/donazioniModel');

// Initialize Stripe with secret key
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2023-10-16',
});

/**
 * Create Payment Intent for new donation
 * Validates input and creates Stripe payment intent
 *
 * POST /api/donazioni/create-payment-intent
 *
 * @param {Object} req - Express request object
 * @param {number} req.body.importo - Donation amount in euros (decimal)
 * @param {string} req.body.email - Donor email
 * @param {string} req.body.nome - Donor full name
 * @param {string} [req.body.telefono] - Donor phone (optional)
 * @param {string} [req.body.messaggio] - Donor message (optional)
 * @param {boolean} [req.body.anonimo=false] - Anonymous donation flag
 * @param {string} [req.body.categoria='generale'] - Donation category
 * @param {string} [req.body.ricevuta=false] - Receipt requested flag
 *
 * @param {Object} res - Express response object
 * @returns {Object} clientSecret for Stripe.js
 *
 * @throws {400} Invalid input validation error
 * @throws {402} Stripe error
 * @throws {500} Server error
 */
exports.createPaymentIntent = async (req, res) => {
  try {
    const {
      importo,
      email,
      nome,
      telefono,
      messaggio,
      anonimo = false,
      categoria = 'generale',
      ricevuta = false,
    } = req.body;

    // ===== INPUT VALIDATION =====

    // Validate amount
    if (!importo || typeof importo !== 'number' || importo <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Importo non valido. Minimo €0.01',
      });
    }

    // Convert euros to cents and validate
    const amountInCents = Math.round(importo * 100);
    if (amountInCents < 1) {
      return res.status(400).json({
        success: false,
        message: 'Importo non valido. Minimo €0.01',
      });
    }

    // Validate email
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.status(400).json({
        success: false,
        message: 'Email non valida',
      });
    }

    // Validate name
    if (!nome || nome.trim().length < 2 || nome.length > 100) {
      return res.status(400).json({
        success: false,
        message: 'Nome non valido (2-100 caratteri)',
      });
    }

    // Validate phone if provided
    if (
      telefono &&
      !/^(\+?\d{1,3}[\s\-]?)?\(?\d{1,4}\)?[\s\-]?\d{1,4}[\s\-]?\d{1,9}$/.test(
        telefono,
      )
    ) {
      return res.status(400).json({
        success: false,
        message: 'Numero di telefono non valido',
      });
    }

    // Validate message length
    if (messaggio && messaggio.length > 500) {
      return res.status(400).json({
        success: false,
        message: 'Messaggio troppo lungo (max 500 caratteri)',
      });
    }

    // Validate category
    const validCategories = [
      'generale',
      'chiesa',
      'progetti',
      'educazione',
      'carità',
      'missioni',
    ];
    if (categoria && !validCategories.includes(categoria)) {
      return res.status(400).json({
        success: false,
        message: 'Categoria non valida',
      });
    }

    // ===== CREATE STRIPE PAYMENT INTENT =====

    const paymentIntent = await stripe.paymentIntents.create({
      amount: amountInCents,
      currency: 'eur',
      payment_method_types: ['card'],
      metadata: {
        email,
        nome,
        categoria,
        organization: 'SDA_ITALIA',
      },
      // Enable to send receipt email automatically
      receipt_email: ricevuta ? email : undefined,
      // Describe the payment
      description: `Donazione SDA Italia - ${categoria}`,
    });

    // ===== CREATE DONATION RECORD IN DATABASE =====

    const donazione = await Donazione.create({
      importo: importo, // Mantieni in euro nel database
      email: email.toLowerCase(),
      nome: nome.trim(),
      telefono: telefono ? telefono.trim() : undefined,
      messaggio: messaggio ? messaggio.trim() : undefined,
      anonimo,
      categoria,
      ricevuta,
      stripePaymentIntentId: paymentIntent.id,
      status: 'processing',
      dataProcessamento: new Date(),
    });

    // ===== RESPONSE =====

    res.status(200).json({
      success: true,
      message: 'Payment intent creato con successo',
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
      donationId: donazione._id,
      amount: (amountInCents / 100).toFixed(2),
      currency: 'EUR',
      beneficiary: {
        name: process.env.BENEFICIARY_NAME,
        iban: maskIBAN(process.env.BENEFICIARY_IBAN),
      },
    });
  } catch (error) {
    console.error('❌ Error in createPaymentIntent:', error);

    // Handle Stripe-specific errors
    if (error.type === 'StripeAuthenticationError') {
      return res.status(401).json({
        success: false,
        message: 'Errore di configurazione pagamento',
      });
    }

    if (error.type === 'StripePermissionError') {
      return res.status(403).json({
        success: false,
        message: 'Non autorizzato',
      });
    }

    if (error.type === 'StripeInvalidRequestError') {
      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }

    if (error.type === 'StripeRateLimitError') {
      return res.status(429).json({
        success: false,
        message: 'Troppi tentativi. Riprova tra un momento.',
      });
    }

    // Generic server error
    res.status(500).json({
      success: false,
      message: 'Errore nel processamento del pagamento',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

/**
 * Confirm donation payment (called after client confirms with Stripe)
 * Updates donation status to completed
 *
 * POST /api/donazioni/confirm-payment
 *
 * @param {Object} req - Express request object
 * @param {string} req.body.paymentIntentId - Stripe payment intent ID
 *
 * @returns {Object} Confirmation response
 */
exports.confirmPayment = async (req, res) => {
  try {
    const { paymentIntentId } = req.body;

    if (!paymentIntentId) {
      return res.status(400).json({
        success: false,
        message: 'Payment Intent ID mancante',
      });
    }

    // Retrieve payment intent from Stripe to verify
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

    if (paymentIntent.status === 'succeeded') {
      // Update donation record
      const donazione = await Donazione.findOneAndUpdate(
        { stripePaymentIntentId: paymentIntentId },
        {
          status: 'completed',
          stripeChargeId: paymentIntent.charges.data[0]?.id,
          dataPagamento: new Date(),
          dataProcessamento: new Date(),
        },
        { new: true },
      );

      if (!donazione) {
        return res.status(404).json({
          success: false,
          message: 'Donazione non trovata',
        });
      }

      return res.status(200).json({
        success: true,
        message: 'Donazione confermata',
        donation: {
          id: donazione._id,
          amount: (donazione.importo / 100).toFixed(2),
          status: donazione.status,
          recipientName: donazione.anonimo ? 'Anonimo' : donazione.nome,
        },
      });
    } else if (paymentIntent.status === 'requires_action') {
      return res.status(400).json({
        success: false,
        message: 'Azione aggiuntiva richiesta',
      });
    } else {
      return res.status(400).json({
        success: false,
        message: `Stato pagamento: ${paymentIntent.status}`,
      });
    }
  } catch (error) {
    console.error('❌ Error in confirmPayment:', error);
    res.status(500).json({
      success: false,
      message: 'Errore nella conferma del pagamento',
    });
  }
};

/**
 * Handle Stripe Webhook for payment updates
 * Processes payment success/failure notifications
 *
 * POST /api/donazioni/webhook
 *
 * @param {Object} req - Express request object
 * @param {string} req.headers['stripe-signature'] - Stripe webhook signature
 * @param {string} req.rawBody - Raw request body for signature verification
 */
exports.handleWebhook = async (req, res) => {
  const sig = req.headers['stripe-signature'];
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!webhookSecret) {
    console.warn('⚠️ STRIPE_WEBHOOK_SECRET not configured');
    return res
      .status(400)
      .json({ success: false, message: 'Webhook not configured' });
  }

  try {
    const event = stripe.webhooks.constructEvent(
      req.rawBody,
      sig,
      webhookSecret,
    );

    // Handle different event types
    switch (event.type) {
      case 'payment_intent.succeeded':
        await handlePaymentSuccess(event.data.object);
        break;

      case 'payment_intent.payment_failed':
        await handlePaymentFailed(event.data.object);
        break;

      case 'charge.refunded':
        await handleRefund(event.data.object);
        break;

      default:
        console.log(`ℹ️ Unhandled event type: ${event.type}`);
    }

    // Always respond 200 to acknowledge receipt
    res.status(200).json({ received: true });
  } catch (error) {
    console.error('❌ Webhook error:', error);
    res.status(400).json({ success: false, error: error.message });
  }
};

/**
 * Get donation statistics
 *
 * GET /api/donazioni/stats
 *
 * @returns {Object} Comprehensive statistics
 */
exports.getDonationStats = async (req, res) => {
  try {
    const stats = await Donazione.getStats();

    res.status(200).json({
      success: true,
      data: {
        ...stats,
        totalDonationsFormatted: `€${(stats.totalDonations / 100).toFixed(2)}`,
        averageDonationFormatted: `€${(stats.averageDonation / 100).toFixed(2)}`,
        byCategory: Object.entries(stats.byCategory).map(
          ([category, data]) => ({
            category,
            total: `€${(data.total / 100).toFixed(2)}`,
            count: data.count,
          }),
        ),
      },
    });
  } catch (error) {
    console.error('❌ Error getting stats:', error);
    res.status(500).json({
      success: false,
      message: 'Errore nel recupero delle statistiche',
    });
  }
};

/**
 * Get recent donations (public list)
 *
 * GET /api/donazioni/recent?limit=10
 *
 * @returns {Array} Recent donations
 */
exports.getRecentDonations = async (req, res) => {
  try {
    const limit = Math.min(parseInt(req.query.limit) || 10, 50);

    const donations = await Donazione.find({ status: 'completed' })
      .select('nome anonimo importo dataPagamento categoria')
      .limit(limit)
      .sort({ dataPagamento: -1 });

    const formattedDonations = donations.map((d) => ({
      name: d.anonimo ? 'Anonimo' : d.nome,
      amount: `€${(d.importo / 100).toFixed(2)}`,
      date: d.dataPagamento.toLocaleDateString('it-IT'),
      category: d.categoria,
    }));

    res.status(200).json({
      success: true,
      count: formattedDonations.length,
      donations: formattedDonations,
    });
  } catch (error) {
    console.error('❌ Error getting recent donations:', error);
    res.status(500).json({
      success: false,
      message: 'Errore nel recupero delle donazioni',
    });
  }
};

/**
 * Get beneficiary information
 *
 * GET /api/donazioni/beneficiary
 *
 * @returns {Object} Beneficiary details
 */
exports.getBeneficiaryInfo = async (req, res) => {
  try {
    res.status(200).json({
      success: true,
      beneficiary: {
        name: process.env.BENEFICIARY_NAME,
        iban: maskIBAN(process.env.BENEFICIARY_IBAN),
        fullIban: process.env.BENEFICIARY_IBAN, // Only shown to admins
        bic: process.env.BENEFICIARY_BIC,
        email: process.env.BENEFICIARY_EMAIL,
        phone: process.env.BENEFICIARY_PHONE,
      },
    });
  } catch (error) {
    console.error('❌ Error getting beneficiary info:', error);
    res.status(500).json({
      success: false,
      message: 'Errore nel recupero dei dati del beneficiario',
    });
  }
};

// ===== INTERNAL HELPER FUNCTIONS =====

/**
 * Handle payment success webhook
 * @private
 */
async function handlePaymentSuccess(paymentIntent) {
  try {
    const donation = await Donazione.findOneAndUpdate(
      { stripePaymentIntentId: paymentIntent.id },
      {
        status: 'completed',
        stripeChargeId: paymentIntent.charges.data[0]?.id,
        dataPagamento: new Date(),
        dataProcessamento: new Date(),
      },
      { new: true },
    );

    if (donation) {
      console.log(`✅ Payment succeeded for donation: ${donation._id}`);
      // Send confirmation email here if needed
    }
  } catch (error) {
    console.error('❌ Error handling payment success:', error);
  }
}

/**
 * Handle payment failure webhook
 * @private
 */
async function handlePaymentFailed(paymentIntent) {
  try {
    const errorMessage =
      paymentIntent.last_payment_error?.message || 'Pagamento rifiutato';

    const donation = await Donazione.findOneAndUpdate(
      { stripePaymentIntentId: paymentIntent.id },
      {
        status: 'failed',
        stripeErrorMessage: errorMessage,
        tentativi: (paymentIntent.metadata?.attempts || 0) + 1,
        dataProcessamento: new Date(),
      },
      { new: true },
    );

    if (donation) {
      console.log(`❌ Payment failed for donation: ${donation._id}`);
      // Send failure notification email here if needed
    }
  } catch (error) {
    console.error('❌ Error handling payment failure:', error);
  }
}

/**
 * Handle refund webhook
 * @private
 */
async function handleRefund(charge) {
  try {
    const donation = await Donazione.findOneAndUpdate(
      { stripeChargeId: charge.id },
      {
        status: 'refunded',
        messaggio: `Rimborso elaborato: ${charge.refunded}`,
        dataProcessamento: new Date(),
      },
      { new: true },
    );

    if (donation) {
      console.log(`💰 Refund processed for donation: ${donation._id}`);
      // Send refund confirmation email here if needed
    }
  } catch (error) {
    console.error('❌ Error handling refund:', error);
  }
}

/**
 * Mask IBAN for display (show last 4 digits only)
 * @private
 * @param {string} iban - Full IBAN
 * @returns {string} Masked IBAN
 */
function maskIBAN(iban) {
  if (!iban || iban.length < 4) return '****';
  return `****${iban.slice(-4)}`;
}

module.exports = exports;
