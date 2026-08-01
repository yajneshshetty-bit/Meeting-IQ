# Security Review — MeetingIQ Phase 10

**Date:** 2026-08-01  
**Scope:** MeetingIQ BFF, Web UI, deployment manifests, secrets handling  
**Platform:** Zambyl v1.0.1 (kernel frozen — not in scope for modification)

---

## Summary

| Area | Status | Notes |
|------|--------|-------|
| BFF boundary | ✅ Pass | Browser never calls Zambyl directly |
| Secrets in repo | ✅ Pass | No committed API keys; `.env.example` only |
| Auth model | ⚠️ Dev | Header-based dev auth; production needs SSO |
| CORS | ✅ Pass | Configurable via `MEETINGIQ_CORS_ORIGINS` |
| SQL injection | ✅ Pass | Parameterized queries throughout BFF |
| LLM keys | ✅ Pass | `OPENAI_API_KEY` on Zambyl gateway only |
| Admin API | ⚠️ Dev | `ZAMBYL_ADMIN_KEY=dev-admin-key` — rotate in prod |
| Docker secrets | ⚠️ Dev | Compose uses dev defaults; use secrets manager in prod |

**Verdict:** Ready for **operator review** in dev/staging. Production deployment requires SSO, secret rotation, and TLS termination (Phase 10 documents gaps; no new features added).

---

## 1. BFF Boundary (MIQ-001)

**Requirement:** Browser → MeetingIQ BFF → Zambyl. No direct platform access from client.

**Verification:**

- `apps/web/` contains no `ZAMBYL_*` URLs or API keys
- Vite dev proxy and nginx production config proxy `/api` to BFF only
- Zambyl client isolated in `apps/bff/src/zambyl/client.js`

**Risk:** Low. Architecture enforced by code structure.

---

## 2. Authentication & Authorization

**Current (Phase 1 dev):**

- `x-meetingiq-user-id` header selects user from MeetingIQ Postgres
- `services/scope.js` enforces hierarchy (AE / manager / leader / support)
- Entitlements mapped to Zambyl `x-entitlements` header

**Production gaps:**

| Gap | Recommendation |
|-----|----------------|
| No session/JWT | Integrate OIDC (Okta, Azure AD) at BFF |
| Header spoofing | Replace header auth with signed session cookie |
| No rate limiting | Add reverse-proxy rate limits |

**Risk:** Medium in production without SSO. Acceptable for dev/demo.

---

## 3. Secrets Management

| Secret | Location | Committed? |
|--------|----------|------------|
| `ZAMBYL_API_KEY` | BFF env | No — `.env.example` only |
| `ZAMBYL_ADMIN_KEY` | Host/scripts env | No |
| `OPENAI_API_KEY` | Zambyl gateway env | No |
| Postgres passwords | docker-compose | Dev defaults documented |

**Recommendations for production:**

- Docker secrets or vault injection
- Never use `dev-admin-key` / `test-harness-key` outside dev
- Rotate keys on deploy

---

## 4. Network & Transport

**Dev stack:** HTTP on localhost.

**Production requirements:**

- TLS at ingress (nginx / load balancer)
- Internal network for BFF ↔ Zambyl ↔ Postgres
- Do not expose Zambyl gateway or Postgres publicly

---

## 5. Data Access

- BFF reads Zambyl canonical store with scoped queries
- `filterEntities()` applied before returning data
- Support role restricted to support endpoints (`forbidSupport()`)
- Executive routes require leader entitlements

**Risk:** Low — scope enforced at BFF layer.

---

## 6. Real-time (SSE)

- `GET /api/events/stream` requires auth header (fetch stream, not EventSource)
- Support role forbidden
- No sensitive data in SSE payload — widget invalidation keys only

---

## 7. Docker & Supply Chain

- Base images: `node:20-alpine`, `nginx:1.27-alpine`, `postgres:16`
- Zambyl gateway built from tagged v1.0.1 source — no kernel patches
- Run `npm audit` periodically; pin image digests in production

---

## 8. Checklist for Operator Sign-Off

- [ ] SSO integrated at BFF
- [ ] Secrets in vault / K8s secrets
- [ ] TLS enabled on public endpoints
- [ ] Zambyl admin key rotated
- [ ] Postgres not exposed to internet
- [ ] CORS restricted to production UI origin
- [ ] Log aggregation configured (BFF Fastify logger → stdout)
- [ ] Backup strategy for MeetingIQ + Zambyl Postgres

---

*This review covers Phase 10 hardening documentation. Production SSO/TLS are operator responsibilities documented here, not implemented in Phase 1 scope.*
