const USER_STORAGE_KEY = 'meetingiq-user-id';

export function getStoredUserId() {
  return localStorage.getItem(USER_STORAGE_KEY) || 'user_alex';
}

export function setStoredUserId(userId) {
  localStorage.setItem(USER_STORAGE_KEY, userId);
}

export async function bffFetch(path, { userId, method = 'GET', body } = {}) {
  const headers = { 'x-meetingiq-user-id': userId || getStoredUserId() };
  if (body) headers['content-type'] = 'application/json';

  const res = await fetch(path, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const err = new Error(data.error?.message || res.statusText);
    err.status = res.status;
    err.code = data.error?.code;
    throw err;
  }
  return data;
}

export function formatCurrency(amount) {
  if (amount >= 1_000_000) return `$${Math.round(amount / 1000)}k`;
  if (amount >= 1_000) return `$${Math.round(amount / 1000)}k`;
  return `$${Math.round(amount)}`;
}

export function formatStage(stage) {
  if (!stage) return 'Unknown';
  return stage.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
}

export const ROLE_USERS = {
  ae: 'user_alex',
  manager: 'user_manager_1',
  se: 'user_se_1',
  leader: 'user_leader_1',
  support: 'user_support',
  admin: 'user_admin',
};

export const ACCOUNT_NAMES = {
  acct_acme: 'Acme Corp',
  acct_orbit: 'Orbit Media',
  acct_quanta: 'Quanta Logistics',
  acct_infoglen: 'Infoglen',
  acct_aspen: 'Aspen Digital',
  acct_brightwave: 'Brightwave Media',
  acct_granite: 'Granite State Bank',
  acct_helion: 'Helion Energy',
};
