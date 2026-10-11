/*
 * CampusLink Placement Portal - Mock Simulation Data Layer
 *
 * NOTICE:
 * All records herein are purely synthetic and generated for demonstration purposes.
 * Student identifiers (DEMO-STU-XXX), corporate associations, and compensation figures
 * are fictitious. No personal or proprietary records are included.
 *
 * API INTEGRATION READY:
 * Future backend phase will replace this static export with authenticated HTTP client
 * calls secured with HTTP-only cookies.
 */

// ==========================================
// PHASE 1: PLACEMENT OVERVIEW
// ==========================================

export const placementOverviewStats = {
  totalStudents: 1280,
  activeDrives: 14,
  studentsPlaced: 896,
  placementRate: 70.0,
  averagePackage: 8.4,
  highestPackage: 44.0,
  batchYear: "2025-2026",
  isSyntheticDemo: true
};

// Strict consistency check:
// 360+240+280+160+140+100 = 1280 Total
// 310+198+196+94+58+40 = 896 Placed.
export const branchWiseConversion = [
  { branch: "CSE", total: 360, placed: 310, rate: 86.1 },
  { branch: "IT", total: 240, placed: 198, rate: 82.5 },
  { branch: "ECE", total: 280, placed: 196, rate: 70.0 },
  { branch: "EE", total: 160, placed: 94, rate: 58.75 },
  { branch: "MECH", total: 140, placed: 58, rate: 41.4 },
  { branch: "CIVIL", total: 100, placed: 40, rate: 40.0 }
];

export const salaryTrends = [
  { year: "2021", avg: 5.2, median: 4.8, highest: 24.0, isProjection: false },
  { year: "2022", avg: 6.1, median: 5.5, highest: 32.0, isProjection: false },
  { year: "2023", avg: 7.2, median: 6.4, highest: 38.5, isProjection: false },
  { year: "2024", avg: 7.9, median: 7.0, highest: 42.0, isProjection: false },
  { year: "2025", avg: 8.4, median: 7.5, highest: 44.0, isProjection: false },
  { year: "2026 (Proj.)", avg: 9.1, median: 8.0, highest: 48.0, isProjection: true }
];

export const activePlacementDrives = [
  {
    id: "DEMO-DRV-101",
    company: "Apex Cloud Technologies",
    role: "Associate Software Engineer",
    packageLPA: "32 - 44 LPA",
    eligibility: "CSE, IT, ECE (CGPA >= 8.0)",
    status: "Interview Round 2",
    date: "Sep 26, 2026",
    appliedCount: 142,
    badgeColor: "emerald"
  },
  {
    id: "DEMO-DRV-102",
    company: "Nexus Core Systems",
    role: "Support Escalation Engineer",
    packageLPA: "18 - 24 LPA",
    eligibility: "All Tech Branches",
    status: "Online Assessment",
    date: "Sep 28, 2026",
    appliedCount: 289,
    badgeColor: "blue"
  },
  {
    id: "DEMO-DRV-103",
    company: "Zenith Digital Services",
    role: "Systems Engineer (Digital)",
    packageLPA: "7.5 - 9.0 LPA",
    eligibility: "All Branches (CGPA >= 6.5)",
    status: "Document Verification",
    date: "Oct 02, 2026",
    appliedCount: 512,
    badgeColor: "amber"
  },
  {
    id: "DEMO-DRV-104",
    company: "Titan Heavy Engineering",
    role: "Graduate Engineer Trainee",
    packageLPA: "6.5 - 7.5 LPA",
    eligibility: "MECH, CIVIL, EE",
    status: "Registration Open",
    date: "Oct 05, 2026",
    appliedCount: 184,
    badgeColor: "violet"
  }
];

export const recentActivities = [
  {
    id: "DEMO-ACT-01",
    studentName: "Demo Student A",
    syntheticId: "DEMO-STU-001",
    branch: "CSE",
    company: "Apex Cloud Technologies",
    packageLPA: "28.5 LPA",
    status: "Offer Accepted",
    timestamp: "Simulated 12m ago"
  },
  {
    id: "DEMO-ACT-02",
    studentName: "Demo Student B",
    syntheticId: "DEMO-STU-002",
    branch: "IT",
    company: "Zenith Digital Services",
    packageLPA: "14.0 LPA",
    status: "Offer Released",
    timestamp: "Simulated 45m ago"
  },
  {
    id: "DEMO-ACT-03",
    studentName: "Demo Student C",
    syntheticId: "DEMO-STU-003",
    branch: "ECE",
    company: "Nexus Core Systems",
    packageLPA: "19.2 LPA",
    status: "Shortlisted for HR",
    timestamp: "Simulated 2h ago"
  },
  {
    id: "DEMO-ACT-04",
    studentName: "Demo Student D",
    syntheticId: "DEMO-STU-004",
    branch: "MECH",
    company: "Titan Heavy Engineering",
    packageLPA: "8.2 LPA",
    status: "Offer Accepted",
    timestamp: "Simulated 3h ago"
  },
  {
    id: "DEMO-ACT-05",
    studentName: "Demo Student E",
    syntheticId: "DEMO-STU-005",
    branch: "EE",
    company: "Voltaic Energy Works",
    packageLPA: "10.5 LPA",
    status: "Offer Released",
    timestamp: "Simulated 5h ago"
  }
];

// ==========================================
// PHASE 2: AT-RISK STUDENT MONITORING
// ==========================================

export function calculateRiskScoreAndLevel(student) {
  const readinessDeficit =
    ((100 - student.readinessScore) / 100) * 30;

  const mockDeficit =
    ((100 - student.mockInterviewScore) / 100) * 25;

  const appInactivity =
    (Math.max(0, 10 - student.applications) / 10) * 15;

  const rejectionRatio =
    (student.rejections / Math.max(1, student.applications)) * 15;

  let skillGapPoints = 2;

  if (student.skillGap === "High") {
    skillGapPoints = 15;
  } else if (student.skillGap === "Medium") {
    skillGapPoints = 8;
  }

  const rawScore =
    readinessDeficit +
    mockDeficit +
    appInactivity +
    rejectionRatio +
    skillGapPoints;

  const riskScore = Math.min(
    100,
    Math.max(0, Math.round(rawScore))
  );

  let riskLevel = "Low";

  if (riskScore >= 61) {
    riskLevel = "High";
  } else if (riskScore >= 31) {
    riskLevel = "Medium";
  }

  return {
    riskScore,
    riskLevel
  };
}

export const rawAtRiskStudents = [
  {
    studentId: "DEMO-STU-021",
    name: "Demo Student K",
    branch: "CSE",
    cgpa: 7.2,
    readinessScore: 48,
    mockInterviewScore: 42,
    applications: 3,
    shortlisted: 0,
    rejections: 3,
    skillGap: "High",
    riskReasons: [
      "Readiness score (48%) falls significantly below institutional target of 70%",
      "Mock interview score (42%) indicates need for core communication practice",
      "Low application throughput: only 3 active drives applied to date",
      "High skill gap flagged in System Design & Core DSA assessments"
    ],
    recommendedAction: "Schedule Mentor Intervention"
  },
  {
    studentId: "DEMO-STU-022",
    name: "Demo Student L",
    branch: "ECE",
    cgpa: 6.8,
    readinessScore: 52,
    mockInterviewScore: 45,
    applications: 4,
    shortlisted: 0,
    rejections: 4,
    skillGap: "High",
    riskReasons: [
      "Consecutive 4 rejections in initial aptitude & technical screening rounds",
      "Mock interview score (45%) requires targeted domain revision",
      "Readiness score (52%) below preferred drive baseline",
      "Core embedded systems skills require diagnostic reassessment"
    ],
    recommendedAction: "Recommend Skill Training"
  },
  {
    studentId: "DEMO-STU-023",
    name: "Demo Student M",
    branch: "IT",
    cgpa: 7.5,
    readinessScore: 55,
    mockInterviewScore: 50,
    applications: 2,
    shortlisted: 0,
    rejections: 2,
    skillGap: "High",
    riskReasons: [
      "Extremely low drive participation (only 2 applications submitted)",
      "Technical readiness (55%) needs consolidation in web frameworks",
      "No successful shortlists across completed assessment windows",
      "Requires one-on-one placement strategy counseling"
    ],
    recommendedAction: "Review Application Strategy"
  },
  {
    studentId: "DEMO-STU-024",
    name: "Demo Student N",
    branch: "MECH",
    cgpa: 6.5,
    readinessScore: 50,
    mockInterviewScore: 52,
    applications: 5,
    shortlisted: 1,
    rejections: 4,
    skillGap: "Medium",
    riskReasons: [
      "Readiness deficit (50%) in CAD design tests and GD round evaluations",
      "4 rejections out of 5 applied recruitment pipelines",
      "Medium skill gap flagged in finite element analysis coursework"
    ],
    recommendedAction: "Schedule Mentor Intervention"
  },
  {
    studentId: "DEMO-STU-025",
    name: "Demo Student O",
    branch: "EE",
    cgpa: 7.0,
    readinessScore: 60,
    mockInterviewScore: 58,
    applications: 6,
    shortlisted: 1,
    rejections: 5,
    skillGap: "Medium",
    riskReasons: [
      "Frequent elimination at technical interview stage despite clearing aptitude",
      "Mock interview score (58%) shows scope for problem formulation clarity",
      "Core power electronics certification pending"
    ],
    recommendedAction: "Recommend Mock Interview Practice"
  },
  {
    studentId: "DEMO-STU-026",
    name: "Demo Student P",
    branch: "CSE",
    cgpa: 7.8,
    readinessScore: 65,
    mockInterviewScore: 62,
    applications: 5,
    shortlisted: 1,
    rejections: 4,
    skillGap: "Medium",
    riskReasons: [
      "Readiness (65%) is moderate but application momentum has slowed down",
      "Medium gap in database query optimization & system modeling",
      "Eliminated in HR rounds during previous two campus drives"
    ],
    recommendedAction: "Recommend Mock Interview Practice"
  },
  {
    studentId: "DEMO-STU-027",
    name: "Demo Student Q",
    branch: "CIVIL",
    cgpa: 6.9,
    readinessScore: 58,
    mockInterviewScore: 64,
    applications: 4,
    shortlisted: 1,
    rejections: 3,
    skillGap: "Medium",
    riskReasons: [
      "Limited core civil campus drive opportunities applied for",
      "Moderate readiness (58%) in structural modeling benchmarks",
      "Needs proactive registration in multidisciplinary hiring pools"
    ],
    recommendedAction: "Review Application Strategy"
  },
  {
    studentId: "DEMO-STU-028",
    name: "Demo Student R",
    branch: "ECE",
    cgpa: 8.1,
    readinessScore: 68,
    mockInterviewScore: 66,
    applications: 7,
    shortlisted: 2,
    rejections: 5,
    skillGap: "Medium",
    riskReasons: [
      "Strong academic CGPA (8.1) but conversions stalling at final round",
      "Mock interview score (66%) shows hesitation under scenario questions",
      "Eligible for Tier-1 drives with targeted behavioral coaching"
    ],
    recommendedAction: "Recommend Mock Interview Practice"
  },
  {
    studentId: "DEMO-STU-029",
    name: "Demo Student S",
    branch: "IT",
    cgpa: 7.1,
    readinessScore: 66,
    mockInterviewScore: 68,
    applications: 6,
    shortlisted: 2,
    rejections: 4,
    skillGap: "Medium",
    riskReasons: [
      "Consistent test attendance but struggling in peer coding round timing",
      "Medium gap noted in full-stack architecture projects"
    ],
    recommendedAction: "Recommend Skill Training"
  },
  {
    studentId: "DEMO-STU-030",
    name: "Demo Student T",
    branch: "MECH",
    cgpa: 7.6,
    readinessScore: 72,
    mockInterviewScore: 70,
    applications: 8,
    shortlisted: 3,
    rejections: 5,
    skillGap: "Low",
    riskReasons: [
      "Good drive participation (8 drives applied)",
      "Near low-risk threshold; needs fine-tuning for technical interview"
    ],
    recommendedAction: "Monitor Progress"
  },
  {
    studentId: "DEMO-STU-031",
    name: "Demo Student U",
    branch: "CSE",
    cgpa: 8.4,
    readinessScore: 84,
    mockInterviewScore: 82,
    applications: 9,
    shortlisted: 4,
    rejections: 4,
    skillGap: "Low",
    riskReasons: [
      "Healthy readiness metrics (84%) across aptitude and coding modules",
      "Active pipeline: shortlisted in 4 major product evaluation rounds"
    ],
    recommendedAction: "Monitor Progress"
  },
  {
    studentId: "DEMO-STU-032",
    name: "Demo Student V",
    branch: "IT",
    cgpa: 8.2,
    readinessScore: 88,
    mockInterviewScore: 80,
    applications: 8,
    shortlisted: 5,
    rejections: 2,
    skillGap: "Low",
    riskReasons: [
      "Strong competitive score profile across all assessment pillars",
      "Low placement risk; final offer letter release pending"
    ],
    recommendedAction: "Monitor Progress"
  },
  {
    studentId: "DEMO-STU-033",
    name: "Demo Student W",
    branch: "EE",
    cgpa: 7.9,
    readinessScore: 82,
    mockInterviewScore: 78,
    applications: 7,
    shortlisted: 3,
    rejections: 3,
    skillGap: "Low",
    riskReasons: [
      "Stable readiness (82%) with strong core electrical foundation",
      "Low risk indicator; currently in advanced interview stage"
    ],
    recommendedAction: "Monitor Progress"
  },
  {
    studentId: "DEMO-STU-034",
    name: "Demo Student X",
    branch: "ECE",
    cgpa: 8.6,
    readinessScore: 90,
    mockInterviewScore: 88,
    applications: 10,
    shortlisted: 6,
    rejections: 3,
    skillGap: "Low",
    riskReasons: [
      "Exemplary readiness and mock interview scores (90% and 88%)",
      "Multiple final-round interviews confirmed"
    ],
    recommendedAction: "Monitor Progress"
  }
];

export const atRiskStudentsData = rawAtRiskStudents.map((student) => {
  const { riskScore, riskLevel } = calculateRiskScoreAndLevel(student);

  return {
    ...student,
    riskScore,
    riskLevel
  };
});

// ==========================================
// PHASE 3: CONFLICT-AWARE DRIVE SCHEDULER
// ==========================================

export const campusVenues = [
  "Seminar Hall A",
  "Seminar Hall B",
  "Auditorium 1",
  "Computer Lab 1",
  "Computer Lab 2",
  "Placement Interview Suite"
];

export const standardTimeSlots = [
  {
    startTime: "09:00",
    endTime: "11:30",
    label: "Morning Slot 1 (09:00 - 11:30)"
  },
  {
    startTime: "11:30",
    endTime: "14:00",
    label: "Morning Slot 2 (11:30 - 14:00)"
  },
  {
    startTime: "14:30",
    endTime: "17:00",
    label: "Afternoon Slot (14:30 - 17:00)"
  },
  {
    startTime: "17:30",
    endTime: "20:00",
    label: "Evening Slot (17:30 - 20:00)"
  }
];

/*
 * Raw Placement Drive Schedule Dataset
 *
 * Synthetic conflict scenarios include:
 * - Venue conflicts
 * - Infrastructure/resource conflicts
 * - Student branch overlap conflicts
 * - Conflict-free drives
 */
export const rawDriveSchedules = [
  {
    driveId: "DEMO-DRV-201",
    company: "Aether Dynamics",
    role: "Full Stack Platform Engineer",
    date: "2026-09-28",
    startTime: "10:00",
    endTime: "13:00",
    venue: "Seminar Hall A",
    requiredResources: ["Auditorium Stage", "Projector Array"],
    eligibleBranches: ["CSE", "IT"],
    status: "Confirmed"
  },
  {
    driveId: "DEMO-DRV-202",
    company: "Krypton Cyber Security",
    role: "SOC Analyst & Pentester",
    date: "2026-09-28",
    startTime: "11:00",
    endTime: "13:30",
    venue: "Seminar Hall A",
    requiredResources: ["High-Speed LAN", "Projector Array"],
    eligibleBranches: ["CSE", "IT", "ECE"],
    status: "Scheduled"
  },
  {
    driveId: "DEMO-DRV-203",
    company: "Apex Cloud Technologies",
    role: "Cloud DevOps Associate",
    date: "2026-09-28",
    startTime: "14:30",
    endTime: "17:00",
    venue: "Auditorium 1",
    requiredResources: ["Auditorium Stage", "Audio System"],
    eligibleBranches: ["CSE", "IT"],
    status: "Confirmed"
  },
  {
    driveId: "DEMO-DRV-204",
    company: "Vanguard Microelectronics",
    role: "VLSI Verification Engineer",
    date: "2026-09-29",
    startTime: "09:30",
    endTime: "12:30",
    venue: "Seminar Hall B",
    requiredResources: ["Projector Array", "Interview Booths"],
    eligibleBranches: ["ECE", "EE"],
    status: "Confirmed"
  },
  {
    driveId: "DEMO-DRV-205",
    company: "Quantix Semiconductor",
    role: "Silicon Design Trainee",
    date: "2026-09-29",
    startTime: "10:30",
    endTime: "13:00",
    venue: "Seminar Hall B",
    requiredResources: ["Dual Screen Display"],
    eligibleBranches: ["ECE"],
    status: "Scheduled"
  },
  {
    driveId: "DEMO-DRV-206",
    company: "Matrix Logistics AI",
    role: "Optimization Algorithm Engineer",
    date: "2026-09-28",
    startTime: "14:30",
    endTime: "16:30",
    venue: "Seminar Hall B",
    requiredResources: ["Computer Lab 1", "Workstations"],
    eligibleBranches: ["CSE", "MECH"],
    status: "Scheduled"
  },
  {
    driveId: "DEMO-DRV-207",
    company: "Hyperion Robotics",
    role: "Automation Controls Trainee",
    date: "2026-09-28",
    startTime: "15:00",
    endTime: "17:30",
    venue: "Placement Interview Suite",
    requiredResources: ["Computer Lab 1"],
    eligibleBranches: ["EE", "MECH"],
    status: "Scheduled"
  },
  {
    driveId: "DEMO-DRV-208",
    company: "Starlight Infrastructure",
    role: "Structural Projects Engineer",
    date: "2026-09-29",
    startTime: "14:00",
    endTime: "16:30",
    venue: "Seminar Hall A",
    requiredResources: ["CAD Workstations"],
    eligibleBranches: ["CIVIL", "MECH"],
    status: "Confirmed"
  },
  {
    driveId: "DEMO-DRV-209",
    company: "Nexis Health Data",
    role: "Bio-Informatics Data Analyst",
    date: "2026-09-30",
    startTime: "10:00",
    endTime: "12:30",
    venue: "Auditorium 1",
    requiredResources: ["Auditorium Stage"],
    eligibleBranches: ["CSE", "IT"],
    status: "Confirmed"
  },
  {
    driveId: "DEMO-DRV-210",
    company: "Voltix Energy Solutions",
    role: "Grid Trainee Engineer",
    date: "2026-09-30",
    startTime: "14:00",
    endTime: "17:00",
    venue: "Computer Lab 2",
    requiredResources: ["MATLAB Suite"],
    eligibleBranches: ["EE", "ECE"],
    status: "Confirmed"
  }
];

export function timeToMinutes(timeStr) {
  if (!timeStr) return 0;

  const [hours, minutes] = timeStr.split(":").map(Number);

  return hours * 60 + minutes;
}

export function doTimesOverlap(startA, endA, startB, endB) {
  const aStart = timeToMinutes(startA);
  const aEnd = timeToMinutes(endA);
  const bStart = timeToMinutes(startB);
  const bEnd = timeToMinutes(endB);

  return Math.max(aStart, bStart) < Math.min(aEnd, bEnd);
}

/*
 * Reusable Validator:
 * Tests if a candidate drive slot triggers any
 * Venue, Infrastructure, or Branch conflict.
 */
export function hasScheduleConflictForCandidate(candidateDrive, otherDrives) {
  for (const other of otherDrives) {
    if (
      candidateDrive.driveId &&
      other.driveId &&
      candidateDrive.driveId === other.driveId
    ) {
      continue;
    }

    if (candidateDrive.date !== other.date) {
      continue;
    }

    const overlaps = doTimesOverlap(
      candidateDrive.startTime,
      candidateDrive.endTime,
      other.startTime,
      other.endTime
    );

    if (!overlaps) {
      continue;
    }

    // Venue collision
    if (
      candidateDrive.venue.trim().toLowerCase() ===
      other.venue.trim().toLowerCase()
    ) {
      return true;
    }

    // Infrastructure collision
    const candidateRes = candidateDrive.requiredResources || [];
    const otherRes = other.requiredResources || [];

    const hasSharedRes = candidateRes.some((resource) =>
      otherRes.some(
        (otherResource) =>
          otherResource.trim().toLowerCase() ===
          resource.trim().toLowerCase()
      )
    );

    if (hasSharedRes) {
      return true;
    }

    // Branch collision
    const candidateBranches = candidateDrive.eligibleBranches || [];
    const otherBranches = other.eligibleBranches || [];

    const hasSharedBranch = candidateBranches.some((branch) =>
      otherBranches.includes(branch)
    );

    if (hasSharedBranch) {
      return true;
    }
  }

  return false;
}

/*
 * Deterministic Conflict Detection Algorithm
 *
 * Priority:
 * Critical > High > Medium > No Conflict
 */
export function detectScheduleConflicts(scheduleList = rawDriveSchedules) {
  return scheduleList.map((drive) => {
    let hasCritical = false;
    let hasHigh = false;
    let hasMedium = false;

    const conflictReasons = [];
    const conflictingDriveIds = [];

    for (const other of scheduleList) {
      if (drive.driveId === other.driveId) {
        continue;
      }

      if (drive.date !== other.date) {
        continue;
      }

      const overlaps = doTimesOverlap(
        drive.startTime,
        drive.endTime,
        other.startTime,
        other.endTime
      );

      if (!overlaps) {
        continue;
      }

      // Critical: Same venue
      if (
        drive.venue.trim().toLowerCase() ===
        other.venue.trim().toLowerCase()
      ) {
        hasCritical = true;

        conflictReasons.push(
          `Venue Double-Booking: Both ${drive.driveId} (${drive.company}) and ${other.driveId} (${other.company}) are booked at ${drive.venue} during overlapping hours (${drive.startTime}–${drive.endTime} vs ${other.startTime}–${other.endTime}).`
        );

        conflictingDriveIds.push(other.driveId);
      }

      // High: Shared infrastructure
      const sharedResources = drive.requiredResources.filter((resource) =>
        other.requiredResources.some(
          (otherResource) =>
            otherResource.trim().toLowerCase() ===
            resource.trim().toLowerCase()
        )
      );

      if (sharedResources.length > 0) {
        hasHigh = true;

        conflictReasons.push(
          `Infrastructure Resource Conflict: Shared resource [${sharedResources.join(", ")}] requested concurrently by ${drive.driveId} (${drive.company}) and ${other.driveId} (${other.company}).`
        );

        conflictingDriveIds.push(other.driveId);
      }

      // Medium: Shared eligible branch
      const commonBranches = drive.eligibleBranches.filter((branch) =>
        other.eligibleBranches.includes(branch)
      );

      if (commonBranches.length > 0) {
        hasMedium = true;

        conflictReasons.push(
          `Branch Schedule Conflict: Eligible students in [${commonBranches.join(", ")}] have overlapping sessions with ${other.driveId} (${other.company}) between ${drive.startTime} and ${other.endTime}.`
        );

        conflictingDriveIds.push(other.driveId);
      }
    }

    let conflictSeverity = "No Conflict";

    if (hasCritical) {
      conflictSeverity = "Critical";
    } else if (hasHigh) {
      conflictSeverity = "High";
    } else if (hasMedium) {
      conflictSeverity = "Medium";
    }

    return {
      ...drive,
      conflictSeverity,
      conflictReasons,
      conflictingDriveIds: [...new Set(conflictingDriveIds)],
      hasConflict: conflictSeverity !== "No Conflict"
    };
  });
}

/*
 * Deterministic Alternative Slot and Venue Recommendation Engine
 *
 * Validates candidates against:
 * - Venue conflicts
 * - Infrastructure conflicts
 * - Branch conflicts
 */
export function findAlternativeSlots(
  drive,
  allDrives = rawDriveSchedules
) {
  const otherDrives = allDrives.filter(
    (item) => item.driveId !== drive.driveId
  );

  // Alternative venues for current date/time
  const recommendedVenues = campusVenues.filter((candidateVenue) => {
    if (
      candidateVenue.trim().toLowerCase() ===
      drive.venue.trim().toLowerCase()
    ) {
      return false;
    }

    const candidateDrive = {
      ...drive,
      venue: candidateVenue
    };

    return !hasScheduleConflictForCandidate(
      candidateDrive,
      otherDrives
    );
  });

  // Alternative standard time slots
  const recommendedTimeSlots = standardTimeSlots.filter(
    (candidateSlot) => {
      if (
        candidateSlot.startTime === drive.startTime &&
        candidateSlot.endTime === drive.endTime
      ) {
        return false;
      }

      const candidateDrive = {
        ...drive,
        startTime: candidateSlot.startTime,
        endTime: candidateSlot.endTime
      };

      return !hasScheduleConflictForCandidate(
        candidateDrive,
        otherDrives
      );
    }
  );

  return {
    recommendedVenues: recommendedVenues.slice(0, 3),
    recommendedTimeSlots: recommendedTimeSlots.slice(0, 3)
  };
}

// ==========================================
// PHASE 4: COMMUNICATION & NOTIFICATION HUB
// ==========================================

export const communicationBranches = [
  "All",
  "CSE",
  "IT",
  "ECE",
  "EE",
  "MECH",
  "CIVIL"
];

export const communicationNotificationTypes = [
  "Drive Schedule",
  "Document Deadline",
  "Eligibility Update",
  "General Announcement"
];

export const communicationPriorities = [
  "Normal",
  "Important",
  "Urgent"
];

export const communicationAudiences = [
  "All Students",
  "Specific Branch",
  "Specific Drive",
  "Shortlisted Students",
  "At-Risk Students"
];

/*
 * Synthetic Notification Records Dataset
 */
export const communicationNotifications = [
  {
    id: "DEMO-NOTIF-401",
    title: "Round 2 Technical Interview Schedule Released",
    type: "Drive Schedule",
    priority: "Urgent",
    targetAudience: "Specific Drive",
    targetBranch: "All",
    relatedDriveId: "DEMO-DRV-101",
    relatedCompany: "Apex Cloud Technologies",
    message:
      "Shortlisted candidates for Associate Software Engineer must report to Auditorium 1 at 09:30 AM with two hard copies of updated resumes and college photo IDs.",
    status: "Sent",
    createdAt: "2026-09-24 09:15",
    scheduledAt: null
  },
  {
    id: "DEMO-NOTIF-402",
    title: "Mandatory Profile & Marksheet Verification Deadline",
    type: "Document Deadline",
    priority: "Important",
    targetAudience: "All Students",
    targetBranch: "All",
    relatedDriveId: null,
    relatedCompany: null,
    message:
      "All 2026 graduating batch scholars must upload attested 6th-semester SGPA transcripts and verify back-paper clearances on the portal by Sep 27, 5:00 PM.",
    status: "Sent",
    createdAt: "2026-09-23 14:00",
    scheduledAt: null
  },
  {
    id: "DEMO-NOTIF-403",
    title: "Online Assessment Slot Confirmation & System Requirements",
    type: "Drive Schedule",
    priority: "Important",
    targetAudience: "Shortlisted Students",
    targetBranch: "All",
    relatedDriveId: "DEMO-DRV-102",
    relatedCompany: "Nexus Core Systems",
    message:
      "Online coding and cognitive assessments are activated for registered scholars. Ensure webcams and Chrome browsers are updated before 10:00 AM kickoff.",
    status: "Scheduled",
    createdAt: "2026-09-24 11:30",
    scheduledAt: "2026-09-27 18:00"
  },
  {
    id: "DEMO-NOTIF-404",
    title: "Eligibility CGPA Relaxation for Civil Core Hiring",
    type: "Eligibility Update",
    priority: "Normal",
    targetAudience: "Specific Branch",
    targetBranch: "CIVIL",
    relatedDriveId: "DEMO-DRV-208",
    relatedCompany: "Starlight Infrastructure",
    message:
      "Cut-off threshold revised to CGPA >= 6.5 for CIVIL engineering applicants for Graduate Site & Projects Trainee vacancies. Interested candidates may apply before Sep 28.",
    status: "Sent",
    createdAt: "2026-09-22 16:45",
    scheduledAt: null
  },
  {
    id: "DEMO-NOTIF-405",
    title: "Pre-Placement Talk (PPT) & Venue Allocation Notice",
    type: "Drive Schedule",
    priority: "Urgent",
    targetAudience: "Specific Drive",
    targetBranch: "All",
    relatedDriveId: "DEMO-DRV-201",
    relatedCompany: "Aether Dynamics",
    message:
      "Pre-Placement briefing is slated for Seminar Hall A at 10:00 AM on Sep 28. Formal corporate business attire is strictly required for admission.",
    status: "Scheduled",
    createdAt: "2026-09-24 12:00",
    scheduledAt: "2026-09-28 08:00"
  },
  {
    id: "DEMO-NOTIF-406",
    title: "Optimization & Algorithm Assessment Lab Access",
    type: "Drive Schedule",
    priority: "Important",
    targetAudience: "Specific Drive",
    targetBranch: "All",
    relatedDriveId: "DEMO-DRV-206",
    relatedCompany: "Matrix Logistics AI",
    message:
      "Shortlisted CSE & MECH applicants are allotted Computer Lab 1. Individual system credentials will be dispatched 15 minutes prior to evaluation.",
    status: "Draft",
    createdAt: "2026-09-24 15:20",
    scheduledAt: null
  },
  {
    id: "DEMO-NOTIF-407",
    title: "Dedicated Mock Interview & Intervention Bootcamp",
    type: "General Announcement",
    priority: "Urgent",
    targetAudience: "At-Risk Students",
    targetBranch: "All",
    relatedDriveId: null,
    relatedCompany: null,
    message:
      "Scholars flagged for placement readiness support are invited to join the special weekend technical review and communication coaching tracks starting this Saturday.",
    status: "Draft",
    createdAt: "2026-09-24 16:10",
    scheduledAt: null
  },
  {
    id: "DEMO-NOTIF-408",
    title: "VLSI Technical Assessment Shortlist Update",
    type: "Eligibility Update",
    priority: "Important",
    targetAudience: "Specific Branch",
    targetBranch: "ECE",
    relatedDriveId: "DEMO-DRV-204",
    relatedCompany: "Vanguard Microelectronics",
    message:
      "Shortlist for the Silicon verification interview round is released. Candidates must complete credential confirmations in their student portals before Sep 29.",
    status: "Sent",
    createdAt: "2026-09-24 17:30",
    scheduledAt: null
  },
  {
    id: "DEMO-NOTIF-409",
    title: "Mandatory Registration Notice for Core Branches",
    type: "General Announcement",
    priority: "Normal",
    targetAudience: "Specific Branch",
    targetBranch: "MECH",
    relatedDriveId: null,
    relatedCompany: null,
    message:
      "Mechanical seniors with active registrations must verify their CAD/FEA skill badges prior to the upcoming industrial recruitment week.",
    status: "Sent",
    createdAt: "2026-09-21 10:00",
    scheduledAt: null
  }
];

/*
 * Deterministic helper to compute communication metrics.
 */
export function getCommunicationSummaryStats(
  notifications = communicationNotifications
) {
  const total = notifications.length;

  const sent = notifications.filter(
    (notification) => notification.status === "Sent"
  ).length;

  const scheduled = notifications.filter(
    (notification) => notification.status === "Scheduled"
  ).length;

  const drafts = notifications.filter(
    (notification) => notification.status === "Draft"
  ).length;

  return {
    total,
    sent,
    scheduled,
    drafts
  };
}

/*
 * Helper generating transparent targeting description text.
 */
export function getSmartTargetingDescription(
  targetAudience,
  targetBranch,
  relatedDriveId,
  relatedCompany
) {
  const driveLabel = relatedCompany
    ? relatedCompany
    : relatedDriveId
      ? `Drive ${relatedDriveId}`
      : null;

  switch (targetAudience) {
    case "All Students":
      return targetBranch && targetBranch !== "All"
        ? `All students enrolled in the ${targetBranch} engineering branch.`
        : "All registered students across all engineering branches.";

    case "Specific Branch":
      return targetBranch && targetBranch !== "All"
        ? `Exclusively students enrolled in ${targetBranch} engineering.`
        : "Students in the selected engineering branch.";

    case "Specific Drive":
      return driveLabel
        ? `All students currently registered or applying for the ${driveLabel} placement drive.`
        : "All students registered for the selected placement drive.";

    case "Shortlisted Students":
      return driveLabel
        ? `Scholars currently shortlisted for upcoming evaluation rounds of ${driveLabel}.`
        : "Students who have cleared preliminary rounds and are on active shortlists.";

    case "At-Risk Students":
      return targetBranch && targetBranch !== "All"
        ? `Students flagged for early placement intervention in ${targetBranch} engineering.`
        : "Students flagged for early placement intervention based on readiness indicators.";

    default:
      return "Designated student audience.";
  }
}