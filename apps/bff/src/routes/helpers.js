import { isSupportOnly } from '../services/scope.js';

export function forbidSupport(req, reply) {
  if (isSupportOnly(req.userContext)) {
    reply.status(403).send({
      error: { code: 'FORBIDDEN', message: 'Support role cannot access this endpoint' },
    });
    return true;
  }
  return false;
}

export function sendServiceError(err, reply) {
  if (err.statusCode === 403) {
    return reply.status(403).send({ error: { code: 'FORBIDDEN', message: err.message } });
  }
  if (err.statusCode === 404) {
    return reply.status(404).send({ error: { code: 'NOT_FOUND', message: err.message } });
  }
  throw err;
}
