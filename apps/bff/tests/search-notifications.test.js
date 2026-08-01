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

test('GET /api/search returns results with freshness', async (t) => {
  await withApp(t, async (app) => {
    const res = await app.inject({
      method: 'GET',
      url: '/api/search?q=Acme',
      headers: { 'x-meetingiq-user-id': 'user_alex' },
    });
    assert.equal(res.statusCode, 200);
    const body = res.json();
    assert.ok(body.freshness);
    assert.ok(Array.isArray(body.data.results));
  });
});

test('GET /api/notifications returns queue with filters', async (t) => {
  await withApp(t, async (app) => {
    const res = await app.inject({
      method: 'GET',
      url: '/api/notifications',
      headers: { 'x-meetingiq-user-id': 'user_alex' },
    });
    assert.equal(res.statusCode, 200);
    const body = res.json();
    assert.ok(body.data.filters);
    assert.ok(Array.isArray(body.data.items));
  });
});

test('support forbidden on search', async (t) => {
  await withApp(t, async (app) => {
    const res = await app.inject({
      method: 'GET',
      url: '/api/search',
      headers: { 'x-meetingiq-user-id': 'user_support' },
    });
    assert.equal(res.statusCode, 403);
  });
});
