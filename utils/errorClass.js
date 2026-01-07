/**
 * @file errorClass.js
 * @description Custom error class for standardized error handling across the application
 * @version 1.0
 * @author SDA Italia Dev Team
 *
 * @example
 * throw new AppError('Invalid credentials', 401);
 */

/**
 * Custom AppError class extending native Error
 * Provides standardized error handling with status codes and messages
 *
 * @class AppError
 * @extends Error
 *
 * @param {string} message - Error message to display to client
 * @param {number} statusCode - HTTP status code (default: 500)
 *
 * @property {string} message - Error message
 * @property {number} statusCode - HTTP status code
 * @property {string} status - Status string ('fail' for 4xx, 'error' for 5xx)
 * @property {boolean} isOperational - Indicates if error is operational (known) vs programmer error
 *
 * @example
 * // Usage in controller
 * if (!user) {
 *   return next(new AppError('User not found', 404));
 * }
 */
class AppError extends Error {
  /**
   * Constructor for AppError
   * @constructor
   * @param {string} message - Error message
   * @param {number} statusCode - HTTP status code
   */
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
    this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
    this.isOperational = true;

    // Capture stack trace (exclude constructor call from stack)
    Error.captureStackTrace(this, this.constructor);
  }
}

module.exports = AppError;
