/**
 * CampusLink Backend - Communication & Notification Service
 * 
 * NOTICE:
 * Implements deterministic querying, filtering, and summary calculations
 * on the in-memory synthetic notification dataset.
 */

import { notifications } from '../data/notificationData.js';

export const getAllNotifications = () => {
  return [...notifications];
};

export const getNotificationById = (notificationId) => {
  if (!notificationId || typeof notificationId !== 'string') return null;
  const normalizedId = notificationId.trim().toUpperCase();
  return notifications.find((n) => n.id.toUpperCase() === normalizedId) || null;
};

export const getNotificationsByType = (type) => {
  if (!type || typeof type !== 'string') return [];
  const normalizedType = type.trim().toLowerCase();
  return notifications.filter((n) => n.type.toLowerCase() === normalizedType);
};

export const getNotificationsByPriority = (priority) => {
  if (!priority || typeof priority !== 'string') return [];
  const normalizedPriority = priority.trim().toLowerCase();
  return notifications.filter((n) => n.priority.toLowerCase() === normalizedPriority);
};

export const getNotificationsByStatus = (status) => {
  if (!status || typeof status !== 'string') return [];
  const normalizedStatus = status.trim().toLowerCase();
  return notifications.filter((n) => n.status.toLowerCase() === normalizedStatus);
};

export const getNotificationsByAudience = (audience) => {
  if (!audience || typeof audience !== 'string') return [];
  const normalizedAudience = audience.trim().toLowerCase();
  return notifications.filter((n) => n.audience.toLowerCase() === normalizedAudience);
};

export const getNotificationsByBranch = (branch) => {
  if (!branch || typeof branch !== 'string') return [];
  const normalizedBranch = branch.trim().toUpperCase();
  return notifications.filter((n) => n.branch.toUpperCase() === normalizedBranch);
};

export const getNotificationSummary = () => {
  const totalNotifications = notifications.length;
  const sentNotifications = notifications.filter((n) => n.status === 'Sent').length;
  const scheduledNotifications = notifications.filter((n) => n.status === 'Scheduled').length;
  const draftNotifications = notifications.filter((n) => n.status === 'Draft').length;

  const urgentNotifications = notifications.filter((n) => n.priority === 'Urgent').length;
  const importantNotifications = notifications.filter((n) => n.priority === 'Important').length;
  const normalNotifications = notifications.filter((n) => n.priority === 'Normal').length;

  return {
    totalNotifications,
    sentNotifications,
    scheduledNotifications,
    draftNotifications,
    urgentNotifications,
    importantNotifications,
    normalNotifications
  };
};

export const getTargetedNotifications = (filters = {}) => {
  let result = [...notifications];

  if (filters.type && typeof filters.type === 'string' && filters.type.trim()) {
    const targetType = filters.type.trim().toLowerCase();
    result = result.filter((n) => n.type.toLowerCase() === targetType);
  }

  if (filters.priority && typeof filters.priority === 'string' && filters.priority.trim()) {
    const targetPriority = filters.priority.trim().toLowerCase();
    result = result.filter((n) => n.priority.toLowerCase() === targetPriority);
  }

  if (filters.status && typeof filters.status === 'string' && filters.status.trim()) {
    const targetStatus = filters.status.trim().toLowerCase();
    result = result.filter((n) => n.status.toLowerCase() === targetStatus);
  }

  if (filters.audience && typeof filters.audience === 'string' && filters.audience.trim()) {
    const targetAudience = filters.audience.trim().toLowerCase();
    result = result.filter((n) => n.audience.toLowerCase() === targetAudience);
  }

  if (filters.branch && typeof filters.branch === 'string' && filters.branch.trim()) {
    const targetBranch = filters.branch.trim().toUpperCase();
    result = result.filter((n) => n.branch.toUpperCase() === targetBranch);
  }

  if (filters.driveId && typeof filters.driveId === 'string' && filters.driveId.trim()) {
    const targetDriveId = filters.driveId.trim().toUpperCase();
    result = result.filter((n) => n.driveId && n.driveId.toUpperCase() === targetDriveId);
  }

  return result;
};