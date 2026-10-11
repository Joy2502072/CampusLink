import { pool } from '../config/database.js';

/**
 * Safely parses JSON columns returned by MySQL.
 * Handles cases where mysql2 returns an already parsed object/array or a JSON string.
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
 * Formats a Date object or ISO string into a standard YYYY-MM-DD string.
 */
function formatDateField(val) {
  if (!val) return '';
  if (val instanceof Date) {
    const year = val.getFullYear();
    const month = String(val.getMonth() + 1).padStart(2, '0');
    const day = String(val.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }
  if (typeof val === 'string') {
    return val.split('T')[0];
  }
  return String(val);
}

/**
 * Extracts a numeric package value for storage/sorting (e.g. "18.5 LPA" -> 18.50).
 */
function parsePackageNumeric(packageStr) {
  if (typeof packageStr === 'number') return packageStr;
  if (!packageStr || typeof packageStr !== 'string') return 0.0;
  const match = packageStr.match(/(\d+(?:\.\d+)?)/);
  return match ? parseFloat(match[1]) : 0.0;
}

/**
 * Maps a raw MySQL database row to the exact camelCase drive object structure
 * expected by existing services, controllers, and frontend clients.
 */
function mapRowToDrive(row) {
  if (!row) return null;

  const requiredSkills = parseJsonField(row.required_skills, []);

  return {
    id: row.id,
    company: row.company,
    role: row.role,
    date: formatDateField(row.date),
    startTime: row.start_time || '',
    endTime: row.end_time || '',
    venue: row.venue || '',
    requiredResources: parseJsonField(row.required_resources, []),
    eligibleBranches: parseJsonField(row.eligible_branches, []),
    status: row.status,
    packageLPA: row.package_lpa,
    openings: Number(row.openings ?? 0),
    applicants: Number(row.applicants ?? 0),
    shortlisted: Number(row.shortlisted ?? 0),
    description: row.description || '',
    // Non-invented compatibility fields
    minCgpa: Number(row.min_cgpa ?? 0),
    requiredSkills,
    skills: requiredSkills
  };
}

/**
 * Fetches all placement drives from MySQL.
 * @returns {Promise<Array>} Array of mapped drive objects.
 */
export async function findAllDrives() {
  const query = `
    SELECT 
      id, company, role, package_lpa, min_cgpa,
      eligible_branches, required_skills, required_resources,
      openings, applicants, shortlisted,
      date, start_time, end_time, venue, description, status
    FROM placement_drives
    ORDER BY date ASC, id ASC;
  `;
  const [rows] = await pool.query(query);
  return rows.map(mapRowToDrive);
}

/**
 * Fetches a single drive by unique ID using parameterized query.
 * @param {string} id - Placement Drive ID (e.g. 'DRV-201')
 * @returns {Promise<Object|null>} Mapped drive object or null if not found.
 */
export async function findDriveById(id) {
  const query = `
    SELECT 
      id, company, role, package_lpa, min_cgpa,
      eligible_branches, required_skills, required_resources,
      openings, applicants, shortlisted,
      date, start_time, end_time, venue, description, status
    FROM placement_drives
    WHERE id = ?
    LIMIT 1;
  `;
  const [rows] = await pool.execute(query, [id ?? '']);
  if (!rows || rows.length === 0) {
    return null;
  }
  return mapRowToDrive(rows[0]);
}

/**
 * Fetches drives filtered by status ('Upcoming', 'Ongoing', 'Completed', etc.).
 * @param {string} status - Recruitment status
 * @returns {Promise<Array>} Array of matching drive objects.
 */
export async function findDrivesByStatus(status) {
  const query = `
    SELECT 
      id, company, role, package_lpa, min_cgpa,
      eligible_branches, required_skills, required_resources,
      openings, applicants, shortlisted,
      date, start_time, end_time, venue, description, status
    FROM placement_drives
    WHERE UPPER(status) = UPPER(?)
    ORDER BY date ASC, id ASC;
  `;
  const [rows] = await pool.execute(query, [status ?? '']);
  return rows.map(mapRowToDrive);
}

/**
 * Fetches drives eligible for a specific academic branch.
 * Evaluates candidate branch containment case-insensitively.
 * @param {string} branch - Academic department code (e.g. 'CSE', 'IT')
 * @returns {Promise<Array>} Array of matching drive objects.
 */
export async function findDrivesByBranch(branch) {
  const allDrives = await findAllDrives();
  const searchBranch = (branch || '').trim().toUpperCase();

  return allDrives.filter((d) =>
    Array.isArray(d.eligibleBranches) &&
    d.eligibleBranches.some((b) => b.trim().toUpperCase() === searchBranch)
  );
}

/**
 * Inserts or updates a drive record in MySQL using the true fields from driveData.js.
 * @param {Object} drive - Actual placement drive object from driveData.js
 */
export async function upsertDrive(drive) {
  const query = `
    INSERT INTO placement_drives (
      id, company, role, package_lpa, package_numeric,
      min_cgpa, eligible_branches, required_skills, required_resources,
      openings, applicants, shortlisted,
      date, start_time, end_time, venue, description, status
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    ON DUPLICATE KEY UPDATE
      company = VALUES(company),
      role = VALUES(role),
      package_lpa = VALUES(package_lpa),
      package_numeric = VALUES(package_numeric),
      min_cgpa = VALUES(min_cgpa),
      eligible_branches = VALUES(eligible_branches),
      required_skills = VALUES(required_skills),
      required_resources = VALUES(required_resources),
      openings = VALUES(openings),
      applicants = VALUES(applicants),
      shortlisted = VALUES(shortlisted),
      date = VALUES(date),
      start_time = VALUES(start_time),
      end_time = VALUES(end_time),
      venue = VALUES(venue),
      description = VALUES(description),
      status = VALUES(status);
  `;

  const driveId = drive.id ?? '';
  const packageLPA = drive.packageLPA ?? '';
  const packageNumeric = parsePackageNumeric(packageLPA);

  // Read actual arrays present in driveData.js
  const eligibleBranches = Array.isArray(drive.eligibleBranches) ? drive.eligibleBranches : [];
  const requiredResources = Array.isArray(drive.requiredResources) ? drive.requiredResources : [];
  // requiredSkills does not exist in driveData.js; preserve empty array truth without fabricating data
  const requiredSkills = Array.isArray(drive.requiredSkills) ? drive.requiredSkills : [];

  const rawDate = drive.date ?? null;
  const formattedDate = rawDate ? formatDateField(rawDate) : null;

  const params = [
    driveId,
    drive.company ?? '',
    drive.role ?? '',
    packageLPA,
    packageNumeric,
    drive.minCgpa !== undefined && drive.minCgpa !== null ? Number(drive.minCgpa) : 0.0,
    JSON.stringify(eligibleBranches),
    JSON.stringify(requiredSkills),
    JSON.stringify(requiredResources),
    Number(drive.openings ?? 0),
    Number(drive.applicants ?? 0),
    Number(drive.shortlisted ?? 0),
    formattedDate,
    drive.startTime ?? '',
    drive.endTime ?? '',
    drive.venue ?? '',
    drive.description ?? '',
    drive.status ?? 'Upcoming'
  ];

  await pool.execute(query, params);
}