import { unifiedSearch, searchAccounts, searchVoc, listProducts } from '../services/search.js';
import { forbidSupport, sendServiceError } from './helpers.js';

export async function registerSearchRoutes(app) {
  app.get('/api/search', async (req, reply) => {
    if (forbidSupport(req, reply)) return;
    const { q = '', profile, limit } = req.query;
    return unifiedSearch(req.userContext, {
      query: q,
      profile,
      limit: limit ? Number(limit) : 20,
    });
  });

  app.get('/api/search/accounts', async (req, reply) => {
    if (forbidSupport(req, reply)) return;
    return searchAccounts(req.userContext, req.query.q || '', Number(req.query.limit || 10));
  });

  app.get('/api/search/voc', async (req, reply) => {
    if (forbidSupport(req, reply)) return;
    return searchVoc(req.userContext, {
      query: req.query.q || '',
      accountId: req.query.account_id,
      limit: Number(req.query.limit || 20),
    });
  });

  app.get('/api/products', async (req, reply) => {
    if (forbidSupport(req, reply)) return;
    return listProducts(req.userContext);
  });
}
