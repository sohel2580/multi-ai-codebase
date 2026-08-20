/**
 * AgentCouncil - Dynamic Model Auto-Discovery Engine
 * Fetches all available live models from OpenRouter, Groq, Bynara endpoints
 */
const https = require('https');
const http = require('http');

async function fetchProviderModels(provider, apiKey, endpoint) {
  return new Promise((resolve) => {
    let urlStr = '';
    const headers = { 'User-Agent': 'AgentCouncil-VSCode-1.3.0' };

    if (provider === 'openrouter') {
      urlStr = 'https://openrouter.ai/api/v1/models';
      if (apiKey) headers['Authorization'] = `Bearer ${apiKey}`;
    } else if (provider === 'groq') {
      urlStr = 'https://api.groq.com/openai/v1/models';
      if (apiKey) headers['Authorization'] = `Bearer ${apiKey}`;
    } else if (provider === 'bynara') {
      urlStr = endpoint || 'https://router.bynara.id/v1/models';
      if (apiKey) headers['Authorization'] = `Bearer ${apiKey}`;
    } else {
      return resolve([]);
    }

    try {
      const url = new URL(urlStr);
      const client = url.protocol === 'https:' ? https : http;
      const req = client.request(url, { method: 'GET', headers, timeout: 8000 }, (res) => {
        let body = '';
        res.on('data', chunk => body += chunk);
        res.on('end', () => {
          try {
            const data = JSON.parse(body);
            const models = (data.data || data.models || []).map(m => ({
              id: m.id || m.name,
              name: m.name || m.id,
              context_length: m.context_length || 8192,
              pricing: m.pricing || { prompt: 0, completion: 0 }
            }));
            resolve(models);
          } catch (e) {
            resolve([]);
          }
        });
      });

      req.on('error', () => resolve([]));
      req.on('timeout', () => { req.destroy(); resolve([]); });
      req.end();
    } catch (e) {
      resolve([]);
    }
  });
}

module.exports = { fetchProviderModels };
