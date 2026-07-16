const mongoose = require('mongoose');
const orderModel = require('./orderModel');

// Statuses a booking can move through. More will be added as the booking
// lifecycle grows.
const BOOKING_STATUSES = ['Cargo Requested', 'Shipment Created'];

const bookingSchema = new mongoose.Schema({
  // Human-facing booking reference, generated when the booking is first
  // created (alongside its parent package) - not a Mongo _id.
  bookingId: { type: String, required: true, unique: true, trim: true },
  status: { type: String, required: true, trim: true, enum: BOOKING_STATUSES, default: 'Cargo Requested' },
  // Fixed for every booking - always "Primary".
  bookingType: { type: String, trim: true, default: 'Primary' },
  packageId: { type: String, required: true, trim: true },
  orderId: { type: String, required: true, trim: true },
  // Denormalized from the parent order at booking creation time, so it can be
  // returned/filtered on without an extra order lookup on every read.
  orderNumber: { type: String, trim: true },
  // Not known until the shipment mode recommendation (or buyer override) is
  // accepted, which happens after the booking already exists.
  shipmentMode: { type: String, trim: true, enum: ['Air', 'Ocean', 'Road'] },
  shipmentType: { type: String, trim: true },
  // Fixed for every booking - always "Door to Door".
  typeOfMove: { type: String, trim: true, default: 'Door to Door' },
  // Ocean-only: container load type. Not applicable to Air or Road bookings.
  containerType: { type: String, trim: true, enum: ['FCL', 'LCL'] },
  // Fixed for every booking - always "EXW".
  incoterm: { type: String, trim: true, default: 'EXW' },
  originAddress: { type: String, trim: true },
  destinationAddress: { type: String, trim: true },
  quotationRequiredBy: { type: String, trim: true },
  schedulePickUpDateFrom: { type: String, trim: true },
  schedulePickUpDateTo: { type: String, trim: true },
  lastUpdatedDate: { type: String, trim: true }
}, { timestamps: { createdAt: 'created_at', updatedAt: false } });

const Booking = mongoose.model('Booking', bookingSchema);

/**
 * Generates a booking reference: current epoch seconds followed by 8 random
 * digits, e.g. "178315603991851792". Returned as a string since the value
 * exceeds Number.MAX_SAFE_INTEGER.
 * @returns {string}
 */
function generateBookingId() {
  const epochSeconds = Math.floor(Date.now() / 1000).toString();
  const randomSuffix = Math.floor(Math.random() * 1e8).toString().padStart(8, '0');
  return `${epochSeconds}${randomSuffix}`;
}

/**
 * Inserts a new booking into the database.
 * @param {object} bookingData
 * @returns {Promise<object>} The created booking (plain object).
 */
async function createBooking(bookingData) {
  const booking = await Booking.create(bookingData);
  return booking.toObject();
}

/**
 * Creates the initial booking for a freshly-created package: just a
 * bookingId and "Cargo Requested" status, linked to the package/order.
 * Shipment mode and the rest of the details are filled in later.
 * @param {string} packageId
 * @param {string} orderId
 * @returns {Promise<object>} The created booking (plain object).
 */
async function createInitialBooking(packageId, orderId) {
  const order = await orderModel.findOrderById(orderId);
  return createBooking({
    bookingId: generateBookingId(),
    status: 'Cargo Requested',
    packageId,
    orderId,
    orderNumber: order?.orderNumber
  });
}

/**
 * Finds the booking created for a given package.
 * @param {string} packageId
 * @returns {Promise<object|null>}
 */
async function findBookingByPackageId(packageId) {
  return Booking.findOne({ packageId }).lean();
}

/**
 * Updates an existing booking's shipment details (mode, type, addresses,
 * etc.) once they're known.
 * @param {string} id
 * @param {object} updates
 * @returns {Promise<object|null>}
 */
async function updateBookingDetails(id, updates) {
  return Booking.findByIdAndUpdate(
    id,
    { $set: updates },
    { new: true, runValidators: true }
  ).lean();
}

/**
 * Finds a booking by its id.
 * @param {string} id
 * @returns {Promise<object|null>}
 */
async function findBookingById(id) {
  let booking;
  try {
    booking = await Booking.findById(id).lean();
  } catch (error) {
    if (error.name === 'CastError') return null;
    throw error;
  }
  return booking || null;
}

/**
 * Finds all bookings for a given package.
 * @param {string} packageId
 * @returns {Promise<object[]>}
 */
async function findBookingsByPackageId(packageId) {
  return Booking.find({ packageId }).lean();
}

/**
 * Returns all bookings.
 * @returns {Promise<object[]>}
 */
async function findAllBookings() {
  return Booking.find().lean();
}

/**
 * Finds all bookings belonging to any of the given orders, used to look up a
 * buyer's full booking history (mode + all other details) across their other
 * orders.
 * @param {string[]} orderIds
 * @returns {Promise<object[]>}
 */
async function findBookingsByOrderIds(orderIds) {
  return Booking.find({ orderId: { $in: orderIds } }).lean();
}

module.exports = {
  Booking,
  createBooking,
  createInitialBooking,
  findBookingById,
  findBookingByPackageId,
  findBookingsByPackageId,
  findBookingsByOrderIds,
  findAllBookings,
  updateBookingDetails
};
