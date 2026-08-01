import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { openDatabase, logChange, paginateRows } from '@meetingiq/mock-common';
import { createServiceApp } from '@meetingiq/mock-common/server.js';
import { ORG_ID } from '../seed/enterprise-manifest.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PORT = Number(process.env.PORT || 4009);

const SCHEMA = `
CREATE TABLE IF NOT EXISTS organizations (
  organization_id TEXT PRIMARY KEY, name TEXT, updated_at TEXT
);
CREATE TABLE IF NOT EXISTS users (
  user_id TEXT PRIMARY KEY, organization_id TEXT, email TEXT, display_name TEXT,
  role TEXT, manager_id TEXT, territory_ids TEXT, updated_at TEXT
);
CREATE TABLE IF NOT EXISTS territories (
  territory_id TEXT PRIMARY KEY, organization_id TEXT, name TEXT, updated_at TEXT
);
`;

const USERS = [
  { user_id: 'user_leader_1', email: 'leader@infoglen.com', display_name: 'Jordan Lee', role: 'leader', manager_id: null, territory_ids: [] },
  { user_id: 'user_manager_1', email: 'manager@infoglen.com', display_name: 'Sam Rivera', role: 'manager', manager_id: 'user_leader_1', territory_ids: [] },
  { user_id: 'user_alex', email: 'alex@infoglen.com', display_name: 'Alex', role: 'ae', manager_id: 'user_manager_1', territory_ids: ['terr_west'] },
  { user_id: 'user_priya', email: 'priya@infoglen.com', display_name: 'Priya Menon', role: 'ae', manager_id: 'user_manager_1', territory_ids: ['terr_east'] },
  { user_id: 'user_se_1', email: 'se@infoglen.com', display_name: 'Taylor Kim', role: 'se', manager_id: 'user_manager_1', territory_ids: [] },
  { user_id: 'user_admin', email: 'admin@infoglen.com', display_name: 'Admin User', role: 'admin', manager_id: null, territory_ids: [] },
  { user_id: 'user_support', email: 'support@infoglen.com', display_name: 'Support Analyst', role: 'support', manager_id: null, territory_ids: [] },
];

const TERRITORIES = [
  { territory_id: 'terr_west', name: 'West' },
  { territory_id: 'terr_east', name: 'East' },
];

function seed(db) {
  if (db.prepare('SELECT COUNT(*) AS c FROM users').get().c > 0) return;
  const now = new Date().toISOString();
  db.prepare(`INSERT INTO organizations VALUES (?,?,?)`).run(ORG_ID, 'Infoglen', now);
  logChange(db, 'organization', ORG_ID, 'upsert', { organization_id: ORG_ID, name: 'Infoglen' });
  for (const t of TERRITORIES) {
    db.prepare(`INSERT INTO territories VALUES (?,?,?,?)`).run(t.territory_id, ORG_ID, t.name, now);
    logChange(db, 'territory', t.territory_id, 'upsert', t);
  }
  const ins = db.prepare(`INSERT INTO users VALUES (?,?,?,?,?,?,?,?)`);
  for (const u of USERS) {
    ins.run(u.user_id, ORG_ID, u.email, u.display_name, u.role, u.manager_id, JSON.stringify(u.territory_ids), now);
    logChange(db, 'user', u.user_id, 'upsert', u);
  }
}

async function registerRoutes(app, db) {
  app.get('/v1/users', async (req) => {
    let sql = 'SELECT * FROM users WHERE 1=1';
    const params = [];
    if (req.query.manager_id) { sql += ' AND manager_id = ?'; params.push(req.query.manager_id); }
    if (req.query.role) { sql += ' AND role = ?'; params.push(req.query.role); }
    const rows = db.prepare(sql).all(...params).map((r) => ({ ...r, territory_ids: JSON.parse(r.territory_ids) }));
    return paginateRows(rows, { cursor: req.query.cursor, limit: Number(req.query.limit || 50) });
  });
  app.get('/v1/users/:id', async (req) => {
    const row = db.prepare('SELECT * FROM users WHERE user_id = ?').get(req.params.id);
    if (!row) return app.httpErrors.notFound('User not found');
    return { ...row, territory_ids: JSON.parse(row.territory_ids) };
  });
  app.get('/v1/territories', async (req) => paginateRows(db.prepare('SELECT * FROM territories').all(), { cursor: req.query.cursor, limit: Number(req.query.limit || 50) }));
  app.get('/v1/organizations/:id', async (req) => {
    const row = db.prepare('SELECT * FROM organizations WHERE organization_id = ?').get(req.params.id);
    if (!row) return app.httpErrors.notFound('Organization not found');
    return row;
  });
}

export async function createApp(opts = {}) {
  const dbPath = opts.dbPath || process.env.DB_PATH || path.join(__dirname, 'data', 'identity.sqlite');
  const db = openDatabase(dbPath, SCHEMA);
  seed(db);
  return createServiceApp({ serviceName: 'mock-identity', db, resources: ['users', 'territories', 'organizations'], registerRoutes });
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const app = await createApp();
  await app.listen({ port: PORT, host: '0.0.0.0' });
}
