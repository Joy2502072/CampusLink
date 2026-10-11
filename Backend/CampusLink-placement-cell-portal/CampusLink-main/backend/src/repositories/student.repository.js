import { pool } from '../config/database.js';

/**
 * Safely parses JSON columns returned by MySQL.
 * Handles cases where mysql2 returns an already-parsed object/array or a JSON string.
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
 * Maps a raw MySQL database row to the exact camelCase student object structure
 * expected by existing services, controllers, and frontend clients.
 */
function mapRowToStudent(row) {
  if (!row) return null;

  const technicalSkills = parseJsonField(row.technical_skills, []);

  return {
    id: row.id,
    name: row.name,
    email: row.email,
    branch: row.branch,
    cgpa: Number(row.cgpa),
    technicalSkills,
    skills: technicalSkills,
    projects: parseJsonField(row.projects, []),
    certifications: parseJsonField(row.certifications, []),
    communicationScore: Number(row.communication_score),
    applicationsCount: Number(row.applications_count),
    rejectionsCount: Number(row.rejections_count),
    status: row.status
  };
}

/**
 * Fetches all students from MySQL.
 * @returns {Promise<Array>} Array of mapped student objects.
 */
export async function findAllStudents() {
  const query = `
    SELECT 
      id, name, email, branch, cgpa,
      technical_skills, projects, certifications,
      communication_score, applications_count, rejections_count, status
    FROM students
    ORDER BY id ASC;
  `;
  const [rows] = await pool.query(query);
  return rows.map(mapRowToStudent);
}

/**
 * Fetches a single student by ID from MySQL using parameterized query.
 * @param {string} id - Student ID (e.g. 'DEMO-STU-001')
 * @returns {Promise<Object|null>} Mapped student object or null if not found.
 */
export async function findStudentById(id) {
  const query = `
    SELECT 
      id, name, email, branch, cgpa,
      technical_skills, projects, certifications,
      communication_score, applications_count, rejections_count, status
    FROM students
    WHERE id = ?
    LIMIT 1;
  `;
  const [rows] = await pool.execute(query, [id ?? '']);
  if (!rows || rows.length === 0) {
    return null;
  }
  return mapRowToStudent(rows[0]);
}

/**
 * Fetches students filtered by academic branch using parameterized query.
 * @param {string} branch - Academic department code (e.g. 'CSE', 'ECE')
 * @returns {Promise<Array>} Array of mapped student objects.
 */
export async function findStudentsByBranch(branch) {
  const query = `
    SELECT 
      id, name, email, branch, cgpa,
      technical_skills, projects, certifications,
      communication_score, applications_count, rejections_count, status
    FROM students
    WHERE UPPER(branch) = UPPER(?)
    ORDER BY id ASC;
  `;
  const [rows] = await pool.execute(query, [branch ?? '']);
  return rows.map(mapRowToStudent);
}

/**
 * Inserts or updates a student record into MySQL.
 * Sanitizes all input fields to guarantee no `undefined` values are bound to mysql2.
 * @param {Object} student - Student data object
 */
export async function upsertStudent(student) {
  const query = `
    INSERT INTO students (
      id, name, email, branch, cgpa,
      technical_skills, projects, certifications,
      communication_score, applications_count, rejections_count, status
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    ON DUPLICATE KEY UPDATE
      name = VALUES(name),
      email = VALUES(email),
      branch = VALUES(branch),
      cgpa = VALUES(cgpa),
      technical_skills = VALUES(technical_skills),
      projects = VALUES(projects),
      certifications = VALUES(certifications),
      communication_score = VALUES(communication_score),
      applications_count = VALUES(applications_count),
      rejections_count = VALUES(rejections_count),
      status = VALUES(status);
  `;

  const studentId = student.id ?? '';
  const fallbackEmail = studentId
    ? `${studentId.toLowerCase().replace(/[^a-z0-9_-]/g, '')}@campuslink.edu`
    : 'student@campuslink.edu';

  const rawSkills = student.technicalSkills ?? student.skills ?? [];
  const rawProjects = student.projects ?? [];
  const rawCertifications = student.certifications ?? [];

  const params = [
    studentId,
    student.name ?? '',
    student.email ?? fallbackEmail,
    student.branch ?? '',
    student.cgpa !== undefined && student.cgpa !== null ? Number(student.cgpa) : 0.0,
    JSON.stringify(Array.isArray(rawSkills) ? rawSkills : []),
    JSON.stringify(Array.isArray(rawProjects) ? rawProjects : []),
    JSON.stringify(Array.isArray(rawCertifications) ? rawCertifications : []),
    student.communicationScore !== undefined && student.communicationScore !== null
      ? Number(student.communicationScore)
      : 0.0,
    student.applicationsCount !== undefined && student.applicationsCount !== null
      ? Number(student.applicationsCount)
      : (student.applications !== undefined && student.applications !== null ? Number(student.applications) : 0),
    student.rejectionsCount !== undefined && student.rejectionsCount !== null
      ? Number(student.rejectionsCount)
      : (student.rejections !== undefined && student.rejections !== null ? Number(student.rejections) : 0),
    student.status ?? 'Unplaced'
  ];

  await pool.execute(query, params);
}