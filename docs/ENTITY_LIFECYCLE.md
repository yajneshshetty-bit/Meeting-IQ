# Entity Lifecycle

> For every important MeetingIQ entity, define its full lifecycle. When something doesn't update correctly, investigate at the stage that failed.

**Status:** Draft — completed during [Phase 0B](./phases/PHASE_00B_DOMAIN_MODELING.md), refined through implementation.

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

```
Organization
  └── Business Unit
        └── Team
              └── User (Identity Service)
Account ────── Opportunity ────── Contact
   │                │                  │
   ├── Meeting      ├── Forecast       ├── Email
   ├── Document     ├── Action         ├── Conversation
   ├── Support Case └── Risk Score     └── Calendar Event
   └── SLA / Alert
```

---

## Opportunity

| Field | Value |
|-------|-------|
| **Created** | CRM Service (`POST /opportunities`) |
| **Canonical** | Zambyl canonical entity (`entity_type: opportunity`) via CRM Connector |
| **Materialized** | Pipeline Projection, Forecast Projection, At-Risk Projection |
| **Consumed** | Command Center Pipeline, Executive Dashboard, Meeting Cards |
| **Updated** | CRM Delta API / webhook (`opportunity.updated`) |
| **Invalidates** | Forecast Projection, Risk Materialization, Pipeline rollups |
| **Triggers** | Risk Experience, Forecast Explanation Experience |
| **Visible To** | AE (owned), Manager (team), VP (org), Admin (all) |
| **Retention** | 7 years |

---

## Account

| Field | Value |
|-------|-------|
| **Created** | CRM Service |
| **Canonical** | Zambyl canonical entity (`entity_type: account`) via CRM Connector |
| **Materialized** | Account Summary Materialization, Research cache |
| **Consumed** | Research Company, Meeting Cards, Executive View hierarchy |
| **Updated** | CRM delta sync |
| **Invalidates** | Account Summary, related Opportunity rollups |
| **Triggers** | Company Research Experience, VoC Experience |
| **Visible To** | AE (territory), Manager, VP, Admin |
| **Retention** | 7 years |

---

## Meeting

| Field | Value |
|-------|-------|
| **Created** | Calendar Service |
| **Canonical** | Zambyl canonical entity (`entity_type: meeting`) via Calendar Connector |
| **Materialized** | Agenda Projection, Meeting Card Materialization |
| **Consumed** | Command Center Agenda, Live Meeting Cards |
| **Updated** | Calendar webhook / poll (`meeting.scheduled`, `meeting.canceled`, `meeting.started`) |
| **Invalidates** | Agenda Projection, Pre-meeting Brief Materialization |
| **Triggers** | Pre-meeting Brief Experience, Meeting Quality Experience |
| **Visible To** | AE (attendee), Manager (reports' meetings), VP, Admin |
| **Retention** | 3 years |

---

## Contact

| Field | Value |
|-------|-------|
| **Created** | CRM Service |
| **Canonical** | Zambyl canonical entity (`entity_type: contact`) |
| **Materialized** | Contact index (search projection) |
| **Consumed** | Meeting attendee lists, Research Company |
| **Updated** | CRM delta sync |
| **Invalidates** | Related Account/Opportunity context |
| **Triggers** | — |
| **Visible To** | AE, Manager, VP, Admin |
| **Retention** | 7 years |

---

## Action

| Field | Value |
|-------|-------|
| **Created** | Task Service or MeetingIQ via Zambyl Actions |
| **Canonical** | Zambyl actions table + canonical task entity |
| **Materialized** | Actions Due Materialization |
| **Consumed** | Command Center Actions Due, Approvals panel |
| **Updated** | Task Service delta / Action completion via `POST /v1/actions` |
| **Invalidates** | Actions Due Materialization |
| **Triggers** | Notification, Approval workflow |
| **Visible To** | Assignee, Manager, Admin |
| **Retention** | 3 years |

---

## Forecast

| Field | Value |
|-------|-------|
| **Created** | CRM Service / ERP Service |
| **Canonical** | Zambyl canonical entity (`entity_type: forecast`) |
| **Materialized** | Executive Forecast Bars, AI-adjusted Forecast Projection |
| **Consumed** | Executive View forecast bars, QBR |
| **Updated** | CRM/ERP delta sync, rep submission |
| **Invalidates** | Forecast Projection, Pipeline rollups |
| **Triggers** | Forecast Explanation Experience |
| **Visible To** | Manager, VP, CRO, Admin |
| **Retention** | 7 years |

---

## Risk Score

| Field | Value |
|-------|-------|
| **Created** | Derived — Risk Experience + analytics profile |
| **Canonical** | Inputs from Opportunity, Support, Email canonical entities |
| **Materialized** | Risk Score Materialization (see MIQ-003) |
| **Consumed** | Meeting Cards, At-Risk Deals, Executive Dashboard |
| **Updated** | Invalidation on Opportunity, Support, Email changes |
| **Invalidates** | Self + dependent dashboard widgets |
| **Triggers** | Risk Analysis Experience, Alert |
| **Visible To** | AE, Manager, VP, Admin |
| **Retention** | 2 years (derived artifact) |

---

## Email

| Field | Value |
|-------|-------|
| **Created** | Mail Service |
| **Canonical** | Zambyl evidence object + canonical entity via Mail Connector |
| **Materialized** | Search projection, Notification queue |
| **Consumed** | Notifications, Pre-meeting Brief, VoC |
| **Updated** | Mail webhook / poll (`email.received`) |
| **Invalidates** | Brief Materialization, Risk Materialization |
| **Triggers** | Pre-meeting Brief refresh, Notification |
| **Visible To** | AE (thread participant), Manager, Admin |
| **Retention** | 3 years |

---

## Calendar Event

| Field | Value |
|-------|-------|
| **Created** | Calendar Service |
| **Canonical** | Same pipeline as Meeting (may share entity type) |
| **Materialized** | Agenda Projection |
| **Consumed** | Weekly overview, Agenda view |
| **Updated** | Calendar delta / webhook |
| **Invalidates** | Agenda, Meeting Card live indicators |
| **Triggers** | Live indicator update via BFF SSE |
| **Visible To** | Attendee roles + managers |
| **Retention** | 3 years |

---

## Conversation

| Field | Value |
|-------|-------|
| **Created** | Slack Service or Mail Service |
| **Canonical** | Zambyl canonical entity + evidence |
| **Materialized** | VoC Projection, Search index |
| **Consumed** | Voice of Customer, Research Company |
| **Updated** | Slack/Mail event stream |
| **Invalidates** | VoC Materialization |
| **Triggers** | VoC Experience |
| **Visible To** | AE, Manager, VP |
| **Retention** | 2 years |

---

## Document

| Field | Value |
|-------|-------|
| **Created** | Document Service |
| **Canonical** | Zambyl evidence object + canonical entity |
| **Materialized** | Document search projection |
| **Consumed** | Risk view, QBR, Research Company |
| **Updated** | Document Service webhook (`document.uploaded`) |
| **Invalidates** | Risk Materialization, Contract-related rollups |
| **Triggers** | Risk Experience |
| **Visible To** | AE, Manager, Legal (future), Admin |
| **Retention** | 7 years |

---

## Approval

| Field | Value |
|-------|-------|
| **Created** | MeetingIQ via Zambyl Actions (`POST /v1/actions`) |
| **Canonical** | Zambyl actions table (status: awaiting_approval) |
| **Materialized** | Approvals Pending Materialization |
| **Consumed** | Command Center Approvals panel |
| **Updated** | Approval action via Actions runtime |
| **Invalidates** | Approvals Materialization |
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
| **Consumed** | Risk indicators, Support diagnostic views |
| **Updated** | Support ticket state changes |
| **Invalidates** | Risk Materialization |
| **Triggers** | Alert when SLA breached |
| **Visible To** | AE, Support Analyst, Manager, Admin |
| **Retention** | 3 years |

---

## Alert

| Field | Value |
|-------|-------|
| **Created** | MeetingIQ BFF (derived from canonical changes) |
| **Canonical** | Not canonical — derived notification record in MeetingIQ DB |
| **Materialized** | Notification queue |
| **Consumed** | Notifications, Urgency queue, Respond Now |
| **Updated** | Source entity changes via BFF push layer |
| **Invalidates** | Notification read state |
| **Triggers** | BFF SSE to UI |
| **Visible To** | Target user role |
| **Retention** | 90 days |

---

## Completion Checklist (Phase 0B)

- [ ] All entity types confirmed against domain model
- [ ] Relationships validated against ERD
- [ ] Every entity has all lifecycle fields populated
- [ ] Cross-references to REALTIME_CORRECTNESS_MATRIX verified
- [ ] Retention policies reviewed with operator
