# MeetingIQ

**First production application on the [Zambyl Platform](https://github.com/yajneshshetty-bit/Zambyl) (v1.0.1).**

MeetingIQ validates that a real enterprise application can be built entirely on top of a frozen platform kernel — without modifying `zambyl-core/`.

## Status

**Phase 0A — Complete.** Proceeding to Phase 0B (Domain Modeling).

| Phase | Status |
|-------|--------|
| 0A Zambyl Readiness Audit | ✅ Complete |
| 0B Domain Modeling | ✅ Complete — [domain model](./docs/DOMAIN_MODEL.md) |
| 1 Foundation | 🔜 Next |
| 2–10 Implementation | Pending |

## Overarching Success

> Success is not that MeetingIQ works. Success is that another team could build BankingIQ using the same extension model without kernel changes.

## Documentation

Start here: [`docs/MEETINGIQ_PHASE1_IMPLEMENTATION.md`](docs/MEETINGIQ_PHASE1_IMPLEMENTATION.md)

| Document | Purpose |
|----------|---------|
| [Master Implementation Spec](docs/MEETINGIQ_PHASE1_IMPLEMENTATION.md) | Authoritative PRD and phased roadmap |
| [Architectural Decisions](docs/MEETINGIQ_ARCHITECTURAL_DECISIONS.md) | Application ADRs (MIQ-NNN) |
| [Entity Lifecycle](docs/ENTITY_LIFECYCLE.md) | Per-entity create/update/invalidate paths |
| [Platform Usage Report](docs/PLATFORM_USAGE_REPORT.md) | Which platform capability validated each feature |
| [Platform Gap Log](docs/PLATFORM_GAP_LOG.md) | Platform limitations → v1.1 roadmap |
| [Real-Time Correctness Matrix](docs/REALTIME_CORRECTNESS_MATRIX.md) | Event propagation verification |
| [Phase Prompts](docs/phases/) | Cursor-executable phase-by-phase prompts |

## Execution Model

**Do not implement in a single pass.**

```
Phase 0A → Zambyl Readiness Audit (no code)
Phase 0B → Domain Modeling (no code)
Phase 1–10 → Implementation
```

## Fresh Start

This repository is a clean implementation. Do not copy from prior local MeetingIQ prototypes.

## Platform

```
git@github.com:yajneshshetty-bit/Zambyl.git  (tag v1.0.1)
```

## License

Proprietary — All Rights Reserved.
