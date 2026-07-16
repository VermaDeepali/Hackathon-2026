const forwarderModel = require('../models/forwarderModel');
const { FORWARDERS } = require('../data/forwarders');

/**
 * Seeds the database with the candidate forwarders if they do not already
 * exist. Existing forwarders are left untouched so server restarts don't
 * overwrite data that has since changed via the app/API.
 */
async function seedForwarders() {
  for (const forwarderData of FORWARDERS) {
    const existing = await forwarderModel.findForwarderByName(forwarderData.name);
    if (!existing) {
      await forwarderModel.createForwarder(forwarderData);
      console.log(`Seeded forwarder ${forwarderData.name}`);
    }
  }
}

module.exports = { seedForwarders };
