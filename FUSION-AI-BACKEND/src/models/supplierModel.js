const mongoose = require('mongoose');

/**
 * Embedded schema describing the supplier on an order.
 */
const supplierSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  code: { type: String, trim: true },
  location: { type: String, trim: true },
  contact: { type: String, trim: true },
  destination: { type: String, trim: true }
}, { _id: false });

module.exports = supplierSchema;
