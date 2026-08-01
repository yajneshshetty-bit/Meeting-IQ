import { config } from '../config.js';
import { loadUserContext } from './context.js';

/**
 * Dev auth middleware: resolves MeetingIQ user from x-meetingiq-user-id header.
 * Attaches req.userContext with role, hierarchy, and Zambyl entitlements.
 */
export async function authMiddleware(req, reply) {
  if (req.url === '/health' || req.url.startsWith('/health?')) {
    return;
  }

  const userId = req.headers['x-meetingiq-user-id'] || config.devDefaultUserId;
  const ctx = await loadUserContext(userId);

  if (!ctx) {
    return reply.status(401).send({
      error: { code: 'UNAUTHORIZED', message: `Unknown or inactive user: ${userId}` },
    });
  }

  req.userContext = {
    ...ctx,
    zambylApiKey: config.zambyl.apiKey,
    zambylWorkloadId: config.zambyl.workloadId,
  };
}
