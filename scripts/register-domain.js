#!/usr/bin/env node
/**
 * Register MeetingIQ domain package, profiles, policies, and templates in Zambyl.
 * Does not modify zambyl-core — writes to Zambyl registry tables + admin API only.
 *
 * Usage:
 *   ZAMBYL_DATABASE_URL=postgres://zambyl:zambyl@localhost:5432/zambyl \
 *   ZAMBYL_API_URL=http://localhost:8080 \
 *   ZAMBYL_ADMIN_KEY=dev-admin-key \
 *   node scripts/register-domain.js
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import pg from 'pg';
import yaml from 'yaml';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, '..');
const { Pool } = pg;

const gateway = process.env.ZAMBYL_API_URL || 'http://localhost:8080';
const adminKey = process.env.ZAMBYL_ADMIN_KEY || 'dev-admin-key';

function loadJson(rel) {
  return JSON.parse(fs.readFileSync(path.join(repoRoot, rel), 'utf8'));
}

function loadYaml(rel) {
  return yaml.parse(fs.readFileSync(path.join(repoRoot, rel), 'utf8'));
}

async function registerDataProfile(pool, row) {
  await pool.query(
    `INSERT INTO data_profiles (profile_id, version, profile_kind, spec)
     VALUES ($1,$2,$3,$4)
     ON CONFLICT (profile_id, version) DO UPDATE SET spec = EXCLUDED.spec`,
    [row.profile_id, row.version || '1.0.0', row.spec.profile_kind || 'knowledge.get', JSON.stringify(row.spec)],
  );
}

async function registerSearchProfile(pool, profile) {
  await pool.query(
    `INSERT INTO search_profiles (profile_id, corpus_id, description, required_entitlements, allowed_classifications, ranking_contract, hybrid_config)
     VALUES ($1,$2,$3,$4,$5,$6,$7)
     ON CONFLICT (profile_id) DO UPDATE SET
       corpus_id = EXCLUDED.corpus_id,
       description = EXCLUDED.description,
       required_entitlements = EXCLUDED.required_entitlements,
       allowed_classifications = EXCLUDED.allowed_classifications`,
    [
      profile.profile_id,
      profile.corpus_id,
      profile.description || null,
      profile.required_entitlements || [],
      profile.allowed_classifications || ['internal'],
      JSON.stringify(profile.ranking_contract || {}),
      JSON.stringify(profile.hybrid_config || { lexicalWeight: 0.6, semanticWeight: 0.4 }),
    ],
  );
}

async function registerAnalyticsProfile(pool, profile) {
  const spec = profile.spec;
  await pool.query(
    `INSERT INTO analytics_profiles (profile_id, description, method_version, required_entitlements, rule_set, simulation_config, spec)
     VALUES ($1,$2,$3,$4,$5,$6,$7)
     ON CONFLICT (profile_id) DO UPDATE SET
       description = EXCLUDED.description,
       method_version = EXCLUDED.method_version,
       required_entitlements = EXCLUDED.required_entitlements,
       rule_set = EXCLUDED.rule_set,
       simulation_config = EXCLUDED.simulation_config,
       spec = EXCLUDED.spec`,
    [
      profile.profile_id,
      profile.description || null,
      profile.method_version,
      profile.required_entitlements || [],
      JSON.stringify(spec.rule_set || []),
      JSON.stringify(spec.simulation || {}),
      JSON.stringify(spec),
    ],
  );
}

async function registerPolicyBundle(pool, row) {
  await pool.query(
    `INSERT INTO policy_registry (policy_id, version, policy_kind, spec)
     VALUES ($1,$2,$3,$4)
     ON CONFLICT (policy_id, version) DO UPDATE SET spec = EXCLUDED.spec`,
    [row.policy_id, row.version, row.policy_kind, JSON.stringify(row.spec)],
  );
}

async function registerTemplate(pool, templateId, spec) {
  await pool.query(
    `INSERT INTO template_registry (template_id, version, template_kind, spec, output_schema)
     VALUES ($1,$2,$3,$4,$5)
     ON CONFLICT (template_id, version) DO UPDATE SET spec = EXCLUDED.spec, output_schema = EXCLUDED.output_schema`,
    [templateId, '1.0.0', spec.template_kind || 'output', JSON.stringify(spec), JSON.stringify(spec.output_schema || {})],
  );
}

async function registerAndActivateDomain(manifest) {
  const regRes = await fetch(`${gateway}/v1/admin/domains/register`, {
    method: 'POST',
    headers: { 'content-type': 'application/json', 'x-admin-key': adminKey },
    body: JSON.stringify({ manifest }),
  });
  const regBody = await regRes.json().catch(() => ({}));
  if (!regRes.ok) throw new Error(`Domain register failed: ${regRes.status} ${JSON.stringify(regBody)}`);

  const actRes = await fetch(`${gateway}/v1/admin/domains/${manifest.metadata.id}/activate`, {
    method: 'POST',
    headers: { 'content-type': 'application/json', 'x-admin-key': adminKey },
    body: JSON.stringify({ channel: 'stable', version: manifest.metadata.version }),
  });
  const actBody = await actRes.json().catch(() => ({}));
  if (!actRes.ok) throw new Error(`Domain activate failed: ${actRes.status} ${JSON.stringify(actBody)}`);

  return { registered: regBody, activated: actBody };
}

async function main() {
  const databaseUrl = process.env.ZAMBYL_DATABASE_URL || 'postgres://zambyl:zambyl@localhost:5432/zambyl';
  const pool = new Pool({ connectionString: databaseUrl });

  const dataProfiles = loadJson('registries/data-profiles.json');
  const searchProfiles = loadJson('registries/search-profiles.json');
  const analyticsProfiles = loadJson('registries/analytics-profiles.json');
  const policyBundles = loadJson('registries/policy-bundles.json');
  const manifest = loadYaml('packages/domain/package.yaml');

  for (const row of dataProfiles) {
    await registerDataProfile(pool, row);
    console.log(`Registered data profile ${row.profile_id}`);
  }

  for (const row of searchProfiles) {
    await registerSearchProfile(pool, row);
    console.log(`Registered search profile ${row.profile_id}`);
  }

  for (const row of analyticsProfiles) {
    await registerAnalyticsProfile(pool, row);
    console.log(`Registered analytics profile ${row.profile_id}`);
  }

  for (const row of policyBundles) {
    await registerPolicyBundle(pool, row);
    console.log(`Registered policy bundle ${row.policy_id}`);
  }

  const templatesDir = path.join(repoRoot, 'registries/templates');
  for (const file of fs.readdirSync(templatesDir).filter((f) => f.endsWith('.json'))) {
    const templateId = file.replace('.json', '');
    const spec = JSON.parse(fs.readFileSync(path.join(templatesDir, file), 'utf8'));
    await registerTemplate(pool, templateId, spec);
    console.log(`Registered template ${templateId}`);
  }

  await pool.end();

  const domain = await registerAndActivateDomain(manifest);
  console.log(`Registered domain ${manifest.metadata.id}@${manifest.metadata.version}`);
  console.log(`Activated on stable: ${JSON.stringify(domain.activated)}`);
  console.log('\nDone.');
}

main().catch((err) => {
  console.error(err.message || err);
  process.exit(1);
});
