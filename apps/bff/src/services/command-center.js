import { zambylClient } from '../zambyl/client.js';
import { fetchCanonicalEntities } from './canonical.js';
import { filterEntities, sumAmount, countAtRisk } from './scope.js';
import { withFreshness, watermarkFromSearch } from './freshness.js';

async function search(userContext, profile, query = '', limit = 50) {
  return zambylClient.search(userContext, { profile, query, limit });
}

export async function getCommandCenterOverview(userContext) {
  const [oppSearch, meetingSearch, taskEntities] = await Promise.all([
    search(userContext, 'meetingiq.pipeline-v1', '', 100),
    search(userContext, 'meetingiq.agenda-v1', '', 100),
    fetchCanonicalEntities({ entityTypes: ['opportunity', 'meeting', 'task'] }),
  ]);

  const opportunities = filterEntities(
    taskEntities.filter((e) => e.entity_type === 'opportunity'),
    userContext,
  );
  const meetings = filterEntities(
    taskEntities.filter((e) => e.entity_type === 'meeting'),
    userContext,
  );
  const tasks = filterEntities(
    taskEntities.filter((e) => e.entity_type === 'task'),
    userContext,
  );

  const committed = sumAmount(opportunities);
  const atRisk = countAtRisk(opportunities);
  const openTasks = tasks.filter((t) => !['done', 'completed'].includes(t.payload?.status));
  const overdueTasks = openTasks.filter((t) => {
    const due = t.payload?.due_date;
    return (t.payload?.priority === 'critical' || (due && due < '2026-07-31'));
  }).length;

  const scheduledMeetings = meetings.filter((m) => m.payload?.status === 'scheduled').length;
  const avgQuality = meetings.length
    ? Math.min(100, Math.round(60 + (scheduledMeetings / Math.max(meetings.length, 1)) * 25 + (atRisk === 0 ? 10 : 0)))
    : 0;

  const watermark = watermarkFromSearch(oppSearch.data?.metadata)
    || watermarkFromSearch(meetingSearch.data?.metadata)
    || new Date().toISOString();

  return withFreshness(
    {
      kpis: {
        committed_pipeline: committed,
        at_risk_deals: atRisk,
        meetings_this_week: meetings.length,
        actions_due: openTasks.length,
        actions_overdue: overdueTasks,
        avg_meeting_quality: avgQuality,
      },
      materialization_key: 'weekly_overview',
    },
    { watermark },
  );
}

export async function getAgenda(userContext) {
  const res = await search(userContext, 'meetingiq.agenda-v1', '', 50);
  const entities = await fetchCanonicalEntities({ entityTypes: ['meeting'], limit: 50 });
  const meetings = filterEntities(entities, userContext).map((m) => ({
    meeting_id: m.entity_id,
    title: m.payload.title || m.payload.name,
    start_time: m.payload.start_time,
    account_id: m.payload.account_id,
    opportunity_id: m.payload.opportunity_id,
    meeting_type: m.payload.meeting_type,
    status: m.payload.status,
    is_live: m.payload.is_live,
  }));

  return withFreshness(
    { meetings, materialization_key: 'agenda_week' },
    { watermark: watermarkFromSearch(res.data?.metadata) },
  );
}

export async function getAtRiskDeals(userContext) {
  const entities = await fetchCanonicalEntities({ entityTypes: ['opportunity'], limit: 100 });
  const scoped = filterEntities(entities, userContext);
  const atRisk = scoped.filter((o) => ['at_risk', 'rising'].includes(o.payload?.risk_level));

  return withFreshness(
    {
      deals: atRisk.map((o) => ({
        opportunity_id: o.entity_id,
        name: o.payload.name,
        account_id: o.payload.account_id,
        stage: o.payload.stage,
        amount: o.payload.amount,
        commit_amount: o.payload.commit_amount,
        risk_level: o.payload.risk_level,
        owner_id: o.payload.owner_id,
      })),
      count: atRisk.length,
      materialization_key: 'at_risk_deals',
    },
    { watermark: scoped[0]?.updated_at },
  );
}

export async function getActionsDue(userContext) {
  const entities = await fetchCanonicalEntities({ entityTypes: ['task'], limit: 100 });
  const tasks = filterEntities(entities, userContext);

  return withFreshness(
    {
      tasks: tasks.map((t) => ({
        task_id: t.entity_id,
        title: t.payload.title,
        due_date: t.payload.due_date,
        status: t.payload.status,
        priority: t.payload.priority,
        assignee_id: t.payload.assignee_id,
      })),
      count: tasks.length,
      materialization_key: 'actions_due',
    },
    { watermark: tasks[0]?.updated_at },
  );
}
