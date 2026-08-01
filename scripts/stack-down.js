#!/usr/bin/env node
/** Tear down full stack. Usage: node scripts/stack-down.js */
import { spawnSync } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const zambylRoot = process.env.ZAMBYL_ROOT || path.resolve(repoRoot, '../Zambyl');

const r = spawnSync('docker', ['compose', '-f', 'docker-compose.full.yml', 'down'], {
  stdio: 'inherit',
  cwd: repoRoot,
  env: { ...process.env, ZAMBYL_ROOT: zambylRoot, PWD: repoRoot },
});
process.exit(r.status ?? 1);
