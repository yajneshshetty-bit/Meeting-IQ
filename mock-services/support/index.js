import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { openDatabase, logChange, paginateRows, emitWebhooks } from '@meetingiq/mock-common';
import { createServiceApp } from '@meetingiq/mock-common/server.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PORT = Number(process.env.PORT || 4007);

const SCHEMA = `
CREATE TABLE IF NOT EXISTS tickets (
  ticket_id TEXT PRIMARY KEY, subject TEXT, account_id TEXT, opportunity_id TEXT,
  priority TEXT, status TEXT, assignee_id TEXT, escalated INTEGER, updated_at TEXT
);
`;

function seed(db) {
  if (db.prepare('SELECT COUNT(*) AS c FROM tickets').get().c > 0) return;
  const now = new Date().toISOString();
  const tickets = [
    { ticket_id: 'TKT-4401', subject: 'Integration API timeout during POC', account_id: 'acct_acme', opportunity_id: 'OPP-1842', priority: 'high', status: 'open', assignee_id: 'user_support', escalated: 0 },
    { ticket_id: 'TKT-4402', subject: 'Helion deployment blocker — firewall rules', account_id: 'acct_helion', opportunity_id: 'OPP-2811', priority: 'critical', status: 'escalated', assignee_id: 'user_support', escalated: 1 },
    { ticket_id: 'TKT-4390', subject: 'Granite renewal billing mismatch', account_id: 'acct_granite', opportunity_id: 'OPP-2009', priority: 'medium', status: 'resolved', assignee_id: 'user_support', escalated: 0 },
  ];
  const ins = db.prepare(`INSERT INTO tickets VALUES (?,?,?,?,?,?,?,?,?)`);
  for (const t of tickets) {
    ins.run(t.ticket_id, t.subject, t.account_id, t.opportunity_id, t.priority, t.status, t.assignee_id, t.escalated, now);
    logChange(db, 'ticket', t.ticket_id, 'upsert', { ...t, escalated: !!t.escalated });
  }
}

async function registerRoutes(app, db) {
  app.get('/v1/tickets', async (req) => {
    let sql = 'SELECT * FROM tickets WHERE 1=1';
    const params = [];
    if (req.query.account_id) { sql += ' AND account_id = ?'; params.push(req.query.account_id); }
    if (req.query.escalated === 'true') { sql += ' AND escalated = 1'; }
    const rows = db.prepare(sql).all(...params).map((r) => ({ ...r, escalated: !!r.escalated }));
    return paginateRows(rows, { cursor: req.query.cursor, limit: Number(req.query.limit || 50) });
  });
  app.patch('/v1/tickets/:id', async (req) => {
    const body = req.body || {};
    const row = db.prepare('SELECT * FROM tickets WHERE ticket_id = ?').get(req.params.id);
    if (!row) return app.httpErrors.notFound('Ticket not found');
    const updated = { ...row, ...body, escalated: body.escalated ? 1 : row.escalated, updated_at: new Date().toISOString() };
    db.prepare(`UPDATE tickets SET status=?, priority=?, escalated=?, updated_at=? WHERE ticket_id=?`)
      .run(updated.status, updated.priority, updated.escalated, updated.updated_at, req.params.id);
    const payload = { ...updated, escalated: !!updated.escalated };
    logChange(db, 'ticket', req.params.id, 'update', payload);
    await emitWebhooks(db, 'ticket.updated', payload);
    return payload;
  });
}

export async function createApp(opts = {}) {
  const dbPath = opts.dbPath || process.env.DB_PATH || path.join(__dirname, 'data', 'support.sqlite');
  const db = openDatabase(dbPath, SCHEMA);
  seed(db);
  return createServiceApp({ serviceName: 'mock-support', db, resources: ['tickets'], registerRoutes });
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const app = await createApp();
  await app.listen({ port: PORT, host: '0.0.0.0' });
}
