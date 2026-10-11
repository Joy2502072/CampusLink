import * as studentRepository from '../repositories/student.repository.js';
import * as driveRepository from '../repositories/drive.repository.js';
import * as offerRepository from '../repositories/offer.repository.js';

export const DIMENSION_WEIGHTS = {
  academics: 25,
  technical: 30,
  communication: 25,
  practical: 20
};

export const READINESS_BANDS = {
  NEEDS_IMPROVEMENT: 'Needs Improvement',
  DEVELOPING: 'Developing',
  PLACEMENT_READY: 'Placement Ready',
  HIGHLY_READY: 'Highly Ready'
};

/**
 * Maps a numerical score (0-100) to its authoritative readiness band.
 * @param {number} score
 * @returns {string}
 */
export function getReadinessBand(score) {
  const rounded = Math.round(Number(score) || 0);
  if (rounded >= 80) return READINESS_BANDS.HIGHLY_READY;
  if (rounded >= 60) return READINESS_BANDS.PLACEMENT_READY;
  if (rounded >= 40) return READINESS_BANDS.DEVELOPING;
  return READINESS_BANDS.NEEDS_IMPROVEMENT;
}

/**
 * Authoritative 4-dimension readiness calculation for an in-memory student record.
 * Used synchronously across Matching, At-Risk, and Analytics.
 *
 * @param {Object} student Authoritative student entity from MySQL
 * @returns {Object}
 */
export function calculateStudentReadiness(student) {
  if (!student) {
    throw new Error('Student entity is required to calculate placement readiness');
  }

  // 1. Academics Dimension (Max 25 pts)
  const cgpa = Number(student.cgpa || 0);
  const academicsScore = Math.min(
    DIMENSION_WEIGHTS.academics,
    Math.round(((cgpa / 10) * DIMENSION_WEIGHTS.academics) * 10) / 10
  );

  // 2. Technical Skills Dimension (Max 30 pts)
  const skills = Array.isArray(student.technicalSkills)
    ? student.technicalSkills
    : Array.isArray(student.skills)
    ? student.skills
    : [];
  const skillsCount = skills.length;
  const technicalScore = Math.min(
    DIMENSION_WEIGHTS.technical,
    Math.round((skillsCount * 5) * 10) / 10
  );

  // 3. Communication Dimension (Max 25 pts)
  const rawComm = Number(student.communicationScore ?? student.communication_score ?? 0);
  const communicationScore = Math.min(
    DIMENSION_WEIGHTS.communication,
    Math.round(((rawComm / 100) * DIMENSION_WEIGHTS.communication) * 10) / 10
  );

  // 4. Practical Experience / Projects Dimension (Max 20 pts)
  const projects = Array.isArray(student.projects) ? student.projects : [];
  const certifications = Array.isArray(student.certifications) ? student.certifications : [];
  const projectPoints = Math.min(12, projects.length * 6);
  const certPoints = Math.min(8, certifications.length * 4);
  const practicalScore = Math.min(
    DIMENSION_WEIGHTS.practical,
    projectPoints + certPoints
  );

  const totalScore = Math.min(
    100,
    Math.round(academicsScore + technicalScore + communicationScore + practicalScore)
  );

  const readinessBand = getReadinessBand(totalScore);

  // Observations & Explanations
  const reasons = [];
  const actions = [];

  if (academicsScore >= 20) {
    reasons.push(`Strong academic benchmark with CGPA ${cgpa.toFixed(2)}/10.0.`);
  } else if (academicsScore < 15) {
    reasons.push(`Academic CGPA (${cgpa.toFixed(2)}) is below institutional cutoff thresholds.`);
    actions.push('Strengthen core subject semester grades to cross drive screening cutoffs.');
  }

  if (technicalScore >= 25) {
    reasons.push(`Diverse technical stack (${skillsCount} verified competencies documented).`);
  } else {
    reasons.push(`Technical stack depth is narrow (${skillsCount} skills recorded).`);
    actions.push('Acquire and verify at least 2 additional core competencies (e.g., Data Structures, System Design).');
  }

  if (communicationScore >= 20) {
    reasons.push(`High communication benchmark (${rawComm}/100) suitable for client/recruiter interactions.`);
  } else {
    reasons.push(`Communication score benchmark (${rawComm}/100) indicates verbal/interview friction.`);
    actions.push('Participate in departmental group discussions and communication workshops.');
  }

  if (practicalScore >= 16) {
    reasons.push(`Solid project portfolio with ${projects.length} repository projects and ${certifications.length} certifications.`);
  } else {
    reasons.push(`Limited practical evidence (${projects.length} projects, ${certifications.length} certifications).`);
    actions.push('Deploy at least one full-stack or domain capstone project to GitHub.');
  }

  return {
    studentId: student.id,
    studentName: student.name,
    totalScore,
    readinessScore: totalScore,
    readinessBand,
    dimensions: {
      academics: academicsScore,
      technicalSkills: technicalScore,
      technical: technicalScore,
      communication: communicationScore,
      practicalExperience: practicalScore,
      practical: practicalScore
    },
    rawMetrics: {
      cgpa,
      skillsCount,
      communicationScore: rawComm,
      projectsCount: projects.length,
      certificationsCount: certifications.length
    },
    riskProfile: {
      mainReason: reasons[0] || 'Standard baseline evaluation.',
      reasons,
      recommendedAction: actions[0] || 'Maintain balanced academic and coding consistency.',
      actions
    },
    explanation: `Readiness score of ${totalScore}/100 is deterministically derived from Academics (${academicsScore}/25), Technical Skills (${technicalScore}/30), Communication (${communicationScore}/25), and Practical Experience (${practicalScore}/20).`,
    disclaimer: 'Deterministic evaluation based on verified database records. Does not predict or guarantee placement hiring outcomes.'
  };
}

/**
 * Analyzes student readiness combined with active drive opportunities and applications.
 *
 * @param {Object} student
 * @param {Array} [drives=[]]
 * @param {Array} [placements=[]]
 * @returns {Object}
 */
export function analyzeStudentReadinessWithData(student, drives = [], placements = []) {
  const readiness = calculateStudentReadiness(student);

  let eligibleDrivesCount = 0;
  if (Array.isArray(drives) && drives.length > 0) {
    const sBranch = (student.branch || '').toUpperCase();
    eligibleDrivesCount = drives.filter((d) => {
      const branches = Array.isArray(d.eligibleBranches)
        ? d.eligibleBranches
        : Array.isArray(d.eligible_branches)
        ? d.eligible_branches
        : [];
      if (branches.length === 0) return true;
      return branches.some((b) => b.toUpperCase() === 'ALL' || b.toUpperCase() === sBranch);
    }).length;
  }

  return {
    ...readiness,
    marketContext: {
      eligibleDrivesCount,
      totalDrivesCount: Array.isArray(drives) ? drives.length : 0,
      applicationsCount: Array.isArray(placements) ? placements.length : 0
    }
  };
}

/**
 * Evaluates full readiness for a student by ID, querying live MySQL drives.
 *
 * @param {string} studentId
 * @returns {Promise<Object>}
 */
export async function analyzeStudentReadiness(studentId) {
  const student = await studentRepository.findStudentById(studentId);
  if (!student) {
    throw new Error(`Student with ID ${studentId} not found`);
  }

  let drives = [];
  try {
    drives = await driveRepository.findAllDrives();
  } catch {
    drives = [];
  }

  let offers = [];
  try {
    offers = await offerRepository.findOffersByStudentId(studentId);
  } catch {
    offers = [];
  }

  return analyzeStudentReadinessWithData(student, drives, offers);
}

/**
 * Retrieves baseline readiness for a student.
 *
 * @param {string} studentId
 * @returns {Promise<Object>}
 */
export async function getStudentReadiness(studentId) {
  const student = await studentRepository.findStudentById(studentId);
  if (!student) {
    throw new Error(`Student with ID ${studentId} not found`);
  }
  return calculateStudentReadiness(student);
}

/**
 * Aggregates readiness metrics across all students in MySQL.
 *
 * @returns {Promise<Object>}
 */
export async function getCohortReadiness() {
  const students = await studentRepository.findAllStudents();
  if (!students || students.length === 0) {
    return {
      totalStudents: 0,
      averageScore: 0,
      distribution: {
        highlyReady: 0,
        placementReady: 0,
        developing: 0,
        needsImprovement: 0
      },
      readinessRate: 0
    };
  }

  let totalScoreSum = 0;
  const distribution = {
    highlyReady: 0,
    placementReady: 0,
    developing: 0,
    needsImprovement: 0
  };

  students.forEach((student) => {
    const res = calculateStudentReadiness(student);
    totalScoreSum += res.totalScore;

    if (res.totalScore >= 80) distribution.highlyReady++;
    else if (res.totalScore >= 60) distribution.placementReady++;
    else if (res.totalScore >= 40) distribution.developing++;
    else distribution.needsImprovement++;
  });

  const averageScore = Math.round((totalScoreSum / students.length) * 10) / 10;
  const readyCount = distribution.highlyReady + distribution.placementReady;
  const readinessRate = Math.round((readyCount / students.length) * 100);

  return {
    totalStudents: students.length,
    averageScore,
    distribution,
    readinessRate
  };
}

/**
 * AUTHORITATIVE AT-RISK ENGINE
 * Evaluates candidate risk using proactive multi-factor thresholds:
 * readiness score, application/rejection rates, communication friction, and CGPA.
 *
 * @returns {Promise<Array>}
 */
export async function getAtRiskStudents() {
  const students = await studentRepository.findAllStudents();
  if (!students || students.length === 0) return [];

  let allOffers = [];
  try {
    allOffers = await offerRepository.findAllOffers();
  } catch {
    allOffers = [];
  }

  const atRiskList = [];

  for (const student of students) {
    // 1. Exclude students already placed or with confirmed/accepted offers
    const isStudentPlaced = String(student.status || '').toLowerCase() === 'placed';

    const studentOffers = allOffers.filter(
      (o) => String(o.studentId || o.student_id) === String(student.id)
    );

    const hasAcceptedOffer = studentOffers.some((o) => {
      const st = String(o.status || '').toLowerCase().trim();
      return st === 'accepted' || st === 'joining confirmed' || st === 'joining-confirmed';
    });

    if (isStudentPlaced || hasAcceptedOffer) {
      continue;
    }

    // 2. Calculate baseline readiness
    const readiness = calculateStudentReadiness(student);
    const readinessScore = readiness.totalScore;
    const cgpa = Number(student.cgpa || 0);
    const comm = Number(student.communicationScore ?? student.communication_score ?? 0);

    // 3. Application & Rejection History
    const totalApplications = studentOffers.length;
    const rejectedApplications = studentOffers.filter((o) => {
      const st = String(o.status || '').toLowerCase().trim();
      return st === 'rejected' || st === 'declined' || st === 'not shortlisted';
    }).length;

    const hasApplicationHistory = totalApplications > 0;
    const rejectionRate = hasApplicationHistory
      ? Math.round((rejectedApplications / totalApplications) * 100)
      : 0;

    let riskLevel = null;
    const reasons = [];
    const actions = [];

    // 4. High Risk Classification
    const isHighReadiness = readinessScore < 50;
    const isHighRejection = hasApplicationHistory && rejectionRate >= 75;
    const isHighCommReadiness = comm < 45 && readinessScore < 65;

    if (isHighReadiness || isHighRejection || isHighCommReadiness) {
      riskLevel = 'High Risk';

      if (isHighReadiness) {
        reasons.push(`Critical placement readiness score (${readinessScore}/100) requires urgent intervention.`);
        actions.push('Mandatory 1-on-1 placement counseling and structured readiness remediation.');
      }
      if (isHighRejection) {
        reasons.push(`High rejection rate (${rejectionRate}% across ${totalApplications} drives).`);
        actions.push('Review resume positioning and analyze interview feedback before next drive.');
      }
      if (isHighCommReadiness) {
        reasons.push(`Low communication benchmark (${comm}/100) alongside developing readiness (${readinessScore}/100).`);
        actions.push('Intensive communication coaching and mock interview articulation practice.');
      }
    }
    // 5. Medium Risk Classification
    else {
      const isMedReadiness = readinessScore >= 50 && readinessScore < 65;
      const isMedRejection = hasApplicationHistory && rejectionRate >= 60;
      const isMedComm = comm < 60;
      const isMedCgpa = cgpa < 7.0;

      if (isMedReadiness || isMedRejection || isMedComm || isMedCgpa) {
        riskLevel = 'Medium Risk';

        if (isMedReadiness) {
          reasons.push(`Readiness score (${readinessScore}/100) indicates developing candidate profile.`);
          actions.push('Complete project repositories to elevate practical assessment rating.');
        }
        if (isMedRejection) {
          reasons.push(`Notable rejection rate (${rejectionRate}% across ${totalApplications} drives).`);
          actions.push('Participate in drive-specific technical practice rounds.');
        }
        if (isMedComm) {
          reasons.push(`Communication benchmark (${comm}/100) is below recruiter expectations.`);
          actions.push('Join departmental group discussion sessions and presentation workshops.');
        }
        if (isMedCgpa) {
          reasons.push(`Academic CGPA (${cgpa.toFixed(2)}) is below the 7.0 threshold for premier recruiters.`);
          actions.push('Target drives with flexible academic cutoffs and strong technical weighting.');
        }
      }
      // 6. Low Risk Classification (monitor only if specific vulnerabilities exist)
      else if (readinessScore < 75 || comm < 70 || cgpa < 7.5) {
        riskLevel = 'Low Risk';

        if (readinessScore < 75) {
          reasons.push(`Readiness score (${readinessScore}/100) is near placement threshold; monitoring recommended.`);
        }
        if (comm < 70) {
          reasons.push(`Communication score (${comm}/100) can be polished for higher-tier opportunities.`);
        }
        if (cgpa < 7.5) {
          reasons.push(`CGPA (${cgpa.toFixed(2)}) warrants proactive tracking.`);
        }

        actions.push('Maintain regular academic performance and participate in open placement prep activities.');
      }
    }

    if (riskLevel) {
      // Append any specific dimensions flagged by the baseline calculation
      if (readiness.riskProfile && Array.isArray(readiness.riskProfile.reasons)) {
        readiness.riskProfile.reasons.forEach((r) => {
          if (!reasons.includes(r)) reasons.push(r);
        });
      }
      if (readiness.riskProfile && Array.isArray(readiness.riskProfile.actions)) {
        readiness.riskProfile.actions.forEach((a) => {
          if (!actions.includes(a)) actions.push(a);
        });
      }

      atRiskList.push({
        id: student.id,
        name: student.name,
        branch: student.branch,
        cgpa: student.cgpa,
        readinessScore,
        riskLevel,
        readinessBand: readiness.readinessBand,
        dimensions: readiness.dimensions,
        primaryReason: reasons[0] || 'Candidate flagged for proactive placement monitoring.',
        reasons,
        recommendedAction: actions[0] || 'Schedule placement mentoring check-in.',
        actions,
        applicationStats: {
          totalApplications,
          rejectedApplications,
          rejectionRate
        }
      });
    }
  }

  // 8. Sorting: High Risk -> Medium Risk -> Low Risk, then lowest readinessScore first
  const riskPriority = {
    'High Risk': 1,
    'Medium Risk': 2,
    'Low Risk': 3
  };

  return atRiskList.sort((a, b) => {
    const prioA = riskPriority[a.riskLevel] || 99;
    const prioB = riskPriority[b.riskLevel] || 99;

    if (prioA !== prioB) {
      return prioA - prioB;
    }
    return a.readinessScore - b.readinessScore;
  });
}

/**
 * ADDED ISOLATED FUNCTION: Non-destructive in-memory What-If simulator.
 * Calculates hypothetical score trajectories without persisting or mutating MySQL data.
 *
 * @param {string} studentId
 * @param {Object} simulatedInputs Percentage targets (0-100) per dimension
 * @returns {Promise<Object>}
 */
export async function simulateReadinessScore(studentId, simulatedInputs = {}) {
  const student = await studentRepository.findStudentById(studentId);
  if (!student) {
    throw new Error(`Student with ID ${studentId} not found`);
  }

  // 1. Authoritative baseline evaluated via existing function
  const baseline = calculateStudentReadiness(student);

  // 2. Baseline percentages (0-100 scale)
  const currentPcts = {
    academics: Math.round((baseline.dimensions.academics / DIMENSION_WEIGHTS.academics) * 100),
    technical: Math.round((baseline.dimensions.technical / DIMENSION_WEIGHTS.technical) * 100),
    communication: Math.round((baseline.dimensions.communication / DIMENSION_WEIGHTS.communication) * 100),
    practical: Math.round((baseline.dimensions.practical / DIMENSION_WEIGHTS.practical) * 100)
  };

  const sanitizeInput = (val, fallback) => {
    if (val === undefined || val === null || isNaN(Number(val))) return fallback;
    return Math.max(0, Math.min(100, Number(val)));
  };

  const simPcts = {
    academics: sanitizeInput(simulatedInputs.academics, currentPcts.academics),
    technical: sanitizeInput(simulatedInputs.technical ?? simulatedInputs.technicalSkills, currentPcts.technical),
    communication: sanitizeInput(simulatedInputs.communication, currentPcts.communication),
    practical: sanitizeInput(simulatedInputs.practical ?? simulatedInputs.practicalExperience, currentPcts.practical)
  };

  // 3. Compute simulated points in memory using identical dimension weights
  const simPoints = {
    academics: Math.round(((simPcts.academics / 100) * DIMENSION_WEIGHTS.academics) * 10) / 10,
    technical: Math.round(((simPcts.technical / 100) * DIMENSION_WEIGHTS.technical) * 10) / 10,
    communication: Math.round(((simPcts.communication / 100) * DIMENSION_WEIGHTS.communication) * 10) / 10,
    practical: Math.round(((simPcts.practical / 100) * DIMENSION_WEIGHTS.practical) * 10) / 10
  };

  const simulatedScore = Math.min(
    100,
    Math.round(simPoints.academics + simPoints.technical + simPoints.communication + simPoints.practical)
  );

  const currentScore = baseline.totalScore;
  const improvement = Math.round((simulatedScore - currentScore) * 10) / 10;
  const currentBand = baseline.readinessBand;
  const simulatedBand = getReadinessBand(simulatedScore);

  const dimensionComparison = [
    {
      dimension: 'Academics',
      key: 'academics',
      maxPoints: DIMENSION_WEIGHTS.academics,
      currentPoints: baseline.dimensions.academics,
      simulatedPoints: simPoints.academics,
      currentPercent: currentPcts.academics,
      simulatedPercent: simPcts.academics,
      delta: Math.round((simPoints.academics - baseline.dimensions.academics) * 10) / 10
    },
    {
      dimension: 'Technical Skills',
      key: 'technical',
      maxPoints: DIMENSION_WEIGHTS.technical,
      currentPoints: baseline.dimensions.technical,
      simulatedPoints: simPoints.technical,
      currentPercent: currentPcts.technical,
      simulatedPercent: simPcts.technical,
      delta: Math.round((simPoints.technical - baseline.dimensions.technical) * 10) / 10
    },
    {
      dimension: 'Communication',
      key: 'communication',
      maxPoints: DIMENSION_WEIGHTS.communication,
      currentPoints: baseline.dimensions.communication,
      simulatedPoints: simPoints.communication,
      currentPercent: currentPcts.communication,
      simulatedPercent: simPcts.communication,
      delta: Math.round((simPoints.communication - baseline.dimensions.communication) * 10) / 10
    },
    {
      dimension: 'Practical Experience',
      key: 'practical',
      maxPoints: DIMENSION_WEIGHTS.practical,
      currentPoints: baseline.dimensions.practical,
      simulatedPoints: simPoints.practical,
      currentPercent: currentPcts.practical,
      simulatedPercent: simPcts.practical,
      delta: Math.round((simPoints.practical - baseline.dimensions.practical) * 10) / 10
    }
  ];

  const sortedDeltas = [...dimensionComparison].sort((a, b) => b.delta - a.delta);
  const highestContributor = sortedDeltas[0];

  const recommendations = [];
  if (improvement > 0) {
    if (highestContributor && highestContributor.delta > 0) {
      recommendations.push(
        `Focusing on ${highestContributor.dimension} yields the largest projected score gain (+${highestContributor.delta} pts).`
      );
    }
    if (simulatedBand !== currentBand) {
      recommendations.push(
        `This simulated trajectory elevates student classification from "${currentBand}" to "${simulatedBand}".`
      );
    }
  } else if (improvement < 0) {
    recommendations.push('Simulated levels reflect a reduction in verified competencies relative to current records.');
  } else {
    recommendations.push('Simulated profile aligns exactly with current verified baseline metrics.');
  }

  return {
    studentId: student.id,
    studentName: student.name,
    currentScore,
    simulatedScore,
    improvement,
    currentBand,
    simulatedBand,
    highestContributor: highestContributor && highestContributor.delta > 0 ? highestContributor.dimension : null,
    dimensionComparison,
    recommendations,
    isSimulation: true,
    disclaimer: 'What-If Simulation is a non-destructive modeling tool. No data has been modified in MySQL.'
  };
}