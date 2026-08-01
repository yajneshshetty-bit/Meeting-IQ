import { API_KEY } from '../seed/enterprise-manifest.js';

const buckets = new Map();

export function authPlugin(fastify) {
  fastify.addHook('onRequest', async (req, reply) => {
    if (req.url === '/health' || req.url.startsWith('/health?')) return;
    const key = req.headers['x-api-key'] || req.headers.authorization?.replace(/^Bearer\s+/i, '');
    if (key !== API_KEY) {
      return reply.status(401).send({ error: { code: 'UNAUTHORIZED', message: 'Invalid API key' } });
    }
  });
}

export function rateLimitPlugin(fastify, { maxPerMinute = 120 } = {}) {
  fastify.addHook('onRequest', async (req, reply) => {
    const ip = req.ip;
    const now = Date.now();
    const bucket = buckets.get(ip) || { count: 0, reset: now + 60000 };
    if (now > bucket.reset) {
      bucket.count = 0;
      bucket.reset = now + 60000;
    }
    bucket.count += 1;
    buckets.set(ip, bucket);
    if (bucket.count > maxPerMinute) {
      return reply.status(429).send({ error: { code: 'RATE_LIMIT', message: 'Too many requests' } });
    }
  });
}

export async function latencyPlugin(fastify, { minMs = 15, maxMs = 80, failureRate = 0.01 } = {}) {
  fastify.addHook('onRequest', async () => {
    const delay = minMs + Math.random() * (maxMs - minMs);
    await new Promise((r) => setTimeout(r, delay));
    if (Math.random() < failureRate) {
      const err = new Error('Simulated upstream failure');
      err.statusCode = 503;
      throw err;
    }
  });
}

export async function createServiceApp({ serviceName, db, resources, registerRoutes }) {
  const fastify = (await import('fastify')).default({ logger: true });
  authPlugin(fastify);
  rateLimitPlugin(fastify);
  if (process.env.MOCK_SIMULATE_LATENCY !== '0') {
    await latencyPlugin(fastify);
  }
  const { registerCommonRoutes } = await import('./index.js');
  registerCommonRoutes(fastify, { db, serviceName, resources });
  await registerRoutes(fastify, db);
  fastify.setErrorHandler((err, _req, reply) => {
    reply.status(err.statusCode || 500).send({ error: { code: 'SERVICE_ERROR', message: err.message } });
  });
  return fastify;
}
