# Platform Usage Report

> **Purpose:** Prove that MeetingIQ validates the Zambyl Platform.  
> **Mandatory question for every feature:** **Which platform capability validated this?**

**Platform baseline:** Zambyl v1.0.1 (kernel frozen)  
**Validation date:** 2026-08-01 (Phase 9)  
**Kernel modified:** **No** for every row

---

## Platform Validation Map

| MeetingIQ Feature | Zambyl Capability Validated | Kernel Modified? |
| ----------------- | --------------------------- | ---------------- |
| Weekly Agenda | Connector + Search Profile | No |
| Research Company | Experience Package | No |
| Executive Pipeline | Search Profile + Materialization | No |
| Voice of Customer | Search + Experience Package | No |
| Risk Score | Analytics Profile + Materialization | No |
| Notifications | Canonical + BFF aggregation | No |
| Live Updates | Outbox + BFF SSE (MIQ-002) | No |
| Pre-meeting Brief | Experience Package | No |
| Approvals queue | Canonical tasks + BFF notifications | No |
| CRM / source sync | Connector Plugin | No |
| At-risk Deals | Analytics Profile + Search | No |
| AI Forecast | Experience Package + Template | No |
| Widget configuration | BFF persistence (application layer) | No |
| Role-aware scoping | Policy Bundle + BFF enforcement | No |

---

## Feature Traceability

| Feature | Platform Capability Validated | Package / API | Kernel Modified? | Implementation | Test |
|---------|------------------------------|---------------|------------------|----------------|------|
| BFF health + identity | Application foundation | — | No | `apps/bff` | foundation.test.js |
| Command Center overview | Search + canonical aggregation | `POST /v1/search:query` | No | `GET /api/command-center/overview` | command-center.test.js |
| Weekly agenda | Search profile + canonical | `meetingiq.agenda-v1` | No | `GET /api/command-center/agenda` | command-center.test.js |
| At-risk deals | Analytics profile + BFF scope | `meetingiq.at-risk-v1` | No | `GET /api/command-center/at-risk` | command-center.test.js |
| Actions due | Canonical tasks + BFF scope | canonical_entities | No | `GET /api/command-center/actions-due` | command-center.test.js |
| Executive pipeline | Search + BFF rollups | `meetingiq.executive-pipeline-v1` | No | `GET /api/executive/pipeline` | executive.test.js |
| AI forecast rollup | Canonical forecast + BFF | `ai_forecast` materialization | No | `GET /api/executive/forecast` | executive.test.js |
| Rising risk | Canonical + BFF scope | `rising_risk` materialization | No | `GET /api/executive/rising-risk` | executive.test.js |
| Support diagnostics | Canonical support cases | canonical_entities | No | `GET /api/support/diagnostics` | executive.test.js |
| Widget configuration | BFF persistence | `widget_configs` table | No | `/api/widgets/config` | widgets.test.js |
| MeetingIQ Web UI | BFF-only SPA | React + Vite | No | `apps/web/` | api.test.js |
| Command Center UI | BFF read models | `/api/command-center/*` | No | `CommandCenter.jsx` | command-center.test.js |
| Executive View UI | BFF rollups | `/api/executive/*` | No | `ExecutiveView.jsx` | executive.test.js |
| Global search UI | BFF search proxy | `/api/search` | No | `SearchModal.jsx` | search-notifications.test.js |
| Notification queue UI | BFF notifications | `/api/notifications` | No | `NotificationPanel.jsx` | search-notifications.test.js |
| Role-based scoping | Policy + entitlements | BFF `services/scope.js` | No | auth middleware | scope.test.js |
| Freshness indicators | BFF read model metadata | `withFreshness()` | No | all BFF routes | command-center.test.js |
| Zambyl connectivity probe | Public catalog API | `GET /v1/catalog` | No | `GET /api/platform/zambyl` | foundation.test.js |
| User hierarchy + entitlements | BFF auth + policy mapping | — | No | `GET /api/me` | foundation.test.js |
| Live updates (SSE) | Outbox poll + BFF SSE | outbox + MIQ-002 | No | `/api/events/stream` | realtime.test.js |
| Real-time pipeline | Admin sync + outbox | `POST /v1/admin/connections/{id}/sync` | No | `/api/realtime/pipeline` | realtime-integration.test.js |
| Pre-meeting scenario | Connector incremental sync | event-simulator + sync | No | `scripts/pre-meeting-scenario.js` | realtime-integration.test.js |
| Latency metrics | BFF telemetry | `realtime_latency_samples` | No | `GET /api/realtime/latency` | realtime.test.js |
| AI company research | Experience Package + OpenAI | `POST /v1/experiences:execute` | No | `POST /api/ai/company-research` | ai.test.js |
| AI voice of customer | Experience Package | `meetingiq.voice-of-customer` | No | `POST /api/ai/voice-of-customer` | ai.test.js |
| AI QBR narrative | Experience Package | `meetingiq.qbr-narrative` | No | `POST /api/ai/qbr-narrative` | ai.test.js |
| AI forecast explanation | Experience Package | `meetingiq.forecast-explanation` | No | `POST /api/ai/forecast-explanation` | ai.test.js |
| AI pre-meeting brief | Experience Package | `meetingiq.pre-meeting-brief` | No | `POST /api/ai/pre-meeting-brief` | ai.test.js |
| AI executive summary | Experience Package | `meetingiq.executive-summary` | No | `POST /api/ai/executive-summary` | ai.test.js |
| AI opportunity summary | Experience Package | `meetingiq.opportunity-summary` | No | `POST /api/ai/opportunity-summary` | ai.test.js |
| AI risk analysis | Experience Package | `meetingiq.risk-analysis` | No | `POST /api/ai/risk-analysis` | ai.test.js |
| AI next-best actions | Experience Package | `meetingiq.next-best-actions` | No | `POST /api/ai/next-best-actions` | ai.test.js |
| AI follow-up draft | Experience Package | `meetingiq.follow-up-draft` | No | `POST /api/ai/follow-up-draft` | ai.test.js |
| AI meeting quality | Experience Package | `meetingiq.meeting-quality` | No | `POST /api/ai/meeting-quality` | ai.test.js |
| Experience Packages (11) | Signed YAML DAGs | `packages/experiences/` | No | `scripts/register-experiences.js` | experiences.test.js |
| Risk Score materialization | Analytics Profile | `meetingiq.risk-scoring-v1` | No | `packages/domain/` | domain.test.js |
| Domain package | Domain Package | `meetingiq@1.0.0` | No | `packages/domain/` | domain.test.js |
| CRM Sync | Connector Plugin | `@zambyl/connectors` | No | `connectors/crm/` | connector-plugins.test.js |
| Calendar Sync | Connector Plugin | `@zambyl/connectors` | No | `connectors/calendar/` | connector-plugins.test.js |
| Email Ingestion | Connector Plugin | `@zambyl/connectors` | No | `connectors/mail/` | connector-plugins.test.js |
| Slack Ingestion | Connector Plugin | `@zambyl/connectors` | No | `connectors/slack/` | connector-plugins.test.js |
| Document Ingestion | Connector Plugin | `@zambyl/connectors` | No | `connectors/documents/` | connector-plugins.test.js |
| Task Ingestion | Connector Plugin | `@zambyl/connectors` | No | `connectors/tasks/` | connector-plugins.test.js |
| Support Ingestion | Connector Plugin | `@zambyl/connectors` | No | `connectors/support/` | connector-plugins.test.js |
| ERP Ingestion | Connector Plugin | `@zambyl/connectors` | No | `connectors/erp/` | connector-plugins.test.js |
| Identity Ingestion | Connector Plugin | `@zambyl/connectors` | No | `connectors/identity/` | connector-plugins.test.js |
| Connector health signal | Canonical escalations → notifications | BFF derived | No | notifications type `connectors` | search-notifications.test.js |
| Mock enterprise APIs | Independent source systems | mock-services/ | No | Phase 2 mocks | mock tests |
| Event simulator | Correlated scenarios | mock event-simulator | No | `POST /v1/scenarios/pre_meeting/run` | mock tests |

---

## Summary (Phase 9)

| Metric | Value |
|--------|-------|
| Total features implemented | **48** |
| Features using Experience Packages | **11** |
| Features using Search | **6** |
| Features using Connectors | **9** |
| Features using Domain Package | **1** |
| Features using Outbox / Projections | **3** |
| Features using BFF application layer | **12** |
| Kernel modifications | **0** |

---

## Platform Primitives Exercised

- [x] Experience Package
- [x] Connector Plugin
- [x] Search Profile
- [x] Data Profile
- [x] Analytics Profile
- [x] Template
- [x] Policy Bundle
- [x] Registry Bindings
- [x] Domain Package
- [x] `POST /v1/experiences:execute`
- [x] `POST /v1/search:query`
- [x] Outbox / Projection pipeline
- [x] Admin connection sync API
- [ ] Workflow Package — not required Phase 1
- [ ] Trigger Package — not required Phase 1
- [ ] `POST /v1/conversations` — not required Phase 1
- [ ] `POST /v1/actions` — not required Phase 1 (notifications cover approvals UX)
- [ ] `GET /v1/operations/{id}` — not required Phase 1
- [ ] Operations SSE to browser — BFF SSE used instead (MIQ-002)

---

*An empty gap log and a complete usage report with zero kernel modifications is the definition of platform validation success.*
