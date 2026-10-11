import * as readinessService from '../services/readiness.service.js';
import { sendResponse } from '../utils/response.js';

/**
 * GET /api/readiness/:studentId
 * Returns the authoritative student readiness evaluation.
 */
export async function getStudentReadiness(req, res, next) {
  try {
    const { studentId } = req.params;

    if (!studentId || !studentId.trim()) {
      return sendResponse(res, 400, false, 'Invalid or missing studentId parameter');
    }

    const evaluation = await readinessService.getStudentReadiness(studentId.trim());

    return sendResponse(
      res,
      200,
      true,
      'Student placement readiness evaluation completed successfully',
      evaluation
    );
  } catch (error) {
    if (error.message && error.message.includes('not found')) {
      return sendResponse(res, 404, false, error.message);
    }
    return next(error);
  }
}

/**
 * GET /api/readiness/student/:studentId
 * Alias route supporting explicit student path.
 */
export async function getStudentReadinessAlias(req, res, next) {
  return getStudentReadiness(req, res, next);
}

/**
 * GET /api/readiness/cohort
 * Returns aggregate cohort readiness metrics.
 */
export async function getCohortReadiness(req, res, next) {
  try {
    const cohortData = await readinessService.getCohortReadiness();
    return sendResponse(
      res,
      200,
      true,
      'Cohort readiness metrics retrieved successfully',
      cohortData
    );
  } catch (error) {
    return next(error);
  }
}

/**
 * GET /api/readiness/at-risk
 * Returns list of students currently flagged as at-risk.
 */
export async function getAtRiskStudents(req, res, next) {
  try {
    const atRiskList = await readinessService.getAtRiskStudents();
    return sendResponse(
      res,
      200,
      true,
      'At-risk students retrieved successfully',
      atRiskList
    );
  } catch (error) {
    return next(error);
  }
}

/**
 * POST /api/readiness/what-if
 * Non-destructive in-memory What-If simulation.
 */
export async function simulateWhatIfReadiness(req, res, next) {
  try {
    const { studentId, simulatedDimensions } = req.body;

    if (!studentId || typeof studentId !== 'string' || !studentId.trim()) {
      return sendResponse(res, 400, false, 'Valid studentId is required in request body');
    }

    if (
      simulatedDimensions !== undefined &&
      (typeof simulatedDimensions !== 'object' || simulatedDimensions === null || Array.isArray(simulatedDimensions))
    ) {
      return sendResponse(res, 400, false, 'simulatedDimensions must be a valid key-value object');
    }

    const simulation = await readinessService.simulateReadinessScore(
      studentId.trim(),
      simulatedDimensions || {}
    );

    return sendResponse(
      res,
      200,
      true,
      'What-If placement readiness simulation calculated successfully',
      simulation
    );
  } catch (error) {
    if (error.message && error.message.includes('not found')) {
      return sendResponse(res, 404, false, error.message);
    }
    return next(error);
  }
}