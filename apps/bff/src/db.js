import pg from 'pg';
import { config } from './config.js';

const { Pool } = pg;

/** @type {pg.Pool | null} */
let pool = null;

export function getPool() {
  if (!pool) {
    pool = new Pool({ connectionString: config.databaseUrl });
  }
  return pool;
}

export async function query(text, params = []) {
  return getPool().query(text, params);
}

export async function closePool() {
  if (pool) {
    await pool.end();
    pool = null;
  }
}
