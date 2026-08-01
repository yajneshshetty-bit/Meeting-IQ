import { fetchCanonicalEntities } from './canonical.js';
import { withFreshness } from './freshness.js';

export async function getSupportDiagnostics(_userContext) {
  const entities = await fetchCanonicalEntities({ entityTypes: ['support_case'], limit: 100 });

  return withFreshness(
    {
      tickets: entities.map((e) => ({
        ticket_id: e.entity_id,
        subject: e.payload.subject,
        account_id: e.payload.account_id,
        priority: e.payload.priority,
        status: e.payload.status,
        escalated: e.payload.escalated,
      })),
      count: entities.length,
    },
    { watermark: entities[0]?.updated_at, confidence: 'medium' },
  );
}
