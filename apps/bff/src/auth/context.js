import { query } from '../db.js';
import { entitlementsForRole } from './entitlements.js';

/**
 * Load user hierarchy context for authorization and Zambyl headers.
 * @param {string} userId
 */
export async function loadUserContext(userId) {
  const userRes = await query(
    `SELECT u.user_id, u.organization_id, u.email, u.display_name, u.role,
            u.manager_id, u.team_id, u.region_id, u.business_unit_id,
            t.name AS team_name, o.name AS organization_name
     FROM users u
     JOIN organizations o ON o.organization_id = u.organization_id
     LEFT JOIN teams t ON t.team_id = u.team_id
     WHERE u.user_id = $1 AND u.active = true`,
    [userId],
  );
  if (!userRes.rows.length) return null;

  const user = userRes.rows[0];

  const [territories, products, reports] = await Promise.all([
    query(`SELECT territory_id FROM user_territories WHERE user_id = $1`, [userId]),
    query(`SELECT product_id FROM user_products WHERE user_id = $1`, [userId]),
    query(`SELECT user_id FROM users WHERE manager_id = $1 AND active = true`, [userId]),
  ]);

  const directReportIds = reports.rows.map((r) => r.user_id);
  const visibleUserIds = await resolveVisibleUserIds(user, directReportIds);

  return {
    userId: user.user_id,
    email: user.email,
    displayName: user.display_name,
    role: user.role,
    organizationId: user.organization_id,
    organizationName: user.organization_name,
    managerId: user.manager_id,
    teamId: user.team_id,
    teamName: user.team_name,
    regionId: user.region_id,
    businessUnitId: user.business_unit_id,
    territoryIds: territories.rows.map((r) => r.territory_id),
    productIds: products.rows.map((p) => p.product_id),
    directReportIds,
    visibleUserIds,
    entitlements: entitlementsForRole(user.role),
  };
}

async function resolveVisibleUserIds(user, directReportIds) {
  switch (user.role) {
    case 'admin':
    case 'leader':
      {
        const orgUsers = await query(
          `SELECT user_id FROM users WHERE organization_id = $1 AND active = true`,
          [user.organization_id],
        );
        return orgUsers.rows.map((r) => r.user_id);
      }
    case 'manager':
      return [user.user_id, ...directReportIds];
    case 'support':
      return [user.user_id];
    default:
      return [user.user_id];
  }
}

export function zambylHeadersFromContext(ctx) {
  return {
    'x-api-key': ctx.zambylApiKey,
    'x-workload-id': ctx.zambylWorkloadId,
    'x-user-id': ctx.userId,
    'x-entitlements': ctx.entitlements.join(','),
  };
}
