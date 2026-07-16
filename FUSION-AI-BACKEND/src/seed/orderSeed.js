// const orderModel = require('../models/orderModel');

// const sampleOrders = [
//   {
//     _id: 'deep-1234-1234',
//     orderNumber: 'deep-1234-1234',
//     createDate: '16/04/2026',
//     status: 'Packed',
//     lastUpdate: '04/07/2026',
//     deliveryDate: '20/06/2026',
//     incoterm: 'FOB',
//     incotermText: 'FOB',
//     purchasingGroup: 'N15 - Olvera Mendez',
//     buyerPlant: 'CORPO',
//     materialGroup: 'ALB50',
//     materialDescription: 'High-grade aluminum sheet',
//     buyerDetails: {
//       name: 'Superstar QA Pvt.Ltd.',
//       division: 'CORPO',
//       contact: 'CORPO',
//       address: 'Indios Verdes 286, Evolucion, 57700 Cdad. Nezahualcóyotl, Méx., Mexico',
//       origin: 'Mexico City, Mexico'
//     },
//     supplierDetails: {
//       name: 'Multi Packers Pvt.Ltd',
//       code: 'SUPP1347',
//       location: 'Bengaluru, Karnataka, India, IN',
//       contact: 'SUPP1347',
//       destination: 'Bengaluru, Karnataka, India'
//     },
//     quantity: '1200 kg',
//     netPrice: '0.96 USD',
//     totalPrice: '1,152.00 USD',
//     origin: 'Mexico City, Mexico',
//     destination: 'Bengaluru, Karnataka, India',
//     orderItems: [
//       {
//         itemNumber: 1,
//         materialId: 'M1',
//         materialGroup: 'ALB50',
//         quantity: '50.789',
//         uom: '%',
//         totalPrice: '0.96 USD',
//         expectedCargoReady: '18/06/2026',
//         deliveryDate: '20/06/2026',
//         status: 'Packed'
//       },
//     ]
//   },
//   {
//     _id: '430009098098',
//     orderNumber: '430009098098',
//     createDate: '16/04/2026',
//     status: 'Partially Booked',
//     lastUpdate: '03/07/2026',
//     deliveryDate: '25/07/2026',
//     incoterm: 'CIF',
//     incotermText: 'CIF',
//     hazmats: '4',
//     purchasingGroup: 'N15 - Olvera Mendez',
//     buyerPlant: 'CORPO',
//     materialGroup: 'ALB40',
//     materialDescription: 'Precision-cut steel coil',
//     buyerDetails: {
//       name: 'Superstar QA Pvt.Ltd.',
//       division: 'CORPO',
//       contact: 'CORPO',
//       address: 'Indios Verdes 286, Evolucion, 57700 Cdad. Nezahualcóyotl, Méx., Mexico',
//       origin: 'Mexico City, Mexico'
//     },
//     supplierDetails: {
//       name: 'Multi Packers Pvt.Ltd',
//       code: 'SUPP1347',
//       location: 'Bengaluru, Karnataka, India, IN',
//       contact: 'SUPP1347',
//       destination: 'Bengaluru, Karnataka, India'
//     },
//     quantity: '580 pcs',
//     netPrice: '186.98 USD',
//     totalPrice: '108,430.00 USD',
//     origin: 'Mexico City, Mexico',
//     destination: 'Bengaluru, Karnataka, India',
//     orderItems: []
//   },
//   {
//     _id: 'DEV-OK-025',
//     orderNumber: 'DEV-OK-025',
//     createDate: '03/07/2026',
//     status: 'Partially Shipped',
//     lastUpdate: '03/07/2026',
//     deliveryDate: '20/07/2026',
//     incoterm: 'EXW',
//     incotermText: 'EXW',
//     purchasingGroup: 'N15 - Olvera Mendez',
//     buyerPlant: 'CORPO',
//     materialGroup: 'ALB50',
//     materialDescription: 'Engineered composite blocks',
//     buyerDetails: {
//       name: 'Superstar QA Pvt.Ltd.',
//       division: 'CORPO',
//       contact: 'CORPO',
//       address: 'Indios Verdes 286, Evolucion, 57700 Cdad. Nezahualcóyotl, Méx., Mexico',
//       origin: 'Mexico City, Mexico'
//     },
//     supplierDetails: {
//       name: 'Multi Packers Pvt.Ltd',
//       code: 'SUPP1347',
//       location: 'Bengaluru, Karnataka, India, IN',
//       contact: 'SUPP1347',
//       destination: 'Bengaluru, Karnataka, India'
//     },
//     quantity: '310 units',
//     netPrice: '58.70 USD',
//     totalPrice: '18,197.00 USD',
//     origin: 'Mexico City, Mexico',
//     destination: 'Bengaluru, Karnataka, India',
//     orderItems: [
//       {
//         itemNumber: 1,
//         materialId: 'M10',
//         materialGroup: 'ALB50',
//         quantity: '100',
//         uom: 'pcs',
//         totalPrice: '5,870.00 USD',
//         expectedCargoReady: '10/07/2026',
//         deliveryDate: '20/07/2026',
//         status: 'Packed'
//       }
//     ]
//   },
//   {
//     _id: 'qwertyiop',
//     orderNumber: 'qwertyiop',
//     createDate: '16/04/2026',
//     status: 'Partially Shipped',
//     lastUpdate: '02/07/2026',
//     deliveryDate: '15/07/2026',
//     incoterm: 'DAP',
//     incotermText: 'DAP',
//     purchasingGroup: 'N15 - Olvera Mendez',
//     buyerPlant: 'CORPO',
//     materialGroup: 'ALB45',
//     materialDescription: 'Premium copper tubing',
//     buyerDetails: {
//       name: 'Superstar QA Pvt.Ltd.',
//       division: 'CORPO',
//       contact: 'CORPO',
//       address: 'Indios Verdes 286, Evolucion, 57700 Cdad. Nezahualcóyotl, Méx., Mexico',
//       origin: 'Mexico City, Mexico'
//     },
//     supplierDetails: {
//       name: 'Multi Packers Pvt.Ltd',
//       code: 'SUPP1347',
//       location: 'Bengaluru, Karnataka, India, IN',
//       contact: 'SUPP1347',
//       destination: 'Bengaluru, Karnataka, India'
//     },
//     quantity: '810 m',
//     netPrice: '34.50 USD',
//     totalPrice: '27,945.00 USD',
//     origin: 'Mexico City, Mexico',
//     destination: 'Bengaluru, Karnataka, India',
//     orderItems: []
//   },
//   {
//     _id: 'QA-TEST-00147',
//     orderNumber: 'QA-TEST-00147',
//     createDate: '16/02/2026',
//     status: 'Partially Shipped',
//     lastUpdate: '01/07/2026',
//     deliveryDate: '24/02/2026',
//     incoterm: 'FCA',
//     incotermText: 'FCA',
//     purchasingGroup: 'N15 - Olvera Mendez',
//     buyerPlant: 'CORPO',
//     materialGroup: 'ALB50',
//     materialDescription: 'Industrial fastener kits',
//     buyerDetails: {
//       name: 'Superstar QA Pvt.Ltd.',
//       division: 'CORPO',
//       contact: 'CORPO',
//       address: 'Indios Verdes 286, Evolucion, 57700 Cdad. Nezahualcóyotl, Méx., Mexico',
//       origin: 'Mexico City, Mexico'
//     },
//     supplierDetails: {
//       name: 'Multi Packers Pvt.Ltd',
//       code: 'SUPP1347',
//       location: 'Bengaluru, Karnataka, India, IN',
//       contact: 'SUPP1347',
//       destination: 'Bengaluru, Karnataka, India'
//     },
//     quantity: '780 kits',
//     netPrice: '14.25 USD',
//     totalPrice: '11,115.00 USD',
//     origin: 'Mexico City, Mexico',
//     destination: 'Bengaluru, Karnataka, India',
//     orderItems: [
//       {
//         itemNumber: 1,
//         materialId: 'M1',
//         materialGroup: 'ALB50',
//         quantity: '300',
//         uom: 'kits',
//         totalPrice: '4,275.00 USD',
//         expectedCargoReady: '18/02/2026',
//         deliveryDate: '24/02/2026',
//         status: 'Packed'
//       }
//     ]
//   }
// ];

// /**
//  * Seeds the database with sample orders if they do not already exist.
//  * Existing orders are left untouched so server restarts don't overwrite
//  * data that has since changed via the app/API.
//  */
// async function seedOrders() {
//   for (const orderData of sampleOrders) {
//     const existing = await orderModel.findOrderById(orderData._id);
//     if (!existing) {
//       await orderModel.createOrder(orderData);
//       console.log(`Seeded order ${orderData._id}`);
//     }
//   }
// }

// module.exports = { seedOrders };
