const mongoose = require('mongoose');

const packageSchema = new mongoose.Schema({
  orderId: { type: String, required: true, trim: true },
  materialId: { type: String, required: true, trim: true },
  materialGroup: { type: String, trim: true },
  quantity: { type: String, trim: true },
  dimensions: { type: String, trim: true },
  cargoReady: { type: String, trim: true },
  quantityToShip: { type: String, trim: true },
  grossWeight: { type: String, trim: true },
  packageType: { type: String, trim: true },
  // Buyer-facing final shipment mode. Defaults to the AI recommendation when
  // first generated, but the buyer can override it, and the override wins.
  shipmentMode: { type: String, trim: true, enum: ['Air', 'Ocean', 'Road'] },
  // Every distinct mode ever evaluated for this package (AI recommendations
  // and buyer-override re-evaluations), oldest first, one entry per mode -
  // switching back to an already-evaluated mode reuses its entry rather than
  // duplicating it. The entry whose recommendedMode matches the current
  // shipmentMode is the one backing it, but it isn't necessarily the last.
  modeRecommendationHistory: {
    type: [{
      recommendedMode: { type: String, trim: true },
      confidence: { type: String, trim: true },
      reasoning: { type: [String], default: undefined },
      originPort: { type: String, trim: true },
      destinationPort: { type: String, trim: true },
      recommendedAt: { type: Date }
    }],
    default: []
  }
}, { timestamps: { createdAt: 'created_at', updatedAt: false } });

const Package = mongoose.model('Package', packageSchema);

/**
 * Inserts a new package into the database.
 * @param {object} packageData
 * @returns {Promise<object>} The created package (plain object).
 */
async function createPackage(packageData) {
  const pkg = await Package.create(packageData);
  return pkg.toObject();
}

/**
 * Finds a package by its id.
 * @param {string} id
 * @returns {Promise<object|null>}
 */
async function findPackageById(id) {
  let pkg;
  try {
    pkg = await Package.findById(id).lean();
  } catch (error) {
    if (error.name === 'CastError') return null;
    throw error;
  }
  return pkg || null;
}

/**
 * Finds all packages belonging to a given order.
 * @param {string} orderId
 * @returns {Promise<object[]>}
 */
async function findPackagesByOrderId(orderId) {
  return Package.find({ orderId }).lean();
}

/**
 * Returns all packages.
 * @returns {Promise<object[]>}
 */
async function findAllPackages() {
  return Package.find().lean();
}

/**
 * Stores the latest AI mode recommendation on a package. If the buyer hasn't
 * already picked/overridden a shipment mode, it also becomes the current
 * shipmentMode.
 * @param {string} id
 * @param {object} recommendation - { recommendedMode, confidence, reasoning }
 * @returns {Promise<object|null>}
 */
async function saveModeRecommendation(id, recommendation) {
  const existing = await Package.findById(id);
  if (!existing) return null;

  existing.modeRecommendationHistory.push({
    recommendedMode: recommendation.recommendedMode,
    confidence: recommendation.confidence,
    reasoning: recommendation.reasoning,
    originPort: recommendation.originPort,
    destinationPort: recommendation.destinationPort,
    recommendedAt: new Date()
  });
  if (!existing.shipmentMode) {
    existing.shipmentMode = recommendation.recommendedMode;
  }

  await existing.save();
  return existing.toObject();
}

/**
 * Sets the buyer's final shipment mode, overriding whatever the AI
 * recommended, and replaces the stored recommendation with reasoning that
 * matches the newly selected mode so the two never disagree.
 * @param {string} id
 * @param {string} mode - 'Air' | 'Ocean' | 'Road'
 * @param {object} recommendation - { recommendedMode, confidence, reasoning } evaluated for `mode`
 * @returns {Promise<object|null>}
 */
async function setShipmentMode(id, mode, recommendation) {
  const pkg = await Package.findByIdAndUpdate(
    id,
    {
      $set: { shipmentMode: mode },
      $push: {
        modeRecommendationHistory: {
          recommendedMode: recommendation.recommendedMode,
          confidence: recommendation.confidence,
          reasoning: recommendation.reasoning,
          originPort: recommendation.originPort,
          destinationPort: recommendation.destinationPort,
          recommendedAt: new Date()
        }
      }
    },
    { new: true, runValidators: true }
  ).lean();
  return pkg || null;
}

/**
 * Sets the buyer's final shipment mode to one that was already evaluated
 * before (its reasoning already sits in modeRecommendationHistory), so no
 * new history entry is pushed - just the pointer moves.
 * @param {string} id
 * @param {string} mode - 'Air' | 'Ocean' | 'Road'
 * @returns {Promise<object|null>}
 */
async function selectShipmentMode(id, mode) {
  const pkg = await Package.findByIdAndUpdate(
    id,
    { $set: { shipmentMode: mode } },
    { new: true, runValidators: true }
  ).lean();
  return pkg || null;
}

module.exports = {
  Package,
  createPackage,
  findPackageById,
  findPackagesByOrderId,
  findAllPackages,
  saveModeRecommendation,
  setShipmentMode,
  selectShipmentMode
};
