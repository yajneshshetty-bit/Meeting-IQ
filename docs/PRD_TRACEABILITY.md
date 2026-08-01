# PRD Traceability Matrix

Maps Phase 1 PRD screenshot capabilities to UI components, BFF routes, and tests.

**Screenshots:** [command-center.png](./prd/command-center.png) | [executive-pipeline-q3.png](./prd/executive-pipeline-q3.png)

---

## Command Center

| PRD Capability | UI Component | BFF Route | Test |
|----------------|--------------|-----------|------|
| Pipeline KPI | `KpiStrip` | `GET /api/command-center/overview` | command-center.test.js |
| At-risk deals count | `KpiStrip` | overview KPIs | command-center.test.js |
| Meetings this week | `KpiStrip`, `AgendaWidget` | overview + agenda | command-center.test.js |
| Actions due / overdue | `KpiStrip` | overview KPIs | command-center.test.js |
| Avg meeting quality | `KpiStrip` | overview KPIs | command-center.test.js |
| Research a company | `ResearchBanner` | `GET /api/search/accounts` | api.test.js (web) |
| Weekly agenda Day/Week | `AgendaWidget` | `GET /api/command-center/agenda` | command-center.test.js |
| Meeting status dots | `AgendaWidget` | agenda payload | manual |
| LIVE indicator | `AgendaWidget` | agenda payload | manual |
| Respond now queue | `NotificationPanel` | `GET /api/notifications` | search-notifications.test.js |
| Urgency filter | `NotificationPanel` | client filter | manual |
| Type filter | `NotificationPanel` | client filter | manual |
| Group by | `NotificationPanel` | client filter | manual |
| Role switcher | `RoleSwitcher` | `GET /api/me` | foundation.test.js |
| Global search ⌘K | `SearchModal` | `GET /api/search` | search-notifications.test.js |
| Freshness indicators | `FreshnessBadge` | all responses | command-center.test.js |
| Widget configuration | `WidgetSettingsModal` | `/api/widgets/config` | widgets.test.js |

---

## Executive Pipeline Q3

| PRD Capability | UI Component | BFF Route | Test |
|----------------|--------------|-----------|------|
| Committed pipeline | Executive KPI strip | `GET /api/executive/pipeline` | executive.test.js |
| AI-adjusted forecast | Executive KPI strip | `GET /api/executive/forecast` | executive.test.js |
| Rising risk count | Executive KPI strip | `GET /api/executive/rising-risk` | executive.test.js |
| Opportunities / Leads | Executive toolbar | pipeline | manual |
| Product filter | `<select>` | `GET /api/products` | search-notifications.test.js |
| Opportunity search | toolbar input | client filter | manual |
| Account hierarchy groups | `AccountGroup` | pipeline `accounts[]` | executive.test.js |
| Deal row + progress bar | `DealRow` | pipeline opportunity DTO | manual |
| Stage tags | `StageBadge` | canonical `stage` | manual |
| Voice of customer | `VocModal` | `GET /api/search/voc` | manual |
| QBR button | QBR modal | deal context (Phase 7 AI) | manual |
