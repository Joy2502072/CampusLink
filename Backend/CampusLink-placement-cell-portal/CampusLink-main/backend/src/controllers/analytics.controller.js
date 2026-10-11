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
 */
export const getOverview = async (req, res, next) => {
  try {
    const data = await getOverviewAnalytics();

    return sendResponse(
      res,
      200,
      true,
      'Placement overview analytics fetched successfully',
      data
    );
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/analytics/branches
 */
export const getBranches = async (req, res, next) => {
  try {
    const data = await getBranchAnalytics();

    return sendResponse(
      res,
      200,
      true,
      'Branch placement analytics fetched successfully',
      data
    );
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/analytics/packages
 */
export const getPackages = async (req, res, next) => {
  try {
    const data = await getPackageAnalytics();

    return sendResponse(
      res,
      200,
      true,
      'Compensation package analytics fetched successfully',
      data
    );
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/analytics/companies
 */
export const getCompanies = async (req, res, next) => {
  try {
    const data = await getCompanyAnalytics();

    return sendResponse(
      res,
      200,
      true,
      'Company placement analytics fetched successfully',
      data
    );
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/analytics/insights
 */
export const getInsights = async (req, res, next) => {
  try {
    const data = await getPlacementInsights();

    return sendResponse(
      res,
      200,
      true,
      'Placement analytics insights fetched successfully',
      data
    );
  } catch (error) {
    next(error);
  }
};