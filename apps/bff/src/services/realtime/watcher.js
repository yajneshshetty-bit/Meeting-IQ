import pg from 'pg';
import { config } from '../../config.js';
import { query } from '../../db.js';
import { broadcast } from './event-bus.js';
import { buildInvalidationEvent } from './invalidation.js';

const { Pool } = pg;

let pool = null;
let timer = null;
let running = false;

function getZambylPool() {
  if (!config.zambyl.databaseUrl) return null;
  if (!pool) pool = new Pool({ connectionString: config.zambyl.databaseUrl });
  return pool;
}

async function getWatermark(key) {
  const res = await query('SELECT value FROM realtime_watermarks WHERE key = $1', [key]);
  return res.rows[0]?.value || '0';
}

async function setWatermark(key, value) {
  await query(
    `INSERT INTO realtime_watermarks (key, value) VALUES ($1, $2)
     ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value, updated_at = NOW()`,
    [key, String(value)],
  );
}

async function recordLatency(eventType, stage, durationMs) {
  await query(
    `INSERT INTO realtime_latency_samples (event_type, stage, duration_ms) VALUES ($1, $2, $3)`,
    [eventType, stage, durationMs],
  ).catch(() => {});
}

export async function pollOutboxOnce() {
  const db = getZambylPool();
  if (!db) return { processed: 0 };

  const lastId = Number(await getWatermark('zambyl_outbox_id'));
  const start = Date.now();

  const res = await db.query(
    `SELECT o.outbox_id, o.event_type, o.payload, o.created_at,
            ce.entity_type, ce.source_ref
     FROM outbox o
     LEFT JOIN canonical_entities ce ON ce.entity_id = o.aggregate_id
     WHERE o.outbox_id > $1
       AND o.event_type = 'canonical.entity.upserted'
     ORDER BY o.outbox_id ASC
     LIMIT 100`,
    [lastId],
  );

  let maxId = lastId;
  for (const row of res.rows) {
    if (row.source_ref && !String(row.source_ref).includes('conn_meetingiq')) continue;

    const payload = typeof row.payload === 'string' ? JSON.parse(row.payload) : row.payload;
    const entityType = row.entity_type || payload?.entity_type || 'unknown';
    const event = buildInvalidationEvent({
      entity_id: payload?.entity_id || row.aggregate_id,
      entity_type: entityType,
      outbox_id: row.outbox_id,
      source_event: row.event_type,
    });

    const detectMs = Date.now() - new Date(row.created_at).getTime();
    broadcast(event);
    await recordLatency(entityType, 'outbox_to_bff_push', Math.max(0, detectMs));
    maxId = Math.max(maxId, Number(row.outbox_id));
  }

  if (maxId > lastId) {
    await setWatermark('zambyl_outbox_id', maxId);
    await recordLatency('batch', 'poll_cycle', Date.now() - start);
  }

  return { processed: res.rows.length, lastId: maxId };
}

export function startOutboxWatcher({ intervalMs } = {}) {
  if (timer) return;
  const ms = intervalMs ?? Number(process.env.MEETINGIQ_REALTIME_POLL_MS || 2000);
  timer = setInterval(() => {
    pollOutboxOnce().catch((err) => {
      if (process.env.NODE_ENV !== 'test') {
        console.error('[realtime-watcher]', err.message);
      }
    });
  }, ms);
  if (timer.unref) timer.unref();
}

export function stopOutboxWatcher() {
  if (timer) clearInterval(timer);
  timer = null;
}

export async function closeWatcherPool() {
  stopOutboxWatcher();
  if (pool) {
    await pool.end();
    pool = null;
  }
}

export async function runPipelineStep({ triggerSync } = {}) {
  if (running) return { skipped: true };
  running = true;
  try {
    const syncStart = Date.now();
    if (triggerSync) await triggerSync();
    const syncMs = Date.now() - syncStart;

    const pollStart = Date.now();
    const result = await pollOutboxOnce();
    const pollMs = Date.now() - pollStart;

    return { syncMs, pollMs, ...result };
  } finally {
    running = false;
  }
}
