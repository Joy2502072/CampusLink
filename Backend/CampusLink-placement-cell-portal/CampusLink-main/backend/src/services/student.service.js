import * as studentRepository from '../repositories/student.repository.js';
import { analyzeStudentReadinessWithData } from './readiness.service.js';

/**
 * Retrieves all students from the persistent MySQL database.
 * @returns {Promise<Array>} List of student objects.
 */
export async function getAllStudents() {
  return await studentRepository.findAllStudents();
}

/**
 * Retrieves a student by unique ID from the persistent MySQL database.
 * @param {string} id - Student ID
 * @returns {Promise<Object|null>} Student object or null if not found.
 */
export async function getStudentById(id) {
  if (!id || typeof id !== 'string') return null;
  return await studentRepository.findStudentById(id.trim());
}

/**
 * Retrieves all students belonging to a specified branch.
 * @param {string} branch - Academic branch code (e.g. CSE, ECE)
 * @returns {Promise<Array>} List of matching student objects.
 */
export async function getStudentsByBranch(branch) {
  if (!branch || typeof branch !== 'string') return [];
  return await studentRepository.findStudentsByBranch(branch.trim());
}

/**
 * Calculates deterministic placement readiness for a database-backed student.
 * Uses the existing explainable scoring algorithm adapted for database data.
 * @param {string} id - Student ID
 * @returns {Promise<Object|null>} Detailed readiness metrics or null if student not found.
 */
export async function getStudentReadiness(id) {
  const student = await getStudentById(id);
  if (!student) return null;

  return analyzeStudentReadinessWithData(student);
}