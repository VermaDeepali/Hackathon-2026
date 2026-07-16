const mongoose = require('mongoose');

/**
 * Embedded schema describing a single line item within an order.
 */
const orderItemSchema = new mongoose.Schema({
  itemNumber: { type: Number, required: true },
  materialId: { type: String, required: true, trim: true },
  materialGroup: { type: String, trim: true },
  quantity: { type: String, trim: true },
  uom: { type: String, trim: true },
  totalPrice: { type: String, trim: true },
  expectedCargoReady: { type: String, trim: true },
  deliveryDate: { type: String, trim: true },
  status: { type: String, trim: true }
}, { _id: false });

module.exports = orderItemSchema;
