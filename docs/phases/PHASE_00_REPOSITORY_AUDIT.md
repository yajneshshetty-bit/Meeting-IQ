# Phase 0 — Repository Audit & Platform Readiness

**Execute this phase only.** Do not implement features yet.

## Authority

Read and follow: [`../MEETINGIQ_PHASE1_IMPLEMENTATION.md`](../MEETINGIQ_PHASE1_IMPLEMENTATION.md) § Phase 0

## Context

- MeetingIQ is the **first production application** validating the frozen Zambyl Platform (v1.0.1)
- This repo starts **fresh** — do not copy from `MEETING-IQ(JULY 30)` or any local prototype
- Platform repo: `git@github.com:yajneshshetty-bit/Zambyl.git`

## Tasks

1. Clone/bootstrap Zambyl locally (`npm install`, `npm run bootstrap`, `npm test`) — confirm 49/49 pass
2. Read Zambyl Developer Guide, Connector Guide, Package Author Guide, Kernel Freeze policy
3. Define MeetingIQ repo directory structure (document only — minimal scaffold OK):
   ```
   meeting-iq/
   ├── apps/ui/
   ├── apps/bff/
   ├── packages/          # Experience, domain, workflow packages
   ├── connectors/        # Zambyl connector plugins
   ├── registries/        # Platform registry bindings
   ├── mock-services/     # Independent enterprise mock APIs
   ├── docs/
   └── docker-compose.yml # (stub for later phases)
   ```
4. Create `docs/ENVIRONMENT.md` documenting:
   - Zambyl location and version (v1.0.1 tag)
   - Postgres requirements
   - LLM API key env vars (placeholder — operator will supply real key)
   - Port allocation plan for mock services

## Exit Criteria

- [ ] Zambyl bootstrap verified
- [ ] Repo structure documented
- [ ] `docs/ENVIRONMENT.md` created
- [ ] No prototype code copied

## Deliverables

- `docs/ENVIRONMENT.md`
- Updated repo README with project purpose and phase roadmap

## Do Not

- Build mock services, connectors, UI, or BFF business logic
- Modify Zambyl kernel
- Copy from local MeetingIQ prototypes
