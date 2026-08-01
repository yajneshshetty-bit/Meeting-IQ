# Phase 2 — Completion Record

**Status:** ✅ Complete  
**Date:** 2026-08-01

---

## Exit Criteria

| Criterion | Result |
|-----------|--------|
| All 9 services run independently via docker-compose | ✅ `--profile mock` |
| OpenAPI docs for each service | ✅ `GET /openapi.json` |
| Event simulator running | ✅ Port 4010, `pre_meeting` scenario |
| Zero dependencies on Zambyl or MeetingIQ | ✅ |
| Realistic interconnected seed data | ✅ `enterprise-manifest.js` |
| Independent services (not monolithic CRM) | ✅ |
| No Zambyl / BFF business routes | ✅ |

---

## Deliverables

| Path | Purpose |
|------|---------|
| `mock-services/common/` | Shared SQLite, delta API, webhooks, auth, rate limits |
| `mock-services/seed/enterprise-manifest.js` | Cross-service IDs aligned to PRD screenshots |
| `mock-services/crm/` | Accounts, opportunities, contacts, leads, products, forecasts |
| `mock-services/calendar/` | Meetings, attendees |
| `mock-services/mail/` | Email threads and messages |
| `mock-services/slack/` | Channels, messages, escalations |
| `mock-services/documents/` | Contracts, proposals, metadata |
| `mock-services/tasks/` | Tasks and assignments |
| `mock-services/support/` | Support tickets |
| `mock-services/erp/` | Orders, renewals, billing accounts |
| `mock-services/identity/` | Users, territories, org hierarchy |
| `mock-services/event-simulator/` | Correlated multi-service scenarios |
| `mock-services/tests/mock-services.test.js` | 11 integration tests |
| `docker-compose.yml` | Mock profile (ports 4001–4010) |

---

## Service Ports

| Service | Port | API Key |
|---------|------|---------|
| CRM | 4001 | `mock-enterprise-key` |
| Calendar | 4002 | same |
| Mail | 4003 | same |
| Slack | 4004 | same |
| Documents | 4005 | same |
| Tasks | 4006 | same |
| Support | 4007 | same |
| ERP | 4008 | same |
| Identity | 4009 | same |
| Event Simulator | 4010 | no auth (orchestrator only) |

All services expose: `GET /health`, `GET /openapi.json`, `GET /v1/delta`, `POST /v1/webhooks/subscribe`

---

## Verification

```bash
npm install
npm run mock:test                    # 11/11 unit/integration tests

# Optional: full stack via Docker
npm run mock:start
curl http://localhost:4001/health
curl -H 'x-api-key: mock-enterprise-key' http://localhost:4001/v1/opportunities
curl -X POST http://localhost:4010/v1/scenarios/pre_meeting/run
```

---

## Event Simulator

The `pre_meeting` scenario models the acceptance example from `REALTIME_CORRECTNESS_MATRIX.md`:

1. Customer email arrives (Mail)
2. CRM opportunity probability changes (CRM)
3. Support ticket escalates (Support)
4. Slack alert posted
5. Task priority raised

Auto-runs every 120s when started via docker-compose (`MOCK_SIMULATOR_AUTO=1`).

---

## Next Phase

→ **[Phase 3 — Connectors](./PHASE_03_CONNECTORS.md)**

Zambyl connector plugins ingest all mock sources. MeetingIQ still does not call mock services directly at runtime.
