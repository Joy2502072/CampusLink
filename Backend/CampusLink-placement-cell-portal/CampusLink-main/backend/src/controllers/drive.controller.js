import * as driveService from '../services/drive.service.js';
import { sendResponse } from '../utils/response.js';

/**
 * GET /api/drives
 * Retrieves list of all placement drives.
 */
export async function getAllDrives(req, res, next) {
  try {
    const drives = await driveService.getAllDrives();
    return sendResponse(res, 200, true, 'Placement drives retrieved successfully', drives);
  } catch (error) {
    console.error('Error fetching drives:', error.message);
    return sendResponse(res, 500, false, 'An error occurred while fetching placement drives');
  }
}

/**
 * GET /api/drives/:id
 * Retrieves a single placement drive by ID.
 */
export async function getDriveById(req, res, next) {
  try {
    const { id } = req.params;
    if (!id || !id.trim()) {
      return sendResponse(res, 400, false, 'Invalid drive ID parameter');
    }

    const drive = await driveService.getDriveById(id);
    if (!drive) {
      return sendResponse(res, 404, false, `Placement drive with ID ${id} not found`);
    }

    return sendResponse(res, 200, true, 'Placement drive retrieved successfully', drive);
  } catch (error) {
    console.error(`Error fetching drive ${req.params.id}:`, error.message);
    return sendResponse(res, 500, false, 'An error occurred while fetching placement drive details');
  }
}

/**
 * GET /api/drives/status/:status
 * Retrieves placement drives filtered by status.
 */
export async function getDrivesByStatus(req, res, next) {
  try {
    const { status } = req.params;
    if (!status || !status.trim()) {
      return sendResponse(res, 400, false, 'Invalid status parameter');
    }

    const drives = await driveService.getDrivesByStatus(status);
    return sendResponse(res, 200, true, `Drives with status ${status} retrieved successfully`, drives);
  } catch (error) {
    console.error(`Error fetching drives for status ${req.params.status}:`, error.message);
    return sendResponse(res, 500, false, 'An error occurred while fetching drives by status');
  }
}

/**
 * GET /api/drives/branch/:branch
 * Retrieves placement drives eligible for a specific branch.
 */
export async function getDrivesByBranch(req, res, next) {
  try {
    const { branch } = req.params;
    if (!branch || !branch.trim()) {
      return sendResponse(res, 400, false, 'Invalid branch parameter');
    }

    const drives = await driveService.getDrivesByBranch(branch);
    return sendResponse(res, 200, true, `Drives eligible for branch ${branch} retrieved successfully`, drives);
  } catch (error) {
    console.error(`Error fetching drives for branch ${req.params.branch}:`, error.message);
    return sendResponse(res, 500, false, 'An error occurred while fetching branch eligible drives');
  }
}

/**
 * GET /api/drives/:id/summary
 * Retrieves candidate eligibility metrics and summary for a drive.
 */
export async function getDriveSummary(req, res, next) {
  try {
    const { id } = req.params;
    if (!id || !id.trim()) {
      return sendResponse(res, 400, false, 'Invalid drive ID parameter');
    }

    const summary = await driveService.getDriveSummary(id);
    if (!summary) {
      return sendResponse(res, 404, false, `Placement drive with ID ${id} not found`);
    }

    return sendResponse(res, 200, true, 'Placement drive summary retrieved successfully', summary);
  } catch (error) {
    console.error(`Error fetching drive summary for ${req.params.id}:`, error.message);
    return sendResponse(res, 500, false, 'An error occurred while fetching placement drive summary');
  }
}