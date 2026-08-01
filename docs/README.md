# MeetingIQ Documentation

MeetingIQ Phase 1 is the **first production application** built on the frozen [Zambyl Platform](https://github.com/yajneshshetty-bit/Zambyl) (v1.0.1).

## Authoritative Documents

| Document | Purpose |
|----------|---------|
| [MEETINGIQ_PHASE1_IMPLEMENTATION.md](./MEETINGIQ_PHASE1_IMPLEMENTATION.md) | Master PRD, architecture contract, and phased implementation roadmap |
| [MEETINGIQ_ARCHITECTURAL_DECISIONS.md](./MEETINGIQ_ARCHITECTURAL_DECISIONS.md) | Application ADRs (MIQ-NNN) — record decisions, not commit messages |
| [DOMAIN_MODEL.md](./DOMAIN_MODEL.md) | Entity definitions, ERD, Zambyl + source mappings (Phase 0B) |
| [ENTITY_LIFECYCLE.md](./ENTITY_LIFECYCLE.md) | Per-entity lifecycle — investigate here when updates fail |
| [PRD Screenshots](./prd/) | Phase 1 UI requirement reference images |
| [PLATFORM_USAGE_REPORT.md](./PLATFORM_USAGE_REPORT.md) | Every feature → which platform capability validated it |
| [PLATFORM_GAP_LOG.md](./PLATFORM_GAP_LOG.md) | Platform limitations → v1.1 roadmap input |
| [REALTIME_CORRECTNESS_MATRIX.md](./REALTIME_CORRECTNESS_MATRIX.md) | Expected propagation path per source event |
| [ZAMBYL_READINESS_AUDIT.md](./ZAMBYL_READINESS_AUDIT.md) | Phase 0A — platform readiness verdict (✅ READY) |
| [ENVIRONMENT.md](./ENVIRONMENT.md) | Local dev topology, ports, env vars |
| [Phase 0A Completion](./phases/PHASE_00A_COMPLETION.md) | Phase 0A exit criteria record |
| [Phase 1 Completion](./phases/PHASE_01_COMPLETION.md) | Phase 1 exit criteria record |
| [Phase 2 Completion](./phases/PHASE_02_COMPLETION.md) | Phase 2 mock enterprise exit criteria record |

## Execution Model

**Do not implement Phase 1 in a single pass.**

Execute phases sequentially. Each phase prompt lives in [`phases/`](./phases/) and references the master specification.

```
Phase 0A → Zambyl Readiness Audit ✅ Complete
Phase 0B → Domain Modeling ✅ Complete
Phase 1  → Foundation ✅ Complete
Phase 2  → Mock Enterprise Systems ✅ Complete
Phase 3  → Connectors (next)
Phase 4  → MeetingIQ Domain Packages
Phase 5  → MeetingIQ Backend (BFF)
Phase 6  → MeetingIQ UI
Phase 7  → AI Experiences
Phase 8  → Real-time Runtime
Phase 9  → Validation
Phase 10 → Production Readiness
```

## Overarching Success Criterion

> Success is not that MeetingIQ works. Success is that another team could build BankingIQ using the same extension model without kernel changes.

## Fresh Start Policy

This repository starts **empty**. Do **not** copy code from `MEETING-IQ(JULY 30)` or any local prototype.

## Platform Repository

```
git@github.com:yajneshshetty-bit/Zambyl.git  (tag v1.0.1, kernel frozen)
```

MeetingIQ must not modify `zambyl-core/`.
