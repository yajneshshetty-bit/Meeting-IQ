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

test('widget config CRUD for AE user', async (t) => {
  await withApp(t, async (app) => {
    const headers = { 'x-meetingiq-user-id': 'user_alex', 'content-type': 'application/json' };

    const create = await app.inject({
      method: 'PUT',
      url: '/api/widgets/config',
      headers,
      payload: {
        view: 'command_center',
        widget_key: 'pipeline_kpi',
        layout: { row: 0, col: 0, w: 4, h: 2 },
        settings: { show_trend: true },
      },
    });
    assert.equal(create.statusCode, 200);
    const configId = create.json().data.config.config_id;

    const list = await app.inject({
      method: 'GET',
      url: '/api/widgets/config?view=command_center',
      headers,
    });
    assert.equal(list.statusCode, 200);
    assert.ok(list.json().data.configs.length >= 1);

    const getOne = await app.inject({
      method: 'GET',
      url: `/api/widgets/config/${configId}`,
      headers,
    });
    assert.equal(getOne.statusCode, 200);
    assert.equal(getOne.json().data.config.widget_key, 'pipeline_kpi');

    const del = await app.inject({
      method: 'DELETE',
      url: `/api/widgets/config/${configId}`,
      headers: { 'x-meetingiq-user-id': 'user_alex' },
    });
    assert.equal(del.statusCode, 200);
    assert.equal(del.json().deleted, true);
  });
});

test('support forbidden on widget config', async (t) => {
  await withApp(t, async (app) => {
    const res = await app.inject({
      method: 'GET',
      url: '/api/widgets/config',
      headers: { 'x-meetingiq-user-id': 'user_support' },
    });
    assert.equal(res.statusCode, 403);
  });
});

test('PUT widget config requires view and widget_key', async (t) => {
  await withApp(t, async (app) => {
    const res = await app.inject({
      method: 'PUT',
      url: '/api/widgets/config',
      headers: { 'x-meetingiq-user-id': 'user_alex', 'content-type': 'application/json' },
      payload: { view: 'command_center' },
    });
    assert.equal(res.statusCode, 400);
  });
});
