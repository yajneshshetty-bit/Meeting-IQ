# Runbook — Failure Recovery

**Purpose:** Restore MeetingIQ after common failure modes.

---

## BFF unhealthy

**Symptoms:** `/health` fails, UI shows auth/loading errors.

```bash
# Check Postgres
docker compose ps postgres
docker compose logs bff --tail 50

# Restart BFF
docker compose -f docker-compose.full.yml restart bff
# or local: npm run dev
```

Migrations run on BFF container start. If migration failed, fix DB and restart.

---

## Zambyl gateway down

**Symptoms:** BFF `/api/platform/zambyl` shows `connected: false`; search/overview empty.

```bash
curl http://localhost:8080/health
docker compose -f docker-compose.full.yml logs zambyl-gateway --tail 100
docker compose -f docker-compose.full.yml restart zambyl-gateway
```

If Postgres empty, re-bootstrap:

```bash
npm run connectors:register
npm run domain:register
npm run connectors:bootstrap-sync
```

---

## UI not updating (real-time)

**Symptoms:** Data stale after mock events; freshness badges old.

1. Run pre-meeting scenario + sync: `npm run realtime:pre-meeting`
2. Check outbox watermark: `GET /api/observability/summary`
3. Manual poll: `POST /api/realtime/poll`
4. Verify SSE: browser Network tab → `/api/events/stream`

BFF watcher disabled when `MEETINGIQ_REALTIME_WATCHER=0`.

---

## Database reset (dev only)

```bash
npm run stack:down
docker volume rm meeting-iq_meetingiq_pg_data meeting-iq_zambyl_pg_data 2>/dev/null || true
npm run stack:up
```

**Warning:** Destroys all ingested data.

---

## Test suite failures

```bash
MEETINGIQ_REALTIME_WATCHER=0 npm run validation:suite
```

Integration tests need live stack:

```bash
ZAMBYL_INTEGRATION=1 OPENAI_API_KEY=... npm run validation:suite
```

---

## Observability

```bash
curl -H 'x-meetingiq-user-id: user_alex' http://localhost:3001/api/observability/summary
curl http://localhost:3001/metrics
```

---

## Support contacts

| Layer | Owner |
|-------|-------|
| MeetingIQ app | Application team |
| Zambyl platform | Platform team (gaps → PLATFORM_GAP_LOG) |
| Mock enterprise | Dev/test fixtures only |
