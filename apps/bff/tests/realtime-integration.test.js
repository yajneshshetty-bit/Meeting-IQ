import test from 'node:test';
import assert from 'node:assert/strict';

const integration = process.env.ZAMBYL_INTEGRATION === '1';

test('pre-meeting pipeline propagates outbox to BFF poll', { skip: !integration }, async () => {
  const simulator = process.env.MOCK_SIMULATOR_URL || 'http://localhost:4010';
  const bff = process.env.MEETINGIQ_BFF_URL || 'http://localhost:3001';
  const user = process.env.MEETINGIQ_DEV_DEFAULT_USER_ID || 'user_alex';

  const scenarioRes = await fetch(`${simulator}/v1/scenarios/pre_meeting/run`, { method: 'POST' });
  assert.ok(scenarioRes.ok, `simulator ${scenarioRes.status}`);

  const pipelineRes = await fetch(`${bff}/api/realtime/pipeline`, {
    method: 'POST',
    headers: { 'x-meetingiq-user-id': user },
  });
  assert.ok(pipelineRes.ok, `pipeline ${pipelineRes.status}`);
  const body = await pipelineRes.json();
  assert.ok(body.poll, 'poll result present');
  assert.ok(body.sync.records_written >= 0);
});
