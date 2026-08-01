# MeetingIQ Phase 1 — Master Implementation Specification

**Status:** Authoritative implementation contract  
**Version:** 1.0.0-draft  
**Platform baseline:** [Zambyl v1.0.1](https://github.com/yajneshshetty-bit/Zambyl/releases/tag/v1.0.1) (kernel frozen, maintenance mode)  
**Application repository:** `git@github.com:yajneshshetty-bit/Meeting-IQ.git`  
**Platform repository:** `git@github.com:yajneshshetty-bit/Zambyl.git`

---

## 1. Purpose

MeetingIQ is the **first production application** built entirely on top of the frozen Zambyl Platform.

The primary objective is **platform validation**, not merely shipping a CRM-style application.

Every line of MeetingIQ code must answer:

> **Can a real enterprise application be built entirely on top of a frozen Zambyl Platform?**

Success requires:

1. **Platform validation** — major platform primitives exercised through extension points
2. **Production-quality Meeting Intelligence SaaS** — every Phase 1 PRD capability implemented with real behavior
3. **Zero kernel modifications** — gaps documented in [`PLATFORM_GAP_LOG.md`](./PLATFORM_GAP_LOG.md), not patched in Core

---

## 2. Fresh Start Policy

This repository is a **clean implementation**.

| Rule | Detail |
|------|--------|
| Do not reuse local prototypes | `MEETING-IQ(JULY 30)` and any prior mock/demo code is **out of scope** |
| Do not copy old architecture | Re-derive structure from this document and Zambyl platform guides |
| Prior artifacts | UI screenshots and provenance notes may inform **requirements only** |
| LLM | Real LLM API keys will be supplied via environment variables (never committed) |

---

## 3. Product Requirements (PRD)

Attached UI screenshots define **Phase 1 product requirements**.

They specify:

- **Capabilities** — what the user can do
- **Interactions** — what happens when the user acts
- **User journeys** — end-to-end flows
- **Information architecture** — what data appears where

They do **not** specify pixel-perfect layout. Implementation may improve visual design while preserving full capability coverage.

### 3.1 PRD Traceability Requirement

Maintain [`PLATFORM_USAGE_REPORT.md`](./PLATFORM_USAGE_REPORT.md) and a PRD traceability matrix (see Phase 9) mapping every screenshot capability → implementation → test.

**No placeholders. No stub interactions. No fake buttons. No lorem ipsum data.**

---

## 4. Phase 1 Capability Inventory

Every capability visible on the PRD screenshots must exist. Including but not limited to:

### 4.1 Command Center

- Weekly overview
- Pipeline summary
- At-risk deals
- Meetings (today / upcoming)
- Actions due
- Average meeting quality
- Agenda view
- Meeting cards with live indicators
- Research company
- Notifications
- Respond now / urgency queue
- Approvals pending
- Risk alerts
- Connector health indicators
- Filters and grouping
- Live updates (no manual refresh)
- Search
- Role-aware visibility

### 4.2 Executive View

- Executive dashboard
- Pipeline rollups
- AI-adjusted forecast
- Risk indicators
- Search
- Product filters
- Opportunity hierarchy
- Voice of customer
- QBR preparation and views
- Forecast bars
- Opportunity status (expansion, negotiation, closed won, closed lost)
- Cross-region and cross-team rollups

### 4.3 AI Experiences (all as Zambyl Experience Packages)

- Pre-meeting brief
- Account / company research
- Voice of customer synthesis
- Executive summary
- Opportunity summary
- Risk analysis
- Next-best actions
- Follow-up drafting
- QBR narrative
- Forecast explanation
- Meeting quality assessment

---

## 5. Platform Constraints (Non-Negotiable)

| Constraint | Requirement |
|------------|-------------|
| Kernel | **Do not modify** `zambyl-core/` |
| Extension first | Use Domain, Experience, Workflow, Trigger packages; Profiles; Templates; Policies; Connectors; Registries; SDK; CLI |
| BFF boundary | Browser → **MeetingIQ BFF** → Zambyl. Browser **never** calls Zambyl directly |
| Data access | MeetingIQ queries **only Zambyl** (canonical store, projections, materializations, search) |
| Source systems | Mock enterprise APIs exist **only** for connector ingestion |
| Gap handling | Document in [`PLATFORM_GAP_LOG.md`](./PLATFORM_GAP_LOG.md) — do not patch kernel |
| Real-time | Use incremental propagation — never full-platform rebuild on every change |
| Graph | No knowledge-graph engine in v1.0.1 — use canonical entities + search + materializations + lineage |

---

## 6. Architecture

```
┌─────────────────────────────────────────────────────────────┐
│  MeetingIQ UI (web application)                             │
└───────────────────────────┬─────────────────────────────────┘
                            │ HTTPS (session auth)
┌───────────────────────────▼─────────────────────────────────┐
│  MeetingIQ BFF (product backend)                            │
│  - Enterprise auth / RBAC / hierarchy                       │
│  - Widget configuration                                     │
│  - SSE/WebSocket to UI                                      │
│  - Calls Zambyl public APIs only                            │
└───────────────────────────┬─────────────────────────────────┘
                            │ x-api-key, x-workload-id, x-user-id, x-entitlements
┌───────────────────────────▼─────────────────────────────────┐
│  Zambyl Platform v1.0.1 (frozen kernel)                     │
│  Execute | Search | Conversations | Actions | Operations    │
└───────────────────────────▲─────────────────────────────────┘
                            │ connector plugins
┌───────────────────────────┴─────────────────────────────────┐
│  Independent Mock Enterprise Services                       │
│  CRM | Calendar | Mail | Slack | Documents | Tasks | ...    │
└─────────────────────────────────────────────────────────────┘
```

### 6.1 Ingestion Flow

```
Source System
    ↓  REST / Webhook / Poll / CDC / Event stream
Connector Plugin (Zambyl SDK)
    ↓  ingestSourceEnvelope()
Zambyl Canonical Store
    ↓  outbox
Projection Consumers (search, etc.)
    ↓
Materializations
    ↓
MeetingIQ BFF queries Zambyl
    ↓
MeetingIQ UI
```

MeetingIQ **never** reads mock source APIs directly.

---

## 7. User Model

Implement a complete enterprise user hierarchy.

**Example roles:** Sales Representative, Account Executive, Sales Engineer, Customer Success, Manager, Regional Manager, VP Sales, CRO, Administrator, Support Analyst, Partner, Service Account.

**Every user has:** Organization, Region, Business Unit, Manager, Hierarchy, Permissions, Teams, Products, Accounts, Territories, Applications.

### 7.1 Access Control

Authorization is **real**, not UI-only filtering.

| Role | Scope (examples) |
|------|-------------------|
| Sales Rep | Own opportunities, assigned meetings, assigned actions |
| Manager | Own data + direct reports + inherited meetings/opportunities |
| VP | Entire organization, rollups, cross-region visibility |
| Administrator | Full access |
| Support | Diagnostic views only |

Driven by: Policies, Roles, Scopes, Hierarchy — enforced in **MeetingIQ BFF** using Zambyl policy bundles and entitlements.

---

## 8. Application Configuration

Everything configurable without code changes (MeetingIQ application layer):

- Widgets, navigation, dashboards, metrics, cards
- Forecasts, views, columns, filters, actions, layouts
- Products, regions, teams

Store configuration in MeetingIQ's own persistence layer. Do not require kernel changes.

---

## 9. Mock Enterprise Systems

Build **independent enterprise services** — not a monolithic "Mock CRM."

| Service | Responsibility |
|---------|----------------|
| CRM Service | Accounts, opportunities, contacts, pipeline |
| Calendar Service | Meetings, attendees, schedules |
| Mail Service | Email threads, attachments metadata |
| Slack Service | Channels, messages, escalations |
| Document Service | Contracts, proposals, files |
| Task Service | Actions, tasks, assignments |
| Support Service | Tickets, cases, escalations |
| ERP Service | Billing, renewals, orders |
| Identity Service | Users, org hierarchy, territories |
| Product Telemetry Service | Usage signals (optional Phase 2+) |

### 9.1 Each Service Must Have

- Its own database
- Its own REST API
- Its own event stream / webhook mechanism
- Independent clock and latency simulation
- Realistic failure behavior (rate limits, retries, timeouts)
- Pagination, filtering, delta tokens, versioning
- CDC or change-notification simulation

### 9.2 Simulated Enterprise Data

Generate interconnected, realistic data — not lorem ipsum:

Organizations, departments, employees, managers, customers, accounts, products, contracts, renewals, support cases, emails, meetings, documents, notes, forecasts, actions, tasks, opportunities, activity timelines, relationship graphs.

Data must **evolve continuously** via scheduled and correlated events.

---

## 10. Real-Time Correctness

See [`REALTIME_CORRECTNESS_MATRIX.md`](./REALTIME_CORRECTNESS_MATRIX.md).

### 10.1 Principles

- Detect event → ingest → store canonically → emit outbox
- Rebuild **only affected** projections
- Refresh **only affected** materializations
- Push update through MeetingIQ BFF
- Update **only affected** UI widgets
- **Never rebuild the world**
- **Never require manual refresh**

### 10.2 Pre-Meeting Scenario (acceptance example)

Meeting begins in 5 minutes. Then:

1. Customer email arrives (Mail Service)
2. CRM opportunity probability changes (CRM Service)
3. Support ticket escalates (Support Service)

MeetingIQ must: detect → ingest → recompute affected projections → refresh briefing → update meeting card → update risk → notify user — **without full platform rebuild**.

### 10.3 Delivery Mechanism

Zambyl v1.0.1 provides SSE for **operations** and **conversations** — not a general entity-change WebSocket.

MeetingIQ BFF implements:

- Polling / SSE subscription to relevant Zambyl operations
- App-layer SSE or WebSocket to UI
- Freshness metadata on every widget (last synchronized, pending updates, confidence)

---

## 11. Materialization Strategy

| Layer | Role |
|-------|------|
| Canonical truth | Source of record in Zambyl |
| Derived projections | Search index, aggregates |
| Incremental materialization | Dashboard widgets, rollups |
| Freshness timestamps | Visible to users on every surface |
| Lineage | Traceability from UI → materialization → canonical → source |

Support: partial rebuilds, lazy rebuilds, background rebuilds, live overlay where appropriate.

---

## 12. AI / LLM Configuration

Real LLM API keys will be provided by the operator.

| Rule | Detail |
|------|--------|
| Storage | Keys in `.env` / secrets manager — **never committed** |
| Integration | Via Zambyl Experience Packages and `@zambyl/ai` capability provider |
| Templates | MeetingIQ-owned templates in application packages |
| No direct UI → LLM | All AI through `POST /v1/experiences:execute` |

Document required env vars in `docs/ENVIRONMENT.md` (created in Phase 1).

---

## 13. Observability

Everything measurable:

- Connector latency, sync latency, projection latency
- Freshness, errors, retries, queue depth
- CDC lag, AI latency, experience execution time
- BFF request latency, authorization denials

---

## 14. Testing Requirements

Production-quality test coverage:

- Unit tests
- Integration tests (BFF ↔ Zambyl)
- Scenario tests (pre-meeting flow, executive rollup)
- End-to-end tests (UI → BFF → Zambyl → UI)
- Role authorization tests
- Data synchronization tests
- Projection rebuild tests
- Load simulations (design target: thousands of users, millions of entities)

---

## 15. Required Deliverables

| Deliverable | Phase |
|-------------|-------|
| MeetingIQ repo structure (UI + BFF + packages + connectors) | 1 |
| Independent mock enterprise services | 2 |
| Zambyl connector plugins for each source | 3 |
| Domain / Experience / Policy packages | 4–7 |
| [`PLATFORM_USAGE_REPORT.md`](./PLATFORM_USAGE_REPORT.md) | Ongoing → 9 |
| [`PLATFORM_GAP_LOG.md`](./PLATFORM_GAP_LOG.md) | Ongoing → 9 |
| [`REALTIME_CORRECTNESS_MATRIX.md`](./REALTIME_CORRECTNESS_MATRIX.md) | 8 |
| PRD traceability matrix | 9 |
| `PLATFORM_VALIDATION_REPORT.md` | 9 |
| Deployment and runbook documentation | 10 |

---

## 16. Phased Implementation Roadmap

Execute **one phase at a time**. Do not skip ahead. Validate exit criteria before proceeding.

Each phase has a dedicated execution prompt in [`phases/`](./phases/).

---

### Phase 0 — Repository Audit & Platform Readiness

**Goal:** Confirm Zambyl v1.0.1 is operational; establish MeetingIQ repo conventions.

**Tasks:**

- Clone and bootstrap Zambyl (`npm install`, `npm run bootstrap`, `npm test`)
- Verify 49/49 tests pass against local Postgres 16
- Read Zambyl docs: Developer Guide, Connector Guide, Package Author Guide, Kernel Freeze
- Initialize MeetingIQ repo structure (empty application skeleton — no feature code yet)
- Document local dev topology in `docs/ENVIRONMENT.md`

**Exit criteria:**

- [ ] Zambyl bootstrap reproducible
- [ ] MeetingIQ repo structure defined
- [ ] No code copied from local prototypes

**Prompt:** [`phases/PHASE_00_REPOSITORY_AUDIT.md`](./phases/PHASE_00_REPOSITORY_AUDIT.md)

---

### Phase 1 — Foundation

**Goal:** Project scaffold, BFF skeleton, auth model design, Zambyl connectivity.

**Tasks:**

- `zambyl init` or equivalent project scaffold
- MeetingIQ BFF with health check and Zambyl connectivity test
- Enterprise user/role/hierarchy schema (MeetingIQ DB)
- Policy and entitlement model design
- CI skeleton for MeetingIQ repo

**Exit criteria:**

- [ ] BFF starts and authenticates to Zambyl
- [ ] User model schema migrated
- [ ] Auth middleware skeleton enforces role context

**Prompt:** [`phases/PHASE_01_FOUNDATION.md`](./phases/PHASE_01_FOUNDATION.md)

---

### Phase 2 — Mock Enterprise Systems

**Goal:** Independent mock services with production-like APIs.

**Tasks:**

- Implement CRM, Calendar, Mail, Slack, Document, Task, Support, ERP, Identity services
- Each: own DB, REST API, webhooks/events, pagination, delta tokens, auth, rate limits
- Seed realistic interconnected enterprise data
- Event simulator for continuous data evolution

**Exit criteria:**

- [ ] Each service runs independently
- [ ] APIs documented (OpenAPI or equivalent)
- [ ] Event simulator produces correlated changes
- [ ] No Zambyl or MeetingIQ dependencies in mock services

**Prompt:** [`phases/PHASE_02_MOCK_ENTERPRISE.md`](./phases/PHASE_02_MOCK_ENTERPRISE.md)

---

### Phase 3 — Connectors

**Goal:** Zambyl connector plugins ingest all mock sources.

**Tasks:**

- Connector plugin per source (Connector SDK)
- Register connectors via registry bindings
- Configure connections and sync jobs
- Verify canonical entities, outbox, projections, search index populated
- Document sync schedules and webhook handlers

**Exit criteria:**

- [ ] All sources ingested through Zambyl connectors only
- [ ] `search_documents` and canonical entities populated after sync
- [ ] Incremental/delta sync works
- [ ] Entries added to PLATFORM_USAGE_REPORT

**Prompt:** [`phases/PHASE_03_CONNECTORS.md`](./phases/PHASE_03_CONNECTORS.md)

---

### Phase 4 — MeetingIQ Domain Packages

**Goal:** Domain packages, profiles, templates, policies for MeetingIQ semantics.

**Tasks:**

- Domain package: MeetingIQ entitlements, corpora, policy scope
- Data profiles for meetings, opportunities, accounts, activities
- Search profiles for Command Center and Executive View queries
- Policy bundles for role-based access
- Templates for AI experiences
- Register and activate via Zambyl admin/bootstrap

**Exit criteria:**

- [ ] Domain package activated on stable channel
- [ ] Profiles and policies registered
- [ ] Entitlements map to user roles

**Prompt:** [`phases/PHASE_04_DOMAIN_PACKAGES.md`](./phases/PHASE_04_DOMAIN_PACKAGES.md)

---

### Phase 5 — MeetingIQ Backend (BFF)

**Goal:** Product API layer querying Zambyl with enterprise authorization.

**Tasks:**

- BFF routes for Command Center and Executive View data
- Hierarchy-aware authorization enforcement
- Query Zambyl Search, Execute, Operations APIs
- Materialization read models for dashboard widgets
- Freshness metadata on all responses
- Widget configuration API

**Exit criteria:**

- [ ] BFF returns real data from Zambyl (not mock sources)
- [ ] Role-based access enforced server-side
- [ ] Every BFF endpoint logged in PLATFORM_USAGE_REPORT

**Prompt:** [`phases/PHASE_05_BFF.md`](./phases/PHASE_05_BFF.md)

---

### Phase 6 — MeetingIQ UI

**Goal:** Production web UI implementing all PRD capabilities.

**Tasks:**

- Command Center (all capabilities from §4.1)
- Executive View (all capabilities from §4.2)
- Role-aware rendering
- Configuration UI for widgets/layouts
- Search, filters, grouping, live update indicators
- Freshness display on all data surfaces

**Exit criteria:**

- [ ] Every PRD screenshot capability has a working UI path
- [ ] No placeholder buttons or stub data
- [ ] UI calls BFF only (never Zambyl)

**Prompt:** [`phases/PHASE_06_UI.md`](./phases/PHASE_06_UI.md)

---

### Phase 7 — AI Experiences

**Goal:** All AI features as Zambyl Experience Packages with real LLM.

**Tasks:**

- Experience packages for each AI capability (§4.3)
- Wire real LLM via environment-configured model provider
- BFF invokes `POST /v1/experiences:execute`
- Pre-meeting brief, research, VoC, risk, forecast explanation, etc.

**Exit criteria:**

- [ ] All AI features execute through Zambyl experiences
- [ ] Real LLM responses (not hardcoded)
- [ ] Citations and lineage where applicable

**Prompt:** [`phases/PHASE_07_AI_EXPERIENCES.md`](./phases/PHASE_07_AI_EXPERIENCES.md)

---

### Phase 8 — Real-Time Runtime

**Goal:** Incremental propagation from source change to UI update.

**Tasks:**

- Complete REALTIME_CORRECTNESS_MATRIX
- Event simulator → connector → projection → materialization → BFF → UI pipeline
- BFF push layer (SSE/WebSocket to UI)
- Materialization invalidation on source change
- Pre-meeting scenario acceptance test

**Exit criteria:**

- [ ] Matrix rows all verified
- [ ] Pre-meeting scenario passes end-to-end
- [ ] No full rebuild on single entity change
- [ ] Latency targets documented

**Prompt:** [`phases/PHASE_08_REALTIME.md`](./phases/PHASE_08_REALTIME.md)

---

### Phase 9 — Validation

**Goal:** Prove platform validation objective met.

**Tasks:**

- Complete PLATFORM_USAGE_REPORT (every feature mapped)
- Complete PLATFORM_GAP_LOG (every gap with required fields)
- PRD traceability matrix (screenshot → implementation → test)
- PLATFORM_VALIDATION_REPORT.md
- Full test suite green
- Load simulation baseline

**Exit criteria:**

- [ ] 100% PRD capability coverage verified
- [ ] 100% features mapped to platform primitives
- [ ] All tests pass
- [ ] Gap log complete (may be empty — that is success)

**Prompt:** [`phases/PHASE_09_VALIDATION.md`](./phases/PHASE_09_VALIDATION.md)

---

### Phase 10 — Production Readiness

**Goal:** Runnable, deployable, documented production application.

**Tasks:**

- Deployment manifests / docker-compose for full stack
- Runbooks (bootstrap, seed, sync, failure recovery)
- Observability dashboards or export
- Security review (secrets, auth, BFF boundary)
- README with quick start

**Exit criteria:**

- [ ] Fresh clone → deploy → usable MeetingIQ
- [ ] Documentation complete
- [ ] Ready for operator review

**Prompt:** [`phases/PHASE_10_PRODUCTION_READINESS.md`](./phases/PHASE_10_PRODUCTION_READINESS.md)

---

## 17. Success Criteria (Final)

MeetingIQ Phase 1 is complete when:

1. Every PRD screenshot capability is implemented with real behavior
2. Every feature is traced in PLATFORM_USAGE_REPORT to a Zambyl primitive
3. No kernel modifications were required (or all gaps are in PLATFORM_GAP_LOG)
4. Mock enterprise systems expose independent production-like APIs
5. Zambyl ingests all sources; MeetingIQ queries only Zambyl
6. Real-time updates propagate incrementally to the UI
7. AI experiences run through Zambyl with a real LLM
8. Full test suite passes
9. Application is runnable from a fresh clone

---

## 18. References

| Resource | Location |
|----------|----------|
| Zambyl Platform | `git@github.com:yajneshshetty-bit/Zambyl.git` |
| Zambyl v1.0.1 release | `RELEASE_1.0.1_SUMMARY.md` in Zambyl repo |
| Developer Guide | `platform/docs/DEVELOPER_GUIDE.md` |
| Connector Guide | `platform/docs/CONNECTOR_GUIDE.md` |
| Kernel Freeze | `platform/docs/KERNEL_FREEZE.md` |
| Maintenance Mode | `engineering/decisions/PLATFORM_MAINTENANCE_MODE.md` |
| CI Fix Report | `engineering/validation/CI_PIPELINE_FIX_REPORT.md` |

---

*This document is the single authoritative specification for MeetingIQ Phase 1. Phase execution prompts in `docs/phases/` reference this document and must not contradict it.*
