import * as notificationService from '../services/notification.service.js';
import { sendResponse } from '../utils/response.js';

/**
 * POST /api/notifications
 * Creates and immediately sends a placement notification.
 */
export async function sendNotification(req, res, next) {
  try {
    const newNotification = await notificationService.sendNotificationNow(req.body || {});
    return sendResponse(
      res,
      201,
      true,
      'Notification sent successfully',
      newNotification
    );
  } catch (error) {
    if (
      error.message.includes('required') ||
      error.message.includes('must not exceed') ||
      error.message.includes('must be a non-negative integer')
    ) {
      return sendResponse(res, 400, false, error.message);
    }
    return next(error);
  }
}

/**
 * POST /api/notifications/draft
 * Saves a notification as a draft.
 */
export async function saveDraft(req, res, next) {
  try {
    const draftNotification = await notificationService.saveNotificationDraft(req.body || {});
    return sendResponse(
      res,
      201,
      true,
      'Notification draft saved successfully',
      draftNotification
    );
  } catch (error) {
    if (
      error.message.includes('required') ||
      error.message.includes('must not exceed') ||
      error.message.includes('must be a non-negative integer')
    ) {
      return sendResponse(res, 400, false, error.message);
    }
    return next(error);
  }
}

/**
 * POST /api/notifications/schedule
 * Schedules a notification for future dispatch.
 */
export async function scheduleNotification(req, res, next) {
  try {
    const scheduledNotification = await notificationService.scheduleNotification(req.body || {});
    return sendResponse(
      res,
      201,
      true,
      'Notification scheduled successfully',
      scheduledNotification
    );
  } catch (error) {
    if (
      error.message.includes('required') ||
      error.message.includes('Invalid scheduledFor') ||
      error.message.includes('must not exceed') ||
      error.message.includes('must be a non-negative integer')
    ) {
      return sendResponse(res, 400, false, error.message);
    }
    return next(error);
  }
}

/**
 * GET /api/notifications
 * Retrieves all notifications from MySQL.
 */
export async function getAllNotifications(req, res, next) {
  try {
    const data = await notificationService.getAllNotifications();
    return sendResponse(res, 200, true, 'Notifications retrieved successfully', data || []);
  } catch (error) {
    return next(error);
  }
}

/**
 * GET /api/notifications/summary
 * Retrieves legacy summary response contract and statistics.
 */
export async function getNotificationSummary(req, res, next) {
  try {
    const data = await notificationService.getNotificationSummary();
    return sendResponse(res, 200, true, 'Notification summary retrieved successfully', data);
  } catch (error) {
    return next(error);
  }
}

/**
 * GET /api/notifications/targeted
 * Retrieves targeted notifications filtered by optional query parameters:
 * ?priority=Urgent&branch=CSE&audience=...&status=...&type=...&driveId=...
 */
export async function getTargetedNotifications(req, res, next) {
  try {
    const filters = {
      priority: req.query.priority,
      branch: req.query.branch,
      audience: req.query.audience,
      status: req.query.status,
      type: req.query.type,
      driveId: req.query.driveId
    };

    const data = await notificationService.getTargetedNotifications(filters);
    return sendResponse(res, 200, true, 'Targeted notifications retrieved successfully', data || []);
  } catch (error) {
    return next(error);
  }
}

/**
 * GET /api/notifications/type/:type
 * Retrieves notifications filtered by category type.
 */
export async function getNotificationsByType(req, res, next) {
  try {
    const { type } = req.params;
    if (!type || !type.trim()) {
      return sendResponse(res, 400, false, 'Invalid notification type parameter');
    }

    const data = await notificationService.getNotificationsByType(type.trim());
    return sendResponse(res, 200, true, `Notifications for type ${type} retrieved successfully`, data || []);
  } catch (error) {
    return next(error);
  }
}

/**
 * GET /api/notifications/priority/:priority
 * Retrieves notifications filtered by priority level.
 */
export async function getNotificationsByPriority(req, res, next) {
  try {
    const { priority } = req.params;
    if (!priority || !priority.trim()) {
      return sendResponse(res, 400, false, 'Invalid notification priority parameter');
    }

    const data = await notificationService.getNotificationsByPriority(priority.trim());
    return sendResponse(res, 200, true, `Notifications for priority ${priority} retrieved successfully`, data || []);
  } catch (error) {
    return next(error);
  }
}

/**
 * GET /api/notifications/status/:status
 * Retrieves notifications filtered by status.
 */
export async function getNotificationsByStatus(req, res, next) {
  try {
    const { status } = req.params;
    if (!status || !status.trim()) {
      return sendResponse(res, 400, false, 'Invalid notification status parameter');
    }

    const data = await notificationService.getNotificationsByStatus(status.trim());
    return sendResponse(res, 200, true, `Notifications with status ${status} retrieved successfully`, data || []);
  } catch (error) {
    return next(error);
  }
}

/**
 * GET /api/notifications/audience/:audience
 * Retrieves notifications filtered by audience.
 */
export async function getNotificationsByAudience(req, res, next) {
  try {
    const { audience } = req.params;
    if (!audience || !audience.trim()) {
      return sendResponse(res, 400, false, 'Invalid notification audience parameter');
    }

    const data = await notificationService.getNotificationsByAudience(audience.trim());
    return sendResponse(res, 200, true, `Notifications for audience ${audience} retrieved successfully`, data || []);
  } catch (error) {
    return next(error);
  }
}

/**
 * GET /api/notifications/branch/:branch
 * Retrieves notifications filtered by academic branch.
 */
export async function getNotificationsByBranch(req, res, next) {
  try {
    const { branch } = req.params;
    if (!branch || !branch.trim()) {
      return sendResponse(res, 400, false, 'Invalid branch parameter');
    }

    const data = await notificationService.getNotificationsByBranch(branch.trim());
    return sendResponse(res, 200, true, `Notifications for branch ${branch} retrieved successfully`, data || []);
  } catch (error) {
    return next(error);
  }
}

/**
 * GET /api/notifications/:id
 * Retrieves a single notification by ID.
 */
export async function getNotificationById(req, res, next) {
  try {
    const { id } = req.params;
    if (!id || !id.trim()) {
      return sendResponse(res, 400, false, 'Invalid notification ID parameter');
    }

    const data = await notificationService.getNotificationById(id.trim());
    if (!data) {
      return sendResponse(res, 404, false, `Notification with ID ${id} not found`);
    }

    return sendResponse(res, 200, true, 'Notification retrieved successfully', data);
  } catch (error) {
    return next(error);
  }
}