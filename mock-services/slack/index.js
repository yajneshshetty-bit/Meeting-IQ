import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { openDatabase, logChange, paginateRows, emitWebhooks } from '@meetingiq/mock-common';
import { createServiceApp } from '@meetingiq/mock-common/server.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PORT = Number(process.env.PORT || 4004);

const SCHEMA = `
CREATE TABLE IF NOT EXISTS channels (
  channel_id TEXT PRIMARY KEY, name TEXT, account_id TEXT, opportunity_id TEXT, is_escalation INTEGER, updated_at TEXT
);
CREATE TABLE IF NOT EXISTS messages (
  message_id TEXT PRIMARY KEY, channel_id TEXT, user_id TEXT, text TEXT, posted_at TEXT, updated_at TEXT
);
`;

function seed(db) {
  if (db.prepare('SELECT COUNT(*) AS c FROM channels').get().c > 0) return;
  const now = new Date().toISOString();
  const channels = [
    { channel_id: 'ch_acme_deal', name: 'acme-command-platform', account_id: 'acct_acme', opportunity_id: 'OPP-1842', is_escalation: 0 },
    { channel_id: 'ch_helion_esc', name: 'helion-deal-desk', account_id: 'acct_helion', opportunity_id: 'OPP-2811', is_escalation: 1 },
    { channel_id: 'ch_forecast', name: 'q3-forecast', account_id: null, opportunity_id: null, is_escalation: 0 },
  ];
  const insC = db.prepare(`INSERT INTO channels VALUES (?,?,?,?,?,?)`);
  for (const c of channels) {
    insC.run(c.channel_id, c.name, c.account_id, c.opportunity_id, c.is_escalation, now);
    logChange(db, 'channel', c.channel_id, 'upsert', c);
  }
  const messages = [
    { message_id: 'slack_001', channel_id: 'ch_acme_deal', user_id: 'user_manager_1', text: 'Legal flagged MSA — Alex please sync with Priya before tomorrow.', posted_at: '2026-07-27T10:05:00Z' },
    { message_id: 'slack_002', channel_id: 'ch_helion_esc', user_id: 'user_leader_1', text: 'Escalation: Helion CFO pushing back on pricing.', posted_at: '2026-07-27T09:30:00Z' },
  ];
  const insM = db.prepare(`INSERT INTO messages VALUES (?,?,?,?,?,?)`);
  for (const m of messages) {
    insM.run(m.message_id, m.channel_id, m.user_id, m.text, m.posted_at, now);
    logChange(db, 'message', m.message_id, 'upsert', m);
  }
}

async function registerRoutes(app, db) {
  app.get('/v1/channels', async (req) => {
    let sql = 'SELECT * FROM channels WHERE 1=1';
    const params = [];
    if (req.query.account_id) { sql += ' AND account_id = ?'; params.push(req.query.account_id); }
    if (req.query.is_escalation === 'true') { sql += ' AND is_escalation = 1'; }
    const rows = db.prepare(sql).all(...params).map((r) => ({ ...r, is_escalation: !!r.is_escalation }));
    return paginateRows(rows, { cursor: req.query.cursor, limit: Number(req.query.limit || 50) });
  });
  app.get('/v1/messages', async (req) => {
    let sql = 'SELECT * FROM messages WHERE 1=1';
    const params = [];
    if (req.query.channel_id) { sql += ' AND channel_id = ?'; params.push(req.query.channel_id); }
    return paginateRows(db.prepare(sql).all(...params), { cursor: req.query.cursor, limit: Number(req.query.limit || 50) });
  });
  app.post('/v1/messages', async (req) => {
    const body = req.body || {};
    const id = body.message_id || `slack_${Date.now()}`;
    const now = new Date().toISOString();
    db.prepare(`INSERT INTO messages VALUES (?,?,?,?,?,?)`).run(id, body.channel_id, body.user_id, body.text, body.posted_at || now, now);
    logChange(db, 'message', id, 'create', body);
    await emitWebhooks(db, 'slack.message.created', { message_id: id, ...body });
    return { message_id: id, ...body, posted_at: body.posted_at || now };
  });
}

export async function createApp(opts = {}) {
  const dbPath = opts.dbPath || process.env.DB_PATH || path.join(__dirname, 'data', 'slack.sqlite');
  const db = openDatabase(dbPath, SCHEMA);
  seed(db);
  return createServiceApp({ serviceName: 'mock-slack', db, resources: ['channels', 'messages'], registerRoutes });
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const app = await createApp();
  await app.listen({ port: PORT, host: '0.0.0.0' });
}
