import * as notificationRepository from '../repositories/notification.repository.js';

/**
 * Normalizes input notification types into valid MySQL ENUM values:
 * ('Drive_Alert', 'Offer_Update', 'Schedule_Change', 'General', 'Document_Deadline', 'Eligibility_Update')
 */
export function normalizeNotificationType(rawType) {
  if (!rawType || typeof rawType !== 'string') return 'General';
  const clean = rawType.trim().toLowerCase().replace(/[\s-]+/g, '_');

  switch (clean) {
    case 'drive_alert':
    case 'drive_announcement':
      return 'Drive_Alert';
    case 'offer_update':
      return 'Offer_Update';
    case 'schedule_change':
    case 'drive_schedule':
      return 'Schedule_Change';
    case 'document_deadline':
      return 'Document_Deadline';
    case 'eligibility_update':
      return 'Eligibility_Update';
    case 'general':
    case 'general_announcement':
      return 'General';
    default:
      return 'General';
  }
}

/**
 * Normalizes input priority levels into valid MySQL ENUM values:
 * ('Urgent', 'Important', 'Normal')
 */
export function normalizePriority(rawPriority) {
  if (!rawPriority || typeof rawPriority !== 'string') return 'Normal';
  const clean = rawPriority.trim().toLowerCase();

  if (clean === 'urgent') return 'Urgent';
  if (clean === 'important') return 'Important';
  if (clean === 'normal' || clean === 'low') return 'Normal';

  return 'Normal';
}

/**
 * Maps audience strings to MySQL ENUM recipient_type:
 * ('student', 'officer', 'company', 'all')
 */
export function mapAudienceToRecipientType(audience) {
  if (!audience || typeof audience !== 'string') return 'all';
  const clean = audience.trim().toLowerCase();

  if (clean === 'all students' || clean === 'all') {
    return 'all';
  }
  if (clean === 'placement officers' || clean === 'officer' || clean === 'officers') {
    return 'officer';
  }
  if (clean === 'company' || clean === 'recruiter' || clean === 'companies') {
    return 'company';
  }

  // Shortlisted Students, Specific Branch, Specific Drive, At-Risk Students, etc.
  return 'student';
}

/**
 * Validates payload fields for all notification creation actions.
 */
function validateBaseNotificationPayload(payload) {
  const { title, message, type, priority, audience, recipientsCount } = payload;

  if (!title || typeof title !== 'string' || !title.trim()) {
    throw new Error('Title is required and must be a non-empty string');
  }
  if (title.trim().length > 200) {
    throw new Error('Title must not exceed 200 characters');
  }

  if (!message || typeof message !== 'string' || !message.trim()) {
    throw new Error('Message is required and must be a non-empty string');
  }

  if (!type || typeof type !== 'string' || !type.trim()) {
    throw new Error('Notification type is required');
  }

  if (!priority || typeof priority !== 'string' || !priority.trim()) {
    throw new Error('Priority is required');
  }

  if (!audience || typeof audience !== 'string' || !audience.trim()) {
    throw new Error('Audience is required');
  }

  if (recipientsCount !== undefined && recipientsCount !== null && recipientsCount !== '') {
    const num = Number(recipientsCount);
    if (!Number.isInteger(num) || num < 0) {
      throw new Error('Recipients count must be a non-negative integer');
    }
  }
}

/**
 * Sends a notification immediately (status: 'Sent').
 *
 * @param {Object} payload - Notification input data
 * @returns {Promise<Object>} Created notification entity
 */
export async function sendNotificationNow(payload) {
  validateBaseNotificationPayload(payload);

  const normalizedType = normalizeNotificationType(payload.type);
  const normalizedPriority = normalizePriority(payload.priority);
  const recipientType = mapAudienceToRecipientType(payload.audience);

  const recipientsCount = payload.recipientsCount !== undefined && payload.recipientsCount !== null
    ? Number(payload.recipientsCount)
    : 0;

  const data = {
    title: payload.title.trim(),
    message: payload.message.trim(),
    type: normalizedType,
    priority: normalizedPriority,
    audience: payload.audience.trim(),
    branch: (payload.branch && typeof payload.branch === 'string' && payload.branch.trim()) ? payload.branch.trim() : 'All',
    driveId: (payload.driveId && typeof payload.driveId === 'string' && payload.driveId.trim()) ? payload.driveId.trim() : null,
    status: 'Sent',
    scheduledFor: null,
    recipientsCount,
    recipientType,
    recipientId: payload.recipientId || null,
    isRead: 1
  };

  return notificationRepository.createNotification(data);
}

/**
 * Saves a notification as a draft (status: 'Draft').
 *
 * @param {Object} payload - Notification input data
 * @returns {Promise<Object>} Created draft notification entity
 */
export async function saveNotificationDraft(payload) {
  validateBaseNotificationPayload(payload);

  const normalizedType = normalizeNotificationType(payload.type);
  const normalizedPriority = normalizePriority(payload.priority);
  const recipientType = mapAudienceToRecipientType(payload.audience);

  const recipientsCount = payload.recipientsCount !== undefined && payload.recipientsCount !== null
    ? Number(payload.recipientsCount)
    : 0;

  const data = {
    title: payload.title.trim(),
    message: payload.message.trim(),
    type: normalizedType,
    priority: normalizedPriority,
    audience: payload.audience.trim(),
    branch: (payload.branch && typeof payload.branch === 'string' && payload.branch.trim()) ? payload.branch.trim() : 'All',
    driveId: (payload.driveId && typeof payload.driveId === 'string' && payload.driveId.trim()) ? payload.driveId.trim() : null,
    status: 'Draft',
    scheduledFor: null,
    recipientsCount,
    recipientType,
    recipientId: payload.recipientId || null,
    isRead: 0
  };

  return notificationRepository.createNotification(data);
}

/**
 * Schedules a notification for future dispatch (status: 'Scheduled').
 *
 * @param {Object} payload - Notification input data
 * @returns {Promise<Object>} Created scheduled notification entity
 */
export async function scheduleNotification(payload) {
  validateBaseNotificationPayload(payload);

  if (!payload.scheduledFor) {
    throw new Error('scheduledFor date/time is required to schedule a notification');
  }

  const scheduledDate = new Date(payload.scheduledFor);
  if (isNaN(scheduledDate.getTime())) {
    throw new Error('Invalid scheduledFor date format. Please supply a valid ISO or datetime string');
  }

  const normalizedType = normalizeNotificationType(payload.type);
  const normalizedPriority = normalizePriority(payload.priority);
  const recipientType = mapAudienceToRecipientType(payload.audience);

  const recipientsCount = payload.recipientsCount !== undefined && payload.recipientsCount !== null
    ? Number(payload.recipientsCount)
    : 0;

  const data = {
    title: payload.title.trim(),
    message: payload.message.trim(),
    type: normalizedType,
    priority: normalizedPriority,
    audience: payload.audience.trim(),
    branch: (payload.branch && typeof payload.branch === 'string' && payload.branch.trim()) ? payload.branch.trim() : 'All',
    driveId: (payload.driveId && typeof payload.driveId === 'string' && payload.driveId.trim()) ? payload.driveId.trim() : null,
    status: 'Scheduled',
    scheduledFor: scheduledDate.toISOString(),
    recipientsCount,
    recipientType,
    recipientId: payload.recipientId || null,
    isRead: 0
  };

  return notificationRepository.createNotification(data);
}

/**
 * Retrieves all notifications from MySQL.
 * @returns {Promise<Array>}
 */
export async function getAllNotifications() {
  return notificationRepository.findAllNotifications();
}

/**
 * Retrieves single notification by ID.
 * @param {string} id - Notification ID
 * @returns {Promise<Object|null>}
 */
export async function getNotificationById(id) {
  if (!id || typeof id !== 'string') return null;
  return notificationRepository.findNotificationById(id.trim());
}

/**
 * Retrieves notifications filtered by category type.
 * @param {string} type - Notification type
 * @returns {Promise<Array>}
 */
export async function getNotificationsByType(type) {
  if (!type || typeof type !== 'string') return [];
  const normalized = normalizeNotificationType(type);
  return notificationRepository.findNotificationsByType(normalized);
}

/**
 * Retrieves notifications filtered by priority level.
 * @param {string} priority - Priority level
 * @returns {Promise<Array>}
 */
export async function getNotificationsByPriority(priority) {
  if (!priority || typeof priority !== 'string') return [];
  const normalized = normalizePriority(priority);
  return notificationRepository.findNotificationsByPriority(normalized);
}

/**
 * Retrieves notifications filtered by status ('Sent', 'Scheduled', 'Draft').
 * @param {string} status - Status
 * @returns {Promise<Array>}
 */
export async function getNotificationsByStatus(status) {
  if (!status || typeof status !== 'string') return [];
  return notificationRepository.findNotificationsByStatus(status.trim());
}

/**
 * Retrieves notifications filtered by audience.
 * @param {string} audience - Audience name
 * @returns {Promise<Array>}
 */
export async function getNotificationsByAudience(audience) {
  if (!audience || typeof audience !== 'string') return [];
  return notificationRepository.findNotificationsByAudience(audience.trim());
}

/**
 * Retrieves notifications targeted by academic branch.
 * @param {string} branch - Branch name
 * @returns {Promise<Array>}
 */
export async function getNotificationsByBranch(branch) {
  if (!branch || typeof branch !== 'string') return [];
  return notificationRepository.findNotificationsByBranch(branch.trim());
}

/**
 * Retrieves targeted notifications supporting optional combinable query filters.
 *
 * @param {Object} [filters={}]
 * @returns {Promise<Array>}
 */
export async function getTargetedNotifications(filters = {}) {
  const normalizedFilters = {};

  if (filters.priority) {
    normalizedFilters.priority = normalizePriority(filters.priority);
  }
  if (filters.type) {
    normalizedFilters.type = normalizeNotificationType(filters.type);
  }
  if (filters.branch) {
    normalizedFilters.branch = filters.branch;
  }
  if (filters.audience) {
    normalizedFilters.audience = filters.audience;
  }
  if (filters.status) {
    normalizedFilters.status = filters.status;
  }
  if (filters.driveId) {
    normalizedFilters.driveId = filters.driveId;
  }

  return notificationRepository.findTargetedNotifications(normalizedFilters);
}

/**
 * Computes high-level summary metrics across notifications in MySQL.
 * Strictly preserves the legacy response contract:
 * totalNotifications, sentNotifications, scheduledNotifications, draftNotifications,
 * urgentNotifications, importantNotifications, normalNotifications.
 *
 * @returns {Promise<Object>}
 */
export async function getNotificationSummary() {
  const all = await notificationRepository.findAllNotifications();

  const totalNotifications = all.length;
  const sentNotifications = all.filter((n) => n.status === 'Sent').length;
  const scheduledNotifications = all.filter((n) => n.status === 'Scheduled').length;
  const draftNotifications = all.filter((n) => n.status === 'Draft').length;

  const urgentNotifications = all.filter((n) => n.priority === 'Urgent').length;
  const importantNotifications = all.filter((n) => n.priority === 'Important').length;
  const normalNotifications = all.filter((n) => n.priority === 'Normal').length;

  const totalRecipientsReached = all
    .filter((n) => n.status === 'Sent')
    .reduce((sum, n) => sum + (n.recipientsCount || 0), 0);

  return {
    totalNotifications,
    sentNotifications,
    scheduledNotifications,
    draftNotifications,
    urgentNotifications,
    importantNotifications,
    normalNotifications,
    priorityBreakdown: {
      urgent: urgentNotifications,
      important: importantNotifications,
      normal: normalNotifications
    },
    totalRecipientsReached
  };
}