/**
 * @file validateInput.js
 * @description Input validation utilities for request data validation
 * @version 1.0
 * @author SDA Italia Dev Team
 *
 * Provides regex patterns and validation functions for common input types
 * Used by controllers to validate incoming data before database operations
 *
 * @example
 * const { validateEmail, validatePhone } = require('./validateInput');
 *
 * if (!validateEmail(email)) {
 *   throw new AppError('Invalid email format', 400);
 * }
 */

/**
 * @constant REGEX_PATTERNS
 * @description Common regex patterns for input validation
 *
 * @property {RegExp} EMAIL - Email validation pattern (RFC 5322 simplified)
 *   Validates: user@domain.com, name+tag@domain.co.uk
 *   Rejects: user@, @domain, user space@domain
 *
 * @property {RegExp} PHONE - International phone number pattern
 *   Accepts: +39 3XX XXXXXXX, 3XX XXXXXXX, +1 2XX XXX XXXX
 *   Formats: spaces, dashes, parentheses optional
 *
 * @property {RegExp} URL - Standard URL validation
 *   Validates: http://example.com, https://example.co.uk/path
 *   Rejects: invalid urls, missing protocol
 *
 * @property {RegExp} SLUG - URL-safe slug format
 *   Accepts: word-word-123 (lowercase, hyphens, numbers)
 *   Rejects: UPPERCASE, spaces, special chars
 *
 * @property {RegExp} YOUTUBE_ID - YouTube video ID format
 *   Length: 11 characters (numbers, letters, hyphens, underscores)
 *
 * @property {RegExp} CURRENCY_AMOUNT - Monetary amount validation
 *   Accepts: 10, 10.50, 0.99 (up to 2 decimal places)
 *   Rejects: 10.999, negative values (checked separately)
 *
 * @property {RegExp} HTML_TAGS - Detect HTML/script tags (for sanitization)
 *   Used to detect potentially dangerous content
 */
const REGEX_PATTERNS = {
  EMAIL: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  // More strict email pattern (RFC 5322 simplified):
  // /^[a-zA-Z0-9._%-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,

  PHONE: /^(\+\d{1,3}[- ]?)?\(?\d{1,4}\)?[- ]?\d{1,4}[- ]?\d{1,9}$/,
  // Alternative: /^[+]?[(]?[0-9]{3}[)]?[-\s.]?[0-9]{3}[-\s.]?[0-9]{4,6}$/,

  URL: /^https?:\/\/(www\.)?[-a-zA-Z0-9@:%._+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_+.~#?&/=]*)$/,

  SLUG: /^[a-z0-9]+(-[a-z0-9]+)*$/,

  YOUTUBE_ID: /^[a-zA-Z0-9_-]{11}$/,

  CURRENCY_AMOUNT: /^\d+(\.\d{1,2})?$/,

  HTML_TAGS: /<[^>]*>/g,
};

/**
 * Validates email format
 *
 * @function validateEmail
 * @param {string} email - Email address to validate
 * @returns {boolean} True if valid email format, false otherwise
 *
 * @example
 * validateEmail('user@example.com') // true
 * validateEmail('invalid.email') // false
 * validateEmail('user@domain') // false
 */
const validateEmail = (email) => {
  if (!email || typeof email !== 'string') return false;
  const trimmed = email.trim().toLowerCase();
  return REGEX_PATTERNS.EMAIL.test(trimmed);
};

/**
 * Validates international phone number format
 * Accepts multiple formats: +39 3XX XXXXXXX, 3XX-XXXXXXX, (3XX) XXXXXXX
 *
 * @function validatePhone
 * @param {string} phone - Phone number to validate
 * @returns {boolean} True if valid phone format, false otherwise
 *
 * @example
 * validatePhone('+39 348 1234567') // true
 * validatePhone('348 1234567') // true
 * validatePhone('3481234567') // true
 * validatePhone('invalid') // false
 * validatePhone('123') // false
 */
const validatePhone = (phone) => {
  if (!phone || typeof phone !== 'string') return false;
  // Remove all spaces and special formatting
  const cleaned = phone.replace(/[\s\-().]/g, '');
  // Phone must be 10+ digits
  return /^\+?\d{10,}$/.test(cleaned);
};

/**
 * Validates URL format (must include protocol)
 *
 * @function validateURL
 * @param {string} url - URL to validate
 * @returns {boolean} True if valid URL format, false otherwise
 *
 * @example
 * validateURL('https://example.com') // true
 * validateURL('http://www.example.com/path') // true
 * validateURL('example.com') // false (missing protocol)
 * validateURL('not a url') // false
 */
const validateURL = (url) => {
  if (!url || typeof url !== 'string') return false;
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};

/**
 * Validates slug format (URL-safe identifier)
 * Lowercase letters, numbers, hyphens only
 *
 * @function validateSlug
 * @param {string} slug - Slug to validate
 * @returns {boolean} True if valid slug format, false otherwise
 *
 * @example
 * validateSlug('my-article-title') // true
 * validateSlug('article-123') // true
 * validateSlug('My Article') // false (spaces and uppercase)
 * validateSlug('article_name') // false (underscores not allowed)
 */
const validateSlug = (slug) => {
  if (!slug || typeof slug !== 'string') return false;
  return REGEX_PATTERNS.SLUG.test(slug);
};

/**
 * Validates YouTube video ID format
 * YouTube IDs are always 11 characters (letters, numbers, hyphens, underscores)
 *
 * @function validateYoutubeId
 * @param {string} id - YouTube video ID to validate
 * @returns {boolean} True if valid YouTube ID format, false otherwise
 *
 * @example
 * validateYoutubeId('dQw4w9WgXcQ') // true
 * validateYoutubeId('https://youtube.com/watch?v=dQw4w9WgXcQ') // false (full URL)
 * validateYoutubeId('dQw4w9WgXc') // false (too short)
 */
const validateYoutubeId = (id) => {
  if (!id || typeof id !== 'string') return false;
  return REGEX_PATTERNS.YOUTUBE_ID.test(id);
};

/**
 * Validates currency amount (non-negative number with up to 2 decimals)
 *
 * @function validateCurrencyAmount
 * @param {number|string} amount - Amount to validate
 * @returns {boolean} True if valid currency amount, false otherwise
 *
 * @example
 * validateCurrencyAmount(99.99) // true
 * validateCurrencyAmount('49.50') // true
 * validateCurrencyAmount(0.01) // true
 * validateCurrencyAmount(-10) // false (negative)
 * validateCurrencyAmount(10.999) // false (too many decimals)
 */
const validateCurrencyAmount = (amount) => {
  if (amount === undefined || amount === null) return false;

  const num = parseFloat(amount);

  // Check if valid number and not negative
  if (isNaN(num) || num < 0) return false;

  // Check format with regex
  return REGEX_PATTERNS.CURRENCY_AMOUNT.test(num.toString());
};

/**
 * Validates text length within bounds
 *
 * @function validateLength
 * @param {string} text - Text to validate
 * @param {number} minLength - Minimum required length
 * @param {number} maxLength - Maximum allowed length
 * @returns {boolean} True if text length is within bounds, false otherwise
 *
 * @example
 * validateLength('Hello', 3, 10) // true
 * validateLength('Hi', 3, 10) // false (too short)
 * validateLength('This is a very long text', 3, 10) // false (too long)
 */
const validateLength = (text, minLength = 1, maxLength = Infinity) => {
  if (!text || typeof text !== 'string') return false;
  const length = text.trim().length;
  return length >= minLength && length <= maxLength;
};

/**
 * Detects HTML/script tags in text (for security)
 * Useful for detecting potential XSS attacks
 *
 * @function containsHTMLTags
 * @param {string} text - Text to check for HTML tags
 * @returns {boolean} True if HTML tags detected, false otherwise
 *
 * @example
 * containsHTMLTags('<script>alert("xss")</script>') // true
 * containsHTMLTags('<img src=x onerror="alert(1)">') // true
 * containsHTMLTags('Normal text without tags') // false
 */
const containsHTMLTags = (text) => {
  if (!text || typeof text !== 'string') return false;
  return REGEX_PATTERNS.HTML_TAGS.test(text);
};

/**
 * Sanitizes text by removing HTML tags
 *
 * @function sanitizeText
 * @param {string} text - Text to sanitize
 * @returns {string} Sanitized text with HTML tags removed
 *
 * @example
 * sanitizeText('<p>Safe text</p>') // 'Safe text'
 * sanitizeText('Normal text') // 'Normal text'
 */
const sanitizeText = (text) => {
  if (!text || typeof text !== 'string') return '';
  return text.replace(REGEX_PATTERNS.HTML_TAGS, '').trim();
};

/**
 * Validates complete contact form data
 *
 * @function validateContactForm
 * @param {Object} data - Contact form data
 * @param {string} data.nome - Sender's name
 * @param {string} data.email - Sender's email
 * @param {string} data.telefono - Sender's phone (optional)
 * @param {string} data.messaggio - Message content
 * @returns {Object} { valid: boolean, errors: string[] }
 *
 * @example
 * validateContactForm({
 *   nome: 'John Doe',
 *   email: 'john@example.com',
 *   telefono: '+39 348 1234567',
 *   messaggio: 'Hello, I have a question...'
 * });
 * // Returns: { valid: true, errors: [] }
 */
const validateContactForm = (data) => {
  const errors = [];

  // Validate name
  if (!validateLength(data.nome, 2, 100)) {
    errors.push('Name must be between 2 and 100 characters');
  }

  // Validate email
  if (!validateEmail(data.email)) {
    errors.push('Invalid email format');
  }

  // Validate phone (optional, but if provided must be valid)
  if (data.telefono && !validatePhone(data.telefono)) {
    errors.push('Invalid phone number format');
  }

  // Validate message
  if (!validateLength(data.messaggio, 10, 5000)) {
    errors.push('Message must be between 10 and 5000 characters');
  }

  // Check for HTML injection
  if (containsHTMLTags(data.messaggio) || containsHTMLTags(data.nome)) {
    errors.push('HTML tags are not allowed');
  }

  return {
    valid: errors.length === 0,
    errors,
  };
};

/**
 * Validates news/article creation/update data
 *
 * @function validateNewsData
 * @param {Object} data - News data
 * @param {string} data.title - Article title
 * @param {string} data.content - Article content
 * @param {string} [data.subtitle] - Short description
 * @param {string} [data.author] - Author name
 * @returns {Object} { valid: boolean, errors: string[] }
 *
 * @example
 * validateNewsData({
 *   title: 'Breaking News',
 *   subtitle: 'Important update',
 *   content: 'Full article content here...',
 *   author: 'John Journalist'
 * });
 */
const validateNewsData = (data) => {
  const errors = [];

  // Validate title
  if (!validateLength(data.title, 5, 200)) {
    errors.push('Title must be between 5 and 200 characters');
  }

  // Validate subtitle
  if (data.subtitle && !validateLength(data.subtitle, 5, 500)) {
    errors.push('Subtitle must be between 5 and 500 characters');
  }

  // Validate content
  if (!validateLength(data.content, 20, 50000)) {
    errors.push('Content must be between 20 and 50000 characters');
  }

  // Validate author
  if (data.author && !validateLength(data.author, 2, 100)) {
    errors.push('Author name must be between 2 and 100 characters');
  }

  // Check for HTML injection in critical fields
  if (containsHTMLTags(data.title) || containsHTMLTags(data.subtitle)) {
    errors.push('HTML tags are not allowed in title or subtitle');
  }

  return {
    valid: errors.length === 0,
    errors,
  };
};

module.exports = {
  // Regex patterns export
  REGEX_PATTERNS,

  // Individual validators
  validateEmail,
  validatePhone,
  validateURL,
  validateSlug,
  validateYoutubeId,
  validateCurrencyAmount,
  validateLength,
  containsHTMLTags,
  sanitizeText,

  // Form validators
  validateContactForm,
  validateNewsData,
};
