import { zambylClient } from '../zambyl/client.js';
import { fetchCanonicalEntities } from './canonical.js';
import { filterEntities } from './scope.js';
import { withFreshness, watermarkFromSearch } from './freshness.js';

const DEFAULT_PROFILES = [
  'meetingiq.pipeline-v1',
  'meetingiq.agenda-v1',
  'meetingiq.account-v1',
];

export async function unifiedSearch(userContext, { query = '', profile, limit = 20 } = {}) {
  if (profile) {
    const res = await zambylClient.search(userContext, { profile, query, limit });
    return withFreshness(
      {
        results: res.data?.results || [],
        metadata: res.data?.metadata || {},
        profile,
      },
      { watermark: watermarkFromSearch(res.data?.metadata) },
    );
  }

  const responses = await Promise.all(
    DEFAULT_PROFILES.map(async (p) => {
      const res = await zambylClient.search(userContext, { profile: p, query, limit: Math.ceil(limit / 3) });
      return { profile: p, results: res.data?.results || [], metadata: res.data?.metadata };
    }),
  );

  const results = responses.flatMap((r) =>
    r.results.map((item) => ({ ...item, profile: r.profile })),
  ).slice(0, limit);

  return withFreshness(
    { results, query },
    { watermark: watermarkFromSearch(responses[0]?.metadata) },
  );
}

export async function searchAccounts(userContext, query = '', limit = 10) {
  const res = await zambylClient.search(userContext, {
    profile: 'meetingiq.account-v1',
    query,
    limit,
  });
  const entities = await fetchCanonicalEntities({ entityTypes: ['account'], limit: 50 });
  const accounts = filterEntities(entities, userContext).filter((a) => {
    if (!query) return true;
    const name = (a.payload?.name || a.payload?.title || '').toLowerCase();
    return name.includes(query.toLowerCase());
  });

  return withFreshness(
    {
      search_results: res.data?.results || [],
      accounts: accounts.map((a) => ({
        account_id: a.entity_id,
        name: a.payload.name || a.payload.title,
        tier: a.payload.tier,
        health_score: a.payload.health_score,
        territory_id: a.payload.territory_id,
      })),
    },
    { watermark: watermarkFromSearch(res.data?.metadata) },
  );
}

export async function searchVoc(userContext, { query = '', accountId, limit = 20 } = {}) {
  const q = accountId ? `${query} ${accountId}`.trim() : query;
  const res = await zambylClient.search(userContext, {
    profile: 'meetingiq.voc-v1',
    query: q,
    limit,
  });

  return withFreshness(
    {
      communications: (res.data?.results || []).map((r) => ({
        entity_id: r.entity_id,
        title: r.title,
        snippet: r.snippet,
        score: r.score,
      })),
      account_id: accountId || null,
    },
    { watermark: watermarkFromSearch(res.data?.metadata) },
  );
}

export async function listProducts(userContext) {
  const entities = await fetchCanonicalEntities({ entityTypes: ['product'], limit: 50 });
  const products = filterEntities(entities, userContext);

  return withFreshness(
    {
      products: products.map((p) => ({
        product_id: p.entity_id,
        name: p.payload.name,
        family: p.payload.family,
      })),
    },
    { watermark: products[0]?.updated_at },
  );
}
