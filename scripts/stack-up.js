#!/usr/bin/env node
/**
 * Bring up full MeetingIQ stack and register platform artifacts.
 *
 * Prerequisites: Docker, Node ≥20, ZAMBYL_ROOT clone at v1.0.1
 *
 * Usage:
 *   ZAMBYL_ROOT=/path/to/Zambyl node scripts/stack-up.js
 *   OPENAI_API_KEY=sk-... node scripts/stack-up.js   # optional AI
 */
import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const zambylRoot = process.env.ZAMBYL_ROOT || path.resolve(repoRoot, '../Zambyl');

function run(cmd, args, opts = {}) {
  console.log(`\n> ${cmd} ${args.join(' ')}`);
  const r = spawnSync(cmd, args, { stdio: 'inherit', cwd: repoRoot, ...opts });
  if (r.status !== 0) process.exit(r.status ?? 1);
}

function waitForUrl(url, label, attempts = 30) {
  return (async () => {
    for (let i = 0; i < attempts; i += 1) {
      try {
        const res = await fetch(url);
        if (res.ok) {
          console.log(`  ${label} ready`);
          return;
        }
      } catch {
        /* retry */
      }
      await new Promise((r) => setTimeout(r, 2000));
    }
    throw new Error(`${label} not ready: ${url}`);
  })();
}

async function main() {
  if (!fs.existsSync(path.join(zambylRoot, 'zambyl-core'))) {
    console.error(`ZAMBYL_ROOT invalid: ${zambylRoot}`);
    console.error('Clone Zambyl v1.0.1 and set ZAMBYL_ROOT');
    process.exit(1);
  }

  console.log('MeetingIQ Full Stack Deploy');
  console.log('===========================');
  console.log(`MeetingIQ: ${repoRoot}`);
  console.log(`Zambyl:    ${zambylRoot}`);

  run('npm', ['install']);

  run('docker', ['compose', '-f', 'docker-compose.full.yml', 'up', '-d', '--build'], {
    env: { ...process.env, ZAMBYL_ROOT: zambylRoot, PWD: repoRoot },
  });

  await waitForUrl('http://localhost:8080/health', 'Zambyl gateway');
  await waitForUrl('http://localhost:3001/health', 'MeetingIQ BFF');
  await waitForUrl('http://localhost:8088/', 'MeetingIQ UI');

  const env = {
    ...process.env,
    ZAMBYL_ROOT: zambylRoot,
    ZAMBYL_API_URL: 'http://localhost:8080',
    ZAMBYL_DATABASE_URL: 'postgres://zambyl:zambyl@localhost:5432/zambyl',
    ZAMBYL_ADMIN_KEY: process.env.ZAMBYL_ADMIN_KEY || 'dev-admin-key',
  };

  run('node', ['scripts/register-connectors.js'], { env });
  run('node', ['scripts/register-domain.js'], { env });
  run('node', ['scripts/register-experiences.js'], { env });
  run('node', ['scripts/zambyl-bootstrap-sync.js'], { env });

  console.log('\n✅ Stack ready');
  console.log('   UI:     http://localhost:8088');
  console.log('   BFF:    http://localhost:3001/health');
  console.log('   Zambyl: http://localhost:8080/health');
  console.log('\nDev user header: x-meetingiq-user-id: user_alex');
}

main().catch((err) => {
  console.error(err.message || err);
  process.exit(1);
});
