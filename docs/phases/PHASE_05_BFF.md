# Phase 5 — MeetingIQ Backend (BFF)

**Prerequisite:** Phase 4 complete.

## Authority

Read and follow: [`../MEETINGIQ_PHASE1_IMPLEMENTATION.md`](../MEETINGIQ_PHASE1_IMPLEMENTATION.md) § Phase 5

## Tasks

1. Implement BFF API routes for Command Center data (query Zambyl Search + materializations)
2. Implement BFF API routes for Executive View data (rollups, hierarchy-aware)
3. Enforce authorization server-side using role/hierarchy/territory model
4. Add freshness metadata to every response (last_synced, pending, confidence)
5. Widget configuration CRUD API
6. Log every endpoint in [`../PLATFORM_USAGE_REPORT.md`](../PLATFORM_USAGE_REPORT.md)

## Exit Criteria

- [x] BFF returns real Zambyl data (verify no mock source imports in BFF)
- [x] Sales Rep sees only scoped data
- [x] VP sees org rollups
- [x] Admin sees all; Support sees diagnostics only

## Do Not

- Build UI yet
- Call mock sources from BFF
