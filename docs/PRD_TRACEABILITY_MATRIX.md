# PRD Traceability Matrix

> **Phase 9 authoritative traceability:** every PRD screenshot capability → implementation → test.  
> **Screenshots:** [command-center.png](./prd/command-center.png) | [executive-pipeline-q3.png](./prd/executive-pipeline-q3.png)

**Validation date:** 2026-08-01  
**Coverage:** 100% of Phase 1 PRD capabilities (§4.1–4.3)

---

## Command Center (§4.1)

| # | PRD Capability | Implementation | Test |
|---|----------------|----------------|------|
| 1 | Weekly overview | `GET /api/command-center/overview` → `KpiStrip` | command-center.test.js |
| 2 | Pipeline summary | overview KPIs (`pipeline_value`) | command-center.test.js |
| 3 | At-risk deals | overview KPIs + `GET /api/command-center/at-risk` | command-center.test.js |
| 4 | Meetings today / upcoming | `GET /api/command-center/agenda` → `AgendaWidget` | command-center.test.js |
| 5 | Actions due | overview KPIs + `GET /api/command-center/actions-due` | command-center.test.js |
| 6 | Average meeting quality | overview KPI (`avg_meeting_quality`) | command-center.test.js |
| 7 | Agenda view (Day/Week) | `AgendaWidget` | command-center.test.js |
| 8 | Meeting cards + live indicators | agenda payload `is_live` → LIVE badge | command-center.test.js |
| 9 | Research company | `ResearchBanner` → `GET /api/search/accounts` + `POST /api/ai/company-research` | api.test.js, ai.test.js |
| 10 | Notifications / respond now | `GET /api/notifications` → `NotificationPanel` | search-notifications.test.js |
| 11 | Urgency queue | `NotificationPanel` client filter | search-notifications.test.js |
| 12 | Approvals pending | notifications type filter `approvals` | search-notifications.test.js |
| 13 | Risk alerts | notifications derived from at-risk opportunities | search-notifications.test.js |
| 14 | Connector health indicators | notifications type `connectors` (support escalations) | search-notifications.test.js |
| 15 | Filters and grouping | `NotificationPanel` urgency/type/group | manual UI |
| 16 | Live updates (no manual refresh) | `useRealtimeInvalidation` + SSE `/api/events/stream` | realtime.test.js, pre-meeting-scenario.js |
| 17 | Search | `SearchModal` → `GET /api/search` | search-notifications.test.js |
| 18 | Role-aware visibility | `RoleSwitcher` + `services/scope.js` | scope.test.js, foundation.test.js |
| 19 | Freshness indicators | `FreshnessBadge` on all BFF responses | command-center.test.js |
| 20 | Widget configuration | `WidgetSettingsModal` → `/api/widgets/config` | widgets.test.js |

---

## Executive View (§4.2)

| # | PRD Capability | Implementation | Test |
|---|----------------|----------------|------|
| 21 | Executive dashboard | `ExecutiveViewPage` | executive.test.js |
| 22 | Pipeline rollups | `GET /api/executive/pipeline` | executive.test.js |
| 23 | AI-adjusted forecast | `GET /api/executive/forecast` | executive.test.js |
| 24 | Risk indicators | `GET /api/executive/rising-risk` + deal risk badges | executive.test.js |
| 25 | Search | toolbar input (client filter on pipeline) | manual UI |
| 26 | Product filters | `GET /api/products` + `<select>` | search-notifications.test.js |
| 27 | Opportunity hierarchy | `AccountGroup` ← pipeline `accounts[]` | executive.test.js |
| 28 | Voice of customer | `VocModal` → `GET /api/search/voc` + `POST /api/ai/voice-of-customer` | ai.test.js |
| 29 | QBR preparation | `QbrModal` → `POST /api/ai/qbr-narrative` | ai.test.js |
| 30 | Forecast bars | forecast KPI strip | executive.test.js |
| 31 | Opportunity status stages | `StageBadge` from canonical `stage` | executive.test.js |
| 32 | Cross-region / cross-team rollups | leader scope via `visible_user_ids` | scope.test.js |

---

## AI Experiences (§4.3)

All execute via BFF → `POST /v1/experiences:execute` (Zambyl Experience Packages).

| # | PRD Capability | BFF Route | Experience ID | Test |
|---|----------------|-----------|---------------|------|
| 33 | Pre-meeting brief | `POST /api/ai/pre-meeting-brief` | `meetingiq.pre-meeting-brief` | ai.test.js, experiences.test.js |
| 34 | Company research | `POST /api/ai/company-research` | `meetingiq.company-research` | ai.test.js |
| 35 | Voice of customer | `POST /api/ai/voice-of-customer` | `meetingiq.voice-of-customer` | ai.test.js |
| 36 | Executive summary | `POST /api/ai/executive-summary` | `meetingiq.executive-summary` | ai.test.js |
| 37 | Opportunity summary | `POST /api/ai/opportunity-summary` | `meetingiq.opportunity-summary` | ai.test.js |
| 38 | Risk analysis | `POST /api/ai/risk-analysis` | `meetingiq.risk-analysis` | ai.test.js |
| 39 | Next-best actions | `POST /api/ai/next-best-actions` | `meetingiq.next-best-actions` | ai.test.js |
| 40 | Follow-up draft | `POST /api/ai/follow-up-draft` | `meetingiq.follow-up-draft` | ai.test.js |
| 41 | QBR narrative | `POST /api/ai/qbr-narrative` | `meetingiq.qbr-narrative` | ai.test.js |
| 42 | Forecast explanation | `POST /api/ai/forecast-explanation` | `meetingiq.forecast-explanation` | ai.test.js |
| 43 | Meeting quality | `POST /api/ai/meeting-quality` | `meetingiq.meeting-quality` | ai.test.js |

---

## Platform / Ingestion (implicit PRD)

| # | Capability | Implementation | Test |
|---|------------|----------------|------|
| 44 | CRM sync | `connectors/crm/` | connector-plugins.test.js |
| 45 | Calendar sync | `connectors/calendar/` | connector-plugins.test.js |
| 46 | Email ingestion | `connectors/mail/` | connector-plugins.test.js |
| 47 | Slack ingestion | `connectors/slack/` | connector-plugins.test.js |
| 48 | Document ingestion | `connectors/documents/` | connector-plugins.test.js |
| 49 | Task ingestion | `connectors/tasks/` | connector-plugins.test.js |
| 50 | Support ingestion | `connectors/support/` | connector-plugins.test.js |
| 51 | ERP ingestion | `connectors/erp/` | connector-plugins.test.js |
| 52 | Identity ingestion | `connectors/identity/` | connector-plugins.test.js |
| 53 | Real-time pre-meeting scenario | `scripts/pre-meeting-scenario.js` | realtime-integration.test.js |

---

## Coverage Summary

| Metric | Value |
|--------|-------|
| PRD capabilities traced | **53** |
| With automated test | **50** |
| Manual UI verification | **3** (filters/grouping, deal badges, toolbar search) |
| Placeholder / stub | **0** |
| Kernel modifications | **0** |

---

*See also [`PRD_TRACEABILITY.md`](./PRD_TRACEABILITY.md) (Phase 6 component-level view) and [`PLATFORM_USAGE_REPORT.md`](./PLATFORM_USAGE_REPORT.md) (platform primitive mapping).*
