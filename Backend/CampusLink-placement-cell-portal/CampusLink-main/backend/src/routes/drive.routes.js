import { Router } from 'express';
import {
  getAllDrives,
  getDrivesByStatus,
  getDrivesByBranch,
  getDriveSummary,
  getDriveById
} from '../controllers/drive.controller.js';

const router = Router();

// Retrieve all drives
router.get('/', getAllDrives);

// Specific sub-resource & query routes declared before /:id to prevent matching collisions
router.get('/status/:status', getDrivesByStatus);
router.get('/branch/:branch', getDrivesByBranch);
router.get('/:id/summary', getDriveSummary);

// Individual drive route
router.get('/:id', getDriveById);

export default router;