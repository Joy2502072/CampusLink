import { pool, checkDatabaseConnection } from '../config/database.js';
import { notifications } from '../data/notificationData.js';

function mapNotificationType(rawType) {
  const type = String(rawType || '').trim().toLowerCase();

  const map = {
    'drive schedule': 'Schedule_Change',
    'document deadline': 'Document_Deadline',
    'eligibility update': 'Eligibility_Update',
    'general announcement': 'General',
    'drive alert': 'Drive_Alert',
    'offer update': 'Offer_Update',
    'schedule change': 'Schedule_Change'
  };

  return map[type] || 'General';
}

function mapRecipientType(audience) {
  const value = String(audience || '').trim().toLowerCase();

  if (value === 'all students' || value === 'all') {
    return 'all';
  }

  if (
    value === 'shortlisted students' ||
    value === 'specific branch' ||
    value === 'specific drive' ||
    value === 'at-risk students'
  ) {
    return 'student';
  }

  if (value === 'officer' || value === 'placement officer') {
    return 'officer';
  }

  if (value === 'company' || value === 'recruiter') {
    return 'company';
  }

  return 'student';
}

function formatDateTime(value) {
  if (!value) return null;

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return null;
  }

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const seconds = String(date.getSeconds()).padStart(2, '0');

  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
}

async function seedNotifications() {
  console.log('--- Starting MySQL Notification Seed ---');

  const connected = await checkDatabaseConnection();

  if (!connected) {
    throw new Error('MySQL database connection failed.');
  }

  const records = Array.isArray(notifications)
    ? notifications
    : [];

  console.log(`Found ${records.length} notifications.`);

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
    )
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    ON DUPLICATE KEY UPDATE
      recipient_type = VALUES(recipient_type),
      recipient_id = VALUES(recipient_id),
      title = VALUES(title),
      message = VALUES(message),
      type = VALUES(type),
      priority = VALUES(priority),
      audience = VALUES(audience),
      branch = VALUES(branch),
      drive_id = VALUES(drive_id),
      status = VALUES(status),
      scheduled_for = VALUES(scheduled_for),
      recipients_count = VALUES(recipients_count),
      is_read = VALUES(is_read),
      created_at = VALUES(created_at)
  `;

  let successCount = 0;

  for (const notification of records) {
    const params = [
      notification.id,
      mapRecipientType(notification.audience),
      null,
      notification.title || 'Notification',
      notification.message || '',
      mapNotificationType(notification.type),
      notification.priority || 'Normal',
      notification.audience || 'All Students',
      notification.branch || 'All',
      notification.driveId || null,
      notification.status || 'Draft',
      formatDateTime(notification.scheduledFor),
      Number(notification.recipientsCount || 0),
      notification.status === 'Sent' ? 1 : 0,
      formatDateTime(notification.createdAt)
    ];

    await pool.execute(query, params);

    successCount++;

    console.log(
      `[SEED] ${notification.id} | ${notification.type} | ${notification.status}`
    );
  }

  console.log(
    `Successfully seeded ${successCount}/${records.length} notifications.`
  );
}

seedNotifications()
  .catch((error) => {
    console.error('Notification seed failed:', error.message);
    process.exitCode = 1;
  })
  .finally(async () => {
    await pool.end();
  });