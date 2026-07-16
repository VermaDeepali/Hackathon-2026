const mongoose = require('mongoose');

const forwarderSchema = new mongoose.Schema({
  id: { type: String, required: true, trim: true, unique: true },
  name: { type: String, required: true, trim: true, unique: true },
  mode: { type: [String], default: [] },
  incoterm: { type: String, trim: true },
  modeType: { type: String, trim: true },
  containerType: { type: [String], default: [] },
  headOffice: { type: String, trim: true },
  rating: { type: Number },
  status: { type: String, trim: true, enum: ['Active', 'Inactive'], default: 'Active' }
}, { timestamps: { createdAt: 'created_at', updatedAt: false } });

const Forwarder = mongoose.model('Forwarder', forwarderSchema);

/**
 * Inserts a new forwarder into the database.
 * @param {object} forwarderData
 * @returns {Promise<object>} The created forwarder (plain object).
 */
async function createForwarder(forwarderData) {
  const forwarder = await Forwarder.create(forwarderData);
  return forwarder.toObject();
}

/**
 * Finds a forwarder by its exact name.
 * @param {string} name
 * @returns {Promise<object|null>}
 */
async function findForwarderByName(name) {
  return Forwarder.findOne({ name }).lean();
}

/**
 * Returns all forwarders.
 * @returns {Promise<object[]>}
 */
async function findAllForwarders() {
  return Forwarder.find().lean();
}

module.exports = {
  Forwarder,
  createForwarder,
  findForwarderByName,
  findAllForwarders
};
