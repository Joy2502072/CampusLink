import * as skillGapService from '../services/skillGap.service.js';
import { sendResponse } from '../utils/response.js';

/**
 * GET /api/skill-gap/student/:studentId/drive/:driveId
 * Evaluates skill gap analysis between a student's verified profile and a target drive's requirements.
 */
export async function getSkillGapAnalysis(req, res, next) {
  try {
    const { studentId, driveId } = req.params;

    if (!studentId || !studentId.trim()) {
      return sendResponse(res, 400, false, 'Student ID parameter is required');
    }

    if (!driveId || !driveId.trim()) {
      return sendResponse(res, 400, false, 'Drive ID parameter is required');
    }

    const analysis = await skillGapService.analyzeSkillGap(
      studentId.trim(),
      driveId.trim()
    );

    return sendResponse(
      res,
      200,
      true,
      'Skill gap and improvement recommendation analysis fetched successfully',
      analysis
    );
  } catch (error) {
    if (error.message && error.message.includes('not found')) {
      return sendResponse(res, 404, false, error.message);
    }
    return next(error);
  }
}

/**
 * GET /api/skill-gap/student/:studentId
 * Optional convenience endpoint to evaluate general student skill requirements against active drives.
 */
export async function getStudentGeneralSkillGap(req, res, next) {
  try {
    const { studentId } = req.params;

    if (!studentId || !studentId.trim()) {
      return sendResponse(res, 400, false, 'Student ID parameter is required');
    }

    // If drives query is omitted, evaluate against the first active drive or return summary
    const analysis = await skillGapService.analyzeSkillGap(
      studentId.trim(),
      req.query.driveId || 'DRV-201'
    );

    return sendResponse(
      res,
      200,
      true,
      'General student skill gap evaluation fetched successfully',
      analysis
    );
  } catch (error) {
    if (error.message && error.message.includes('not found')) {
      return sendResponse(res, 404, false, error.message);
    }
    return next(error);
  }
}