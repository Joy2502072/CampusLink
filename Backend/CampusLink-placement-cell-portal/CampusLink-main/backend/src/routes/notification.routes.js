import express from 'express';

import {
  sendNotification,
  saveDraft,
  scheduleNotification,
  getAllNotifications,
  getNotificationSummary,
  getTargetedNotifications,
  getNotificationsByType,
  getNotificationsByPriority,
  getNotificationsByStatus,
  getNotificationsByAudience,
  getNotificationsByBranch,
  getNotificationById
} from '../controllers/notification.controller.js';

import { authenticate } from '../middleware/authenticate.js';
import { authorize } from '../middleware/authorize.js';

const router = express.Router();

// Authentication for all notification routes
router.use(authenticate);

// Write operations
router.post(
  '/',
  authorize('placement_officer', 'admin'),
  sendNotification
);

router.post(
  '/draft',
  authorize('placement_officer', 'admin'),
  saveDraft
);

router.post(
  '/schedule',
  authorize('placement_officer', 'admin'),
  scheduleNotification
);

// Read operations
router.get('/', getAllNotifications);
router.get('/summary', getNotificationSummary);
router.get('/targeted', getTargetedNotifications);

router.get('/type/:type', getNotificationsByType);
router.get('/priority/:priority', getNotificationsByPriority);
router.get('/status/:status', getNotificationsByStatus);
router.get('/audience/:audience', getNotificationsByAudience);
router.get('/branch/:branch', getNotificationsByBranch);

router.get('/:id', getNotificationById);

export default router;