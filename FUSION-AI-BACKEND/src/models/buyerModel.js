const mongoose = require('mongoose');

/**
 * Embedded schema describing the buyer on an order.
 */
const buyerSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  division: { type: String, trim: true },
  contact: { type: String, trim: true },
  address: { type: String, trim: true },
  origin: { type: String, trim: true }
}, { _id: false });

module.exports = buyerSchema;
