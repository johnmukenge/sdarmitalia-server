const express = require('express');
const morgan = require('morgan');
const cors = require('cors');
const path = require('path');
const newsRoutes = require('./routes/newsRoutes');
const contactRoutes = require('./routes/contactRoutes');
const conferenzaRoutes = require('./routes/conferenzaRoutes');
const libriRoutes = require('./routes/libriRoutes');
const eventsRoutes = require('./routes/eventsRoutes');
const articlesRoutes = require('./routes/articlesRoutes');
const documentiRoutes = require('./routes/documentiRoutes');
const projectPhaseRoutes = require('./routes/projectPhaseRoutes');
const donazioniRoutes = require('./routes/donazioniRoutes');
const { corsOriginValidator } = require('./middleware/donationMiddleware');
const app = express();

// ✅ Enable CORS for all origins
app.use(cors());

// 📁 Serve static files - PDF documents from frontend
app.use('/documents', express.static(path.join(__dirname, '../sdarmitalia/src/documents')));
console.log('📁 Serving documents from:', path.join(__dirname, '../sdarmitalia/src/documents'));

// ⚠️ IMPORTANT: Webhook route MUST be before body parser for raw body access
// Middleware to capture raw body for webhook signature verification
app.use(
  '/api/donazioni/webhook',
  (req, res, buffer, encoding) => {
    req.rawBody = buffer.toString(encoding || 'utf8');
  },
  express.raw({ type: 'application/json' }),
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
app.use('/api/v1/events', eventsRoutes);
app.use('/api/v1/articles', articlesRoutes);
app.use('/api/v1/documenti', documentiRoutes);
app.use('/api/v1/project-phases', projectPhaseRoutes);

// 💝 Donation routes with security middleware
app.use('/api/donazioni', corsOriginValidator, donazioniRoutes);

module.exports = app;
