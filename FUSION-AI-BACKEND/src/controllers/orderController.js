const orderModel = require('../models/orderModel');

/**
 * Create a new order.
 */
async function createOrder(req, res) {
  try {
    const {
      orderID,
      orderNumber,
      createDate,
      status,
      lastUpdate,
      lastUpdatedDate,
      deliveryDate,
      incoterm,
      incotermText,
      hazmats,
      purchasingGroup,
      buyerPlant,
      materialGroup,
      materialDescription,
      buyerDetails,
      supplierDetails,
      quantity,
      netPrice,
      totalPrice,
      origin,
      destination,
      orderItems
    } = req.body;

    if (!orderNumber || !createDate || !status) {
      return res.status(400).json({
        status: 'error',
        message: 'orderNumber, createDate, and status are required.'
      });
    }

    if (!buyerDetails?.name) {
      return res.status(400).json({
        status: 'error',
        message: 'buyerDetails.name is required.'
      });
    }

    if (!supplierDetails?.name) {
      return res.status(400).json({
        status: 'error',
        message: 'supplierDetails.name is required.'
      });
    }

    const order = await orderModel.createOrder({
      orderID,
      orderNumber,
      createDate,
      status,
      lastUpdate,
      lastUpdatedDate,
      deliveryDate,
      incoterm,
      incotermText,
      hazmats,
      purchasingGroup,
      buyerPlant,
      materialGroup,
      materialDescription,
      buyerDetails,
      supplierDetails,
      quantity,
      netPrice,
      totalPrice,
      origin,
      destination,
      orderItems
    });

    return res.status(201).json({
      status: 'success',
      data: { order }
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({
        status: 'error',
        message: 'An order with this id/orderNumber already exists.'
      });
    }
    console.error('Error creating order:', error);
    return res.status(500).json({
      status: 'error',
      message: 'An unexpected error occurred while creating the order.'
    });
  }
}

/**
 * Retrieve all orders.
 */
async function getOrders(req, res) {
  try {
    const orders = await orderModel.findAllOrders(
      'orderNumber status createDate deliveryDate lastUpdatedDate'
    );
    return res.status(200).json({
      status: 'success',
      data: { orders }
    });
  } catch (error) {
    console.error('Error fetching orders:', error);
    return res.status(500).json({
      status: 'error',
      message: 'An unexpected error occurred while retrieving orders.'
    });
  }
}

/**
 * Retrieve a single order by id.
 */
async function getOrderById(req, res) {
  try {
    const order = await orderModel.findOrderById(req.params.id);
    if (!order) {
      return res.status(404).json({
        status: 'error',
        message: 'Order not found.'
      });
    }

    return res.status(200).json({
      status: 'success',
      data: { order }
    });
  } catch (error) {
    console.error('Error fetching order:', error);
    return res.status(500).json({
      status: 'error',
      message: 'An unexpected error occurred while retrieving the order.'
    });
  }
}

module.exports = {
  createOrder,
  getOrders,
  getOrderById
};
