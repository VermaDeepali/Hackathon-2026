const { getOpenRouterClient } = require('./openrouterClient');
const forwarderModel = require('../models/forwarderModel');

const DEFAULT_MODEL = 'anthropic/claude-opus-4.8';

/**
 * Asks an LLM (via OpenRouter) to recommend a freight forwarder for a
 * package, given its packaging details and a fixed candidate list of
 * well-known forwarders.
 * @param {object} packageData - a package document (dimensions, grossWeight, etc.)
 * @returns {Promise<object>} { recommendedForwarder, confidence, reasoning, alternativeOptions }
 */
async function recommendForwarder(packageData) {
  const client = getOpenRouterClient();
  const forwarders = await forwarderModel.findAllForwarders();

  const {
    materialId,
    quantity,
    dimensions,
    cargoReady,
    quantityToShip,
    grossWeight,
    packageType
  } = packageData;

  const userPrompt = `Recommend the best freight forwarder for this shipment based on its packaging details.

Packaging details:
- Material ID: ${materialId || 'unknown'}
- Quantity: ${quantity || 'unknown'}
- Quantity to ship: ${quantityToShip || 'unknown'}
- Dimensions: ${dimensions || 'unknown'}
- Gross weight: ${grossWeight || 'unknown'}
- Package type: ${packageType || 'unknown'}
- Cargo ready date: ${cargoReady || 'unknown'}

Candidate forwarders:
${JSON.stringify(forwarders, null, 2)}

Pick exactly one recommended forwarder from the candidate list above (use its exact "name"), explain why it best matches this shipment's weight, dimensions, package type, and urgency, and list the other candidates as alternatives with a one-line reason each.

Respond with ONLY a JSON object (no markdown fences, no commentary) matching this exact shape:
{
  "recommendedForwarder": string,
  "confidence": "low" | "medium" | "high",
  "reasoning": string,
  "alternativeOptions": [{ "forwarder": string, "reason": string }]
}`;

  const completion = await client.chat.completions.create({
    model: process.env.OPENROUTER_MODEL || DEFAULT_MODEL,
    max_tokens: 1024,
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

module.exports = { recommendForwarder };
