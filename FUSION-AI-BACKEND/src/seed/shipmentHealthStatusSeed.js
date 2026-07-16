const shipmentHealthStatusModel = require('../models/shipmentHealthStatusModel');
const { SHIPMENT_HEALTH_STATUSES } = require('../data/shipmentHealthStatuses');

/**
 * Seeds the database with the sample shipment health statuses if they do not
 * already exist. Existing records are left untouched so server restarts
 * don't overwrite data that has since changed via the app/API.
 */
async function seedShipmentHealthStatuses() {
  for (const data of SHIPMENT_HEALTH_STATUSES) {
    const existing = await shipmentHealthStatusModel.findShipmentHealthStatusByShipmentId(data.shipmentId);
    if (!existing) {
      await shipmentHealthStatusModel.createShipmentHealthStatus(data);
      console.log(`Seeded shipment health status ${data.shipmentId}`);
    }
  }
}

module.exports = { seedShipmentHealthStatuses };
