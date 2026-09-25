import {
  detectScheduleConflicts,
  getDriveConflictDetails,
  findAlternativeSlots,
  getSchedulerSummary
} from '../services/scheduler.service.js';
import { sendResponse } from '../utils/response.js';

/**
 * GET /api/scheduler/conflicts
 * Retrieve all drives with calculated conflict information
 */
export const getAllConflicts = (req, res, next) => {
  try {
    const analysis = detectScheduleConflicts();
    const data = {
      totalDrives: analysis.totalDrives,
      conflictAffectedDrives: analysis.conflictAffectedDrives,
      conflictFreeDrives: analysis.conflictFreeDrives,
      conflictPairs: analysis.conflictPairs,
      criticalConflicts: analysis.criticalConflicts,
      highConflicts: analysis.highConflicts,
      mediumConflicts: analysis.mediumConflicts,
      drives: analysis.drives.map((d) => ({
        id: d.id,
        company: d.company,
        date: d.date,
        startTime: d.startTime,
        endTime: d.endTime,
        venue: d.venue,
        conflictSeverity: d.conflictSeverity,
        hasConflict: d.hasConflict,
        conflictReasons: d.conflictReasons,
        conflictingDriveIds: d.conflictingDriveIds
      }))
    };

    return sendResponse(res, 200, true, 'Scheduler conflicts fetched successfully', data);
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/scheduler/conflicts/:driveId
 * Retrieve detailed conflict information for a single placement drive
 */
export const getConflictByDriveId = (req, res, next) => {
  try {
    const { driveId } = req.params;

    if (!driveId || typeof driveId !== 'string' || !driveId.trim()) {
      return sendResponse(res, 400, false, 'Invalid drive ID parameter provided');
    }

    const result = getDriveConflictDetails(driveId);

    if (!result) {
      return sendResponse(res, 404, false, 'Placement drive not found');
    }

    return sendResponse(res, 200, true, 'Drive conflict details fetched successfully', result);
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/scheduler/alternatives/:driveId
 * Retrieve alternative scheduling options for the selected drive
 */
export const getAlternatives = (req, res, next) => {
  try {
    const { driveId } = req.params;

    if (!driveId || typeof driveId !== 'string' || !driveId.trim()) {
      return sendResponse(res, 400, false, 'Invalid drive ID parameter provided');
    }

    const alternatives = findAlternativeSlots(driveId);

    if (!alternatives) {
      return sendResponse(res, 404, false, 'Placement drive not found');
    }

    return sendResponse(res, 200, true, 'Alternative schedule options fetched successfully', alternatives);
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/scheduler/summary
 * Retrieve a compact scheduler dashboard summary
 */
export const getSummary = (req, res, next) => {
  try {
    const summary = getSchedulerSummary();
    return sendResponse(res, 200, true, 'Scheduler summary fetched successfully', summary);
  } catch (error) {
    next(error);
  }
};