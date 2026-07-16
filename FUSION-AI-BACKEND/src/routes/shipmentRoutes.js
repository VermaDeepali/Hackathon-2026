const express = require('express');
const router = express.Router();
const shipmentController = require('../controllers/shipmentController');

// POST /api/shipments - Create a new shipment
router.post('/', shipmentController.createShipment);

// GET /api/shipments - Retrieve all shipments (optionally ?packageId=...)
router.get('/', shipmentController.getShipments);

// GET /api/shipments/:id - Retrieve a single shipment by id
router.get('/:id', shipmentController.getShipmentById);

module.exports = router;
