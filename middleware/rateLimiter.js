/**
 * @file rateLimiter.js
 * @description Rate limiting middleware to prevent abuse and DoS attacks
 * @version 1.0
 * @author SDA Italia Dev Team
 *
 * Provides configurable rate limiting for different endpoint groups
 * Helps protect API from excessive requests and potential attacks
 *
 * Uses in-memory store (suitable for single-server deployments)
 * For production with multiple servers, consider Redis-based store
 *
 * @example
 * const { generalLimiter, strictLimiter } = require('./rateLimiter');
 *
 * app.use('/api/', generalLimiter);
 * app.use('/api/contact', strictLimiter);
 */

/**
 * Simple in-memory rate limiter implementation
 * Tracks request counts by client IP address
 * Suitable for development and single-server deployments
 *
 * @class SimpleRateLimiter
 * @description
 * Custom rate limiter that maintains request history in memory
 * Auto-resets counters when time window expires
 * Low overhead compared to library-based solutions
 */
class SimpleRateLimiter {
  /**
   * Creates a new rate limiter instance
   *
   * @constructor
   * @param {number} maxRequests - Maximum allowed requests in time window
   * @param {number} windowMs - Time window in milliseconds (default: 15 minutes)
   * @param {string} [message] - Custom error message for rate limit exceeded
   *
   * @example
   * const limiter = new SimpleRateLimiter(100, 15 * 60 * 1000);
   */
  constructor(maxRequests = 100, windowMs = 15 * 60 * 1000, message = null) {
    this.maxRequests = maxRequests;
    this.windowMs = windowMs;
    this.message =
      message || `Too many requests from this IP, please try again later`;

    // Store request history: { ip: { count, resetTime } }
    this.store = new Map();
  }

  /**
   * Express middleware function
   * Checks if client has exceeded rate limit
   *
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @param {Function} next - Express next middleware function
   * @returns {void}
   *
   * @sets res.rateLimitInfo - Object with rate limit information
   *   @property {number} limit - Max requests allowed
   *   @property {number} current - Current request count
   *   @property {number} remaining - Remaining requests in window
   *   @property {number} resetTime - Unix timestamp when limit resets
   */
  middleware() {
    return (req, res, next) => {
      // Extract client IP address
      const ip = req.ip || req.connection.remoteAddress;
      const now = Date.now();

      // Get or create client record
      let clientData = this.store.get(ip);

      // If no record exists or window has expired, create new one
      if (!clientData || now > clientData.resetTime) {
        clientData = {
          count: 0,
          resetTime: now + this.windowMs,
        };
      }

      // Increment request counter
      clientData.count++;
      this.store.set(ip, clientData);

      // Attach rate limit info to response headers
      const remaining = Math.max(0, this.maxRequests - clientData.count);
      const resetTime = Math.ceil(clientData.resetTime / 1000); // Convert to Unix timestamp

      res.setHeader('X-RateLimit-Limit', this.maxRequests.toString());
      res.setHeader('X-RateLimit-Remaining', remaining.toString());
      res.setHeader('X-RateLimit-Reset', resetTime.toString());

      // Attach info to response object for logging
      res.rateLimitInfo = {
        limit: this.maxRequests,
        current: clientData.count,
        remaining,
        resetTime: clientData.resetTime,
      };

      // Check if limit exceeded
      if (clientData.count > this.maxRequests) {
        // Return 429 Too Many Requests
        return res.status(429).json({
          status: 'fail',
          message: this.message,
          retryAfter: Math.ceil((clientData.resetTime - now) / 1000),
        });
      }

      // Continue to next middleware
      next();
    };
  }

  /**
   * Resets rate limit for specific IP
   * Useful for admin operations or testing
   *
   * @param {string} ip - IP address to reset
   * @returns {boolean} True if reset, false if IP not found
   *
   * @example
   * limiter.reset('192.168.1.1');
   */
  reset(ip) {
    return this.store.delete(ip);
  }

  /**
   * Resets all stored rate limit data
   * Clears entire in-memory store
   *
   * @returns {void}
   *
   * @example
   * limiter.resetAll();
   */
  resetAll() {
    this.store.clear();
  }

  /**
   * Gets statistics about current rate limiting state
   *
   * @returns {Object} Statistics object
   *   @property {number} totalIPs - Number of tracked IPs
   *   @property {Array<Object>} topIPs - Top 10 IPs by request count
   *
   * @example
   * const stats = limiter.getStats();
   * console.log(`Tracking ${stats.totalIPs} IP addresses`);
   */
  getStats() {
    const ips = Array.from(this.store.entries())
      .map(([ip, data]) => ({ ip, count: data.count }))
      .sort((a, b) => b.count - a.count);

    return {
      totalIPs: this.store.size,
      topIPs: ips.slice(0, 10),
    };
  }
}

/**
 * General rate limiter for normal API endpoints
 * Allows 100 requests per 15 minutes per IP
 *
 * @constant
 * @type {SimpleRateLimiter}
 *
 * Used for: GET requests, list endpoints, general browsing
 *
 * @example
 * app.use('/api/', generalLimiter);
 */
const generalLimiter = new SimpleRateLimiter(
  100, // 100 requests
  15 * 60 * 1000, // per 15 minutes
  'Too many requests from this IP, please try again later',
);

/**
 * Strict rate limiter for sensitive endpoints
 * Allows 5 requests per 15 minutes per IP
 *
 * @constant
 * @type {SimpleRateLimiter}
 *
 * Used for: POST/PUT/DELETE requests, donations, contact forms, file uploads
 *
 * @example
 * app.post('/api/contact', strictLimiter, contactController.createContact);
 */
const strictLimiter = new SimpleRateLimiter(
  5, // 5 requests
  15 * 60 * 1000, // per 15 minutes
  'Too many requests for this action, please try again later',
);

/**
 * Very strict rate limiter for critical endpoints
 * Allows 2 requests per hour per IP
 *
 * @constant
 * @type {SimpleRateLimiter}
 *
 * Used for: Payment processing, authentication (future), password reset
 *
 * @example
 * app.post('/api/donazioni/payment', criticalLimiter, donazioniController.processPayment);
 */
const criticalLimiter = new SimpleRateLimiter(
  2, // 2 requests
  60 * 60 * 1000, // per 60 minutes (1 hour)
  'Rate limit exceeded for critical operations, please try again in an hour',
);

/**
 * Lenient rate limiter for GET endpoints
 * Allows 500 requests per 15 minutes per IP
 *
 * @constant
 * @type {SimpleRateLimiter}
 *
 * Used for: Read-only endpoints, public data retrieval
 *
 * @example
 * app.get('/api/notizie', lenientLimiter, newsController.getAllNews);
 */
const lenientLimiter = new SimpleRateLimiter(
  500, // 500 requests
  15 * 60 * 1000, // per 15 minutes
  'Too many requests, please try again later',
);

module.exports = {
  // Class export for custom configurations
  SimpleRateLimiter,

  // Pre-configured limiters
  generalLimiter,
  strictLimiter,
  criticalLimiter,
  lenientLimiter,

  // Export middleware getters
  general: generalLimiter.middleware(),
  strict: strictLimiter.middleware(),
  critical: criticalLimiter.middleware(),
  lenient: lenientLimiter.middleware(),
};
