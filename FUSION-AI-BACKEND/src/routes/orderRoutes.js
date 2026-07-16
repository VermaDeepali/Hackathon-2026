const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');

// POST /api/orders - Create a new order
router.post('/', orderController.createOrder);

// GET /api/orders - Retrieve all orders
router.get('/', orderController.getOrders);

// GET /api/orders/:id - Retrieve a single order by id
router.get('/:id', orderController.getOrderById);

module.exports = router;
