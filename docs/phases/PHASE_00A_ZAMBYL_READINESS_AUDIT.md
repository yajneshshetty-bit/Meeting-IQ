# Phase 0A — Zambyl Readiness Audit

**Execute this phase only.** No application code.

**Prerequisite:** None (first phase)

## Authority

Read and follow: [`../MEETINGIQ_PHASE1_IMPLEMENTATION.md`](../MEETINGIQ_PHASE1_IMPLEMENTATION.md) § Phase 0A

## Context

MeetingIQ validates the frozen Zambyl Platform (v1.0.1). Before any MeetingIQ code, confirm the platform can support Phase 1 requirements.

## Tasks

1. Clone and bootstrap Zambyl locally:
   ```bash
   npm install && npm run bootstrap && npm test
   ```
   Confirm **49/49** tests pass.

2. Read Zambyl documentation:
   - Developer Guide, Connector Guide, Package Author Guide
   - Kernel Freeze, Maintenance Mode policies

3. Produce **`docs/ZAMBYL_READINESS_AUDIT.md`** answering:

   | Question | Document in audit |
   |----------|-------------------|
   | Does Zambyl expose every API MeetingIQ needs? | Map each PRD capability → API family |
   | Which Experience Packages will exist? | List with purpose |
   | Which Domain Packages? | MeetingIQ domain scope |
   | Which Registry bindings? | Connectors, projections, policies, capabilities |
   | Which Connectors? | One per mock source (Phase 2) |
   | Which Policies? | Role → entitlement mapping plan |
   | Which Profiles? | Data, search, analytics profiles |
   | Known gaps? | Pre-populate PLATFORM_GAP_LOG if found |

4. Record accepted decisions in [`../MEETINGIQ_ARCHITECTURAL_DECISIONS.md`](../MEETINGIQ_ARCHITECTURAL_DECISIONS.md)

5. Create `docs/ENVIRONMENT.md` (Zambyl path, Postgres, LLM env var placeholders, port plan)

## Exit Criteria

- [ ] Zambyl bootstrap verified (49/49)
- [ ] `ZAMBYL_READINESS_AUDIT.md` complete
- [ ] No kernel modifications
- [ ] MIQ-001, MIQ-002, MIQ-003 recorded (or updated)

## Deliverables

- `docs/ZAMBYL_READINESS_AUDIT.md`
- `docs/ENVIRONMENT.md`
- Updated `MEETINGIQ_ARCHITECTURAL_DECISIONS.md` if new decisions made

## Do Not

- Scaffold MeetingIQ application code
- Define domain entities yet (Phase 0B)
- Copy from local MeetingIQ prototypes

## Next Phase

→ [PHASE_00B_DOMAIN_MODELING.md](./PHASE_00B_DOMAIN_MODELING.md)
