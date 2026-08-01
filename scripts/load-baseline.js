#!/usr/bin/env node
/**
 * Phase 9 load baseline — concurrent BFF read-model requests.
 *
 * Prerequisites: BFF running on MEETINGIQ_BFF_URL (default :3001)
 *
 * Usage:
 *   node scripts/load-baseline.js
 *   MEETINGIQ_LOAD_CONCURRENCY=20 MEETINGIQ_LOAD_ITERATIONS=50 node scripts/load-baseline.js
 */
const BFF = process.env.MEETINGIQ_BFF_URL || 'http://localhost:3001';
const USER = process.env.MEETINGIQ_DEV_DEFAULT_USER_ID || 'user_alex';
const CONCURRENCY = Number(process.env.MEETINGIQ_LOAD_CONCURRENCY || 10);
const ITERATIONS = Number(process.env.MEETINGIQ_LOAD_ITERATIONS || 30);

const ROUTES = [
  '/api/command-center/overview',
  '/api/command-center/agenda',
  '/api/notifications',
  '/api/search?q=Acme',
  '/api/executive/pipeline',
  '/api/executive/forecast',
];

function percentile(sorted, p) {
  if (!sorted.length) return 0;
  const idx = Math.ceil((p / 100) * sorted.length) - 1;
  return sorted[Math.max(0, idx)];
}

async function fetchRoute(route) {
  const start = performance.now();
  const res = await fetch(`${BFF}${route}`, {
    headers: { 'x-meetingiq-user-id': route.startsWith('/api/executive') ? 'user_leader_1' : USER },
  });
  const ms = performance.now() - start;
  return { route, ok: res.ok, ms, status: res.status };
}

async function runBatch() {
  const picks = Array.from({ length: CONCURRENCY }, (_, i) => ROUTES[i % ROUTES.length]);
  return Promise.all(picks.map(fetchRoute));
}

async function main() {
  const health = await fetch(`${BFF}/health`);
  if (!health.ok) throw new Error(`BFF not reachable at ${BFF}/health`);

  const samples = [];
  for (let i = 0; i < ITERATIONS; i += 1) {
    const batch = await runBatch();
    samples.push(...batch);
  }

  const ok = samples.filter((s) => s.ok);
  const latencies = ok.map((s) => s.ms).sort((a, b) => a - b);
  const byRoute = {};
  for (const s of ok) {
    if (!byRoute[s.route]) byRoute[s.route] = [];
    byRoute[s.route].push(s.ms);
  }

  console.log('MeetingIQ Load Baseline');
  console.log('=======================');
  console.log(`BFF: ${BFF}`);
  console.log(`Concurrency: ${CONCURRENCY}, iterations: ${ITERATIONS}, total requests: ${samples.length}`);
  console.log(`Success rate: ${ok.length}/${samples.length} (${((ok.length / samples.length) * 100).toFixed(1)}%)`);
  console.log(`Overall latency ms — p50: ${percentile(latencies, 50).toFixed(1)}, p99: ${percentile(latencies, 99).toFixed(1)}, max: ${latencies.at(-1)?.toFixed(1) || 0}`);
  console.log('\nPer route (p50 / p99 ms):');
  for (const route of ROUTES) {
    const arr = (byRoute[route] || []).sort((a, b) => a - b);
    if (!arr.length) {
      console.log(`  ${route}: no successful samples`);
      continue;
    }
    console.log(`  ${route}: ${percentile(arr, 50).toFixed(1)} / ${percentile(arr, 99).toFixed(1)} (n=${arr.length})`);
  }

  if (ok.length < samples.length) process.exitCode = 1;
}

main().catch((err) => {
  console.error(err.message || err);
  process.exit(1);
});
