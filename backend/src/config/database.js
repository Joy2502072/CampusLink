import mysql from 'mysql2/promise';
import { env } from './env.js';

/**
 * Shared MySQL connection pool.
 * Uses mysql2/promise for async/await execution.
 */
export const pool = mysql.createPool({
  host: env.DB_HOST,
  port: env.DB_PORT,
  user: env.DB_USER,
  password: env.DB_PASSWORD,
  database: env.DB_NAME,
  waitForConnections: true,
  connectionLimit: env.DB_CONNECTION_LIMIT,
  queueLimit: 0,
  enableKeepAlive: true,
  keepAliveInitialDelay: 0
});

/**
 * Verifies active database connection by executing a ping query on a leased connection.
 * @returns {Promise<boolean>} True if connection succeeds, false otherwise.
 */
export const checkDatabaseConnection = async () => {
  try {
    const connection = await pool.getConnection();
    await connection.ping();
    connection.release();
    return true;
  } catch (error) {
    console.error('Database connection check error:', error.message);
    return false;
  }
};