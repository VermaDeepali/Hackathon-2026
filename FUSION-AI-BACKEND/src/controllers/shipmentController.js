const shipmentModel = require('../models/shipmentModel');
const bookingModel = require('../models/bookingModel');
const orderModel = require('../models/orderModel');

/**
 * Create a new shipment for a booking. Mode, shipmentType, typeOfMove,
 * bookingType, incoterm, and containerType default to whatever's already on
 * the booking, but can each be supplied directly in the request body
 * instead - useful when creating the shipment and its details in one call
 * rather than patching the booking first. packageId/orderId are carried
 * over from the booking automatically.
 */
async function createShipment(req, res) {
  try {
    const {
      bookingId,
      mode,
      shipmentType,
      typeOfMove,
      bookingType,
      incoterm,
      containerType,
      estimatedETA
    } = req.body;

    if (!bookingId) {
      return res.status(400).json({
        status: 'error',
        message: 'bookingId is required.'
      });
    }

    const booking = await bookingModel.findBookingById(bookingId);
    if (!booking) {
      return res.status(404).json({
        status: 'error',
        message: 'Booking not found.'
      });
    }

    const shipment = await shipmentModel.createShipment({
      shipmentNumber: shipmentModel.generateShipmentNumber(),
      bl: shipmentModel.generateBL(),
      packageId: booking.packageId,
      bookingId: booking._id,
      orderId: booking.orderId,
      orderNumber: booking.orderNumber,
      mode: mode || booking.shipmentMode,
      shipmentType: shipmentType || booking.shipmentType,
      typeOfMove: typeOfMove || booking.typeOfMove,
      bookingType: bookingType || booking.bookingType,
      incoterm: incoterm || booking.incoterm,
      containerType: containerType || booking.containerType,
      estimatedETA
    });

    await bookingModel.updateBookingDetails(booking._id, { status: 'Shipment Created' });

    return res.status(201).json({
      status: 'success',
      data: { shipment }
    });
  } catch (error) {
    console.error('Error creating shipment:', error);
    return res.status(500).json({
      status: 'error',
      message: 'An unexpected error occurred while creating the shipment.'
    });
  }
}

/**
 * Retrieve all shipments, optionally filtered by packageId query param.
 */
async function getShipments(req, res) {
  try {
    const { packageId } = req.query;
    const shipments = packageId
      ? await shipmentModel.findShipmentsByPackageId(packageId)
      : await shipmentModel.findAllShipments();

    const enrichedShipments = await Promise.all(shipments.map(async (shipment) => {
      let { orderNumber } = shipment;
      if (!orderNumber) {
        const order = await orderModel.findOrderById(shipment.orderId);
        orderNumber = order?.orderNumber || null;
      }
      return { ...shipment, orderNumber };
    }));

    return res.status(200).json({
      status: 'success',
      data: { shipments: enrichedShipments }
    });
  } catch (error) {
    console.error('Error fetching shipments:', error);
    return res.status(500).json({
      status: 'error',
      message: 'An unexpected error occurred while retrieving shipments.'
    });
  }
}

/**
 * Retrieve a single shipment by id.
 */
async function getShipmentById(req, res) {
  try {
    const shipment = await shipmentModel.findShipmentById(req.params.id);
    if (!shipment) {
      return res.status(404).json({
        status: 'error',
        message: 'Shipment not found.'
      });
    }

    let { orderNumber } = shipment;
    if (!orderNumber) {
      const order = await orderModel.findOrderById(shipment.orderId);
      orderNumber = order?.orderNumber || null;
    }

    return res.status(200).json({
      status: 'success',
      data: { shipment: { ...shipment, orderNumber } }
    });
  } catch (error) {
    console.error('Error fetching shipment:', error);
    return res.status(500).json({
      status: 'error',
      message: 'An unexpected error occurred while retrieving the shipment.'
    });
  }
}

module.exports = {
  createShipment,
  getShipments,
  getShipmentById
};
