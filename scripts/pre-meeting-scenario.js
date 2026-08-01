#!/usr/bin/env node
/**
 * Pre-meeting acceptance pipeline (REALTIME_CORRECTNESS_MATRIX § Pre-Meeting Scenario).
 *
 * 1. POST event-simulator pre_meeting scenario (mock source changes)
 * 2. Incremental connector sync → canonical + outbox + projections
 * 3. BFF outbox poll → SSE invalidation events
 *
 * Usage:
 *   node scripts/pre-meeting-scenario.js
 *   MEETINGIQ_BFF_URL=http://localhost:3001 node scripts/pre-meeting-scenario.js
 */
const SIMULATOR = process.env.MOCK_SIMULATOR_URL || 'http://localhost:4010';
const BFF = process.env.MEETINGIQ_BFF_URL || 'http://localhost:3001';
const USER = process.env.MEETINGIQ_DEV_DEFAULT_USER_ID || 'user_alex';

async function main() {
  console.log('Step 1: Run pre_meeting scenario on event simulator…');
  const scenarioRes = await fetch(`${SIMULATOR}/v1/scenarios/pre_meeting/run`, { method: 'POST' });
  const scenario = await scenarioRes.json();
  if (!scenarioRes.ok) throw new Error(JSON.stringify(scenario));
  console.log('  emitted:', scenario.emitted_at);
  for (const r of scenario.results) console.log(`  ${r.step}: ${r.status}`);

  console.log('\nStep 2: Incremental sync + BFF outbox poll…');
  const pipelineRes = await fetch(`${BFF}/api/realtime/pipeline`, {
    method: 'POST',
    headers: { 'x-meetingiq-user-id': USER },
  });
  const pipeline = await pipelineRes.json();
  if (!pipelineRes.ok) throw new Error(JSON.stringify(pipeline));
  console.log('  sync records_written:', pipeline.sync?.records_written);
  console.log('  outbox processed:', pipeline.poll?.processed);
  console.log('  outbox lastId:', pipeline.poll?.lastId);

  console.log('\nStep 3: Latency samples…');
  const latRes = await fetch(`${BFF}/api/realtime/latency`, {
    headers: { 'x-meetingiq-user-id': USER },
  });
  const lat = await latRes.json();
  if (latRes.ok) {
    for (const m of lat.metrics || []) {
      console.log(`  ${m.event_type}/${m.stage}: p50=${m.p50}ms p99=${m.p99}ms (n=${m.samples})`);
    }
  }

  console.log('\nPre-meeting pipeline complete.');
  if ((pipeline.poll?.processed || 0) === 0) {
    console.warn('Warning: no outbox events processed — ensure bootstrap sync ran and mocks are up.');
    process.exitCode = 1;
  }
}

main().catch((err) => {
  console.error(err.message || err);
  process.exit(1);
});
