/**
 * @file database.js
 * @description MongoDB database connection configuration
 * @version 1.0
 * @author SDA Italia Dev Team
 *
 * Handles MongoDB connection setup with Mongoose ODM
 * Implements connection pooling and error handling
 * Provides connection status monitoring
 *
 * Environment Variables:
 * - MONGODB_URI: Full MongoDB connection string
 * - NODE_ENV: 'development', 'production', or 'test'
 *
 * @example
 * const db = require('./config/database');
 * db.connect();
 */

const mongoose = require('mongoose');

/**
 * MongoDB connection options configuration
 * Optimized for production reliability
 *
 * @constant
 * @type {Object}
 */
const mongooseOptions = {
  // Connection pool size for managing concurrent connections
  maxPoolSize: process.env.NODE_ENV === 'production' ? 10 : 5,
  minPoolSize: process.env.NODE_ENV === 'production' ? 2 : 1,

  // Timeout settings (in milliseconds)
  serverSelectionTimeoutMS: 5000,
  socketTimeoutMS: 45000,
  connectTimeoutMS: 10000,

  // Automatic reconnection settings
  retryWrites: true,
  retryReads: true,

  // Driver settings
  useNewUrlParser: true,
  useUnifiedTopology: true,

  // Family: Use IPv4 for connections
  family: 4,
};

/**
 * Establishes MongoDB connection
 * Implements error handling and automatic reconnection
 *
 * @async
 * @function connect
 * @returns {Promise<void>} Resolves when connected successfully
 * @throws {Error} If connection fails after retries
 *
 * Connection Events:
 * - 'connected': Successfully connected to database
 * - 'disconnected': Connection lost
 * - 'reconnectFailed': Reconnection attempts exhausted
 * - 'error': Connection error occurred
 *
 * @example
 * await database.connect();
 * console.log('Database connected');
 */
const connect = async () => {
  const mongoUri =
    process.env.MONGODB_URI || 'mongodb://localhost:27017/sdarmitalia';

  try {
    // Attempt database connection
    await mongoose.connect(mongoUri, mongooseOptions);

    // Log successful connection
    const dbName = mongoose.connection.db.name;
    const host = mongoose.connection.host;
    console.log(
      `✓ MongoDB Connected Successfully\n` +
        `  Database: ${dbName}\n` +
        `  Host: ${host}\n` +
        `  Environment: ${process.env.NODE_ENV || 'development'}`,
    );

    return mongoose.connection;
  } catch (error) {
    console.error('✗ MongoDB Connection Failed');
    console.error(`  Error: ${error.message}`);
    console.error(
      `  URI: ${mongoUri.replace(/mongodb\+srv:\/\/[^:]+:[^@]+/, 'mongodb+srv://***:***')}`,
    );

    // In production, throw error; in development, allow continued operation
    if (process.env.NODE_ENV === 'production') {
      throw new Error(`Database connection failed: ${error.message}`);
    }

    // Wait before retrying in development
    console.log('Retrying connection in 5 seconds...');
    await new Promise((resolve) => setTimeout(resolve, 5000));
    return connect();
  }
};

/**
 * Closes MongoDB connection gracefully
 * Should be called during application shutdown
 *
 * @async
 * @function disconnect
 * @returns {Promise<void>} Resolves when disconnected
 *
 * @example
 * await database.disconnect();
 * console.log('Database disconnected');
 */
const disconnect = async () => {
  try {
    await mongoose.disconnect();
    console.log('✓ MongoDB Disconnected Successfully');
  } catch (error) {
    console.error('✗ Error disconnecting from MongoDB:', error.message);
    throw error;
  }
};

/**
 * Gets current connection status
 *
 * @function getStatus
 * @returns {Object} Connection status object
 *   @property {string} state - Connection state (0=disconnected, 1=connected, 2=connecting, 3=disconnecting)
 *   @property {boolean} isConnected - True if actively connected
 *   @property {string} database - Current database name (if connected)
 *   @property {string} host - Database host (if connected)
 *   @property {number} collections - Number of collections in database
 *
 * @example
 * const status = database.getStatus();
 * if (status.isConnected) {
 *   console.log(`Connected to: ${status.database}`);
 * }
 */
const getStatus = () => {
  const connection = mongoose.connection;
  const states = {
    0: 'disconnected',
    1: 'connected',
    2: 'connecting',
    3: 'disconnecting',
  };

  return {
    state: connection.readyState,
    stateName: states[connection.readyState],
    isConnected: connection.readyState === 1,
    database: connection.db?.name || null,
    host: connection.host || null,
    collections: connection.collections
      ? Object.keys(connection.collections).length
      : 0,
  };
};

/**
 * Drops entire database (DANGEROUS - Development only)
 * Useful for testing and development
 *
 * @async
 * @function dropDatabase
 * @returns {Promise<void>}
 * @throws {Error} If not in development environment
 *
 * @example
 * // Reset database for testing
 * if (process.env.NODE_ENV === 'development') {
 *   await database.dropDatabase();
 * }
 */
const dropDatabase = async () => {
  if (process.env.NODE_ENV === 'production') {
    throw new Error('Cannot drop database in production environment');
  }

  try {
    await mongoose.connection.db.dropDatabase();
    console.log('✓ Database dropped successfully (development only)');
  } catch (error) {
    console.error('✗ Error dropping database:', error.message);
    throw error;
  }
};

/**
 * Connection event handlers
 * Monitors and logs connection status changes
 */
mongoose.connection.on('connected', () => {
  console.log('📊 MongoDB: Connected to database');
});

mongoose.connection.on('disconnected', () => {
  console.log('📊 MongoDB: Disconnected from database');
});

mongoose.connection.on('reconnected', () => {
  console.log('📊 MongoDB: Reconnected to database');
});

mongoose.connection.on('error', (error) => {
  console.error('📊 MongoDB Error:', error.message);
});

/**
 * Handle application shutdown gracefully
 * Disconnects from database before exiting
 */
process.on('SIGINT', async () => {
  try {
    await disconnect();
    process.exit(0);
  } catch (error) {
    console.error('Error during graceful shutdown:', error.message);
    process.exit(1);
  }
});

module.exports = {
  // Main connection functions
  connect,
  disconnect,

  // Status and monitoring
  getStatus,

  // Database management
  dropDatabase,

  // Mongoose access (if needed directly)
  mongoose,

  // Options export (for customization if needed)
  mongooseOptions,
};
