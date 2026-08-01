import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { openDatabase, logChange, paginateRows, emitWebhooks } from '@meetingiq/mock-common';
import { createServiceApp } from '@meetingiq/mock-common/server.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PORT = Number(process.env.PORT || 4005);

const SCHEMA = `
CREATE TABLE IF NOT EXISTS documents (
  document_id TEXT PRIMARY KEY, title TEXT, document_type TEXT, account_id TEXT,
  opportunity_id TEXT, version INTEGER, status TEXT, file_size_bytes INTEGER, updated_at TEXT
);
`;

function seed(db) {
  if (db.prepare('SELECT COUNT(*) AS c FROM documents').get().c > 0) return;
  const now = new Date().toISOString();
  const docs = [
    { document_id: 'doc_acme_msa', title: 'Acme Corp MSA v3', document_type: 'contract', account_id: 'acct_acme', opportunity_id: 'OPP-1842', version: 3, status: 'in_review', file_size_bytes: 245000 },
    { document_id: 'doc_acme_prop', title: 'Command Platform Proposal', document_type: 'proposal', account_id: 'acct_acme', opportunity_id: 'OPP-1842', version: 2, status: 'sent', file_size_bytes: 890000 },
    { document_id: 'doc_granite_sow', title: 'InsightVM SOW', document_type: 'contract', account_id: 'acct_granite', opportunity_id: 'OPP-2009', version: 1, status: 'executed', file_size_bytes: 120000 },
    { document_id: 'doc_helion_redline', title: 'Helion Redline — Exposure Command', document_type: 'contract', account_id: 'acct_helion', opportunity_id: 'OPP-2811', version: 4, status: 'rejected', file_size_bytes: 310000 },
  ];
  const ins = db.prepare(`INSERT INTO documents VALUES (?,?,?,?,?,?,?,?,?)`);
  for (const d of docs) {
    ins.run(d.document_id, d.title, d.document_type, d.account_id, d.opportunity_id, d.version, d.status, d.file_size_bytes, now);
    logChange(db, 'document', d.document_id, 'upsert', d);
  }
}

async function registerRoutes(app, db) {
  app.get('/v1/documents', async (req) => {
    let sql = 'SELECT * FROM documents WHERE 1=1';
    const params = [];
    if (req.query.account_id) { sql += ' AND account_id = ?'; params.push(req.query.account_id); }
    if (req.query.opportunity_id) { sql += ' AND opportunity_id = ?'; params.push(req.query.opportunity_id); }
    if (req.query.document_type) { sql += ' AND document_type = ?'; params.push(req.query.document_type); }
    return paginateRows(db.prepare(sql).all(...params), { cursor: req.query.cursor, limit: Number(req.query.limit || 50) });
  });
  app.patch('/v1/documents/:id', async (req) => {
    const body = req.body || {};
    const row = db.prepare('SELECT * FROM documents WHERE document_id = ?').get(req.params.id);
    if (!row) return app.httpErrors.notFound('Document not found');
    const updated = { ...row, ...body, version: body.version ?? row.version, updated_at: new Date().toISOString() };
    db.prepare(`UPDATE documents SET status=?, version=?, updated_at=? WHERE document_id=?`)
      .run(updated.status, updated.version, updated.updated_at, req.params.id);
    logChange(db, 'document', req.params.id, 'update', updated);
    await emitWebhooks(db, 'document.updated', updated);
    return updated;
  });
}

export async function createApp(opts = {}) {
  const dbPath = opts.dbPath || process.env.DB_PATH || path.join(__dirname, 'data', 'documents.sqlite');
  const db = openDatabase(dbPath, SCHEMA);
  seed(db);
  return createServiceApp({ serviceName: 'mock-documents', db, resources: ['documents'], registerRoutes });
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const app = await createApp();
  await app.listen({ port: PORT, host: '0.0.0.0' });
}
