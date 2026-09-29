'use strict';

const mongoose = require('mongoose');

const databaseUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/travlr';

async function connect(uri = databaseUri) {
  if (mongoose.connection.readyState === 1) return mongoose.connection;

  try {
    await mongoose.connect(uri, { serverSelectionTimeoutMS: 5000 });
    return mongoose.connection;
  } catch (error) {
    throw new Error(`Could not connect to MongoDB: ${error.message}`, { cause: error });
  }
}

async function disconnect() {
  if (mongoose.connection.readyState !== 0) {
    await mongoose.disconnect();
  }
}

module.exports = { connect, disconnect, mongoose };
