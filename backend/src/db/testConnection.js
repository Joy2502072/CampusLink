import { checkDatabaseConnection, pool } from '../config/database.js';
import { env } from '../config/env.js';

async function testConnection() {
  console.log(`Testing connection to MySQL database '${env.DB_NAME}' on ${env.DB_HOST}:${env.DB_PORT}...`);
  
  const isHealthy = await checkDatabaseConnection();
  await pool.end();

  if (isHealthy) {
    console.log('[SUCCESS] Database connection established and healthy.');
    process.exit(0);
  } else {
    console.error('[FAILED] Could not connect to MySQL. Verify credentials and server status.');
    process.exit(1);
  }
}

testConnection();