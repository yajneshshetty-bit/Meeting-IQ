import { subscribe } from '../services/realtime/event-bus.js';
import { pollOutboxOnce } from '../services/realtime/watcher.js';
import { triggerIncrementalSync } from '../services/realtime/sync-trigger.js';
import { forbidSupport } from './helpers.js';

export async function registerRealtimeRoutes(app) {
  app.get('/api/events/stream', async (req, reply) => {
    if (forbidSupport(req, reply)) return;

    reply.hijack();
    reply.raw.writeHead(200, {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      Connection: 'keep-alive',
    });

    const send = (event) => {
      reply.raw.write(`event: widget.invalidate\n`);
      reply.raw.write(`data: ${JSON.stringify(event)}\n\n`);
    };

    send({ type: 'connected', user_id: req.userContext.userId, at: new Date().toISOString() });

    const unsubscribe = subscribe(send);
    req.raw.on('close', () => unsubscribe());
  });

  app.post('/api/realtime/poll', async (req, reply) => {
    if (forbidSupport(req, reply)) return;
    const result = await pollOutboxOnce();
    return { ...result, freshness: { last_synced: new Date().toISOString(), source: 'zambyl-outbox' } };
  });

  app.get('/api/realtime/latency', async (req, reply) => {
    if (forbidSupport(req, reply)) return;
    const { query } = await import('../db.js');
    const res = await query(
      `SELECT event_type, stage,
              percentile_cont(0.5) WITHIN GROUP (ORDER BY duration_ms)::int AS p50,
              percentile_cont(0.99) WITHIN GROUP (ORDER BY duration_ms)::int AS p99,
              COUNT(*)::int AS samples
       FROM realtime_latency_samples
       GROUP BY event_type, stage
       ORDER BY event_type, stage`,
    );
    return { metrics: res.rows };
  });

  app.post('/api/realtime/pipeline', async (req, reply) => {
    if (forbidSupport(req, reply)) return;
    const sync = await triggerIncrementalSync();
    const poll = await pollOutboxOnce();
    return {
      sync,
      poll,
      freshness: { last_synced: new Date().toISOString(), source: 'incremental-sync+outbox' },
    };
  });
}

export { triggerIncrementalSync };
