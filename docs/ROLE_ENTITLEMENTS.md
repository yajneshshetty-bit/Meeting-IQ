# MeetingIQ Role → Entitlement Mapping

**Phase:** 4  
**Enforcement:** MeetingIQ BFF (`apps/bff/src/auth/entitlements.js`)  
**Registry:** `registries/policy-bundles.json` (documented policy bundles)

---

## Mapping

| BFF Role | Policy Bundle | Entitlements | Data Scope |
|----------|---------------|--------------|------------|
| `ae` | `meetingiq.roles.sales-rep` | `meetingiq.read`, `meetingiq.execute` | Own territory |
| `manager` | `meetingiq.roles.manager` | + `meetingiq.team.read` | Direct reports |
| `se` | `meetingiq.roles.se` | + `meetingiq.se.read` | SE-attributed meetings |
| `leader` | `meetingiq.roles.vp` | + `meetingiq.executive.read` | Organization-wide |
| `admin` | `meetingiq.roles.admin` | + `meetingiq.admin` | Full access |
| `support` | `meetingiq.roles.support` | + `meetingiq.support.read` | Support cases (read-only) |

**Base entitlement:** All authenticated users receive `meetingiq.read`.

---

## Search Profile Access

| Profile | Required Entitlements |
|---------|----------------------|
| `meetingiq.agenda-v1` | `meetingiq.read` |
| `meetingiq.pipeline-v1` | `meetingiq.read` |
| `meetingiq.account-v1` | `meetingiq.read` |
| `meetingiq.voc-v1` | `meetingiq.read` |
| `meetingiq.executive-pipeline-v1` | `meetingiq.read`, `meetingiq.executive.read` |

---

## Analytics Profile Access

| Profile | Required Entitlements |
|---------|----------------------|
| `meetingiq.risk-scoring-v1` | `meetingiq.read` |
| `meetingiq.at-risk-v1` | `meetingiq.read` |
| `meetingiq.forecast-adjustment-v1` | `meetingiq.executive.read` |

---

## BFF → Zambyl Headers

Every BFF request to Zambyl includes:

```
x-api-key: test-harness-key
x-workload-id: meetingiq-bff
x-user-id: <resolved user_id>
x-entitlements: meetingiq.read,<role-specific entitlements>
```

See [`ENVIRONMENT.md`](./ENVIRONMENT.md) and MIQ-001 in [`MEETINGIQ_ARCHITECTURAL_DECISIONS.md`](./MEETINGIQ_ARCHITECTURAL_DECISIONS.md).
