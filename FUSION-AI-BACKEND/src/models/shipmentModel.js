const mongoose = require('mongoose');

// Statuses a shipment can move through. Only the initial status exists today;
// more will be added as the shipment lifecycle grows.
const SHIPMENT_STATUSES = ['Shipment Created'];

const shipmentSchema = new mongoose.Schema({
  shipmentNumber: { type: String, required: true, unique: true, trim: true },
  bl: { type: String, required: true, unique: true, trim: true },
  status: { type: String, required: true, trim: true, enum: SHIPMENT_STATUSES, default: 'Shipment Created' },
  packageId: { type: String, required: true, trim: true },
  bookingId: { type: String, required: true, trim: true },
  orderId: { type: String, required: true, trim: true },
  orderNumber: { type: String, trim: true },
  // The following are copied from the booking at creation time.
  mode: { type: String, trim: true, enum: ['Air', 'Ocean', 'Road'] },
  shipmentType: { type: String, trim: true },
  typeOfMove: { type: String, trim: true },
  bookingType: { type: String, trim: true },
  incoterm: { type: String, trim: true },
  containerType: { type: String, trim: true, enum: ['FCL', 'LCL'] },
  estimatedETA: { type: String, trim: true }
}, { timestamps: { createdAt: 'created_at', updatedAt: false } });

const Shipment = mongoose.model('Shipment', shipmentSchema);

/**
 * Generates a 10-digit numeric shipment number, e.g. "4831907256".
 * @returns {string}
 */
function generateShipmentNumber() {
  const firstDigit = Math.floor(Math.random() * 9) + 1;
  let rest = '';
  for (let i = 0; i < 9; i += 1) {
    rest += Math.floor(Math.random() * 10);
  }
  return `${firstDigit}${rest}`;
}

const BL_CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';

/**
 * Generates a 10-character alphanumeric Bill of Lading number, e.g. "A1B2C3D4E5".
 * @returns {string}
 */
function generateBL() {
  let bl = '';
  for (let i = 0; i < 10; i += 1) {
    bl += BL_CHARS[Math.floor(Math.random() * BL_CHARS.length)];
  }
  return bl;
}

/**
 * Inserts a new shipment into the database.
 * @param {object} shipmentData
 * @returns {Promise<object>} The created shipment (plain object).
 */
async function createShipment(shipmentData) {
  const shipment = await Shipment.create(shipmentData);
  return shipment.toObject();
}

/**
 * Finds a shipment by its id.
 * @param {string} id
 * @returns {Promise<object|null>}
 */
async function findShipmentById(id) {
  let shipment;
  try {
    shipment = await Shipment.findById(id).lean();
  } catch (error) {
    if (error.name === 'CastError') return null;
    throw error;
  }
  return shipment || null;
}

/**
 * Finds all shipments requested for a given package.
 * @param {string} packageId
 * @returns {Promise<object[]>}
 */
async function findShipmentsByPackageId(packageId) {
  return Shipment.find({ packageId }).lean();
}

/**
 * Returns all shipments.
 * @returns {Promise<object[]>}
 */
async function findAllShipments() {
  return Shipment.find().lean();
}

module.exports = {
  Shipment,
  generateShipmentNumber,
  generateBL,
  createShipment,
  findShipmentById,
  findShipmentsByPackageId,
  findAllShipments
};
