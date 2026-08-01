import test from 'node:test';
import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import pg from 'pg';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, '../..');
const ZAMBYL_ROOT = process.env.ZAMBYL_ROOT || '/home/hp/Desktop/Zambyl';

test('Zambyl ingestion pipeline: register, sync, search index populated', async (t) => {
  if (!process.env.ZAMBYL_INTEGRATION) {
    t.skip('Set ZAMBYL_INTEGRATION=1 with Zambyl + mock services running');
    return;
  }

  const databaseUrl = process.env.ZAMBYL_DATABASE_URL || 'postgres://zambyl:zambyl@localhost:5432/zambyl';
  const gateway = process.env.ZAMBYL_API_URL || 'http://localhost:8080';

  // Register plugins + connections + search profiles
  await runNode(path.join(repoRoot, 'scripts/register-connectors.js'), {
    ZAMBYL_DATABASE_URL: databaseUrl,
  });

  // Bootstrap platform in Zambyl context to load new plugins, then sync
  await runNode(path.join(repoRoot, 'scripts/zambyl-bootstrap-sync.js'), {
    ZAMBYL_ROOT,
    ZAMBYL_DATABASE_URL: databaseUrl,
    ZAMBYL_API_URL: gateway,
    ZAMBYL_ADMIN_KEY: process.env.ZAMBYL_ADMIN_KEY || 'dev-admin-key',
  });

  const pool = new pg.Pool({ connectionString: databaseUrl });
  t.after(async () => pool.end());

  const canonical = await pool.query(
    `SELECT COUNT(*)::int AS c FROM canonical_entities WHERE source_ref LIKE 'conn_meetingiq_%'`,
  );
  assert.ok(canonical.rows[0].c > 0, 'canonical entities should be populated');

  const search = await pool.query(`SELECT COUNT(*)::int AS c FROM search_documents WHERE corpus_id LIKE 'meetingiq-%'`);
  assert.ok(search.rows[0].c > 0, 'search_documents should be populated for meetingiq corpora');

  // Incremental sync after mock change
  const crmRes = await fetch('http://localhost:4001/v1/opportunities/OPP-1842', {
    method: 'PATCH',
    headers: { 'content-type': 'application/json', 'x-api-key': 'mock-enterprise-key' },
    body: JSON.stringify({ probability: 0.5, risk_level: 'at_risk' }),
  });
  assert.ok(crmRes.ok, 'mock CRM patch should succeed');

  await runNode(path.join(repoRoot, 'scripts/zambyl-bootstrap-sync.js'), {
    ZAMBYL_ROOT,
    ZAMBYL_DATABASE_URL: databaseUrl,
  }, ['incremental']);

  const afterIncr = await pool.query(
    `SELECT COUNT(*)::int AS c FROM sync_jobs WHERE connection_id = 'conn_meetingiq_crm' AND mode = 'incremental' AND status = 'succeeded'`,
  );
  assert.ok(afterIncr.rows[0].c >= 1, 'incremental CRM sync should succeed');
});

function runNode(script, env, args = []) {
  return new Promise((resolve, reject) => {
    const child = spawn(process.execPath, [script, ...args], {
      env: { ...process.env, ...env },
      stdio: 'inherit',
    });
    child.on('exit', (code) => (code === 0 ? resolve() : reject(new Error(`${script} exited ${code}`))));
  });
}
