const OpenAI = require('openai/index.js');

let client = null;

/**
 * Lazily creates an OpenAI-compatible client pointed at OpenRouter, so a
 * missing API key only breaks requests that actually need it, not server
 * startup.
 */
function getOpenRouterClient() {
  if (!process.env.OPENROUTER_API_KEY) {
    throw new Error('OPENROUTER_API_KEY is not set.');
  }
  if (!client) {
    client = new OpenAI({
      baseURL: 'https://openrouter.ai/api/v1',
      apiKey: process.env.OPENROUTER_API_KEY,
      defaultHeaders: {
        'HTTP-Referer': process.env.OPENROUTER_SITE_URL || 'http://localhost:3000',
        'X-Title': process.env.OPENROUTER_SITE_NAME || 'FusionIQ Forwarder Recommendation'
      }
    });
  }
  return client;
}

module.exports = { getOpenRouterClient };
