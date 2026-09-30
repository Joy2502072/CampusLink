/**
 * CampusLink Backend - Student Placement Readiness Service
 * 
 * NOTICE:
 * Calculates transparent, explainable placement readiness scores based on
 * weighted academic, technical, communication, and engagement factors.
 * This is an explainable evaluation prototype and does not predict hiring outcomes.
 */

import { students as fallbackStudents } from '../data/studentData.js';

/**
 * Normalizes input value to a safe finite number
 */
const safeNumber = (val, fallback = 0) => {
  const num = Number(val);
  return Number.isFinite(num) ? num : fallback;
};

const roundToOneDecimal = (val) => {
  return Math.round(safeNumber(val) * 10) / 10;
};

/**
 * Pure calculation engine that accepts a student object and computes readiness scores.
 * Preserves existing formulas, thresholds, and breakdown reasons.
 *
 * @param {Object} student - Sanitized student object
 * @returns {Object} Complete readiness breakdown
 */
export function calculateReadinessFromStudent(student) {
  if (!student) return null;

  const technicalSkills = Array.isArray(student.technicalSkills)
    ? student.technicalSkills
    : Array.isArray(student.skills)
      ? student.skills
      : [];

  const projects = Array.isArray(student.projects) ? student.projects : [];
  const certifications = Array.isArray(student.certifications) ? student.certifications : [];

  const cgpa = safeNumber(student.cgpa, 0);
  const communicationScore = safeNumber(student.communicationScore, 0);
  const mockInterviewScore = safeNumber(student.mockInterviewScore, 0);
  const applicationsCount = safeNumber(student.applicationsCount ?? student.applications, 0);
  const rejectionsCount = safeNumber(student.rejectionsCount ?? student.rejections, 0);

  // 1. Technical Skill Factor (Max: 30)
  // 5 points per verified skill up to 30
  const technicalSkillScore = roundToOneDecimal(Math.min(30, technicalSkills.length * 5));
  const technicalSkillReason = technicalSkills.length > 0
    ? `Verified proficiency in ${technicalSkills.length} core technical competencies (${technicalSkills.slice(0, 4).join(', ')}${technicalSkills.length > 4 ? ', ...' : ''}).`
    : 'No verified technical skills recorded in current profile.';

  // 2. Academic Factor (Max: 15)
  // Scaled from CGPA (out of 10) -> (cgpa / 10) * 15
  const academicScore = roundToOneDecimal(Math.min(15, (cgpa / 10) * 15));
  const academicReason = cgpa >= 8.0
    ? `Strong academic foundation with a CGPA of ${cgpa.toFixed(2)}.`
    : cgpa >= 7.0
      ? `Consistent academic record with a CGPA of ${cgpa.toFixed(2)}.`
      : `Academic standing at CGPA ${cgpa.toFixed(2)}; focus on core departmental subjects is advised.`;

  // 3. Mock Interview Factor (Max: 20)
  // Scaled from mockInterviewScore (out of 100) -> (score / 100) * 20
  // Default to a balanced estimate if no explicit mock interview is logged
  const effectiveMockScore = mockInterviewScore > 0 ? mockInterviewScore : (communicationScore > 0 ? communicationScore : 75);
  const mockInterviewFactorScore = roundToOneDecimal(Math.min(20, (effectiveMockScore / 100) * 20));
  const mockInterviewReason = effectiveMockScore >= 80
    ? `High interview simulation score of ${effectiveMockScore} demonstrates strong behavioral and technical presentation.`
    : `Interview assessment benchmarked at ${effectiveMockScore}; additional structured mock rounds recommended.`;

  // 4. Communication Factor (Max: 15)
  // Scaled from communicationScore (out of 100) -> (score / 100) * 15
  const commScore = communicationScore > 0 ? communicationScore : 75;
  const communicationFactorScore = roundToOneDecimal(Math.min(15, (commScore / 100) * 15));
  const communicationReason = commScore >= 80
    ? `Clear and articulate communication benchmark (${commScore}/100) suited for client-facing and collaborative roles.`
    : `Communication benchmark index at ${commScore}/100. Practice elevator pitches and architectural explanations.`;

  // 5. Project & Certification Factor (Max: 10)
  // Projects: 3 pts each (max 6), Certifications: 2 pts each (max 4)
  const projectPoints = Math.min(6, projects.length * 3);
  const certPoints = Math.min(4, certifications.length * 2);
  const projectCertificationScore = roundToOneDecimal(Math.min(10, projectPoints + certPoints));
  const projectCertificationReason = (projects.length > 0 || certifications.length > 0)
    ? `Demonstrated application through ${projects.length} documented project(s) and ${certifications.length} verified certification(s).`
    : 'No active GitHub projects or professional certifications listed.';

  // 6. Application Engagement Factor (Max: 10)
  // Encourages active participation while accounting for resilience
  let engagementScore = 6;
  if (applicationsCount > 0) engagementScore += 2;
  if (applicationsCount >= 3) engagementScore += 2;
  const applicationEngagementScore = roundToOneDecimal(Math.min(10, engagementScore));
  const applicationEngagementReason = applicationsCount > 0
    ? `Active engagement in campus placement workflow with ${applicationsCount} drive submission(s).`
    : 'Candidate has not yet applied to campus placement drives.';

  // Aggregate Total Score
  const totalScore = roundToOneDecimal(
    technicalSkillScore +
    academicScore +
    mockInterviewFactorScore +
    communicationFactorScore +
    projectCertificationScore +
    applicationEngagementScore
  );

  // Classification Thresholds
  let readinessLevel = 'Developing';
  if (totalScore >= 80) {
    readinessLevel = 'Highly Ready';
  } else if (totalScore >= 65) {
    readinessLevel = 'Placement Ready';
  } else if (totalScore >= 50) {
    readinessLevel = 'Developing';
  } else {
    readinessLevel = 'At-Risk';
  }

  // Derive Strengths
  const strengths = [];
  if (technicalSkillScore >= 20) strengths.push('Strong technical stack with multiple verified competencies');
  if (academicScore >= 12) strengths.push(`Consistent academic excellence (CGPA ${cgpa.toFixed(2)})`);
  if (effectiveMockScore >= 80) strengths.push('High performance in mock technical and HR interviews');
  if (commScore >= 80) strengths.push('Polished verbal articulation and presentation capability');
  if (projects.length >= 2) strengths.push('Solid practical portfolio with multiple deployed or documented projects');

  // Derive Skill Gaps
  const skillGaps = [];
  if (technicalSkillScore < 15) skillGaps.push('Limited depth in core programming language stack');
  if (academicScore < 10) skillGaps.push('CGPA is below preferred cutoff for certain selective recruiters');
  if (projects.length === 0) skillGaps.push('Lack of publicly reviewable practical or open-source projects');
  if (commScore < 70) skillGaps.push('Communication confidence requires targeted practice');

  // Derive Recommendations
  const recommendations = [];
  if (skillGaps.includes('Limited depth in core programming language stack')) {
    recommendations.push('Focus on mastering at least one backend or full-stack framework (e.g. Node.js or Python).');
  }
  if (skillGaps.includes('Lack of publicly reviewable practical or open-source projects')) {
    recommendations.push('Build and document one end-to-end CRUD project with a GitHub README.');
  }
  if (commScore < 75) {
    recommendations.push('Attend departmental mock interview practice to refine project presentation skills.');
  }
  if (recommendations.length === 0) {
    recommendations.push('Continue solving timed algorithmic challenges and prepare for company-specific rounds.');
  }

  return {
    studentId: student.id,
    studentName: student.name,
    branch: student.branch,
    totalScore,
    readinessLevel,
    scoreBreakdown: {
      technicalSkill: {
        score: technicalSkillScore,
        maxScore: 30,
        reason: technicalSkillReason
      },
      academic: {
        score: academicScore,
        maxScore: 15,
        reason: academicReason
      },
      mockInterview: {
        score: mockInterviewFactorScore,
        maxScore: 20,
        reason: mockInterviewReason
      },
      communication: {
        score: communicationFactorScore,
        maxScore: 15,
        reason: communicationReason
      },
      projectCertification: {
        score: projectCertificationScore,
        maxScore: 10,
        reason: projectCertificationReason
      },
      applicationEngagement: {
        score: applicationEngagementScore,
        maxScore: 10,
        reason: applicationEngagementReason
      }
    },
    strengths,
    skillGaps,
    recommendations
  };
}

/**
 * Calculates student readiness accepting either a pre-fetched student object or an ID string.
 * Exported under both canonical names for backward and cross-service compatibility.
 */
export function analyzeStudentReadinessWithData(student) {
  return calculateReadinessFromStudent(student);
}

/**
 * Compatibility function: Accepts studentId or student object.
 * If given a string ID, searches fallback demo data if available.
 */
export function analyzeStudentReadiness(studentOrId) {
  if (!studentOrId) return null;

  if (typeof studentOrId === 'object') {
    return calculateReadinessFromStudent(studentOrId);
  }

  const id = String(studentOrId).trim().toUpperCase();
  const student = fallbackStudents.find((s) => s.id.toUpperCase() === id);
  if (!student) return null;

  return calculateReadinessFromStudent(student);
}