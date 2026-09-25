import { analyzeStudentReadiness } from '../services/readiness.service.js';
import { sendResponse } from '../utils/response.js';

/**
 * GET /api/readiness/student/:studentId
 * Perform deterministic explainable readiness analysis for a student profile
 */
export const getStudentReadinessAnalysis = (req, res, next) => {
  try {
    const { studentId } = req.params;

    if (!studentId || typeof studentId !== 'string' || !studentId.trim()) {
      return sendResponse(res, 400, false, 'Invalid student ID parameter provided');
    }

    const normalizedId = studentId.trim().toUpperCase();
    const analysis = analyzeStudentReadiness(normalizedId);

    if (!analysis) {
      return sendResponse(res, 404, false, `Student ${normalizedId} not found.`);
    }

    return sendResponse(
      res,
      200,
      true,
      'Student readiness analysis fetched successfully',
      analysis
    );
  } catch (error) {
    next(error);
  }
};