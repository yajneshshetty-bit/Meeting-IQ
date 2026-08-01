import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { openDatabase, logChange, paginateRows, emitWebhooks } from '@meetingiq/mock-common';
import { createServiceApp } from '@meetingiq/mock-common/server.js';
import { MEETINGS } from '../seed/enterprise-manifest.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PORT = Number(process.env.PORT || 4002);
const dbPath = process.env.DB_PATH || path.join(__dirname, 'data', 'calendar.sqlite');

const SCHEMA = `
CREATE TABLE IF NOT EXISTS meetings (
  meeting_id TEXT PRIMARY KEY, title TEXT, account_id TEXT, opportunity_id TEXT,
  start_time TEXT, end_time TEXT, meeting_type TEXT, organizer_id TEXT,
  attendee_ids TEXT, status TEXT, is_live INTEGER, updated_at TEXT
);
`;

function seed(db) {
  if (db.prepare('SELECT COUNT(*) AS c FROM meetings').get().c > 0) return;
  const ins = db.prepare(`INSERT INTO meetings VALUES (?,?,?,?,?,?,?,?,?,?,?,?)`);
  for (const m of MEETINGS) {
    ins.run(m.meeting_id, m.title, m.account_id, m.opportunity_id, m.start_time, m.end_time, m.meeting_type, m.organizer_id, JSON.stringify(m.attendee_ids), m.status, m.is_live ? 1 : 0, new Date().toISOString());
    logChange(db, 'meeting', m.meeting_id, 'upsert', m);
  }
}

async function registerRoutes(app, db) {
  app.get('/v1/meetings', async (req) => {
    let sql = 'SELECT * FROM meetings WHERE 1=1';
    const params = [];
    if (req.query.from) { sql += ' AND start_time >= ?'; params.push(req.query.from); }
    if (req.query.to) { sql += ' AND start_time <= ?'; params.push(req.query.to); }
    sql += ' ORDER BY start_time';
    const rows = db.prepare(sql).all(...params).map((r) => ({ ...r, attendee_ids: JSON.parse(r.attendee_ids), is_live: !!r.is_live }));
    return paginateRows(rows, { cursor: req.query.cursor, limit: Number(req.query.limit || 50) });
  });

  app.patch('/v1/meetings/:id', async (req) => {
    const body = req.body || {};
    const row = db.prepare('SELECT * FROM meetings WHERE meeting_id = ?').get(req.params.id);
    if (!row) return app.httpErrors.notFound('Meeting not found');
    const updated = { ...row, ...body, attendee_ids: JSON.stringify(body.attendee_ids || JSON.parse(row.attendee_ids)), updated_at: new Date().toISOString() };
    db.prepare(`UPDATE meetings SET status=?, is_live=?, updated_at=? WHERE meeting_id=?`)
      .run(updated.status || row.status, body.is_live ? 1 : row.is_live, updated.updated_at, req.params.id);
    const payload = { ...updated, attendee_ids: JSON.parse(updated.attendee_ids), is_live: !!body.is_live };
    logChange(db, 'meeting', req.params.id, 'update', payload);
    await emitWebhooks(db, 'meeting.updated', payload);
    return payload;
  });
}

export async function createApp(opts = {}) {
  const pathOpt = opts.dbPath || dbPath;
  const db = openDatabase(pathOpt, SCHEMA);
  seed(db);
  return createServiceApp({ serviceName: 'mock-calendar', db, resources: ['meetings'], registerRoutes });
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const app = await createApp();
  await app.listen({ port: PORT, host: '0.0.0.0' });
}
