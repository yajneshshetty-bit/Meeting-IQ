# Zambyl Readiness Audit

**Phase:** 0A  
**Date:** 2026-08-01  
**Auditor:** MeetingIQ Product Engineering  
**Platform baseline:** Zambyl v1.0.1 (`v1.0.1` tag, kernel frozen)  
**Platform path:** `/home/hp/Desktop/Zambyl`

---

## Executive Summary

**Verdict: READY — MeetingIQ Phase 1 can proceed without kernel modifications.**

Zambyl v1.0.1 bootstrap and full test suite pass locally. All five public API families are available. Extension points (Domain, Experience, Workflow, Trigger packages; Connectors; Profiles; Templates; Policies; Registries) are sufficient for Phase 1 PRD capabilities with documented workarounds for known platform limits.

**Kernel modified during audit:** No  
**Platform gaps logged:** No (see §8 — watch items have BFF/application workarounds)

---

## 1. Bootstrap Verification

| Check | Result | Evidence |
|-------|--------|----------|
| `npm install` | Pass | Dependencies installed |
| `npm run bootstrap` | Pass | Migrate + seed complete |
| `npm test` | **49/49 Pass** | 37 kernel + 12 platform |
| Postgres 16 | Running | `zambyl-core` docker-compose |
| Tag | `v1.0.1` | Platform frozen baseline |

```bash
cd /home/hp/Desktop/Zambyl
npm run bootstrap && npm test
# Result: 49/49 pass (2026-08-01)
```

---

## 2. Public API Coverage — PRD → API Family

Zambyl exposes exactly **five application-facing runtime families**. MeetingIQ BFF uses these exclusively.

| PRD Capability Area | Primary API Family | Secondary | Notes |
|---------------------|-------------------|-----------|-------|
| Command Center dashboards | Search + BFF aggregation | Execute (widget data) | BFF shapes read models |
| Executive View rollups | Search + BFF aggregation | Execute | Hierarchy in BFF |
| Pre-meeting brief | **Execute Experience** | Search (context) | Experience Package |
| Company research | **Execute Experience** | Search | Experience Package |
| Voice of customer | **Search** + Execute | — | Search profiles + synthesis experience |
| Risk analysis / score | **Execute Experience** | Materialization | MIQ-003 |
| Pipeline / at-risk deals | **Search** | Analytics profile | Search + materialization |
| AI forecast explanation | **Execute Experience** | — | Experience Package |
| QBR narrative | **Execute Experience** | Search | Experience Package |
| Meeting quality | **Execute Experience** | — | Experience Package |
| Follow-up drafting | **Execute Experience** + Conversations | — | Optional conversation turn |
| Actions due / approvals | **Actions** + Operations | — | `POST /v1/actions`, poll operations |
| Connector sync health | **Operations** (admin sync) | BFF status cache | Admin: `POST /v1/admin/connections/{id}/sync` |
| Live updates | **Operations SSE** | BFF SSE → UI | MIQ-002 — no general entity SSE |
| Notifications | BFF layer | Operations events | Application concern |
| Search / filters | **Search** | — | `POST /v1/search:query` |
| Role-aware visibility | BFF + Policy + entitlements | — | Enterprise auth in MeetingIQ BFF |
| Scheduled sync | Admin + Triggers | Workflow | Trigger/Workflow packages |
| Write-back to CRM | **Actions** | Connector adapter | Governed side effects |

**Conclusion:** Every Phase 1 PRD capability maps to at least one public API family or a documented BFF/application layer. **No feature-specific platform routes required.**

---

## 3. Experience Packages (planned)

| Package ID | Purpose | API | Phase |
|------------|---------|-----|-------|
| `meetingiq.pre-meeting-brief` | Pre-meeting intelligence brief | Execute | 7 |
| `meetingiq.company-research` | Account/company research | Execute | 7 |
| `meetingiq.voice-of-customer` | VoC synthesis | Execute | 7 |
| `meetingiq.executive-summary` | Executive dashboard narrative | Execute | 7 |
| `meetingiq.opportunity-summary` | Opportunity context summary | Execute | 7 |
| `meetingiq.risk-analysis` | Risk scoring and explanation | Execute | 7 |
| `meetingiq.next-actions` | Next-best action recommendations | Execute | 7 |
| `meetingiq.follow-up-draft` | Follow-up email/message drafting | Execute / Conversations | 7 |
| `meetingiq.qbr-narrative` | QBR preparation narrative | Execute | 7 |
| `meetingiq.forecast-explanation` | AI-adjusted forecast explanation | Execute | 7 |
| `meetingiq.meeting-quality` | Meeting quality assessment | Execute | 7 |

All packages: signed, channel-activated, invoked via `POST /v1/experiences:execute`.

---

## 4. Domain Package (planned)

| Package ID | Purpose | Phase |
|------------|---------|-------|
| `meetingiq.domain` | MeetingIQ entitlements, corpora, policy scope, application isolation on shared Zambyl deployment | 4 |

**Scope:**

- Corpora: `meetingiq-corpus-meetings`, `meetingiq-corpus-opportunities`, `meetingiq-corpus-communications`, `meetingiq-corpus-documents`
- Entitlements: `meetingiq.read`, `meetingiq.execute`, `meetingiq.admin`, role-scoped variants
- Policy scope: classification and access defaults for MeetingIQ ingestion

---

## 5. Registry Bindings (planned)

| Registry kind | Bindings | Phase |
|---------------|----------|-------|
| **Connector plugins** | CRM, Calendar, Mail, Slack, Document, Task, Support, ERP, Identity | 3 |
| **Projection consumers** | Search projection (existing `@zambyl/projections/consumers/search.js`) + MeetingIQ custom if needed | 3–4 |
| **Capability providers** | `knowledge.get@1`, `ai.generate@1` (existing) | 4 |
| **Policy bundles** | Role → entitlement maps per MIQ domain model | 4 |
| **Workflow engine** | Existing platform binding | 4 (optional) |
| **Model provider** | Real LLM provider binding for Phase 7 | 7 |

Register via `registries/*.json` and Zambyl admin/bootstrap — not kernel modification.

---

## 6. Connectors (planned — one per mock source)

| Connector ID | Mock Service | Sync modes | Phase |
|--------------|--------------|------------|-------|
| `meetingiq.crm` | CRM Service (:4001) | batch, incremental, webhook | 3 |
| `meetingiq.calendar` | Calendar Service (:4002) | batch, incremental, webhook | 3 |
| `meetingiq.mail` | Mail Service (:4003) | webhook, poll | 3 |
| `meetingiq.slack` | Slack Service (:4004) | webhook, poll | 3 |
| `meetingiq.documents` | Document Service (:4005) | batch, webhook | 3 |
| `meetingiq.tasks` | Task Service (:4006) | incremental, poll | 3 |
| `meetingiq.support` | Support Service (:4007) | incremental, webhook | 3 |
| `meetingiq.erp` | ERP Service (:4008) | batch, incremental | 3 |
| `meetingiq.identity` | Identity Service (:4009) | batch (org hierarchy) | 3 |

All connectors: Connector SDK plugins → `ingestSourceEnvelope()` → outbox → projections.

---

## 7. Policies (planned)

MeetingIQ enterprise authorization uses **Zambyl policy bundles + BFF enforcement**.

| Policy bundle | Maps | Phase |
|---------------|------|-------|
| `meetingiq.roles.sales-rep` | Own opportunities, meetings, actions | 4 |
| `meetingiq.roles.manager` | Team rollups, inherited scope | 4 |
| `meetingiq.roles.vp` | Org-wide visibility | 4 |
| `meetingiq.roles.admin` | Full access | 4 |
| `meetingiq.roles.support` | Diagnostic read-only | 4 |

BFF resolves user → role → entitlements → Zambyl headers on every request.

---

## 8. Profiles (planned)

### Search Profiles

| Profile ID | Used by | Phase |
|------------|---------|-------|
| `meetingiq.agenda-v1` | Weekly agenda, meeting cards | 4 |
| `meetingiq.pipeline-v1` | Pipeline, at-risk deals | 4 |
| `meetingiq.executive-pipeline-v1` | Executive dashboard | 4 |
| `meetingiq.voc-v1` | Voice of customer | 4 |
| `meetingiq.account-v1` | Research company | 4 |

### Data Profiles

| Profile ID | Entity types | Phase |
|------------|--------------|-------|
| `meetingiq.meeting-profile` | Meeting, calendar event | 4 |
| `meetingiq.opportunity-profile` | Opportunity, forecast | 4 |
| `meetingiq.account-profile` | Account, contact | 4 |
| `meetingiq.communication-profile` | Email, conversation | 4 |

### Analytics Profiles

| Profile ID | Purpose | Phase |
|------------|---------|-------|
| `meetingiq.risk-scoring-v1` | Deterministic + AI risk rules | 4 |
| `meetingiq.at-risk-v1` | At-risk deal detection | 4 |
| `meetingiq.forecast-adjustment-v1` | AI forecast adjustment inputs | 4 |

### Templates

| Template ID | Used by experience | Phase |
|-------------|-------------------|-------|
| `meetingiq-brief-template` | Pre-meeting brief | 4 |
| `meetingiq-research-template` | Company research | 4 |
| `meetingiq-voc-template` | Voice of customer | 4 |
| `meetingiq-risk-template` | Risk analysis | 4 |
| `meetingiq-forecast-template` | Forecast explanation | 4 |

---

## 9. Platform Watch Items (not gaps — workarounds defined)

Per gap log discipline: these are **not** logged as platform gaps because extension points or BFF solve them.

| Watch item | Workaround | MIQ / Phase |
|------------|------------|-------------|
| No general entity-change SSE | BFF polls materializations + Operations SSE; BFF SSE to UI | MIQ-002, Phase 8 |
| No knowledge graph engine | Canonical entities + search + materializations + lineage metadata | Master spec §5, Phase 0B |
| Header-based entitlements (not signed JWT) | MeetingIQ BFF session auth → entitlement resolution | Phase 1, 5 |
| Widget/layout configuration | MeetingIQ application DB — not kernel | Phase 5, 6 |
| Real-time notifications | MeetingIQ BFF derived alerts from canonical changes | Phase 8 |
| Single search projection consumer | Sufficient for Phase 1; custom materializations in BFF read models | Phase 5 |

**PLATFORM_GAP_LOG.md entries:** 0

---

## 10. Architectural Decisions Confirmed

| ID | Decision | Status |
|----|----------|--------|
| MIQ-001 | BFF rather than browser → Zambyl | Accepted |
| MIQ-002 | Live updates via BFF SSE | Accepted |
| MIQ-003 | Risk score as materialized projection | Accepted |

See [`MEETINGIQ_ARCHITECTURAL_DECISIONS.md`](./MEETINGIQ_ARCHITECTURAL_DECISIONS.md).

---

## 11. Phase 0A Exit Criteria

| Criterion | Status |
|-----------|--------|
| Zambyl bootstrap verified (49/49) | ✅ Pass |
| `ZAMBYL_READINESS_AUDIT.md` complete | ✅ This document |
| `ENVIRONMENT.md` created | ✅ |
| No kernel modifications | ✅ |
| MIQ-001, MIQ-002, MIQ-003 recorded | ✅ |
| No application code written | ✅ |
| No prototype code copied | ✅ |

---

## 12. Recommendation

**Proceed to Phase 0B — MeetingIQ Domain Modeling.**

Define entity model, ERD, and complete [`ENTITY_LIFECYCLE.md`](./ENTITY_LIFECYCLE.md) before any repository scaffolding.

---

*Phase 0A complete. Platform validated as sufficient for MeetingIQ Phase 1 implementation.*
