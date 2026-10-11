import { Router } from 'express';
import {
  getOverview,
  getBranches,
  getPackages,
  getCompanies,
  getInsights
} from '../controllers/analytics.controller.js';

const router = Router();

// Route 1: Overall institutional placement metrics
router.get('/overview', getOverview);

// Route 2: Branch-wise placement conversion analytics
router.get('/branches', getBranches);

// Route 3: Salary package distribution and averages
router.get('/packages', getPackages);

// Route 4: Recruiter and company-level offer metrics
router.get('/companies', getCompanies);

// Route 5: Synthesized descriptive placement insights
router.get('/insights', getInsights);

export default router;