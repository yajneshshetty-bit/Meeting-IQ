import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import yaml from 'yaml';
import { entitlementsForRole } from '../../../apps/bff/src/auth/entitlements.js';

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../..');

function loadJson(rel) {
  return JSON.parse(fs.readFileSync(path.join(repoRoot, rel), 'utf8'));
}

test('domain package manifest defines ontology and profiles', () => {
  const manifest = yaml.parse(fs.readFileSync(path.join(repoRoot, 'packages/domain/package.yaml'), 'utf8'));
  assert.equal(manifest.metadata.id, 'meetingiq');
  assert.equal(manifest.metadata.version, '1.0.0');
  assert.ok(manifest.ontology.entities.includes('opportunity'));
  assert.ok(manifest.ontology.entities.includes('meeting'));
  assert.equal(manifest.profiles.data.length, 4);
  assert.equal(manifest.profiles.search.length, 5);
  assert.equal(manifest.profiles.analytics.length, 3);
  assert.equal(manifest.policy.bundles.length, 6);
  assert.equal(manifest.templates.length, 5);
});

test('data profiles cover meetings, opportunities, accounts, communications', () => {
  const profiles = loadJson('registries/data-profiles.json');
  assert.equal(profiles.length, 4);
  const ids = profiles.map((p) => p.profile_id);
  assert.ok(ids.includes('meetingiq.meeting-profile'));
  assert.ok(ids.includes('meetingiq.opportunity-profile'));
});

test('analytics profiles include risk and forecast', () => {
  const profiles = loadJson('registries/analytics-profiles.json');
  assert.equal(profiles.length, 3);
  assert.ok(profiles.every((p) => p.spec.execution_mode));
});

test('policy bundles align with BFF role entitlements', () => {
  const policies = loadJson('registries/policy-bundles.json');
  const accessPolicies = policies.filter((p) => p.policy_kind === 'access');
  assert.equal(accessPolicies.length, 6);

  const aePolicy = accessPolicies.find((p) => p.spec.role === 'ae');
  assert.deepEqual(aePolicy.spec.entitlements.sort(), entitlementsForRole('ae').sort());

  const leaderPolicy = accessPolicies.find((p) => p.spec.role === 'leader');
  assert.ok(leaderPolicy.spec.entitlements.includes('meetingiq.executive.read'));
  assert.ok(entitlementsForRole('leader').includes('meetingiq.executive.read'));
});

test('templates define output schemas for Phase 7 experiences', () => {
  const dir = path.join(repoRoot, 'registries/templates');
  const files = fs.readdirSync(dir).filter((f) => f.endsWith('.json'));
  assert.equal(files.length, 5);
  for (const file of files) {
    const spec = JSON.parse(fs.readFileSync(path.join(dir, file), 'utf8'));
    assert.ok(spec.output_schema?.required?.length > 0);
    assert.equal(spec.template_kind, 'output');
  }
});

test('search profiles reference meetingiq corpora', () => {
  const profiles = loadJson('registries/search-profiles.json');
  assert.ok(profiles.every((p) => p.corpus_id.startsWith('meetingiq-corpus-')));
});
