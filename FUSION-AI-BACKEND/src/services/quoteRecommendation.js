const { getOpenRouterClient } = require('./openrouterClient');
const forwarderModel = require('../models/forwarderModel');

const DEFAULT_MODEL = 'anthropic/claude-opus-4.8';

/**
 * Asks an LLM (via OpenRouter) to compare all forwarder quote responses on a
 * quotation and recommend the one with the best overall balance of price,
 * transit time, and reliability - not just the cheapest.
 * @param {object[]} quotes - quotation.quotes (forwarderId, liner, priceQuoted, departureDate, transitTime, quoteValidity, reliability, name, status)
 * @returns {Promise<object>} { recommendedForwarderId, confidence, score, headline, summary, tags, reasoning, alternatives }
 */
async function recommendQuote(quotes) {
  const client = getOpenRouterClient();
  const forwarders = await forwarderModel.findAllForwarders();
  const forwarderNameById = Object.fromEntries(forwarders.map((f) => [f.id, f.name]));

  const quotesForPrompt = quotes.map((q) => ({
    forwarderId: q.forwarderId,
    forwarderName: forwarderNameById[q.forwarderId] || 'unknown',
    liner: q.liner || 'unknown',
    priceQuoted: q.priceQuoted ?? 'unknown',
    departureDate: q.departureDate || 'unknown',
    transitTime: q.transitTime || 'unknown',
    quoteValidity: q.quoteValidity || 'unknown',
    reliability: q.reliability ?? 'unknown'
  }));

  const userPrompt = `Recommend the best forwarder quote to accept from the options below. Weigh price, transit time, and reliability (on-time %) together - do not just pick the cheapest or the fastest in isolation. Also briefly evaluate every other option as an alternative.

Quotes:
${JSON.stringify(quotesForPrompt, null, 2)}

Respond with ONLY a JSON object (no markdown fences, no commentary) matching this exact shape:
{
  "recommendedForwarderId": string,
  "confidence": "low" | "medium" | "high",
  "score": number (0-100, overall confidence score),
  "headline": "Accept <forwarder name>",
  "summary": "one short sentence on why this is the best overall balance",
  "tags": {
    "name": string (the recommended forwarder's name),
    "liner": string,
    "price": number,
    "departureDate": string,
    "transit": string,
    "reliability": string
  },
  "reasoning": [
    "one sentence on how this option compares on price",
    "one sentence on how this option compares on speed/transit time",
    "one sentence on how this option compares on reliability, calling out risk if the cheapest/fastest option has a reliability concern"
  ],
  "alternatives": [
    {
      "forwarderId": string,
      "name": string (this forwarder's name),
      "liner": string,
      "price": number,
      "departureDate": string,
      "transit": string,
      "reliability": string,
      "reason": "one short sentence on when you'd pick this one instead (e.g. fastest transit, cheapest, reliability risk)"
    }
  ]
}
"alternatives" must include every quote except the recommended one, in the same order they were given.`;

  const completion = await client.chat.completions.create({
    model: process.env.OPENROUTER_MODEL || DEFAULT_MODEL,
    max_tokens: 1280,
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

module.exports = { recommendQuote };
