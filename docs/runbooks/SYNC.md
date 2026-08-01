# Runbook — Connector Sync

**Purpose:** Ingest changes from mock enterprise sources into Zambyl canonical store.

---

## When to sync

- After mock services start
- After event simulator runs a scenario
- On a schedule (production: per-connection cron)
- After connector plugin or connection config changes

---

## Commands

### Batch sync (full re-ingest)

```bash
npm run connectors:sync
# or
node scripts/sync-connectors.js batch
```

### Incremental sync (real-time pipeline)

```bash
node scripts/sync-connectors.js incremental
```

### Bootstrap sync (platform init + all connections)

```bash
npm run connectors:bootstrap-sync
```

Requires `ZAMBYL_ROOT` for inline bootstrap when using bootstrap-sync script.

### Via BFF (runtime orchestration)

```bash
curl -X POST -H 'x-meetingiq-user-id: user_alex' \
  http://localhost:3001/api/realtime/pipeline
```

Runs incremental sync for all connections + outbox poll.

---

## Pre-meeting scenario

```bash
curl -X POST http://localhost:4010/v1/scenarios/pre_meeting/run
npm run realtime:pre-meeting
```

---

## Verify sync

```bash
# Zambyl canonical count (host)
psql $ZAMBYL_DATABASE_URL -c \
  "SELECT COUNT(*) FROM canonical_entities WHERE source_ref LIKE 'conn_meetingiq_%';"

# Search projection
psql $ZAMBYL_DATABASE_URL -c \
  "SELECT COUNT(*) FROM search_documents WHERE corpus_id LIKE 'meetingiq-%';"
```

---

## Environment

| Variable | Default |
|----------|---------|
| `ZAMBYL_API_URL` | `http://localhost:8080` |
| `ZAMBYL_ADMIN_KEY` | `dev-admin-key` |
| `ZAMBYL_DATABASE_URL` | `postgres://zambyl:zambyl@localhost:5432/zambyl` |

**Note:** After `connectors:register`, restart Zambyl gateway if using HTTP admin sync (registry cache).
