import {
  listWidgetConfigs,
  getWidgetConfig,
  upsertWidgetConfig,
  deleteWidgetConfig,
} from '../services/widgets.js';
import { forbidSupport, sendServiceError } from './helpers.js';

export async function registerWidgetRoutes(app) {
  app.get('/api/widgets/config', async (req, reply) => {
    if (forbidSupport(req, reply)) return;
    const view = req.query.view || null;
    return listWidgetConfigs(req.userContext.userId, view);
  });

  app.get('/api/widgets/config/:configId', async (req, reply) => {
    if (forbidSupport(req, reply)) return;
    try {
      return await getWidgetConfig(req.userContext.userId, req.params.configId);
    } catch (err) {
      return sendServiceError(err, reply);
    }
  });

  app.put('/api/widgets/config', async (req, reply) => {
    if (forbidSupport(req, reply)) return;
    const { view, widget_key, layout, settings } = req.body || {};
    if (!view || !widget_key) {
      return reply.status(400).send({
        error: { code: 'BAD_REQUEST', message: 'view and widget_key are required' },
      });
    }
    return upsertWidgetConfig(req.userContext.userId, { view, widget_key, layout, settings });
  });

  app.delete('/api/widgets/config/:configId', async (req, reply) => {
    if (forbidSupport(req, reply)) return;
    try {
      return await deleteWidgetConfig(req.userContext.userId, req.params.configId);
    } catch (err) {
      return sendServiceError(err, reply);
    }
  });
}
