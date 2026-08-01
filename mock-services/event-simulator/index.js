import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { API_KEY } from '../seed/enterprise-manifest.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PORT = Number(process.env.PORT || 4010);

function serviceUrls() {
  return {
    crm: process.env.MOCK_CRM_URL || 'http://localhost:4001',
    mail: process.env.MOCK_MAIL_URL || 'http://localhost:4003',
    support: process.env.MOCK_SUPPORT_URL || 'http://localhost:4007',
    slack: process.env.MOCK_SLACK_URL || 'http://localhost:4004',
    tasks: process.env.MOCK_TASKS_URL || 'http://localhost:4006',
  };
}

const HEADERS = { 'content-type': 'application/json', 'x-api-key': API_KEY };

/** Correlated pre-meeting scenario — acceptance example from REALTIME_CORRECTNESS_MATRIX */
async function runPreMeetingScenario() {
  const urls = serviceUrls();
  const results = [];
  const mailRes = await fetch(`${urls.mail}/v1/messages`, {
    method: 'POST',
    headers: HEADERS,
    body: JSON.stringify({
      thread_id: 'thr_acme_proc',
      from_address: 'priya.menon@acme.com',
      to_addresses: ['alex@infoglen.com'],
      subject: 'Urgent: MSA revision before pricing call',
      body_preview: 'Legal flagged indemnity clause — need updated terms before 11am meeting.',
    }),
  });
  results.push({ step: 'mail.message.created', status: mailRes.status });

  const crmRes = await fetch(`${urls.crm}/v1/opportunities/OPP-1842`, {
    method: 'PATCH',
    headers: HEADERS,
    body: JSON.stringify({ probability: 0.45, risk_level: 'at_risk', stage: 'negotiation' }),
  });
  results.push({ step: 'crm.opportunity.updated', status: crmRes.status });

  const supportRes = await fetch(`${urls.support}/v1/tickets/TKT-4401`, {
    method: 'PATCH',
    headers: HEADERS,
    body: JSON.stringify({ status: 'escalated', priority: 'critical', escalated: true }),
  });
  results.push({ step: 'support.ticket.escalated', status: supportRes.status });

  const slackRes = await fetch(`${urls.slack}/v1/messages`, {
    method: 'POST',
    headers: HEADERS,
    body: JSON.stringify({
      channel_id: 'ch_acme_deal',
      user_id: 'user_manager_1',
      text: 'Pre-meeting alert: Acme email + CRM risk shift + support escalation.',
    }),
  });
  results.push({ step: 'slack.message.created', status: slackRes.status });

  const taskRes = await fetch(`${urls.tasks}/v1/tasks/task_msa`, {
    method: 'PATCH',
    headers: HEADERS,
    body: JSON.stringify({ priority: 'critical', status: 'in_progress' }),
  });
  results.push({ step: 'tasks.task.updated', status: taskRes.status });

  return { scenario: 'pre_meeting', results, emitted_at: new Date().toISOString() };
}

const SCENARIOS = {
  pre_meeting: runPreMeetingScenario,
};

async function buildApp() {
  const fastify = (await import('fastify')).default({ logger: true });

  fastify.get('/health', async () => ({ status: 'ok', service: 'mock-event-simulator' }));

  fastify.get('/openapi.json', async () => ({
    openapi: '3.0.3',
    info: { title: 'Mock Event Simulator', version: '1.0.0' },
    paths: {
      '/health': { get: { summary: 'Health check' } },
      '/v1/scenarios': { get: { summary: 'List available scenarios' } },
      '/v1/scenarios/:name/run': { post: { summary: 'Run correlated scenario' } },
    },
  }));

  fastify.get('/v1/scenarios', async () => ({ scenarios: Object.keys(SCENARIOS) }));

  fastify.post('/v1/scenarios/:name/run', async (req) => {
    const fn = SCENARIOS[req.params.name];
    if (!fn) return fastify.httpErrors.notFound(`Unknown scenario: ${req.params.name}`);
    return fn();
  });

  return fastify;
}

export async function createApp() {
  return buildApp();
}

let intervalHandle = null;

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const app = await buildApp();
  await app.listen({ port: PORT, host: '0.0.0.0' });

  if (process.env.MOCK_SIMULATOR_AUTO !== '0') {
    const intervalMs = Number(process.env.MOCK_SIMULATOR_INTERVAL_MS || 120000);
    intervalHandle = setInterval(async () => {
      try {
        await runPreMeetingScenario();
        app.log.info('Auto-ran pre_meeting scenario');
      } catch (err) {
        app.log.warn({ err }, 'Auto scenario failed (services may be starting)');
      }
    }, intervalMs);
    intervalHandle.unref?.();
  }
}
