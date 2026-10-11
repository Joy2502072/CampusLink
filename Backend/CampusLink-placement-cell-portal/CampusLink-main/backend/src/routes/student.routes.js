import { Router } from 'express';
import {
  getAllStudents,
  getStudentsByBranch,
  getStudentById,
  getStudentReadiness
} from '../controllers/student.controller.js';

const router = Router();

// Retrieve all students
router.get('/', getAllStudents);

// Specific sub-resource route declared before /:id to prevent matching collisions
router.get('/branch/:branch', getStudentsByBranch);

// Sub-resource readiness route declared before parent /:id route
router.get('/:id/readiness', getStudentReadiness);

// Individual student route
router.get('/:id', getStudentById);

export default router;