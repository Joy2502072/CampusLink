import * as matchingService from '../services/matching.service.js';
import * as studentRepository from '../repositories/student.repository.js';
import { sendResponse } from '../utils/response.js';

/**
 * Evaluates candidate matching against a specific recruitment drive.
 * GET /api/matching/student/:studentId/drive/:driveId
 */
export async function getStudentDriveMatch(req, res, next) {
  try {
    const { studentId, driveId } = req.params;

    if (!studentId || !studentId.trim()) {
      return sendResponse(res, 400, false, 'Invalid or missing studentId parameter');
    }
    if (!driveId || !driveId.trim()) {
      return sendResponse(res, 400, false, 'Invalid or missing driveId parameter');
    }

    const evaluation = await matchingService.evaluateStudentJobMatching(
      studentId.trim(),
      driveId.trim()
    );

    return sendResponse(
      res,
      200,
      true,
      'Student job match evaluation completed successfully',
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
 * Evaluates candidate matching across all active recruitment drives.
 * GET /api/matching/student/:studentId
 */
export async function getStudentMatchesForAllDrives(req, res, next) {
  try {
    const { studentId } = req.params;

    if (!studentId || !studentId.trim()) {
      return sendResponse(res, 400, false, 'Invalid or missing studentId parameter');
    }

    const evaluations = await matchingService.evaluateStudentAgainstAllDrives(
      studentId.trim()
    );

    return sendResponse(
      res,
      200,
      true,
      'Student evaluations across drives retrieved successfully',
      evaluations
    );
  } catch (error) {
    if (error.message && error.message.includes('not found')) {
      return sendResponse(res, 404, false, error.message);
    }
    return next(error);
  }
}

/**
 * Evaluates all students against a specific recruitment drive.
 * GET /api/matching/drive/:driveId
 */
export async function getDriveMatchesForAllStudents(req, res, next) {
  try {
    const { driveId } = req.params;

    if (!driveId || !driveId.trim()) {
      return sendResponse(res, 400, false, 'Invalid or missing driveId parameter');
    }

    const cleanDriveId = driveId.trim();
    const students = await studentRepository.findAllStudents();

    if (!students || students.length === 0) {
      return sendResponse(
        res,
        200,
        true,
        'Drive match evaluations retrieved successfully',
        []
      );
    }

    const evaluations = [];
    for (const student of students) {
      try {
        const evaluation = await matchingService.evaluateStudentJobMatching(
          student.id,
          cleanDriveId
        );
        evaluations.push(evaluation);
      } catch (err) {
        // If drive itself does not exist, bubble the 404
        if (err.message && err.message.includes(`Placement drive with ID ${cleanDriveId} not found`)) {
          return sendResponse(res, 404, false, err.message);
        }
        // Otherwise skip problematic individual records
      }
    }

    evaluations.sort((a, b) => b.overallMatchScore - a.overallMatchScore);

    return sendResponse(
      res,
      200,
      true,
      'Drive match evaluations retrieved successfully',
      evaluations
    );
  } catch (error) {
    if (error.message && error.message.includes('not found')) {
      return sendResponse(res, 404, false, error.message);
    }
    return next(error);
  }
}