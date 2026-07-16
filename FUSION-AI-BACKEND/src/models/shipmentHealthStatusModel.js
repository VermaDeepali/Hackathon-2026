const mongoose = require('mongoose');

const milestoneCompletionSchema = new mongoose.Schema({
  score: { type: Number },
  status: { type: String, trim: true },
  completed: { type: Number },
  total: { type: Number }
}, { _id: false });

const documentStatusSchema = new mongoose.Schema({
  score: { type: Number },
  status: { type: String, trim: true },
  uploaded: { type: Number },
  required: { type: Number },
  pendingDocuments: { type: [String], default: [] }
}, { _id: false });

const forwarderPerformanceSchema = new mongoose.Schema({
  score: { type: Number },
  status: { type: String, trim: true },
  carrier: { type: String, trim: true },
  onTimePerformance: { type: String, trim: true },
  delay: { type: String, trim: true }
}, { _id: false });

const customsClearanceSchema = new mongoose.Schema({
  score: { type: Number },
  status: { type: String, trim: true },
  clearanceStatus: { type: String, trim: true }
}, { _id: false });

const shipmentHealthSchema = new mongoose.Schema({
  overallScore: { type: Number },
  overallStatus: { type: String, trim: true },
  milestoneCompletion: { type: milestoneCompletionSchema },
  documentStatus: { type: documentStatusSchema },
  forwarderPerformance: { type: forwarderPerformanceSchema },
  customsClearance: { type: customsClearanceSchema }
}, { _id: false });

const shipmentHealthStatusSchema = new mongoose.Schema({
  shipmentId: { type: String, required: true, trim: true, unique: true },
  shipmentHealth: { type: shipmentHealthSchema, required: true }
}, { timestamps: { createdAt: 'created_at', updatedAt: false } });

const ShipmentHealthStatus = mongoose.model('ShipmentHealthStatus', shipmentHealthStatusSchema);

/**
 * Inserts a new shipment health status record into the database.
 * @param {object} data - { shipmentId, shipmentHealth }
 * @returns {Promise<object>} The created record (plain object).
 */
async function createShipmentHealthStatus(data) {
  const record = await ShipmentHealthStatus.create(data);
  return record.toObject();
}

/**
 * Finds a shipment health status record by its shipmentId.
 * @param {string} shipmentId
 * @returns {Promise<object|null>}
 */
async function findShipmentHealthStatusByShipmentId(shipmentId) {
  return ShipmentHealthStatus.findOne({ shipmentId }).lean();
}

/**
 * Returns all shipment health status records.
 * @returns {Promise<object[]>}
 */
async function findAllShipmentHealthStatuses() {
  return ShipmentHealthStatus.find().lean();
}

module.exports = {
  ShipmentHealthStatus,
  createShipmentHealthStatus,
  findShipmentHealthStatusByShipmentId,
  findAllShipmentHealthStatuses
};
