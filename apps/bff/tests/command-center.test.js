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

function assertFreshness(body) {
  assert.ok(body.freshness, 'response must include freshness metadata');
  assert.ok(body.freshness.last_synced, 'freshness.last_synced required');
  assert.ok('pending_updates' in body.freshness);
  assert.ok(body.freshness.confidence);
}

test('GET /health reports phase 10', async (t) => {
  await withApp(t, async (app) => {
    const res = await app.inject({ method: 'GET', url: '/health' });
    assert.equal(res.statusCode, 200);
    assert.equal(res.json().phase, '10-production-ready');
  });
});

test('support role forbidden on command-center', async (t) => {
  await withApp(t, async (app) => {
    const res = await app.inject({
      method: 'GET',
      url: '/api/command-center/overview',
      headers: { 'x-meetingiq-user-id': 'user_support' },
    });
    assert.equal(res.statusCode, 403);
  });
});

test('AE command-center overview returns KPIs with freshness', async (t) => {
  await withApp(t, async (app) => {
    const res = await app.inject({
      method: 'GET',
      url: '/api/command-center/overview',
      headers: { 'x-meetingiq-user-id': 'user_alex' },
    });
    assert.equal(res.statusCode, 200);
    const body = res.json();
    assertFreshness(body);
    assert.ok(body.data.kpis);
    assert.equal(body.data.materialization_key, 'weekly_overview');
  });
});

test('command-center agenda returns meetings array', async (t) => {
  await withApp(t, async (app) => {
    const res = await app.inject({
      method: 'GET',
      url: '/api/command-center/agenda',
      headers: { 'x-meetingiq-user-id': 'user_alex' },
    });
    assert.equal(res.statusCode, 200);
    const body = res.json();
    assertFreshness(body);
    assert.ok(Array.isArray(body.data.meetings));
  });
});

test('AE scoped at-risk excludes org-wide deals when Zambyl connected', async (t) => {
  if (!process.env.ZAMBYL_INTEGRATION) {
    t.skip('Set ZAMBYL_INTEGRATION=1 with Zambyl synced');
    return;
  }

  await withApp(t, async (app) => {
    const [alexRes, leaderRes] = await Promise.all([
      app.inject({
        method: 'GET',
        url: '/api/command-center/at-risk',
        headers: { 'x-meetingiq-user-id': 'user_alex' },
      }),
      app.inject({
        method: 'GET',
        url: '/api/command-center/at-risk',
        headers: { 'x-meetingiq-user-id': 'user_leader_1' },
      }),
    ]);

    assert.equal(alexRes.statusCode, 200);
    assert.equal(leaderRes.statusCode, 200);
    const alexCount = alexRes.json().data.count;
    const leaderCount = leaderRes.json().data.count;
    assert.ok(leaderCount >= alexCount, 'VP should see at least as many at-risk deals as AE');
  });
});
