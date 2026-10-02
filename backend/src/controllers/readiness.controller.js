import * as readinessService from '../services/readiness.service.js';
import { sendResponse } from '../utils/response.js';

/**
 * GET /api/readiness/at-risk
 * Retrieves at-risk student intervention cohort evaluated from MySQL data.
 */
export async function getAtRiskStudentsCohort(req, res, next) {
  try {
    const data = await readinessService.getAtRiskStudents();
    return sendResponse(res, 200, true, 'At-risk students evaluated successfully from MySQL data', data);
  } catch (error) {
    return next(error);
  }
}

/**
 * GET /api/readiness/cohort
 * Retrieves aggregate readiness distribution across student cohort.
 */
export async function getCohortReadiness(req, res, next) {
  try {
    const data = await readinessService.getCohortReadiness();
    return sendResponse(res, 200, true, 'Cohort readiness metrics retrieved successfully', data);
  } catch (error) {
    return next(error);
  }
}

/**
 * GET /api/readiness/:studentId
 * Retrieves detailed readiness report for a specific student.
 */
export async function getStudentReadinessById(req, res, next) {
  try {
    const { studentId } = req.params;
    if (!studentId || !studentId.trim()) {
      return sendResponse(res, 400, false, 'Invalid student ID parameter');
    }

    const data = await readinessService.getStudentReadiness(studentId.trim());
    if (!data) {
      return sendResponse(res, 404, false, `Student with ID ${studentId} not found`);
    }

    return sendResponse(res, 200, true, 'Student readiness evaluation retrieved successfully', data);
  } catch (error) {
    return next(error);
  }
}