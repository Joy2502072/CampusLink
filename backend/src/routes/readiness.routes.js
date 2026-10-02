import express from 'express';
import {
  getAtRiskStudentsCohort,
  getCohortReadiness,
  getStudentReadinessById
} from '../controllers/readiness.controller.js';

const router = express.Router();

// Specific routes MUST be declared before the dynamic /:studentId parameter
router.get('/at-risk', getAtRiskStudentsCohort);
router.get('/cohort', getCohortReadiness);
router.get('/:studentId', getStudentReadinessById);

export default router;