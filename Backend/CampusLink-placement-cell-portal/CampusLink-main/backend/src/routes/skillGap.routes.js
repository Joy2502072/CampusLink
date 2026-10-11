import { Router } from 'express';
import * as skillGapController from '../controllers/skillGap.controller.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = Router();

// Standard placement module authorization roles
const ALLOWED_ROLES = ['placement_officer', 'student', 'admin'];

// Primary Target Drive Skill Gap Analysis Endpoint
router.get(
  '/student/:studentId/drive/:driveId',
  authenticate,
  authorize(...ALLOWED_ROLES),
  skillGapController.getSkillGapAnalysis
);

// Fallback student overview route
router.get(
  '/student/:studentId',
  authenticate,
  authorize(...ALLOWED_ROLES),
  skillGapController.getStudentGeneralSkillGap
);

export default router;