import test from 'node:test';
import assert from 'node:assert/strict';
import os from 'node:os';
import path from 'node:path';
import { API_KEY } from '../seed/enterprise-manifest.js';
import { createApp as createCrmApp } from '../crm/index.js';
import { createApp as createCalendarApp } from '../calendar/index.js';
import { createApp as createMailApp } from '../mail/index.js';
import { createApp as createSlackApp } from '../slack/index.js';
import { createApp as createDocumentsApp } from '../documents/index.js';
import { createApp as createTasksApp } from '../tasks/index.js';
import { createApp as createSupportApp } from '../support/index.js';
import { createApp as createErpApp } from '../erp/index.js';
import { createApp as createIdentityApp } from '../identity/index.js';
import { createApp as createSimulatorApp } from '../event-simulator/index.js';

const AUTH = { 'x-api-key': API_KEY };

function tempDb(name) {
  return path.join(os.tmpdir(), `meetingiq-mock-${name}-${Date.now()}.sqlite`);
}

const SERVICES = [
  { name: 'mock-crm', createApp: createCrmApp, listPath: '/v1/accounts' },
  { name: 'mock-calendar', createApp: createCalendarApp, listPath: '/v1/meetings' },
  { name: 'mock-mail', createApp: createMailApp, listPath: '/v1/threads' },
  { name: 'mock-slack', createApp: createSlackApp, listPath: '/v1/channels' },
  { name: 'mock-documents', createApp: createDocumentsApp, listPath: '/v1/documents' },
  { name: 'mock-tasks', createApp: createTasksApp, listPath: '/v1/tasks' },
  { name: 'mock-support', createApp: createSupportApp, listPath: '/v1/tickets' },
  { name: 'mock-erp', createApp: createErpApp, listPath: '/v1/orders' },
  { name: 'mock-identity', createApp: createIdentityApp, listPath: '/v1/users' },
];

for (const svc of SERVICES) {
  test(`${svc.name}: health, auth, openapi, delta, list`, async (t) => {
    process.env.MOCK_SIMULATE_LATENCY = '0';
    const app = await svc.createApp({ dbPath: tempDb(svc.name) });
    t.after(async () => app.close());

    const health = await app.inject({ method: 'GET', url: '/health' });
    assert.equal(health.statusCode, 200);
    assert.equal(health.json().service, svc.name);

    const unauth = await app.inject({ method: 'GET', url: svc.listPath });
    assert.equal(unauth.statusCode, 401);

    const list = await app.inject({ method: 'GET', url: svc.listPath, headers: AUTH });
    assert.equal(list.statusCode, 200);
    assert.ok(Array.isArray(list.json().records));
    assert.ok(list.json().records.length > 0);

    const openapi = await app.inject({ method: 'GET', url: '/openapi.json', headers: AUTH });
    assert.equal(openapi.statusCode, 200);
    assert.equal(openapi.json().openapi, '3.0.3');

    const delta = await app.inject({ method: 'GET', url: '/v1/delta', headers: AUTH });
    assert.equal(delta.statusCode, 200);
    assert.ok(Array.isArray(delta.json().changes));
    assert.ok(delta.json().changes.length > 0);
  });
}

test('mock-crm: filter opportunities by account', async (t) => {
  process.env.MOCK_SIMULATE_LATENCY = '0';
  const app = await createCrmApp({ dbPath: tempDb('crm-filter') });
  t.after(async () => app.close());

  const res = await app.inject({
    method: 'GET',
    url: '/v1/opportunities?account_id=acct_acme',
    headers: AUTH,
  });
  assert.equal(res.statusCode, 200);
  const records = res.json().records;
  assert.ok(records.every((o) => o.account_id === 'acct_acme'));
  assert.ok(records.some((o) => o.opportunity_id === 'OPP-1842'));
});

function listenUrl(addr) {
  return addr.startsWith('http') ? addr : `http://${addr}`;
}

test('mock-event-simulator: lists and runs pre_meeting scenario against injected services', async (t) => {
  process.env.MOCK_SIMULATE_LATENCY = '0';
  const crm = await createCrmApp({ dbPath: tempDb('sim-crm') });
  const mail = await createMailApp({ dbPath: tempDb('sim-mail') });
  const support = await createSupportApp({ dbPath: tempDb('sim-support') });
  const slack = await createSlackApp({ dbPath: tempDb('sim-slack') });
  const tasks = await createTasksApp({ dbPath: tempDb('sim-tasks') });

  const crmAddr = await crm.listen({ port: 0, host: '127.0.0.1' });
  const mailAddr = await mail.listen({ port: 0, host: '127.0.0.1' });
  const supportAddr = await support.listen({ port: 0, host: '127.0.0.1' });
  const slackAddr = await slack.listen({ port: 0, host: '127.0.0.1' });
  const tasksAddr = await tasks.listen({ port: 0, host: '127.0.0.1' });

  t.after(async () => {
    await crm.close();
    await mail.close();
    await support.close();
    await slack.close();
    await tasks.close();
  });

  process.env.MOCK_CRM_URL = listenUrl(crmAddr);
  process.env.MOCK_MAIL_URL = listenUrl(mailAddr);
  process.env.MOCK_SUPPORT_URL = listenUrl(supportAddr);
  process.env.MOCK_SLACK_URL = listenUrl(slackAddr);
  process.env.MOCK_TASKS_URL = listenUrl(tasksAddr);

  const sim = await createSimulatorApp();
  t.after(async () => sim.close());

  const list = await sim.inject({ method: 'GET', url: '/v1/scenarios' });
  assert.ok(list.json().scenarios.includes('pre_meeting'));

  const run = await sim.inject({ method: 'POST', url: '/v1/scenarios/pre_meeting/run' });
  assert.equal(run.statusCode, 200);
  const body = run.json();
  assert.equal(body.scenario, 'pre_meeting');
  assert.ok(body.results.every((r) => r.status >= 200 && r.status < 300));
});
