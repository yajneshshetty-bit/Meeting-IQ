/** Map mock-service delta changes → Zambyl ingestion records */

const CORPUS = {
  accounts: 'meetingiq-corpus-accounts',
  opportunities: 'meetingiq-corpus-opportunities',
  leads: 'meetingiq-corpus-leads',
  products: 'meetingiq-corpus-products',
  forecasts: 'meetingiq-corpus-forecasts',
  meetings: 'meetingiq-corpus-meetings',
  communications: 'meetingiq-corpus-communications',
  actions: 'meetingiq-corpus-actions',
  documents: 'meetingiq-corpus-documents',
  support: 'meetingiq-corpus-support',
  erp: 'meetingiq-corpus-forecasts',
};

function baseRecord(change, connection, payload) {
  const scope = connection.policy_scope || {};
  return {
    source_record_id: `${change.entity_type}:${change.entity_id}`,
    source_version: change.changed_at || payload.updated_at || String(change.change_id),
    payload,
    classification: scope.default_classification || 'internal',
    entitlements: scope.entitlements || ['meetingiq.read'],
    corpus_ids: payload.corpus_ids?.length ? payload.corpus_ids : (scope.corpus_ids || []),
  };
}

function entityPayload(entityType, entityId, title, body, extra = {}) {
  return {
    entity_id: entityId,
    entity_type: entityType,
    title,
    body,
    ...extra,
  };
}

export function mapCrmChange(change, connection) {
  const p = change.payload || {};
  const corpusMap = {
    account: [CORPUS.accounts],
    opportunity: [CORPUS.opportunities],
    contact: [CORPUS.accounts],
    lead: [CORPUS.leads],
    product: [CORPUS.products],
    forecast: [CORPUS.forecasts],
  };
  const idField = {
    account: 'account_id',
    opportunity: 'opportunity_id',
    contact: 'contact_id',
    lead: 'lead_id',
    product: 'product_id',
    forecast: 'forecast_id',
  }[change.entity_type];
  const entityId = p[idField] || change.entity_id;
  const title = p.name || p.title || entityId;
  const body = [p.stage, p.amount, p.email, p.family].filter(Boolean).join(' · ') || title;
  const payload = entityPayload(change.entity_type, entityId, title, body, { ...p, corpus_ids: corpusMap[change.entity_type] });
  return baseRecord(change, connection, payload);
}

export function mapCalendarChange(change, connection) {
  const p = change.payload || {};
  const entityId = p.meeting_id || change.entity_id;
  const payload = entityPayload('meeting', entityId, p.title || entityId, p.meeting_type || 'meeting', {
    ...p,
    corpus_ids: [CORPUS.meetings],
  });
  return baseRecord(change, connection, payload);
}

export function mapMailChange(change, connection) {
  const p = change.payload || {};
  if (change.entity_type === 'thread') {
    const entityId = p.thread_id || change.entity_id;
    const payload = entityPayload('email_thread', entityId, p.subject || entityId, p.subject || '', {
      ...p,
      corpus_ids: [CORPUS.communications],
    });
    return baseRecord(change, connection, payload);
  }
  const entityId = p.message_id || change.entity_id;
  const payload = entityPayload('email', entityId, p.subject || entityId, p.body_preview || p.preview || '', {
    ...p,
    corpus_ids: [CORPUS.communications],
  });
  return baseRecord(change, connection, payload);
}

export function mapSlackChange(change, connection) {
  const p = change.payload || {};
  if (change.entity_type === 'channel') {
    const entityId = p.channel_id || change.entity_id;
    const payload = entityPayload('conversation', entityId, p.name || entityId, p.name || '', {
      ...p,
      subtype: 'slack_channel',
      corpus_ids: [CORPUS.communications],
    });
    return baseRecord(change, connection, payload);
  }
  const entityId = p.message_id || change.entity_id;
  const payload = entityPayload('conversation', entityId, `Slack #${p.channel_id}`, p.text || '', {
    ...p,
    subtype: 'slack_message',
    corpus_ids: [CORPUS.communications],
  });
  return baseRecord(change, connection, payload);
}

export function mapDocumentsChange(change, connection) {
  const p = change.payload || {};
  const entityId = p.document_id || change.entity_id;
  const payload = entityPayload('document', entityId, p.title || entityId, p.document_type || 'document', {
    ...p,
    corpus_ids: [CORPUS.documents],
  });
  return baseRecord(change, connection, payload);
}

export function mapTasksChange(change, connection) {
  const p = change.payload || {};
  const entityId = p.task_id || change.entity_id;
  const payload = entityPayload('task', entityId, p.title || entityId, p.status || 'open', {
    ...p,
    corpus_ids: [CORPUS.actions],
  });
  return baseRecord(change, connection, payload);
}

export function mapSupportChange(change, connection) {
  const p = change.payload || {};
  const entityId = p.ticket_id || change.entity_id;
  const payload = entityPayload('support_case', entityId, p.subject || entityId, p.priority || 'medium', {
    ...p,
    corpus_ids: [CORPUS.support],
  });
  return baseRecord(change, connection, payload);
}

export function mapErpChange(change, connection) {
  const p = change.payload || {};
  const typeMap = {
    order: 'order',
    renewal: 'renewal',
    billing_account: 'billing_account',
  };
  const entityType = typeMap[change.entity_type] || change.entity_type;
  const idField = {
    order: 'order_id',
    renewal: 'renewal_id',
    billing_account: 'billing_account_id',
  }[change.entity_type];
  const entityId = p[idField] || change.entity_id;
  const title = p.order_id || p.renewal_id || p.account_id || entityId;
  const body = [p.status, p.amount, p.product_id].filter(Boolean).join(' · ') || title;
  const payload = entityPayload(entityType, entityId, title, body, {
    ...p,
    corpus_ids: change.entity_type === 'renewal' ? [CORPUS.erp] : [CORPUS.erp],
  });
  return baseRecord(change, connection, payload);
}

export function mapIdentityChange(change, connection) {
  const p = change.payload || {};
  const typeMap = {
    user: 'user',
    territory: 'territory',
    organization: 'organization',
  };
  const entityType = typeMap[change.entity_type] || change.entity_type;
  const idField = {
    user: 'user_id',
    territory: 'territory_id',
    organization: 'organization_id',
  }[change.entity_type];
  const entityId = p[idField] || change.entity_id;
  const title = p.display_name || p.name || entityId;
  const body = p.email || p.role || title;
  // Identity entities: BFF scope only — no corpus_ids → not search-indexed
  const payload = entityPayload(entityType, entityId, title, body, { ...p, corpus_ids: [] });
  return baseRecord(change, connection, payload);
}
