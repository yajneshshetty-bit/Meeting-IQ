import { zambylClient } from '../zambyl/client.js';
import { fetchCanonicalEntities } from './canonical.js';
import { filterEntities } from './scope.js';
import { searchVoc } from './search.js';
import { withFreshness } from './freshness.js';
import { EXPERIENCE_IDS } from '../../../../packages/experiences/index.js';

export { EXPERIENCE_IDS };

function citationsFromOutput(output, experienceId) {
  const cites = output?.citations || [];
  if (cites.length) return cites;
  if (output?.provenance) {
    return [{ source: 'zambyl-experience', experience_id: experienceId, ...output.provenance }];
  }
  return [];
}

export async function runExperience(userContext, experienceId, input = {}) {
  const enriched = await enrichExperienceInput(userContext, experienceId, input);
  const res = await zambylClient.executeExperience(userContext, {
    experience_id: experienceId,
    input: enriched,
  });

  if (!res.ok) {
    const err = new Error(res.data?.error?.message || 'Experience execution failed');
    err.statusCode = res.status || 502;
    err.code = res.data?.error?.code;
    throw err;
  }

  const output = res.data?.output || res.data?.partial?.output || {};
  return withFreshness(
    {
      experience_id: experienceId,
      experience: res.data?.experience,
      output,
      citations: citationsFromOutput(output, experienceId),
      lineage: output?.provenance || res.data?.provenance,
    },
    { source: 'zambyl-experience', confidence: res.data?.status === 'partial' ? 'medium' : 'high' },
  );
}

async function enrichExperienceInput(userContext, experienceId, input) {
  const base = { ...input };

  if (experienceId === EXPERIENCE_IDS.VOICE_OF_CUSTOMER && base.account_id && !base.communications) {
    const voc = await searchVoc(userContext, { accountId: base.account_id, limit: 10 });
    base.communications = voc.data?.communications || [];
  }

  if (experienceId === EXPERIENCE_IDS.RISK_ANALYSIS && base.opportunity_id && !base.opportunities) {
    const entities = await fetchCanonicalEntities({ entityTypes: ['opportunity'], limit: 50 });
    const opp = filterEntities(entities, userContext).find((e) => e.entity_id === base.opportunity_id);
    if (opp) base.opportunities = [opp.payload];
  }

  if (experienceId === EXPERIENCE_IDS.FORECAST_EXPLANATION && !base.forecast) {
    const entities = await fetchCanonicalEntities({ entityTypes: ['forecast', 'opportunity'], limit: 100 });
    const scoped = filterEntities(entities, userContext);
    const forecast = scoped.find((e) => e.entity_type === 'forecast' && e.entity_id === 'fc_q3_org')
      || scoped.find((e) => e.entity_type === 'forecast');
    base.forecast = forecast?.payload || { quarter: base.quarter || 'Q3-2026', committed_amount: 0 };
    base.opportunities = scoped.filter((e) => e.entity_type === 'opportunity').map((e) => e.payload);
  }

  if (experienceId === EXPERIENCE_IDS.EXECUTIVE_SUMMARY && !base.pipeline) {
    const entities = await fetchCanonicalEntities({ entityTypes: ['opportunity'], limit: 100 });
    base.pipeline = {
      quarter: base.quarter || 'Q3-2026',
      opportunities: filterEntities(entities, userContext).map((e) => e.payload),
    };
  }

  if (experienceId === EXPERIENCE_IDS.NEXT_BEST_ACTIONS && base.opportunity_id && !base.tasks) {
    const entities = await fetchCanonicalEntities({ entityTypes: ['task'], limit: 50 });
    base.tasks = filterEntities(entities, userContext)
      .filter((t) => t.payload?.opportunity_id === base.opportunity_id)
      .map((t) => t.payload);
  }

  return base;
}

export const AI_CATALOG = [
  { key: 'company-research', experience_id: EXPERIENCE_IDS.COMPANY_RESEARCH, input: ['account_id'] },
  { key: 'pre-meeting-brief', experience_id: EXPERIENCE_IDS.PRE_MEETING_BRIEF, input: ['meeting_id'] },
  { key: 'voice-of-customer', experience_id: EXPERIENCE_IDS.VOICE_OF_CUSTOMER, input: ['account_id'] },
  { key: 'executive-summary', experience_id: EXPERIENCE_IDS.EXECUTIVE_SUMMARY, input: ['quarter'], executive: true },
  { key: 'opportunity-summary', experience_id: EXPERIENCE_IDS.OPPORTUNITY_SUMMARY, input: ['opportunity_id'] },
  { key: 'risk-analysis', experience_id: EXPERIENCE_IDS.RISK_ANALYSIS, input: ['opportunity_id'] },
  { key: 'next-best-actions', experience_id: EXPERIENCE_IDS.NEXT_BEST_ACTIONS, input: ['opportunity_id'] },
  { key: 'follow-up-draft', experience_id: EXPERIENCE_IDS.FOLLOW_UP_DRAFT, input: ['meeting_id'] },
  { key: 'qbr-narrative', experience_id: EXPERIENCE_IDS.QBR_NARRATIVE, input: ['account_id'] },
  { key: 'forecast-explanation', experience_id: EXPERIENCE_IDS.FORECAST_EXPLANATION, input: ['quarter'], executive: true },
  { key: 'meeting-quality', experience_id: EXPERIENCE_IDS.MEETING_QUALITY, input: ['meeting_id'] },
];
