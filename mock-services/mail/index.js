import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { openDatabase, logChange, paginateRows, emitWebhooks } from '@meetingiq/mock-common';
import { createServiceApp } from '@meetingiq/mock-common/server.js';
import { ACCOUNTS, OPPORTUNITIES } from '../seed/enterprise-manifest.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PORT = Number(process.env.PORT || 4003);

const SCHEMA = `
CREATE TABLE IF NOT EXISTS threads (
  thread_id TEXT PRIMARY KEY, subject TEXT, account_id TEXT, opportunity_id TEXT,
  participant_ids TEXT, last_message_at TEXT, updated_at TEXT
);
CREATE TABLE IF NOT EXISTS messages (
  message_id TEXT PRIMARY KEY, thread_id TEXT, from_address TEXT, to_addresses TEXT,
  subject TEXT, body_preview TEXT, sent_at TEXT, has_attachments INTEGER, updated_at TEXT
);
`;

function seed(db) {
  if (db.prepare('SELECT COUNT(*) AS c FROM threads').get().c > 0) return;
  const now = new Date().toISOString();
  const threads = [
    { thread_id: 'thr_acme_proc', subject: 'Re: Acme procurement timeline', account_id: 'acct_acme', opportunity_id: 'OPP-1842' },
    { thread_id: 'thr_helion_esc', subject: 'Helion Energy — contract concerns', account_id: 'acct_helion', opportunity_id: 'OPP-2811' },
    { thread_id: 'thr_granite_renew', subject: 'Granite State Bank renewal', account_id: 'acct_granite', opportunity_id: 'OPP-2009' },
  ];
  const insT = db.prepare(`INSERT INTO threads VALUES (?,?,?,?,?,?,?)`);
  for (const t of threads) {
    insT.run(t.thread_id, t.subject, t.account_id, t.opportunity_id, JSON.stringify(['user_alex', 'cnt_priya']), now, now);
    logChange(db, 'thread', t.thread_id, 'upsert', t);
  }
  const messages = [
    { message_id: 'msg_001', thread_id: 'thr_acme_proc', from: 'priya.menon@acme.com', subject: 'Re: Acme procurement timeline', preview: 'Legal needs revised MSA by Friday.', sent_at: '2026-07-27T09:15:00Z' },
    { message_id: 'msg_002', thread_id: 'thr_helion_esc', from: 'cfo@helionenergy.com', subject: 'Helion Energy — contract concerns', preview: 'We need to revisit pricing before close.', sent_at: '2026-07-27T08:40:00Z' },
    { message_id: 'msg_003', thread_id: 'thr_granite_renew', from: 'procurement@granitestatebank.com', subject: 'Granite State Bank renewal', preview: 'PO approved for InsightVM renewal.', sent_at: '2026-07-26T16:00:00Z' },
  ];
  const insM = db.prepare(`INSERT INTO messages VALUES (?,?,?,?,?,?,?,?,?)`);
  for (const m of messages) {
    insM.run(m.message_id, m.thread_id, m.from, JSON.stringify(['alex@infoglen.com']), m.subject, m.preview, m.sent_at, 0, now);
    logChange(db, 'message', m.message_id, 'upsert', m);
  }
}

async function registerRoutes(app, db) {
  app.get('/v1/threads', async (req) => {
    let sql = 'SELECT * FROM threads WHERE 1=1';
    const params = [];
    if (req.query.account_id) { sql += ' AND account_id = ?'; params.push(req.query.account_id); }
    if (req.query.opportunity_id) { sql += ' AND opportunity_id = ?'; params.push(req.query.opportunity_id); }
    const rows = db.prepare(sql).all(...params).map((r) => ({ ...r, participant_ids: JSON.parse(r.participant_ids) }));
    return paginateRows(rows, { cursor: req.query.cursor, limit: Number(req.query.limit || 50) });
  });
  app.get('/v1/messages', async (req) => {
    let sql = 'SELECT * FROM messages WHERE 1=1';
    const params = [];
    if (req.query.thread_id) { sql += ' AND thread_id = ?'; params.push(req.query.thread_id); }
    const rows = db.prepare(sql).all(...params).map((r) => ({ ...r, to_addresses: JSON.parse(r.to_addresses), has_attachments: !!r.has_attachments }));
    return paginateRows(rows, { cursor: req.query.cursor, limit: Number(req.query.limit || 50) });
  });
  app.post('/v1/messages', async (req) => {
    const body = req.body || {};
    const id = body.message_id || `msg_${Date.now()}`;
    const now = new Date().toISOString();
    const row = { message_id: id, thread_id: body.thread_id, from_address: body.from_address, to_addresses: JSON.stringify(body.to_addresses || []), subject: body.subject, body_preview: body.body_preview, sent_at: body.sent_at || now, has_attachments: body.has_attachments ? 1 : 0, updated_at: now };
    db.prepare(`INSERT INTO messages VALUES (?,?,?,?,?,?,?,?,?)`).run(...Object.values(row));
    logChange(db, 'message', id, 'create', { ...body, message_id: id });
    await emitWebhooks(db, 'message.created', { message_id: id, ...body });
    return { ...row, to_addresses: JSON.parse(row.to_addresses), has_attachments: !!row.has_attachments };
  });
}

export async function createApp(opts = {}) {
  const dbPath = opts.dbPath || process.env.DB_PATH || path.join(__dirname, 'data', 'mail.sqlite');
  const db = openDatabase(dbPath, SCHEMA);
  seed(db);
  return createServiceApp({ serviceName: 'mock-mail', db, resources: ['threads', 'messages'], registerRoutes });
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const app = await createApp();
  await app.listen({ port: PORT, host: '0.0.0.0' });
}
