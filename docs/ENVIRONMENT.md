# Environment Configuration

> Local development topology for MeetingIQ Phase 1.  
> **Phase:** 0A — no application services running yet.

---

## Repository Layout

| Repository | Path (local) | Remote | Tag |
|------------|--------------|--------|-----|
| Zambyl Platform | `/home/hp/Desktop/Zambyl` | `git@github.com:yajneshshetty-bit/Zambyl.git` | `v1.0.1` |
| MeetingIQ | `/home/hp/Desktop/Meeting-IQ` | `git@github.com:yajneshshetty-bit/Meeting-IQ.git` | — |

**Rule:** Do not modify `zambyl-core/`. MeetingIQ extends via packages, connectors, and registries.

---

## Zambyl Platform

### Prerequisites

- Node.js ≥ 20
- Docker + Docker Compose
- PostgreSQL 16 (via Zambyl docker-compose)

### Bootstrap

```bash
cd /home/hp/Desktop/Zambyl
npm install
cd zambyl-core && cp .env.example .env && docker compose up -d && cd ..
npm run bootstrap   # migrate + seed
npm test            # 37 kernel + 12 platform = 49 tests
```

### Zambyl Environment Variables

From `zambyl-core/.env.example` (copy to `zambyl-core/.env` — never commit):

| Variable | Default | Purpose |
|----------|---------|---------|
| `DATABASE_URL` | `postgres://zambyl:zambyl@localhost:5432/zambyl` | Postgres connection |
| `GATEWAY_PORT` | `8080` | Gateway HTTP port |
| `GATEWAY_HOST` | `0.0.0.0` | Gateway bind address |
| `ZAMBYL_SIGNING_SECRET` | dev placeholder | Package signing |
| `ZAMBYL_FLEET_SIGNING_SECRET` | dev placeholder | Fleet artifact signing |
| `TEST_HARNESS_API_KEY` | `test-harness-key` | BFF → Zambyl API key (dev) |
| `ZAMBYL_ADMIN_KEY` | `dev-admin-key` | Admin API operations |

### Zambyl Gateway (MeetingIQ BFF target)

```
http://localhost:8080
```

BFF authentication headers (dev):

```
x-api-key: test-harness-key
x-workload-id: meetingiq-bff
x-user-id: <resolved from MeetingIQ session>
x-entitlements: meetingiq.read,<role-specific entitlements>
```

---

## LLM Configuration (Phase 7+)

Operator provides real LLM credentials. **Never commit keys.**

| Variable | Purpose | Phase |
|----------|---------|-------|
| `OPENAI_API_KEY` | Primary LLM provider (placeholder name — confirm provider in Phase 7) | 7 |
| `LLM_MODEL` | Model identifier (e.g. `gpt-4o`) | 7 |
| `LLM_BASE_URL` | Optional custom endpoint | 7 |

MeetingIQ BFF does not call LLM directly. All AI flows through `POST /v1/experiences:execute`.

Configure model provider via Zambyl registry binding (`model_catalog` / capability provider).

---

## MeetingIQ Services (planned — Phase 1+)

| Service | Port | Phase |
|---------|------|-------|
| MeetingIQ BFF | `3001` | 1 |
| MeetingIQ UI | `3000` | 6 |
| MeetingIQ DB (Postgres) | `5433` | 1 |

---

## Mock Enterprise Services (planned — Phase 2)

Each service runs independently with its own database.

| Service | Port | Phase |
|---------|------|-------|
| CRM Service | `4001` | 2 |
| Calendar Service | `4002` | 2 |
| Mail Service | `4003` | 2 |
| Slack Service | `4004` | 2 |
| Document Service | `4005` | 2 |
| Task Service | `4006` | 2 |
| Support Service | `4007` | 2 |
| ERP Service | `4008` | 2 |
| Identity Service | `4009` | 2 |
| Event Simulator | `4010` | 2 |

Mock services are **ingestion sources only**. MeetingIQ never calls them directly.

---

## Docker Compose (planned — Phase 10)

Full-stack `docker-compose.yml` will orchestrate:

- Zambyl Postgres + Gateway
- Mock enterprise services
- MeetingIQ BFF + UI + DB
- Event simulator

---

## Verification Commands

```bash
# Zambyl health
curl http://localhost:8080/health

# Zambyl catalog
curl http://localhost:8080/v1/platform/catalog

# MeetingIQ (Phase 1+)
curl http://localhost:3001/health
```

---

*Updated: Phase 0A — 2026-08-01*
