#!/usr/bin/env node
/**
 * Register MeetingIQ connector plugins, connections, and search profiles in Zambyl Postgres.
 * Does not modify zambyl-core — writes to Zambyl registry tables only.
 *
 * Usage:
 *   ZAMBYL_DATABASE_URL=postgres://zambyl:zambyl@localhost:5432/zambyl node scripts/register-connectors.js
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import pg from 'pg';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, '..');

const { Pool } = pg;

function loadJson(rel) {
  return JSON.parse(fs.readFileSync(path.join(repoRoot, rel), 'utf8'));
}

function resolveModulePath(relPath) {
  const abs = path.join(repoRoot, relPath);
  return pathToFileURL(abs).href;
}

async function registerPlugin(pool, row) {
  const modulePath = resolveModulePath(row.module_path);
  await pool.query(
    `INSERT INTO connector_plugins (plugin_id, version, manifest, module_path, capabilities, health_status)
     VALUES ($1,$2,$3,$4,$5,'healthy')
     ON CONFLICT (plugin_id, version) DO UPDATE SET
       manifest = EXCLUDED.manifest,
       module_path = EXCLUDED.module_path,
       capabilities = EXCLUDED.capabilities`,
    [row.plugin_id, row.version, JSON.stringify(row.manifest), modulePath, row.capabilities || []],
  );
  await pool.query(
    `INSERT INTO connector_catalog (connector_id, version, manifest, capabilities)
     VALUES ($1,$2,$3,$4)
     ON CONFLICT (connector_id, version) DO UPDATE SET manifest = EXCLUDED.manifest, capabilities = EXCLUDED.capabilities`,
    [row.manifest.connector_id, row.version, JSON.stringify(row.manifest), row.capabilities || []],
  );
}

async function registerConnection(pool, conn) {
  await pool.query(
    `INSERT INTO connections (connection_id, connector_id, connector_version, name, config, policy_scope, checkpoint, status)
     VALUES ($1,$2,$3,$4,$5,$6,$7,'active')
     ON CONFLICT (connection_id) DO UPDATE SET
       config = EXCLUDED.config,
       policy_scope = EXCLUDED.policy_scope,
       updated_at = NOW()`,
    [
      conn.connection_id,
      conn.connector_id,
      conn.connector_version,
      conn.name,
      JSON.stringify(conn.config || {}),
      JSON.stringify(conn.policy_scope || {}),
      JSON.stringify(conn.checkpoint || {}),
    ],
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

async function main() {
  const databaseUrl = process.env.ZAMBYL_DATABASE_URL || 'postgres://zambyl:zambyl@localhost:5432/zambyl';
  const pool = new Pool({ connectionString: databaseUrl });

  const plugins = loadJson('registries/connector-plugin-bindings.json');
  const connections = loadJson('registries/connections.json');
  const profiles = loadJson('registries/search-profiles.json');

  for (const row of plugins) {
    await registerPlugin(pool, row);
    console.log(`Registered plugin ${row.plugin_id}@${row.version}`);
  }

  for (const conn of connections) {
    await registerConnection(pool, conn);
    console.log(`Registered connection ${conn.connection_id}`);
  }

  for (const profile of profiles) {
    await registerSearchProfile(pool, profile);
    console.log(`Registered search profile ${profile.profile_id}`);
  }

  await pool.end();
  console.log('\nDone. Restart Zambyl gateway (or bootstrapPlatform force) then run: npm run connectors:sync');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
