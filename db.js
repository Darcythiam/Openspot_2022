// Simple mysql2 pool wrapper.
// Keep this tiny; bigger apps deserve an ORM or query builder.
import mysql from 'mysql2/promise';

const {
  DB_HOST, DB_PORT, DB_USER, DB_PASSWORD, DB_NAME
} = process.env;

export const pool = mysql.createPool({
  host: DB_HOST || '127.0.0.1',
  port: Number(DB_PORT || 3306),
  user: DB_USER || 'root',
  password: DB_PASSWORD || '',
  database: DB_NAME || 'openspot_2022',
  connectionLimit: 10,
  timezone: 'Z' // keep timestamps consistent
});

// quick helper: query with prepared values
export async function q(sql, params = []) {
  const [rows] = await pool.execute(sql, params);
  return rows;
}
