# Platform Gap Log

> **Purpose:** Document capabilities that cannot be implemented through existing Zambyl extension points.  
> **Audience:** Zambyl platform team — inputs for v1.1 roadmap.  
> **Rule:** Do **not** patch the kernel. Log the gap here instead.

**Platform baseline:** Zambyl v1.0.1 (kernel frozen)  
**Validation date:** 2026-08-01 (Phase 9)

---

## Entry Rules

Every entry **must** contain all fields below. Incomplete entries are rejected.

| Field | Description |
|-------|-------------|
| **Feature** | MeetingIQ feature that exposed the gap |
| **Required capability** | What the feature needs from the platform |
| **Why extension points insufficient** | Specific packages, APIs, or registries tried and why they failed |
| **Proposed platform enhancement** | Minimal kernel or platform change for v1.1 |
| **Priority** | P0 (blocking) / P1 (major) / P2 (minor) / P3 (nice-to-have) |
| **Temporary workaround** | How MeetingIQ works around the gap without kernel changes |

---

## Gap Entries

_No gaps logged. Phase 9 validation confirms all Phase 1 PRD capabilities were implemented via extension points (Connectors, Domain, Experience, Search, Outbox/Projections, BFF application layer). See [PLATFORM_VALIDATION_REPORT.md](./PLATFORM_VALIDATION_REPORT.md) § Observations for documented workarounds that are not platform failures._

---

### Template (copy for new entries)

```markdown
### GAP-001: [Short title]

| Field | Value |
|-------|-------|
| **Feature** | |
| **Required capability** | |
| **Why extension points insufficient** | |
| **Proposed platform enhancement** | |
| **Priority** | P_ |
| **Temporary workaround** | |
| **Date logged** | YYYY-MM-DD |
| **Phase discovered** | |
```

---

## Gap Summary (Phase 9)

| Priority | Count |
|----------|-------|
| P0 | 0 |
| P1 | 0 |
| P2 | 0 |
| P3 | 0 |
| **Total** | **0** |

**Validation outcome:** Platform sufficiency confirmed. No kernel modifications required.

---

*This log becomes the roadmap input for Zambyl v1.1. MeetingIQ must never use gap log entries as justification for unauthorized kernel modifications.*
