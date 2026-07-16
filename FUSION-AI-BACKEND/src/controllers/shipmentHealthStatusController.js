const shipmentHealthStatusModel = require('../models/shipmentHealthStatusModel');

/**
 * Retrieve all shipment health status records.
 */
async function getShipmentHealthStatuses(req, res) {
  try {
    const shipmentHealthStatuses = await shipmentHealthStatusModel.findAllShipmentHealthStatuses();
    return res.status(200).json({
      status: 'success',
      data: { shipmentHealthStatuses }
    });
  } catch (error) {
    console.error('Error fetching shipment health statuses:', error);
    return res.status(500).json({
      status: 'error',
      message: 'An unexpected error occurred while retrieving shipment health statuses.'
    });
  }
}

/**
 * Retrieve a single shipment health status record by shipmentId.
 */
async function getShipmentHealthStatusById(req, res) {
  try {
    const shipmentHealthStatus = await shipmentHealthStatusModel.findShipmentHealthStatusByShipmentId(req.params.shipmentId);
    if (!shipmentHealthStatus) {
      return res.status(404).json({
        status: 'error',
        message: 'Shipment health status not found.'
      });
    }

    return res.status(200).json({
      status: 'success',
      data: { shipmentHealthStatus }
    });
  } catch (error) {
    console.error('Error fetching shipment health status:', error);
    return res.status(500).json({
      status: 'error',
      message: 'An unexpected error occurred while retrieving the shipment health status.'
    });
  }
}

module.exports = {
  getShipmentHealthStatuses,
  getShipmentHealthStatusById
};
