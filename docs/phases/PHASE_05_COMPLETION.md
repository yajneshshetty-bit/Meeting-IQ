# Phase 5 — Completion Record

**Status:** ✅ Complete  
**Date:** 2026-08-01

---

## Exit Criteria

| Criterion | Result |
|-----------|--------|
| BFF returns real Zambyl data (no mock source imports) | ✅ Search API + canonical_entities reads |
| Sales Rep sees only scoped data | ✅ `entityInScope` + `visibleUserIds` |
| VP sees org rollups | ✅ Leader role + executive routes |
| Admin sees all; Support sees diagnostics only | ✅ Role guards on routes |
| Every endpoint logged in PLATFORM_USAGE_REPORT | ✅ Updated |
| Freshness metadata on all responses | ✅ `withFreshness()` wrapper |
| Widget configuration CRUD | ✅ `widget_configs` table + API |

---

## Deliverables

| Path | Purpose |
|------|---------|
| `apps/bff/src/services/freshness.js` | Freshness metadata wrapper |
| `apps/bff/src/services/scope.js` | Hierarchy-aware entity scoping |
| `apps/bff/src/services/canonical.js` | Read canonical_entities from Zambyl Postgres |
| `apps/bff/src/services/command-center.js` | Overview, agenda, at-risk, actions-due read models |
| `apps/bff/src/services/executive.js` | Pipeline, forecast, rising-risk rollups |
| `apps/bff/src/services/support.js` | Support diagnostics read model |
| `apps/bff/src/services/widgets.js` | Widget config persistence |
| `apps/bff/src/routes/*.js` | HTTP routes for all product APIs |
| `apps/bff/src/zambyl/client.js` | Added `search()` → `POST /v1/search:query` |
| `migrations/002_widget_config.sql` | Per-user widget layout/settings |
| `apps/bff/tests/*.test.js` | Scope, command-center, executive, widgets tests |

---

## BFF Product API Routes

| Method | Route | Role access |
|--------|-------|-------------|
| GET | `/api/command-center/overview` | All except support |
| GET | `/api/command-center/agenda` | All except support |
| GET | `/api/command-center/at-risk` | All except support |
| GET | `/api/command-center/actions-due` | All except support |
| GET | `/api/executive/pipeline` | `meetingiq.executive.read` |
| GET | `/api/executive/forecast` | `meetingiq.executive.read` |
| GET | `/api/executive/rising-risk` | `meetingiq.executive.read` |
| GET | `/api/support/diagnostics` | Support + admin |
| GET/PUT/DELETE | `/api/widgets/config` | All except support |

---

## Architecture Notes

1. **No mock imports in BFF** — data from Zambyl Search API and Zambyl Postgres canonical store only.
2. **Scoping in BFF** — `owner_id`, `territory_id`, `visibleUserIds` applied after canonical fetch.
3. **Freshness** — every response includes `{ last_synced, source, pending_updates, confidence }`.
4. **Materialization keys** — aligned with `DOMAIN_MODEL.md` §7 (`weekly_overview`, `agenda_week`, etc.).

---

## Test Summary

| Suite | Tests |
|-------|-------|
| foundation | 6 |
| scope | 8 |
| command-center | 5 (1 integration skip without `ZAMBYL_INTEGRATION=1`) |
| executive | 5 |
| widgets | 3 |

**Total BFF tests:** 27

---

## Next Phase

Phase 6 — MeetingIQ UI (Command Center + Executive View, BFF-only data layer).
