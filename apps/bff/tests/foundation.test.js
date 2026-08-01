import test from 'node:test';
import assert from 'node:assert/strict';
import { buildApp } from '../src/index.js';
import { closePool } from '../src/db.js';

test('GET /health does not require auth', async (t) => {
  const app = await buildApp();
  t.after(async () => {
    await app.close();
    await closePool();
  });

  const res = await app.inject({ method: 'GET', url: '/health' });
  assert.equal(res.statusCode, 200);
  const body = res.json();
  assert.equal(body.status, 'ok');
  assert.equal(body.service, 'meetingiq-bff');
  assert.equal(body.phase, '7-ai-experiences');
});

test('GET /api/me resolves Alex with hierarchy and entitlements', async (t) => {
  const app = await buildApp();
  t.after(async () => {
    await app.close();
    await closePool();
  });

  const res = await app.inject({
    method: 'GET',
    url: '/api/me',
    headers: { 'x-meetingiq-user-id': 'user_alex' },
  });

  assert.equal(res.statusCode, 200);
  const body = res.json();
  assert.equal(body.user.display_name, 'Alex');
  assert.equal(body.user.role, 'ae');
  assert.ok(body.user.entitlements.includes('meetingiq.read'));
  assert.ok(body.user.territory_ids.includes('terr_west'));
  assert.deepEqual(body.user.visible_user_ids, ['user_alex']);
});

test('GET /api/me manager sees direct reports in visible_user_ids', async (t) => {
  const app = await buildApp();
  t.after(async () => {
    await app.close();
    await closePool();
  });

  const res = await app.inject({
    method: 'GET',
    url: '/api/me',
    headers: { 'x-meetingiq-user-id': 'user_manager_1' },
  });

  assert.equal(res.statusCode, 200);
  const ids = res.json().user.visible_user_ids;
  assert.ok(ids.includes('user_manager_1'));
  assert.ok(ids.includes('user_alex'));
  assert.ok(ids.includes('user_priya'));
});

test('GET /api/me unknown user returns 401', async (t) => {
  const app = await buildApp();
  t.after(async () => {
    await app.close();
    await closePool();
  });

  const res = await app.inject({
    method: 'GET',
    url: '/api/me',
    headers: { 'x-meetingiq-user-id': 'user_does_not_exist' },
  });

  assert.equal(res.statusCode, 401);
});

test('GET /api/platform/db confirms identity schema seeded', async (t) => {
  const app = await buildApp();
  t.after(async () => {
    await app.close();
    await closePool();
  });

  const res = await app.inject({
    method: 'GET',
    url: '/api/platform/db',
    headers: { 'x-meetingiq-user-id': 'user_alex' },
  });

  assert.equal(res.statusCode, 200);
  assert.ok(res.json().user_count >= 7);
});

test('GET /api/platform/zambyl reports connectivity', async (t) => {
  const app = await buildApp();
  t.after(async () => {
    await app.close();
    await closePool();
  });

  const res = await app.inject({
    method: 'GET',
    url: '/api/platform/zambyl',
    headers: { 'x-meetingiq-user-id': 'user_alex' },
  });

  assert.equal(res.statusCode, 200);
  const body = res.json();
  assert.ok('connected' in body);
  assert.ok(body.zambyl_headers_used['x-entitlements'].includes('meetingiq.read'));
  if (body.connected) {
    assert.ok(body.catalog.route_count >= 5);
  }
});
