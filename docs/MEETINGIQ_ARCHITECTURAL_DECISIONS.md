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
