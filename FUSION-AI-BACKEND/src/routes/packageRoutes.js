const express = require('express');
const router = express.Router();
const packageController = require('../controllers/packageController');

// POST /api/packages - Create a new package
router.post('/', packageController.createPackage);

// GET /api/packages - Retrieve all packages (optionally ?orderId=...)
router.get('/', packageController.getPackages);

// GET /api/packages/:id - Retrieve a single package by id
router.get('/:id', packageController.getPackageById);

// GET /api/packages/:id/recommend-mode - AI-recommended shipment mode
router.get('/:id/recommend-mode', packageController.recommendModeForPackage);

// PATCH /api/packages/:id/mode - Buyer sets/overrides the final shipment mode
router.patch('/:id/mode', packageController.updateShipmentMode);

// GET /api/packages/:id/recommend-forwarder - AI-recommended freight forwarder
router.get('/:id/recommend-forwarder', packageController.recommendForwarderForPackage);

module.exports = router;
