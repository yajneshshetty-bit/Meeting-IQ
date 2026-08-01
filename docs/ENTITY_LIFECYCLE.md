# Entity Lifecycle

> For every important MeetingIQ entity, define its full lifecycle. When something doesn't update correctly, investigate at the stage that failed.

**Status:** Complete — Phase 0B (2026-08-01)  
**Authority:** [DOMAIN_MODEL.md](./DOMAIN_MODEL.md) | **PRD:** [docs/prd/](./prd/)

**Related:** [REALTIME_CORRECTNESS_MATRIX.md](./REALTIME_CORRECTNESS_MATRIX.md) | [PLATFORM_USAGE_REPORT.md](./PLATFORM_USAGE_REPORT.md)

---

## Lifecycle Fields

| Field | Meaning |
|-------|---------|
| **Created** | Which source system or process creates the entity |
| **Canonical** | How it is stored in Zambyl |
| **Materialized** | Derived projections and read models |
| **Consumed** | MeetingIQ surfaces that display it |
| **Updated** | What triggers changes |
| **Invalidates** | Which projections/materializations must refresh |
| **Triggers** | Experiences, actions, or notifications fired |
| **Visible To** | Roles with access |
| **Retention** | Data retention policy |

---

## Entity Relationship Overview

See [DOMAIN_MODEL.md §4](./DOMAIN_MODEL.md) for full ERD.

---

## Organization

| Field | Value |
|-------|-------|
| **Created** | Identity Service (`POST /organizations`) |
| **Canonical** | Zambyl canonical entity (`entity_type: organization`) via Identity Connector |
| **Materialized** | Org hierarchy read model (BFF) |
| **Consumed** | Role scope resolution, executive rollups |
| **Updated** | Identity Service batch sync |
| **Invalidates** | User scope materializations |
| **Triggers** | — |
| **Visible To** | Admin, Leader |
| **Retention** | Indefinite |

---

## User

| Field | Value |
|-------|-------|
| **Created** | Identity Service |
| **Canonical** | Zambyl canonical entity (`entity_type: user`) — BFF auth context; not search-indexed |
| **Materialized** | Session + entitlement map (MeetingIQ BFF DB) |
| **Consumed** | Role switcher (AE/Manager/SE/Leader), ownership filters |
| **Updated** | Identity sync, manager hierarchy changes |
| **Invalidates** | All role-scoped materializations for affected user |
| **Triggers** | Visibility recalculation |
| **Visible To** | Self, Manager, Admin |
| **Retention** | Employment + 1 year |

---

## Team

| Field | Value |
|-------|-------|
| **Created** | Identity Service |
| **Canonical** | Zambyl canonical entity (`entity_type: team`) |
| **Materialized** | Team rollup materializations |
| **Consumed** | Manager views, executive rollups |
| **Updated** | Identity hierarchy sync |
| **Invalidates** | Pipeline rollups, forecast rollups |
| **Triggers** | — |
| **Visible To** | Manager, Leader, Admin |
| **Retention** | 7 years |

---

## Product

| Field | Value |
|-------|-------|
| **Created** | CRM Service |
| **Canonical** | Zambyl canonical entity (`entity_type: product`) |
| **Materialized** | Product filter index |
| **Consumed** | Executive View product dropdown |
| **Updated** | CRM sync |
| **Invalidates** | Product-scoped pipeline materializations |
| **Triggers** | — |
| **Visible To** | All sales roles |
| **Retention** | 7 years |

---

## Lead

| Field | Value |
|-------|-------|
| **Created** | CRM Service (`POST /leads`) |
| **Canonical** | Zambyl canonical entity (`entity_type: lead`) via CRM Connector |
| **Materialized** | Pipeline projection (leads view) |
| **Consumed** | Executive View Leads toggle |
| **Updated** | CRM delta / conversion to opportunity |
| **Invalidates** | Pipeline materialization |
| **Triggers** | — |
| **Visible To** | AE, Manager, Leader |
| **Retention** | 3 years |

---

## Opportunity

| Field | Value |
|-------|-------|
| **Created** | CRM Service (`POST /opportunities`) |
| **Canonical** | Zambyl canonical entity (`entity_type: opportunity`) via CRM Connector |
| **Materialized** | Pipeline Projection, Forecast Projection, At-Risk Projection, Executive Pipeline |
| **Consumed** | Command Center Pipeline KPI, Executive deal rows, meeting status dots |
| **Updated** | CRM Delta API / webhook (`opportunity.updated`) |
| **Invalidates** | Forecast, Risk, Pipeline rollups, AI-adjusted forecast |
| **Triggers** | Risk Experience, Forecast Explanation Experience, VoC, QBR |
| **Visible To** | AE (owned), Manager (team), Leader (org), Admin (all) |
| **Retention** | 7 years |

---

## Account

| Field | Value |
|-------|-------|
| **Created** | CRM Service |
| **Canonical** | Zambyl canonical entity (`entity_type: account`) via CRM Connector |
| **Materialized** | Account Summary Materialization, Executive hierarchy grouping |
| **Consumed** | Research Company, Meeting Cards, Executive account groups |
| **Updated** | CRM delta sync |
| **Invalidates** | Account Summary, related Opportunity rollups |
| **Triggers** | Company Research Experience, VoC Experience |
| **Visible To** | AE (territory), Manager, Leader, Admin |
| **Retention** | 7 years |

---

## Meeting

| Field | Value |
|-------|-------|
| **Created** | Calendar Service |
| **Canonical** | Zambyl canonical entity (`entity_type: meeting`) via Calendar Connector |
| **Materialized** | Agenda Projection, Meeting Card Materialization, Weekly Overview |
| **Consumed** | Command Center Agenda, Live Meeting Cards, Meetings KPI |
| **Updated** | Calendar webhook (`meeting.scheduled`, `meeting.canceled`, `meeting.started`, `meeting.live`) |
| **Invalidates** | Agenda Projection, Pre-meeting Brief Materialization, Meetings KPI |
| **Triggers** | Pre-meeting Brief Experience, Meeting Quality Experience |
| **Visible To** | AE (attendee), Manager (reports' meetings), Leader, Admin |
| **Retention** | 3 years |

---

## Contact

| Field | Value |
|-------|-------|
| **Created** | CRM Service |
| **Canonical** | Zambyl canonical entity (`entity_type: contact`) |
| **Materialized** | Contact search projection |
| **Consumed** | Meeting attendee lists, Research Company, action owner display |
| **Updated** | CRM delta sync |
| **Invalidates** | Related Account/Opportunity context |
| **Triggers** | — |
| **Visible To** | AE, Manager, Leader, Admin |
| **Retention** | 7 years |

---

## Action

| Field | Value |
|-------|-------|
| **Created** | Task Service or MeetingIQ via Zambyl Actions |
| **Canonical** | Zambyl canonical entity (`entity_type: task`) + actions table for governed writes |
| **Materialized** | Actions Due Materialization, Notification Queue |
| **Consumed** | Command Center Actions Due KPI, Respond Now panel |
| **Updated** | Task Service delta / `POST /v1/actions` completion |
| **Invalidates** | Actions Due Materialization, Notification Queue |
| **Triggers** | Notification, Approval workflow |
| **Visible To** | Assignee, Manager, Admin |
| **Retention** | 3 years |

---

## Forecast

| Field | Value |
|-------|-------|
| **Created** | CRM Service / ERP Service |
| **Canonical** | Zambyl canonical entity (`entity_type: forecast`) |
| **Materialized** | Executive Forecast Bars, AI-adjusted Forecast Materialization |
| **Consumed** | Executive committed/AI-adjusted KPIs, QBR |
| **Updated** | CRM/ERP delta sync, rep submission |
| **Invalidates** | Forecast Projection, Pipeline rollups, AI-adjusted materialization |
| **Triggers** | Forecast Explanation Experience |
| **Visible To** | Manager, Leader, CRO, Admin |
| **Retention** | 7 years |

---

## Risk Score

| Field | Value |
|-------|-------|
| **Created** | Derived — Risk Experience + analytics profile (`meetingiq.risk-scoring-v1`) |
| **Canonical** | Inputs from Opportunity, SupportCase, Email canonical entities |
| **Materialized** | Risk Score Materialization (MIQ-003) |
| **Consumed** | Meeting status dots, At-Risk KPI, Rising Risk KPI, deal ↑ risk tags |
| **Updated** | Invalidation on Opportunity, SupportCase, Email, Document changes |
| **Invalidates** | Self + at_risk_deals + rising_risk + meeting_card materializations |
| **Triggers** | Risk Analysis Experience, Alert notification |
| **Visible To** | AE, Manager, Leader, Admin |
| **Retention** | 2 years (derived artifact) |

---

## Meeting Quality Metric

| Field | Value |
|-------|-------|
| **Created** | Derived — Meeting Quality Experience post-meeting |
| **Canonical** | Input: Meeting entity + conversation evidence |
| **Materialized** | Weekly quality aggregate (`avg_quality` KPI) |
| **Consumed** | Command Center Avg Quality KPI (73) |
| **Updated** | Meeting completed + quality experience run |
| **Invalidates** | weekly_overview materialization |
| **Triggers** | Meeting Quality Experience |
| **Visible To** | AE, Manager, Leader |
| **Retention** | 2 years |

---

## Email

| Field | Value |
|-------|-------|
| **Created** | Mail Service |
| **Canonical** | Zambyl evidence object + canonical entity (`entity_type: email`) via Mail Connector |
| **Materialized** | Search projection, Notification queue inputs |
| **Consumed** | Notifications, Pre-meeting Brief, VoC |
| **Updated** | Mail webhook / poll (`email.received`) |
| **Invalidates** | Brief Materialization, Risk Materialization |
| **Triggers** | Pre-meeting Brief refresh, Notification |
| **Visible To** | AE (thread participant), Manager, Admin |
| **Retention** | 3 years |

---

## Conversation

| Field | Value |
|-------|-------|
| **Created** | Slack Service or Mail Service |
| **Canonical** | Zambyl canonical entity (`entity_type: conversation`) + evidence |
| **Materialized** | VoC Projection, Search index |
| **Consumed** | Voice of Customer button, Research Company |
| **Updated** | Slack/Mail event stream |
| **Invalidates** | VoC Materialization |
| **Triggers** | VoC Experience |
| **Visible To** | AE, Manager, Leader |
| **Retention** | 2 years |

---

## Document

| Field | Value |
|-------|-------|
| **Created** | Document Service |
| **Canonical** | Zambyl evidence object + canonical entity (`entity_type: document`) |
| **Materialized** | Document search projection |
| **Consumed** | Risk view, QBR, overdue SLA actions (whitepaper) |
| **Updated** | Document Service webhook (`document.uploaded`) |
| **Invalidates** | Risk Materialization, action completion state |
| **Triggers** | Risk Experience |
| **Visible To** | AE, Manager, Admin |
| **Retention** | 7 years |

---

## Support Case

| Field | Value |
|-------|-------|
| **Created** | Support Service |
| **Canonical** | Zambyl canonical entity (`entity_type: support_case`) via Support Connector |
| **Materialized** | Risk inputs, SLA compliance projection |
| **Consumed** | Risk indicators, pre-meeting brief context |
| **Updated** | Support webhook (`case.escalated`, `case.opened`) |
| **Invalidates** | Risk Materialization, pre_meeting_brief |
| **Triggers** | Alert, Risk Experience |
| **Visible To** | AE, Support Analyst, Manager, Admin |
| **Retention** | 5 years |

---

## Approval

| Field | Value |
|-------|-------|
| **Created** | MeetingIQ via Zambyl Actions (`POST /v1/actions`) |
| **Canonical** | Zambyl actions table (status: awaiting_approval) |
| **Materialized** | Approvals Pending Materialization, Notification Queue |
| **Consumed** | Command Center Approvals filter in Respond Now |
| **Updated** | Approval via Actions runtime / admin approve |
| **Invalidates** | Approvals Materialization, Notification Queue |
| **Triggers** | Notification to approver |
| **Visible To** | Approver, Admin |
| **Retention** | 7 years |

---

## SLA

| Field | Value |
|-------|-------|
| **Created** | Support Service / ERP Service |
| **Canonical** | Zambyl canonical entity (`entity_type: sla`) |
| **Materialized** | SLA Compliance Projection |
| **Consumed** | Respond Now SLA-type notifications, risk indicators |
| **Updated** | Support ticket state changes, breach detection |
| **Invalidates** | Risk Materialization, Notification Queue |
| **Triggers** | Alert when SLA breached — e.g. "Overdue commitment: Send Acme security whitepaper" |
| **Visible To** | AE, Support Analyst, Manager, Admin |
| **Retention** | 3 years |

---

## Notification

| Field | Value |
|-------|-------|
| **Created** | MeetingIQ BFF (derived from canonical changes — MIQ-006) |
| **Canonical** | **Not canonical** — MeetingIQ BFF DB only |
| **Materialized** | Notification queue (103 total, 30 urgent in PRD) |
| **Consumed** | Respond Now panel, notification bell badge |
| **Updated** | Source entity changes via BFF push layer |
| **Invalidates** | Read/unread state per user |
| **Triggers** | BFF SSE to UI |
| **Visible To** | Target user only |
| **Retention** | 90 days |

---

## Alert

| Field | Value |
|-------|-------|
| **Created** | MeetingIQ BFF (subset of Notification with urgency=urgent) |
| **Canonical** | Not canonical — BFF derived |
| **Materialized** | Urgency queue slice of notification_queue |
| **Consumed** | Respond Now urgent filter, red dot indicators |
| **Updated** | SLA breach, risk threshold, connector failure |
| **Invalidates** | Notification read state |
| **Triggers** | BFF SSE to UI |
| **Visible To** | Target user role |
| **Retention** | 90 days |

---

## Completion Checklist (Phase 0B)

- [x] All entity types confirmed against domain model ([DOMAIN_MODEL.md](./DOMAIN_MODEL.md))
- [x] Relationships validated against ERD
- [x] Every entity has all lifecycle fields populated
- [x] Cross-references to REALTIME_CORRECTNESS_MATRIX verified
- [x] PRD screenshots mapped ([command-center.png](./prd/command-center.png), [executive-pipeline-q3.png](./prd/executive-pipeline-q3.png))
- [x] Retention policies documented (operator review at Phase 10)
