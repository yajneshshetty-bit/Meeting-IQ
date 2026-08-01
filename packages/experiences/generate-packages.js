#!/usr/bin/env node
/** Generate MeetingIQ experience package.yaml + schemas (Phase 7). */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { EXPERIENCE_DIRS } from './index.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const OUTPUT_SCHEMA = {
  type: 'object',
  required: ['summary', 'provenance'],
  properties: {
    summary: { type: 'object' },
    provenance: { type: 'object' },
    citations: { type: 'array' },
  },
};

const PACKAGES = {
  'meetingiq.pre-meeting-brief': {
    input: { required: ['meeting_id'], properties: { meeting_id: { type: 'string' }, account_id: { type: 'string' }, opportunity_id: { type: 'string' }, brief_sections: { type: 'array', items: { type: 'string' } } } },
    dag: [
      { id: 'meeting', use: 'knowledge.get@1', with: { profile: 'meetingiq.meeting-profile' } },
      { id: 'brief', use: 'ai.generate@1', after: ['meeting'], with: { template: 'meetingiq-brief-template', modelClass: 'meetingiq-llm-standard' } },
    ],
  },
  'meetingiq.company-research': {
    input: { required: ['account_id'], properties: { account_id: { type: 'string' } } },
    dag: [
      { id: 'account', use: 'knowledge.get@1', with: { profile: 'meetingiq.account-profile' } },
      { id: 'research', use: 'ai.generate@1', after: ['account'], with: { template: 'meetingiq-research-template', modelClass: 'meetingiq-llm-standard' } },
    ],
  },
  'meetingiq.voice-of-customer': {
    input: { required: ['account_id'], properties: { account_id: { type: 'string' }, communications: { type: 'array' } } },
    dag: [
      { id: 'account', use: 'knowledge.get@1', with: { profile: 'meetingiq.account-profile' } },
      { id: 'voc', use: 'ai.generate@1', after: ['account'], with: { template: 'meetingiq-voc-template', modelClass: 'meetingiq-llm-standard' } },
    ],
  },
  'meetingiq.executive-summary': {
    input: { required: ['quarter'], properties: { quarter: { type: 'string' }, pipeline: { type: 'object' } } },
    dag: [
      { id: 'summary', use: 'ai.generate@1', with: { template: 'meetingiq-executive-summary-template', modelClass: 'meetingiq-llm-standard' } },
    ],
  },
  'meetingiq.opportunity-summary': {
    input: { required: ['opportunity_id'], properties: { opportunity_id: { type: 'string' } } },
    dag: [
      { id: 'opportunity', use: 'knowledge.get@1', with: { profile: 'meetingiq.opportunity-profile' } },
      { id: 'summary', use: 'ai.generate@1', after: ['opportunity'], with: { template: 'meetingiq-opportunity-summary-template', modelClass: 'meetingiq-llm-standard' } },
    ],
  },
  'meetingiq.risk-analysis': {
    input: { required: ['opportunity_id'], properties: { opportunity_id: { type: 'string' }, opportunities: { type: 'array' } } },
    dag: [
      { id: 'opportunity', use: 'knowledge.get@1', with: { profile: 'meetingiq.opportunity-profile' } },
      { id: 'analytics', use: 'analytics.query@1', after: ['opportunity'], with: { profile: 'meetingiq.risk-scoring-v1' } },
      { id: 'explain', use: 'ai.generate@1', after: ['opportunity', 'analytics'], with: { template: 'meetingiq-risk-template', modelClass: 'meetingiq-llm-standard' } },
    ],
  },
  'meetingiq.next-best-actions': {
    input: { required: ['opportunity_id'], properties: { opportunity_id: { type: 'string' }, tasks: { type: 'array' } } },
    dag: [
      { id: 'opportunity', use: 'knowledge.get@1', with: { profile: 'meetingiq.opportunity-profile' } },
      { id: 'actions', use: 'ai.generate@1', after: ['opportunity'], with: { template: 'meetingiq-next-actions-template', modelClass: 'meetingiq-llm-standard' } },
    ],
  },
  'meetingiq.follow-up-draft': {
    input: { required: ['meeting_id'], properties: { meeting_id: { type: 'string' }, tone: { type: 'string' } } },
    dag: [
      { id: 'meeting', use: 'knowledge.get@1', with: { profile: 'meetingiq.meeting-profile' } },
      { id: 'draft', use: 'ai.generate@1', after: ['meeting'], with: { template: 'meetingiq-followup-template', modelClass: 'meetingiq-llm-standard' } },
    ],
  },
  'meetingiq.qbr-narrative': {
    input: { required: ['account_id'], properties: { account_id: { type: 'string' }, opportunity_id: { type: 'string' } } },
    dag: [
      { id: 'account', use: 'knowledge.get@1', with: { profile: 'meetingiq.account-profile' } },
      { id: 'qbr', use: 'ai.generate@1', after: ['account'], with: { template: 'meetingiq-qbr-template', modelClass: 'meetingiq-llm-standard' } },
    ],
  },
  'meetingiq.forecast-explanation': {
    input: { required: ['quarter'], properties: { quarter: { type: 'string' }, forecast: { type: 'object' }, opportunities: { type: 'array' } } },
    dag: [
      { id: 'analytics', use: 'analytics.query@1', with: { profile: 'meetingiq.forecast-adjustment-v1' } },
      { id: 'explain', use: 'ai.generate@1', after: ['analytics'], with: { template: 'meetingiq-forecast-template', modelClass: 'meetingiq-llm-standard' } },
    ],
  },
  'meetingiq.meeting-quality': {
    input: { required: ['meeting_id'], properties: { meeting_id: { type: 'string' } } },
    dag: [
      { id: 'meeting', use: 'knowledge.get@1', with: { profile: 'meetingiq.meeting-profile' } },
      { id: 'quality', use: 'ai.generate@1', after: ['meeting'], with: { template: 'meetingiq-meeting-quality-template', modelClass: 'meetingiq-llm-standard' } },
    ],
  },
};

for (const dirName of EXPERIENCE_DIRS) {
  const def = PACKAGES[dirName];
  const dir = path.join(__dirname, dirName);
  fs.mkdirSync(path.join(dir, 'schemas'), { recursive: true });

  const manifest = {
    metadata: { id: dirName, version: '1.0.0', owner: 'meetingiq-team', compatibility: { platformApi: '^1' } },
    schemas: { input: 'schemas/input.json', output: 'schemas/output.json' },
    policy: { purpose: 'meetingiq_ai', entitlements: ['meetingiq.read', 'meetingiq.execute'], redactionProfile: 'default' },
    dag: def.dag,
    freshness: { defaultMaxAge: 'PT15M', onStale: 'refresh' },
    partialResults: { allowed: true },
    budgets: { deadline: 'PT60S' },
  };

  fs.writeFileSync(path.join(dir, 'package.yaml'), `# ${dirName}\n${JSON.stringify(manifest, null, 2).replace(/^/gm, '').replace(/^\{/, '').replace(/\}$/, '')}`);
  // Write proper YAML manually
  const yaml = `metadata:
  id: ${dirName}
  version: 1.0.0
  owner: meetingiq-team
  compatibility:
    platformApi: "^1"
schemas:
  input: schemas/input.json
  output: schemas/output.json
policy:
  purpose: meetingiq_ai
  entitlements:
    - meetingiq.read
    - meetingiq.execute
  redactionProfile: default
dag:
${def.dag.map((n) => `  - id: ${n.id}\n    use: ${n.use}${n.after ? `\n    after: [${n.after.join(', ')}]` : ''}\n    with:\n${Object.entries(n.with).map(([k, v]) => `      ${k}: ${typeof v === 'string' ? v : JSON.stringify(v)}`).join('\n')}`).join('\n')}
freshness:
  defaultMaxAge: PT15M
  onStale: refresh
partialResults:
  allowed: true
budgets:
  deadline: PT60S
`;
  fs.writeFileSync(path.join(dir, 'package.yaml'), yaml);
  fs.writeFileSync(path.join(dir, 'schemas/input.json'), JSON.stringify({ type: 'object', ...def.input, additionalProperties: true }, null, 2));
  fs.writeFileSync(path.join(dir, 'schemas/output.json'), JSON.stringify(OUTPUT_SCHEMA, null, 2));
  console.log('Wrote', dirName);
}
