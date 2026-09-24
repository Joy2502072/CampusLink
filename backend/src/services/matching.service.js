/**
 * CampusLink Backend - Deterministic Prototype Matching Engine
 * 
 * NOTICE:
 * This is a deterministic rule-based demo matching service designed for prototype
 * evaluation. It evaluates candidate readiness indicators and text-based keyword
 * overlaps. It does not provide hiring predictions or guarantee selection outcomes.
 */

// Common stopwords to exclude during basic tokenization
const STOP_WORDS = new Set([
  'a', 'an', 'and', 'are', 'as', 'at', 'be', 'by', 'for', 'from', 'has', 'he',
  'in', 'is', 'it', 'its', 'of', 'on', 'that', 'the', 'to', 'was', 'were',
  'will', 'with', 'round', 'role', 'entry', 'level', 'hiring', 'campus', 'drive',
  'building', 'targeting', 'evaluation', 'focusing', 'session', 'covering'
]);

/**
 * Clean and normalize text by stripping punctuation and lowercasing
 */
const normalizeText = (text) => {
  if (!text || typeof text !== 'string') return '';
  return text.toLowerCase().replace(/[^a-z0-9\s.+/#-]/g, ' ');
};

/**
 * Extract distinct words and normalized phrases from text
 */
const extractSearchTokens = (text) => {
  const normalized = normalizeText(text);
  const rawWords = normalized.split(/\s+/).filter(Boolean);
  return rawWords.filter((w) => !STOP_WORDS.has(w));
};

/**
 * Deterministically calculate skill overlap points (up to 35)
 * Formula: (matched unique student skills / total unique student skills) * 35
 */
const evaluateTechnicalSkillMatch = (studentSkills = [], role = '', description = '') => {
  const maxScore = 35;

  // Deduplicate and filter student skills case-insensitively while preserving original labels
  const uniqueSkillMap = new Map();
  for (const skill of studentSkills) {
    if (!skill || typeof skill !== 'string') continue;
    const trimmed = skill.trim();
    if (!trimmed) continue;
    const lowerKey = trimmed.toLowerCase();
    if (!uniqueSkillMap.has(lowerKey)) {
      uniqueSkillMap.set(lowerKey, trimmed);
    }
  }

  const distinctSkills = Array.from(uniqueSkillMap.values());
  const totalUniqueSkills = distinctSkills.length;

  if (totalUniqueSkills === 0) {
    return {
      score: 0,
      maxScore,
      matchedSkills: [],
      reason: 'No declared technical skills available to evaluate against role specifications.'
    };
  }

  const combinedDriveText = `${role} ${description}`;
  const normalizedDriveText = normalizeText(combinedDriveText);
  const driveTokens = new Set(extractSearchTokens(combinedDriveText));

  const matchedSkills = [];

  for (const skill of distinctSkills) {
    const normalizedSkill = normalizeText(skill).trim();
    if (!normalizedSkill) continue;

    // Direct multi-word phrase check (e.g., "data structures", "power systems")
    if (normalizedDriveText.includes(normalizedSkill)) {
      matchedSkills.push(skill);
      continue;
    }

    // Individual keyword token match check (e.g., "react", "docker", "matlab")
    const skillTokens = normalizedSkill.split(/\s+/).filter(Boolean);
    const hasTokenMatch = skillTokens.some((token) => driveTokens.has(token));
    if (hasTokenMatch) {
      matchedSkills.push(skill);
    }
  }

  const matchedCount = matchedSkills.length;
  const rawScore = (matchedCount / totalUniqueSkills) * maxScore;
  const score = Math.round(Math.min(maxScore, Math.max(0, rawScore)) * 10) / 10;

  let reason = '';
  if (matchedCount === totalUniqueSkills && totalUniqueSkills > 0) {
    reason = `Full technical alignment: All ${matchedCount} declared skills matched role specifications (${score}/${maxScore} pts).`;
  } else if (matchedCount > 0) {
    reason = `Proportional skill match: ${matchedCount} of ${totalUniqueSkills} declared skills align with role requirements (${score}/${maxScore} pts).`;
  } else {
    reason = `No direct skill overlap: None of the ${totalUniqueSkills} declared candidate skills match role requirements (0/${maxScore} pts).`;
  }

  return {
    score,
    maxScore,
    matchedSkills,
    reason
  };
};

/**
 * Determine match tier based on aggregate score
 */
const getMatchLevel = (overallScore) => {
  if (overallScore >= 80) return 'Strong Match';
  if (overallScore >= 60) return 'Moderate Match';
  return 'Developing Match';
};

/**
 * Calculate complete deterministic match breakdown for a student and drive
 */
export const calculateStudentDriveMatch = (student, drive) => {
  // 1. Branch Eligibility (25 pts)
  const branchMaxScore = 25;
  const studentBranch = (student.branch || '').toUpperCase();
  const eligibleBranches = (drive.eligibleBranches || []).map((b) => b.toUpperCase());
  const isBranchEligible = eligibleBranches.includes(studentBranch);
  const branchScore = isBranchEligible ? branchMaxScore : 0;
  const branchReason = isBranchEligible
    ? `Student's branch (${studentBranch}) satisfies institutional eligibility criteria.`
    : `Student's branch (${studentBranch}) is not listed under eligible disciplines (${eligibleBranches.join(', ')}).`;

  // 2. Technical Skill Match (35 pts)
  const skillResult = evaluateTechnicalSkillMatch(
    student.technicalSkills || [],
    drive.role || '',
    drive.description || ''
  );

  // 3. Placement Readiness (20 pts)
  const readinessMaxScore = 20;
  const studentReadiness = Number(student.readinessScore) || 0;
  const readinessScore = Math.round(((studentReadiness / 100) * readinessMaxScore) * 10) / 10;
  const readinessReason = `Placement readiness index of ${studentReadiness}% scaled to ${readinessScore}/${readinessMaxScore} points.`;

  // 4. Mock Interview (10 pts)
  const mockMaxScore = 10;
  const studentMock = Number(student.mockInterviewScore) || 0;
  const mockScore = Math.round(((studentMock / 100) * mockMaxScore) * 10) / 10;
  const mockReason = `Mock interview rating of ${studentMock}% scaled to ${mockScore}/${mockMaxScore} points.`;

  // 5. Communication (10 pts)
  const commMaxScore = 10;
  const studentComm = Number(student.communicationScore) || 0;
  const commScore = Math.round(((studentComm / 100) * commMaxScore) * 10) / 10;
  const commReason = `Communication proficiency rating of ${studentComm}% scaled to ${commScore}/${commMaxScore} points.`;

  // Aggregate Total (100 pts)
  const rawTotal = branchScore + skillResult.score + readinessScore + mockScore + commScore;
  const overallMatchScore = Math.round(Math.min(100, Math.max(0, rawTotal)) * 10) / 10;
  const matchLevel = getMatchLevel(overallMatchScore);

  // Generate Strengths & Improvement Areas
  const strengths = [];
  const improvementAreas = [];

  if (isBranchEligible) {
    strengths.push(`Direct branch alignment with ${drive.company} eligibility requirements.`);
  } else {
    improvementAreas.push('Discipline mismatch: Candidate branch is not explicitly targeted for this drive.');
  }

  if (skillResult.matchedSkills.length > 0) {
    strengths.push(`Demonstrated proficiency in relevant tools: ${skillResult.matchedSkills.join(', ')}.`);
  } else {
    improvementAreas.push('Technical depth: Expand project portfolio covering role-specific technologies.');
  }

  if (studentReadiness >= 80) {
    strengths.push(`Solid placement readiness foundation (${studentReadiness}% benchmark).`);
  } else if (studentReadiness < 65) {
    improvementAreas.push('Readiness gap: Reinforce core aptitude and fundamental assessment modules.');
  }

  if (studentMock < 70) {
    improvementAreas.push('Interview performance: Complete mock technical rounds to improve behavioral clarity.');
  }

  if (studentComm < 70) {
    improvementAreas.push('Communication articulation: Attend verbal reasoning and group discussion prep sessions.');
  }

  // Synthesize Prototype Recommendation
  let recommendation = '';
  if (overallMatchScore >= 80) {
    recommendation = `Priority candidate: Highly aligned for ${drive.company} (${drive.role}). Recommend expediting application and scheduling preliminary interview preparation.`;
  } else if (overallMatchScore >= 60) {
    recommendation = `Viable candidate: Suitable for ${drive.company} with targeted preparation in remaining skill gaps prior to assessment rounds.`;
  } else {
    recommendation = `Development track recommended: Focus on core readiness assessments and skill enhancement before targeting ${drive.company}.`;
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
        maxScore: branchMaxScore,
        matched: isBranchEligible,
        reason: branchReason
      },
      technicalSkillMatch: {
        score: skillResult.score,
        maxScore: skillResult.maxScore,
        matchedSkills: skillResult.matchedSkills,
        reason: skillResult.reason
      },
      academicReadiness: {
        score: readinessScore,
        maxScore: readinessMaxScore,
        studentScore: studentReadiness,
        reason: readinessReason
      },
      mockInterview: {
        score: mockScore,
        maxScore: mockMaxScore,
        studentScore: studentMock,
        reason: mockReason
      },
      communication: {
        score: commScore,
        maxScore: commMaxScore,
        studentScore: studentComm,
        reason: commReason
      }
    },
    strengths,
    improvementAreas,
    recommendation
  };
};