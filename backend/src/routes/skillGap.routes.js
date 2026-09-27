import { Router } from 'express';
import { getSkillGapAnalysis } from '../controllers/skillGap.controller.js';

const router = Router();

// GET /api/skill-gap/student/:studentId/drive/:driveId
router.get('/student/:studentId/drive/:driveId', getSkillGapAnalysis);

export default router;