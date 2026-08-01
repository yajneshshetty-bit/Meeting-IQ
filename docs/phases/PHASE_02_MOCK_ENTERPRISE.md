# Phase 2 — Mock Enterprise Systems

**Prerequisite:** Phase 1 complete.

## Authority

Read and follow: [`../MEETINGIQ_PHASE1_IMPLEMENTATION.md`](../MEETINGIQ_PHASE1_IMPLEMENTATION.md) §§ Phase 2, 9

## Tasks

Build **independent** mock enterprise services under `mock-services/`:

| Service | Key entities |
|---------|--------------|
| CRM | Accounts, opportunities, contacts, pipeline stages |
| Calendar | Meetings, attendees, schedules |
| Mail | Email threads, messages |
| Slack | Channels, messages, escalations |
| Documents | Contracts, proposals, file metadata |
| Tasks | Tasks, assignments, due dates |
| Support | Tickets, cases, priorities |
| ERP | Billing, renewals, orders |
| Identity | Users, org hierarchy, territories |

Each service must have:

- Own database (separate schema or DB)
- REST API with OpenAPI spec
- Webhook or event stream endpoint
- Pagination, filtering, delta/change tokens
- Authentication and rate limiting
- Independent latency/failure simulation

Additionally:

- Seed realistic interconnected enterprise data (not lorem ipsum)
- Event simulator that produces scheduled, randomized, and **correlated** events

## Exit Criteria

- [x] All 9 services run independently via docker-compose
- [x] OpenAPI docs for each service
- [x] Event simulator running
- [x] Zero dependencies on Zambyl or MeetingIQ

## Do Not

- Build a monolithic mock CRM
- Connect to Zambyl yet
- Build MeetingIQ UI or BFF business routes
