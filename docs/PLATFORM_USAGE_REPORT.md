# Platform Usage Report

> **Purpose:** Prove that MeetingIQ validates the Zambyl Platform.  
> **Mandatory question for every feature:** **Which platform capability validated this?**

**Platform baseline:** Zambyl v1.0.1 (kernel frozen)  
**Kernel modified:** Must always be **No** for every row

---

## Platform Validation Map

| MeetingIQ Feature | Zambyl Capability Validated | Kernel Modified? |
| ----------------- | --------------------------- | ---------------- |
| Weekly Agenda | Connector + Materialization | No |
| Research Company | Experience Package | No |
| Executive Pipeline | Search Projection | No |
| Voice of Customer | Search + Experience Package | No |
| Risk Score | Experience + Materialization | No |
| Notifications | Operations + BFF Events | No |
| Live Updates | Outbox + Materialization + BFF SSE | No |
| BFF health | Application foundation | No |
| Command Center overview | Search + canonical + BFF aggregation | No |
| Executive pipeline | Search profile + BFF rollups | No |
| Freshness indicators | BFF read model metadata | No |
| Widget configuration | BFF persistence | No |
| Zambyl catalog probe | Public catalog API | No |
| User auth context | BFF + entitlements headers | No |
| Pre-meeting Brief | Experience Package | No |
| Approvals | Actions Runtime | No |
| CRM Sync | Connector Plugin | No |
| At-risk Deals | Analytics Profile + Materialization | No |
| AI Forecast | Experience Package + Template | No |

_Update this table as features are implemented. Add rows to the detailed traceability table below._

---

## How to Use

When implementing a feature:

1. Add a row to both tables above
2. Answer: **Which platform capability validated this?**
3. Confirm kernel was not modified
4. Link to implementation path and test

---

## Feature Traceability

| Feature | Platform Capability Validated | Package / API | Kernel Modified? | Implementation | Test |
|---------|------------------------------|---------------|------------------|----------------|------|
| BFF health + identity | Application layer (Phase 1) | No | `apps/bff` | foundation.test.js |
| Command Center overview | Search + canonical aggregation | `POST /v1/search:query` | No | `GET /api/command-center/overview` | command-center.test.js |
| Weekly agenda | Search profile + canonical | `meetingiq.agenda-v1` | No | `GET /api/command-center/agenda` | command-center.test.js |
| At-risk deals | Analytics profile + BFF scope | `meetingiq.at-risk-v1` | No | `GET /api/command-center/at-risk` | command-center.test.js |
| Actions due | Canonical tasks + BFF scope | canonical_entities | No | `GET /api/command-center/actions-due` | command-center.test.js |
| Executive pipeline | Search + BFF rollups | `meetingiq.executive-pipeline-v1` | No | `GET /api/executive/pipeline` | executive.test.js |
| AI forecast rollup | Canonical forecast + BFF | `ai_forecast` materialization key | No | `GET /api/executive/forecast` | executive.test.js |
| Rising risk | Canonical + BFF scope | `rising_risk` materialization key | No | `GET /api/executive/rising-risk` | executive.test.js |
| Support diagnostics | Canonical support cases | canonical_entities | No | `GET /api/support/diagnostics` | executive.test.js |
| Widget configuration | BFF persistence | `widget_configs` table | No | `/api/widgets/config` | widgets.test.js |
| Role-based scoping | BFF hierarchy enforcement | Policy + entitlements | No | `services/scope.js` | scope.test.js |
| Freshness indicators | BFF read model metadata | `withFreshness()` | No | all BFF routes | command-center.test.js |
| Zambyl connectivity probe | Public catalog API | No | `GET /api/platform/zambyl` | foundation.test.js |
| User hierarchy + entitlements | BFF auth + policy mapping | No | `GET /api/me` | foundation.test.js |
| Company Research | Experience Package | `POST /v1/experiences:execute` | No | _TBD_ | _TBD_ |
| Voice of Customer | Search + Experience Package | `POST /v1/search:query` | No | _TBD_ | _TBD_ |
| Risk Score | Materialization + Analytics Profile | Experience / analytics | No | `meetingiq.risk-scoring-v1` | domain.test.js |
| At-risk Deals | Analytics Profile + Experience | `POST /v1/experiences:execute` | No | `meetingiq.at-risk-v1` | domain.test.js |
| AI Forecast Explanation | Experience Package + Template | `POST /v1/experiences:execute` | No | `meetingiq-forecast-template` | domain.test.js |
| QBR Narrative | Experience Package | `POST /v1/experiences:execute` | No | _Phase 7_ | _TBD_ |
| Follow-up Draft | Experience Package + Conversations | Execute + Conversations | No | _Phase 7_ | _TBD_ |
| CRM Sync | Connector Plugin | `@zambyl/connectors` | No | `connectors/crm/` | connector-plugins.test.js |
| Calendar Sync | Connector Plugin | `@zambyl/connectors` | No | `connectors/calendar/` | connector-plugins.test.js |
| Email Ingestion | Connector Plugin | `@zambyl/connectors` | No | `connectors/mail/` | connector-plugins.test.js |
| Slack Ingestion | Connector Plugin | `@zambyl/connectors` | No | `connectors/slack/` | connector-plugins.test.js |
| Document Ingestion | Connector Plugin | `@zambyl/connectors` | No | `connectors/documents/` | connector-plugins.test.js |
| Task Ingestion | Connector Plugin | `@zambyl/connectors` | No | `connectors/tasks/` | connector-plugins.test.js |
| Support Ingestion | Connector Plugin | `@zambyl/connectors` | No | `connectors/support/` | connector-plugins.test.js |
| ERP Ingestion | Connector Plugin | `@zambyl/connectors` | No | `connectors/erp/` | connector-plugins.test.js |
| Identity Ingestion | Connector Plugin | `@zambyl/connectors` | No | `connectors/identity/` | connector-plugins.test.js |
| Domain package | Domain Package | `meetingiq@1.0.0` | No | `packages/domain/` | domain.test.js |
| Connector Health | Operations poll | `GET /v1/operations/{id}` | No | _TBD_ | _TBD_ |

---

## Summary (update at Phase 9)

| Metric | Value |
|--------|-------|
| Total features implemented | 24 |
| Features using Experience Packages | 0 |
| Features using Search | 4 |
| Features using Connectors | 9 |
| Features using Actions | 0 |
| Features using Domain Packages | 1 |
| Features using Conversations | 0 |
| Features using Operations | 0 |
| Kernel modifications | **0** |

---

## Platform Primitives Exercised

Check when first used:

- [x] Domain Package
- [ ] Experience Package
- [ ] Workflow Package
- [ ] Trigger Package
- [x] Connector Plugin
- [x] Search Profile
- [x] Data Profile
- [x] Analytics Profile
- [x] Template
- [x] Policy Bundle
- [x] Registry Bindings
- [ ] `POST /v1/experiences:execute`
- [x] `POST /v1/search:query`
- [ ] `POST /v1/conversations`
- [ ] `POST /v1/actions`
- [ ] `GET /v1/operations/{id}`
- [ ] Operations SSE
- [x] Outbox / Projection pipeline

---

*An empty gap log and a complete usage report with zero kernel modifications is the definition of platform validation success.*
