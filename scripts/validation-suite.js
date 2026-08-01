#!/usr/bin/env node
/**
 * Phase 9 validation suite — runs all test workspaces and reports summary.
 *
 * Usage:
 *   node scripts/validation-suite.js
 *   ZAMBYL_INTEGRATION=1 node scripts/validation-suite.js   # include integration tests
 */
import { spawnSync } from 'node:child_process';

const SUITES = [
  { name: 'bff', cmd: 'npm', args: ['run', 'test', '-w', '@meetingiq/bff'], env: { MEETINGIQ_REALTIME_WATCHER: '0' } },
  { name: 'web', cmd: 'npm', args: ['run', 'test', '-w', '@meetingiq/web'] },
  { name: 'mock', cmd: 'npm', args: ['run', 'mock:test'] },
  { name: 'connectors', cmd: 'npm', args: ['run', 'connectors:test'] },
  { name: 'domain', cmd: 'npm', args: ['run', 'domain:test'] },
  { name: 'experiences', cmd: 'npm', args: ['run', 'experiences:test'] },
];

function runSuite(suite) {
  const started = Date.now();
  const result = spawnSync(suite.cmd, suite.args, {
    cwd: process.cwd(),
    env: { ...process.env, ...suite.env },
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'pipe'],
  });
  const output = `${result.stdout || ''}${result.stderr || ''}`;
  const pass = (output.match(/^# pass (\d+)/gm) || []).reduce((s, l) => s + Number(l.split(' ')[2]), 0);
  const fail = (output.match(/^# fail (\d+)/gm) || []).reduce((s, l) => s + Number(l.split(' ')[2]), 0);
  const skip = (output.match(/^# skip(?:ped)? (\d+)/gm) || []).reduce((s, l) => s + Number(l.split(' ')[2]), 0);
  const tests = (output.match(/^# tests (\d+)/gm) || []).reduce((s, l) => s + Number(l.split(' ')[2]), 0);
  return {
    name: suite.name,
    ok: result.status === 0,
    exitCode: result.status ?? 1,
    durationMs: Date.now() - started,
    tests,
    pass,
    fail,
    skip,
  };
}

const results = SUITES.map(runSuite);
const totals = results.reduce(
  (acc, r) => ({
    tests: acc.tests + r.tests,
    pass: acc.pass + r.pass,
    fail: acc.fail + r.fail,
    skip: acc.skip + r.skip,
    ok: acc.ok && r.ok,
  }),
  { tests: 0, pass: 0, fail: 0, skip: 0, ok: true },
);

console.log('MeetingIQ Phase 9 Validation Suite');
console.log('==================================');
for (const r of results) {
  const status = r.ok ? 'PASS' : 'FAIL';
  console.log(`${status} ${r.name.padEnd(14)} ${r.pass}/${r.tests} pass (${r.skip} skip) ${r.durationMs}ms`);
}
console.log('----------------------------------');
console.log(`TOTAL ${totals.pass}/${totals.tests} pass, ${totals.fail} fail, ${totals.skip} skip`);
if (process.env.ZAMBYL_INTEGRATION !== '1') {
  console.log('Note: integration tests skipped (set ZAMBYL_INTEGRATION=1 for full E2E)');
}
process.exit(totals.ok ? 0 : 1);
