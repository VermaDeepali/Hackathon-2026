const express = require('express');
const router = express.Router();
const bookingController = require('../controllers/bookingController');

// PATCH /api/bookings/package/:packageId - Fill in shipment details on the
// booking that was auto-created alongside a package
router.patch('/package/:packageId', bookingController.updateBookingByPackage);

// GET /api/bookings - Retrieve all bookings (optionally ?packageId=...)
router.get('/', bookingController.getBookings);

// GET /api/bookings/:id - Retrieve a single booking by id
router.get('/:id', bookingController.getBookingById);

module.exports = router;
