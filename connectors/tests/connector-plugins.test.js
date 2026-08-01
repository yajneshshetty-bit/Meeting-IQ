import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createProvider as createCrmProvider } from '../crm/plugin.js';
import { createProvider as createCalendarProvider } from '../calendar/plugin.js';
import { createProvider as createMailProvider } from '../mail/plugin.js';
import { createProvider as createSlackProvider } from '../slack/plugin.js';
import { createProvider as createDocumentsProvider } from '../documents/plugin.js';
import { createProvider as createTasksProvider } from '../tasks/plugin.js';
import { createProvider as createSupportProvider } from '../support/plugin.js';
import { createProvider as createErpProvider } from '../erp/plugin.js';
import { createProvider as createIdentityProvider } from '../identity/plugin.js';
import { mapCrmChange } from '../common/mappers.js';

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');

const CONNECTORS = [
  { name: 'meetingiq.crm', create: createCrmProvider },
  { name: 'meetingiq.calendar', create: createCalendarProvider },
  { name: 'meetingiq.mail', create: createMailProvider },
  { name: 'meetingiq.slack', create: createSlackProvider },
  { name: 'meetingiq.documents', create: createDocumentsProvider },
  { name: 'meetingiq.tasks', create: createTasksProvider },
  { name: 'meetingiq.support', create: createSupportProvider },
  { name: 'meetingiq.erp', create: createErpProvider },
  { name: 'meetingiq.identity', create: createIdentityProvider },
];

const MOCK_DELTA = {
  changes: [
    {
      change_id: 1,
      entity_type: 'opportunity',
      entity_id: 'OPP-1842',
      operation: 'upsert',
      changed_at: '2026-07-27T10:00:00Z',
      payload: {
        opportunity_id: 'OPP-1842',
        account_id: 'acct_acme',
        name: 'Command Platform',
        stage: 'negotiation',
        amount: 250000,
      },
    },
    {
      change_id: 2,
      entity_type: 'account',
      entity_id: 'acct_acme',
      operation: 'upsert',
      changed_at: '2026-07-27T10:01:00Z',
      payload: { account_id: 'acct_acme', name: 'Acme Corp', tier: 'enterprise' },
    },
  ],
  next_cursor: '2',
};

function mockConnection() {
  return {
    connection_id: 'conn_test',
    config: { base_url: 'http://mock.test', api_key: 'mock-enterprise-key' },
    policy_scope: {
      default_classification: 'internal',
      entitlements: ['meetingiq.read'],
      corpus_ids: ['meetingiq-corpus-opportunities'],
    },
    checkpoint: {},
  };
}

for (const { name, create } of CONNECTORS) {
  test(`${name}: exposes id, capabilities, healthCheck`, async () => {
    const plugin = create();
    assert.equal(plugin.id, name);
    assert.ok(plugin.capabilities.includes('BATCH_READ'));
    assert.ok(plugin.capabilities.includes('INCREMENTAL_READ'));
    const health = await plugin.healthCheck();
    assert.equal(health.healthy, true);
  });

  test(`${name}: batch sync maps delta changes to ingestion records`, async (t) => {
    const originalFetch = globalThis.fetch;
    t.after(() => { globalThis.fetch = originalFetch; });

    globalThis.fetch = async (url) => {
      assert.match(String(url), /\/v1\/delta\?cursor=0/);
      return {
        ok: true,
        async json() { return MOCK_DELTA; },
      };
    };

    const plugin = create();
    const result = await plugin.sync(mockConnection(), 'batch');
    assert.ok(result.records.length >= 1);
    assert.ok(result.records.every((r) => r.source_record_id && r.payload?.entity_id));
    assert.equal(result.cursor_after.change_id, 2);
  });

  test(`${name}: incremental sync uses checkpoint cursor`, async (t) => {
    const originalFetch = globalThis.fetch;
    t.after(() => { globalThis.fetch = originalFetch; });

    globalThis.fetch = async (url) => {
      assert.match(String(url), /cursor=2/);
      return {
        ok: true,
        async json() { return { changes: [], next_cursor: null }; },
      };
    };

    const plugin = create();
    const conn = { ...mockConnection(), checkpoint: { change_id: 2 } };
    const result = await plugin.sync(conn, 'incremental');
    assert.equal(result.records.length, 0);
    assert.equal(result.cursor_after.change_id, 2);
  });
}

test('mapCrmChange maps opportunity with corpus_ids', () => {
  const record = mapCrmChange(MOCK_DELTA.changes[0], mockConnection());
  assert.equal(record.payload.entity_type, 'opportunity');
  assert.equal(record.payload.entity_id, 'OPP-1842');
  assert.ok(record.payload.corpus_ids.includes('meetingiq-corpus-opportunities'));
  assert.equal(record.source_record_id, 'opportunity:OPP-1842');
});

test('registry bindings: 9 plugins defined', () => {
  const bindings = JSON.parse(fs.readFileSync(path.join(repoRoot, 'registries/connector-plugin-bindings.json'), 'utf8'));
  assert.equal(bindings.length, 9);
  const ids = bindings.map((b) => b.plugin_id);
  assert.ok(ids.includes('meetingiq.crm'));
  assert.ok(ids.includes('meetingiq.identity'));
});

test('connections registry: 9 connections with mock URLs', () => {
  const connections = JSON.parse(fs.readFileSync(path.join(repoRoot, 'registries/connections.json'), 'utf8'));
  assert.equal(connections.length, 9);
  assert.ok(connections.every((c) => c.config.base_url && c.config.api_key));
});
