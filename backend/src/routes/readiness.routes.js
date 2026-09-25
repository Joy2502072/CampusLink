import { Router } from 'express';
import { getStudentReadinessAnalysis } from '../controllers/readiness.controller.js';

const router = Router();

// GET /api/readiness/student/:studentId
router.get('/student/:studentId', getStudentReadinessAnalysis);

export default router;