/** Role → Zambyl entitlement mapping for MeetingIQ BFF */

const BASE = ['meetingiq.read'];

const ROLE_ENTITLEMENTS = {
  ae: [...BASE, 'meetingiq.execute'],
  manager: [...BASE, 'meetingiq.execute', 'meetingiq.team.read'],
  se: [...BASE, 'meetingiq.execute', 'meetingiq.se.read'],
  leader: [...BASE, 'meetingiq.execute', 'meetingiq.executive.read'],
  admin: [...BASE, 'meetingiq.execute', 'meetingiq.admin'],
  support: [...BASE, 'meetingiq.support.read'],
};

export function entitlementsForRole(role) {
  return ROLE_ENTITLEMENTS[role] || BASE;
}

export function entitlementsHeader(entitlements) {
  return entitlements.join(',');
}
