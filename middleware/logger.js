/**
 * @file logger.js
 * @description Enhanced logging middleware for request/response tracking
 * @version 1.0
 * @author SDA Italia Dev Team
 *
 * Provides detailed logging of HTTP requests, responses, and processing time
 * Helps with debugging, monitoring, and performance analysis
 *
 * Logs are formatted based on environment:
 * - Development: Colorized console output with full details
 * - Production: Structured logs suitable for log aggregation services
 *
 * @example
 * const logger = require('./logger');
 * app.use(logger.requestLogger);
 * app.use(logger.errorLogger);
 */

// ANSI color codes for console output (development only)
const COLORS = {
  RESET: '\x1b[0m',
  RED: '\x1b[31m',
  GREEN: '\x1b[32m',
  YELLOW: '\x1b[33m',
  BLUE: '\x1b[34m',
  CYAN: '\x1b[36m',
  GRAY: '\x1b[90m',
};

/**
 * Formats current timestamp in ISO format
 *
 * @function getTimestamp
 * @returns {string} ISO 8601 formatted timestamp (YYYY-MM-DDTHH:mm:ss.SSSZ)
 *
 * @example
 * getTimestamp() // "2024-01-15T10:30:45.123Z"
 */
const getTimestamp = () => new Date().toISOString();

/**
 * Determines HTTP status code color for console output
 *
 * @function getStatusColor
 * @param {number} status - HTTP status code (200, 404, 500, etc.)
 * @returns {string} ANSI color code for the status
 *
 * Status code ranges:
 * - 2xx (Success): Green
 * - 3xx (Redirect): Cyan
 * - 4xx (Client Error): Yellow
 * - 5xx (Server Error): Red
 *
 * @example
 * getStatusColor(200) // GREEN
 * getStatusColor(404) // YELLOW
 * getStatusColor(500) // RED
 */
const getStatusColor = (status) => {
  if (status >= 200 && status < 300) return COLORS.GREEN;
  if (status >= 300 && status < 400) return COLORS.CYAN;
  if (status >= 400 && status < 500) return COLORS.YELLOW;
  if (status >= 500) return COLORS.RED;
  return COLORS.GRAY;
};

/**
 * Formats response size in human-readable format
 * Converts bytes to KB, MB, etc.
 *
 * @function formatBytes
 * @param {number} bytes - Size in bytes
 * @returns {string} Formatted size (e.g., "2.5 KB", "1.2 MB")
 *
 * @example
 * formatBytes(1024) // "1 KB"
 * formatBytes(1048576) // "1 MB"
 * formatBytes(500) // "500 B"
 */
const formatBytes = (bytes) => {
  if (!bytes || bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
};

/**
 * Formats response time in appropriate unit
 *
 * @function formatTime
 * @param {number} ms - Time in milliseconds
 * @returns {string} Formatted time (e.g., "125 ms", "1.5 s")
 *
 * @example
 * formatTime(50) // "50 ms"
 * formatTime(1500) // "1.5 s"
 * formatTime(5000) // "5 s"
 */
const formatTime = (ms) => {
  if (ms < 1000) return `${ms} ms`;
  return `${(ms / 1000).toFixed(1)} s`;
};

/**
 * Main request logger middleware
 * Logs incoming requests and response details
 * Measures request processing time
 *
 * @middleware
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 *
 * Attaches to response object:
 * - res.startTime: Unix timestamp when request started
 * - Overrides res.json() to log response details
 *
 * Logs include:
 * - Request method, path, query parameters
 * - Response status code and size
 * - Processing time
 * - User IP address
 * - Request body (if applicable, sanitized)
 *
 * @example
 * // In index.js:
 * const logger = require('./logger');
 * app.use(logger.requestLogger);
 */
const requestLogger = (req, res, next) => {
  // Record request start time (high precision)
  const startTime = Date.now();
  req.startTime = startTime;

  // Store original response methods
  const originalJson = res.json.bind(res);
  const originalSend = res.send.bind(res);

  /**
   * Logs request details in development or production format
   *
   * @function logRequest
   * @param {number} statusCode - HTTP response status code
   * @param {number} responseSize - Size of response body in bytes
   * @returns {void}
   */
  const logRequest = (statusCode, responseSize = 0) => {
    const endTime = Date.now();
    const duration = endTime - startTime;

    const logData = {
      timestamp: getTimestamp(),
      method: req.method,
      path: req.path,
      status: statusCode,
      duration: `${duration} ms`,
      ip: req.ip || req.connection.remoteAddress,
    };

    if (process.env.NODE_ENV === 'development') {
      // DEVELOPMENT: Colorized console output
      const statusColor = getStatusColor(statusCode);
      const methodColor =
        req.method === 'GET'
          ? COLORS.BLUE
          : req.method === 'POST'
            ? COLORS.GREEN
            : req.method === 'PUT'
              ? COLORS.YELLOW
              : req.method === 'DELETE'
                ? COLORS.RED
                : COLORS.GRAY;

      console.log(
        `${COLORS.GRAY}[${logData.timestamp}]${COLORS.RESET} ` +
          `${methodColor}${req.method.padEnd(6)}${COLORS.RESET} ` +
          `${req.path} ` +
          `${statusColor}${statusCode}${COLORS.RESET} ` +
          `${COLORS.CYAN}${formatTime(duration)}${COLORS.RESET}`,
      );

      // Log request details if there's body data
      if (
        req.method !== 'GET' &&
        req.body &&
        Object.keys(req.body).length > 0
      ) {
        // Sanitize sensitive data from logs
        const sanitizedBody = { ...req.body };
        if (sanitizedBody.password) sanitizedBody.password = '***REDACTED***';
        if (sanitizedBody.token) sanitizedBody.token = '***REDACTED***';

        console.log(
          `  Body: ${JSON.stringify(sanitizedBody).substring(0, 200)}...`,
        );
      }
    } else {
      // PRODUCTION: Structured logging for log aggregation services
      console.log(JSON.stringify(logData));
    }
  };

  /**
   * Wraps res.json() to capture response details before sending
   */
  res.json = function (data) {
    const statusCode = res.statusCode;
    const responseSize = JSON.stringify(data).length;

    logRequest(statusCode, responseSize);
    return originalJson(data);
  };

  /**
   * Wraps res.send() for plain text responses
   */
  res.send = function (data) {
    const statusCode = res.statusCode;
    const responseSize =
      typeof data === 'string'
        ? data.length
        : Buffer.byteLength(JSON.stringify(data));

    logRequest(statusCode, responseSize);
    return originalSend(data);
  };

  // Fallback: log if response ends without explicit logging
  res.on('finish', () => {
    // Only log if not already logged by json() or send()
    if (!res.loggedByMiddleware) {
      const statusCode = res.statusCode;
      logRequest(statusCode);
    }
  });

  next();
};

/**
 * Error logger middleware
 * Logs detailed error information for debugging
 * Captures error context and stack traces
 *
 * @middleware
 * @param {Error} err - Error object
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 *
 * Logs include:
 * - Error message and type
 * - Request method, path, IP
 * - Stack trace (development only)
 * - Request headers (development only)
 *
 * @example
 * // In index.js, after errorHandler:
 * app.use(logger.errorLogger);
 */
const errorLogger = (err, req, res, next) => {
  const timestamp = getTimestamp();
  const duration = Date.now() - (req.startTime || Date.now());

  const errorLog = {
    timestamp,
    level: 'ERROR',
    message: err.message,
    type: err.constructor.name,
    method: req.method,
    path: req.path,
    status: err.statusCode || res.statusCode || 500,
    ip: req.ip || req.connection.remoteAddress,
    duration: `${duration} ms`,
  };

  if (process.env.NODE_ENV === 'development') {
    // Development: detailed error output
    console.error(
      `\n${COLORS.RED}[ERROR - ${timestamp}]${COLORS.RESET}\n` +
        `${COLORS.RED}${err.message}${COLORS.RESET}\n` +
        `Method: ${req.method} | Path: ${req.path} | IP: ${errorLog.ip}\n` +
        `Status: ${errorLog.status} | Duration: ${errorLog.duration}\n`,
    );

    if (err.stack) {
      console.error(`${COLORS.GRAY}Stack:${COLORS.RESET}\n${err.stack}\n`);
    }
  } else {
    // Production: structured JSON log
    console.error(
      JSON.stringify({
        ...errorLog,
        stack: err.stack,
      }),
    );
  }

  next(err);
};

/**
 * Performance logging middleware
 * Logs requests that exceed specified time threshold
 * Useful for identifying slow endpoints
 *
 * @function performanceLogger
 * @param {number} [thresholdMs=1000] - Time threshold in milliseconds
 * @returns {middleware} Express middleware function
 *
 * @example
 * // Log requests taking more than 500ms
 * app.use(logger.performanceLogger(500));
 */
const performanceLogger = (thresholdMs = 1000) => {
  return (req, res, next) => {
    const startTime = Date.now();

    // Capture response finish event
    res.on('finish', () => {
      const duration = Date.now() - startTime;

      if (duration > thresholdMs) {
        const logMessage =
          `${COLORS.YELLOW}[SLOW REQUEST]${COLORS.RESET} ` +
          `${req.method} ${req.path} took ${formatTime(duration)}`;

        if (process.env.NODE_ENV === 'development') {
          console.warn(logMessage);
        } else {
          console.warn(
            JSON.stringify({
              timestamp: getTimestamp(),
              level: 'WARN',
              message: 'Slow request detected',
              method: req.method,
              path: req.path,
              duration: duration,
              threshold: thresholdMs,
            }),
          );
        }
      }
    });

    next();
  };
};

module.exports = {
  // Main middleware functions
  requestLogger,
  errorLogger,
  performanceLogger,

  // Utility functions (if needed for custom logging)
  getTimestamp,
  getStatusColor,
  formatBytes,
  formatTime,
};
