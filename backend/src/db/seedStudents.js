import { students as demoStudents } from '../data/studentData.js';
import { upsertStudent } from '../repositories/student.repository.js';
import { pool, checkDatabaseConnection } from '../config/database.js';

async function seedStudents() {
  console.log('--- Seeding Students from demo dataset into MySQL ---');

  const isConnected = await checkDatabaseConnection();
  if (!isConnected) {
    console.error('[ERROR] Cannot seed: MySQL database connection failed.');
    process.exit(1);
  }

  if (!Array.isArray(demoStudents) || demoStudents.length === 0) {
    console.log('[WARN] No students found in studentData.js to seed.');
    await pool.end();
    process.exit(0);
  }

  let seededCount = 0;
  for (const student of demoStudents) {
    try {
      await upsertStudent(student);
      seededCount += 1;
      console.log(`[SEED] Upserted student: ${student.id} (${student.name})`);
    } catch (err) {
      console.error(`[ERROR] Failed to seed student ${student.id}:`, err.message);
    }
  }

  console.log(`[COMPLETE] Successfully verified/seeded ${seededCount} student records.`);
  await pool.end();
  process.exit(0);
}

seedStudents();