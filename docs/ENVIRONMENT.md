# Environment Configuration

**Phase:** 0A complete → … → Phase 6 complete → **Phase 7 complete**

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

Configure on the **Zambyl gateway process** (not MeetingIQ BFF):

```bash
# In Zambyl zambyl-core/.env (or gateway environment)
OPENAI_API_KEY=sk-...
LLM_MODEL=gpt-4o-mini
LLM_BASE_URL=https://api.openai.com/v1   # optional
```

Then register MeetingIQ experiences:

```bash
cd /home/hp/Desktop/Meeting-IQ
npm run experiences:register
```

| Variable | Purpose | Where |
|----------|---------|-------|
| `OPENAI_API_KEY` | Primary LLM provider | Zambyl gateway env |
| `LLM_MODEL` | Model identifier (e.g. `gpt-4o-mini`) | Zambyl gateway env |
| `LLM_BASE_URL` | Optional custom endpoint | Zambyl gateway env |

MeetingIQ BFF does not call LLM directly. All AI flows through `POST /v1/experiences:execute` → `meetingiq-llm-standard` model class → OpenAI provider registered from `packages/model-provider/openai.js`.

---

### MeetingIQ BFF bootstrap

```bash
cd /home/hp/Desktop/Meeting-IQ
docker compose up -d          # Postgres on localhost:5434
npm install
npm run bootstrap             # migrate + seed dev users
npm run dev                   # BFF on :3001
npm test
```

Copy `apps/bff/.env.example` to `apps/bff/.env` if overriding defaults.

**Dev users:** `user_alex` (AE), `user_manager_1`, `user_leader_1`, `user_se_1`, `user_admin`, `user_support`, `user_priya`


---

## Mock Enterprise Services (Phase 2)

Each service runs independently with its own SQLite database. **MeetingIQ never calls them at runtime** — they are ingestion sources for Zambyl connectors (Phase 3).

| Service | Port | Phase |
|---------|------|-------|
| CRM Service | `4001` | 2 ✅ |
| Calendar Service | `4002` | 2 ✅ |
| Mail Service | `4003` | 2 ✅ |
| Slack Service | `4004` | 2 ✅ |
| Document Service | `4005` | 2 ✅ |
| Task Service | `4006` | 2 ✅ |
| Support Service | `4007` | 2 ✅ |
| ERP Service | `4008` | 2 ✅ |
| Identity Service | `4009` | 2 ✅ |
| Event Simulator | `4010` | 2 ✅ |

**Auth:** `x-api-key: mock-enterprise-key` (all services except simulator health)

```bash
npm run mock:start    # docker compose --profile mock up -d
npm run mock:test     # 11 integration tests
npm run mock:stop
```

Seed data source: `mock-services/seed/enterprise-manifest.js`

---

## MeetingIQ Connectors (Phase 3)

Connectors live in Meeting-IQ repo; registration writes to **Zambyl Postgres** (no kernel changes).

| Script | Purpose |
|--------|---------|
| `npm run connectors:register` | Register 9 plugins + connections + search profiles |
| `npm run connectors:bootstrap-sync` | `bootstrapPlatform` + batch sync all connections |
| `npm run connectors:sync` | HTTP admin sync (requires gateway restart after register) |
| `npm run connectors:test` | 31 unit/integration tests |

**Zambyl env (connectors):**

| Variable | Default | Purpose |
|----------|---------|---------|
| `ZAMBYL_DATABASE_URL` | `postgres://zambyl:zambyl@localhost:5432/zambyl` | Registry + ingestion DB |
| `ZAMBYL_API_URL` | `http://localhost:8080` | Admin sync HTTP |
| `ZAMBYL_ADMIN_KEY` | `dev-admin-key` | Admin sync auth |
| `ZAMBYL_ROOT` | `/home/hp/Desktop/Zambyl` | For `bootstrap-sync` script |
| `ZAMBYL_INTEGRATION` | — | Set `1` to run full ingestion integration test |

---

## MeetingIQ Domain (Phase 4)

| Script | Purpose |
|--------|---------|
| `npm run domain:register` | Register domain package + profiles + policies + templates |
| `npm run domain:test` | Domain registry and search integration tests |

Domain package: `meetingiq@1.0.0` on `stable` channel. Role mapping: [`docs/ROLE_ENTITLEMENTS.md`](./ROLE_ENTITLEMENTS.md)

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
