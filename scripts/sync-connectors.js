#!/usr/bin/env node
/**
 * Trigger batch/incremental sync for all MeetingIQ connections via Zambyl admin API.
 *
 * Prerequisites:
 *   - Mock services running (npm run mock:start)
 *   - Connectors registered (npm run connectors:register)
 *   - Zambyl gateway restarted after registration
 *
 * Usage:
 *   ZAMBYL_API_URL=http://localhost:8080 ZAMBYL_ADMIN_KEY=dev-admin-key node scripts/sync-connectors.js
 *   node scripts/sync-connectors.js incremental   # incremental mode
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, '..');
const connections = JSON.parse(fs.readFileSync(path.join(repoRoot, 'registries/connections.json'), 'utf8'));

const gateway = process.env.ZAMBYL_API_URL || 'http://localhost:8080';
const adminKey = process.env.ZAMBYL_ADMIN_KEY || 'dev-admin-key';
const mode = process.argv[2] || 'batch';

async function syncConnection(connectionId) {
  const res = await fetch(`${gateway}/v1/admin/connections/${connectionId}/sync`, {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      'x-admin-key': adminKey,
    },
    body: JSON.stringify({ mode }),
  });
  const body = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(`${connectionId}: ${res.status} ${JSON.stringify(body)}`);
  }
  return body;
}

async function main() {
  console.log(`Syncing ${connections.length} connections (${mode}) via ${gateway}`);
  let totalWritten = 0;
  let totalProjections = 0;

  for (const conn of connections) {
    const result = await syncConnection(conn.connection_id);
    console.log(`  ${conn.connection_id}: ${result.records_written} records, ${result.projections_processed} projections`);
    totalWritten += result.records_written || 0;
    totalProjections += result.projections_processed || 0;
  }

  console.log(`\nTotal: ${totalWritten} records ingested, ${totalProjections} projections processed`);
}

main().catch((err) => {
  console.error(err.message || err);
  process.exit(1);
});
