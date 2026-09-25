import {
  getAllNotifications as fetchAllNotifications,
  getNotificationById as fetchNotificationById,
  getNotificationsByType as fetchNotificationsByType,
  getNotificationsByPriority as fetchNotificationsByPriority,
  getNotificationsByStatus as fetchNotificationsByStatus,
  getNotificationsByAudience as fetchNotificationsByAudience,
  getNotificationsByBranch as fetchNotificationsByBranch,
  getNotificationSummary as fetchNotificationSummary,
  getTargetedNotifications as fetchTargetedNotifications
} from '../services/notification.service.js';
import { sendResponse } from '../utils/response.js';

export const getAllNotifications = (req, res, next) => {
  try {
    const data = fetchAllNotifications();
    return sendResponse(res, 200, true, 'Notifications fetched successfully', data);
  } catch (error) {
    next(error);
  }
};

export const getNotificationSummary = (req, res, next) => {
  try {
    const data = fetchNotificationSummary();
    return sendResponse(res, 200, true, 'Notification summary fetched successfully', data);
  } catch (error) {
    next(error);
  }
};

export const getTargetedNotifications = (req, res, next) => {
  try {
    const { type, priority, status, audience, branch, driveId } = req.query;
    const filters = { type, priority, status, audience, branch, driveId };
    const data = fetchTargetedNotifications(filters);
    return sendResponse(res, 200, true, 'Targeted notifications fetched successfully', data);
  } catch (error) {
    next(error);
  }
};

export const getNotificationsByType = (req, res, next) => {
  try {
    const { type } = req.params;
    if (!type || typeof type !== 'string' || !type.trim()) {
      return sendResponse(res, 400, false, 'Invalid notification type parameter provided');
    }
    const data = fetchNotificationsByType(type);
    return sendResponse(res, 200, true, `Notifications for type '${type.trim()}' fetched successfully`, data);
  } catch (error) {
    next(error);
  }
};

export const getNotificationsByPriority = (req, res, next) => {
  try {
    const { priority } = req.params;
    if (!priority || typeof priority !== 'string' || !priority.trim()) {
      return sendResponse(res, 400, false, 'Invalid notification priority parameter provided');
    }
    const data = fetchNotificationsByPriority(priority);
    return sendResponse(res, 200, true, `Notifications for priority '${priority.trim()}' fetched successfully`, data);
  } catch (error) {
    next(error);
  }
};

export const getNotificationsByStatus = (req, res, next) => {
  try {
    const { status } = req.params;
    if (!status || typeof status !== 'string' || !status.trim()) {
      return sendResponse(res, 400, false, 'Invalid notification status parameter provided');
    }
    const data = fetchNotificationsByStatus(status);
    return sendResponse(res, 200, true, `Notifications for status '${status.trim()}' fetched successfully`, data);
  } catch (error) {
    next(error);
  }
};

export const getNotificationsByAudience = (req, res, next) => {
  try {
    const { audience } = req.params;
    if (!audience || typeof audience !== 'string' || !audience.trim()) {
      return sendResponse(res, 400, false, 'Invalid notification audience parameter provided');
    }
    const data = fetchNotificationsByAudience(audience);
    return sendResponse(res, 200, true, `Notifications for audience '${audience.trim()}' fetched successfully`, data);
  } catch (error) {
    next(error);
  }
};

export const getNotificationsByBranch = (req, res, next) => {
  try {
    const { branch } = req.params;
    if (!branch || typeof branch !== 'string' || !branch.trim()) {
      return sendResponse(res, 400, false, 'Invalid notification branch parameter provided');
    }
    const data = fetchNotificationsByBranch(branch);
    return sendResponse(res, 200, true, `Notifications for branch '${branch.trim().toUpperCase()}' fetched successfully`, data);
  } catch (error) {
    next(error);
  }
};

export const getNotificationById = (req, res, next) => {
  try {
    const { id } = req.params;
    if (!id || typeof id !== 'string' || !id.trim()) {
      return sendResponse(res, 400, false, 'Invalid notification ID parameter provided');
    }

    const data = fetchNotificationById(id);
    if (!data) {
      return sendResponse(res, 404, false, 'Notification not found');
    }

    return sendResponse(res, 200, true, 'Notification fetched successfully', data);
  } catch (error) {
    next(error);
  }
};