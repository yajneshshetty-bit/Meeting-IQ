#!/usr/bin/env node
/**
 * Register MeetingIQ experience packages + OpenAI model provider in Zambyl.
 * Requires ZAMBYL_ROOT with zambyl-core installed.
 *
 * Usage:
 *   OPENAI_API_KEY=sk-... node scripts/register-experiences.js
 *   # Then restart Zambyl gateway or bootstrapPlatform({ force: true })
 */
import { spawn } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { EXPERIENCE_DIRS } from '../packages/experiences/index.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const meetingIqRoot = path.resolve(__dirname, '..');
const zambylRoot = process.env.ZAMBYL_ROOT || '/home/hp/Desktop/Zambyl';
const experiencesRoot = path.join(meetingIqRoot, 'packages/experiences');
const modelProviderPath = path.join(meetingIqRoot, 'packages/model-provider/openai.js');
const templatesDir = path.join(meetingIqRoot, 'registries/templates');
const signingSecret = process.env.ZAMBYL_SIGNING_SECRET || 'dev-signing-secret-change-in-production';

const inline = `
import fs from 'node:fs';
import path from 'node:path';
import pg from 'pg';
import { loadPackageDir, compilePlan, signPackage } from './zambyl-core/packages/sdk/index.js';
import { registerPackage, activateChannel } from './zambyl-core/packages/registry/index.js';
import { registerTemplate, registerModelClass } from './zambyl-core/packages/registries/index.js';
import { bootstrapPlatform } from './zambyl-core/packages/platform/index.js';

const experiencesRoot = ${JSON.stringify(experiencesRoot)};
const experienceDirs = ${JSON.stringify(EXPERIENCE_DIRS)};
const templatesDir = ${JSON.stringify(templatesDir)};
const modelProviderPath = ${JSON.stringify(modelProviderPath)};
const signingSecret = ${JSON.stringify(signingSecret)};
const databaseUrl = process.env.ZAMBYL_DATABASE_URL || 'postgres://zambyl:zambyl@localhost:5432/zambyl';

for (const file of fs.readdirSync(templatesDir).filter(f => f.endsWith('.json'))) {
  const spec = JSON.parse(fs.readFileSync(path.join(templatesDir, file), 'utf8'));
  const templateId = file.replace('.json', '');
  const { output_schema: outputSchema, ...templateSpec } = spec;
  await registerTemplate(templateId, '1.0.0', templateSpec, outputSchema || spec.output_schema);
  console.log('Registered template ' + templateId);
}

await registerModelClass(
  'meetingiq-llm-standard',
  '1.0.0',
  'openai-model-provider',
  { provider: 'openai' },
  modelProviderPath,
);
console.log('Registered model class meetingiq-llm-standard -> OpenAI provider');

for (const dirName of experienceDirs) {
  const dir = path.join(experiencesRoot, dirName);
  const pkg = loadPackageDir(dir);
  const plan = compilePlan(pkg);
  const { signature, contentDigest } = signPackage(pkg, plan, signingSecret);
  await registerPackage({
    id: pkg.metadata.id,
    version: pkg.metadata.version,
    owner: pkg.metadata.owner,
    manifest: pkg,
    compiledPlan: plan,
    signature,
    contentDigest,
  });
  await activateChannel(pkg.metadata.id, 'stable', pkg.metadata.version, 'meetingiq-register-experiences');
  console.log('Registered + activated ' + pkg.metadata.id + '@' + pkg.metadata.version);
}

await bootstrapPlatform({ force: true });
console.log('Platform providers reloaded (OpenAI model provider active if OPENAI_API_KEY set).');
console.log('Done.');
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
