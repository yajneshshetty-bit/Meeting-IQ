# Runbook — Connector Restart

**Purpose:** Recover connector ingestion after config changes or plugin updates.

---

## Symptoms

- Sync returns 404 for connection ID
- `records_written: 0` after mock data changed
- New connector not visible in admin API

---

## Steps

### 1. Verify mock sources

```bash
curl -H 'x-api-key: mock-enterprise-key' http://localhost:4001/health
curl -H 'x-api-key: mock-enterprise-key' http://localhost:4001/v1/opportunities | head
```

If mocks down: `npm run mock:start` or `docker compose -f docker-compose.full.yml up -d mock-crm mock-mail ...`

### 2. Re-register connectors

```bash
npm run connectors:register
```

Writes plugins + connections to Zambyl Postgres (`registries/connections.json`).

### 3. Restart Zambyl gateway

Registry is loaded at gateway boot for admin sync routes.

```bash
# Docker full stack
docker compose -f docker-compose.full.yml restart zambyl-gateway

# Local dev
# Ctrl+C gateway, then: npm run dev -w @zambyl/gateway
```

### 4. Re-sync

```bash
npm run connectors:bootstrap-sync    # first time or after schema change
# or
node scripts/sync-connectors.js incremental
```

### 5. Verify BFF read models

```bash
curl -H 'x-meetingiq-user-id: user_alex' http://localhost:3001/api/command-center/overview
curl -X POST -H 'x-meetingiq-user-id: user_alex' http://localhost:3001/api/realtime/poll
```

---

## Connection IDs

See `registries/connections.json` — all prefixed `conn_meetingiq_*`.

---

## Escalation

If sync fails with platform errors, check Zambyl gateway logs. Do **not** modify `zambyl-core/`. Log platform gaps in [`PLATFORM_GAP_LOG.md`](../PLATFORM_GAP_LOG.md).
