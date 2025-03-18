const express = require('express');
const morgan = require('morgan');
//const usersRouter = require('./routes/usersRoutes');
const app = express();

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
//app.use('/api/v1/users', usersRouter);

module.exports = app;