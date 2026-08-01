# MeetingIQ

**First production application on the [Zambyl Platform](https://github.com/yajneshshetty-bit/Zambyl) (v1.0.1).**

## Status

| Phase | Status |
|-------|--------|
| 0A Zambyl Readiness | ✅ |
| 0B Domain Modeling | ✅ |
| 1 Foundation (BFF + identity) | ✅ |
| 2 Mock Enterprise | ✅ |
| 3 Connectors | ✅ |
| 4 Domain Packages | ✅ |
| 5 BFF Business Routes | 🔜 Next |

## Quick Start (Phase 1)

**Prerequisites:** Node.js ≥ 20, Docker, Zambyl v1.0.1 running (optional for connectivity test)

```bash
# MeetingIQ
git clone git@github.com:yajneshshetty-bit/Meeting-IQ.git
cd Meeting-IQ
docker compose up -d
npm install
npm run bootstrap
npm test
npm run dev
```

BFF: http://localhost:3001

```bash
curl http://localhost:3001/health
curl -H 'x-meetingiq-user-id: user_alex' http://localhost:3001/api/me
curl -H 'x-meetingiq-user-id: user_alex' http://localhost:3001/api/platform/zambyl
```

### Mock Enterprise (Phase 2)

```bash
npm run mock:test                 # 11 tests, no Docker required
npm run mock:start                # ports 4001–4010 via Docker
curl -H 'x-api-key: mock-enterprise-key' http://localhost:4001/v1/opportunities
curl -X POST http://localhost:4010/v1/scenarios/pre_meeting/run
```

### Connectors (Phase 3)

```bash
npm run mock:start                      # mock sources :4001–4009
npm run connectors:register             # register in Zambyl Postgres
npm run connectors:bootstrap-sync         # ingest all mock data
npm run connectors:test                   # 31 connector tests
```

### Domain Packages (Phase 4)

```bash
npm run domain:register                 # register profiles, policies, templates, activate domain
npm run domain:test                       # 7 tests
```

**Zambyl** (separate repo — start gateway on :8080 for full connectivity):

```bash
cd /path/to/Zambyl/zambyl-core
docker compose up -d
cd .. && npm run bootstrap && npm run dev -w @zambyl/gateway
```

## Documentation

[`docs/MEETINGIQ_PHASE1_IMPLEMENTATION.md`](docs/MEETINGIQ_PHASE1_IMPLEMENTATION.md) — master specification

[`docs/ENVIRONMENT.md`](docs/ENVIRONMENT.md) — ports, env vars, topology

## License

Proprietary — All Rights Reserved.
