const forwarderModel = require('../models/forwarderModel');

/**
 * Retrieve all candidate forwarders.
 */
async function getForwarders(req, res) {
  try {
    const forwarders = await forwarderModel.findAllForwarders();
    return res.status(200).json({
      status: 'success',
      data: { forwarders }
    });
  } catch (error) {
    console.error('Error fetching forwarders:', error);
    return res.status(500).json({
      status: 'error',
      message: 'An unexpected error occurred while retrieving forwarders.'
    });
  }
}

module.exports = {
  getForwarders
};
