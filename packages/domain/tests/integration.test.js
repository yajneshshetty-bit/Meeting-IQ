import test from 'node:test';
import assert from 'node:assert/strict';
import pg from 'pg';

const gateway = process.env.ZAMBYL_API_URL || 'http://localhost:8080';
const apiKey = process.env.TEST_HARNESS_API_KEY || 'test-harness-key';

test('domain package activated and search returns ingested MeetingIQ data', async (t) => {
  if (!process.env.ZAMBYL_INTEGRATION) {
    t.skip('Set ZAMBYL_INTEGRATION=1 with Zambyl running and connectors synced');
    return;
  }

  const pool = new pg.Pool({
    connectionString: process.env.ZAMBYL_DATABASE_URL || 'postgres://zambyl:zambyl@localhost:5432/zambyl',
  });
  t.after(async () => pool.end());

  const activation = await pool.query(
    `SELECT version FROM domain_activations WHERE domain_id = 'meetingiq' AND channel = 'stable'`,
  );
  assert.ok(activation.rows.length > 0, 'meetingiq domain should be activated on stable');

  const res = await fetch(`${gateway}/v1/search:query`, {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      'x-api-key': apiKey,
      'x-workload-id': 'meetingiq-bff',
      'x-entitlements': 'meetingiq.read,meetingiq.execute',
    },
    body: JSON.stringify({
      profile: 'meetingiq.pipeline-v1',
      query: 'Command Platform',
      limit: 5,
    }),
  });

  assert.equal(res.status, 200);
  const body = await res.json();
  assert.ok(body.results.length >= 1, 'search should return ingested opportunity data');
  assert.equal(body.metadata.corpus_id, 'meetingiq-corpus-opportunities');
});
