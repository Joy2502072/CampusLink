/**
 * CampusLink Backend - Skill Gap Analysis Controller
 */

import { analyzeSkillGap } from '../services/skillGap.service.js';
import { sendResponse } from '../utils/response.js';

/**
 * GET /api/skill-gap/student/:studentId/drive/:driveId
 * Returns deterministic skill-gap analysis, remediation plan, and what-if simulation
 */
export const getSkillGapAnalysis = (req, res, next) => {
  try {
    const { studentId, driveId } = req.params;

    if (!studentId || typeof studentId !== 'string' || !studentId.trim()) {
      return sendResponse(res, 400, false, 'Invalid student ID parameter provided');
    }

    if (!driveId || typeof driveId !== 'string' || !driveId.trim()) {
      return sendResponse(res, 400, false, 'Invalid placement drive ID parameter provided');
    }

    const result = analyzeSkillGap(studentId, driveId);

    if (result.error === 'invalid_student_id') {
      return sendResponse(res, 400, false, 'Invalid student ID parameter provided');
    }

    if (result.error === 'invalid_drive_id') {
      return sendResponse(res, 400, false, 'Invalid placement drive ID parameter provided');
    }

    if (result.error === 'student_not_found') {
      return sendResponse(res, 404, false, `Student ${studentId.trim().toUpperCase()} not found`);
    }

    if (result.error === 'drive_not_found') {
      return sendResponse(res, 404, false, `Placement drive ${driveId.trim().toUpperCase()} not found`);
    }

    return sendResponse(
      res,
      200,
      true,
      'Skill gap and improvement recommendation analysis fetched successfully',
      result
    );
  } catch (error) {
    next(error);
  }
};