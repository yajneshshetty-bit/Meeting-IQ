# MeetingIQ

**First production application on the [Zambyl Platform](https://github.com/yajneshshetty-bit/Zambyl) (v1.0.1).**

Phase 1 is **complete** — validated platform extension model with zero kernel modifications.

## Status

| Phase | Status |
|-------|--------|
| 0A–9 | ✅ Complete |
| 10 Production Readiness | ✅ |

## Quick Start (< 30 min)

**Prerequisites:** Node.js ≥ 20, Docker, [Zambyl v1.0.1](https://github.com/yajneshshetty-bit/Zambyl) cloned alongside Meeting-IQ

```bash
git clone git@github.com:yajneshshetty-bit/Meeting-IQ.git
cd Meeting-IQ

# Clone Zambyl at v1.0.1 (sibling directory)
git clone git@github.com:yajneshshetty-bit/Zambyl.git ../Zambyl
cd ../Zambyl && git checkout v1.0.1 && cd ../Meeting-IQ

export ZAMBYL_ROOT=$(pwd)/../Zambyl
npm run stack:up
```

| Service | URL |
|---------|-----|
| **UI** | http://localhost:8088 |
| BFF | http://localhost:3001 |
| Zambyl | http://localhost:8080 |

Use the role switcher in the UI (AE / Manager / Leader). Dev user: `user_alex`.

```bash
curl http://localhost:3001/health
curl -H 'x-meetingiq-user-id: user_alex' http://localhost:3001/api/command-center/overview
npm run validation:suite
```

Tear down: `npm run stack:down`

---

## Local Development (without full Docker)

```bash
docker compose up -d              # MeetingIQ Postgres :5434
npm install && npm run bootstrap
npm run mock:start                # mock sources :4001–4010
npm run dev                       # BFF :3001
npm run dev:web                   # UI :5173
```

With Zambyl gateway on :8080:

```bash
npm run connectors:register && npm run domain:register
npm run experiences:register
npm run connectors:bootstrap-sync
```

---

## Key Commands

| Command | Purpose |
|---------|---------|
| `npm run stack:up` | Full Docker stack + register + sync |
| `npm run stack:down` | Stop full stack |
| `npm run validation:suite` | All test suites |
| `npm run realtime:pre-meeting` | Real-time acceptance scenario |
| `npm run load:baseline` | BFF load p50/p99 (BFF must be up) |

---

## Documentation

| Document | Purpose |
|----------|---------|
| [`docs/MEETINGIQ_PHASE1_IMPLEMENTATION.md`](docs/MEETINGIQ_PHASE1_IMPLEMENTATION.md) | Master specification |
| [`docs/ENVIRONMENT.md`](docs/ENVIRONMENT.md) | Ports, env vars, topology |
| [`docs/runbooks/BOOTSTRAP.md`](docs/runbooks/BOOTSTRAP.md) | Deploy runbook |
| [`docs/SECURITY_REVIEW.md`](docs/SECURITY_REVIEW.md) | Security review for operators |
| [`docs/PLATFORM_VALIDATION_REPORT.md`](docs/PLATFORM_VALIDATION_REPORT.md) | Platform validation conclusion |

---

## License

Proprietary — All Rights Reserved.
