import { Router } from 'express';

import * as readinessController from '../controllers/readiness.controller.js';

import { authenticate } from '../middleware/authenticate.js';
import { authorize } from '../middleware/authorize.js';

const router = Router();

// What-If Simulation
router.post(
  '/what-if',
  authenticate,
  authorize('placement_officer', 'student', 'admin'),
  readinessController.simulateWhatIfReadiness
);

// Cohort
router.get(
  '/cohort',
  authenticate,
  authorize('placement_officer', 'admin'),
  readinessController.getCohortReadiness
);

// At-Risk
router.get(
  '/at-risk',
  authenticate,
  authorize('placement_officer', 'admin'),
  readinessController.getAtRiskStudents
);

// Student alias
router.get(
  '/student/:studentId',
  authenticate,
  authorize('placement_officer', 'student', 'admin'),
  readinessController.getStudentReadinessAlias
);

// Student readiness
router.get(
  '/:studentId',
  authenticate,
  authorize('placement_officer', 'student', 'admin'),
  readinessController.getStudentReadiness
);

export default router;