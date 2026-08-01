# Runbook — Bootstrap

**Purpose:** Fresh deploy from clone to usable MeetingIQ.  
**Target time:** &lt; 30 minutes

---

## Prerequisites

| Requirement | Check |
|-------------|-------|
| Node.js ≥ 20 | `node -v` |
| Docker + Compose | `docker compose version` |
| Zambyl v1.0.1 clone | `ZAMBYL_ROOT` points at repo with `zambyl-core/` |
| Ports free | 3001, 4001–4010, 5432, 5434, 8080, 8088 |

---

## Option A — Full stack (recommended)

```bash
git clone git@github.com:yajneshshetty-bit/Meeting-IQ.git
cd Meeting-IQ

git clone git@github.com:yajneshshetty-bit/Zambyl.git ../Zambyl
cd ../Zambyl && git checkout v1.0.1 && cd ../Meeting-IQ

export ZAMBYL_ROOT=$(pwd)/../Zambyl
# Optional: export OPENAI_API_KEY=sk-...

npm run stack:up
```

**Result:**

| Service | URL |
|---------|-----|
| UI | http://localhost:8088 |
| BFF | http://localhost:3001 |
| Zambyl | http://localhost:8080 |

Login: use role switcher in UI, or `x-meetingiq-user-id: user_alex` header.

---

## Option B — Local dev (no full Docker)

```bash
git clone git@github.com:yajneshshetty-bit/Meeting-IQ.git && cd Meeting-IQ
docker compose up -d                    # MeetingIQ Postgres :5434
npm install && npm run bootstrap

# Terminal 1 — Zambyl (separate repo)
cd $ZAMBYL_ROOT/zambyl-core && docker compose up -d
cd $ZAMBYL_ROOT && npm install && npm run bootstrap
npm run dev -w @zambyl/gateway            # :8080

# Terminal 2 — MeetingIQ
npm run mock:start
npm run connectors:register
npm run domain:register
npm run experiences:register
npm run connectors:bootstrap-sync
npm run dev                               # BFF :3001

# Terminal 3 — UI
npm run dev:web                           # :5173
```

---

## Verify bootstrap

```bash
curl http://localhost:3001/health
curl -H 'x-meetingiq-user-id: user_alex' http://localhost:3001/api/command-center/overview
curl -H 'x-meetingiq-user-id: user_alex' http://localhost:3001/api/observability/summary
npm run validation:suite
```

---

## Tear down

```bash
npm run stack:down
# or: docker compose down && docker compose --profile mock down
```
