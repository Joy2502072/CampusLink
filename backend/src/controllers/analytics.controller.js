import {
  getOverviewAnalytics,
  getBranchAnalytics,
  getPackageAnalytics,
  getCompanyAnalytics,
  getPlacementInsights
} from '../services/analytics.service.js';
import { sendResponse } from '../utils/response.js';

/**
 * GET /api/analytics/overview
 * Retrieve comprehensive institutional placement overview metrics
 */
export const getOverview = (req, res, next) => {
  try {
    const data = getOverviewAnalytics();
    return sendResponse(res, 200, true, 'Placement overview analytics fetched successfully', data);
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/analytics/branches
 * Retrieve departmental and branch-wise placement metrics
 */
export const getBranches = (req, res, next) => {
  try {
    const data = getBranchAnalytics();
    return sendResponse(res, 200, true, 'Branch placement analytics fetched successfully', data);
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/analytics/packages
 * Retrieve compensation package distribution and statistics
 */
export const getPackages = (req, res, next) => {
  try {
    const data = getPackageAnalytics();
    return sendResponse(res, 200, true, 'Compensation package analytics fetched successfully', data);
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/analytics/companies
 * Retrieve company recruitment metrics and offer distributions
 */
export const getCompanies = (req, res, next) => {
  try {
    const data = getCompanyAnalytics();
    return sendResponse(res, 200, true, 'Company placement analytics fetched successfully', data);
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/analytics/insights
 * Retrieve key data-driven descriptive placement insights
 */
export const getInsights = (req, res, next) => {
  try {
    const data = getPlacementInsights();
    return sendResponse(res, 200, true, 'Placement analytics insights fetched successfully', data);
  } catch (error) {
    next(error);
  }
};