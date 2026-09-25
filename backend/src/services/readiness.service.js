/**
 * CampusLink Backend - Explainable Student Placement Readiness Service
 * 
 * NOTICE:
 * Implements deterministic, explainable readiness analytics derived from
 * candidate academic metrics, skill sets, mock interviews, and application volume.
 * Provides transparent scoring, identifying explicit strengths, skill gaps,
 * and targeted remedial guidance without predicting guaranteed hiring outcomes.
 */

import { students } from '../data/studentData.js';

const roundToOneDecimal = (value) => {
  if (typeof value !== 'number' || isNaN(value) || !isFinite(value)) return 0;
  return Math.round(value * 10) / 10;
};

/**
 * 1. Technical Skill Readiness (30 pts max)
 * 5+ skills = 30, 4 = 25, 3 = 20, 2 = 14, 1 = 7, 0 = 0
 */
const calculateTechnicalSkillScore = (skills = []) => {
  const maxScore = 30;
  const count = Array.isArray(skills) ? skills.length : 0;
  let score = 0;

  if (count >= 5) score = 30;
  else if (count === 4) score = 25;
  else if (count === 3) score = 20;
  else if (count === 2) score = 14;
  else if (count === 1) score = 7;
  else score = 0;

  return {
    score,
    maxScore,
    reason: `Student has ${count} technical ${count === 1 ? 'skill' : 'skills'}, contributing ${score}/${maxScore} points.`
  };
};

/**
 * 2. Academic / CGPA Readiness (15 pts max)
 * (cgpa / 10) * 15
 */
const calculateAcademicScore = (cgpa = 0) => {
  const maxScore = 15;
  const numericCgpa = Number(cgpa) || 0;
  const rawScore = (numericCgpa / 10) * maxScore;
  const score = roundToOneDecimal(Math.min(maxScore, Math.max(0, rawScore)));

  return {
    score,
    maxScore,
    reason: `Academic CGPA of ${numericCgpa}/10 scales proportionally to ${score}/${maxScore} points.`
  };
};

/**
 * 3. Mock Interview Readiness (20 pts max)
 * (mockInterviewScore / 100) * 20
 */
const calculateMockInterviewScore = (mockScore = 0) => {
  const maxScore = 20;
  const numericMock = Number(mockScore) || 0;
  const rawScore = (numericMock / 100) * maxScore;
  const score = roundToOneDecimal(Math.min(maxScore, Math.max(0, rawScore)));

  return {
    score,
    maxScore,
    reason: `Mock interview evaluation of ${numericMock}% converts to ${score}/${maxScore} points.`
  };
};

/**
 * 4. Communication Readiness (15 pts max)
 * (communicationScore / 100) * 15
 */
const calculateCommunicationScore = (commScore = 0) => {
  const maxScore = 15;
  const numericComm = Number(commScore) || 0;
  const rawScore = (numericComm / 100) * maxScore;
  const score = roundToOneDecimal(Math.min(maxScore, Math.max(0, rawScore)));

  return {
    score,
    maxScore,
    reason: `Communication assessment score of ${numericComm}% translates to ${score}/${maxScore} points.`
  };
};

/**
 * 5. Project & Certification Strength (10 pts max)
 * Projects: 2+ = 5, 1 = 3, 0 = 0
 * Certifications: 2+ = 5, 1 = 3, 0 = 0
 */
const calculateProjectCertificationScore = (projects = [], certifications = []) => {
  const maxScore = 10;
  const projectCount = Array.isArray(projects) ? projects.length : 0;
  const certCount = Array.isArray(certifications) ? certifications.length : 0;

  let projectPoints = 0;
  if (projectCount >= 2) projectPoints = 5;
  else if (projectCount === 1) projectPoints = 3;

  let certPoints = 0;
  if (certCount >= 2) certPoints = 5;
  else if (certCount === 1) certPoints = 3;

  const score = Math.min(maxScore, projectPoints + certPoints);

  return {
    score,
    maxScore,
    reason: `Candidate has ${projectCount} ${projectCount === 1 ? 'project' : 'projects'} (${projectPoints} pts) and ${certCount} ${certCount === 1 ? 'certification' : 'certifications'} (${certPoints} pts), yielding ${score}/${maxScore} points.`
  };
};

/**
 * 6. Application Engagement (10 pts max)
 * Applications count: 8+ = 5, 5-7 = 4, 2-4 = 2, 0-1 = 0
 * Rejection ratio bonus: <=0.25 = +5, <=0.50 = +3, <=0.75 = +1, else 0
 */
const calculateApplicationEngagementScore = (applications = 0, rejections = 0) => {
  const maxScore = 10;
  const appCount = Number(applications) || 0;
  const rejCount = Number(rejections) || 0;

  let volumePoints = 0;
  if (appCount >= 8) volumePoints = 5;
  else if (appCount >= 5) volumePoints = 4;
  else if (appCount >= 2) volumePoints = 2;
  else volumePoints = 0;

  let ratioPoints = 0;
  let ratioText = 'N/A';
  if (appCount > 0) {
    const rejectionRatio = rejCount / appCount;
    ratioText = `${roundToOneDecimal(rejectionRatio * 100)}%`;
    if (rejectionRatio <= 0.25) ratioPoints = 5;
    else if (rejectionRatio <= 0.50) ratioPoints = 3;
    else if (rejectionRatio <= 0.75) ratioPoints = 1;
    else ratioPoints = 0;
  }

  const score = Math.min(maxScore, volumePoints + ratioPoints);

  return {
    score,
    maxScore,
    reason: `${appCount} applications submitted (${volumePoints} pts) with a rejection ratio of ${ratioText} (+${ratioPoints} pts), totaling ${score}/${maxScore} points.`
  };
};

const getReadinessLevel = (totalScore) => {
  if (totalScore >= 80) return 'Highly Ready';
  if (totalScore >= 60) return 'Placement Ready';
  if (totalScore >= 40) return 'Developing';
  return 'Needs Improvement';
};

/**
 * Perform explainable readiness analysis for a single candidate profile
 */
export const analyzeStudentReadiness = (studentId) => {
  if (!studentId || typeof studentId !== 'string') return null;
  const normalizedId = studentId.trim().toUpperCase();
  const student = students.find((s) => s.id.toUpperCase() === normalizedId);

  if (!student) return null;

  const technicalSkill = calculateTechnicalSkillScore(student.technicalSkills);
  const academic = calculateAcademicScore(student.cgpa);
  const mockInterview = calculateMockInterviewScore(student.mockInterviewScore);
  const communication = calculateCommunicationScore(student.communicationScore);
  const projectCertification = calculateProjectCertificationScore(student.projects, student.certifications);
  const applicationEngagement = calculateApplicationEngagementScore(student.applications, student.rejections);

  const rawTotal = technicalSkill.score +
    academic.score +
    mockInterview.score +
    communication.score +
    projectCertification.score +
    applicationEngagement.score;

  const totalScore = roundToOneDecimal(Math.min(100, Math.max(0, rawTotal)));
  const readinessLevel = getReadinessLevel(totalScore);

  // Deterministic Strengths Identification
  const strengths = [];
  if (technicalSkill.score >= 25) {
    strengths.push('Strong technical skill base');
  }
  if (Number(student.cgpa) >= 8.0) {
    strengths.push('Strong academic performance');
  }
  if (Number(student.mockInterviewScore) >= 75) {
    strengths.push('Strong mock interview performance');
  }
  if (Number(student.communicationScore) >= 75) {
    strengths.push('Strong communication');
  }
  if (Array.isArray(student.projects) && student.projects.length >= 2) {
    strengths.push('Strong project portfolio');
  }
  if (Array.isArray(student.certifications) && student.certifications.length >= 2) {
    strengths.push('Strong certification profile');
  }
  if (applicationEngagement.score >= 8) {
    strengths.push('Consistent application engagement');
  }

  // Deterministic Skill Gaps Identification
  const skillGaps = [];
  if (technicalSkill.score < 20) {
    skillGaps.push('Limited technical skill breadth');
  }
  if (Number(student.mockInterviewScore) < 65) {
    skillGaps.push('Low mock interview performance');
  }
  if (Number(student.communicationScore) < 70) {
    skillGaps.push('Communication improvement needed');
  }
  if (!Array.isArray(student.projects) || student.projects.length < 2) {
    skillGaps.push('Limited project exposure');
  }
  if (!Array.isArray(student.certifications) || student.certifications.length < 2) {
    skillGaps.push('Limited certification coverage');
  }
  if (Number(student.applications) < 5) {
    skillGaps.push('Low application engagement');
  }
  if (Number(student.applications) > 0 && (Number(student.rejections) / Number(student.applications)) > 0.5) {
    skillGaps.push('High rejection ratio');
  }

  // Actionable, Deterministic Recommendations
  const recommendations = [];
  if (technicalSkill.score < 25) {
    recommendations.push('Broaden core technical competency across widely requested industry tools.');
  }
  if (Number(student.mockInterviewScore) < 75) {
    recommendations.push('Practice mock interviews regularly to improve scenario handling and live technical articulation.');
  }
  if (Number(student.communicationScore) < 75) {
    recommendations.push('Improve communication through structured interview practice and interactive group discussion tracks.');
  }
  if (!Array.isArray(student.projects) || student.projects.length < 2) {
    recommendations.push('Build 1–2 projects aligned with target placement roles.');
  }
  if (!Array.isArray(student.certifications) || student.certifications.length < 2) {
    recommendations.push('Add role-relevant certifications to validate practical domain proficiency.');
  }
  if (Number(student.applications) < 5) {
    recommendations.push('Apply to more eligible placement drives to build hiring pipeline momentum.');
  }
  if (Number(student.applications) > 0 && (Number(student.rejections) / Number(student.applications)) > 0.5) {
    recommendations.push('Review rejected applications and identify recurring skill gaps with placement mentors.');
  }

  if (recommendations.length === 0) {
    recommendations.push('Maintain consistent interview readiness and participate in upcoming eligible placement drives.');
  }

  return {
    studentId: student.id,
    studentName: student.name,
    branch: student.branch,
    totalScore,
    readinessLevel,
    scoreBreakdown: {
      technicalSkill,
      academic,
      mockInterview,
      communication,
      projectCertification,
      applicationEngagement
    },
    strengths,
    skillGaps,
    recommendations
  };
};