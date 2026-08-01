import pg from 'pg';
import { config } from '../config.js';

const { Pool } = pg;
let pool = null;

function getPool() {
  if (!config.zambyl.databaseUrl) return null;
  if (!pool) pool = new Pool({ connectionString: config.zambyl.databaseUrl });
  return pool;
}

/**
 * Read canonical entity payloads from Zambyl Postgres for BFF aggregation.
 * Search API returns citations; structured rollups need canonical payload fields.
 * No mock source access — reads Zambyl canonical store only.
 */
export async function fetchCanonicalEntities({ entityTypes = [], limit = 200 } = {}) {
  const db = getPool();
  if (!db) return [];

  let sql = `SELECT entity_id, entity_type, payload, updated_at FROM canonical_entities WHERE source_ref LIKE 'conn_meetingiq_%'`;
  const params = [];
  if (entityTypes.length) {
    sql += ` AND entity_type = ANY($1)`;
    params.push(entityTypes);
  }
  sql += ` ORDER BY updated_at DESC LIMIT ${limit}`;

  const res = await db.query(sql, params);
  return res.rows.map((r) => ({
    entity_id: r.entity_id,
    entity_type: r.entity_type,
    payload: typeof r.payload === 'string' ? JSON.parse(r.payload) : r.payload,
    updated_at: r.updated_at,
  }));
}

export async function closeCanonicalPool() {
  if (pool) {
    await pool.end();
    pool = null;
  }
}
