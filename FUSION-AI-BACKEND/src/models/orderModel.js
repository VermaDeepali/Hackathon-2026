const mongoose = require('mongoose');
const buyerSchema = require('./buyerModel');
const supplierSchema = require('./supplierModel');
const orderItemSchema = require('./orderItemModel');

const orderSchema = new mongoose.Schema({
  _id: { type: String },
  orderID: { type: String, trim: true },
  orderNumber: { type: String, required: true, trim: true, unique: true },
  createDate: { type: String, required: true },
  status: { type: String, required: true, trim: true },
  lastUpdate: { type: String },
  lastUpdatedDate: { type: String },
  deliveryDate: { type: String },
  incoterm: { type: String, trim: true },
  incotermText: { type: String, trim: true },
  // UN number string, e.g. "UN1230". Optional - most orders have no hazmat.
  hazmats: { type: String, trim: true },
  purchasingGroup: { type: String, trim: true },
  buyerPlant: { type: String, trim: true },
  materialGroup: { type: String, trim: true },
  materialDescription: { type: String, trim: true },
  buyerDetails: { type: buyerSchema, required: true },
  supplierDetails: { type: supplierSchema, required: true },
  quantity: { type: String, trim: true },
  netPrice: { type: String, trim: true },
  totalPrice: { type: String, trim: true },
  origin: { type: String, trim: true },
  destination: { type: String, trim: true },
  orderItems: { type: [orderItemSchema], default: [] }
}, { timestamps: { createdAt: 'created_at', updatedAt: false } });

const Order = mongoose.model('Order', orderSchema);

/**
 * Inserts a new order into the database. Because the schema explicitly types
 * _id as String (to support existing custom-string order ids), Mongoose
 * won't auto-generate one - so a real Mongo ObjectId is generated here
 * whenever the caller doesn't supply an _id.
 * @param {object} orderData
 * @returns {Promise<object>} The created order (plain object).
 */
async function createOrder(orderData) {
  const order = await Order.create({
    _id: new mongoose.Types.ObjectId().toString(),
    ...orderData
  });
  return order.toObject();
}

/**
 * Finds an order by its id.
 * @param {string} id
 * @returns {Promise<object|null>}
 */
async function findOrderById(id) {
  const order = await Order.findById(id).lean();
  return order || null;
}

/**
 * Returns all orders.
 * @param {string|object} [projection] Optional Mongoose projection.
 * @returns {Promise<object[]>}
 */
async function findAllOrders(projection) {
  return Order.find({}, projection).lean();
}

/**
 * Finds all orders placed by a given buyer (matched by buyer name), used to
 * look up a buyer's shipment history across their other orders.
 * @param {string} buyerName
 * @returns {Promise<object[]>}
 */
async function findOrdersByBuyerName(buyerName) {
  return Order.find({ 'buyerDetails.name': buyerName }, '_id').lean();
}

module.exports = {
  Order,
  createOrder,
  findOrderById,
  findAllOrders,
  findOrdersByBuyerName
};
