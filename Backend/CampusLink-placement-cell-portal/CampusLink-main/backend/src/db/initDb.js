import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import mysql from 'mysql2/promise';
import { env } from '../config/env.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function initializeDatabase() {
  console.log('--- Initializing CampusLink Database ---');

  let connection;
  try {
    // Connect to server without binding to specific DB
    connection = await mysql.createConnection({
      host: env.DB_HOST,
      port: env.DB_PORT,
      user: env.DB_USER,
      password: env.DB_PASSWORD,
      multipleStatements: true
    });
    console.log(`[1/3] Connected to MySQL server at ${env.DB_HOST}:${env.DB_PORT}`);

    // Dynamically create database from DB_NAME env configuration
    const safeDbName = env.DB_NAME.replace(/`/g, '``');
    await connection.query(
      `CREATE DATABASE IF NOT EXISTS \`${safeDbName}\` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;`
    );
    await connection.query(`USE \`${safeDbName}\`;`);
    console.log(`[2/3] Selected database: ${env.DB_NAME}`);

    // Read and run table definitions
    const schemaPath = path.join(__dirname, 'schema.sql');
    const sql = fs.readFileSync(schemaPath, 'utf8');

    await connection.query(sql);
    console.log('[3/3] Tables verified/created successfully.');
    console.log('Database initialization complete.');
  } catch (error) {
    console.error('[ERROR] Initialization failed:', error.message);
    process.exitCode = 1;
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

initializeDatabase();