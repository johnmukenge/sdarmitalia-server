/**
 * DONATIONS SETUP GUIDE
 * =====================
 *
 * This file contains step-by-step instructions to complete Stripe integration
 * for the donations system.
 *
 * Timeline: ~15 minutes to complete
 */

// STEP 1: GET STRIPE CREDENTIALS
// ================================
// 1. Go to https://dashboard.stripe.com/login
// 2. Sign in or create account
// 3. Go to Dashboard > Developers > API Keys
// 4. Copy these values:

const STRIPE_CREDENTIALS = {
  STRIPE_SECRET_KEY: 'sk_test_YOUR_SECRET_KEY_HERE', // Secret (keep private!)
  STRIPE_PUBLIC_KEY: 'pk_test_YOUR_PUBLIC_KEY_HERE', // Public (can share)
};

// ⚠️ IMPORTANT: Never commit real API keys to version control!
// Always use environment variables (config.env) for sensitive data
// See .gitignore for security configuration

// STEP 2: CREATE WEBHOOK
// ======================
// 1. Stripe Dashboard > Developers > Webhooks
// 2. Click "Add endpoint"
// 3. Endpoint URL: http://localhost:5000/api/donazioni/webhook (dev)
//                  https://yourdomain.com/api/donazioni/webhook (prod)
// 4. Select events:
//    - payment_intent.succeeded
//    - payment_intent.payment_failed
//    - charge.refunded
// 5. Copy Signing secret: whsec_...

const WEBHOOK_SECRET = 'whsec_wlDNGHFPqgEGuBzqFmvM7HMbuaNZ3my2';

// STEP 3: UPDATE CONFIG.ENV
// ==========================
// Add to sdarmitalia-server/config.env:

const CONFIG_ENV_ADDITIONS = `
# ===== STRIPE CONFIGURATION =====
STRIPE_SECRET_KEY=${STRIPE_CREDENTIALS.STRIPE_SECRET_KEY}
STRIPE_PUBLIC_KEY=${STRIPE_CREDENTIALS.STRIPE_PUBLIC_KEY}
STRIPE_WEBHOOK_SECRET=${WEBHOOK_SECRET}

# ===== BENEFICIARY CONFIGURATION =====
BENEFICIARY_NAME=Avventisti Del Settimo Giorno Movimento Di Riforma
BENEFICIARY_IBAN=IT39Z0306971642100000000147
BENEFICIARY_BIC=
BENEFICIARY_EMAIL=movimentodiriforma.media@gmail.com
BENEFICIARY_PHONE=+39-389-4528048

# ===== PAYMENT SECURITY =====
PAYMENT_RATE_LIMIT=10
CORS_ORIGINS=http://localhost:5173,http://localhost:3000,https://adsgmdr.it
`;

// STEP 4: INSTALL DEPENDENCIES
// =============================
// Run in sdarmitalia-server directory:
// npm install stripe express-rate-limit

// STEP 5: FRONTEND SETUP
// ======================
// Update sdarmitalia/.env.local:

const FRONTEND_ENV = `
VITE_STRIPE_PUBLIC_KEY=${STRIPE_CREDENTIALS.STRIPE_PUBLIC_KEY}
VITE_API_URL=http://localhost:5000
`;

// STEP 6: START SERVERS
// ======================

const START_SERVERS = `
# Terminal 1: Start backend
cd sdarmitalia-server
npm start

# Terminal 2: Start frontend
cd sdarmitalia
npm run dev

# Terminal 3 (Optional): Watch Stripe events
stripe listen --forward-to localhost:5000/api/donazioni/webhook
`;

// STEP 7: TEST DONATION
// ======================

const TEST_STEPS = `
1. Navigate to http://localhost:5173/donazioni
2. Click "Dona" button
3. Fill form:
   - Nome: Test User
   - Email: test@example.com
   - Importo: 50.00
   - Categoria: generale
   
4. Card payment details:
   - Numero: 4242 4242 4242 4242
   - Scadenza: 12/25
   - CVC: 123
   
5. Click "Dona €50.00"

6. Verify:
   ✅ Payment Intent created
   ✅ Card processed successfully
   ✅ Donation record in MongoDB
   ✅ Status changed to "completed"
   ✅ Email notification sent (if requested)
`;

// STEP 8: PRODUCTION DEPLOYMENT
// ===============================

const PRODUCTION_CHECKLIST = `
Before going live:

☐ Get Live Stripe Keys from dashboard (not test keys!)
☐ Update STRIPE_SECRET_KEY with sk_live_...
☐ Update STRIPE_PUBLIC_KEY with pk_live_...
☐ Update webhook endpoint URL to production domain
☐ Get new STRIPE_WEBHOOK_SECRET for production
☐ Enable HTTPS on server (required!)
☐ Update CORS_ORIGINS to production domain
☐ Test webhook with Stripe CLI on production server
☐ Set NODE_ENV=production in config.env
☐ Review rate limiting (adjust PAYMENT_RATE_LIMIT if needed)
☐ Setup error logging/monitoring
☐ Review beneficiary IBAN (use real one for production)
☐ Create backup of MongoDB database
☐ Test email notifications
☐ Load test payment endpoints (simulate traffic)
☐ Monitor Stripe dashboard for test transactions
`;

// TROUBLESHOOTING
// ===============

const TROUBLESHOOTING = {
  'Payment fails silently': {
    cause: 'Missing STRIPE_SECRET_KEY',
    solution: 'Check config.env has valid sk_test_ key from Stripe dashboard',
  },

  'Webhook not updating status': {
    cause: 'Invalid webhook signature or endpoint not registered',
    solution:
      '1. Verify STRIPE_WEBHOOK_SECRET in config.env\n2. Test with: stripe trigger payment_intent.succeeded',
  },

  'CORS error from frontend': {
    cause: 'Origin not in CORS_ORIGINS whitelist',
    solution: 'Add your frontend URL to CORS_ORIGINS in config.env',
  },

  'Rate limit being hit': {
    cause: 'Too many payment attempts from same IP',
    solution:
      'Increase PAYMENT_RATE_LIMIT or wait 1 hour. Development can skip with ::1 IP',
  },

  'Card validation errors': {
    cause: 'Invalid card details or Stripe.js not loaded',
    solution:
      'Verify @stripe/react-stripe-js is installed and Elements wrapper is present',
  },

  'Database record not created': {
    cause: 'MongoDB connection issue or validation error',
    solution:
      'Check MongoDB Atlas connection is active and MONGODB_URI is correct',
  },
};

// API TEST EXAMPLES
// =================

const CURL_EXAMPLES = {
  // Create payment intent
  createPaymentIntent: `
curl -X POST http://localhost:5000/api/donazioni/create-payment-intent \\
  -H "Content-Type: application/json" \\
  -d '{
    "importo": 50.00,
    "email": "test@example.com",
    "nome": "Test User",
    "categoria": "generale",
    "ricevuta": true
  }'
  `,

  // Get statistics
  getStats: `
curl http://localhost:5000/api/donazioni/stats
  `,

  // Get recent donations
  getRecent: `
curl http://localhost:5000/api/donazioni/recent?limit=10
  `,

  // Get beneficiary info
  getBeneficiary: `
curl http://localhost:5000/api/donazioni/beneficiary
  `,
};

// MONITORING & LOGGING
// ====================

const MONITORING = {
  'Check donation status': "db.donazioni.find({ status: 'completed' })",
  'Check failed payments': "db.donazioni.find({ status: 'failed' })",
  'Get stats by category': `
db.donazioni.aggregate([
  { $match: { status: 'completed' } },
  { $group: { _id: '$categoria', total: { $sum: '$importo' } } }
])
  `,
  'Monitor webhook deliveries':
    'Stripe Dashboard > Developers > Webhooks > Events',
};

// SECURITY REMINDERS
// ==================

const SECURITY_REMINDERS = [
  '❌ Never log STRIPE_SECRET_KEY',
  '❌ Never send IBAN unmasked to client',
  '❌ Never save card details',
  '✅ Always validate input on server',
  '✅ Always use HTTPS in production',
  '✅ Always verify webhook signature',
  '✅ Rate limit payment endpoints',
  '✅ Monitor for suspicious activity',
];

module.exports = {
  STRIPE_CREDENTIALS,
  WEBHOOK_SECRET,
  CONFIG_ENV_ADDITIONS,
  FRONTEND_ENV,
  START_SERVERS,
  TEST_STEPS,
  PRODUCTION_CHECKLIST,
  TROUBLESHOOTING,
  CURL_EXAMPLES,
  MONITORING,
  SECURITY_REMINDERS,
};
