const express = require('express');
const router = express.Router();
const forwarderController = require('../controllers/forwarderController');

// GET /api/forwarders - Retrieve all candidate forwarders
router.get('/', forwarderController.getForwarders);

module.exports = router;
