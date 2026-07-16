const express = require('express');
const router = express.Router();
const quotationController = require('../controllers/quotationController');

// POST /api/quotations - Create a new quotation (send-quote) request
router.post('/', quotationController.createQuotation);

// GET /api/quotations - Retrieve all quotations
router.get('/', quotationController.getQuotations);

// GET /api/quotations/:id - Retrieve a single quotation by id
router.get('/:id', quotationController.getQuotationById);

// POST /api/quotations/:id/quotes - Record a forwarder's quote response
router.post('/:id/quotes', quotationController.addQuote);

// PATCH /api/quotations/:id/quotes/:quoteId - Update/accept a forwarder's quote
router.patch('/:id/quotes/:quoteId', quotationController.updateQuote);

// GET /api/quotations/:id/recommend-quote - AI-recommend which quote to accept
router.get('/:id/recommend-quote', quotationController.getQuoteRecommendation);

module.exports = router;
