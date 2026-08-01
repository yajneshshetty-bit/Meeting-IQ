/**
 * Scope canonical/search entities to the requesting user's hierarchy.
 * Enforced server-side in BFF — not delegated to UI.
 */

export function canAccessExecutive(ctx) {
  return ctx.entitlements.includes('meetingiq.executive.read');
}

export function isSupportOnly(ctx) {
  return ctx.role === 'support';
}

/** @param {object} entity payload from canonical_entities */
export function entityInScope(entity, ctx) {
  const p = entity.payload || entity;
  const type = entity.entity_type || p.entity_type;

  if (ctx.role === 'admin' || ctx.role === 'leader') return true;

  if (ctx.role === 'support') {
    return type === 'support_case' || type === 'task';
  }

  if (ctx.role === 'se') {
    if (type === 'meeting') {
      const attendees = p.attendee_ids || [];
      return attendees.includes(ctx.userId) || p.organizer_id === ctx.userId;
    }
    return false;
  }

  const ownerId = p.owner_id || p.assignee_id || p.organizer_id;
  if (ownerId && ctx.visibleUserIds.includes(ownerId)) return true;

  const territoryId = p.territory_id;
  if (territoryId && ctx.territoryIds?.includes(territoryId)) return true;

  if (type === 'meeting') {
    const attendees = p.attendee_ids || [];
    if (attendees.some((id) => ctx.visibleUserIds.includes(id))) return true;
    if (p.organizer_id && ctx.visibleUserIds.includes(p.organizer_id)) return true;
  }

  if (type === 'task' && p.assignee_id && ctx.visibleUserIds.includes(p.assignee_id)) return true;

  return ctx.role === 'manager' && ctx.visibleUserIds.includes(ctx.userId) && ownerId === ctx.userId;
}

export function filterEntities(entities, ctx) {
  return entities.filter((e) => entityInScope(e, ctx));
}

export function sumAmount(opportunities) {
  return opportunities.reduce((sum, o) => sum + (Number(o.payload?.amount || o.payload?.commit_amount) || 0), 0);
}

export function countAtRisk(opportunities) {
  return opportunities.filter((o) => {
    const risk = o.payload?.risk_level;
    return risk === 'at_risk' || risk === 'rising';
  }).length;
}
