# MeetingIQ Documentation

MeetingIQ Phase 1 is the **first production application** built on the frozen [Zambyl Platform](https://github.com/yajneshshetty-bit/Zambyl) (v1.0.1).

## Authoritative Documents

| Document | Purpose |
|----------|---------|
| [MEETINGIQ_PHASE1_IMPLEMENTATION.md](./MEETINGIQ_PHASE1_IMPLEMENTATION.md) | Master PRD, architecture contract, and phased implementation roadmap |
| [PLATFORM_USAGE_REPORT.md](./PLATFORM_USAGE_REPORT.md) | Traceability — every feature → platform capability used |
| [PLATFORM_GAP_LOG.md](./PLATFORM_GAP_LOG.md) | Platform limitations and proposed v1.1 enhancements |
| [REALTIME_CORRECTNESS_MATRIX.md](./REALTIME_CORRECTNESS_MATRIX.md) | Expected propagation path per source event |

## Execution Model

**Do not implement Phase 1 in a single pass.**

Execute phases sequentially. Each phase prompt lives in [`phases/`](./phases/) and references the master specification.

```
Phase 0  → Repository Audit & Platform Readiness
Phase 1  → Foundation
Phase 2  → Mock Enterprise Systems
Phase 3  → Connectors
Phase 4  → MeetingIQ Domain Packages
Phase 5  → MeetingIQ Backend (BFF)
Phase 6  → MeetingIQ UI
Phase 7  → AI Experiences
Phase 8  → Real-time Runtime
Phase 9  → Validation
Phase 10 → Production Readiness
```

## Fresh Start Policy

This repository starts **empty**. Do **not** copy code, configuration, or architecture from:

- `MEETING-IQ(JULY 30)` or any other local prototype
- Any prior MeetingIQ mock or demo implementation

Prior work may inform **requirements only** (e.g. UI capability lists). All implementation is new.

## Platform Repository

```
git@github.com:yajneshshetty-bit/Zambyl.git  (tag v1.0.1, kernel frozen)
```

MeetingIQ must not modify `zambyl-core/`.
