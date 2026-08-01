import { fetchCanonicalEntities } from './canonical.js';
import { filterEntities } from './scope.js';
import { withFreshness } from './freshness.js';

function urgencyFor(item) {
  if (item.urgency) return item.urgency;
  if (item.priority === 'critical' || item.type === 'sla') return 'urgent';
  if (item.priority === 'high' || item.type === 'risk') return 'soon';
  return 'later';
}

export async function getNotificationQueue(userContext) {
  const entities = await fetchCanonicalEntities({
    entityTypes: ['task', 'opportunity', 'meeting', 'support_case'],
    limit: 200,
  });
  const scoped = filterEntities(entities, userContext);

  const items = [];

  for (const e of scoped.filter((x) => x.entity_type === 'task')) {
    const p = e.payload;
    if (p.status === 'done' || p.status === 'completed') continue;
    const overdue = p.due_date && p.due_date < '2026-07-31';
    items.push({
      id: e.entity_id,
      type: overdue ? 'sla' : 'action',
      urgency: overdue || p.priority === 'critical' ? 'urgent' : p.priority === 'high' ? 'soon' : 'later',
      title: p.title,
      subtitle: p.assignee_id,
      account_id: p.account_id,
      opportunity_id: p.opportunity_id,
      due_date: p.due_date,
    });
  }

  for (const e of scoped.filter((x) => x.entity_type === 'opportunity')) {
    const p = e.payload;
    if (!['at_risk', 'rising'].includes(p.risk_level)) continue;
    items.push({
      id: `risk_${e.entity_id}`,
      type: 'risk',
      urgency: p.risk_level === 'rising' ? 'urgent' : 'soon',
      title: `${p.name} — ${p.risk_level.replace('_', ' ')} deal`,
      subtitle: p.stage,
      account_id: p.account_id,
      opportunity_id: e.entity_id,
    });
  }

  for (const e of scoped.filter((x) => x.entity_type === 'meeting')) {
    const p = e.payload;
    if (p.is_live) {
      items.push({
        id: `live_${e.entity_id}`,
        type: 'meeting',
        urgency: 'urgent',
        title: `LIVE: ${p.title || p.name}`,
        subtitle: p.start_time,
        account_id: p.account_id,
      });
    }
  }

  for (const e of scoped.filter((x) => x.entity_type === 'support_case')) {
    const p = e.payload;
    if (p.escalated || p.priority === 'critical') {
      items.push({
        id: `support_${e.entity_id}`,
        type: 'connectors',
        urgency: 'urgent',
        title: p.subject,
        subtitle: p.status,
        account_id: p.account_id,
      });
    }
  }

  items.sort((a, b) => {
    const order = { urgent: 0, soon: 1, later: 2 };
    return order[urgencyFor(a)] - order[urgencyFor(b)];
  });

  return withFreshness(
    {
      total: items.length,
      items,
      filters: {
        urgency: ['all', 'urgent', 'soon', 'later'],
        types: ['all', 'sla', 'approvals', 'risk', 'connectors'],
        group_by: ['urgency', 'type', 'none'],
      },
    },
    { watermark: scoped[0]?.updated_at, confidence: 'medium' },
  );
}
