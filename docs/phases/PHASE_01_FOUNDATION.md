# Phase 1 — Foundation

**Prerequisite:** Phase 0 complete.

## Authority

Read and follow: [`../MEETINGIQ_PHASE1_IMPLEMENTATION.md`](../MEETINGIQ_PHASE1_IMPLEMENTATION.md) § Phase 1

## Tasks

1. Scaffold MeetingIQ project structure per Phase 0 plan
2. Implement MeetingIQ BFF skeleton:
   - Health endpoint
   - Zambyl connectivity test (calls platform catalog or health)
   - Environment config for Zambyl API URL and credentials
3. Design and migrate enterprise user model:
   - Users, roles, organizations, regions, business units, teams, territories, hierarchy
4. Auth middleware skeleton — extracts user context, prepares entitlements for Zambyl calls
5. MeetingIQ CI skeleton (lint + test placeholder)
6. Root README with quick-start outline

## Exit Criteria

- [ ] BFF starts and connects to Zambyl
- [ ] User model schema migrated
- [ ] Auth middleware attaches role/hierarchy context to requests
- [ ] No mock services or UI yet

## Deliverables

- `apps/bff/` with working skeleton
- Database migrations for user model
- `docs/ENVIRONMENT.md` updated with BFF config

## Do Not

- Query mock sources
- Build dashboards
- Modify Zambyl kernel
