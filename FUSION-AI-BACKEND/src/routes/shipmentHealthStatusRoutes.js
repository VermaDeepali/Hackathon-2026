const express = require('express');
const router = express.Router();
const shipmentHealthStatusController = require('../controllers/shipmentHealthStatusController');

// GET /api/shipment-health-statuses - Retrieve all shipment health status records
router.get('/', shipmentHealthStatusController.getShipmentHealthStatuses);

// GET /api/shipment-health-statuses/:shipmentId - Retrieve a single record by shipmentId
router.get('/:shipmentId', shipmentHealthStatusController.getShipmentHealthStatusById);

module.exports = router;
