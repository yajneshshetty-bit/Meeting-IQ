/** Map canonical entity types → MeetingIQ widget keys (incremental refresh only). */

const ENTITY_WIDGETS = {
  opportunity: ['overview', 'at-risk', 'notifications', 'executive-pipeline', 'executive-forecast'],
  meeting: ['overview', 'agenda', 'notifications'],
  task: ['overview', 'actions-due', 'notifications'],
  support_case: ['notifications', 'support-diagnostics'],
  email: ['notifications'],
  email_thread: ['notifications'],
  conversation: ['notifications'],
  forecast: ['overview', 'executive-pipeline', 'executive-forecast'],
  account: ['overview', 'agenda'],
  document: ['notifications'],
};

const WIDGET_ROUTES = {
  overview: '/api/command-center/overview',
  agenda: '/api/command-center/agenda',
  'at-risk': '/api/command-center/at-risk',
  'actions-due': '/api/command-center/actions-due',
  notifications: '/api/notifications',
  'executive-pipeline': '/api/executive/pipeline',
  'executive-forecast': '/api/executive/forecast',
  'support-diagnostics': '/api/support/diagnostics',
};

export function widgetsForEntity(entityType) {
  return ENTITY_WIDGETS[entityType] || ['overview'];
}

export function routesForWidgets(widgetKeys) {
  const routes = new Set();
  for (const key of widgetKeys) {
    if (WIDGET_ROUTES[key]) routes.add(WIDGET_ROUTES[key]);
  }
  return [...routes];
}

export function buildInvalidationEvent({ entity_id, entity_type, outbox_id, source_event }) {
  const widgets = widgetsForEntity(entity_type);
  return {
    type: 'widget.invalidate',
    entity_id,
    entity_type,
    widgets,
    routes: routesForWidgets(widgets),
    materialization_keys: widgets.map((w) => w.replace(/-/g, '_')),
    outbox_id,
    source_event: source_event || 'canonical.entity.upserted',
    at: new Date().toISOString(),
  };
}

/** Infer source event label for REALTIME_CORRECTNESS_MATRIX rows */
export function labelSourceEvent(entityType, payload = {}) {
  if (entityType === 'email') return 'Email arrives';
  if (entityType === 'opportunity') {
    if (payload.stage) return 'Opportunity stage change';
    return 'Opportunity updated';
  }
  if (entityType === 'meeting') {
    if (payload.is_live) return 'Meeting starting (live)';
    return 'Meeting scheduled';
  }
  if (entityType === 'support_case') {
    if (payload.escalated) return 'Support ticket escalated';
    return 'Support ticket opened';
  }
  if (entityType === 'task') return 'Task assigned';
  if (entityType === 'forecast') return 'Forecast submitted';
  if (entityType === 'conversation') return 'Slack escalation';
  return `${entityType} updated`;
}
