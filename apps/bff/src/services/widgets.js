import { randomUUID } from 'node:crypto';
import { query } from '../db.js';
import { withFreshness } from './freshness.js';

export async function listWidgetConfigs(userId, view) {
  const params = [userId];
  let sql = `SELECT config_id, user_id, view, widget_key, layout, settings, created_at, updated_at
             FROM widget_configs WHERE user_id = $1`;
  if (view) {
    sql += ` AND view = $2`;
    params.push(view);
  }
  sql += ` ORDER BY view, widget_key`;

  const res = await query(sql, params);
  return withFreshness({ configs: res.rows }, { source: 'meetingiq', confidence: 'high' });
}

export async function getWidgetConfig(userId, configId) {
  const res = await query(
    `SELECT config_id, user_id, view, widget_key, layout, settings, created_at, updated_at
     FROM widget_configs WHERE config_id = $1 AND user_id = $2`,
    [configId, userId],
  );
  if (!res.rows.length) {
    const err = new Error('Widget config not found');
    err.statusCode = 404;
    throw err;
  }
  return withFreshness({ config: res.rows[0] }, { source: 'meetingiq' });
}

export async function upsertWidgetConfig(userId, { view, widget_key, layout = {}, settings = {} }) {
  const configId = randomUUID();
  const res = await query(
    `INSERT INTO widget_configs (config_id, user_id, view, widget_key, layout, settings)
     VALUES ($1, $2, $3, $4, $5, $6)
     ON CONFLICT (user_id, view, widget_key)
     DO UPDATE SET layout = EXCLUDED.layout, settings = EXCLUDED.settings, updated_at = NOW()
     RETURNING config_id, user_id, view, widget_key, layout, settings, created_at, updated_at`,
    [configId, userId, view, widget_key, JSON.stringify(layout), JSON.stringify(settings)],
  );
  return withFreshness({ config: res.rows[0] }, { source: 'meetingiq' });
}

export async function deleteWidgetConfig(userId, configId) {
  const res = await query(
    `DELETE FROM widget_configs WHERE config_id = $1 AND user_id = $2 RETURNING config_id`,
    [configId, userId],
  );
  if (!res.rows.length) {
    const err = new Error('Widget config not found');
    err.statusCode = 404;
    throw err;
  }
  return { deleted: true, config_id: configId };
}
