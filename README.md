# MeetingIQ

**First production application on the [Zambyl Platform](https://github.com/yajneshshetty-bit/Zambyl) (v1.0.1).**

## Status

| Phase | Status |
|-------|--------|
| 0A Zambyl Readiness | ✅ |
| 0B Domain Modeling | ✅ |
| 1 Foundation (BFF + identity) | ✅ |
| 2 Mock Enterprise | 🔜 Next |

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
