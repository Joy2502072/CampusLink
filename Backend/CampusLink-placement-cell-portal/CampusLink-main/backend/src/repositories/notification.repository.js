import { pool } from '../config/database.js';

/**
 * Formats a Date object or ISO string into a standard SQL DATETIME string (YYYY-MM-DD HH:mm:ss).
 */
function toSqlDateTime(val) {
  if (!val) return null;
  const d = new Date(val);
  if (isNaN(d.getTime())) return null;

  const YYYY = d.getFullYear();
  const MM = String(d.getMonth() + 1).padStart(2, '0');
  const DD = String(d.getDate()).padStart(2, '0');
  const hh = String(d.getHours()).padStart(2, '0');
  const mm = String(d.getMinutes()).padStart(2, '0');
  const ss = String(d.getSeconds()).padStart(2, '0');

  return `${YYYY}-${MM}-${DD} ${hh}:${mm}:${ss}`;
}

/**
 * Maps a raw MySQL notification row to the camelCase contract.
 */
function mapRowToNotification(row) {
  if (!row) return null;

  return {
    id: row.id,
    title: row.title,
    message: row.message,
    type: row.type,
    priority: row.priority,
    audience: row.audience,
    branch: row.branch,
    driveId: row.drive_id,
    status: row.status,
    scheduledFor: row.scheduled_for ? new Date(row.scheduled_for).toISOString() : null,
    recipientsCount: Number(row.recipients_count || 0),
    recipientType: row.recipient_type,
    recipientId: row.recipient_id,
    isRead: Boolean(row.is_read),
    createdAt: row.created_at ? new Date(row.created_at).toISOString() : null
  };
}

/**
 * Generates the next sequential ID in the format "NOT-XXX" (e.g., NOT-012).
 * Reads all existing matching IDs to prevent collisions.
 *
 * @param {import('mysql2/promise').PoolConnection} [connection]
 * @returns {Promise<string>}
 */
export async function getNextNotificationId(connection = null) {
  const query = `
    SELECT id FROM notifications 
    WHERE id REGEXP '^NOT-[0-9]+$'
    ORDER BY id ASC;
  `;

  const db = connection || pool;
  const [rows] = await db.query(query);

  let maxNumericId = 0;
  for (const row of rows) {
    const parts = row.id.split('-');
    if (parts.length === 2) {
      const num = parseInt(parts[1], 10);
      if (!isNaN(num) && num > maxNumericId) {
        maxNumericId = num;
      }
    }
  }

  const nextNum = maxNumericId + 1;
  return `NOT-${String(nextNum).padStart(3, '0')}`;
}

/**
 * Inserts a new notification record into MySQL.
 *
 * @param {Object} data - Normalized notification entity
 * @returns {Promise<Object>} Newly created notification domain object
 */
export async function createNotification(data) {
  const id = data.id || (await getNextNotificationId());
  const recipientType = data.recipientType || 'all';
  const recipientId = data.recipientId || null;
  const title = data.title;
  const message = data.message;
  const type = data.type;
  const priority = data.priority || 'Normal';
  const audience = data.audience || 'All Students';
  const branch = data.branch || 'All';
  const driveId = data.driveId || null;
  const status = data.status || 'Draft';
  const scheduledFor = toSqlDateTime(data.scheduledFor);
  const recipientsCount = Number(data.recipientsCount || 0);
  const isRead = data.isRead !== undefined ? (data.isRead ? 1 : 0) : (status === 'Sent' ? 1 : 0);

  const query = `
    INSERT INTO notifications (
      id,
      recipient_type,
      recipient_id,
      title,
      message,
      type,
      priority,
      audience,
      branch,
      drive_id,
      status,
      scheduled_for,
      recipients_count,
      is_read,
      created_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW());
  `;

  const params = [
    id,
    recipientType,
    recipientId,
    title,
    message,
    type,
    priority,
    audience,
    branch,
    driveId,
    status,
    scheduledFor,
    recipientsCount,
    isRead
  ];

  await pool.execute(query, params);
  return findNotificationById(id);
}

/**
 * Retrieves all notifications ordered by creation date descending.
 * @returns {Promise<Array>}
 */
export async function findAllNotifications() {
  const query = `
    SELECT * FROM notifications 
    ORDER BY created_at DESC, id DESC;
  `;

  const [rows] = await pool.query(query);
  return rows.map(mapRowToNotification);
}

/**
 * Retrieves a single notification by ID.
 * @param {string} id - Notification ID
 * @returns {Promise<Object|null>}
 */
export async function findNotificationById(id) {
  const query = `
    SELECT * FROM notifications 
    WHERE id = ? 
    LIMIT 1;
  `;

  const [rows] = await pool.execute(query, [id ?? '']);
  if (!rows || rows.length === 0) return null;
  return mapRowToNotification(rows[0]);
}

/**
 * Retrieves notifications filtered by category type.
 * @param {string} type - Notification type enum
 * @returns {Promise<Array>}
 */
export async function findNotificationsByType(type) {
  const query = `
    SELECT * FROM notifications 
    WHERE UPPER(type) = UPPER(?) 
    ORDER BY created_at DESC;
  `;

  const [rows] = await pool.execute(query, [type ?? '']);
  return rows.map(mapRowToNotification);
}

/**
 * Retrieves notifications filtered by priority level.
 * @param {string} priority - Priority enum
 * @returns {Promise<Array>}
 */
export async function findNotificationsByPriority(priority) {
  const query = `
    SELECT * FROM notifications 
    WHERE UPPER(priority) = UPPER(?) 
    ORDER BY created_at DESC;
  `;

  const [rows] = await pool.execute(query, [priority ?? '']);
  return rows.map(mapRowToNotification);
}

/**
 * Retrieves notifications filtered by execution status.
 * @param {string} status - Status enum ('Sent', 'Scheduled', 'Draft')
 * @returns {Promise<Array>}
 */
export async function findNotificationsByStatus(status) {
  const query = `
    SELECT * FROM notifications 
    WHERE UPPER(status) = UPPER(?) 
    ORDER BY created_at DESC;
  `;

  const [rows] = await pool.execute(query, [status ?? '']);
  return rows.map(mapRowToNotification);
}

/**
 * Retrieves notifications filtered by audience category.
 * @param {string} audience - Audience descriptor
 * @returns {Promise<Array>}
 */
export async function findNotificationsByAudience(audience) {
  const query = `
    SELECT * FROM notifications 
    WHERE UPPER(audience) = UPPER(?) 
    ORDER BY created_at DESC;
  `;

  const [rows] = await pool.execute(query, [audience ?? '']);
  return rows.map(mapRowToNotification);
}

/**
 * Retrieves notifications targeted to a specific academic branch.
 * @param {string} branch - Branch code (e.g., 'CSE', 'ECE')
 * @returns {Promise<Array>}
 */
export async function findNotificationsByBranch(branch) {
  const query = `
    SELECT * FROM notifications 
    WHERE UPPER(branch) = UPPER(?) OR UPPER(branch) = 'ALL'
    ORDER BY created_at DESC;
  `;

  const [rows] = await pool.execute(query, [branch ?? '']);
  return rows.map(mapRowToNotification);
}

/**
 * Retrieves targeted notifications with dynamic optional filter support.
 * By definition, targeted notifications target non-'All Students' cohorts,
 * or cohorts matching specific criteria.
 *
 * @param {Object} [filters={}]
 * @param {string} [filters.priority]
 * @param {string} [filters.branch]
 * @param {string} [filters.audience]
 * @param {string} [filters.status]
 * @param {string} [filters.type]
 * @param {string} [filters.driveId]
 * @returns {Promise<Array>}
 */
export async function findTargetedNotifications(filters = {}) {
  let query = `
    SELECT * FROM notifications 
    WHERE UPPER(audience) != 'ALL STUDENTS'
  `;
  const params = [];

  if (filters.priority) {
    query += ` AND UPPER(priority) = UPPER(?)`;
    params.push(filters.priority.trim());
  }

  if (filters.branch) {
    query += ` AND (UPPER(branch) = UPPER(?) OR UPPER(branch) = 'ALL')`;
    params.push(filters.branch.trim());
  }

  if (filters.audience) {
    query += ` AND UPPER(audience) = UPPER(?)`;
    params.push(filters.audience.trim());
  }

  if (filters.status) {
    query += ` AND UPPER(status) = UPPER(?)`;
    params.push(filters.status.trim());
  }

  if (filters.type) {
    query += ` AND UPPER(type) = UPPER(?)`;
    params.push(filters.type.trim());
  }

  if (filters.driveId) {
    query += ` AND UPPER(drive_id) = UPPER(?)`;
    params.push(filters.driveId.trim());
  }

  query += ` ORDER BY created_at DESC;`;

  const [rows] = await pool.execute(query, params);
  return rows.map(mapRowToNotification);
}