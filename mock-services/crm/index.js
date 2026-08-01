import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { openDatabase, logChange, paginateRows, emitWebhooks } from '@meetingiq/mock-common';
import { createServiceApp } from '@meetingiq/mock-common/server.js';
import { ACCOUNTS, OPPORTUNITIES, CONTACTS, PRODUCTS } from '../seed/enterprise-manifest.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PORT = Number(process.env.PORT || 4001);
const dbPath = process.env.DB_PATH || path.join(__dirname, 'data', 'crm.sqlite');

const SCHEMA = `
CREATE TABLE IF NOT EXISTS accounts (
  account_id TEXT PRIMARY KEY, name TEXT, tier TEXT, health_score INTEGER,
  territory_id TEXT, owner_id TEXT, industry TEXT, status TEXT, updated_at TEXT
);
CREATE TABLE IF NOT EXISTS opportunities (
  opportunity_id TEXT PRIMARY KEY, account_id TEXT, name TEXT, stage TEXT,
  amount REAL, commit_amount REAL, currency TEXT, owner_id TEXT, product_id TEXT,
  close_date TEXT, probability REAL, risk_level TEXT, quarter TEXT, updated_at TEXT
);
CREATE TABLE IF NOT EXISTS contacts (
  contact_id TEXT PRIMARY KEY, account_id TEXT, name TEXT, email TEXT, title TEXT, role TEXT, updated_at TEXT
);
CREATE TABLE IF NOT EXISTS leads (
  lead_id TEXT PRIMARY KEY, account_id TEXT, name TEXT, source TEXT, status TEXT, owner_id TEXT, product_id TEXT, updated_at TEXT
);
CREATE TABLE IF NOT EXISTS products (
  product_id TEXT PRIMARY KEY, name TEXT, family TEXT, active INTEGER, updated_at TEXT
);
CREATE TABLE IF NOT EXISTS forecasts (
  forecast_id TEXT PRIMARY KEY, quarter TEXT, owner_id TEXT, committed_amount REAL,
  ai_adjusted_amount REAL, currency TEXT, product_id TEXT, updated_at TEXT
);
`;

function seed(db) {
  if (db.prepare('SELECT COUNT(*) AS c FROM accounts').get().c > 0) return;
  const now = new Date().toISOString();
  const insAcct = db.prepare(`INSERT INTO accounts VALUES (?,?,?,?,?,?,?,?,?)`);
  for (const a of ACCOUNTS) {
    insAcct.run(a.account_id, a.name, a.tier, a.health_score, a.territory_id, a.owner_id, 'Technology', 'active', now);
    logChange(db, 'account', a.account_id, 'upsert', a);
  }
  const insProd = db.prepare(`INSERT INTO products VALUES (?,?,?,?,?)`);
  for (const p of PRODUCTS) {
    insProd.run(p.product_id, p.name, p.family, 1, now);
    logChange(db, 'product', p.product_id, 'upsert', p);
  }
  const insOpp = db.prepare(`INSERT INTO opportunities VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?)`);
  for (const o of OPPORTUNITIES) {
    insOpp.run(o.opportunity_id, o.account_id, o.name, o.stage, o.amount, o.commit_amount, 'USD', o.owner_id, o.product_id, '2026-09-30', 0.6, o.risk_level, o.quarter, now);
    logChange(db, 'opportunity', o.opportunity_id, 'upsert', o);
  }
  const insCnt = db.prepare(`INSERT INTO contacts VALUES (?,?,?,?,?,?,?)`);
  for (const c of CONTACTS) {
    insCnt.run(c.contact_id, c.account_id, c.name, c.email, c.title, c.role, now);
    logChange(db, 'contact', c.contact_id, 'upsert', c);
  }
  db.prepare(`INSERT INTO leads VALUES (?,?,?,?,?,?,?,?)`).run('LEAD-9001', null, 'Nova Systems', 'inbound', 'new', 'user_priya', 'prod_insightcloudsec', now);
  logChange(db, 'lead', 'LEAD-9001', 'upsert', { lead_id: 'LEAD-9001', name: 'Nova Systems' });
  db.prepare(`INSERT INTO forecasts VALUES (?,?,?,?,?,?,?,?)`).run('fc_q3_org', 'Q3-2026', 'user_leader_1', 3853000, 3342000, 'USD', null, now);
  logChange(db, 'forecast', 'fc_q3_org', 'upsert', { committed: 3853000, ai_adjusted: 3342000 });
}

async function registerRoutes(app, db) {
  app.get('/v1/accounts', async (req) => {
    const rows = db.prepare('SELECT * FROM accounts ORDER BY name').all();
    return paginateRows(rows, { cursor: req.query.cursor, limit: Number(req.query.limit || 50) });
  });
  app.get('/v1/opportunities', async (req) => {
    let sql = 'SELECT * FROM opportunities WHERE 1=1';
    const params = [];
    if (req.query.account_id) { sql += ' AND account_id = ?'; params.push(req.query.account_id); }
    if (req.query.stage) { sql += ' AND stage = ?'; params.push(req.query.stage); }
    if (req.query.product_id) { sql += ' AND product_id = ?'; params.push(req.query.product_id); }
    sql += ' ORDER BY opportunity_id';
    const rows = db.prepare(sql).all(...params);
    return paginateRows(rows, { cursor: req.query.cursor, limit: Number(req.query.limit || 50) });
  });
  app.get('/v1/contacts', async (req) => paginateRows(db.prepare('SELECT * FROM contacts').all(), req.query));
  app.get('/v1/leads', async (req) => paginateRows(db.prepare('SELECT * FROM leads').all(), req.query));
  app.get('/v1/products', async (req) => paginateRows(db.prepare('SELECT * FROM products').all(), req.query));
  app.get('/v1/forecasts', async (req) => paginateRows(db.prepare('SELECT * FROM forecasts').all(), req.query));

  app.patch('/v1/opportunities/:id', async (req) => {
    const body = req.body || {};
    const row = db.prepare('SELECT * FROM opportunities WHERE opportunity_id = ?').get(req.params.id);
    if (!row) return app.httpErrors.notFound('Opportunity not found');
    const updated = { ...row, ...body, updated_at: new Date().toISOString() };
    db.prepare(`UPDATE opportunities SET stage=?, probability=?, risk_level=?, commit_amount=?, updated_at=? WHERE opportunity_id=?`)
      .run(updated.stage, updated.probability, updated.risk_level, updated.commit_amount, updated.updated_at, req.params.id);
    logChange(db, 'opportunity', req.params.id, 'update', updated);
    await emitWebhooks(db, 'opportunity.updated', updated);
    return updated;
  });
}

export async function createApp(opts = {}) {
  const pathOpt = opts.dbPath || dbPath;
  const db = openDatabase(pathOpt, SCHEMA);
  seed(db);
  return createServiceApp({
    serviceName: 'mock-crm',
    db,
    resources: ['accounts', 'opportunities', 'contacts', 'leads', 'products', 'forecasts'],
    registerRoutes,
  });
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const app = await createApp();
  await app.listen({ port: PORT, host: '0.0.0.0' });
}
