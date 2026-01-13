/**
 * @file transactionLogger.js
 * @description Specialized transaction logging system with daily log files
 * @version 1.0
 * @author SDA Italia Dev Team
 *
 * Features:
 * - Daily log files (one per day)
 * - Automatic file rotation
 * - Detailed transaction history with timestamps
 * - Separate logs for different transaction types (donations, payments, errors)
 */

const fs = require('fs');
const path = require('path');

// Create logs directory if it doesn't exist
const logsDir = path.join(__dirname, '..', 'logs');
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

/**
 * Get formatted date for filename
 * @returns {string} Date in YYYY-MM-DD format
 */
const getDateForFilename = () => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

/**
 * Get formatted timestamp with milliseconds
 * @returns {string} Timestamp in HH:mm:ss.mmm format
 */
const getTimestamp = () => {
  const now = new Date();
  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');
  const seconds = String(now.getSeconds()).padStart(2, '0');
  const ms = String(now.getMilliseconds()).padStart(3, '0');
  return `${hours}:${minutes}:${seconds}.${ms}`;
};

/**
 * Write transaction log to daily file
 * @param {string} logType - Type of transaction (donation, payment, error, webhook)
 * @param {Object} data - Transaction data to log
 */
const logTransaction = (logType, data) => {
  try {
    const dateFile = getDateForFilename();
    const timestamp = getTimestamp();
    const logFileName = `transactions-${dateFile}.log`;
    const logFilePath = path.join(logsDir, logFileName);

    // Format log entry
    const logEntry = {
      timestamp,
      type: logType,
      date: new Date().toISOString(),
      ...data,
    };

    const logLine = `[${timestamp}] [${logType.toUpperCase()}] ${JSON.stringify(logEntry)}\n`;

    // Append to file
    fs.appendFileSync(logFilePath, logLine, 'utf8');

    // Also log to console in development
    if (process.env.NODE_ENV === 'development') {
      console.log(`📝 Transaction logged: ${logType}`);
    }
  } catch (error) {
    console.error('❌ Error writing to transaction log:', error);
  }
};

/**
 * Log donation creation
 * @param {Object} donationData - Donation details
 */
const logDonation = (donationData) => {
  logTransaction('DONATION', {
    action: 'created',
    paymentIntentId: donationData.paymentIntentId,
    donationId: donationData.donationId,
    amount: donationData.amount,
    currency: donationData.currency,
    email: donationData.email,
    name: donationData.name,
    category: donationData.categoria,
    anonymous: donationData.anonimo,
    receipt: donationData.ricevuta,
    status: donationData.status,
  });
};

/**
 * Log payment intent creation
 * @param {Object} intentData - Payment intent details
 */
const logPaymentIntent = (intentData) => {
  logTransaction('PAYMENT_INTENT', {
    action: 'created',
    paymentIntentId: intentData.id,
    amount: intentData.amount,
    currency: intentData.currency,
    status: intentData.status,
    email: intentData.metadata?.email,
    name: intentData.metadata?.nome,
    clientSecretLength: intentData.client_secret
      ? intentData.client_secret.length
      : 0,
  });
};

/**
 * Log payment confirmation
 * @param {Object} paymentData - Payment details
 */
const logPaymentConfirmation = (paymentData) => {
  logTransaction('PAYMENT_CONFIRMATION', {
    action: 'confirmed',
    paymentIntentId: paymentData.paymentIntentId,
    donationId: paymentData.donationId,
    status: paymentData.status,
    amount: paymentData.amount,
    currency: paymentData.currency,
  });
};

/**
 * Log payment error
 * @param {Object} errorData - Error details
 */
const logPaymentError = (errorData) => {
  logTransaction('PAYMENT_ERROR', {
    action: 'error',
    paymentIntentId: errorData.paymentIntentId || null,
    donationId: errorData.donationId || null,
    errorType: errorData.errorType,
    errorMessage: errorData.message,
    statusCode: errorData.statusCode,
    userEmail: errorData.email || null,
  });
};

/**
 * Log webhook event
 * @param {Object} webhookData - Webhook details
 */
const logWebhookEvent = (webhookData) => {
  logTransaction('WEBHOOK', {
    action: 'received',
    eventId: webhookData.eventId,
    eventType: webhookData.type,
    paymentIntentId: webhookData.paymentIntentId,
    status: webhookData.status,
  });
};

/**
 * Get logs directory path
 * @returns {string} Absolute path to logs directory
 */
const getLogsDir = () => logsDir;

/**
 * Get all log files for a specific date
 * @param {string} date - Date in YYYY-MM-DD format (optional, defaults to today)
 * @returns {string} Log file path
 */
const getLogFilePath = (date = null) => {
  const dateFile = date || getDateForFilename();
  return path.join(logsDir, `transactions-${dateFile}.log`);
};

/**
 * Read transactions from a specific date
 * @param {string} date - Date in YYYY-MM-DD format (optional, defaults to today)
 * @returns {Array} Array of transaction objects
 */
const readDayTransactions = (date = null) => {
  try {
    const filePath = getLogFilePath(date);

    if (!fs.existsSync(filePath)) {
      return [];
    }

    const fileContent = fs.readFileSync(filePath, 'utf8');
    const lines = fileContent.split('\n').filter((line) => line.trim());

    return lines
      .map((line) => {
        try {
          // Extract JSON from log line
          const jsonMatch = line.match(/\{.*\}$/);
          if (jsonMatch) {
            return JSON.parse(jsonMatch[0]);
          }
          return null;
        } catch {
          return null;
        }
      })
      .filter(Boolean);
  } catch (error) {
    console.error('❌ Error reading transaction logs:', error);
    return [];
  }
};

/**
 * Get transaction statistics for a date
 * @param {string} date - Date in YYYY-MM-DD format (optional)
 * @returns {Object} Statistics object
 */
const getTransactionStats = (date = null) => {
  const transactions = readDayTransactions(date);

  const stats = {
    totalTransactions: transactions.length,
    byType: {},
    totalAmount: 0,
    successfulPayments: 0,
    failedPayments: 0,
  };

  transactions.forEach((tx) => {
    // Count by type
    stats.byType[tx.type] = (stats.byType[tx.type] || 0) + 1;

    // Sum amounts for donations
    if (tx.type === 'DONATION' && tx.amount) {
      stats.totalAmount += tx.amount;
    }

    // Count successful/failed payments
    if (tx.type === 'PAYMENT_CONFIRMATION' && tx.status === 'succeeded') {
      stats.successfulPayments++;
    } else if (tx.type === 'PAYMENT_ERROR') {
      stats.failedPayments++;
    }
  });

  return stats;
};

module.exports = {
  logTransaction,
  logDonation,
  logPaymentIntent,
  logPaymentConfirmation,
  logPaymentError,
  logWebhookEvent,
  getLogsDir,
  getLogFilePath,
  readDayTransactions,
  getTransactionStats,
  getDateForFilename,
  getTimestamp,
};
