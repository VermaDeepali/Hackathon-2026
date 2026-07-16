const mongoose = require('mongoose');

let isConnected = false;

/**
 * Connect to MongoDB using the configured connection string.
 */
async function connectDb() {
  if (isConnected) {
    return mongoose.connection;
  }

  const mongoUri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/fusionIQ';
  await mongoose.connect(mongoUri);
  isConnected = true;

  return mongoose.connection;
}

module.exports = {
  connectDb
};
