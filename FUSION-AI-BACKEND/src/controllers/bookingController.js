const bookingModel = require('../models/bookingModel');
const packageModel = require('../models/packageModel');
const orderModel = require('../models/orderModel');
const quotationModel = require('../models/quotationModel');

const VALID_SHIPMENT_MODES = ['Air', 'Ocean', 'Road'];
const VALID_CONTAINER_TYPES = ['FCL', 'LCL'];

/**
 * Fills in the shipment details (mode, type, addresses, etc.) on the booking
 * that was auto-created alongside a package, once the shipment mode
 * recommendation (or the buyer's override of it) has been accepted.
 */
async function updateBookingByPackage(req, res) {
  try {
    const { packageId } = req.params;
    const {
      shipmentMode,
      shipmentType,
      originAddress,
      destinationAddress,
      containerType
    } = req.body;

    if (!VALID_SHIPMENT_MODES.includes(shipmentMode)) {
      return res.status(400).json({
        status: 'error',
        message: `shipmentMode must be one of: ${VALID_SHIPMENT_MODES.join(', ')}.`
      });
    }

    if (shipmentMode === 'Ocean') {
      if (!VALID_CONTAINER_TYPES.includes(containerType)) {
        return res.status(400).json({
          status: 'error',
          message: `containerType is required for Ocean bookings and must be one of: ${VALID_CONTAINER_TYPES.join(', ')}.`
        });
      }
    } else if (containerType !== undefined) {
      return res.status(400).json({
        status: 'error',
        message: 'containerType only applies to Ocean bookings.'
      });
    }

    const pkg = await packageModel.findPackageById(packageId);
    if (!pkg) {
      return res.status(404).json({
        status: 'error',
        message: 'Package not found.'
      });
    }

    const existingBooking = await bookingModel.findBookingByPackageId(packageId);
    if (!existingBooking) {
      return res.status(404).json({
        status: 'error',
        message: 'No booking found for this package.'
      });
    }

    const booking = await bookingModel.updateBookingDetails(existingBooking._id, {
      shipmentMode,
      shipmentType,
      originAddress,
      destinationAddress,
      containerType: shipmentMode === 'Ocean' ? containerType : undefined
    });

    return res.status(200).json({
      status: 'success',
      data: {
        booking,
        previousModeSuggestions: pkg.modeRecommendationHistory || []
      }
    });
  } catch (error) {
    console.error('Error updating booking:', error);
    return res.status(500).json({
      status: 'error',
      message: 'An unexpected error occurred while updating the booking.'
    });
  }
}

/**
 * Retrieve all bookings, optionally filtered by packageId query param. Each
 * booking is enriched with its order's orderNumber and the forwarder ids
 * from any quotations sent for it.
 */
async function getBookings(req, res) {
  try {
    const { packageId } = req.query;
    const bookings = packageId
      ? await bookingModel.findBookingsByPackageId(packageId)
      : await bookingModel.findAllBookings();

    const allQuotations = await quotationModel.findAllQuotations();
    const forwardersByBookingId = {};
    allQuotations.forEach((quotation) => {
      const key = String(quotation.bookingId);
      const existing = forwardersByBookingId[key] || [];
      forwardersByBookingId[key] = [...new Set([...existing, ...(quotation.forwarders || [])])];
    });

    const enrichedBookings = await Promise.all(bookings.map(async (booking) => {
      let { orderNumber } = booking;
      if (!orderNumber) {
        const order = await orderModel.findOrderById(booking.orderId);
        orderNumber = order?.orderNumber || null;
      }
      return {
        ...booking,
        orderNumber,
        forwarders: forwardersByBookingId[String(booking._id)] || []
      };
    }));

    return res.status(200).json({
      status: 'success',
      data: { bookings: enrichedBookings }
    });
  } catch (error) {
    console.error('Error fetching bookings:', error);
    return res.status(500).json({
      status: 'error',
      message: 'An unexpected error occurred while retrieving bookings.'
    });
  }
}

/**
 * Retrieve a single booking by id.
 */
async function getBookingById(req, res) {
  try {
    const booking = await bookingModel.findBookingById(req.params.id);
    if (!booking) {
      return res.status(404).json({
        status: 'error',
        message: 'Booking not found.'
      });
    }

    let { orderNumber } = booking;
    if (!orderNumber) {
      const order = await orderModel.findOrderById(booking.orderId);
      orderNumber = order?.orderNumber || null;
    }

    return res.status(200).json({
      status: 'success',
      data: {
        booking: {
          ...booking,
          orderNumber
        }
      }
    });
  } catch (error) {
    console.error('Error fetching booking:', error);
    return res.status(500).json({
      status: 'error',
      message: 'An unexpected error occurred while retrieving the booking.'
    });
  }
}

module.exports = {
  updateBookingByPackage,
  getBookings,
  getBookingById
};
