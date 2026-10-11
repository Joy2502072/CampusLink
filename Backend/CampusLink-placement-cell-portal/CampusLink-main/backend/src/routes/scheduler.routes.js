import { Router } from 'express';
import {
  getAllConflicts,
  getConflictByDriveId,
  getAlternatives,
  getSummary
} from '../controllers/scheduler.controller.js';

const router = Router();

// Static routes declared first to avoid path collisions with dynamic parameters
router.get('/conflicts', getAllConflicts);
router.get('/summary', getSummary);

// Dynamic routes
router.get('/conflicts/:driveId', getConflictByDriveId);
router.get('/alternatives/:driveId', getAlternatives);

export default router;