import { config } from '../config.js';
import { query } from '../db.js';
import { zambylClient } from '../zambyl/client.js';
import { subscriberCount } from '../services/realtime/event-bus.js';
import { forbidSupport } from './helpers.js';

export async function registerObservabilityRoutes(app) {
  app.get('/api/observability/summary', async (req, reply) => {
    if (forbidSupport(req, reply)) return;

    const [zambylHealth, latency, watermarks, userCount] = await Promise.all([
      zambylClient.getHealth().catch(() => ({ ok: false, status: 'error' })),
      query(
        `SELECT event_type, stage,
                percentile_cont(0.5) WITHIN GROUP (ORDER BY duration_ms)::int AS p50,
                percentile_cont(0.99) WITHIN GROUP (ORDER BY duration_ms)::int AS p99,
                COUNT(*)::int AS samples
         FROM realtime_latency_samples
         GROUP BY event_type, stage
         ORDER BY event_type, stage`,
      ).catch(() => ({ rows: [] })),
      query('SELECT key, value, updated_at FROM realtime_watermarks ORDER BY key').catch(() => ({ rows: [] })),
      query('SELECT COUNT(*)::int AS n FROM users').catch(() => ({ rows: [{ n: 0 }] })),
    ]);

    return {
      service: 'meetingiq-bff',
      phase: '10-production-ready',
      at: new Date().toISOString(),
      zambyl: {
        api_url: config.zambyl.apiUrl,
        connected: zambylHealth.ok,
        status: zambylHealth.status,
      },
      realtime: {
        sse_subscribers: subscriberCount(),
        watermarks: watermarks.rows,
        latency: latency.rows,
      },
      identity: { user_count: userCount.rows[0]?.n || 0 },
      freshness: { last_synced: new Date().toISOString(), source: 'observability-summary' },
    };
  });

  app.get('/metrics', async (req, reply) => {
    const summary = await query(
      `SELECT event_type, stage, COUNT(*)::int AS samples,
              AVG(duration_ms)::int AS avg_ms
       FROM realtime_latency_samples
       GROUP BY event_type, stage`,
    ).catch(() => ({ rows: [] }));

    const lines = [
      '# HELP meetingiq_realtime_latency_samples Latency sample count by event and stage',
      '# TYPE meetingiq_realtime_latency_samples gauge',
    ];
    for (const row of summary.rows) {
      lines.push(`meetingiq_realtime_latency_samples{event_type="${row.event_type}",stage="${row.stage}"} ${row.samples}`);
      lines.push(`meetingiq_realtime_latency_avg_ms{event_type="${row.event_type}",stage="${row.stage}"} ${row.avg_ms}`);
    }
    lines.push(`meetingiq_sse_subscribers ${subscriberCount()}`);

    reply.type('text/plain; version=0.0.4').send(lines.join('\n') + '\n');
  });
}
