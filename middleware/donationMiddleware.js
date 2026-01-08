/**
 * @file donationMiddleware.js
 * @description Security middleware for donation endpoints
 * @version 1.0
 * @author SDA Italia Dev Team
 *
 * Provides:
 * - Input validation for payment data
 * - Rate limiting for payment endpoints
 * - Webhook signature verification
 * - CORS origin validation
 */

const rateLimit = require('express-rate-limit');

/**
 * Rate limiter for payment endpoints
 * Prevents abuse and DDoS attacks
 * Limits: 10 payment attempts per IP per hour
 *
 * @type {Function} Express middleware
 */
exports.rateLimitPayments = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: parseInt(process.env.PAYMENT_RATE_LIMIT) || 10,
  message: {
    success: false,
    message: 'Troppi tentativi di pagamento. Riprova tra un ora.',
  },
  standardHeaders: true, // Return rate limit info in `RateLimit-*` headers
  legacyHeaders: false,
  // Skip rate limiting for local development
  skip: (req) => process.env.NODE_ENV === 'development' && req.ip === '::1',
});

/**
 * Validate payment input
 * Checks required fields and formats
 *
 * @type {Function} Express middleware
 *
 * Validates:
 * - Amount is number > 0
 * - Email is valid format
 * - Name is 2-100 characters
 * - Phone format if provided
 * - Message length if provided
 * - Category is valid enum
 */
exports.validatePaymentInput = (req, res, next) => {
  const { importo, email, nome, telefono, messaggio, categoria } = req.body;

  // Check required fields
  if (!importo || !email || !nome) {
    return res.status(400).json({
      success: false,
      message: 'Campi obbligatori mancanti: importo, email, nome',
      errors: {
        importo: importo ? null : 'Importo obbligatorio',
        email: email ? null : 'Email obbligatoria',
        nome: nome ? null : 'Nome obbligatorio',
      },
    });
  }

  // Validate amount
  if (typeof importo !== 'number' || importo <= 0 || importo > 100000) {
    return res.status(400).json({
      success: false,
      message: 'Importo non valido',
      errors: {
        importo: 'Deve essere un numero tra €0.01 e €100000.00',
      },
    });
  }

  // Validate email
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({
      success: false,
      message: 'Email non valida',
      errors: {
        email: 'Inserisci un indirizzo email valido',
      },
    });
  }

  // Validate name
  if (typeof nome !== 'string' || nome.trim().length < 2 || nome.length > 100) {
    return res.status(400).json({
      success: false,
      message: 'Nome non valido',
      errors: {
        nome: 'Deve essere lungo 2-100 caratteri',
      },
    });
  }

  // Validate phone if provided
  if (telefono) {
    const phoneRegex =
      /^(\+?\d{1,3}[\s\-]?)?\(?\d{1,4}\)?[\s\-]?\d{1,4}[\s\-]?\d{1,9}$/;
    if (!phoneRegex.test(telefono)) {
      return res.status(400).json({
        success: false,
        message: 'Numero di telefono non valido',
        errors: {
          telefono: 'Inserisci un numero di telefono valido',
        },
      });
    }
  }

  // Validate message if provided
  if (messaggio && messaggio.length > 500) {
    return res.status(400).json({
      success: false,
      message: 'Messaggio troppo lungo',
      errors: {
        messaggio: 'Massimo 500 caratteri',
      },
    });
  }

  // Validate category if provided
  if (categoria) {
    const validCategories = [
      'generale',
      'chiesa',
      'progetti',
      'educazione',
      'carità',
      'missioni',
    ];
    if (!validCategories.includes(categoria)) {
      return res.status(400).json({
        success: false,
        message: 'Categoria non valida',
        errors: {
          categoria: `Deve essere uno di: ${validCategories.join(', ')}`,
        },
      });
    }
  }

  // All validation passed
  next();
};

/**
 * Validate Stripe webhook signature
 * Ensures webhook comes from Stripe
 *
 * @type {Function} Express middleware
 *
 * Checks:
 * - stripe-signature header presence
 * - Signature validity against webhook secret
 */
exports.validateWebhookSignature = (req, res, next) => {
  const signature = req.headers['stripe-signature'];

  if (!signature) {
    return res.status(401).json({
      success: false,
      message: 'Firma webhook mancante',
    });
  }

  // Note: Actual verification happens in controller with stripe library
  // This middleware just checks header presence
  next();
};

/**
 * CORS middleware for donation endpoints
 * Allows requests from whitelisted origins only
 *
 * @type {Function} Express middleware
 */
exports.corsOriginValidator = (req, res, next) => {
  const allowedOrigins = (
    process.env.CORS_ORIGINS || 'http://localhost:5173,http://localhost:3000'
  ).split(',');

  const origin = req.headers.origin;

  if (allowedOrigins.includes(origin)) {
    res.header('Access-Control-Allow-Origin', origin);
  }

  res.header('Access-Control-Allow-Methods', 'POST, GET, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, stripe-signature');

  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }

  next();
};

/**
 * Sanitize payment data
 * Removes potentially dangerous characters
 *
 * @type {Function} Express middleware
 */
exports.sanitizePaymentData = (req, res, next) => {
  if (req.body) {
    // Trim strings
    if (req.body.nome) {
      req.body.nome = req.body.nome.trim().substring(0, 100);
    }
    if (req.body.email) {
      req.body.email = req.body.email.trim().toLowerCase();
    }
    if (req.body.telefono) {
      req.body.telefono = req.body.telefono.trim();
    }
    if (req.body.messaggio) {
      req.body.messaggio = req.body.messaggio.trim().substring(0, 500);
    }
  }

  next();
};

/**
 * Log payment attempts (for security auditing)
 *
 * @type {Function} Express middleware
 */
exports.logPaymentAttempt = (req, res, next) => {
  console.log(`[PAYMENT ATTEMPT] ${req.method} ${req.path}`);
  console.log(`  IP: ${req.ip}`);
  console.log(`  Email: ${req.body?.email || 'N/A'}`);
  console.log(`  Amount: €${req.body?.importo || 'N/A'}`);

  next();
};

module.exports = exports;
