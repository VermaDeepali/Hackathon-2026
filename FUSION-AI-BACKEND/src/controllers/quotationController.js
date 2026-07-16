const quotationModel = require('../models/quotationModel');
const packageModel = require('../models/packageModel');
const bookingModel = require('../models/bookingModel');
const forwarderQuoteModel = require('../models/forwarderQuoteModel');
const { recommendQuote } = require('../services/quoteRecommendation');

const { VALID_MODES } = quotationModel;
const { QUOTE_STATUSES } = forwarderQuoteModel;

/**
 * Create a new quotation (send-quote) request for a package. The booking is
 * resolved from the packageId (every package has exactly one companion
 * booking, created alongside it), so the caller doesn't need to supply it.
 */
async function createQuotation(req, res) {
  try {
    const {
      packageId,
      mode,
      shipmentType,
      typeOfMove,
      incoterm,
      origin,
      destination,
      hazmat,
      packageType,
      numberOfPackages,
      dimensions,
      totalWeight,
      quotationRequiredBy,
      schedulePickUpDateFrom,
      schedulePickUpDateTo,
      lastUpdatedDate,
      forwarders
    } = req.body;

    if (!packageId) {
      return res.status(400).json({
        status: 'error',
        message: 'packageId is required.'
      });
    }

    if (mode !== undefined && !VALID_MODES.includes(mode)) {
      return res.status(400).json({
        status: 'error',
        message: `mode must be one of: ${VALID_MODES.join(', ')}.`
      });
    }

    const pkg = await packageModel.findPackageById(packageId);
    if (!pkg) {
      return res.status(404).json({
        status: 'error',
        message: 'Package not found.'
      });
    }

    const booking = await bookingModel.findBookingByPackageId(packageId);
    if (!booking) {
      return res.status(404).json({
        status: 'error',
        message: 'No booking found for this package.'
      });
    }

    const quotation = await quotationModel.createQuotation({
      packageId,
      bookingId: booking._id,
      mode,
      shipmentType,
      typeOfMove,
      incoterm,
      origin,
      destination,
      hazmat,
      packageType,
      numberOfPackages,
      dimensions,
      totalWeight,
      quotationRequiredBy,
      schedulePickUpDateFrom,
      schedulePickUpDateTo,
      lastUpdatedDate,
      forwarders
    });

    // Carry the shipment-level details from the quote request onto the
    // booking it belongs to, so the booking always reflects the latest quote.
    const updatedBooking = await bookingModel.updateBookingDetails(booking._id, {
      shipmentMode: mode,
      shipmentType,
      typeOfMove,
      incoterm,
      originAddress: origin,
      destinationAddress: destination,
      quotationRequiredBy,
      schedulePickUpDateFrom,
      schedulePickUpDateTo,
      lastUpdatedDate
    });

    return res.status(201).json({
      status: 'success',
      data: { quotation, booking: updatedBooking }
    });
  } catch (error) {
    console.error('Error creating quotation:', error);
    return res.status(500).json({
      status: 'error',
      message: 'An unexpected error occurred while creating the quotation.'
    });
  }
}

/**
 * Retrieve all quotations, optionally filtered by packageId query param.
 */
async function getQuotations(req, res) {
  try {
    const { packageId } = req.query;
    const quotations = packageId
      ? await quotationModel.findQuotationsByPackageId(packageId)
      : await quotationModel.findAllQuotations();
    return res.status(200).json({
      status: 'success',
      data: { quotations }
    });
  } catch (error) {
    console.error('Error fetching quotations:', error);
    return res.status(500).json({
      status: 'error',
      message: 'An unexpected error occurred while retrieving quotations.'
    });
  }
}

/**
 * Retrieve a single quotation by id, along with any forwarder quotes
 * submitted for it.
 */
async function getQuotationById(req, res) {
  try {
    const quotation = await quotationModel.findQuotationById(req.params.id);
    if (!quotation) {
      return res.status(404).json({
        status: 'error',
        message: 'Quotation not found.'
      });
    }

    const quotes = await forwarderQuoteModel.findForwarderQuotesByQuotationId(req.params.id);

    return res.status(200).json({
      status: 'success',
      data: { quotation: { ...quotation, quotes } }
    });
  } catch (error) {
    console.error('Error fetching quotation:', error);
    return res.status(500).json({
      status: 'error',
      message: 'An unexpected error occurred while retrieving the quotation.'
    });
  }
}

/**
 * Record a forwarder's response to a quote request.
 */
async function addQuote(req, res) {
  try {
    const { id } = req.params;
    const {
      forwarderId,
      liner,
      priceQuoted,
      departureDate,
      transitTime,
      quoteValidity,
      reliability,
      name
    } = req.body;

    if (!forwarderId) {
      return res.status(400).json({
        status: 'error',
        message: 'forwarderId is required.'
      });
    }

    const quotation = await quotationModel.findQuotationById(id);
    if (!quotation) {
      return res.status(404).json({
        status: 'error',
        message: 'Quotation not found.'
      });
    }

    const quote = await forwarderQuoteModel.createForwarderQuote({
      quotationId: id,
      forwarderId,
      liner,
      priceQuoted,
      departureDate,
      transitTime,
      quoteValidity,
      reliability,
      name
    });

    return res.status(201).json({
      status: 'success',
      data: { quote }
    });
  } catch (error) {
    console.error('Error adding quote:', error);
    return res.status(500).json({
      status: 'error',
      message: 'An unexpected error occurred while adding the quote.'
    });
  }
}

/**
 * Update a forwarder's quote (e.g. accept it). Setting status to "Selected"
 * automatically rejects every other quote on the same quotation.
 */
async function updateQuote(req, res) {
  try {
    const { id, quoteId } = req.params;
    const { priceQuoted, departureDate, transitTime, quoteValidity, reliability, name, status } = req.body;

    if (status !== undefined && !QUOTE_STATUSES.includes(status)) {
      return res.status(400).json({
        status: 'error',
        message: `status must be one of: ${QUOTE_STATUSES.join(', ')}.`
      });
    }

    const existingQuote = await forwarderQuoteModel.findForwarderQuoteById(quoteId);
    if (!existingQuote || existingQuote.quotationId !== id) {
      return res.status(404).json({
        status: 'error',
        message: 'Quote not found for this quotation.'
      });
    }

    const quote = await forwarderQuoteModel.updateForwarderQuote(quoteId, {
      priceQuoted,
      departureDate,
      transitTime,
      quoteValidity,
      reliability,
      name,
      status
    });

    if (status === 'Selected') {
      await forwarderQuoteModel.rejectOtherQuotes(id, quoteId);
    }

    return res.status(200).json({
      status: 'success',
      data: { quote }
    });
  } catch (error) {
    console.error('Error updating quote:', error);
    return res.status(500).json({
      status: 'error',
      message: 'An unexpected error occurred while updating the quote.'
    });
  }
}

/**
 * AI-recommend which forwarder quote to accept, weighing price, transit
 * time, and reliability together.
 */
async function getQuoteRecommendation(req, res) {
  try {
    const quotation = await quotationModel.findQuotationById(req.params.id);
    if (!quotation) {
      return res.status(404).json({
        status: 'error',
        message: 'Quotation not found.'
      });
    }

    const quotes = await forwarderQuoteModel.findForwarderQuotesByQuotationId(req.params.id);
    if (quotes.length === 0) {
      return res.status(400).json({
        status: 'error',
        message: 'This quotation has no forwarder quotes to compare yet.'
      });
    }

    const recommendation = await recommendQuote(quotes);

    return res.status(200).json({
      status: 'success',
      data: { recommendation }
    });
  } catch (error) {
    console.error('Error recommending quote:', error);
    return res.status(500).json({
      status: 'error',
      message: 'An unexpected error occurred while generating a quote recommendation.'
    });
  }
}

module.exports = {
  createQuotation,
  getQuotations,
  getQuotationById,
  addQuote,
  updateQuote,
  getQuoteRecommendation
};
