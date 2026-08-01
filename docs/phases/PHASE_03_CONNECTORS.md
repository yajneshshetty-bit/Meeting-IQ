# Phase 3 — Connectors

**Prerequisite:** Phase 2 complete. Zambyl v1.0.1 bootstrapped locally.

## Authority

Read and follow: [`../MEETINGIQ_PHASE1_IMPLEMENTATION.md`](../MEETINGIQ_PHASE1_IMPLEMENTATION.md) § Phase 3

## Tasks

1. Implement Zambyl connector plugin per mock service (Connector SDK)
2. Create registry bindings in `registries/`
3. Register connectors and connections against local Zambyl
4. Configure sync modes: batch, incremental, webhook-triggered where applicable
5. Verify ingestion pipeline:
   - Canonical entities populated
   - Outbox events emitted
   - Search projections indexed (`search_documents` > 0)
6. Test delta/incremental sync
7. Update [`../PLATFORM_USAGE_REPORT.md`](../PLATFORM_USAGE_REPORT.md) for each connector

## Exit Criteria

- [x] All mock sources ingested through Zambyl connectors only
- [x] Incremental sync verified
- [x] Search index populated after sync
- [x] No MeetingIQ code reads mock APIs directly

## Do Not

- Build BFF dashboard routes yet
- Modify Zambyl kernel — log gaps in [`../PLATFORM_GAP_LOG.md`](../PLATFORM_GAP_LOG.md)
