# Phase 6 — Completion Record

**Status:** ✅ Complete  
**Date:** 2026-08-01

---

## Exit Criteria

| Criterion | Result |
|-----------|--------|
| Every PRD capability has working UI path | ✅ Command Center + Executive + Support |
| No placeholder buttons or stub data | ✅ All widgets load from BFF; AI actions show real search/context |
| UI calls BFF only (never Zambyl) | ✅ Verified — no Zambyl URLs in web app |
| Role switching demonstrates different views | ✅ AE / Manager / SE / Leader switcher |

---

## Deliverables

| Path | Purpose |
|------|---------|
| `apps/web/` | Vite + React SPA (port 5173) |
| `apps/web/src/pages/CommandCenter.jsx` | GTM Command Center — KPIs, agenda, notifications |
| `apps/web/src/pages/ExecutiveView.jsx` | Executive pipeline Q3 — rollups, filters, account hierarchy |
| `apps/web/src/pages/SupportView.jsx` | Support diagnostics |
| `apps/bff/src/services/search.js` | Unified search + accounts + VoC + products |
| `apps/bff/src/services/notifications.js` | Respond-now queue from canonical entities |
| `apps/bff/src/routes/search.js` | Search API for UI |
| `apps/bff/src/routes/notifications.js` | Notifications API for UI |
| `docs/PRD_TRACEABILITY.md` | Screenshot capability → component → BFF route |

---

## PRD Coverage

### Command Center (Screenshot 1)

| Capability | UI Component | BFF Route |
|------------|--------------|-----------|
| Pipeline KPI | `KpiStrip` | `/api/command-center/overview` |
| At-risk deals | `KpiStrip` | `/api/command-center/overview` |
| Meetings this week | `KpiStrip` + `AgendaWidget` | overview + `/api/command-center/agenda` |
| Actions due | `KpiStrip` | `/api/command-center/overview` |
| Avg quality | `KpiStrip` | overview (`avg_meeting_quality`) |
| Research company | `ResearchBanner` | `/api/search/accounts` |
| Weekly agenda | `AgendaWidget` | `/api/command-center/agenda` |
| LIVE / NEW badges | `AgendaWidget` | agenda payload |
| Respond now | `NotificationPanel` | `/api/notifications` |
| Urgency / Type / Group filters | `NotificationPanel` | client-side on BFF items |
| Role switcher | `RoleSwitcher` | `/api/me` (header swap) |
| Global search ⌘K | `SearchModal` | `/api/search` |
| Freshness | `FreshnessBadge` | all BFF responses |
| Widget config | `WidgetSettingsModal` | `/api/widgets/config` |

### Executive Pipeline (Screenshot 2)

| Capability | UI Component | BFF Route |
|------------|--------------|-----------|
| Committed pipeline | Executive KPIs | `/api/executive/pipeline` |
| AI-adjusted | Executive KPIs | `/api/executive/forecast` |
| Rising risk | Executive KPIs | `/api/executive/rising-risk` |
| Opportunities / Leads toggle | Executive toolbar | pipeline (leads note) |
| Product filter | `<select>` | `/api/products` + client filter |
| Opportunity search | toolbar input | client filter on pipeline |
| Account hierarchy | `AccountGroup` | `/api/executive/pipeline` |
| Deal rows + progress | `DealRow` | pipeline accounts |
| Stage / risk badges | `StageBadge` | canonical payload |
| Voice of customer | `VocModal` | `/api/search/voc` |
| QBR | QBR modal | deal context (AI narrative Phase 7) |

---

## Run

```bash
npm install
npm run bootstrap
npm run dev          # BFF :3001
npm run dev:web      # UI :5173
```

---

## Test Summary

| Suite | Tests |
|-------|-------|
| BFF (incl. search/notifications) | 30 |
| Web API helpers | 3 |

**Next:** Phase 7 — AI Experiences (LLM-backed research, VoC synthesis, QBR narrative)
