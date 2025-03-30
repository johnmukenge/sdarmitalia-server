const express = require('express');
const morgan = require('morgan');
const cors = require('cors');
const newsRoutes = require('./routes/newsRoutes');
const contactRoutes = require('./routes/contactRoutes');
const conferenzaRoutes = require('./routes/conferenzaRoutes');
const app = express();

// ✅ Enable CORS for all origins
app.use(cors());
app.use(express.json());

// 1) MIDDLEWARES
if(process.env.NODE_ENV === 'development') {
    app.use(morgan('dev')); // middleware for logging requests
}

//app.use(express.json()); // middleware for parsing the body of the request
//app.use(express.static(`${__dirname}/public`)); // middleware for serving static files

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

module.exports = app;