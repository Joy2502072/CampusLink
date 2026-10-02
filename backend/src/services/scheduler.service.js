import * as schedulerRepository from '../repositories/scheduler.repository.js';
import * as driveRepository from '../repositories/drive.repository.js';

/**
 * Converts a "HH:mm" time string into minutes since midnight.
 */
function timeToMinutes(timeStr) {
  if (!timeStr || typeof timeStr !== 'string') return 0;
  const parts = timeStr.trim().split(':');
  const hours = parseInt(parts[0], 10) || 0;
  const minutes = parseInt(parts[1], 10) || 0;
  return hours * 60 + minutes;
}

/**
 * Checks if two time intervals overlap strictly:
 * [startA, endA] and [startB, endB] overlap if startA < endB and endA > startB.
 */
function isTimeOverlapping(startA, endA, startB, endB) {
  const minStartA = timeToMinutes(startA);
  const minEndA = timeToMinutes(endA);
  const minStartB = timeToMinutes(startB);
  const minEndB = timeToMinutes(endB);

  return minStartA < minEndB && minEndA > minStartB;
}

/**
 * Compiles the active working schedule pool.
 * Combines explicit MySQL `drive_schedules` records with in-memory drive-level
 * fallback schedules for drives lacking explicit schedule records.
 * Does NOT insert fallback records automatically into MySQL.
 */
async function getEffectiveSchedules() {
  const [dbSchedules, allDrives] = await Promise.all([
    schedulerRepository.findAllSchedules(),
    driveRepository.findAllDrives()
  ]);

  const scheduledDriveIds = new Set(dbSchedules.map((s) => s.driveId));
  const effective = [...dbSchedules];

  // For drives without explicit schedule records, derive a virtual schedule from placement_drives
  allDrives.forEach((drive) => {
    if (!scheduledDriveIds.has(drive.id) && drive.date) {
      effective.push({
        id: `TEMP-SCH-${drive.id}`,
        driveId: drive.id,
        roundName: 'Recruitment Drive',
        roundNumber: 1,
        date: drive.date,
        startTime: drive.startTime || '09:30',
        endTime: drive.endTime || '17:00',
        venue: drive.venue || 'Campus Center',
        assignedResources: drive.requiredResources || [],
        status: drive.status || 'Scheduled',
        company: drive.company,
        role: drive.role,
        packageLPA: drive.packageLPA,
        eligibleBranches: drive.eligibleBranches || [],
        driveStatus: drive.status || ''
      });
    }
  });

  return { effectiveSchedules: effective, allDrives };
}

/**
 * Detects all deterministic scheduling conflicts from MySQL-backed schedules.
 * - Same venue + overlapping time + same date = Critical
 * - Shared assigned resource + overlapping time + same date = High
 * - Shared eligible branch + overlapping time + same date = Medium
 *
 * @returns {Promise<Array>} Array of conflict objects.
 */
export async function detectScheduleConflicts() {
  const { effectiveSchedules } = await getEffectiveSchedules();
  const conflicts = [];
  const processedPairs = new Set();

  for (let i = 0; i < effectiveSchedules.length; i++) {
    for (let j = i + 1; j < effectiveSchedules.length; j++) {
      const schA = effectiveSchedules[i];
      const schB = effectiveSchedules[j];

      // Exclude comparisons between rounds of the very same drive
      if (schA.driveId === schB.driveId) continue;

      // Must occur on the exact same calendar date
      if (schA.date !== schB.date) continue;

      // Must have overlapping time windows
      if (!isTimeOverlapping(schA.startTime, schA.endTime, schB.startTime, schB.endTime)) {
        continue;
      }

      const pairKey = [schA.id, schB.id].sort().join(':::');
      if (processedPairs.has(pairKey)) continue;

      // 1. Same Venue clash (Critical)
      const venueA = (schA.venue || '').trim().toLowerCase();
      const venueB = (schB.venue || '').trim().toLowerCase();
      const isVenueClash = venueA && venueB && venueA === venueB && venueA !== 'tbd';

      // 2. Shared Resource clash (High)
      const resA = (schA.assignedResources || []).map((r) => r.trim().toLowerCase());
      const resB = (schB.assignedResources || []).map((r) => r.trim().toLowerCase());
      const sharedResources = (schA.assignedResources || []).filter((r) =>
        resB.includes(r.trim().toLowerCase())
      );

      // 3. Shared Branch clash (Medium)
      const branchA = (schA.eligibleBranches || []).map((b) => b.trim().toUpperCase());
      const branchB = (schB.eligibleBranches || []).map((b) => b.trim().toUpperCase());
      const sharedBranches = (schA.eligibleBranches || []).filter((b) =>
        branchB.includes(b.trim().toUpperCase())
      );

      if (isVenueClash || sharedResources.length > 0 || sharedBranches.length > 0) {
        processedPairs.add(pairKey);

        let severity = 'Medium';
        let conflictType = 'Branch Contention';
        let description = `Concurrent drives on ${schA.date} split eligible candidates from branches: ${sharedBranches.join(', ')}.`;

        if (isVenueClash) {
          severity = 'Critical';
          conflictType = 'Venue Overlap';
          description = `Double-booking at ${schA.venue} between ${schA.company} and ${schB.company}.`;
        } else if (sharedResources.length > 0) {
          severity = 'High';
          conflictType = 'Resource Contention';
          description = `Logistical resource contention for: ${sharedResources.join(', ')}.`;
        }

        conflicts.push({
          id: `CONF-${schA.id}-${schB.id}`,
          severity,
          conflictType,
          date: schA.date,
          timeSlot: `${schA.startTime} - ${schA.endTime} vs ${schB.startTime} - ${schB.endTime}`,
          description,
          reason: description,
          affectedDrives: [
            {
              driveId: schA.driveId,
              company: schA.company,
              role: schA.role,
              roundName: schA.roundName,
              venue: schA.venue,
              startTime: schA.startTime,
              endTime: schA.endTime
            },
            {
              driveId: schB.driveId,
              company: schB.company,
              role: schB.role,
              roundName: schB.roundName,
              venue: schB.venue,
              startTime: schB.startTime,
              endTime: schB.endTime
            }
          ],
          conflictingResources: sharedResources,
          conflictingBranches: sharedBranches
        });
      }
    }
  }

  const severityOrder = { Critical: 3, High: 2, Medium: 1 };
  conflicts.sort((a, b) => (severityOrder[b.severity] || 0) - (severityOrder[a.severity] || 0));

  return conflicts;
}

/**
 * Returns scheduling details and any detected conflicts for a specific placement drive.
 * @param {string} driveId - Placement Drive ID
 * @returns {Promise<Object|null>}
 */
export async function getDriveConflictDetails(driveId) {
  if (!driveId) return null;

  const drive = await driveRepository.findDriveById(driveId);
  if (!drive) return null;

  let rounds = await schedulerRepository.findSchedulesByDriveId(driveId);

  // Fallback to drive-level schedule if no drive_schedules records exist yet
  if (rounds.length === 0 && drive.date) {
    rounds = [
      {
        id: `TEMP-SCH-${drive.id}`,
        driveId: drive.id,
        roundName: 'Recruitment Drive',
        roundNumber: 1,
        date: drive.date,
        startTime: drive.startTime || '09:30',
        endTime: drive.endTime || '17:00',
        venue: drive.venue || 'Campus Center',
        assignedResources: drive.requiredResources || [],
        status: drive.status || 'Scheduled',
        company: drive.company,
        role: drive.role,
        eligibleBranches: drive.eligibleBranches || []
      }
    ];
  }

  const allConflicts = await detectScheduleConflicts();
  const driveConflicts = allConflicts.filter((c) =>
    c.affectedDrives.some((d) => d.driveId.toUpperCase() === driveId.toUpperCase())
  );

  return {
    driveId: drive.id,
    company: drive.company,
    role: drive.role,
    packageLPA: drive.packageLPA,
    status: drive.status,
    schedule: rounds,
    hasConflicts: driveConflicts.length > 0,
    conflictCount: driveConflicts.length,
    conflicts: driveConflicts
  };
}

/**
 * Finds alternative non-conflicting slots for a drive.
 * @param {string} driveId - Placement Drive ID
 * @returns {Promise<Object|null>}
 */
export async function findAlternativeSlots(driveId) {
  if (!driveId) return null;

  const driveDetails = await getDriveConflictDetails(driveId);
  if (!driveDetails) return null;

  const { effectiveSchedules } = await getEffectiveSchedules();

  const CANDIDATE_VENUES = [
    'Seminar Hall A',
    'Seminar Hall B',
    'Auditorium Stage',
    'Lab 2 (60 systems)',
    'Placement Cell Boardroom'
  ];

  const CANDIDATE_TIMES = [
    { startTime: '09:00', endTime: '12:30' },
    { startTime: '13:30', endTime: '17:00' },
    { startTime: '10:00', endTime: '13:30' }
  ];

  const baseDateStr = driveDetails.schedule[0]?.date || '2026-10-15';
  const baseDate = new Date(baseDateStr);

  const testDates = [
    baseDateStr,
    new Date(baseDate.getTime() + 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    new Date(baseDate.getTime() + 48 * 60 * 60 * 1000).toISOString().split('T')[0],
    new Date(baseDate.getTime() + 72 * 60 * 60 * 1000).toISOString().split('T')[0]
  ];

  const alternatives = [];

  for (const date of testDates) {
    for (const slot of CANDIDATE_TIMES) {
      for (const venue of CANDIDATE_VENUES) {
        const isClashing = effectiveSchedules.some((sch) => {
          if (sch.driveId === driveId) return false;
          if (sch.date !== date) return false;

          const timeOverlap = isTimeOverlapping(
            slot.startTime,
            slot.endTime,
            sch.startTime,
            sch.endTime
          );
          const venueOverlap = (sch.venue || '').toLowerCase() === venue.toLowerCase();

          return timeOverlap && venueOverlap;
        });

        if (!isClashing) {
          alternatives.push({
            date,
            startTime: slot.startTime,
            endTime: slot.endTime,
            venue,
            availableCapacity: 120,
            status: 'Available',
            recommendationScore: date === baseDateStr ? 95 : 80
          });
        }

        if (alternatives.length >= 4) break;
      }
      if (alternatives.length >= 4) break;
    }
    if (alternatives.length >= 4) break;
  }

  return {
    driveId,
    conflictsDetected: driveDetails.hasConflicts,
    currentConflictsCount: driveDetails.conflictCount,
    alternatives
  };
}

/**
 * Returns global summary statistics of scheduled drives, rounds, and conflicts.
 * @returns {Promise<Object>}
 */
export async function getSchedulerSummary() {
  const [conflicts, { effectiveSchedules, allDrives }] = await Promise.all([
    detectScheduleConflicts(),
    getEffectiveSchedules()
  ]);

  const scheduledDriveIds = new Set(effectiveSchedules.map((s) => s.driveId));

  const critical = conflicts.filter((c) => c.severity === 'Critical').length;
  const high = conflicts.filter((c) => c.severity === 'High').length;
  const medium = conflicts.filter((c) => c.severity === 'Medium').length;

  const venueMap = new Map();
  effectiveSchedules.forEach((s) => {
    const v = s.venue || 'Unspecified';
    venueMap.set(v, (venueMap.get(v) || 0) + 1);
  });

  const venueUtilization = Array.from(venueMap.entries()).map(([venue, bookings]) => ({
    venue,
    bookings,
    status: bookings >= 3 ? 'High Contention' : 'Normal'
  }));

  const resourceMap = new Map();
  effectiveSchedules.forEach((s) => {
    (s.assignedResources || []).forEach((res) => {
      resourceMap.set(res, (resourceMap.get(res) || 0) + 1);
    });
  });

  const resourceUtilization = Array.from(resourceMap.entries()).map(([resource, bookings]) => ({
    resource,
    bookings,
    contentionLevel: bookings > 2 ? 'High' : 'Low'
  }));

  return {
    totalScheduledDrives: scheduledDriveIds.size || allDrives.length,
    totalRounds: effectiveSchedules.length,
    totalConflicts: conflicts.length,
    conflictBreakdown: {
      critical,
      high,
      medium
    },
    criticalConflicts: critical,
    highConflicts: high,
    mediumConflicts: medium,
    venueUtilization,
    resourceUtilization
  };
}