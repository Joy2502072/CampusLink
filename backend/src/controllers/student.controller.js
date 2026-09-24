import { students } from '../data/studentData.js';
import { sendResponse } from '../utils/response.js';

// Deterministic helper evaluating synthetic readiness tiers
const getReadinessStatus = (score) => {
  if (score >= 90) return 'Excellent';
  if (score >= 75) return 'Strong';
  if (score >= 60) return 'Developing';
  return 'Needs Improvement';
};

/**
 * GET /api/students
 * Retrieve all synthetic student profiles
 */
export const getAllStudents = (req, res, next) => {
  try {
    return sendResponse(res, 200, true, 'Students fetched successfully', students);
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/students/branch/:branch
 * Filter synthetic students by engineering discipline
 */
export const getStudentsByBranch = (req, res, next) => {
  try {
    const { branch } = req.params;

    if (!branch || typeof branch !== 'string' || branch.trim() === '') {
      return sendResponse(res, 400, false, 'Invalid branch parameter provided');
    }

    const normalizedBranch = branch.trim().toUpperCase();
    const branchStudents = students.filter(
      (s) => s.branch.toUpperCase() === normalizedBranch
    );

    return sendResponse(
      res,
      200,
      true,
      `Students for branch ${normalizedBranch} fetched successfully`,
      branchStudents
    );
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/students/:id
 * Retrieve single synthetic student by identifier
 */
export const getStudentById = (req, res, next) => {
  try {
    const { id } = req.params;

    if (!id || typeof id !== 'string' || id.trim() === '') {
      return sendResponse(res, 400, false, 'Invalid student ID parameter provided');
    }

    const normalizedId = id.trim().toUpperCase();
    const student = students.find((s) => s.id.toUpperCase() === normalizedId);

    if (!student) {
      return sendResponse(res, 404, false, 'Student not found');
    }

    return sendResponse(res, 200, true, 'Student fetched successfully', student);
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/students/:id/readiness
 * Retrieve deterministic readiness breakdown for single synthetic student
 */
export const getStudentReadiness = (req, res, next) => {
  try {
    const { id } = req.params;

    if (!id || typeof id !== 'string' || id.trim() === '') {
      return sendResponse(res, 400, false, 'Invalid student ID parameter provided');
    }

    const normalizedId = id.trim().toUpperCase();
    const student = students.find((s) => s.id.toUpperCase() === normalizedId);

    if (!student) {
      return sendResponse(res, 404, false, 'Student not found');
    }

    const readinessStatus = getReadinessStatus(student.readinessScore);

    const readinessData = {
      studentId: student.id,
      readinessScore: student.readinessScore,
      mockInterviewScore: student.mockInterviewScore,
      communicationScore: student.communicationScore,
      skillGap: student.skillGap,
      readinessStatus
    };

    return sendResponse(
      res,
      200,
      true,
      'Student readiness fetched successfully',
      readinessData
    );
  } catch (error) {
    next(error);
  }
};