import { pool } from '../config/database.js';

/**
 * Safely parses JSON columns returned by MySQL.
 */
function parseJsonField(field, fallback = []) {
  if (field === null || field === undefined) return fallback;
  if (Array.isArray(field) || typeof field === 'object') return field;
  try {
    const parsed = JSON.parse(field);
    return parsed !== null && parsed !== undefined ? parsed : fallback;
  } catch {
    return fallback;
  }
}

/**
 * Formats a Date object or ISO/SQL string into YYYY-MM-DD.
 */
function extractDate(val) {
  if (!val) return '';
  if (val instanceof Date) {
    const year = val.getFullYear();
    const month = String(val.getMonth() + 1).padStart(2, '0');
    const day = String(val.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }
  if (typeof val === 'string') {
    return val.split('T')[0].split(' ')[0];
  }
  return String(val);
}

/**
 * Formats a Date object or ISO/SQL string into HH:mm.
 */
function extractTime(val) {
  if (!val) return '';
  if (val instanceof Date) {
    const hours = String(val.getHours()).padStart(2, '0');
    const minutes = String(val.getMinutes()).padStart(2, '0');
    return `${hours}:${minutes}`;
  }
  if (typeof val === 'string') {
    const timePart = val.includes('T') ? val.split('T')[1] : val.split(' ')[1];
    if (timePart) {
      const segments = timePart.split(':');
      return `${segments[0].padStart(2, '0')}:${segments[1].padStart(2, '0')}`;
    }
    const directSegments = val.split(':');
    if (directSegments.length >= 2) {
      return `${directSegments[0].padStart(2, '0')}:${directSegments[1].padStart(2, '0')}`;
    }
  }
  return '';
}

/**
 * Converts date ('YYYY-MM-DD') and time ('HH:mm') components into standard MySQL DATETIME 'YYYY-MM-DD HH:mm:ss'.
 */
function toSqlDateTime(dateVal, timeVal) {
  const d = extractDate(dateVal) || new Date().toISOString().split('T')[0];
  const t = extractTime(timeVal) || '09:00';
  return `${d} ${t}:00`;
}

/**
 * Maps a raw MySQL row from drive_schedules joined with placement_drives.
 * Derives date, startTime, and endTime cleanly from DATETIME start_time and end_time.
 */
function mapRowToSchedule(row) {
  if (!row) return null;

  return {
    id: row.id,
    driveId: row.drive_id,
    roundName: row.round_name,
    roundNumber: Number(row.round_number || 1),
    date: extractDate(row.start_time),
    startTime: extractTime(row.start_time),
    endTime: extractTime(row.end_time),
    startDateTime: row.start_time,
    endDateTime: row.end_time,
    venue: row.venue || '',
    assignedResources: parseJsonField(row.assigned_resources, []),
    status: row.status || 'Scheduled',
    // Joined placement_drives fields
    company: row.company || '',
    role: row.role || '',
    packageLPA: row.package_lpa || '',
    eligibleBranches: parseJsonField(row.eligible_branches, []),
    driveStatus: row.drive_status || ''
  };
}

/**
 * Retrieves all scheduled rounds joined with parent placement_drives metadata.
 * Uses only real columns from drive_schedules.
 * @returns {Promise<Array>}
 */
export async function findAllSchedules() {
  const query = `
    SELECT 
      s.id,
      s.drive_id,
      s.round_name,
      s.round_number,
      s.start_time,
      s.end_time,
      s.venue,
      s.assigned_resources,
      s.status,
      d.company,
      d.role,
      d.package_lpa,
      d.eligible_branches,
      d.status AS drive_status
    FROM drive_schedules s
    INNER JOIN placement_drives d ON d.id = s.drive_id
    ORDER BY s.start_time ASC, s.round_number ASC;
  `;

  const [rows] = await pool.query(query);
  return rows.map(mapRowToSchedule);
}

/**
 * Retrieves all scheduled rounds for a specific placement drive.
 * @param {string} driveId - Placement Drive ID (e.g. 'DRV-201')
 * @returns {Promise<Array>}
 */
export async function findSchedulesByDriveId(driveId) {
  const query = `
    SELECT 
      s.id,
      s.drive_id,
      s.round_name,
      s.round_number,
      s.start_time,
      s.end_time,
      s.venue,
      s.assigned_resources,
      s.status,
      d.company,
      d.role,
      d.package_lpa,
      d.eligible_branches,
      d.status AS drive_status
    FROM drive_schedules s
    INNER JOIN placement_drives d ON d.id = s.drive_id
    WHERE s.drive_id = ?
    ORDER BY s.start_time ASC, s.round_number ASC;
  `;

  const [rows] = await pool.execute(query, [driveId ?? '']);
  return rows.map(mapRowToSchedule);
}

/**
 * Retrieves all schedules occurring on a specific date using DATE(start_time).
 * @param {string} dateStr - 'YYYY-MM-DD'
 * @returns {Promise<Array>}
 */
export async function findSchedulesByDate(dateStr) {
  const query = `
    SELECT 
      s.id,
      s.drive_id,
      s.round_name,
      s.round_number,
      s.start_time,
      s.end_time,
      s.venue,
      s.assigned_resources,
      s.status,
      d.company,
      d.role,
      d.package_lpa,
      d.eligible_branches,
      d.status AS drive_status
    FROM drive_schedules s
    INNER JOIN placement_drives d ON d.id = s.drive_id
    WHERE DATE(s.start_time) = ?
    ORDER BY s.start_time ASC;
  `;

  const [rows] = await pool.execute(query, [dateStr]);
  return rows.map(mapRowToSchedule);
}

/**
 * Inserts or updates a drive schedule record idempotently into drive_schedules.
 * Writes standard DATETIME values into start_time and end_time.
 * @param {Object} schedule - Schedule object
 */
export async function upsertSchedule(schedule) {
  const query = `
    INSERT INTO drive_schedules (
      id, drive_id, round_name, round_number,
      start_time, end_time, venue, assigned_resources, status
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    ON DUPLICATE KEY UPDATE
      drive_id = VALUES(drive_id),
      round_name = VALUES(round_name),
      round_number = VALUES(round_number),
      start_time = VALUES(start_time),
      end_time = VALUES(end_time),
      venue = VALUES(venue),
      assigned_resources = VALUES(assigned_resources),
      status = VALUES(status);
  `;

  // Compute DATETIME for start_time and end_time
  const startDateTime = schedule.startDateTime
    ? schedule.startDateTime
    : toSqlDateTime(schedule.date, schedule.startTime || schedule.start_time);

  const endDateTime = schedule.endDateTime
    ? schedule.endDateTime
    : toSqlDateTime(schedule.date, schedule.endTime || schedule.end_time);

  const assignedResources = Array.isArray(schedule.assignedResources)
    ? schedule.assignedResources
    : Array.isArray(schedule.requiredResources)
    ? schedule.requiredResources
    : [];

  const validStatuses = ['Scheduled', 'In-Progress', 'Completed', 'Rescheduled', 'Cancelled'];
  const rawStatus = schedule.status || 'Scheduled';
  const status = validStatuses.includes(rawStatus) ? rawStatus : 'Scheduled';

  const params = [
    schedule.id ?? `SCH-${Date.now()}`,
    schedule.driveId ?? schedule.drive_id,
    schedule.roundName ?? schedule.round_name ?? 'Recruitment Drive',
    Number(schedule.roundNumber ?? schedule.round_number ?? 1),
    startDateTime,
    endDateTime,
    schedule.venue ?? 'TBD',
    JSON.stringify(assignedResources),
    status
  ];

  await pool.execute(query, params);
}