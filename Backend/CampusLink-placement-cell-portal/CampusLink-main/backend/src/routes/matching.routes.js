import { Router } from 'express';
import {
  getStudentDriveMatch,
  getStudentMatchesForAllDrives,
  getDriveMatchesForAllStudents
} from '../controllers/matching.controller.js';

const router = Router();

// Route 1: Specific Student + Specific Drive match evaluation
router.get('/student/:studentId/drive/:driveId', getStudentDriveMatch);

// Route 2: Single Student evaluated against all placement drives
router.get('/student/:studentId', getStudentMatchesForAllDrives);

// Route 3: Single Placement Drive evaluated against all candidate students
router.get('/drive/:driveId', getDriveMatchesForAllStudents);

export default router;