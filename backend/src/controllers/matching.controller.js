import { students } from '../data/studentData.js';
import { drives } from '../data/driveData.js';
import { calculateStudentDriveMatch } from '../services/matching.service.js';
import { sendResponse } from '../utils/response.js';

/**
 * GET /api/matching/student/:studentId/drive/:driveId
 * Retrieve detailed explainable match breakdown between a specific student and drive
 */
export const getStudentDriveMatch = (req, res, next) => {
  try {
    const { studentId, driveId } = req.params;

    if (!studentId || typeof studentId !== 'string' || !studentId.trim()) {
      return sendResponse(res, 400, false, 'Invalid student ID parameter provided');
    }

    if (!driveId || typeof driveId !== 'string' || !driveId.trim()) {
      return sendResponse(res, 400, false, 'Invalid drive ID parameter provided');
    }

    const normalizedStudentId = studentId.trim().toUpperCase();
    const normalizedDriveId = driveId.trim().toUpperCase();

    const student = students.find((s) => s.id.toUpperCase() === normalizedStudentId);
    if (!student) {
      return sendResponse(res, 404, false, 'Student not found');
    }

    const drive = drives.find((d) => d.id.toUpperCase() === normalizedDriveId);
    if (!drive) {
      return sendResponse(res, 404, false, 'Placement drive not found');
    }

    const matchResult = calculateStudentDriveMatch(student, drive);

    return sendResponse(
      res,
      200,
      true,
      `Match analysis for student ${student.id} and drive ${drive.id} calculated successfully`,
      matchResult
    );
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/matching/student/:studentId
 * Retrieve match results between a specific student and all active placement drives
 */
export const getStudentMatchesForAllDrives = (req, res, next) => {
  try {
    const { studentId } = req.params;

    if (!studentId || typeof studentId !== 'string' || !studentId.trim()) {
      return sendResponse(res, 400, false, 'Invalid student ID parameter provided');
    }

    const normalizedStudentId = studentId.trim().toUpperCase();
    const student = students.find((s) => s.id.toUpperCase() === normalizedStudentId);

    if (!student) {
      return sendResponse(res, 404, false, 'Student not found');
    }

    const matches = drives.map((drive) => calculateStudentDriveMatch(student, drive));

    // Order descending by overallMatchScore
    matches.sort((a, b) => b.overallMatchScore - a.overallMatchScore);

    return sendResponse(
      res,
      200,
      true,
      `Placement drive matches for student ${student.id} retrieved successfully`,
      {
        studentId: student.id,
        studentName: student.name,
        branch: student.branch,
        totalDrivesEvaluated: drives.length,
        matches
      }
    );
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/matching/drive/:driveId
 * Retrieve match results between a specific placement drive and all candidates
 */
export const getDriveMatchesForAllStudents = (req, res, next) => {
  try {
    const { driveId } = req.params;

    if (!driveId || typeof driveId !== 'string' || !driveId.trim()) {
      return sendResponse(res, 400, false, 'Invalid drive ID parameter provided');
    }

    const normalizedDriveId = driveId.trim().toUpperCase();
    const drive = drives.find((d) => d.id.toUpperCase() === normalizedDriveId);

    if (!drive) {
      return sendResponse(res, 404, false, 'Placement drive not found');
    }

    const candidateMatches = students.map((student) => calculateStudentDriveMatch(student, drive));

    // Order descending by overallMatchScore
    candidateMatches.sort((a, b) => b.overallMatchScore - a.overallMatchScore);

    return sendResponse(
      res,
      200,
      true,
      `Candidate matches for drive ${drive.id} (${drive.company}) retrieved successfully`,
      {
        driveId: drive.id,
        company: drive.company,
        role: drive.role,
        eligibleBranches: drive.eligibleBranches,
        totalCandidatesEvaluated: students.length,
        candidateMatches
      }
    );
  } catch (error) {
    next(error);
  }
};