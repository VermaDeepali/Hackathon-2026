const { getOpenRouterClient } = require('./openrouterClient');

const DEFAULT_MODEL = 'anthropic/claude-opus-4.8';

/**
 * Parses a "DD/MM/YYYY" date string into a Date, or null if unparseable.
 */
function parseDate(value) {
  if (!value) return null;
  const match = String(value).trim().match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
  if (!match) return null;
  const [, day, month, year] = match;
  const date = new Date(Number(year), Number(month) - 1, Number(day));
  return Number.isNaN(date.getTime()) ? null : date;
}

/**
 * Computes how many whole days sit between the cargo-ready date and the
 * delivery date, so urgency is a concrete number rather than something the
 * model has to infer from raw date strings.
 */
function daysUntilDelivery(cargoReady, deliveryDate) {
  const ready = parseDate(cargoReady);
  const delivery = parseDate(deliveryDate);
  if (!ready || !delivery) return null;
  return Math.round((delivery.getTime() - ready.getTime()) / (1000 * 60 * 60 * 24));
}

/**
 * Builds the "computed signals" block shared by both prompts, grounding the
 * mode decision in concrete weight/dimension/urgency numbers instead of raw
 * strings the model would otherwise have to parse itself.
 */
function buildComputedSignals(packageData, order) {
  const days = daysUntilDelivery(packageData.cargoReady, order?.deliveryDate);
  const urgencyLine = days === null
    ? '- Days between cargo-ready and delivery: unknown (could not parse dates)'
    : `- Days between cargo-ready and delivery: ${days} day(s)${days <= 3 ? ' (URGENT - very tight window)' : days <= 10 ? ' (moderate window)' : ' (wide window)'}`;

  return `Computed signals:
- Gross weight: ${packageData.grossWeight || 'unknown'}
- Dimensions: ${packageData.dimensions || 'unknown'}
${urgencyLine}`;
}

/**
 * Builds the "route addresses" block: the order's origin and destination
 * addresses, so the model can suggest the nearest suitable port at each end.
 */
function buildRouteAddresses(order) {
  const originAddress = order?.origin || 'unknown';
  const destinationAddress = order?.destination || 'unknown';

  return `Route addresses:
- Origin address (shipment origin): ${originAddress}
- Destination address (shipment destination): ${destinationAddress}`;
}

/**
 * Builds a short summary of the buyer's past bookings (most recent first),
 * used as a secondary tie-breaker signal in the prompt.
 * @param {object[]} priorBookings - past bookings for this buyer, most recent first
 */
function buildBuyerHistory(priorBookings) {
  if (!priorBookings || priorBookings.length === 0) {
    return 'Buyer history: no prior bookings on record for this buyer.';
  }

  const lines = priorBookings.slice(0, 5).map((booking) => {
    const date = booking.created_at ? new Date(booking.created_at).toISOString().slice(0, 10) : 'unknown date';
    return `- ${booking.shipmentMode} (booking ${booking._id}, ${date})`;
  });

  return `Buyer history (most recent first, for tie-breaking only - never overrides the three deciding factors):\n${lines.join('\n')}`;
}

/**
 * Asks an LLM (via OpenRouter) to recommend a shipment mode (Air/Ocean/Road/
 * Rail) for a package, given its packaging details and the parent order's
 * timing/incoterm/route context.
 * @param {object} packageData - a package document (dimensions, grossWeight, cargoReady, etc.)
 * @param {object} order - the parent order document (incoterm, origin, destination, deliveryDate, etc.)
 * @param {object[]} [priorBookings] - this buyer's past bookings, most recent first
 * @returns {Promise<object>} { recommendedMode, confidence, reasoning }
 */
async function recommendShipmentMode(packageData, order, priorBookings) {
  const client = getOpenRouterClient();

  const { packageType, quantity, quantityToShip } = packageData;
  const { incoterm, incotermText } = order || {};

  const userPrompt = `Recommend the best shipment mode for this booking. The decision must be based on exactly three factors: package dimensions, package weight, and urgency (derived from how many days sit between the cargo-ready date and the delivery date).

${buildComputedSignals(packageData, order)}

${buildBuyerHistory(priorBookings)}

${buildRouteAddresses(order)}

Other context (for reference only, not a deciding factor):
- Package type: ${packageType || 'unknown'}
- Quantity: ${quantity || 'unknown'}
- Quantity to ship: ${quantityToShip || 'unknown'}
- Incoterm: ${incoterm || 'unknown'}${incotermText ? ` (${incotermText})` : ''}

Rules:
- A tight window (few days between cargo-ready and delivery) favors Air, regardless of weight, since it is the fastest mode.
- Heavy or bulky cargo with a wide window favors Ocean (or Road for short/regional routes) for cost efficiency.
- Only use buyer history to break a genuine tie between two otherwise-equally-good modes; the three deciding factors always take priority over past choices.
- Cite the actual computed day count and weight/dimensions in your reasoning.
- Once you've picked the mode, suggest the single nearest suitable port for it at each end: a seaport for Ocean, an airport for Air, or the nearest road border crossing/freight hub for Road. The origin port must be near the origin address; the destination port must be near the destination address.

Respond with ONLY a JSON object (no markdown fences, no commentary) matching this exact shape:
{
  "recommendedMode": "Air" | "Ocean" | "Road",
  "confidence": "low" | "medium" | "high",
  "reasoning": [
    "Urgency: one sentence citing the actual day count and what it implies",
    "Weight: one sentence citing the actual weight and what it implies",
    "Dimensions: one sentence citing the actual dimensions/volume and what it implies"
  ],
  "originPort": "name of the nearest suitable port/hub to the origin address",
  "destinationPort": "name of the nearest suitable port/hub to the destination address"
}`;

  const completion = await client.chat.completions.create({
    model: process.env.OPENROUTER_MODEL || DEFAULT_MODEL,
    max_tokens: 512,
    response_format: { type: 'json_object' },
    messages: [{ role: 'user', content: userPrompt }]
  });

  const content = completion.choices?.[0]?.message?.content;
  if (!content) {
    throw new Error('No response content received from the recommendation model.');
  }

  return JSON.parse(stripCodeFences(content));
}

/**
 * Asks an LLM to explain/evaluate a shipment mode the buyer has chosen
 * themselves (overriding the AI's own pick), so the reasoning shown always
 * matches whichever mode is currently selected.
 * @param {object} packageData - a package document (dimensions, grossWeight, cargoReady, etc.)
 * @param {object} order - the parent order document (incoterm, origin, destination, deliveryDate, etc.)
 * @param {string} mode - 'Air' | 'Ocean' | 'Road'
 * @returns {Promise<object>} { recommendedMode, confidence, reasoning }
 */
async function evaluateShipmentMode(packageData, order, mode) {
  const client = getOpenRouterClient();

  const { packageType, quantity, quantityToShip } = packageData;
  const { incoterm, incotermText } = order || {};

  const userPrompt = `The buyer has chosen "${mode}" as the shipment mode for this booking, overriding any earlier suggestion. Evaluate this choice based on exactly three factors: package dimensions, package weight, and urgency (derived from how many days sit between the cargo-ready date and the delivery date).

${buildComputedSignals(packageData, order)}

${buildRouteAddresses(order)}

Other context (for reference only, not a deciding factor):
- Package type: ${packageType || 'unknown'}
- Quantity: ${quantity || 'unknown'}
- Quantity to ship: ${quantityToShip || 'unknown'}
- Incoterm: ${incoterm || 'unknown'}${incotermText ? ` (${incotermText})` : ''}

Explain why "${mode}" does or doesn't fit this shipment, citing the actual computed day count and weight/dimensions. Do not suggest a different mode - only evaluate the one given.

Also suggest the single nearest suitable port for "${mode}" at each end: a seaport for Ocean, an airport for Air, or the nearest road border crossing/freight hub for Road. The origin port must be near the origin address; the destination port must be near the destination address.

Respond with ONLY a JSON object (no markdown fences, no commentary) matching this exact shape:
{
  "recommendedMode": "${mode}",
  "confidence": "low" | "medium" | "high",
  "reasoning": [
    "Urgency: one sentence citing the actual day count and what it implies for this mode",
    "Weight: one sentence citing the actual weight and what it implies for this mode",
    "Dimensions: one sentence citing the actual dimensions/volume and what it implies for this mode"
  ],
  "originPort": "name of the nearest suitable port/hub to the origin address",
  "destinationPort": "name of the nearest suitable port/hub to the destination address"
}`;

  const completion = await client.chat.completions.create({
    model: process.env.OPENROUTER_MODEL || DEFAULT_MODEL,
    max_tokens: 512,
    response_format: { type: 'json_object' },
    messages: [{ role: 'user', content: userPrompt }]
  });

  const content = completion.choices?.[0]?.message?.content;
  if (!content) {
    throw new Error('No response content received from the recommendation model.');
  }

  return JSON.parse(stripCodeFences(content));
}

function stripCodeFences(text) {
  const trimmed = text.trim();
  const fenced = trimmed.match(/^```(?:json)?\s*([\s\S]*?)\s*```$/i);
  return fenced ? fenced[1] : trimmed;
}

module.exports = { recommendShipmentMode, evaluateShipmentMode };
