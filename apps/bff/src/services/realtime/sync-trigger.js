import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../../../../');

export async function triggerIncrementalSync() {
  const gateway = process.env.ZAMBYL_API_URL || 'http://localhost:8080';
  const adminKey = process.env.ZAMBYL_ADMIN_KEY || 'dev-admin-key';
  const connections = JSON.parse(
    fs.readFileSync(path.join(repoRoot, 'registries/connections.json'), 'utf8'),
  );

  let totalWritten = 0;
  let totalProjections = 0;
  for (const conn of connections) {
    const res = await fetch(`${gateway}/v1/admin/connections/${conn.connection_id}/sync`, {
      method: 'POST',
      headers: { 'content-type': 'application/json', 'x-admin-key': adminKey },
      body: JSON.stringify({ mode: 'incremental' }),
    });
    if (res.ok) {
      const body = await res.json();
      totalWritten += body.records_written || 0;
      totalProjections += body.projections_processed || 0;
    }
  }
  return { records_written: totalWritten, projections_processed: totalProjections };
}
