import Database from 'better-sqlite3';
import fs from 'node:fs';
import path from 'node:path';

const BASE_SCHEMA = `
CREATE TABLE IF NOT EXISTS change_log (
  change_id INTEGER PRIMARY KEY AUTOINCREMENT,
  entity_type TEXT NOT NULL,
  entity_id TEXT NOT NULL,
  operation TEXT NOT NULL,
  payload TEXT NOT NULL,
  changed_at TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_change_log_changed_at ON change_log(changed_at);
CREATE INDEX IF NOT EXISTS idx_change_log_id ON change_log(change_id);

CREATE TABLE IF NOT EXISTS webhook_subscribers (
  subscriber_id TEXT PRIMARY KEY,
  url TEXT NOT NULL,
  events TEXT NOT NULL,
  secret TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);
`;

export function openDatabase(dbPath, serviceSchema = '') {
  fs.mkdirSync(path.dirname(dbPath), { recursive: true });
  const db = new Database(dbPath);
  db.pragma('journal_mode = WAL');
  db.exec(BASE_SCHEMA);
  if (serviceSchema) db.exec(serviceSchema);
  return db;
}

export function logChange(db, entityType, entityId, operation, payload) {
  db.prepare(
    `INSERT INTO change_log (entity_type, entity_id, operation, payload) VALUES (?, ?, ?, ?)`,
  ).run(entityType, entityId, operation, JSON.stringify(payload));
}

export function paginateRows(rows, { cursor, limit = 50 }) {
  const start = cursor ? Number(cursor) : 0;
  const slice = rows.slice(start, start + limit);
  const next = start + limit < rows.length ? String(start + limit) : null;
  return { records: slice, next_cursor: next, total: rows.length };
}

export function filterDelta(db, since, limit = 100) {
  const sinceId = since ? Number(since) : 0;
  const rows = db.prepare(
    `SELECT change_id, entity_type, entity_id, operation, payload, changed_at
     FROM change_log WHERE change_id > ? ORDER BY change_id ASC LIMIT ?`,
  ).all(sinceId, limit);
  const next = rows.length === limit ? String(rows[rows.length - 1].change_id) : null;
  return {
    changes: rows.map((r) => ({
      change_id: r.change_id,
      entity_type: r.entity_type,
      entity_id: r.entity_id,
      operation: r.operation,
      payload: JSON.parse(r.payload),
      changed_at: r.changed_at,
    })),
    next_cursor: next,
  };
}

export async function emitWebhooks(db, eventType, payload) {
  const subs = db.prepare(`SELECT url, secret FROM webhook_subscribers WHERE events LIKE ?`).all(`%${eventType}%`);
  for (const sub of subs) {
    try {
      await fetch(sub.url, {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
          'x-mock-event': eventType,
          'x-mock-secret': sub.secret || '',
        },
        body: JSON.stringify({ event: eventType, payload, emitted_at: new Date().toISOString() }),
        signal: AbortSignal.timeout(5000),
      });
    } catch {
      // Independent failure — mock services do not depend on webhook delivery
    }
  }
}

export function registerCommonRoutes(app, { db, serviceName, resources = [] }) {
  app.get('/health', async () => ({ status: 'ok', service: serviceName }));

  app.get('/openapi.json', async () => ({
    openapi: '3.0.3',
    info: { title: `${serviceName} Mock API`, version: '1.0.0' },
    paths: {
      '/health': { get: { summary: 'Health check' } },
      '/v1/delta': { get: { summary: 'Delta changes since cursor', parameters: [{ name: 'cursor', in: 'query' }, { name: 'limit', in: 'query' }] } },
      '/v1/webhooks/subscribe': { post: { summary: 'Subscribe to webhook events' } },
      ...Object.fromEntries(resources.map((r) => [`/v1/${r}`, { get: { summary: `List ${r}` } }])),
    },
    components: {
      securitySchemes: { ApiKeyAuth: { type: 'apiKey', in: 'header', name: 'x-api-key' } },
    },
    security: [{ ApiKeyAuth: [] }],
  }));

  app.get('/v1/delta', async (req) => {
    const cursor = req.query.cursor || '0';
    const limit = Math.min(Number(req.query.limit || 100), 500);
    return filterDelta(db, cursor, limit);
  });

  app.post('/v1/webhooks/subscribe', async (req) => {
    const body = req.body || {};
    const id = body.subscriber_id || `sub_${Date.now()}`;
    db.prepare(
      `INSERT OR REPLACE INTO webhook_subscribers (subscriber_id, url, events, secret) VALUES (?, ?, ?, ?)`,
    ).run(id, body.url, JSON.stringify(body.events || ['*']), body.secret || null);
    return { subscriber_id: id, subscribed: true };
  });
}
