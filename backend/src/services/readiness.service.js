import * as studentRepository from '../repositories/student.repository.js';
import * as offerRepository from '../repositories/offer.repository.js';

/**
 * Calculates academic readiness dimension score (0 - 25).
 * Scaled from a 10-point CGPA scale.
 */
function calculateAcademicDimension(cgpa) {
  const numericCgpa = typeof cgpa === 'number' ? cgpa : parseFloat(cgpa) || 0;
  return Math.min(Math.round((numericCgpa / 10) * 25 * 10) / 10, 25);
}

/**
 * Calculates technical skills dimension score (0 - 30).
 * Scaled based on skills inventory depth (5 points per verified skill up to 6 skills).
 */
function calculateTechnicalDimension(skills) {
  const skillCount = Array.isArray(skills) ? skills.length : 0;
  return Math.min(skillCount * 5, 30);
}

/**
 * Calculates communication readiness dimension score (0 - 25).
 * Scaled from a 100-point normalized assessment score.
 */
function calculateCommunicationDimension(commScore) {
  const score = typeof commScore === 'number' ? commScore : parseFloat(commScore) || 0;
  return Math.min(Math.round((score / 100) * 25 * 10) / 10, 25);
}

/**
 * Calculates practical experience dimension score (0 - 20).
 * Combined portfolio of projects (max 10) and certifications (max 10).
 */
function calculatePracticalDimension(projects, certifications) {
  const projectCount = Array.isArray(projects) ? projects.length : 0;
  const certCount = Array.isArray(certifications) ? certifications.length : 0;
  const projectScore = Math.min(projectCount * 5, 10);
  const certScore = Math.min(certCount * 5, 10);
  return projectScore + certScore;
}

/**
 * Maps cumulative score (0 - 100) to standard readiness tier.
 */
function determineReadinessBand(totalScore) {
  if (totalScore >= 80) return 'Ready';
  if (totalScore >= 60) return 'Proficient';
  if (totalScore >= 40) return 'Developing';
  return 'Novice';
}

/**
 * Evaluates the full readiness profile for a student using existing scoring logic.
 *
 * @param {Object} student - Student record from repository or memory
 * @returns {Object} Full readiness evaluation object
 */
export function calculateStudentReadiness(student) {
  const cgpa = typeof student.cgpa === 'number' ? student.cgpa : parseFloat(student.cgpa) || 0;
  const technicalSkills = Array.isArray(student.technicalSkills) ? student.technicalSkills : [];
  const projects = Array.isArray(student.projects) ? student.projects : [];
  const certifications = Array.isArray(student.certifications) ? student.certifications : [];
  const commScore = typeof student.communicationScore === 'number'
    ? student.communicationScore
    : parseFloat(student.communicationScore) || 0;

  const academics = calculateAcademicDimension(cgpa);
  const technical = calculateTechnicalDimension(technicalSkills);
  const communication = calculateCommunicationDimension(commScore);
  const practical = calculatePracticalDimension(projects, certifications);

  const rawTotal = academics + technical + communication + practical;
  const totalScore = Math.min(Math.round(rawTotal * 10) / 10, 100);
  const readinessBand = determineReadinessBand(totalScore);

  return {
    studentId: student.id,
    name: student.name,
    branch: student.branch,
    cgpa,
    totalScore,
    readinessScore: totalScore,
    readinessBand,
    dimensions: {
      academics,
      technicalSkills: technical,
      communication,
      practicalExperience: practical
    },
    rawMetrics: {
      cgpa,
      skillsCount: technicalSkills.length,
      communicationScore: commScore,
      projectsCount: projects.length,
      certificationsCount: certifications.length,
      applicationsCount: Number(student.applicationsCount || 0),
      rejectionsCount: Number(student.rejectionsCount || 0)
    }
  };
}

/**
 * Compatibility alias: Analyzes student readiness when student and cohort data are supplied.
 */
export function analyzeStudentReadinessWithData(student, cohortData = []) {
  const readiness = calculateStudentReadiness(student);
  const risk = deriveTransparentRiskProfile(student, readiness);

  return {
    ...readiness,
    riskLevel: risk.riskLevel,
    riskProfile: {
      riskLevel: risk.riskLevel,
      mainReason: risk.mainReason,
      reasons: risk.reasons,
      recommendedAction: risk.recommendedAction,
      actions: risk.actions
    }
  };
}

/**
 * Compatibility alias: Analyzes student readiness synchronously from a single student object.
 */
export function analyzeStudentReadiness(student) {
  return analyzeStudentReadinessWithData(student, []);
}

/**
 * Transparent rule-based risk evaluation system.
 * Evaluates:
 * 1. Readiness score
 * 2. CGPA
 * 3. Communication score
 * 4. Applications vs rejections (evaluated only when applications >= 3)
 * 5. Projects and certifications
 * 6. Technical skills inventory
 */
function deriveTransparentRiskProfile(student, readiness) {
  const reasons = [];
  const actions = [];
  const { rawMetrics, readinessScore } = readiness;

  const apps = rawMetrics.applicationsCount;
  const rejections = rawMetrics.rejectionsCount;
  const hasAppHistory = apps >= 3;
  const rejectionRate = hasAppHistory && apps > 0 ? (rejections / apps) * 100 : 0;

  // --- Dimension Evaluation & Reason Gathering ---

  if (readinessScore < 50) {
    reasons.push(`Low cumulative readiness score (${readinessScore}/100) indicates significant cross-functional gaps`);
    actions.push('Mandatory 1-on-1 placement counseling and personalized milestone mapping');
  } else if (readinessScore < 65) {
    reasons.push(`Readiness score (${readinessScore}/100) is below benchmark, requiring targeted intervention`);
    actions.push('Enroll in dedicated readiness bootcamps to elevate aggregate assessment standing');
  }

  if (hasAppHistory && rejectionRate >= 75) {
    reasons.push(`High rejection rate of ${Math.round(rejectionRate)}% across ${apps} applications (${rejections} rejections)`);
    actions.push('Audit resume positioning and review technical screening performance with faculty mentors');
  } else if (hasAppHistory && rejectionRate >= 60) {
    reasons.push(`Elevated rejection rate of ${Math.round(rejectionRate)}% across ${apps} applications (${rejections} rejections)`);
    actions.push('Conduct mock technical evaluations to identify stage-specific interview drop-offs');
  }

  if (rawMetrics.communicationScore < 45) {
    reasons.push(`Critical communication barrier (${rawMetrics.communicationScore}/100) blocks verbal screening rounds`);
    actions.push('Enroll in intensive soft-skills workshops and active group discussion panels');
  } else if (rawMetrics.communicationScore < 60) {
    reasons.push(`Communication score (${rawMetrics.communicationScore}/100) below corporate hiring benchmark`);
    actions.push('Participate in structured behavioral interview coaching sessions');
  }

  if (rawMetrics.cgpa < 6.5) {
    reasons.push(`CGPA (${rawMetrics.cgpa.toFixed(2)}) restricts eligibility for standard recruitment cutoff thresholds`);
    actions.push('Target recruiters with flexible CGPA criteria and focus on academic mentoring');
  } else if (rawMetrics.cgpa < 7.0) {
    reasons.push(`CGPA (${rawMetrics.cgpa.toFixed(2)}) is below 7.0, limiting opportunities in tier-1 recruitment drives`);
    actions.push('Compensate with higher technical assessment scores and verified certifications');
  }

  if (rawMetrics.skillsCount < 3) {
    reasons.push(`Limited technical stack documented (${rawMetrics.skillsCount} skills on record)`);
    actions.push('Complete foundational coursework in core language frameworks and database design');
  }

  if (rawMetrics.projectsCount === 0 && rawMetrics.certificationsCount === 0) {
    reasons.push('No verified practical projects or recognized certifications in candidate profile');
    actions.push('Build and deploy at least 2 practical portfolio projects to GitHub');
  }

  // --- Rule-Based Risk Classification ---

  let riskLevel = 'Low Risk';

  // 1. High Risk Rules
  const isHighRisk =
    readinessScore < 50 ||
    (hasAppHistory && rejectionRate >= 75) ||
    (rawMetrics.communicationScore < 45 && readinessScore < 65);

  // 2. Medium Risk Rules
  const isMediumRisk =
    (readinessScore >= 50 && readinessScore < 65) ||
    (hasAppHistory && rejectionRate >= 60) ||
    rawMetrics.communicationScore < 60 ||
    rawMetrics.cgpa < 7.0;

  if (isHighRisk) {
    riskLevel = 'High Risk';
  } else if (isMediumRisk) {
    riskLevel = 'Medium Risk';
  } else {
    riskLevel = 'Low Risk';
  }

  // Deduplicate reasons and actions while preserving discovery order
  const uniqueReasons = Array.from(new Set(reasons));
  const uniqueActions = Array.from(new Set(actions));

  if (uniqueReasons.length === 0) {
    uniqueReasons.push('Candidate meets primary institutional readiness and qualification benchmarks');
  }

  if (uniqueActions.length === 0) {
    uniqueActions.push('Maintain active candidate schedule for ongoing recruitment cycles');
  }

  const mainReason = uniqueReasons.slice(0, 2).join('; ');
  const recommendedAction = uniqueActions[0];

  return {
    riskLevel,
    mainReason,
    reasons: uniqueReasons,
    recommendedAction,
    actions: uniqueActions
  };
}

/**
 * GET /api/readiness/:studentId
 * Retrieves detailed readiness report for a specific student from MySQL.
 */
export async function getStudentReadiness(studentId) {
  if (!studentId || typeof studentId !== 'string') return null;

  const student = await studentRepository.findStudentById(studentId.trim());
  if (!student) return null;

  const readiness = calculateStudentReadiness(student);
  const risk = deriveTransparentRiskProfile(student, readiness);

  return {
    ...readiness,
    riskLevel: risk.riskLevel,
    riskProfile: {
      riskLevel: risk.riskLevel,
      mainReason: risk.mainReason,
      reasons: risk.reasons,
      recommendedAction: risk.recommendedAction,
      actions: risk.actions
    }
  };
}

/**
 * GET /api/readiness/cohort
 * Evaluates readiness across all students in MySQL.
 */
export async function getCohortReadiness() {
  const students = await studentRepository.findAllStudents();

  const evaluated = students.map((student) => calculateStudentReadiness(student));

  const total = evaluated.length;
  const avgScore = total > 0
    ? Math.round((evaluated.reduce((sum, s) => sum + s.totalScore, 0) / total) * 10) / 10
    : 0;

  const bandCounts = {
    Ready: 0,
    Proficient: 0,
    Developing: 0,
    Novice: 0
  };

  evaluated.forEach((s) => {
    if (bandCounts[s.readinessBand] !== undefined) {
      bandCounts[s.readinessBand] += 1;
    }
  });

  return {
    totalStudents: total,
    averageReadinessScore: avgScore,
    bandBreakdown: bandCounts,
    students: evaluated
  };
}

/**
 * GET /api/readiness/at-risk
 * Evaluates and identifies all at-risk students who are not already placed.
 * Applies the transparent multi-factor risk rules.
 *
 * @returns {Promise<Object>} Aggregate at-risk evaluation metrics and student list
 */
export async function getAtRiskStudents() {
  const [students, offers] = await Promise.all([
    studentRepository.findAllStudents(),
    offerRepository.findAllOffers()
  ]);

  // Identify student IDs holding accepted or joining-confirmed offers
  const placedStudentIds = new Set();
  offers.forEach((o) => {
    const s = (o.status || '').toLowerCase();
    if (s === 'accepted' || s === 'joining confirmed' || s === 'joining-confirmed') {
      placedStudentIds.add(o.studentId);
    }
  });

  const atRiskStudents = [];

  students.forEach((student) => {
    // Exclude placed students (student.status = "Placed" or confirmed offer)
    const isPlaced = (student.status || '').toLowerCase() === 'placed' || placedStudentIds.has(student.id);
    if (isPlaced) return;

    const readiness = calculateStudentReadiness(student);
    const risk = deriveTransparentRiskProfile(student, readiness);

    atRiskStudents.push({
      id: student.id,
      name: student.name,
      email: student.email,
      branch: student.branch,
      cgpa: readiness.cgpa,
      readinessScore: readiness.totalScore,
      readinessBand: readiness.readinessBand,
      riskLevel: risk.riskLevel,
      mainReason: risk.mainReason,
      reasons: risk.reasons,
      recommendedAction: risk.recommendedAction,
      actions: risk.actions,
      dimensions: readiness.dimensions,
      rawMetrics: readiness.rawMetrics
    });
  });

  // Sort descending by risk severity: High Risk > Medium Risk > Low Risk, then lowest readiness score first
  const riskPriority = { 'High Risk': 3, 'Medium Risk': 2, 'Low Risk': 1 };
  atRiskStudents.sort((a, b) => {
    const diff = (riskPriority[b.riskLevel] || 0) - (riskPriority[a.riskLevel] || 0);
    if (diff !== 0) return diff;
    return a.readinessScore - b.readinessScore;
  });

  const highRiskCount = atRiskStudents.filter((s) => s.riskLevel === 'High Risk').length;
  const mediumRiskCount = atRiskStudents.filter((s) => s.riskLevel === 'Medium Risk').length;
  const lowRiskCount = atRiskStudents.filter((s) => s.riskLevel === 'Low Risk').length;

  return {
    totalAtRisk: atRiskStudents.length,
    highRiskCount,
    mediumRiskCount,
    lowRiskCount,
    students: atRiskStudents
  };
}