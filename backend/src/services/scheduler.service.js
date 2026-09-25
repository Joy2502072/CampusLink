/**
 * CampusLink Backend - Scheduler & Conflict Management Service
 * 
 * NOTICE:
 * This service implements deterministic conflict detection and alternative slot
 * recommendations using the synthetic placement drive schedule dataset.
 * It detects venue collisions (Critical), resource overlaps (High), and branch
 * interview scheduling conflicts (Medium).
 */

import { drives } from '../data/driveData.js';

export const campusVenues = [
  "Seminar Hall A",
  "Seminar Hall B",
  "Auditorium 1",
  "Computer Lab 1",
  "Computer Lab 2",
  "Placement Interview Suite"
];

export const standardTimeSlots = [
  { startTime: "09:00", endTime: "11:30" },
  { startTime: "11:30", endTime: "14:00" },
  { startTime: "14:30", endTime: "17:00" },
  { startTime: "17:30", endTime: "20:00" }
];

const SEVERITY_WEIGHT = {
  "Critical": 4,
  "High": 3,
  "Medium": 2,
  "No Conflict": 1
};

/**
 * Converts a "HH:MM" string to minutes from midnight
 */
export const timeToMinutes = (timeStr) => {
  if (!timeStr || typeof timeStr !== 'string') return 0;
  const [hours, minutes] = timeStr.split(':').map(Number);
  return (hours || 0) * 60 + (minutes || 0);
};

/**
 * Evaluates whether two intervals overlap: max(startA, startB) < min(endA, endB)
 */
export const doTimesOverlap = (startA, endA, startB, endB) => {
  const aStart = timeToMinutes(startA);
  const aEnd = timeToMinutes(endA);
  const bStart = timeToMinutes(startB);
  const bEnd = timeToMinutes(endB);

  return Math.max(aStart, bStart) < Math.min(aEnd, bEnd);
};

/**
 * Evaluates the specific conflict between two drives on the same date and overlapping times.
 * Returns null if no conflict, or an object containing overall severity, specific reason types,
 * and detailed conflict messages.
 */
export const getConflictDetails = (driveA, driveB) => {
  if (driveA.id === driveB.id) return null;
  if (driveA.date !== driveB.date) return null;

  if (!doTimesOverlap(driveA.startTime, driveA.endTime, driveB.startTime, driveB.endTime)) {
    return null;
  }

  const reasons = [];
  let isVenueConflict = false;
  let isResourceConflict = false;
  let isBranchConflict = false;

  // 1. Venue Double-Booking (Critical)
  if (driveA.venue.trim().toLowerCase() === driveB.venue.trim().toLowerCase()) {
    isVenueConflict = true;
    reasons.push({
      type: "Venue",
      severity: "Critical",
      message: `Venue is double-booked with ${driveB.id} (${driveB.company}) at ${driveA.venue}.`
    });
  }

  // 2. Resource Collision (High)
  const resA = driveA.requiredResources || [];
  const resB = driveB.requiredResources || [];
  const sharedResources = resA.filter((r) =>
    resB.some((otherR) => otherR.trim().toLowerCase() === r.trim().toLowerCase())
  );

  if (sharedResources.length > 0) {
    isResourceConflict = true;
    reasons.push({
      type: "Resource",
      severity: "High",
      message: `Shared resource [${sharedResources.join(', ')}] requested concurrently with ${driveB.id} (${driveB.company}).`
    });
  }

  // 3. Branch Overlap (Medium)
  const branchesA = driveA.eligibleBranches || [];
  const branchesB = driveB.eligibleBranches || [];
  const sharedBranches = branchesA.filter((b) =>
    branchesB.some((otherB) => otherB.trim().toUpperCase() === b.trim().toUpperCase())
  );

  if (sharedBranches.length > 0) {
    isBranchConflict = true;
    reasons.push({
      type: "Branch",
      severity: "Medium",
      message: `Eligible students in [${sharedBranches.join(', ')}] have overlapping sessions with ${driveB.id} (${driveB.company}).`
    });
  }

  if (reasons.length === 0) {
    return null;
  }

  let severity = "Medium";
  if (isVenueConflict) {
    severity = "Critical";
  } else if (isResourceConflict) {
    severity = "High";
  }

  return {
    severity,
    reasons,
    isVenueConflict,
    isResourceConflict,
    isBranchConflict
  };
};

/**
 * Computes all unique pair conflicts and aggregates conflict metrics across the drive schedule.
 */
export const getConflictAnalysis = (allDrives = drives) => {
  const pairConflictMap = new Map();
  const driveConflictMap = new Map();

  allDrives.forEach((d) => {
    driveConflictMap.set(d.id, {
      reasons: [],
      conflictingDriveIds: new Set(),
      highestSeverity: "No Conflict"
    });
  });

  for (let i = 0; i < allDrives.length; i++) {
    for (let j = i + 1; j < allDrives.length; j++) {
      const driveA = allDrives[i];
      const driveB = allDrives[j];

      const conflict = getConflictDetails(driveA, driveB);
      if (conflict) {
        const pairKey = [driveA.id, driveB.id].sort().join(':::');
        pairConflictMap.set(pairKey, {
          driveAId: driveA.id,
          driveBId: driveB.id,
          severity: conflict.severity,
          isVenueConflict: conflict.isVenueConflict,
          isResourceConflict: conflict.isResourceConflict,
          isBranchConflict: conflict.isBranchConflict,
          reasonsA: conflict.reasons,
          reasonsB: getConflictDetails(driveB, driveA).reasons
        });

        // Register on drive A
        const recordA = driveConflictMap.get(driveA.id);
        recordA.conflictingDriveIds.add(driveB.id);
        conflict.reasons.forEach((r) => recordA.reasons.push(r));
        if (SEVERITY_WEIGHT[conflict.severity] > SEVERITY_WEIGHT[recordA.highestSeverity]) {
          recordA.highestSeverity = conflict.severity;
        }

        // Register on drive B
        const recordB = driveConflictMap.get(driveB.id);
        recordB.conflictingDriveIds.add(driveA.id);
        getConflictDetails(driveB, driveA).reasons.forEach((r) => recordB.reasons.push(r));
        if (SEVERITY_WEIGHT[conflict.severity] > SEVERITY_WEIGHT[recordB.highestSeverity]) {
          recordB.highestSeverity = conflict.severity;
        }
      }
    }
  }

  // Count unique pair metrics classified into exactly one primary dominant category
  let criticalConflicts = 0;
  let highConflicts = 0;
  let mediumConflicts = 0;
  let venueConflicts = 0;
  let resourceConflicts = 0;
  let branchConflicts = 0;

  for (const pair of pairConflictMap.values()) {
    if (pair.severity === "Critical") {
      criticalConflicts++;
      venueConflicts++;
    } else if (pair.severity === "High") {
      highConflicts++;
      resourceConflicts++;
    } else if (pair.severity === "Medium") {
      mediumConflicts++;
      branchConflicts++;
    }
  }

  const enrichedDrives = allDrives.map((drive) => {
    const analysis = driveConflictMap.get(drive.id);
    const hasConflict = analysis.conflictingDriveIds.size > 0;
    const conflictingDriveIds = Array.from(analysis.conflictingDriveIds).sort();

    return {
      id: drive.id,
      company: drive.company,
      role: drive.role,
      date: drive.date,
      startTime: drive.startTime,
      endTime: drive.endTime,
      venue: drive.venue,
      requiredResources: drive.requiredResources,
      eligibleBranches: drive.eligibleBranches,
      status: drive.status,
      packageLPA: drive.packageLPA,
      openings: drive.openings,
      applicants: drive.applicants,
      shortlisted: drive.shortlisted,
      description: drive.description,
      conflictSeverity: analysis.highestSeverity,
      hasConflict,
      conflictReasons: analysis.reasons,
      conflictingDriveIds
    };
  });

  // Sort: 1. Severity descending, 2. Date ascending, 3. startTime ascending, 4. ID ascending
  enrichedDrives.sort((a, b) => {
    const weightDiff = SEVERITY_WEIGHT[b.conflictSeverity] - SEVERITY_WEIGHT[a.conflictSeverity];
    if (weightDiff !== 0) return weightDiff;

    const dateDiff = a.date.localeCompare(b.date);
    if (dateDiff !== 0) return dateDiff;

    const timeDiff = a.startTime.localeCompare(b.startTime);
    if (timeDiff !== 0) return timeDiff;

    return a.id.localeCompare(b.id);
  });

  const conflictAffectedDrives = enrichedDrives.filter((d) => d.hasConflict).length;
  const conflictFreeDrives = enrichedDrives.length - conflictAffectedDrives;

  return {
    totalDrives: enrichedDrives.length,
    conflictAffectedDrives,
    conflictFreeDrives,
    conflictPairs: pairConflictMap.size,
    criticalConflicts,
    highConflicts,
    mediumConflicts,
    venueConflicts,
    resourceConflicts,
    branchConflicts,
    drives: enrichedDrives
  };
};

/**
 * Returns complete conflict analysis for all drives
 */
export const detectScheduleConflicts = (allDrives = drives) => {
  return getConflictAnalysis(allDrives);
};

/**
 * Returns detailed conflict status and list of conflicting drives for a single drive ID
 */
export const getDriveConflictDetails = (driveId, allDrives = drives) => {
  const normalizedId = driveId.trim().toUpperCase();
  const analysis = getConflictAnalysis(allDrives);
  const targetDrive = analysis.drives.find((d) => d.id.toUpperCase() === normalizedId);

  if (!targetDrive) return null;

  const conflictingDrives = analysis.drives.filter((d) =>
    targetDrive.conflictingDriveIds.includes(d.id)
  );

  return {
    drive: {
      id: targetDrive.id,
      company: targetDrive.company,
      role: targetDrive.role,
      date: targetDrive.date,
      startTime: targetDrive.startTime,
      endTime: targetDrive.endTime,
      venue: targetDrive.venue,
      requiredResources: targetDrive.requiredResources,
      eligibleBranches: targetDrive.eligibleBranches,
      status: targetDrive.status,
      packageLPA: targetDrive.packageLPA,
      openings: targetDrive.openings,
      applicants: targetDrive.applicants,
      shortlisted: targetDrive.shortlisted,
      description: targetDrive.description
    },
    hasConflict: targetDrive.hasConflict,
    conflictSeverity: targetDrive.conflictSeverity,
    conflictingDrives,
    conflictReasons: targetDrive.conflictReasons
  };
};

/**
 * Validates whether a proposed drive schedule triggers any venue, resource, or branch conflicts
 */
const hasAnyConflictForSlot = (candidateDrive, otherDrives) => {
  for (const other of otherDrives) {
    if (candidateDrive.id === other.id) continue;
    if (getConflictDetails(candidateDrive, other)) {
      return true;
    }
  }
  return false;
};

/**
 * Finds alternative venues and standard time slots for a given drive
 */
export const findAlternativeSlots = (driveId, allDrives = drives) => {
  const normalizedId = driveId.trim().toUpperCase();
  const currentDrive = allDrives.find((d) => d.id.toUpperCase() === normalizedId);

  if (!currentDrive) return null;

  const otherDrives = allDrives.filter((d) => d.id.toUpperCase() !== normalizedId);

  // A. Alternative venues (same date, same time)
  const validAlternativeVenues = [];
  for (const venue of campusVenues) {
    if (venue.trim().toLowerCase() === currentDrive.venue.trim().toLowerCase()) {
      continue;
    }

    const candidate = {
      ...currentDrive,
      venue
    };

    if (!hasAnyConflictForSlot(candidate, otherDrives)) {
      validAlternativeVenues.push({
        date: currentDrive.date,
        startTime: currentDrive.startTime,
        endTime: currentDrive.endTime,
        venue,
        conflictFree: true
      });
    }

    if (validAlternativeVenues.length === 3) break;
  }

  // B. Alternative standard time slots (same date, same venue)
  const validAlternativeTimeSlots = [];
  for (const slot of standardTimeSlots) {
    if (slot.startTime === currentDrive.startTime && slot.endTime === currentDrive.endTime) {
      continue;
    }

    const candidate = {
      ...currentDrive,
      startTime: slot.startTime,
      endTime: slot.endTime
    };

    if (!hasAnyConflictForSlot(candidate, otherDrives)) {
      validAlternativeTimeSlots.push({
        date: currentDrive.date,
        startTime: slot.startTime,
        endTime: slot.endTime,
        venue: currentDrive.venue,
        conflictFree: true
      });
    }

    if (validAlternativeTimeSlots.length === 3) break;
  }

  return {
    driveId: currentDrive.id,
    currentSchedule: {
      date: currentDrive.date,
      startTime: currentDrive.startTime,
      endTime: currentDrive.endTime,
      venue: currentDrive.venue
    },
    alternativeVenues: validAlternativeVenues,
    alternativeTimeSlots: validAlternativeTimeSlots
  };
};

/**
 * Returns a compact scheduler summary
 */
export const getSchedulerSummary = (allDrives = drives) => {
  const analysis = getConflictAnalysis(allDrives);

  return {
    totalDrives: analysis.totalDrives,
    conflictAffectedDrives: analysis.conflictAffectedDrives,
    conflictFreeDrives: analysis.conflictFreeDrives,
    criticalConflicts: analysis.criticalConflicts,
    highConflicts: analysis.highConflicts,
    mediumConflicts: analysis.mediumConflicts,
    venueConflicts: analysis.venueConflicts,
    resourceConflicts: analysis.resourceConflicts,
    branchConflicts: analysis.branchConflicts
  };
};