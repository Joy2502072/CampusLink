import { Router } from 'express';
import * as skillGapController from '../controllers/skillGap.controller.js';
import { authenticate } from '../middleware/authenticate.js';
import { authorize } from '../middleware/authorize.js';

const router = Router();

const ALLOWED_ROLES = ['placement_officer', 'student', 'admin'];

router.get(
  '/student/:studentId/drive/:driveId',
  authenticate,
  authorize(...ALLOWED_ROLES),
  skillGapController.getSkillGapAnalysis
);

router.get(
  '/student/:studentId',
  authenticate,
  authorize(...ALLOWED_ROLES),
  skillGapController.getStudentGeneralSkillGap
);

export default router;