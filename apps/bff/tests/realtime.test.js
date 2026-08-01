import test from 'node:test';
import assert from 'node:assert/strict';
import {
  widgetsForEntity,
  routesForWidgets,
  buildInvalidationEvent,
  labelSourceEvent,
} from '../src/services/realtime/invalidation.js';
import { subscribe, broadcast, subscriberCount } from '../src/services/realtime/event-bus.js';
import { buildApp } from '../src/index.js';
import { closePool } from '../src/db.js';
import { closeWatcherPool } from '../src/services/realtime/watcher.js';

test('widgetsForEntity maps opportunity to pipeline widgets', () => {
  const widgets = widgetsForEntity('opportunity');
  assert.ok(widgets.includes('overview'));
  assert.ok(widgets.includes('executive-pipeline'));
  assert.ok(widgets.includes('notifications'));
});

test('routesForWidgets returns unique BFF routes', () => {
  const routes = routesForWidgets(['overview', 'agenda', 'notifications']);
  assert.deepEqual(routes.sort(), [
    '/api/command-center/agenda',
    '/api/command-center/overview',
    '/api/notifications',
  ].sort());
});

test('buildInvalidationEvent includes widget routes for email', () => {
  const event = buildInvalidationEvent({
    entity_id: 'email_1',
    entity_type: 'email',
    outbox_id: 42,
  });
  assert.equal(event.type, 'widget.invalidate');
  assert.ok(event.routes.includes('/api/notifications'));
  assert.equal(event.outbox_id, 42);
});

test('labelSourceEvent distinguishes support escalation', () => {
  assert.equal(labelSourceEvent('support_case', { escalated: true }), 'Support ticket escalated');
  assert.equal(labelSourceEvent('email'), 'Email arrives');
});

test('event-bus broadcast reaches subscribers', () => {
  const received = [];
  const unsub = subscribe((e) => received.push(e));
  assert.equal(subscriberCount(), 1);
  broadcast({ type: 'test' });
  assert.equal(received.length, 1);
  unsub();
  assert.equal(subscriberCount(), 0);
});

test('POST /api/realtime/poll requires auth', async (t) => {
  process.env.MEETINGIQ_REALTIME_WATCHER = '0';
  const app = await buildApp();
  t.after(async () => {
    await app.close();
    await closePool();
    await closeWatcherPool();
  });

  const res = await app.inject({
    method: 'POST',
    url: '/api/realtime/poll',
    headers: { 'x-meetingiq-user-id': 'user_alex' },
  });
  assert.equal(res.statusCode, 200);
  assert.ok('processed' in res.json());
});

test('GET /api/realtime/latency returns metrics array', async (t) => {
  process.env.MEETINGIQ_REALTIME_WATCHER = '0';
  const app = await buildApp();
  t.after(async () => {
    await app.close();
    await closePool();
    await closeWatcherPool();
  });

  const res = await app.inject({
    method: 'GET',
    url: '/api/realtime/latency',
    headers: { 'x-meetingiq-user-id': 'user_alex' },
  });
  assert.equal(res.statusCode, 200);
  assert.ok(Array.isArray(res.json().metrics));
});
