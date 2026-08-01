import {
  getCommandCenterOverview,
  getAgenda,
  getAtRiskDeals,
  getActionsDue,
} from '../services/command-center.js';
import { forbidSupport, sendServiceError } from './helpers.js';

export async function registerCommandCenterRoutes(app) {
  app.get('/api/command-center/overview', async (req, reply) => {
    if (forbidSupport(req, reply)) return;
    try {
      return await getCommandCenterOverview(req.userContext);
    } catch (err) {
      return sendServiceError(err, reply);
    }
  });

  app.get('/api/command-center/agenda', async (req, reply) => {
    if (forbidSupport(req, reply)) return;
    try {
      return await getAgenda(req.userContext);
    } catch (err) {
      return sendServiceError(err, reply);
    }
  });

  app.get('/api/command-center/at-risk', async (req, reply) => {
    if (forbidSupport(req, reply)) return;
    try {
      return await getAtRiskDeals(req.userContext);
    } catch (err) {
      return sendServiceError(err, reply);
    }
  });

  app.get('/api/command-center/actions-due', async (req, reply) => {
    if (forbidSupport(req, reply)) return;
    try {
      return await getActionsDue(req.userContext);
    } catch (err) {
      return sendServiceError(err, reply);
    }
  });
}
