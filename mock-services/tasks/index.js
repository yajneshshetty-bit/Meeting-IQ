import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { openDatabase, logChange, paginateRows, emitWebhooks } from '@meetingiq/mock-common';
import { createServiceApp } from '@meetingiq/mock-common/server.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PORT = Number(process.env.PORT || 4006);

const SCHEMA = `
CREATE TABLE IF NOT EXISTS tasks (
  task_id TEXT PRIMARY KEY, title TEXT, account_id TEXT, opportunity_id TEXT,
  assignee_id TEXT, due_date TEXT, status TEXT, priority TEXT, updated_at TEXT
);
`;

function seed(db) {
  if (db.prepare('SELECT COUNT(*) AS c FROM tasks').get().c > 0) return;
  const now = new Date().toISOString();
  const tasks = [
    { task_id: 'task_msa', title: 'Send revised MSA to Acme legal', account_id: 'acct_acme', opportunity_id: 'OPP-1842', assignee_id: 'user_alex', due_date: '2026-07-28', status: 'open', priority: 'high' },
    { task_id: 'task_poc', title: 'Schedule POC scoping call', account_id: 'acct_acme', opportunity_id: 'OPP-1842', assignee_id: 'user_se_1', due_date: '2026-07-29', status: 'open', priority: 'medium' },
    { task_id: 'task_helion', title: 'Prepare exec escalation brief', account_id: 'acct_helion', opportunity_id: 'OPP-2811', assignee_id: 'user_manager_1', due_date: '2026-07-27', status: 'in_progress', priority: 'critical' },
    { task_id: 'task_orbit', title: 'Send Orbit intro deck', account_id: 'acct_orbit', opportunity_id: 'OPP-3001', assignee_id: 'user_priya', due_date: '2026-07-28', status: 'open', priority: 'medium' },
  ];
  const ins = db.prepare(`INSERT INTO tasks VALUES (?,?,?,?,?,?,?,?,?)`);
  for (const t of tasks) {
    ins.run(t.task_id, t.title, t.account_id, t.opportunity_id, t.assignee_id, t.due_date, t.status, t.priority, now);
    logChange(db, 'task', t.task_id, 'upsert', t);
  }
}

async function registerRoutes(app, db) {
  app.get('/v1/tasks', async (req) => {
    let sql = 'SELECT * FROM tasks WHERE 1=1';
    const params = [];
    if (req.query.assignee_id) { sql += ' AND assignee_id = ?'; params.push(req.query.assignee_id); }
    if (req.query.account_id) { sql += ' AND account_id = ?'; params.push(req.query.account_id); }
    if (req.query.status) { sql += ' AND status = ?'; params.push(req.query.status); }
    return paginateRows(db.prepare(sql).all(...params), { cursor: req.query.cursor, limit: Number(req.query.limit || 50) });
  });
  app.patch('/v1/tasks/:id', async (req) => {
    const body = req.body || {};
    const row = db.prepare('SELECT * FROM tasks WHERE task_id = ?').get(req.params.id);
    if (!row) return app.httpErrors.notFound('Task not found');
    const updated = { ...row, ...body, updated_at: new Date().toISOString() };
    db.prepare(`UPDATE tasks SET status=?, priority=?, assignee_id=?, updated_at=? WHERE task_id=?`)
      .run(updated.status, updated.priority, updated.assignee_id, updated.updated_at, req.params.id);
    logChange(db, 'task', req.params.id, 'update', updated);
    await emitWebhooks(db, 'task.updated', updated);
    return updated;
  });
}

export async function createApp(opts = {}) {
  const dbPath = opts.dbPath || process.env.DB_PATH || path.join(__dirname, 'data', 'tasks.sqlite');
  const db = openDatabase(dbPath, SCHEMA);
  seed(db);
  return createServiceApp({ serviceName: 'mock-tasks', db, resources: ['tasks'], registerRoutes });
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const app = await createApp();
  await app.listen({ port: PORT, host: '0.0.0.0' });
}
