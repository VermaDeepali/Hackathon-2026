const packageModel = require('../models/packageModel');
const orderModel = require('../models/orderModel');
const bookingModel = require('../models/bookingModel');
const { recommendForwarder } = require('../services/forwarderRecommendation');
const { recommendShipmentMode, evaluateShipmentMode } = require('../services/shipmentModeRecommendation');

/**
 * Create a new package.
 */
async function createPackage(req, res) {
  try {
    const {
      orderId,
      materialId,
      materialGroup,
      quantity,
      dimensions,
      cargoReady,
      quantityToShip,
      grossWeight,
      packageType
    } = req.body;

    if (!orderId || !materialId) {
      return res.status(400).json({
        status: 'error',
        message: 'orderId and materialId are required.'
      });
    }

    const pkg = await packageModel.createPackage({
      orderId,
      materialId,
      materialGroup,
      quantity,
      dimensions,
      cargoReady,
      quantityToShip,
      grossWeight,
      packageType
    });

    // Every package gets a companion booking up front - it starts out with
    // just a bookingId and "Cargo Requested" status, and gets its shipment
    // details filled in later via PATCH /api/bookings/package/:packageId.
    const booking = await bookingModel.createInitialBooking(pkg._id, pkg.orderId);

    return res.status(201).json({
      status: 'success',
      data: { package: pkg, booking }
    });
  } catch (error) {
    console.error('Error creating package:', error);
    return res.status(500).json({
      status: 'error',
      message: 'An unexpected error occurred while creating the package.'
    });
  }
}

/**
 * Retrieve all packages, optionally filtered by orderId query param.
 */
async function getPackages(req, res) {
  try {
    const { orderId } = req.query;
    const packages = orderId
      ? await packageModel.findPackagesByOrderId(orderId)
      : await packageModel.findAllPackages();

    return res.status(200).json({
      status: 'success',
      data: { packages }
    });
  } catch (error) {
    console.error('Error fetching packages:', error);
    return res.status(500).json({
      status: 'error',
      message: 'An unexpected error occurred while retrieving packages.'
    });
  }
}

/**
 * Retrieve a single package by id.
 */
async function getPackageById(req, res) {
  try {
    const pkg = await packageModel.findPackageById(req.params.id);
    if (!pkg) {
      return res.status(404).json({
        status: 'error',
        message: 'Package not found.'
      });
    }

    return res.status(200).json({
      status: 'success',
      data: { package: pkg }
    });
  } catch (error) {
    console.error('Error fetching package:', error);
    return res.status(500).json({
      status: 'error',
      message: 'An unexpected error occurred while retrieving the package.'
    });
  }
}

/**
 * Recommend a freight forwarder for a package based on its packaging details.
 */
async function recommendForwarderForPackage(req, res) {
  try {
    const pkg = await packageModel.findPackageById(req.params.id);
    if (!pkg) {
      return res.status(404).json({
        status: 'error',
        message: 'Package not found.'
      });
    }

    const recommendation = await recommendForwarder(pkg);

    return res.status(200).json({
      status: 'success',
      data: { recommendation }
    });
  } catch (error) {
    console.error('Error recommending forwarder:', error);
    return res.status(500).json({
      status: 'error',
      message: 'An unexpected error occurred while generating a forwarder recommendation.'
    });
  }
}

/**
 * Recommend a shipment mode (Air/Ocean/Road/Rail) for a package based on its
 * packaging details and the parent order's timing/incoterm/route context.
 */
async function recommendModeForPackage(req, res) {
  try {
    const pkg = await packageModel.findPackageById(req.params.id);
    if (!pkg) {
      return res.status(404).json({
        status: 'error',
        message: 'Package not found.'
      });
    }

    const order = await orderModel.findOrderById(pkg.orderId);

    // Look at this buyer's past bookings (across their other orders) so the
    // recommendation can use their prior mode choices as a tie-breaker, and
    // so we can surface the full details of the most recently used booking.
    const buyerOrders = order?.buyerDetails?.name
      ? await orderModel.findOrdersByBuyerName(order.buyerDetails.name)
      : [];
    const buyerBookings = buyerOrders.length
      ? await bookingModel.findBookingsByOrderIds(buyerOrders.map((o) => o._id))
      : [];
    const priorBookings = buyerBookings
      .filter((b) => String(b.packageId) !== String(pkg._id) && b.shipmentMode)
      .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    const lastUsedMode = priorBookings[0] || null;

    // If the buyer already has a mode set on this package (picked earlier via
    // this same endpoint, or overridden via PATCH /mode) and it was already
    // evaluated before, reuse that cached reasoning instead of asking the AI
    // again and returning a suggestion that contradicts the active mode.
    const cachedEvaluation = pkg.shipmentMode
      ? (pkg.modeRecommendationHistory || [])
        .filter((entry) => entry.recommendedMode === pkg.shipmentMode)
        .sort((a, b) => new Date(b.recommendedAt) - new Date(a.recommendedAt))[0]
      : null;

    const recommendation = cachedEvaluation || await recommendShipmentMode(pkg, order, priorBookings);
    const updatedPkg = cachedEvaluation
      ? pkg
      : await packageModel.saveModeRecommendation(pkg._id, recommendation);

    return res.status(200).json({
      status: 'success',
      data: { recommendation, shipmentMode: updatedPkg.shipmentMode, lastUsedMode }
    });
  } catch (error) {
    console.error('Error recommending shipment mode:', error);
    return res.status(500).json({
      status: 'error',
      message: 'An unexpected error occurred while generating a shipment mode recommendation.'
    });
  }
}

const VALID_SHIPMENT_MODES = ['Air', 'Ocean', 'Road'];

/**
 * Lets the buyer set/override the package's final shipment mode. Overrides
 * whatever the AI recommended. If this exact mode was already evaluated for
 * this package before (e.g. the buyer switching back to an earlier choice),
 * that cached reasoning is reused instead of calling the AI again.
 */
async function updateShipmentMode(req, res) {
  try {
    const { shipmentMode } = req.body;

    if (!VALID_SHIPMENT_MODES.includes(shipmentMode)) {
      return res.status(400).json({
        status: 'error',
        message: `shipmentMode must be one of: ${VALID_SHIPMENT_MODES.join(', ')}.`
      });
    }

    const existingPkg = await packageModel.findPackageById(req.params.id);
    if (!existingPkg) {
      return res.status(404).json({
        status: 'error',
        message: 'Package not found.'
      });
    }

    const cachedEvaluation = (existingPkg.modeRecommendationHistory || [])
      .filter((entry) => entry.recommendedMode === shipmentMode)
      .sort((a, b) => new Date(b.recommendedAt) - new Date(a.recommendedAt))[0];

    let pkg;
    if (cachedEvaluation) {
      pkg = await packageModel.selectShipmentMode(existingPkg._id, shipmentMode);
    } else {
      const order = await orderModel.findOrderById(existingPkg.orderId);
      const evaluation = await evaluateShipmentMode(existingPkg, order, shipmentMode);
      pkg = await packageModel.setShipmentMode(existingPkg._id, shipmentMode, evaluation);
    }

    return res.status(200).json({
      status: 'success',
      data: { package: pkg, reusedCachedRecommendation: Boolean(cachedEvaluation) }
    });
  } catch (error) {
    console.error('Error updating shipment mode:', error);
    return res.status(500).json({
      status: 'error',
      message: 'An unexpected error occurred while updating the shipment mode.'
    });
  }
}

module.exports = {
  createPackage,
  getPackages,
  getPackageById,
  recommendForwarderForPackage,
  recommendModeForPackage,
  updateShipmentMode
};
