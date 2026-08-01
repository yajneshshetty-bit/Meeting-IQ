# Phase 8 — Real-Time Runtime

**Prerequisite:** Phase 7 complete.

## Authority

Read and follow:
- [`../MEETINGIQ_PHASE1_IMPLEMENTATION.md`](../MEETINGIQ_PHASE1_IMPLEMENTATION.md) §§ Phase 8, 10
- [`../REALTIME_CORRECTNESS_MATRIX.md`](../REALTIME_CORRECTNESS_MATRIX.md)

## Tasks

1. Wire event simulator → connector sync → projection → materialization pipeline
2. Implement incremental materialization refresh (affected entities only)
3. Implement BFF push layer (SSE or WebSocket to UI)
4. Update affected widgets only — no full page reload
5. Verify every row in REALTIME_CORRECTNESS_MATRIX
6. Run pre-meeting scenario acceptance test (§ Pre-Meeting Scenario)
7. Document latency measurements (p50/p99)

## Exit Criteria

- [ ] All matrix rows verified (checkboxes checked)
- [ ] Pre-meeting scenario passes end-to-end
- [ ] No full rebuild on single entity change
- [ ] Anti-patterns checklist clear

## Do Not

- Poll mock sources from BFF or UI
- Rebuild entire search index on every event
