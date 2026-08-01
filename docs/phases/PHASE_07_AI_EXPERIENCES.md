# Phase 7 — AI Experiences

**Prerequisite:** Phase 6 complete.

## Authority

Read and follow: [`../MEETINGIQ_PHASE1_IMPLEMENTATION.md`](../MEETINGIQ_PHASE1_IMPLEMENTATION.md) §§ Phase 7, 12

## LLM

Operator provides real LLM API key via environment variable. Configure in `docs/ENVIRONMENT.md`. Never commit keys.

## Tasks

Implement Experience Packages for each AI capability (§4.3):

- Pre-meeting brief
- Account / company research
- Voice of customer
- Executive summary
- Opportunity summary
- Risk analysis
- Next-best actions
- Follow-up drafting
- QBR narrative
- Forecast explanation
- Meeting quality assessment

Wire BFF to invoke `POST /v1/experiences:execute` for each.

## Exit Criteria

- [ ] All AI features return real LLM output
- [ ] All execute through Zambyl (not direct UI → LLM)
- [ ] Citations/lineage where applicable
- [ ] [`../PLATFORM_USAGE_REPORT.md`](../PLATFORM_USAGE_REPORT.md) updated

## Do Not

- Hardcode AI responses
- Bypass Zambyl experience runtime
