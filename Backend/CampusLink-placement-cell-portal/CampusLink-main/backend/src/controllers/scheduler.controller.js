import * as schedulerService from '../services/scheduler.service.js';
import { sendResponse } from '../utils/response.js';

/**
 * GET /api/scheduler/conflicts
 * Returns all detected scheduling conflicts.
 */
export async function getAllConflicts(req, res, next) {
  try {
    const conflicts = await schedulerService.detectScheduleConflicts();
    const criticalConflicts = conflicts.filter((c) => c.severity === 'Critical').length;
    const highConflicts = conflicts.filter((c) => c.severity === 'High').length;
    const mediumConflicts = conflicts.filter((c) => c.severity === 'Medium').length;

    return sendResponse(res, 200, true, 'Scheduling conflicts retrieved successfully', {
      totalConflicts: conflicts.length,
      criticalConflicts,
      highConflicts,
      mediumConflicts,
      conflicts
    });
  } catch (error) {
    return next(error);
  }
}

/**
 * GET /api/scheduler/conflicts/:driveId
 * Returns conflict details for a specific placement drive.
 */
export async function getConflictByDriveId(req, res, next) {
  try {
    const { driveId } = req.params;
    if (!driveId || !driveId.trim()) {
      return sendResponse(res, 400, false, 'Invalid drive ID parameter');
    }

    const data = await schedulerService.getDriveConflictDetails(driveId.trim());
    if (!data) {
      return sendResponse(res, 404, false, `Drive with ID ${driveId} not found`);
    }

    return sendResponse(res, 200, true, 'Drive conflict details retrieved successfully', data);
  } catch (error) {
    return next(error);
  }
}

/**
 * GET /api/scheduler/alternatives/:driveId
 * Returns alternative conflict-free slots for a conflicting placement drive.
 */
export async function getAlternatives(req, res, next) {
  try {
    const { driveId } = req.params;
    if (!driveId || !driveId.trim()) {
      return sendResponse(res, 400, false, 'Invalid drive ID parameter');
    }

    const data = await schedulerService.findAlternativeSlots(driveId.trim());
    if (!data) {
      return sendResponse(res, 404, false, `Drive with ID ${driveId} not found`);
    }

    return sendResponse(res, 200, true, 'Alternative schedule slots generated successfully', data);
  } catch (error) {
    return next(error);
  }
}

/**
 * GET /api/scheduler/summary
 * Returns global scheduler summary and facility/resource utilization metrics.
 */
export async function getSummary(req, res, next) {
  try {
    const data = await schedulerService.getSchedulerSummary();
    return sendResponse(res, 200, true, 'Scheduler summary retrieved successfully', data);
  } catch (error) {
    return next(error);
  }
}