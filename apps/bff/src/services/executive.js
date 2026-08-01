import { zambylClient } from '../zambyl/client.js';
import { fetchCanonicalEntities } from './canonical.js';
import { filterEntities, sumAmount, canAccessExecutive } from './scope.js';
import { withFreshness, watermarkFromSearch } from './freshness.js';

async function search(userContext, profile, query = '', limit = 100) {
  return zambylClient.search(userContext, { profile, query, limit });
}

export async function getExecutivePipeline(userContext) {
  if (!canAccessExecutive(userContext)) {
    const err = new Error('Executive access required');
    err.statusCode = 403;
    throw err;
  }

  const res = await search(userContext, 'meetingiq.executive-pipeline-v1', '', 100);
  const entities = await fetchCanonicalEntities({ entityTypes: ['opportunity', 'forecast'], limit: 200 });
  const opportunities = filterEntities(entities.filter((e) => e.entity_type === 'opportunity'), userContext);
  const forecasts = filterEntities(entities.filter((e) => e.entity_type === 'forecast'), userContext);

  const committed = sumAmount(opportunities);
  const aiAdjusted = Math.round(committed * 0.87);

  const byAccount = {};
  for (const o of opportunities) {
    const acct = o.payload.account_id || 'unknown';
    if (!byAccount[acct]) byAccount[acct] = { account_id: acct, opportunities: [], total: 0 };
    byAccount[acct].opportunities.push({
      opportunity_id: o.entity_id,
      name: o.payload.name,
      stage: o.payload.stage,
      amount: o.payload.amount,
      commit_amount: o.payload.commit_amount,
      risk_level: o.payload.risk_level,
    });
    byAccount[acct].total += Number(o.payload.commit_amount || o.payload.amount) || 0;
  }

  return withFreshness(
    {
      committed_pipeline: committed,
      ai_adjusted_pipeline: aiAdjusted,
      forecast_count: forecasts.length,
      accounts: Object.values(byAccount),
      materialization_key: 'executive_pipeline',
    },
    { watermark: watermarkFromSearch(res.data?.metadata) },
  );
}

export async function getExecutiveForecast(userContext) {
  if (!canAccessExecutive(userContext)) {
    const err = new Error('Executive access required');
    err.statusCode = 403;
    throw err;
  }

  const entities = await fetchCanonicalEntities({ entityTypes: ['forecast', 'opportunity'], limit: 100 });
  const forecasts = filterEntities(entities.filter((e) => e.entity_type === 'forecast'), userContext);
  const orgForecast = forecasts.find((f) => f.entity_id === 'fc_q3_org') || forecasts[0];

  const committed = orgForecast?.payload?.committed_amount || sumAmount(
    filterEntities(entities.filter((e) => e.entity_type === 'opportunity'), userContext),
  );
  const aiAdjusted = orgForecast?.payload?.ai_adjusted_amount || Math.round(committed * 0.87);

  return withFreshness(
    {
      quarter: orgForecast?.payload?.quarter || 'Q3-2026',
      committed_amount: committed,
      ai_adjusted_amount: aiAdjusted,
      currency: orgForecast?.payload?.currency || 'USD',
      materialization_key: 'ai_forecast',
    },
    { watermark: orgForecast?.updated_at },
  );
}

export async function getRisingRisk(userContext) {
  if (!canAccessExecutive(userContext)) {
    const err = new Error('Executive access required');
    err.statusCode = 403;
    throw err;
  }

  const entities = await fetchCanonicalEntities({ entityTypes: ['opportunity'], limit: 100 });
  const scoped = filterEntities(entities, userContext);
  const rising = scoped.filter((o) => o.payload?.risk_level === 'rising');

  return withFreshness(
    {
      deals: rising.map((o) => ({
        opportunity_id: o.entity_id,
        name: o.payload.name,
        account_id: o.payload.account_id,
        stage: o.payload.stage,
        amount: o.payload.amount,
        risk_level: o.payload.risk_level,
      })),
      count: rising.length,
      materialization_key: 'rising_risk',
    },
    { watermark: rising[0]?.updated_at },
  );
}
