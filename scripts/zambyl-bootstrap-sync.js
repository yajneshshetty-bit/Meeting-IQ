#!/usr/bin/env node
/**
 * Run from Meeting-IQ repo but bootstrap Zambyl platform + sync all connections.
 * Requires ZAMBYL_ROOT pointing at Zambyl repo with npm install done.
 *
 * Usage: node scripts/zambyl-bootstrap-sync.js [batch|incremental]
 */
import { spawn } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const meetingIqRoot = path.resolve(__dirname, '..');
const zambylRoot = process.env.ZAMBYL_ROOT || '/home/hp/Desktop/Zambyl';
const mode = process.argv[2] || 'batch';

const inline = `
import { bootstrapPlatform } from './zambyl-core/packages/platform/index.js';
import { startSync } from './zambyl-core/packages/connectors/index.js';
import fs from 'node:fs';

const mode = ${JSON.stringify(mode)};
const connections = JSON.parse(fs.readFileSync('${meetingIqRoot}/registries/connections.json', 'utf8'));
await bootstrapPlatform({ force: true });
let written = 0;
for (const c of connections) {
  const r = await startSync(c.connection_id, mode);
  console.log('  ' + c.connection_id + ': ' + r.records_written + ' records');
  written += r.records_written;
}
console.log('Total ingested: ' + written);
`;

const child = spawn(process.execPath, ['--input-type=module', '-e', inline], {
  cwd: zambylRoot,
  env: {
    ...process.env,
    DATABASE_URL: process.env.ZAMBYL_DATABASE_URL || 'postgres://zambyl:zambyl@localhost:5432/zambyl',
  },
  stdio: 'inherit',
});

child.on('exit', (code) => process.exit(code ?? 1));
