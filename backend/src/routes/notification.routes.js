import { Router } from 'express';
import {
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

const router = Router();

// Static routes declared first to avoid path collisions
router.get('/', getAllNotifications);
router.get('/summary', getNotificationSummary);
router.get('/targeted', getTargetedNotifications);

// Specialized filter routes
router.get('/type/:type', getNotificationsByType);
router.get('/priority/:priority', getNotificationsByPriority);
router.get('/status/:status', getNotificationsByStatus);
router.get('/audience/:audience', getNotificationsByAudience);
router.get('/branch/:branch', getNotificationsByBranch);

// Dynamic parameter route
router.get('/:id', getNotificationById);

export default router;