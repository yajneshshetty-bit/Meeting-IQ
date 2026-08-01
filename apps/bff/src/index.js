import Fastify from 'fastify';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { config } from './config.js';
import { closePool, query } from './db.js';
import { authMiddleware } from './auth/middleware.js';
import { zambylClient } from './zambyl/client.js';
import { closeCanonicalPool } from './services/canonical.js';
import { registerCommandCenterRoutes } from './routes/command-center.js';
import { registerExecutiveRoutes } from './routes/executive.js';
import { registerSupportRoutes } from './routes/support.js';
import { registerWidgetRoutes } from './routes/widgets.js';

export async function buildApp() {
  const app = Fastify({ logger: true });

  app.addHook('onRequest', authMiddleware);

  app.get('/health', async () => ({
    status: 'ok',
    service: 'meetingiq-bff',
    phase: '5-bff-product-api',
  }));

  app.get('/api/me', async (req) => ({
    user: {
      user_id: req.userContext.userId,
      display_name: req.userContext.displayName,
      email: req.userContext.email,
      role: req.userContext.role,
      organization_id: req.userContext.organizationId,
      team_id: req.userContext.teamId,
      manager_id: req.userContext.managerId,
      territory_ids: req.userContext.territoryIds,
      product_ids: req.userContext.productIds,
      visible_user_ids: req.userContext.visibleUserIds,
      entitlements: req.userContext.entitlements,
    },
  }));

  app.get('/api/platform/zambyl', async (req) => {
    const [health, catalog] = await Promise.all([
      zambylClient.getHealth(),
      zambylClient.getCatalog(req.userContext),
    ]);

    return {
      zambyl_api_url: config.zambyl.apiUrl,
      connected: health.ok,
      health: { status: health.status, body: health.data },
      catalog: catalog.ok
        ? {
            public_api_families: catalog.data?.public_api_families,
            route_count: catalog.data?.routes?.length,
            routes: catalog.data?.routes,
          }
        : { error: catalog.data, status: catalog.status },
      zambyl_headers_used: {
        'x-workload-id': config.zambyl.workloadId,
        'x-user-id': req.userContext.userId,
        'x-entitlements': req.userContext.entitlements.join(','),
      },
    };
  });

  app.get('/api/platform/db', async () => {
    const res = await query('SELECT COUNT(*)::int AS user_count FROM users');
    return { database: 'meetingiq', user_count: res.rows[0].user_count };
  });

  await registerCommandCenterRoutes(app);
  await registerExecutiveRoutes(app);
  await registerSupportRoutes(app);
  await registerWidgetRoutes(app);

  return app;
}

export async function startServer() {
  const app = await buildApp();
  await app.listen({ port: config.port, host: config.host });
  return app;
}

if (process.argv[1] && fileURLToPath(import.meta.url) === path.resolve(process.argv[1])) {
  const app = await startServer();
  for (const signal of ['SIGINT', 'SIGTERM']) {
    process.on(signal, async () => {
      await app.close();
      await closePool();
      await closeCanonicalPool();
      process.exit(0);
    });
  }
}
