import test from 'node:test';
import assert from 'node:assert/strict';
import { buildApp } from '../src/index.js';
import { closePool } from '../src/db.js';
import { closeCanonicalPool } from '../src/services/canonical.js';
import { AI_CATALOG } from '../src/services/experiences.js';

async function withApp(t, fn) {
  const app = await buildApp();
  t.after(async () => {
    await app.close();
    await closePool();
    await closeCanonicalPool();
  });
  return fn(app);
}

test('GET /api/ai/catalog lists 11 experiences', async (t) => {
  await withApp(t, async (app) => {
    const res = await app.inject({
      method: 'GET',
      url: '/api/ai/catalog',
      headers: { 'x-meetingiq-user-id': 'user_alex' },
    });
    assert.equal(res.statusCode, 200);
    assert.equal(res.json().experiences.length, AI_CATALOG.length);
  });
});

test('POST /api/ai/company-research requires account_id', async (t) => {
  await withApp(t, async (app) => {
    const res = await app.inject({
      method: 'POST',
      url: '/api/ai/company-research',
      headers: { 'x-meetingiq-user-id': 'user_alex', 'content-type': 'application/json' },
      payload: {},
    });
    assert.equal(res.statusCode, 400);
  });
});

test('POST /api/ai/forecast-explanation forbidden for AE', async (t) => {
  await withApp(t, async (app) => {
    const res = await app.inject({
      method: 'POST',
      url: '/api/ai/forecast-explanation',
      headers: { 'x-meetingiq-user-id': 'user_alex', 'content-type': 'application/json' },
      payload: { quarter: 'Q3-2026' },
    });
    assert.equal(res.statusCode, 403);
  });
});

test('POST /api/ai/company-research executes via Zambyl when integrated', async (t) => {
  if (!process.env.ZAMBYL_INTEGRATION || !process.env.OPENAI_API_KEY) {
    t.skip('Set ZAMBYL_INTEGRATION=1 and OPENAI_API_KEY with experiences registered');
    return;
  }

  await withApp(t, async (app) => {
    const res = await app.inject({
      method: 'POST',
      url: '/api/ai/company-research',
      headers: { 'x-meetingiq-user-id': 'user_alex', 'content-type': 'application/json' },
      payload: { account_id: 'acct_acme' },
    });
    assert.equal(res.statusCode, 200);
    const body = res.json();
    assert.ok(body.data.output?.summary || body.data.output);
    assert.ok(body.freshness);
  });
});
