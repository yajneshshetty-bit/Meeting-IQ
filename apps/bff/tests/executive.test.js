import test from 'node:test';
import assert from 'node:assert/strict';
import { buildApp } from '../src/index.js';
import { closePool } from '../src/db.js';
import { closeCanonicalPool } from '../src/services/canonical.js';

async function withApp(t, fn) {
  const app = await buildApp();
  t.after(async () => {
    await app.close();
    await closePool();
    await closeCanonicalPool();
  });
  return fn(app);
}

test('AE forbidden on executive pipeline', async (t) => {
  await withApp(t, async (app) => {
    const res = await app.inject({
      method: 'GET',
      url: '/api/executive/pipeline',
      headers: { 'x-meetingiq-user-id': 'user_alex' },
    });
    assert.equal(res.statusCode, 403);
  });
});

test('support forbidden on executive routes', async (t) => {
  await withApp(t, async (app) => {
    const res = await app.inject({
      method: 'GET',
      url: '/api/executive/forecast',
      headers: { 'x-meetingiq-user-id': 'user_support' },
    });
    assert.equal(res.statusCode, 403);
  });
});

test('leader executive pipeline returns rollups with freshness', async (t) => {
  await withApp(t, async (app) => {
    const res = await app.inject({
      method: 'GET',
      url: '/api/executive/pipeline',
      headers: { 'x-meetingiq-user-id': 'user_leader_1' },
    });
    assert.equal(res.statusCode, 200);
    const body = res.json();
    assert.ok(body.freshness);
    assert.equal(body.data.materialization_key, 'executive_pipeline');
    assert.ok('committed_pipeline' in body.data);
    assert.ok(Array.isArray(body.data.accounts));
  });
});

test('leader forecast returns AI-adjusted amounts', async (t) => {
  await withApp(t, async (app) => {
    const res = await app.inject({
      method: 'GET',
      url: '/api/executive/forecast',
      headers: { 'x-meetingiq-user-id': 'user_leader_1' },
    });
    assert.equal(res.statusCode, 200);
    const body = res.json();
    assert.equal(body.data.materialization_key, 'ai_forecast');
    assert.ok(body.data.committed_amount >= 0);
    assert.ok(body.data.ai_adjusted_amount >= 0);
  });
});

test('support diagnostics accessible to support only', async (t) => {
  await withApp(t, async (app) => {
    const denied = await app.inject({
      method: 'GET',
      url: '/api/support/diagnostics',
      headers: { 'x-meetingiq-user-id': 'user_alex' },
    });
    assert.equal(denied.statusCode, 403);

    const ok = await app.inject({
      method: 'GET',
      url: '/api/support/diagnostics',
      headers: { 'x-meetingiq-user-id': 'user_support' },
    });
    assert.equal(ok.statusCode, 200);
    assert.ok(Array.isArray(ok.json().data.tickets));
  });
});
