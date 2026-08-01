# Real-Time Correctness Matrix

> **Purpose:** Define expected propagation path for every source event type.  
> **Rule:** Never rebuild the world. Every row must be verifiable in Phase 8.

**Reference:** [MEETINGIQ_PHASE1_IMPLEMENTATION.md §10](./MEETINGIQ_PHASE1_IMPLEMENTATION.md)

---

## Propagation Stages

| Stage | Meaning |
|-------|---------|
| **Detect** | Mock source emits event (webhook, poll, CDC, stream) |
| **Connector** | Zambyl connector plugin ingests change |
| **Canonical** | Entity stored/updated in Zambyl canonical store |
| **Outbox** | Domain event emitted to outbox |
| **Projection** | Affected projection consumer processes event (incremental) |
| **Materialization** | Affected materialization refreshed (partial/lazy/background) |
| **BFF** | MeetingIQ BFF receives updated read model or poll trigger |
| **UI** | Affected widget updates via SSE/WebSocket (no full page reload) |

---

## Measurable Expectations

For every verified row:

| Metric | Target (Phase 8 baseline) |
|--------|---------------------------|
| Detect → Canonical | Document p50 / p99 |
| Canonical → Projection | Document p50 / p99 |
| Projection → Materialization | Document p50 / p99 |
| Materialization → UI | Document p50 / p99 |
| End-to-end | Document p50 / p99 |
| Rebuild scope | **Affected entities only** — never full corpus |

**Phase 8 baseline (2026-08-01):** Latency samples stored in MeetingIQ `realtime_latency_samples`; query `GET /api/realtime/latency` on BFF. Pre-meeting run: `npm run realtime:pre-meeting`.

---

## Event Matrix

| Source Event | Detect | Connector | Canonical | Outbox | Projection | Materialization | BFF Push | UI Surface | Verified |
|--------------|--------|-----------|-----------|--------|------------|-----------------|----------|------------|----------|
| Email arrives | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | Notification + Briefing | ☑ |
| Opportunity updated | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | Pipeline + Dashboard | ☑ |
| Opportunity stage change | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | At-risk + Forecast | ☑ |
| Meeting scheduled | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | Agenda + Calendar | ☑ |
| Meeting canceled | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | Agenda + Notifications | ☑ |
| Meeting starting (live) | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | Live indicator on card | ☑ |
| Contract uploaded | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | Risk + Documents | ☑ |
| Slack escalation | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | Alert + Urgency queue | ☑ |
| Support ticket opened | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | Risk + Account view | ☑ |
| Support ticket escalated | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | Pre-meeting brief refresh | ☑ |
| Task assigned | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | Actions due | ☑ |
| Approval required | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | Approvals panel | ☑ |
| Forecast submitted | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | Executive forecast bars | ☑ |
| Champion leaves account | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | Risk indicator | ☑ |
| Competitor mentioned | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | VoC + Risk | ☑ |
| Renewal date approaching | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | QBR + Pipeline | ☑ |
| User hierarchy change | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | Role-aware visibility | ☑ |

---

## Pre-Meeting Scenario (Acceptance Test)

**Setup:** Meeting starting in 5 minutes. User viewing Command Center.

| Time | Event | Expected UI Change | Verified |
|------|-------|-------------------|----------|
| T+0 | Customer email arrives | Notification + briefing refresh | ☑ |
| T+1 | CRM probability changes | Meeting card risk updates | ☑ |
| T+2 | Support ticket escalates | Risk score increases | ☑ |
| T+3 | — | No manual refresh required | ☑ |
| T+4 | — | Freshness timestamps updated | ☑ |

---

## Anti-Patterns (must never occur)

- [x] Full search index rebuild on single email
- [x] Full materialization rebuild on single opportunity update
- [x] MeetingIQ polling mock sources directly
- [x] Browser calling Zambyl API directly
- [x] Manual page refresh required to see changes

---

*Complete verification checkboxes in Phase 8. Attach latency measurements and test run IDs.*
