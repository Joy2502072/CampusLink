import * as studentRepository from '../repositories/student.repository.js';
import * as driveRepository from '../repositories/drive.repository.js';
import * as readinessService from './readiness.service.js';

/**
 * Normalizes an array of skills or comma-separated string into clean unique strings.
 */
function normalizeSkillList(raw) {
  if (!raw) return [];
  if (Array.isArray(raw)) {
    return Array.from(new Set(raw.map((s) => String(s).trim()).filter(Boolean)));
  }
  if (typeof raw === 'string') {
    return Array.from(new Set(raw.split(',').map((s) => s.trim()).filter(Boolean)));
  }
  return [];
}

/**
 * Evaluates candidate matching against a recruitment drive using authoritative MySQL records.
 * Supported 100-point breakdown:
 * - Branch Eligibility: 25 pts
 * - Technical Skills: 35 pts (marked unavailable when drive requiredSkills is empty)
 * - Academic & Placement Readiness: 25 pts
 * - Communication Benchmark: 15 pts
 *
 * @param {string} studentId
 * @param {string} driveId
 * @returns {Promise<Object>}
 */
export async function evaluateStudentJobMatching(studentId, driveId) {
  if (!studentId || !driveId) {
    throw new Error('studentId and driveId are required for job matching evaluation');
  }

  // 1. Fetch Authoritative Student Record
  const student = await studentRepository.findStudentById(studentId);
  if (!student) {
    throw new Error(`Student with ID ${studentId} not found`);
  }

  // 2. Fetch Authoritative Drive Record
  const drive = await driveRepository.findDriveById(driveId);
  if (!drive) {
    throw new Error(`Placement drive with ID ${driveId} not found`);
  }

  // 3. Fetch Readiness Profile
  let readinessScore = 0;
  try {
  const readiness = await readinessService.calculateStudentReadiness(student);
  readinessScore = Number(
    readiness?.totalScore ?? readiness?.readinessScore ?? 0
  );
} catch {
  readinessScore = Math.min(
    100,
    Math.round(((student.cgpa || 0) / 10) * 100)
  );
}

  // Dimension 1: Branch Eligibility (Max 25 pts)
  const eligibleBranches = normalizeSkillList(drive.eligibleBranches || drive.eligible_branches);
  const studentBranch = (student.branch || '').trim().toUpperCase();

  let branchMatched = true;
  let branchReason = 'Open to all academic branches';

  if (eligibleBranches.length > 0) {
    const isEligible = eligibleBranches.some(
      (b) => b.toUpperCase() === 'ALL' || b.toUpperCase() === studentBranch
    );
    branchMatched = isEligible;
    branchReason = isEligible
      ? `Student branch (${student.branch}) matches drive requirements`
      : `Student branch (${student.branch}) is not in eligible branches (${eligibleBranches.join(', ')})`;
  }

  const branchScore = branchMatched ? 25 : 0;

  // Dimension 2: Technical Skill Matching (Max 35 pts)
  const studentSkills = normalizeSkillList(student.technicalSkills || student.skills);
  const driveSkills = normalizeSkillList(drive.requiredSkills || drive.required_skills || drive.skills);

  const studentSkillsLower = new Map(studentSkills.map((s) => [s.toLowerCase(), s]));

  let technicalStatus = 'AVAILABLE';
  let technicalScore = 0;
  let matchedSkills = [];
  let missingSkills = [];
  let technicalReason = '';

  if (driveSkills.length === 0) {
    technicalStatus = 'UNAVAILABLE';
    technicalReason = 'Recruiter technical skills are not currently populated in drive records';
  } else {
    driveSkills.forEach((req) => {
      const match = studentSkillsLower.get(req.toLowerCase());
      if (match) {
        matchedSkills.push(match);
      } else {
        missingSkills.push(req);
      }
    });

    const matchRatio = matchedSkills.length / driveSkills.length;
    technicalScore = Math.round(matchRatio * 35);
    technicalReason = `${matchedSkills.length} of ${driveSkills.length} required technical skills verified`;
  }

  // Dimension 3: Academic & Placement Readiness (Max 25 pts)
  // Scaled from 100-point readiness benchmark
  const academicReadinessScore = Math.round((readinessScore / 100) * 25);
  const academicReadinessReason = `Evaluated from institutional placement readiness rating (${readinessScore}/100)`;

  // Dimension 4: Communication Readiness (Max 15 pts)
  const rawComm = Number(student.communicationScore ?? student.communication_score ?? 0);
  const commScore = Math.round((rawComm / 100) * 15);
  const commReason = `Derived from communication score benchmark (${rawComm}/100)`;

  // Calculate Overall Score
  let overallMatchScore = 0;
  if (technicalStatus === 'AVAILABLE') {
    overallMatchScore = branchScore + technicalScore + academicReadinessScore + commScore;
  } else {
    // When technical requirements are unavailable, compute baseline from the active 65 points and normalize to 100
    const activeScore = branchScore + academicReadinessScore + commScore;
    const maxActiveScore = 65;
    overallMatchScore = Math.round((activeScore / maxActiveScore) * 100);
  }

  // Match Level Determination
  let matchLevel = 'Low Match';
  if (overallMatchScore >= 80) matchLevel = 'Strong Match';
  else if (overallMatchScore >= 60) matchLevel = 'Moderate Match';
  else if (overallMatchScore >= 40) matchLevel = 'Developing Match';

  // Strengths and Improvement Areas
  const strengths = [];
  const improvementAreas = [];

  if (branchMatched) {
    strengths.push(`Branch eligibility verified for ${student.branch}`);
  } else {
    improvementAreas.push(`Candidate does not meet current branch screening (${eligibleBranches.join(', ')})`);
  }

  if (technicalStatus === 'AVAILABLE') {
    if (matchedSkills.length > 0) {
      strengths.push(`Verified skills: ${matchedSkills.join(', ')}`);
    }
    if (missingSkills.length > 0) {
      improvementAreas.push(`Priority skills to acquire: ${missingSkills.join(', ')}`);
    }
  } else {
    improvementAreas.push('Technical requirements pending from company job listing');
  }

  if (readinessScore >= 70) {
    strengths.push(`Solid placement readiness benchmark (${readinessScore}/100)`);
  } else {
    improvementAreas.push(`Readiness rating is developing (${readinessScore}/100)`);
  }

  if (rawComm >= 75) {
    strengths.push(`Strong professional communication benchmark (${rawComm}/100)`);
  } else {
    improvementAreas.push('Communication assessment polish recommended before interviews');
  }

  let recommendation = '';
  if (!branchMatched) {
    recommendation = `Candidate is outside eligible branch criteria for ${drive.company}. Seek company exemption or explore alternative aligned campus drives.`;
  } else if (technicalStatus === 'UNAVAILABLE') {
    recommendation = `Candidate satisfies branch and institutional readiness criteria. Technical alignment will calculate automatically once recruiter requirements are populated.`;
  } else if (missingSkills.length > 0) {
    recommendation = `Candidate is a prospective match for ${drive.company} (${drive.role}). Focus on acquiring ${missingSkills[0]} to maximize evaluation readiness.`;
  } else {
    recommendation = `High suitability across academic, technical, and communication parameters. Proceed to company-specific interview preparation.`;
  }

  return {
    studentId: student.id,
    studentName: student.name,
    driveId: drive.id,
    company: drive.company,
    role: drive.role,
    overallMatchScore,
    matchLevel,
    breakdown: {
      branchEligibility: {
        score: branchScore,
        maxScore: 25,
        matched: branchMatched,
        reason: branchReason
      },
      technicalSkillMatch: {
        score: technicalStatus === 'AVAILABLE' ? technicalScore : null,
        maxScore: 35,
        status: technicalStatus,
        matchedSkills,
        missingSkills,
        reason: technicalReason
      },
      academicReadiness: {
        score: academicReadinessScore,
        maxScore: 25,
        readinessScore,
        reason: academicReadinessReason
      },
      communication: {
        score: commScore,
        maxScore: 15,
        rawScore: rawComm,
        reason: commReason
      }
    },
    strengths,
    improvementAreas,
    recommendation,
    disclaimer: 'Deterministic prototype compatibility analysis based on active database records. Does not guarantee recruitment or interview outcomes.'
  };
}

/**
 * Evaluates all placement drives for a given student.
 *
 * @param {string} studentId
 * @returns {Promise<Array>}
 */
export async function evaluateStudentAgainstAllDrives(studentId) {
  const drives = await driveRepository.findAllDrives();
  if (!drives || drives.length === 0) return [];

  const evaluations = [];
  for (const drive of drives) {
    try {
      const res = await evaluateStudentJobMatching(studentId, drive.id);
      evaluations.push(res);
    } catch {
      // Continue processing remaining drives
    }
  }

  return evaluations.sort((a, b) => b.overallMatchScore - a.overallMatchScore);
}