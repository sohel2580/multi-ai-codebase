/**
 * AgentCouncil - Universal Multi-Provider AI Auto-Discovery Engine
 * Free Endpoints: OpenRouter, Groq, Cerebras, Sambanova, Together, DeepInfra, Mistral, Bynara, TokenRouter
 */
const https = require('https');
const http = require('http');

async function fetchProviderModels(provider, apiKey, endpoint) {
  return new Promise((resolve) => {
    let urlStr = '';
    const headers = { 'User-Agent': 'AgentCouncil-VSCode-1.5.0' };

    if (provider === 'openrouter') {
      urlStr = 'https://openrouter.ai/api/v1/models';
      if (apiKey) headers['Authorization'] = 'Bearer ' + apiKey;
    } else if (provider === 'groq') {
      urlStr = 'https://api.groq.com/openai/v1/models';
      if (apiKey) headers['Authorization'] = 'Bearer ' + apiKey;
    } else if (provider === 'cerebras') {
      urlStr = 'https://api.cerebras.ai/v1/models';
      if (apiKey) headers['Authorization'] = 'Bearer ' + apiKey;
    } else if (provider === 'sambanova') {
      urlStr = 'https://api.sambanova.ai/v1/models';
      if (apiKey) headers['Authorization'] = 'Bearer ' + apiKey;
    } else if (provider === 'together') {
      urlStr = 'https://api.together.xyz/v1/models';
      if (apiKey) headers['Authorization'] = 'Bearer ' + apiKey;
    } else if (provider === 'deepinfra') {
      urlStr = 'https://api.deepinfra.com/v1/openai/models';
      if (apiKey) headers['Authorization'] = 'Bearer ' + apiKey;
    } else if (provider === 'mistral') {
      urlStr = 'https://api.mistral.ai/v1/models';
      if (apiKey) headers['Authorization'] = 'Bearer ' + apiKey;
    } else if (provider === 'bynara') {
      urlStr = endpoint || 'https://router.bynara.id/v1/models';
      if (apiKey) headers['Authorization'] = 'Bearer ' + apiKey;
    } else if (provider === 'tokenrouter') {
      urlStr = endpoint || 'https://co.agentrouter.org/v1/models';
      if (apiKey) headers['Authorization'] = 'Bearer ' + apiKey;
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
            const rawList = Array.isArray(data) ? data : (data.data || data.models || []);
            const models = rawList.map(m => ({
              id: m.id || m.name || m.model_id,
              name: m.name || m.id || m.model_id,
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
