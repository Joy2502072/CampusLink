import * as studentService from '../services/student.service.js';
import { sendResponse } from '../utils/response.js';

/**
 * GET /api/students
 * Retrieves list of all students.
 */
export async function getAllStudents(req, res, next) {
  try {
    const students = await studentService.getAllStudents();
    return sendResponse(res, 200, true, 'Students retrieved successfully', students);
  } catch (error) {
    console.error('Error fetching students:', error.message);
    return sendResponse(res, 500, false, 'An error occurred while fetching students');
  }
}

/**
 * GET /api/students/:id
 * Retrieves a single student by ID.
 */
export async function getStudentById(req, res, next) {
  try {
    const { id } = req.params;
    if (!id || !id.trim()) {
      return sendResponse(res, 400, false, 'Invalid student ID parameter');
    }

    const student = await studentService.getStudentById(id);
    if (!student) {
      return sendResponse(res, 404, false, `Student with ID ${id} not found`);
    }

    return sendResponse(res, 200, true, 'Student retrieved successfully', student);
  } catch (error) {
    console.error(`Error fetching student ${req.params.id}:`, error.message);
    return sendResponse(res, 500, false, 'An error occurred while fetching student details');
  }
}

/**
 * GET /api/students/branch/:branch
 * Retrieves students filtered by branch department.
 */
export async function getStudentsByBranch(req, res, next) {
  try {
    const { branch } = req.params;
    if (!branch || !branch.trim()) {
      return sendResponse(res, 400, false, 'Invalid branch parameter');
    }

    const students = await studentService.getStudentsByBranch(branch);
    return sendResponse(res, 200, true, `Students in branch ${branch} retrieved successfully`, students);
  } catch (error) {
    console.error(`Error fetching students for branch ${req.params.branch}:`, error.message);
    return sendResponse(res, 500, false, 'An error occurred while fetching branch students');
  }
}

/**
 * GET /api/students/:id/readiness
 * Retrieves explainable readiness scoring for a student.
 */
export async function getStudentReadiness(req, res, next) {
  try {
    const { id } = req.params;
    if (!id || !id.trim()) {
      return sendResponse(res, 400, false, 'Invalid student ID parameter');
    }

    const readiness = await studentService.getStudentReadiness(id);
    if (!readiness) {
      return sendResponse(res, 404, false, `Student with ID ${id} not found`);
    }

    return sendResponse(res, 200, true, 'Student readiness analysis calculated successfully', readiness);
  } catch (error) {
    console.error(`Error calculating readiness for student ${req.params.id}:`, error.message);
    return sendResponse(res, 500, false, 'An error occurred while calculating student readiness');
  }
}