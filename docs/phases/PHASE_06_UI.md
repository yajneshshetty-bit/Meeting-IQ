# Phase 6 — MeetingIQ UI

**Prerequisite:** Phase 5 complete.

## Authority

Read and follow: [`../MEETINGIQ_PHASE1_IMPLEMENTATION.md`](../MEETINGIQ_PHASE1_IMPLEMENTATION.md) §§ Phase 6, 4

## PRD

UI screenshots are the Phase 1 PRD. Every visible capability must exist. Layout may improve; capability coverage may not regress.

## Tasks

1. Command Center — implement all capabilities from master spec §4.1
2. Executive View — implement all capabilities from master spec §4.2
3. Role-aware rendering (different users see different data)
4. Widget configuration UI
5. Search, filters, grouping
6. Freshness indicators on all data surfaces
7. PRD traceability: map each screenshot capability → UI component → BFF route → test

## Exit Criteria

- [x] Every PRD capability has working UI path
- [x] No placeholder buttons or stub data
- [x] UI calls BFF only (never Zambyl)
- [x] Role switching demonstrates different views

## Do Not

- Hardcode data in UI
- Skip capabilities because layout differs from screenshot
