# MeetingIQ Architectural Decisions

> Application-level ADRs for MeetingIQ. Record design decisions here — do not bury reasoning in commits.

**Format:** MIQ-NNN  
**Status values:** Proposed | Accepted | Superseded | Deprecated

When a decision changes, add a new MIQ entry and mark the old one Superseded with a link.

---

## MIQ-001 — MeetingIQ uses a BFF rather than browser → Zambyl

| Field | Value |
|-------|-------|
| **Status** | Accepted |
| **Date** | 2026-08-01 |
| **Phase** | 0A |

**Context:** MeetingIQ UI needs platform data. Zambyl exposes five public API families with workload credentials.

**Decision:** All browser traffic goes to **MeetingIQ BFF**. BFF holds platform credentials and calls Zambyl.

**Reason:**

- Protect platform credentials (never expose API keys to browser)
- Allow UI-specific aggregation and shaping
- Hide platform API evolution from the frontend
- Enforce enterprise authorization before Zambyl calls

**Consequences:**

- BFF is mandatory infrastructure
- UI never imports Zambyl SDK directly
- Session auth lives in MeetingIQ, not Zambyl

**Platform capability validated:** BFF boundary (architecture invariant #3)

---

## MIQ-002 — Live updates use MeetingIQ BFF SSE rather than direct platform push

| Field | Value |
|-------|-------|
| **Status** | Accepted |
| **Date** | 2026-08-01 |
| **Phase** | 0A |

**Context:** MeetingIQ requires live UI updates when source data changes. Zambyl v1.0.1 exposes SSE for operations and conversations — not a general entity-change stream.

**Decision:** MeetingIQ BFF implements SSE or WebSocket to UI. BFF subscribes to relevant Zambyl operation streams and polls/refreshes affected materializations.

**Reason:**

- Platform exposes operation SSE, not arbitrary entity subscriptions
- MeetingIQ owns UI subscription semantics
- Incremental materialization refresh stays in BFF read-model layer

**Consequences:**

- Real-time correctness matrix tracks BFF → UI as final stage
- Platform gap log if general entity SSE is needed (v1.1 candidate)

**Platform capability validated:** Operations SSE + materialization read models

---

## MIQ-003 — Risk score is a materialized projection

| Field | Value |
|-------|-------|
| **Status** | Accepted |
| **Date** | 2026-08-01 |
| **Phase** | 0A |

**Context:** Risk scores appear on meeting cards, dashboards, and executive views. Recomputing on every request is expensive.

**Decision:** Risk score is a **materialized projection** in Zambyl, invalidated incrementally when underlying canonical entities change.

**Reason:**

- Avoid expensive recomputation per UI request
- Support incremental updates via outbox → projection pipeline
- Freshness metadata visible to users

**Consequences:**

- Risk Experience Package triggers on invalidation, not on every page load
- ENTITY_LIFECYCLE.md documents invalidation paths

**Platform capability validated:** Materializations + Experience Package + outbox invalidation

---

## MIQ-004 — Meeting subsumes calendar_event as single canonical type

| Field | Value |
|-------|-------|
| **Status** | Accepted |
| **Date** | 2026-08-01 |
| **Phase** | 0B |

**Context:** Calendar Service emits both customer meetings and internal events (e.g. "Internal – Forecast call").

**Decision:** All calendar items ingest as `entity_type: meeting` with a `subtype` field (`customer`, `internal`, `demo`).

**Reason:** Single search profile and agenda materialization; BFF filters by subtype for PRD legend dots.

**Consequences:** Calendar connector maps all events to meeting canonical form.

**Platform capability validated:** Canonical entity model + search projection

---

## MIQ-005 — Lead and Opportunity are distinct entity types

| Field | Value |
|-------|-------|
| **Status** | Accepted |
| **Date** | 2026-08-01 |
| **Phase** | 0B |

**Context:** Executive View PRD has Opportunities / Leads toggle.

**Decision:** `lead` and `opportunity` are separate canonical entity types from CRM connector.

**Reason:** Different lifecycle (conversion), different search profile view mode, avoids overloading opportunity stage enum.

**Consequences:** CRM mock service exposes separate `/leads` and `/opportunities` APIs.

**Platform capability validated:** Connector ingestion + search profiles

---

## MIQ-006 — Notifications are BFF-derived, not canonical

| Field | Value |
|-------|-------|
| **Status** | Accepted |
| **Date** | 2026-08-01 |
| **Phase** | 0B |

**Context:** Respond Now panel shows 103 notifications with urgency/type filters.

**Decision:** Notifications and alerts are **MeetingIQ BFF artifacts** — not ingested into Zambyl canonical store.

**Reason:** Notification semantics are application-specific; Zambyl owns source truth, BFF derives user-facing alerts from canonical changes.

**Consequences:** Notification queue in MeetingIQ DB; BFF SSE pushes to UI; lineage links to source canonical entities.

**Platform capability validated:** BFF aggregation layer (not a platform gap)

---

## MIQ-007 — Product as first-class entity for executive filtering

| Field | Value |
|-------|-------|
| **Status** | Accepted |
| **Date** | 2026-08-01 |
| **Phase** | 0B |

**Context:** Executive pipeline has "All products" dropdown; deals show product names (MDR, InsightCloudSec, etc.).

**Decision:** `product` is a canonical entity type synced from CRM, linked to opportunities and leads.

**Reason:** Product-scoped pipeline queries without string matching on opportunity names.

**Consequences:** CRM connector syncs products; search profile accepts product filter parameter.

**Platform capability validated:** Canonical entities + search profile parameters

---

## MIQ-008 — Dev auth via x-meetingiq-user-id header

| Field | Value |
|-------|-------|
| **Status** | Accepted |
| **Date** | 2026-08-01 |
| **Phase** | 1 |

**Context:** Phase 1 BFF needs auth middleware without UI login flow.

**Decision:** Development and test auth uses `x-meetingiq-user-id` header resolving to MeetingIQ DB users. Production session auth replaces this in a later phase.

**Reason:** Unblocks BFF and Zambyl integration testing before UI exists.

**Consequences:** Documented in ENVIRONMENT.md; tests use header explicitly.

**Platform capability validated:** BFF boundary (MIQ-001)

---

## Template (copy for new decisions)

```markdown
## MIQ-NNN — [Title]

| Field | Value |
|-------|-------|
| **Status** | Proposed |
| **Date** | YYYY-MM-DD |
| **Phase** | |

**Context:**

**Decision:**

**Reason:**

**Consequences:**

**Platform capability validated:**
```

---

## Index

| ID | Title | Status |
|----|-------|--------|
| MIQ-001 | BFF rather than browser → Zambyl | Accepted |
| MIQ-002 | Live updates via BFF SSE | Accepted |
| MIQ-003 | Risk score as materialized projection | Accepted |
| MIQ-004 | Meeting subsumes calendar_event | Accepted |
| MIQ-005 | Lead and Opportunity distinct types | Accepted |
| MIQ-006 | Notifications BFF-derived | Accepted |
| MIQ-007 | Product as first-class entity | Accepted |
| MIQ-008 | Dev auth via x-meetingiq-user-id | Accepted |
