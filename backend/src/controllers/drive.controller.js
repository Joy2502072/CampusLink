import { drives } from '../data/driveData.js';
import { sendResponse } from '../utils/response.js';

/**
 * GET /api/drives
 * Retrieve all synthetic placement drives
 */
export const getAllDrives = (req, res, next) => {
  try {
    return sendResponse(res, 200, true, 'Drives fetched successfully', drives);
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/drives/status/:status
 * Filter synthetic placement drives by status
 */
export const getDrivesByStatus = (req, res, next) => {
  try {
    const { status } = req.params;

    if (!status || typeof status !== 'string' || status.trim() === '') {
      return sendResponse(res, 400, false, 'Invalid status parameter provided');
    }

    const normalizedStatus = status.trim().toUpperCase();
    const filteredDrives = drives.filter(
      (d) => d.status.toUpperCase() === normalizedStatus
    );

    return sendResponse(
      res,
      200,
      true,
      `Drives with status '${status.trim()}' fetched successfully`,
      filteredDrives
    );
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/drives/branch/:branch
 * Return placement drives where the branch is included in eligibleBranches
 */
export const getDrivesByBranch = (req, res, next) => {
  try {
    const { branch } = req.params;

    if (!branch || typeof branch !== 'string' || branch.trim() === '') {
      return sendResponse(res, 400, false, 'Invalid branch parameter provided');
    }

    const normalizedBranch = branch.trim().toUpperCase();
    const eligibleDrives = drives.filter((d) =>
      d.eligibleBranches.some((b) => b.toUpperCase() === normalizedBranch)
    );

    return sendResponse(
      res,
      200,
      true,
      `Drives eligible for branch '${normalizedBranch}' fetched successfully`,
      eligibleDrives
    );
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/drives/:id/summary
 * Return a compact summary of the specified placement drive
 */
export const getDriveSummary = (req, res, next) => {
  try {
    const { id } = req.params;

    if (!id || typeof id !== 'string' || id.trim() === '') {
      return sendResponse(res, 400, false, 'Invalid drive ID parameter provided');
    }

    const normalizedId = id.trim().toUpperCase();
    const drive = drives.find((d) => d.id.toUpperCase() === normalizedId);

    if (!drive) {
      return sendResponse(res, 404, false, 'Placement drive not found');
    }

    const summaryData = {
      id: drive.id,
      company: drive.company,
      role: drive.role,
      date: drive.date,
      venue: drive.venue,
      status: drive.status,
      openings: drive.openings,
      applicants: drive.applicants,
      shortlisted: drive.shortlisted,
      packageLPA: drive.packageLPA
    };

    return sendResponse(
      res,
      200,
      true,
      'Drive summary fetched successfully',
      summaryData
    );
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/drives/:id
 * Retrieve single synthetic placement drive by identifier
 */
export const getDriveById = (req, res, next) => {
  try {
    const { id } = req.params;

    if (!id || typeof id !== 'string' || id.trim() === '') {
      return sendResponse(res, 400, false, 'Invalid drive ID parameter provided');
    }

    const normalizedId = id.trim().toUpperCase();
    const drive = drives.find((d) => d.id.toUpperCase() === normalizedId);

    if (!drive) {
      return sendResponse(res, 404, false, 'Placement drive not found');
    }

    return sendResponse(res, 200, true, 'Drive fetched successfully', drive);
  } catch (error) {
    next(error);
  }
};