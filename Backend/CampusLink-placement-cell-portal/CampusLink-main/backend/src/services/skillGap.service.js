import * as studentRepository from '../repositories/student.repository.js';
import * as driveRepository from '../repositories/drive.repository.js';

/**
 * Normalizes text for canonical token matching.
 * @param {string} text
 * @returns {string}
 */
function normalizeText(text) {
  return String(text || '')
    .toLowerCase()
    .replace(/[^a-z0-9]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Checks whether targetSkill is mentioned in candidate text.
 * Uses word-boundary matching so "Java" does not match "JavaScript".
 * @param {string} sourceText
 * @param {string} targetSkill
 * @returns {boolean}
 */
function textContainsSkill(sourceText, targetSkill) {
  const normSource = ` ${normalizeText(sourceText)} `;
  const normSkill = normalizeText(targetSkill);
  if (!normSkill) return false;
  return normSource.includes(` ${normSkill} `);
}

/**
 * Extracts a displayable name/title from a project entry.
 * @param {string|Object} project
 * @returns {string}
 */
function getProjectTitle(project) {
  if (!project) return '';
  if (typeof project === 'string') return project.trim();
  return (project.title || project.name || project.projectName || '').trim();
}

/**
 * Extracts all searchable text from a project entry.
 * @param {string|Object} project
 * @returns {string}
 */
function getProjectSearchableText(project) {
  if (!project) return '';
  if (typeof project === 'string') return project;
  const parts = [
    project.title,
    project.name,
    project.projectName,
    project.description,
    Array.isArray(project.techStack) ? project.techStack.join(' ') : project.techStack
  ];
  return parts.filter(Boolean).join(' ');
}

/**
 * Pure deterministic analysis comparing student credentials to drive requirements.
 *
 * @param {Object} student Authoritative student entity from MySQL
 * @param {Object} drive Placement drive entity from MySQL
 * @returns {Object}
 */
export function calculateSkillGap(student, drive) {
  if (!student) {
    throw new Error('Student entity is required to perform skill gap analysis');
  }
  if (!drive) {
    throw new Error('Drive entity is required to perform skill gap analysis');
  }

  // 1. Authoritative verified technical skills
  const verifiedList = Array.isArray(student.technicalSkills)
    ? student.technicalSkills
    : Array.isArray(student.skills)
    ? student.skills
    : typeof student.technical_skills === 'string'
    ? JSON.parse(student.technical_skills || '[]')
    : [];

  const normalizedVerified = new Map();
  verifiedList.forEach((sk) => {
    if (typeof sk === 'string' && sk.trim()) {
      normalizedVerified.set(normalizeText(sk), sk.trim());
    }
  });

  // 2. Drive requirements
  const requiredSkills = Array.isArray(drive.requiredSkills)
    ? drive.requiredSkills
    : Array.isArray(drive.skills)
    ? drive.skills
    : typeof drive.required_skills === 'string'
    ? JSON.parse(drive.required_skills || '[]')
    : [];

  // 3. Projects & practical portfolio evidence
  let rawProjects = Array.isArray(student.projects)
    ? student.projects
    : typeof student.projects === 'string'
    ? JSON.parse(student.projects || '[]')
    : [];

  const projectEntries = rawProjects
    .map((p) => ({
      title: getProjectTitle(p),
      searchableText: getProjectSearchableText(p)
    }))
    .filter((p) => Boolean(p.title));

  const matchedSkills = [];
  const partialSkills = [];
  const missingSkills = [];

  requiredSkills.forEach((req) => {
    if (!req || typeof req !== 'string' || !req.trim()) return;
    const reqClean = req.trim();
    const reqNorm = normalizeText(reqClean);

    // Step A: Exact verified match
    if (normalizedVerified.has(reqNorm)) {
      matchedSkills.push(reqClean);
      return;
    }

    // Step B: Check for practical project evidence (Partial Skill)
    let matchedProjectTitle = null;
    for (const proj of projectEntries) {
      if (textContainsSkill(proj.searchableText, reqClean)) {
        matchedProjectTitle = proj.title;
        break;
      }
    }

    if (matchedProjectTitle) {
      partialSkills.push({
        skill: reqClean,
        evidence: matchedProjectTitle,
        evidenceType: 'project',
        reason: `Applied in project "${matchedProjectTitle}", but not yet verified as a formal competency.`,
        verificationRequired: `Undergo technical assessment or repository review for ${reqClean} to achieve full verified status.`
      });
      return;
    }

    // Step C: Neither verified nor evidenced (Missing Skill)
    missingSkills.push(reqClean);
  });

  // Calculate coverage: matched = 1.0 weight, partial = 0.5 weight
  const totalRequired = requiredSkills.length;
  let coveragePercentage = 0;
  if (totalRequired > 0) {
    const rawScore = (matchedSkills.length + partialSkills.length * 0.5) / totalRequired;
    coveragePercentage = Math.min(100, Math.round(rawScore * 100));
  }

  // Actionable acquisition recommendations
  const recommendedActions = [];
  if (partialSkills.length > 0) {
    partialSkills.forEach((item) => {
      recommendedActions.push(
        `Validate ${item.skill} through institutional code review or technical assessment (currently evidenced in project "${item.evidence}").`
      );
    });
  }

  if (missingSkills.length > 0) {
    const topMissing = missingSkills.slice(0, 3).join(', ');
    recommendedActions.push(
      `Acquire baseline proficiency in unverified target prerequisites: ${topMissing}.`
    );
  }

  if (recommendedActions.length === 0) {
    recommendedActions.push('Candidate meets all drive requirements with full verified coverage.');
  }

  return {
    studentId: student.id,
    studentName: student.name,
    driveId: drive.id,
    company: drive.company,
    role: drive.role,
    totalRequiredSkills: totalRequired,
    matchedCount: matchedSkills.length,
    partialCount: partialSkills.length,
    missingCount: missingSkills.length,
    skillCoverage: coveragePercentage,
    coveragePercentage,
    matchedSkills,
    partialSkills,
    missingSkills,
    recommendedActions,
    explanation: totalRequired > 0
      ? `${matchedSkills.length} verified match(es), ${partialSkills.length} partial skill(s) with project evidence, and ${missingSkills.length} missing skill(s) out of ${totalRequired} required competencies.`
      : 'Target drive has no specific technical requirements registered.',
    disclaimer: 'Deterministic evaluation based on verified MySQL records and repository evidence. Does not predict or guarantee placement hiring outcomes.'
  };
}

/**
 * Analyzes skill gap for student and drive by their authoritative IDs from MySQL.
 *
 * @param {string} studentId
 * @param {string} driveId
 * @returns {Promise<Object>}
 */
export async function analyzeSkillGap(studentId, driveId) {
  const [student, drive] = await Promise.all([
    studentRepository.findStudentById(studentId),
    driveRepository.findDriveById(driveId)
  ]);

  if (!student) {
    throw new Error(`Student with ID ${studentId} not found`);
  }
  if (!drive) {
    throw new Error(`Placement drive with ID ${driveId} not found`);
  }

  return calculateSkillGap(student, drive);
}