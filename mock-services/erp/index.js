import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { openDatabase, logChange, paginateRows, emitWebhooks } from '@meetingiq/mock-common';
import { createServiceApp } from '@meetingiq/mock-common/server.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PORT = Number(process.env.PORT || 4008);

const SCHEMA = `
CREATE TABLE IF NOT EXISTS orders (
  order_id TEXT PRIMARY KEY, account_id TEXT, opportunity_id TEXT, product_id TEXT,
  amount REAL, currency TEXT, status TEXT, order_date TEXT, updated_at TEXT
);
CREATE TABLE IF NOT EXISTS renewals (
  renewal_id TEXT PRIMARY KEY, account_id TEXT, product_id TEXT, renewal_date TEXT,
  amount REAL, currency TEXT, status TEXT, updated_at TEXT
);
CREATE TABLE IF NOT EXISTS billing_accounts (
  billing_account_id TEXT PRIMARY KEY, account_id TEXT, payment_terms TEXT,
  credit_status TEXT, updated_at TEXT
);
`;

function seed(db) {
  if (db.prepare('SELECT COUNT(*) AS c FROM orders').get().c > 0) return;
  const now = new Date().toISOString();
  db.prepare(`INSERT INTO billing_accounts VALUES (?,?,?,?,?)`).run('bill_acme', 'acct_acme', 'Net 45', 'good', now);
  db.prepare(`INSERT INTO billing_accounts VALUES (?,?,?,?,?)`).run('bill_granite', 'acct_granite', 'Net 30', 'good', now);
  logChange(db, 'billing_account', 'bill_acme', 'upsert', { account_id: 'acct_acme' });
  const orders = [
    { order_id: 'ORD-9001', account_id: 'acct_granite', opportunity_id: 'OPP-2009', product_id: 'prod_insightvm', amount: 360000, status: 'fulfilled', order_date: '2026-06-15' },
    { order_id: 'ORD-9002', account_id: 'acct_acme', opportunity_id: 'OPP-1842', product_id: 'prod_exposure_command', amount: 250000, status: 'pending', order_date: '2026-07-20' },
  ];
  const insO = db.prepare(`INSERT INTO orders VALUES (?,?,?,?,?,?,?,?,?)`);
  for (const o of orders) {
    insO.run(o.order_id, o.account_id, o.opportunity_id, o.product_id, o.amount, 'USD', o.status, o.order_date, now);
    logChange(db, 'order', o.order_id, 'upsert', o);
  }
  const renewals = [
    { renewal_id: 'ren_granite_vm', account_id: 'acct_granite', product_id: 'prod_insightvm', renewal_date: '2027-06-15', amount: 380000, status: 'scheduled' },
    { renewal_id: 'ren_brightwave_ics', account_id: 'acct_brightwave', product_id: 'prod_insightcloudsec', renewal_date: '2026-12-01', amount: 128000, status: 'negotiating' },
  ];
  const insR = db.prepare(`INSERT INTO renewals VALUES (?,?,?,?,?,?,?,?)`);
  for (const r of renewals) {
    insR.run(r.renewal_id, r.account_id, r.product_id, r.renewal_date, r.amount, 'USD', r.status, now);
    logChange(db, 'renewal', r.renewal_id, 'upsert', r);
  }
}

async function registerRoutes(app, db) {
  app.get('/v1/orders', async (req) => {
    let sql = 'SELECT * FROM orders WHERE 1=1';
    const params = [];
    if (req.query.account_id) { sql += ' AND account_id = ?'; params.push(req.query.account_id); }
    return paginateRows(db.prepare(sql).all(...params), { cursor: req.query.cursor, limit: Number(req.query.limit || 50) });
  });
  app.get('/v1/renewals', async (req) => {
    let sql = 'SELECT * FROM renewals WHERE 1=1';
    const params = [];
    if (req.query.account_id) { sql += ' AND account_id = ?'; params.push(req.query.account_id); }
    return paginateRows(db.prepare(sql).all(...params), { cursor: req.query.cursor, limit: Number(req.query.limit || 50) });
  });
  app.get('/v1/billing_accounts', async (req) => paginateRows(db.prepare('SELECT * FROM billing_accounts').all(), { cursor: req.query.cursor, limit: Number(req.query.limit || 50) }));
  app.patch('/v1/orders/:id', async (req) => {
    const body = req.body || {};
    const row = db.prepare('SELECT * FROM orders WHERE order_id = ?').get(req.params.id);
    if (!row) return app.httpErrors.notFound('Order not found');
    const updated = { ...row, ...body, updated_at: new Date().toISOString() };
    db.prepare(`UPDATE orders SET status=?, updated_at=? WHERE order_id=?`).run(updated.status, updated.updated_at, req.params.id);
    logChange(db, 'order', req.params.id, 'update', updated);
    await emitWebhooks(db, 'order.updated', updated);
    return updated;
  });
}

export async function createApp(opts = {}) {
  const dbPath = opts.dbPath || process.env.DB_PATH || path.join(__dirname, 'data', 'erp.sqlite');
  const db = openDatabase(dbPath, SCHEMA);
  seed(db);
  return createServiceApp({ serviceName: 'mock-erp', db, resources: ['orders', 'renewals', 'billing_accounts'], registerRoutes });
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const app = await createApp();
  await app.listen({ port: PORT, host: '0.0.0.0' });
}
