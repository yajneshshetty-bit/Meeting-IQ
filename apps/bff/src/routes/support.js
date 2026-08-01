import { getSupportDiagnostics } from '../services/support.js';
import { isSupportOnly } from '../services/scope.js';

export async function registerSupportRoutes(app) {
  app.get('/api/support/diagnostics', async (req, reply) => {
    if (!isSupportOnly(req.userContext) && req.userContext.role !== 'admin') {
      return reply.status(403).send({
        error: { code: 'FORBIDDEN', message: 'Support or admin access required' },
      });
    }
    return getSupportDiagnostics(req.userContext);
  });
}
