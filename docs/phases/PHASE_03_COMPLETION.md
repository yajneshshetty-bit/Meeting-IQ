# Phase 3 — Completion Record

**Status:** ✅ Complete  
**Date:** 2026-08-01

---

## Exit Criteria

| Criterion | Result |
|-----------|--------|
| All mock sources ingested through Zambyl connectors only | ✅ 9 plugins, 68 records |
| Incremental sync verified | ✅ Delta cursor + integration test |
| Search index populated after sync | ✅ 60 `search_documents` (meetingiq corpora) |
| No MeetingIQ code reads mock APIs directly | ✅ Connectors only; BFF unchanged |
| Kernel not modified | ✅ |

---

## Deliverables

| Path | Purpose |
|------|---------|
| `connectors/common/` | Shared mock delta sync + entity mappers |
| `connectors/{crm,calendar,mail,...}/` | 9 Zambyl connector plugins |
| `registries/connector-plugin-bindings.json` | Plugin registration for Zambyl DB |
| `registries/connections.json` | Connection instances (mock URLs + policy scope) |
| `registries/search-profiles.json` | 5 MeetingIQ search profiles |
| `scripts/register-connectors.js` | Register plugins/connections/profiles in Zambyl Postgres |
| `scripts/sync-connectors.js` | Trigger sync via Zambyl admin HTTP API |
| `scripts/zambyl-bootstrap-sync.js` | Bootstrap platform + sync (direct `startSync`) |
| `connectors/tests/` | 30 unit + 1 integration test |

---

## Connector Catalog

| Connector ID | Mock Service | Connection ID | Entities |
|--------------|-------------|---------------|----------|
| `meetingiq.crm` | :4001 | `conn_meetingiq_crm` | accounts, opportunities, contacts, leads, products, forecasts |
| `meetingiq.calendar` | :4002 | `conn_meetingiq_calendar` | meetings |
| `meetingiq.mail` | :4003 | `conn_meetingiq_mail` | email threads, messages |
| `meetingiq.slack` | :4004 | `conn_meetingiq_slack` | channels, conversations |
| `meetingiq.documents` | :4005 | `conn_meetingiq_documents` | contracts, proposals |
| `meetingiq.tasks` | :4006 | `conn_meetingiq_tasks` | tasks |
| `meetingiq.support` | :4007 | `conn_meetingiq_support` | support cases |
| `meetingiq.erp` | :4008 | `conn_meetingiq_erp` | orders, renewals, billing |
| `meetingiq.identity` | :4009 | `conn_meetingiq_identity` | users, territories, org (canonical only) |

**Sync modes:** batch + incremental via mock `/v1/delta` cursor (`change_id` checkpoint).

---

## Verification (local)

```bash
# Prerequisites: Zambyl v1.0.1 + mock services on :4001–4009
npm run mock:start                    # or start mock services locally
npm run connectors:register           # writes to Zambyl Postgres
npm run connectors:bootstrap-sync     # bootstrapPlatform + batch sync

# Verify ingestion
psql $ZAMBYL_DATABASE_URL -c "SELECT COUNT(*) FROM canonical_entities WHERE source_ref LIKE 'conn_meetingiq_%';"
psql $ZAMBYL_DATABASE_URL -c "SELECT COUNT(*) FROM search_documents WHERE corpus_id LIKE 'meetingiq-%';"

npm run connectors:test               # 31 tests (integration skips unless ZAMBYL_INTEGRATION=1)
```

**Verified locally:** 68 canonical entities, 60 search documents after batch sync.

---

## Sync Modes

| Mode | Trigger | Use case |
|------|---------|----------|
| Batch | `npm run connectors:bootstrap-sync` | Initial load |
| Incremental | `node scripts/zambyl-bootstrap-sync.js incremental` | Delta after mock changes |
| HTTP admin | `npm run connectors:sync` | Requires gateway restart after register |

Webhook-triggered sync is configured in connector manifests for mail/slack/support; workflow packages (Phase 4+) will wire schedules.

---

## Next Phase

→ **[Phase 4 — MeetingIQ Domain Packages](./PHASE_04_DOMAIN_PACKAGES.md)**

Domain packages, profiles, templates, and policies for MeetingIQ semantics on top of ingested canonical entities.
