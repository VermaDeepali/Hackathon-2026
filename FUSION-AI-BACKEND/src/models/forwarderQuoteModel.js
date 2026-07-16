const mongoose = require('mongoose');

const QUOTE_STATUSES = ['Pending', 'Selected', 'Rejected'];

const forwarderQuoteSchema = new mongoose.Schema({
  quotationId: { type: String, required: true, trim: true },
  forwarderId: { type: String, required: true, trim: true },
  liner: { type: String, trim: true },
  priceQuoted: { type: Number },
  departureDate: { type: String, trim: true },
  transitTime: { type: String, trim: true },
  quoteValidity: { type: String, trim: true },
  // On-time percentage (0-100) backing this specific quote.
  reliability: { type: Number },
  name: { type: String, trim: true },
  status: { type: String, trim: true, enum: QUOTE_STATUSES, default: 'Pending' }
}, { timestamps: { createdAt: 'created_at', updatedAt: false } });

const ForwarderQuote = mongoose.model('ForwarderQuote', forwarderQuoteSchema);

/**
 * Inserts a new forwarder quote response into the database.
 * @param {object} quoteData
 * @returns {Promise<object>} The created quote (plain object).
 */
async function createForwarderQuote(quoteData) {
  const quote = await ForwarderQuote.create(quoteData);
  return quote.toObject();
}

/**
 * Finds a forwarder quote by its id.
 * @param {string} id
 * @returns {Promise<object|null>}
 */
async function findForwarderQuoteById(id) {
  let quote;
  try {
    quote = await ForwarderQuote.findById(id).lean();
  } catch (error) {
    if (error.name === 'CastError') return null;
    throw error;
  }
  return quote || null;
}

/**
 * Finds all forwarder quotes submitted for a given quotation.
 * @param {string} quotationId
 * @returns {Promise<object[]>}
 */
async function findForwarderQuotesByQuotationId(quotationId) {
  return ForwarderQuote.find({ quotationId }).lean();
}

/**
 * Updates a forwarder quote (e.g. its price or status). Only defined keys in
 * updates are applied - undefined values are skipped so partial updates
 * (like just setting status) don't wipe the rest of the quote.
 * @param {string} id
 * @param {object} updates
 * @returns {Promise<object|null>}
 */
async function updateForwarderQuote(id, updates) {
  const set = Object.fromEntries(
    Object.entries(updates).filter(([, value]) => value !== undefined)
  );
  return ForwarderQuote.findByIdAndUpdate(id, { $set: set }, { new: true, runValidators: true }).lean();
}

/**
 * Marks every other quote on the same quotation "Rejected", since only one
 * forwarder can be accepted per quotation.
 * @param {string} quotationId
 * @param {string} exceptQuoteId - the quote that was just selected
 * @returns {Promise<void>}
 */
async function rejectOtherQuotes(quotationId, exceptQuoteId) {
  await ForwarderQuote.updateMany(
    { quotationId, _id: { $ne: exceptQuoteId } },
    { $set: { status: 'Rejected' } }
  );
}

module.exports = {
  ForwarderQuote,
  QUOTE_STATUSES,
  createForwarderQuote,
  findForwarderQuoteById,
  findForwarderQuotesByQuotationId,
  updateForwarderQuote,
  rejectOtherQuotes
};
