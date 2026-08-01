# MeetingIQ

**First production application on the [Zambyl Platform](https://github.com/yajneshshetty-bit/Zambyl) (v1.0.1).**

MeetingIQ validates that a real enterprise application can be built entirely on top of a frozen platform kernel — without modifying `zambyl-core/`.

## Status

**Phase 0 — Specification complete. Implementation not started.**

## Objective

> Can a real enterprise application be built entirely on top of a frozen Zambyl Platform?

MeetingIQ answers this by implementing a production Meeting Intelligence SaaS using only:

- Domain / Experience / Workflow / Trigger packages
- Profiles, Templates, Policies
- Connector plugins
- Registries, SDK, CLI

## Documentation

Start here: [`docs/MEETINGIQ_PHASE1_IMPLEMENTATION.md`](docs/MEETINGIQ_PHASE1_IMPLEMENTATION.md)

| Document | Purpose |
|----------|---------|
| [Master Implementation Spec](docs/MEETINGIQ_PHASE1_IMPLEMENTATION.md) | Authoritative PRD and phased roadmap |
| [Platform Usage Report](docs/PLATFORM_USAGE_REPORT.md) | Feature → platform capability traceability |
| [Platform Gap Log](docs/PLATFORM_GAP_LOG.md) | Platform limitations → v1.1 roadmap input |
| [Real-Time Correctness Matrix](docs/REALTIME_CORRECTNESS_MATRIX.md) | Event propagation verification |
| [Phase Prompts](docs/phases/) | Cursor-executable phase-by-phase prompts |

## Execution Model

**Do not implement in a single pass.** Execute phases 0–10 sequentially. Each phase validates platform usage before proceeding.

## Fresh Start

This repository is a clean implementation. Do not copy from prior local MeetingIQ prototypes.

## Platform

```
git@github.com:yajneshshetty-bit/Zambyl.git  (tag v1.0.1)
```

## License

Proprietary — All Rights Reserved.
