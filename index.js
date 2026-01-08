const express = require('express');
const morgan = require('morgan');
const cors = require('cors');
const newsRoutes = require('./routes/newsRoutes');
const contactRoutes = require('./routes/contactRoutes');
const conferenzaRoutes = require('./routes/conferenzaRoutes');
const libriRoutes = require('./routes/libriRoutes');
const projectPhaseRoutes = require('./routes/projectPhaseRoutes');
const donazioniRoutes = require('./routes/donazioniRoutes');
const { corsOriginValidator } = require('./middleware/donationMiddleware');
const app = express();

// ✅ Enable CORS for all origins
app.use(cors());

// ⚠️ IMPORTANT: Webhook route MUST be before body parser for raw body access
app.use(
  '/api/donazioni/webhook',
  express.raw({ type: 'application/json' }),
  donazioniRoutes,
);

// Parse JSON body after webhook route
app.use(express.json());

// 1) MIDDLEWARES
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev')); // middleware for logging requests
}

app.use((req, res, next) => {
  console.log('Hello from the middleware');
  next(); // call the next middleware to avoid the request to hang up the middleware stack
});

app.use((req, res, next) => {
  req.requestTime = new Date().toISOString();
  next();
});

// 3) ROUTES
app.use('/api/v1/news', newsRoutes);
app.use('/api/v1/contact', contactRoutes);
app.use('/api/v1/registration', conferenzaRoutes);
app.use('/api/v1/members', conferenzaRoutes);
app.use('/api/v1/libri', libriRoutes);
app.use('/api/v1/project-phases', projectPhaseRoutes);

// 💝 Donation routes with security middleware
app.use('/api/donazioni', corsOriginValidator, donazioniRoutes);

module.exports = app;
