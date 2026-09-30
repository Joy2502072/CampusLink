
import * as driveRepository from '../repositories/drive.repository.js';
import * as studentRepository from '../repositories/student.repository.js';
import { students as fallbackStudents } from '../data/studentData.js';

/**
 * Retrieves all placement drives from MySQL.
 * @returns {Promise<Array>} List of drive objects.
 */
export async function getAllDrives() {
  return await driveRepository.findAllDrives();
}

/**
 * Retrieves a single placement drive by ID.
 * @param {string} id - Placement Drive ID (e.g. 'DRV-201')
 * @returns {Promise<Object|null>} Drive object or null if not found.
 */
export async function getDriveById(id) {
  if (!id || typeof id !== 'string') return null;
  return await driveRepository.findDriveById(id.trim());
}

/**
 * Retrieves placement drives filtered by recruitment status.
 * @param {string} status - Recruitment status (e.g. 'Confirmed', 'Upcoming', 'Completed')
 * @returns {Promise<Array>} List of matching drive objects.
 */
export async function getDrivesByStatus(status) {
  if (!status || typeof status !== 'string') return [];
  return await driveRepository.findDrivesByStatus(status.trim());
}

/**
 * Retrieves placement drives open for a given academic branch.
 * @param {string} branch - Academic department code (e.g. 'CSE', 'IT')
 * @returns {Promise<Array>} List of eligible drive objects.
 */
export async function getDrivesByBranch(branch) {
  if (!branch || typeof branch !== 'string') return [];
  return await driveRepository.findDrivesByBranch(branch.trim());
}

/**
 * Computes deterministic eligibility and cohort summary metrics for a drive.
 * Preserves the existing getDriveSummary calculation logic and response contract.
 *
 * @param {string} id - Placement Drive ID
 * @returns {Promise<Object|null>} Drive summary analytics or null if not found.
 */
export async function getDriveSummary(id) {
  if (!id || typeof id !== 'string') return null;

  const drive = await driveRepository.findDriveById(id.trim());
  if (!drive) return null;

  // Retrieve candidate cohort from MySQL student repository, with fallback to demo student dataset
  let candidatePool = [];
  try {
    candidatePool = await studentRepository.findAllStudents();
  } catch {
    candidatePool = fallbackStudents;
  }

  if (!Array.isArray(candidatePool) || candidatePool.length === 0) {
    candidatePool = fallbackStudents;
  }

  const eligibleBranches = Array.isArray(drive.eligibleBranches)
    ? drive.eligibleBranches.map((b) => String(b).trim().toUpperCase())
    : [];
  const minCgpa = typeof drive.minCgpa === 'number' ? drive.minCgpa : 0;

  const totalPool = candidatePool.length;

  const eligibleCandidates = candidatePool.filter((student) => {
    const studentBranch = (student.branch || '').trim().toUpperCase();
    const branchMatch = eligibleBranches.length === 0 || eligibleBranches.includes(studentBranch);
    const cgpaMatch = (Number(student.cgpa) || 0) >= minCgpa;
    return branchMatch && cgpaMatch;
  });

  const branchBreakdown = {};
  eligibleCandidates.forEach((cand) => {
    const b = cand.branch || 'Other';
    branchBreakdown[b] = (branchBreakdown[b] || 0) + 1;
  });

  return {
    driveId: drive.id,
    company: drive.company,
    role: drive.role,
    packageLPA: drive.packageLPA,
    status: drive.status,
    date: drive.date,
    venue: drive.venue,
    minCgpa: drive.minCgpa ?? 0,
    eligibleBranches: drive.eligibleBranches || [],
    requiredSkills: drive.requiredSkills || [],
    summaryMetrics: {
      totalCandidatePool: totalPool,
      eligibleCandidatesCount: eligibleCandidates.length,
      eligibilityPercentage: totalPool > 0
        ? Math.round((eligibleCandidates.length / totalPool) * 1000) / 10
        : 0,
      branchBreakdown
    }
  };
}
