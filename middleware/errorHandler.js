/**
 * @file errorHandler.js
 * @description Global error handling middleware for Express application
 * @version 1.0
 * @author SDA Italia Dev Team
 *
 * Centralized error handling for the entire application
 * Handles both operational errors (AppError) and programming errors
 * Formats consistent error responses across all endpoints
 *
 * @example
 * // In index.js:
 * app.use(errorHandler);
 */

const AppError = require('../utils/errorClass');

/**
 * Main error handling middleware
 * Processes errors and returns formatted JSON response
 *
 * @middleware
 * @param {Error} err - Error object
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 *
 * @description
 * Handles three types of errors:
 * 1. Operational Errors (AppError) - Expected errors with message for client
 * 2. MongoDB Errors - Validation, duplicate key, cast errors
 * 3. Programming Errors - Unexpected errors with generic message
 *
 * @returns {void} Sends JSON response with error details
 *
 * @example
 * // Operational error (from controller):
 * throw new AppError('News not found', 404);
 * // Response: { status: 'fail', message: 'News not found', statusCode: 404 }
 *
 * // Programming error (unexpected):
 * // Response: { status: 'error', message: 'Something went wrong', statusCode: 500 }
 * // (Stack trace included only in development)
 */
const errorHandler = (err, req, res, next) => {
  // Default error properties
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  // DEVELOPMENT ENVIRONMENT - Send detailed error info
  if (process.env.NODE_ENV === 'development') {
    // Include stack trace in development for debugging
    return res.status(err.statusCode).json({
      status: err.status,
      message: err.message,
      error: err,
      stack: err.stack,
    });
  }

  // PRODUCTION ENVIRONMENT - Send safe error info
  // Only send operational errors to client, hide programming errors
  if (err.isOperational) {
    // Operational error: send message to client
    return res.status(err.statusCode).json({
      status: err.status,
      message: err.message,
      statusCode: err.statusCode,
    });
  }

  // Programming error: don't leak details to client
  console.error('PROGRAMMING ERROR:', err);
  return res.status(500).json({
    status: 'error',
    message: 'Something went wrong. Please try again later.',
    statusCode: 500,
  });
};

/**
 * Handles MongoDB Validation Errors
 * Thrown when document fails schema validation
 *
 * @function handleValidationError
 * @param {Error} err - MongoDB validation error object
 * @returns {AppError} Formatted AppError instance
 *
 * @example
 * // When required field is missing:
 * // Error: "title" is required
 * // Response: { message: "Missing required fields: title", statusCode: 400 }
 */
const handleValidationError = (err) => {
  const messages = Object.values(err.errors)
    .map((e) => e.message)
    .join(', ');

  const message = `Invalid input data. ${messages}`;
  return new AppError(message, 400);
};

/**
 * Handles MongoDB Duplicate Key Errors
 * Thrown when trying to insert duplicate unique values
 *
 * @function handleDuplicateFieldsError
 * @param {Error} err - MongoDB duplicate key error
 * @returns {AppError} Formatted AppError instance
 *
 * @example
 * // When email already exists:
 * // Error code: 11000
 * // Response: { message: "Email already registered", statusCode: 400 }
 */
const handleDuplicateFieldsError = (err) => {
  // Extract field name from error message
  const field = Object.keys(err.keyPattern)[0];
  const message = `A document with ${field} "${err.keyValue[field]}" already exists`;
  return new AppError(message, 400);
};

/**
 * Handles MongoDB Cast Errors
 * Thrown when trying to convert invalid data type to MongoDB type
 *
 * @function handleCastError
 * @param {Error} err - MongoDB cast error
 * @returns {AppError} Formatted AppError instance
 *
 * @example
 * // When passing invalid ObjectId:
 * // Response: { message: "Invalid ID format", statusCode: 400 }
 */
const handleCastError = (err) => {
  const message = `Invalid ${err.path}: ${err.value}`;
  return new AppError(message, 400);
};

/**
 * Enhanced error handler with MongoDB error detection
 * Extends main errorHandler to catch MongoDB-specific errors
 *
 * @middleware
 * @param {Error} err - Error object
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 *
 * @description
 * Converts MongoDB errors to AppError format before passing to errorHandler:
 * - Validation errors (code: "ValidationError")
 * - Duplicate key errors (code: 11000)
 * - Cast errors (name: "CastError")
 * - Other errors pass through unchanged
 *
 * @returns {void}
 *
 * @example
 * // In index.js:
 * app.use(enhancedErrorHandler);
 */
const enhancedErrorHandler = (err, req, res, next) => {
  let error = { ...err, message: err.message };

  // Handle MongoDB Validation Error
  if (err.name === 'ValidationError') {
    error = handleValidationError(err);
  }

  // Handle MongoDB Duplicate Key Error
  if (err.code === 11000) {
    error = handleDuplicateFieldsError(err);
  }

  // Handle MongoDB Cast Error (invalid ObjectId)
  if (err.name === 'CastError') {
    error = handleCastError(err);
  }

  // Process the error through main handler
  errorHandler(error, req, res, next);
};

module.exports = enhancedErrorHandler;
