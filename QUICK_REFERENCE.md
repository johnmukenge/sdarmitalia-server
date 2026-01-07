/\*\*

- @file QUICK_REFERENCE.md
- @description Quick reference guide for backend improvements
- @version 1.0
- @author SDA Italia Dev Team
  \*/

# Backend Quick Reference Guide

## 🎯 Middleware Usage

### Error Handling

```javascript
// In controllers with catchAsync:
const catchAsync = require('../middleware/catchAsync');
const AppError = require('../utils/errorClass');

exports.getNews = catchAsync(async (req, res, next) => {
  const news = await News.findById(req.params.id);
  if (!news) throw new AppError('News not found', 404);
  res.json(news);
});

// Error handler catches and formats automatically
// No try-catch needed!
```

### Input Validation

```javascript
const {
  validateContactForm,
  validateNewsData,
} = require('../middleware/validateInput');

// In controller:
const validation = validateContactForm(req.body);
if (!validation.valid) {
  throw new AppError(validation.errors.join(', '), 400);
}

// Or use on form submission:
const newsValidation = validateNewsData(req.body);
```

### Rate Limiting

```javascript
const { strictLimiter, generalLimiter } = require('../middleware/rateLimiter');

// Apply to routes:
app.post('/api/contact', strictLimiter, contactController.createContact);
app.get('/api/news', generalLimiter, newsController.getAllNews);
```

### Logging

```javascript
const logger = require('../middleware/logger');

// In index.js:
app.use(logger.requestLogger);
app.use(logger.performanceLogger(500)); // Log slow requests >500ms
// Add error logger after error handler
```

---

## 📊 Database Configuration

```javascript
const db = require('../config/database');

// Connect on startup
await db.connect();

// Check status
const status = db.getStatus();
console.log(status.isConnected);

// Disconnect on shutdown
await db.disconnect();
```

---

## 💳 Stripe Configuration

```javascript
const stripe = require('../config/stripe');

// Create checkout session
const session = await stripe.createCheckoutSession({
  amount: 5000, // €50 in cents
  email: 'donor@example.com',
  name: 'John Doe',
  description: 'Donation to SDA Italia',
});

// In webhook:
const event = stripe.validateWebhookSignature(
  req.rawBody,
  req.headers['stripe-signature'],
);

if (event.type === 'checkout.session.completed') {
  const donation = await Donazione.findOne({
    stripeSessionId: event.data.object.id,
  });
  await donation.markAsPaid(chargeId);
}
```

---

## 📚 Enhanced Models Cheat Sheet

### News

```javascript
// Get published articles
const articles = await News.getPublished(10);

// Get featured articles
const featured = await News.getFeatured(5);

// Increment views
await news.incrementViews();

// Toggle featured status
await news.toggleFeatured();

// Search
const results = await News.find({ $text: { $search: 'keyword' } });
```

### Contact

```javascript
// Get unread messages
const unreadCount = await Contact.getUnreadCount();
const urgent = await Contact.getHighPriority();

// Get statistics
const stats = await Contact.getStats();
console.log(stats); // { total, unread, responded, urgent }

// Mark as read
await contact.markAsRead();

// Add response
await contact.addResponse('Thank you for your message...', 'Admin Name');

// Archive
await contact.archive();
```

### Events

```javascript
// Get upcoming events
const upcoming = await Event.getUpcoming(10);

// Get past events
const past = await Event.getPast(5);

// Find nearby (geospatial)
const nearby = await Event.findNearby(41.9028, 12.4964, 5000);
// latitude, longitude, maxDistance(meters)

// Registration management
if (event.hasAvailability(2)) {
  await event.registerAttendee(2);
}

// Get remaining spots
const remaining = event.getRemainingCapacity();
```

### Libri (Digital Library)

```javascript
// Search books
const results = await Libro.search('profezia biblica');

// Get by category
const theological = await Libro.getByCategory('teologia');

// Get featured books
const featured = await Libro.getFeatured(6);

// Get by author
const books = await Libro.getByAuthor('Ellen White');

// Get most downloaded
const popular = await Libro.getMostDownloaded(10);

// Get top rated
const topRated = await Libro.getTopRated(10, 5); // min 5 ratings

// Get statistics
const stats = await Libro.getStats();

// Instance operations
await libro.incrementDownloads();
await libro.addRating(4); // 1-5
await libro.toggleFeatured();
await libro.publish();
await libro.archive();
```

### Donazioni (Donations)

```javascript
// Get statistics
const stats = await Donazione.getStats();
// { totalDonations, donationCount, averageDonation, activeRecurring, byCategory }

// Get donations by category
const churchDonations = await Donazione.getByCategory('chiesa');

// Get pending donations
const pending = await Donazione.getPending();

// Get active recurring
const recurring = await Donazione.getActiveRecurring();

// Get total by period
const thisMonth = new Date();
thisMonth.setDate(1);
const total = await Donazione.getTotalByPeriod(thisMonth, new Date());

// Instance operations
await donation.markAsPaid(stripeChargeId);
await donation.markAsFailed('Card declined');
await donation.refund('requested_by_customer');
await donation.cancelRecurring();

// Utilities
const formatted = donation.getFormattedAmount(); // "€50.00"
const donorName = donation.getDonorName(); // respects anonymous flag
```

---

## 🔍 Field Validation Reference

### Email Validation

```javascript
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
// Accepts: user@example.com, name+tag@domain.co.uk
// Rejects: user@, @domain.com, user space@domain
```

### Phone Validation

```javascript
const PHONE_REGEX =
  /^(\+?\d{1,3}[\s\-]?)?\(?\d{1,4}\)?[\s\-]?\d{1,4}[\s\-]?\d{1,9}$/;
// Accepts: +39 348 123456, (348) 123-456, 348123456
// Rejects: 123, invalid formats
```

### YouTube ID Validation

```javascript
const YOUTUBE_REGEX = /^[a-zA-Z0-9_-]{11}$/;
// Exactly 11 characters
// Example: dQw4w9WgXcQ
```

### Currency Amount Validation

```javascript
const CURRENCY_REGEX = /^\d+(\.\d{1,2})?$/;
// Accepts: 10, 10.50, 0.99
// Rejects: 10.999 (too many decimals), negative values
```

---

## 📈 Performance Tips

### Indexes Created

All models have optimized indexes for common queries:

- Status-based queries
- Date-based sorting
- Full-text search
- Geospatial queries (Events)

### Query Optimization Examples

```javascript
// Good: Uses index
const news = await News.find({ status: 'published' })
  .sort({ publishedAt: -1 })
  .limit(10);

// Good: Uses full-text search index
const results = await Libro.search('keyword');

// Good: Uses geospatial index
const nearby = await Event.findNearby(lat, lng);
```

---

## 🚨 Error Handling Patterns

### Proper Error Throwing

```javascript
// ✅ CORRECT: Operational error
throw new AppError('Resource not found', 404);

// ✅ CORRECT: Validation error
throw new AppError('Email already registered', 400);

// ❌ WRONG: Generic error
throw new Error('Something happened');
```

### Status Codes

- **400**: Bad request / Validation error
- **404**: Not found
- **409**: Conflict (duplicate)
- **422**: Unprocessable entity
- **429**: Too many requests (rate limit)
- **500**: Server error

---

## 🔐 Security Checklist

- ✅ All inputs validated before database
- ✅ HTML tags detected and sanitized
- ✅ Email/phone regex validated
- ✅ Rate limiting on sensitive endpoints
- ✅ Stripe webhooks signature verified
- ✅ Sensitive data redacted from logs
- ✅ Error messages don't leak details
- ✅ CORS configured
- ✅ API keys in environment variables

---

## 📝 Common Usage Patterns

### Create with Validation

```javascript
exports.createNews = catchAsync(async (req, res, next) => {
  // Validate input
  const validation = validateNewsData(req.body);
  if (!validation.valid) {
    throw new AppError(validation.errors.join(', '), 400);
  }

  // Create document
  const news = await News.create(req.body);

  // Return response
  res.status(201).json({
    status: 'success',
    data: news,
  });
});
```

### Update with Status Management

```javascript
exports.updateNews = catchAsync(async (req, res, next) => {
  const news = await News.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  if (!news) throw new AppError('News not found', 404);

  res.json({
    status: 'success',
    data: news,
  });
});
```

### Search with Pagination

```javascript
exports.searchLibri = catchAsync(async (req, res, next) => {
  const { q, category, limit = 20, page = 1 } = req.query;

  let query = {};
  if (q) {
    query = { $text: { $search: q } };
  }
  if (category) {
    query.category = category;
  }
  query.status = 'published';
  query.isPublic = true;

  const skip = (page - 1) * limit;
  const libri = await Libro.find(query)
    .skip(skip)
    .limit(parseInt(limit))
    .sort({ rating: -1 });

  res.json({
    status: 'success',
    data: libri,
    pagination: { page, limit, total: await Libro.countDocuments(query) },
  });
});
```

---

## 🎓 Learning Resources

### Files to Study (in order)

1. **middleware/errorClass.js** - Understanding error handling
2. **middleware/catchAsync.js** - Async error wrapper
3. **middleware/validateInput.js** - Validation patterns
4. **models/libriModel.js** - Full-featured model example
5. **config/stripe.js** - External API integration
6. **config/database.js** - Connection management

### Pattern Recognition

- Error handling: See errorHandler.js
- Pre-save hooks: See all models
- Instance methods: See any model
- Static methods: See libriModel.js
- Geospatial queries: See eventiModel.js
- Full-text search: See libriModel.js

---

## 🆘 Troubleshooting

### Error: "ValidationError: title is required"

- Check model validation rules
- Verify request body has all required fields
- Use validateNewsData() to pre-check

### Error: "Too many requests"

- Rate limiter triggered
- Wait for time window to reset
- Check X-RateLimit-Reset header

### Error: "Stripe API key not configured"

- Add STRIPE_SECRET_KEY to .env
- Verify key is set before using Stripe functions

### Error: "MongoDB connection failed"

- Check MONGODB_URI in .env
- Verify MongoDB server is running
- Check network connectivity

---

**Last Updated**: 2024
**Version**: 1.0
**Status**: Complete for Phase 1 ✅
