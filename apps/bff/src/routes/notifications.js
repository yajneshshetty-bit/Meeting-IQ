import { getNotificationQueue } from '../services/notifications.js';
import { forbidSupport } from './helpers.js';

export async function registerNotificationRoutes(app) {
  app.get('/api/notifications', async (req, reply) => {
    if (forbidSupport(req, reply)) return;
    return getNotificationQueue(req.userContext);
  });
}
