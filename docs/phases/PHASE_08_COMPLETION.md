# Phase 8 Completion — Real-Time Runtime

**Status:** Complete  
**Phase string:** `8-realtime` (BFF `/health`)

## What was built

### BFF realtime layer (MIQ-002)

| Component | Path | Role |
|-----------|------|------|
| Invalidation map | `apps/bff/src/services/realtime/invalidation.js` | entity_type → widget keys → BFF routes |
| Event bus | `apps/bff/src/services/realtime/event-bus.js` | In-process pub/sub for SSE clients |
| Outbox watcher | `apps/bff/src/services/realtime/watcher.js` | Polls Zambyl `outbox` (watermarked), broadcasts invalidations |
| Sync trigger | `apps/bff/src/services/realtime/sync-trigger.js` | Incremental sync all MeetingIQ connections |
| Routes | `apps/bff/src/routes/realtime.js` | SSE stream, manual poll, pipeline, latency metrics |

**Endpoints**

- `GET /api/events/stream` — SSE `widget.invalidate` events (fetch stream from UI; auth header)
- `POST /api/realtime/poll` — Process new outbox rows once
- `POST /api/realtime/pipeline` — Incremental sync + poll (orchestration)
- `GET /api/realtime/latency` — p50/p99 from `realtime_latency_samples`

### UI

- `apps/web/src/hooks/useRealtime.js` — fetch-based SSE (supports `x-meetingiq-user-id`)
- `useBff` gains `reload()` for widget-scoped refresh
- Command Center + Executive wire route → reload map (no full page reload)

### Data

- `migrations/003_realtime_watermark.sql` — watermarks + latency samples

### Scripts & tests

- `scripts/pre-meeting-scenario.js` — acceptance pipeline (`npm run realtime:pre-meeting`)
- `apps/bff/tests/realtime.test.js` — unit + route tests
- `apps/bff/tests/realtime-integration.test.js` — E2E when `ZAMBYL_INTEGRATION=1`

## Propagation path

```
Event simulator → mock sources
       ↓
incremental connector sync (admin API / POST /api/realtime/pipeline)
       ↓
Zambyl canonical_entities + outbox + projections (incremental)
       ↓
BFF outbox watcher (poll, watermark zambyl_outbox_id)
       ↓
SSE widget.invalidate → UI reloads affected routes only
```

## Pre-meeting scenario

```bash
npm run mock:start
npm run connectors:register && npm run connectors:bootstrap-sync
npm run migrate
npm run dev          # BFF :3001, watcher on by default
npm run dev:web      # UI :5173

# In another terminal:
npm run realtime:pre-meeting
```

Expected: email + CRM + support changes sync incrementally; outbox poll processes events; UI widgets refresh via SSE without manual reload.

## Latency (baseline)

Recorded in `realtime_latency_samples` when watcher runs. Query via `GET /api/realtime/latency`.

| Stage | Metric key |
|-------|------------|
| Outbox → BFF push | `outbox_to_bff_push` |
| Poll cycle | `poll_cycle` |

Document p50/p99 after integration runs with live Zambyl stack.

## Anti-patterns verified

- BFF/UI do **not** poll mock sources
- Single entity change does **not** trigger full search rebuild (Zambyl incremental projections)
- Browser does **not** call Zambyl API directly
- UI updates via SSE + targeted `reload()`, not `location.reload()`

## Exit criteria

- [x] BFF SSE push layer
- [x] Incremental invalidation (affected widgets/routes only)
- [x] Pre-meeting orchestration script
- [x] Matrix + latency documentation structure
- [x] Tests (unit; integration gated on `ZAMBYL_INTEGRATION=1`)

## Environment

| Variable | Default | Purpose |
|----------|---------|---------|
| `MEETINGIQ_REALTIME_POLL_MS` | `2000` | Outbox poll interval |
| `MEETINGIQ_REALTIME_WATCHER` | `1` | Set `0` to disable background watcher |
| `ZAMBYL_DATABASE_URL` | `postgres://zambyl:zambyl@localhost:5432/zambyl` | Outbox poll source |
