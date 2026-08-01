import { AI_CATALOG, runExperience } from '../services/experiences.js';
import { forbidSupport, sendServiceError } from './helpers.js';
import { canAccessExecutive } from '../services/scope.js';

const KEY_TO_EXPERIENCE = Object.fromEntries(AI_CATALOG.map((c) => [c.key, c]));

export async function registerAiRoutes(app) {
  app.get('/api/ai/catalog', async (req, reply) => {
    if (forbidSupport(req, reply)) return;
    return {
      experiences: AI_CATALOG.map(({ key, experience_id, input, executive }) => ({
        key,
        experience_id,
        required_input: input,
        executive_only: !!executive,
      })),
    };
  });

  app.post('/api/ai/:key', async (req, reply) => {
    if (forbidSupport(req, reply)) return;

    const entry = KEY_TO_EXPERIENCE[req.params.key];
    if (!entry) {
      return reply.status(404).send({ error: { code: 'NOT_FOUND', message: `Unknown AI capability: ${req.params.key}` } });
    }

    if (entry.executive && !canAccessExecutive(req.userContext)) {
      return reply.status(403).send({ error: { code: 'FORBIDDEN', message: 'Executive access required' } });
    }

    for (const field of entry.input) {
      if (!req.body?.[field]) {
        return reply.status(400).send({ error: { code: 'BAD_REQUEST', message: `${field} is required` } });
      }
    }

    try {
      return await runExperience(req.userContext, entry.experience_id, req.body || {});
    } catch (err) {
      return sendServiceError(err, reply);
    }
  });
}
