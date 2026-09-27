/**
 * CampusLink Backend - Skill Gap & Improvement Recommendation Service
 * 
 * NOTICE:
 * Implements deterministic, explainable skill-gap evaluations and guided improvement
 * plans for placement candidates targeting specific company recruitment drives.
 * Evaluates skill coverage, gap severity, actionable recommendations, a 7-day action
 * plan, and what-if coverage simulations without predicting hiring outcomes.
 */

import { students } from '../data/studentData.js';
import { drives } from '../data/driveData.js';
import { analyzeStudentReadiness } from './readiness.service.js';

/**
 * Standard strict semantic equivalences for technical skill comparison.
 * Keeps mappings minimal, direct, and unambiguous without overlapping clusters.
 */
const SKILL_EQUIVALENCE_GROUPS = [
  ['javascript', 'js'],
  ['typescript', 'ts'],
  ['python', 'python programming'],
  ['react', 'react.js', 'reactjs'],
  ['node', 'node.js', 'nodejs'],
  ['sql', 'mysql', 'postgresql', 'database sql'],
  ['machine learning', 'ml']
];

/**
 * Role-based deterministic skill extraction fallback
 */
const ROLE_SKILL_PROFILES = [
  {
    rolePattern: /software engineer|full stack|backend|frontend|developer|sde/i,
    skills: ['Data Structures', 'JavaScript', 'Node.js', 'React', 'SQL', 'Git']
  },
  {
    rolePattern: /cloud|devops|infrastructure|platform/i,
    skills: ['Linux', 'Docker', 'Kubernetes', 'AWS', 'Python', 'Git', 'Networking']
  },
  {
    rolePattern: /data scientist|machine learning|ai|analyst/i,
    skills: ['Python', 'SQL', 'Machine Learning', 'Data Analysis', 'Pandas', 'Statistics']
  },
  {
    rolePattern: /vlsi|embedded|hardware|silicon/i,
    skills: ['Verilog', 'C++', 'Digital Electronics', 'VLSI Design', 'MATLAB']
  },
  {
    rolePattern: /mechanical|design engineer|automotive/i,
    skills: ['AutoCAD', 'SolidWorks', 'Thermodynamics', 'Finite Element Analysis', 'MATLAB']
  },
  {
    rolePattern: /civil|site|structural/i,
    skills: ['AutoCAD', 'STAAD Pro', 'Structural Analysis', 'Surveying', 'Construction Management']
  },
  {
    rolePattern: /electrical|power|grid/i,
    skills: ['Circuit Analysis', 'Power Systems', 'MATLAB', 'Control Systems', 'PLC']
  }
];

const roundToOneDecimal = (value) => {
  if (typeof value !== 'number' || isNaN(value) || !isFinite(value)) return 0;
  return Math.round(value * 10) / 10;
};

const normalizeSkill = (skill) => {
  if (!skill || typeof skill !== 'string') return '';
  return skill.trim().toLowerCase();
};

/**
 * Safely escape string for use in regular expressions
 */
const escapeRegExp = (string) => {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
};

/**
 * Derives required skill profile for a placement drive using drive metadata
 */
export const extractDriveRequiredSkills = (drive) => {
  if (!drive) return [];

  // 1. If drive already contains explicit requiredSkills, use them
  if (Array.isArray(drive.requiredSkills) && drive.requiredSkills.length > 0) {
    return Array.from(new Set(drive.requiredSkills.map((s) => s.trim()))).filter(Boolean);
  }

  // 2. Scan drive description and metadata for standard technical skills
  const extracted = new Set();
  const searchCorpus = `${drive.role || ''} ${drive.description || ''} ${(drive.requiredResources || []).join(' ')}`;

  const knownSkillCatalog = [
    'Python', 'JavaScript', 'TypeScript', 'React', 'Node.js', 'Express',
    'SQL', 'MySQL', 'PostgreSQL', 'MongoDB', 'Docker', 'Kubernetes',
    'AWS', 'Git', 'Linux', 'Java', 'C++', 'DSA', 'Machine Learning',
    'AutoCAD', 'SolidWorks', 'MATLAB', 'Verilog', 'STAAD Pro'
  ];

  knownSkillCatalog.forEach((catalogSkill) => {
    let regex;
    // Standard word boundaries (\b) fail on symbols like '+' in 'C++'
    if (catalogSkill === 'C++') {
      regex = /(?:^|[\s,;:(/])C\+\+(?:$|[\s,;:!.)/])/i;
    } else {
      regex = new RegExp(`\\b${escapeRegExp(catalogSkill)}\\b`, 'i');
    }

    if (regex.test(searchCorpus)) {
      extracted.add(catalogSkill);
    }
  });

  // 3. Fallback to role-based predefined skill profiles if fewer than 3 skills matched
  if (extracted.size < 3) {
    const matchedProfile = ROLE_SKILL_PROFILES.find((p) => p.rolePattern.test(drive.role || ''));
    if (matchedProfile) {
      matchedProfile.skills.forEach((s) => extracted.add(s));
    }
  }

  // Ensure default fallback list if still empty
  if (extracted.size === 0) {
    ['Problem Solving', 'Data Structures', 'Git'].forEach((s) => extracted.add(s));
  }

  return Array.from(extracted);
};

/**
 * Checks if candidate skill matches required skill either exactly or via strict equivalence
 */
const evaluateSkillMatch = (requiredSkill, candidateSkills) => {
  const normRequired = normalizeSkill(requiredSkill);

  // 1. Exact normalized match
  for (const candSkill of candidateSkills) {
    const normCand = normalizeSkill(candSkill);
    if (normCand === normRequired) {
      return { matchType: 'exact', matchedCandidateSkill: candSkill };
    }
  }

  // 2. Strict equivalence group (partial / semantic match)
  const group = SKILL_EQUIVALENCE_GROUPS.find((grp) => grp.includes(normRequired));
  if (group) {
    for (const candSkill of candidateSkills) {
      const normCand = normalizeSkill(candSkill);
      if (group.includes(normCand)) {
        return { matchType: 'partial', matchedCandidateSkill: candSkill };
      }
    }
  }

  return { matchType: 'none', matchedCandidateSkill: null };
};

/**
 * Determines missing skill priority based on drive role and description
 */
const determinePriorityForSkill = (skill, drive) => {
  const norm = normalizeSkill(skill);
  const roleText = normalizeSkill(drive.role || '');
  const descText = normalizeSkill(drive.description || '');

  let isDirectlyReferenced = false;
  if (skill === 'C++') {
    const cppRegex = /(?:^|[\s,;:(/])c\+\+(?:$|[\s,;:!.)/])/i;
    isDirectlyReferenced = cppRegex.test(roleText) || cppRegex.test(descText);
  } else {
    isDirectlyReferenced = roleText.includes(norm) || descText.includes(norm);
  }

  if (isDirectlyReferenced) {
    return {
      priority: 'High',
      reason: `Directly referenced in ${drive.company}'s position requirements for ${drive.role}.`
    };
  }

  const coreFoundationSkills = ['python', 'javascript', 'sql', 'dsa', 'data structures', 'java', 'c++'];
  if (coreFoundationSkills.includes(norm)) {
    return {
      priority: 'Medium',
      reason: 'Core foundational competency expected in technical assessments and coding rounds.'
    };
  }

  return {
    priority: 'Low',
    reason: 'Supplementary tool or methodology that enhances candidate competitiveness.'
  };
};

/**
 * Generates personalized, profile-aware recommendations
 */
const generatePersonalizedRecommendations = (student, readiness, missingSkills, targetDrive) => {
  const recommendations = [];

  const programmingSkills = ['python', 'javascript', 'java', 'c++'];
  const missingProg = missingSkills.find((s) => programmingSkills.includes(normalizeSkill(s)));
  if (missingProg) {
    recommendations.push(
      `Practice core problem-solving using ${missingProg} through targeted coding challenges and foundational exercises.`
    );
  }

  const databaseSkills = ['sql', 'mysql', 'postgresql', 'mongodb'];
  const missingDb = missingSkills.find((s) => databaseSkills.includes(normalizeSkill(s)));
  if (missingDb) {
    recommendations.push(
      `Develop a small data-driven CRUD module using ${missingDb} to demonstrate query design and schema handling.`
    );
  }

  const frameworkSkills = ['react', 'node.js', 'express', 'docker', 'kubernetes', 'aws'];
  const missingFramework = missingSkills.find((s) => frameworkSkills.includes(normalizeSkill(s)));
  if (missingFramework) {
    recommendations.push(
      `Build a focused prototype project incorporating ${missingFramework} to showcase hands-on application readiness.`
    );
  }

  if (Number(student.mockInterviewScore) < 70) {
    recommendations.push(
      `Schedule structured mock interview sessions to improve technical articulation for ${targetDrive.company} interview rounds.`
    );
  }

  if (Number(student.communicationScore) < 70) {
    recommendations.push(
      'Refine concise architectural walkthroughs and project elevator pitches to boost behavioral round confidence.'
    );
  }

  if (!Array.isArray(student.projects) || student.projects.length < 2) {
    recommendations.push(
      `Document and publish a GitHub repository featuring a practical project aligned with the ${targetDrive.role} requirements.`
    );
  }

  if (recommendations.length < 3 && missingSkills.length > 0) {
    recommendations.push(
      `Review key conceptual questions and industry standard patterns for ${missingSkills[0]} before the assessment.`
    );
  }

  return recommendations.slice(0, 5);
};

/**
 * Generates a 7-day actionable remediation plan
 */
const generate7DayActionPlan = (priorityMissingSkills, targetDrive) => {
  const topSkill1 = priorityMissingSkills[0]?.skill || 'Core Technical Principles';
  const topSkill2 = priorityMissingSkills[1]?.skill || 'System Workflows';
  const topSkill3 = priorityMissingSkills[2]?.skill || 'Practical Implementation';

  return [
    {
      day: 1,
      focus: `${topSkill1} Fundamentals`,
      action: `Review syntax, fundamental data structures, and core principles for ${topSkill1}.`,
      estimatedMinutes: 60
    },
    {
      day: 2,
      focus: `${topSkill1} Hands-on Implementation`,
      action: `Build 2-3 focused code exercises demonstrating real-world usage of ${topSkill1}.`,
      estimatedMinutes: 90
    },
    {
      day: 3,
      focus: `${topSkill2} Concepts & Setup`,
      action: `Set up local workspace and study common industry patterns for ${topSkill2}.`,
      estimatedMinutes: 60
    },
    {
      day: 4,
      focus: `${topSkill2} Practical Integration`,
      action: `Connect ${topSkill2} with existing project code or write integration test scenarios.`,
      estimatedMinutes: 90
    },
    {
      day: 5,
      focus: `${topSkill3} & Tooling`,
      action: `Explore debugging workflows, CLI commands, and deployment patterns related to ${topSkill3}.`,
      estimatedMinutes: 45
    },
    {
      day: 6,
      focus: `${targetDrive.company} Assessment Preparation`,
      action: `Solve timed algorithmic or domain-specific questions matching ${targetDrive.role} assessment patterns.`,
      estimatedMinutes: 60
    },
    {
      day: 7,
      focus: 'Technical Review & Resume Alignment',
      action: `Update resume bullet points with newly practiced technical topics and perform a self-guided mock defense.`,
      estimatedMinutes: 45
    }
  ];
};

/**
 * Evaluates skill coverage and generates explainable improvement insights
 */
export const analyzeSkillGap = (studentId, driveId) => {
  if (!studentId || typeof studentId !== 'string' || !studentId.trim()) {
    return { error: 'invalid_student_id' };
  }

  if (!driveId || typeof driveId !== 'string' || !driveId.trim()) {
    return { error: 'invalid_drive_id' };
  }

  const normalizedStudentId = studentId.trim().toUpperCase();
  const normalizedDriveId = driveId.trim().toUpperCase();

  const student = students.find((s) => s.id.toUpperCase() === normalizedStudentId);
  if (!student) {
    return { error: 'student_not_found' };
  }

  const drive = drives.find((d) => d.id.toUpperCase() === normalizedDriveId);
  if (!drive) {
    return { error: 'drive_not_found' };
  }

  const readiness = analyzeStudentReadiness(student.id) || {};
  const studentSkills = Array.isArray(student.technicalSkills) ? student.technicalSkills : [];
  const requiredSkills = extractDriveRequiredSkills(drive);

  const matchedSkills = [];
  const partialSkills = [];
  const missingSkills = [];

  requiredSkills.forEach((reqSkill) => {
    const evaluation = evaluateSkillMatch(reqSkill, studentSkills);
    if (evaluation.matchType === 'exact') {
      matchedSkills.push(reqSkill);
    } else if (evaluation.matchType === 'partial') {
      partialSkills.push({
        requiredSkill: reqSkill,
        candidateSkill: evaluation.matchedCandidateSkill,
        note: `Equivalent or closely related competency demonstrated via ${evaluation.matchedCandidateSkill}.`
      });
    } else {
      missingSkills.push(reqSkill);
    }
  });

  const totalRequired = requiredSkills.length;
  // Exact match awards 1.0, partial match awards 0.5 towards coverage
  const effectiveMatches = matchedSkills.length + partialSkills.length * 0.5;

  let skillCoverageScore = 0;
  let gapSeverity = 'Unknown';

  if (totalRequired > 0) {
    skillCoverageScore = roundToOneDecimal((effectiveMatches / totalRequired) * 100);
    const missingRatio = (totalRequired - effectiveMatches) / totalRequired;

    if (missingRatio <= 0.20) {
      gapSeverity = 'Low';
    } else if (missingRatio <= 0.40) {
      gapSeverity = 'Moderate';
    } else if (missingRatio <= 0.60) {
      gapSeverity = 'High';
    } else {
      gapSeverity = 'Critical';
    }
  }

  // Priority missing skills breakdown
  const priorityMissingSkills = missingSkills.map((skill) => {
    const priorityMeta = determinePriorityForSkill(skill, drive);
    return {
      skill,
      priority: priorityMeta.priority,
      reason: priorityMeta.reason
    };
  });

  // Sort priority missing skills: High > Medium > Low
  const priorityOrder = { High: 3, Medium: 2, Low: 1 };
  priorityMissingSkills.sort((a, b) => priorityOrder[b.priority] - priorityOrder[a.priority]);

  // Recommendations and 7-day action plan
  const recommendations = generatePersonalizedRecommendations(student, readiness, missingSkills, drive);
  const actionPlan = generate7DayActionPlan(priorityMissingSkills, drive);

  // What-if simulation: assume candidate learns top 1-2 missing skills
  const assumedSkillsAdded = priorityMissingSkills.slice(0, 2).map((item) => item.skill);
  const simulatedMatches = effectiveMatches + assumedSkillsAdded.length;
  const projectedSkillCoverage = totalRequired > 0
    ? roundToOneDecimal(Math.min(100, (simulatedMatches / totalRequired) * 100))
    : skillCoverageScore;

  const simulationExplanation = assumedSkillsAdded.length > 0
    ? `Acquiring ${assumedSkillsAdded.join(' and ')} would raise requirement coverage from ${skillCoverageScore}% to ${projectedSkillCoverage}%.`
    : 'All primary technical skills are currently covered in candidate profile.';

  return {
    studentId: student.id,
    studentName: student.name,
    branch: student.branch,
    targetDrive: {
      driveId: drive.id,
      company: drive.company,
      role: drive.role,
      packageLPA: drive.packageLPA
    },
    skillCoverageScore,
    gapSeverity,
    matchedSkills,
    partialSkills,
    missingSkills,
    priorityMissingSkills,
    recommendations,
    actionPlan,
    whatIfSimulation: {
      label: 'Prototype what-if simulation',
      currentSkillCoverage: skillCoverageScore,
      assumedSkillsAdded,
      projectedSkillCoverage,
      explanation: simulationExplanation
    },
    disclaimer: 'This readiness analysis is a deterministic prototype recommendation derived from available student profile attributes and placement drive criteria. It does not predict or guarantee hiring outcomes.'
  };
};