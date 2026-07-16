const mongoose = require('mongoose');

const VALID_MODES = ['Air', 'Ocean', 'Road'];

const quotationSchema = new mongoose.Schema({
  packageId: { type: String, required: true, trim: true },
  bookingId: { type: String, required: true, trim: true },
  mode: { type: String, trim: true, enum: VALID_MODES },
  shipmentType: { type: String, trim: true },
  typeOfMove: { type: String, trim: true },
  incoterm: { type: String, trim: true },
  origin: { type: String, trim: true },
  destination: { type: String, trim: true },
  hazmat: { type: String, trim: true },
  packageType: { type: String, trim: true },
  numberOfPackages: { type: String, trim: true },
  dimensions: { type: String, trim: true },
  totalWeight: { type: String, trim: true },
  quotationRequiredBy: { type: String, trim: true },
  schedulePickUpDateFrom: { type: String, trim: true },
  schedulePickUpDateTo: { type: String, trim: true },
  lastUpdatedDate: { type: String, trim: true },
  // Ids of the forwarders this quote request is being sent to.
  forwarders: { type: [String], default: [] }
}, { timestamps: { createdAt: 'created_at', updatedAt: false } });

const Quotation = mongoose.model('Quotation', quotationSchema);

/**
 * Inserts a new quotation request into the database.
 * @param {object} quotationData
 * @returns {Promise<object>} The created quotation (plain object).
 */
async function createQuotation(quotationData) {
  const quotation = await Quotation.create(quotationData);
  return quotation.toObject();
}

/**
 * Finds a quotation by its id.
 * @param {string} id
 * @returns {Promise<object|null>}
 */
async function findQuotationById(id) {
  let quotation;
  try {
    quotation = await Quotation.findById(id).lean();
  } catch (error) {
    if (error.name === 'CastError') return null;
    throw error;
  }
  return quotation || null;
}

/**
 * Returns all quotations.
 * @returns {Promise<object[]>}
 */
async function findAllQuotations() {
  return Quotation.find().lean();
}

/**
 * Finds all quotations requested for a given package.
 * @param {string} packageId
 * @returns {Promise<object[]>}
 */
async function findQuotationsByPackageId(packageId) {
  return Quotation.find({ packageId }).lean();
}

module.exports = {
  Quotation,
  VALID_MODES,
  createQuotation,
  findQuotationById,
  findAllQuotations,
  findQuotationsByPackageId
};
