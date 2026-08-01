# Phase 0B — MeetingIQ Domain Modeling

**Execute this phase only.** No application code.

**Prerequisite:** [Phase 0A complete](./PHASE_00A_ZAMBYL_READINESS_AUDIT.md)

## Authority

Read and follow: [`../MEETINGIQ_PHASE1_IMPLEMENTATION.md`](../MEETINGIQ_PHASE1_IMPLEMENTATION.md) § Phase 0B

## Context

Before repository scaffolding, define the MeetingIQ domain model and entity relationships. This prevents entity drift during implementation.

## Tasks

1. Define core entities and attributes:

   | Entity | Define |
   |--------|--------|
   | Opportunity | Stages, amounts, owners, account link, risk fields |
   | Account | Hierarchy, territory, tier, health |
   | Meeting | Attendees, agenda, account/opportunity links, live state |
   | Contact | Role, account, communication history |
   | Action | Types, assignee, due date, approval state |
   | Forecast | Period, amount, AI adjustment, submitter |
   | Risk | Score, factors, lineage to sources |
   | Email | Thread, participants, classification |
   | Calendar Event | Schedule, recurrence, attendees |
   | Conversation | Slack/email threads, sentiment inputs |
   | Document | Type, account/agreement link, classification |
   | Approval | Workflow state, approver, action link |
   | SLA | Thresholds, breach conditions |
   | Alert | Severity, target user, source entity |

2. Define relationships (ERD):
   - Account → Opportunities → Meetings → Actions
   - Support Cases → Risk → Alerts
   - Email/Slack → Conversations → VoC
   - Documents → Contracts → Risk

3. Map entities to Zambyl:
   - Canonical entity types
   - Search profiles per entity
   - Materializations per entity
   - Which connector owns creation

4. Complete [`../ENTITY_LIFECYCLE.md`](../ENTITY_LIFECYCLE.md) — all fields for every entity

5. Produce **`docs/DOMAIN_MODEL.md`** containing:
   - Entity definitions
   - Relationship diagram (mermaid or equivalent)
   - Entity → Zambyl canonical type mapping
   - Entity → mock source system mapping

6. Define MeetingIQ repo directory structure (document only):
   ```
   meeting-iq/
   ├── apps/ui/
   ├── apps/bff/
   ├── packages/
   ├── connectors/
   ├── registries/
   ├── mock-services/
   └── docs/
   ```

7. Record new architectural decisions in [`../MEETINGIQ_ARCHITECTURAL_DECISIONS.md`](../MEETINGIQ_ARCHITECTURAL_DECISIONS.md)

## Exit Criteria

- [ ] `DOMAIN_MODEL.md` complete with ERD
- [ ] `ENTITY_LIFECYCLE.md` all checklist items checked
- [ ] Every entity mapped to source system and Zambyl canonical type
- [ ] Repo structure documented
- [ ] No application code written

## Deliverables

- `docs/DOMAIN_MODEL.md`
- Completed `docs/ENTITY_LIFECYCLE.md`

## Do Not

- Scaffold BFF, UI, or mock services
- Modify Zambyl kernel

## Next Phase

→ [PHASE_01_FOUNDATION.md](./PHASE_01_FOUNDATION.md)
