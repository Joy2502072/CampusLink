import { pool, checkDatabaseConnection } from '../config/database.js';
import { findAllDrives } from '../repositories/drive.repository.js';
import { upsertSchedule } from '../repositories/scheduler.repository.js';

/**
 * Converts date ('YYYY-MM-DD') and time ('HH:mm') into MySQL DATETIME 'YYYY-MM-DD HH:mm:ss'.
 */
function makeSqlDateTime(dateStr, timeStr) {
  const d = dateStr ? dateStr.trim().split('T')[0] : '2026-09-28';
  let t = timeStr ? timeStr.trim() : '09:00';
  if (t.length === 5) {
    t = `${t}:00`;
  }
  return `${d} ${t}`;
}

async function seedScheduler() {
  console.log('--- Seeding Drive Schedules into MySQL (drive_schedules) ---');

  const isConnected = await checkDatabaseConnection();
  if (!isConnected) {
    console.error('[ERROR] Cannot seed: MySQL database connection failed.');
    process.exit(1);
  }

  // Read placement drives from MySQL
  const drives = await findAllDrives();
  if (!Array.isArray(drives) || drives.length === 0) {
    console.error('[ERROR] No placement drives found in MySQL. Please run "npm run db:seed:drives" first.');
    await pool.end();
    process.exit(1);
  }

  console.log(`[INFO] Found ${drives.length} placement drives in MySQL.`);

  let seededCount = 0;

  for (const drive of drives) {
    if (!drive.date || !drive.startTime || !drive.endTime || !drive.venue) {
      continue;
    }

    let scheduleDate = drive.date;
    let scheduleStartTime = drive.startTime;
    let scheduleEndTime = drive.endTime;
    let scheduleVenue = drive.venue;
    let assignedResources = Array.isArray(drive.requiredResources) ? [...drive.requiredResources] : [];

    // Specific deterministic adjustments to demonstrate the conflict engine:
    // DRV-201: keep its existing date/time/venue/resources
    // DRV-202: SAME venue as DRV-201 and overlapping time on same date -> Venue Overlap (Critical)
    if (drive.id === 'DRV-202') {
      const drv201 = drives.find((d) => d.id === 'DRV-201');
      if (drv201) {
        scheduleDate = drv201.date;
        scheduleVenue = drv201.venue;
        scheduleStartTime = drv201.startTime;
        scheduleEndTime = drv201.endTime;
      }
    }

    // DRV-203: keep its existing schedule
    // DRV-204: overlap DRV-203 time and share one resource with DRV-203 -> Resource Contention (High)
    if (drive.id === 'DRV-204') {
      const drv203 = drives.find((d) => d.id === 'DRV-203');
      if (drv203) {
        scheduleDate = drv203.date;
        scheduleStartTime = drv203.startTime;
        scheduleEndTime = drv203.endTime;
        scheduleVenue = 'Placement Cell Boardroom';
        const sharedResource = (drv203.requiredResources && drv203.requiredResources[0])
          ? drv203.requiredResources[0]
          : 'Lab 2 (60 systems)';
        assignedResources = [sharedResource];
      }
    }

    const startDateTime = makeSqlDateTime(scheduleDate, scheduleStartTime);
    const endDateTime = makeSqlDateTime(scheduleDate, scheduleEndTime);

    const scheduleRecord = {
      id: `SCH-${drive.id}-R1`,
      driveId: drive.id,
      roundName: 'Recruitment Drive',
      roundNumber: 1,
      startDateTime,
      endDateTime,
      date: scheduleDate,
      startTime: scheduleStartTime,
      endTime: scheduleEndTime,
      venue: scheduleVenue,
      assignedResources,
      status: 'Scheduled'
    };

    try {
      await upsertSchedule(scheduleRecord);
      seededCount += 1;
      console.log(`[SEED] Upserted schedule: ${scheduleRecord.id} (Drive: ${scheduleRecord.driveId} @ ${scheduleRecord.venue} | ${startDateTime} - ${endDateTime})`);
    } catch (err) {
      console.error(`[ERROR] Failed to seed schedule for drive ${drive.id}:`, err.message);
    }
  }

  console.log(`[COMPLETE] Successfully seeded ${seededCount} drive schedule records into MySQL.`);
  await pool.end();
  process.exit(0);
}

seedScheduler();