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
| Zambyl connectivity probe | Public catalog API | No | `GET /api/platform/zambyl` | foundation.test.js |
| User hierarchy + entitlements | BFF auth + policy mapping | No | `GET /api/me` | foundation.test.js |
| Company Research | Experience Package | `POST /v1/experiences:execute` | No | _TBD_ | _TBD_ |
| Voice of Customer | Search + Experience Package | `POST /v1/search:query` | No | _TBD_ | _TBD_ |
| Risk Score | Materialization + Analytics Profile | Experience / analytics | No | _TBD_ | _TBD_ |
| Live Agenda | Connector + Search Projection | Connector sync → search | No | _TBD_ | _TBD_ |
| Executive Dashboard | Domain Package + BFF aggregation | Domain entitlements | No | _TBD_ | _TBD_ |
| Pipeline View | Search Profile + Materialization | `POST /v1/search:query` | No | _TBD_ | _TBD_ |
| At-risk Deals | Analytics Profile + Experience | `POST /v1/experiences:execute` | No | _TBD_ | _TBD_ |
| Meeting Cards | Canonical entities + Search | Search projection | No | _TBD_ | _TBD_ |
| Notifications | BFF + Operations SSE | `GET /v1/operations/{id}/events` | No | _TBD_ | _TBD_ |
| Approvals | Actions runtime | `POST /v1/actions` | No | _TBD_ | _TBD_ |
| CRM Sync | Connector Plugin | `@zambyl/connectors` | No | _TBD_ | _TBD_ |
| Calendar Sync | Connector Plugin | `@zambyl/connectors` | No | _TBD_ | _TBD_ |
| Email Ingestion | Connector Plugin | `@zambyl/connectors` | No | _TBD_ | _TBD_ |
| Role-based Access | Policy Bundle + BFF enforcement | Policy + entitlements | No | _TBD_ | _TBD_ |
| AI Forecast Explanation | Experience Package + Template | `POST /v1/experiences:execute` | No | _TBD_ | _TBD_ |
| QBR Narrative | Experience Package | `POST /v1/experiences:execute` | No | _TBD_ | _TBD_ |
| Follow-up Draft | Experience Package + Conversations | Execute + Conversations | No | _TBD_ | _TBD_ |
| Connector Health | Operations poll | `GET /v1/operations/{id}` | No | _TBD_ | _TBD_ |
| Freshness Indicators | Materialization metadata | BFF read model | No | _TBD_ | _TBD_ |

---

## Summary (update at Phase 9)

| Metric | Value |
|--------|-------|
| Total features implemented | 0 |
| Features using Experience Packages | 0 |
| Features using Search | 0 |
| Features using Connectors | 0 |
| Features using Actions | 0 |
| Features using Domain Packages | 0 |
| Features using Conversations | 0 |
| Features using Operations | 0 |
| Kernel modifications | **0** |

---

## Platform Primitives Exercised

Check when first used:

- [ ] Domain Package
- [ ] Experience Package
- [ ] Workflow Package
- [ ] Trigger Package
- [ ] Connector Plugin
- [ ] Search Profile
- [ ] Data Profile
- [ ] Analytics Profile
- [ ] Template
- [ ] Policy Bundle
- [ ] Registry Bindings
- [ ] `POST /v1/experiences:execute`
- [ ] `POST /v1/search:query`
- [ ] `POST /v1/conversations`
- [ ] `POST /v1/actions`
- [ ] `GET /v1/operations/{id}`
- [ ] Operations SSE
- [ ] Materializations
- [ ] Outbox / Projection pipeline

---

*An empty gap log and a complete usage report with zero kernel modifications is the definition of platform validation success.*
