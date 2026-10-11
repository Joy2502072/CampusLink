import { drives as demoDrives } from '../data/driveData.js';
import { upsertDrive } from '../repositories/drive.repository.js';
import { pool, checkDatabaseConnection } from '../config/database.js';

async function seedDrives() {
  console.log('--- Seeding Placement Drives from demo dataset into MySQL ---');

  const isConnected = await checkDatabaseConnection();
  if (!isConnected) {
    console.error('[ERROR] Cannot seed: MySQL database connection failed.');
    process.exit(1);
  }

  if (!Array.isArray(demoDrives) || demoDrives.length === 0) {
    console.log('[WARN] No drives found in driveData.js to seed.');
    await pool.end();
    process.exit(0);
  }

  let seededCount = 0;
  for (const drive of demoDrives) {
    try {
      await upsertDrive(drive);
      seededCount += 1;
      console.log(`[SEED] Upserted drive: ${drive.id} (${drive.company} - ${drive.role})`);
    } catch (err) {
      console.error(`[ERROR] Failed to seed drive ${drive.id}:`, err.message);
    }
  }

  console.log(`[COMPLETE] Successfully verified/seeded ${seededCount} placement drive records.`);
  await pool.end();
  process.exit(0);
}

seedDrives();