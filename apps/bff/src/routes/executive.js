import {
  getExecutivePipeline,
  getExecutiveForecast,
  getRisingRisk,
} from '../services/executive.js';
import { forbidSupport, sendServiceError } from './helpers.js';

export async function registerExecutiveRoutes(app) {
  app.get('/api/executive/pipeline', async (req, reply) => {
    if (forbidSupport(req, reply)) return;
    try {
      return await getExecutivePipeline(req.userContext);
    } catch (err) {
      return sendServiceError(err, reply);
    }
  });

  app.get('/api/executive/forecast', async (req, reply) => {
    if (forbidSupport(req, reply)) return;
    try {
      return await getExecutiveForecast(req.userContext);
    } catch (err) {
      return sendServiceError(err, reply);
    }
  });

  app.get('/api/executive/rising-risk', async (req, reply) => {
    if (forbidSupport(req, reply)) return;
    try {
      return await getRisingRisk(req.userContext);
    } catch (err) {
      return sendServiceError(err, reply);
    }
  });
}
