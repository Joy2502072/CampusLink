import React, { useEffect, useState } from 'react';
import {
  Briefcase,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Target,
  Code2,
  GraduationCap,
  MessageSquare,
  Activity,
  Loader2,
  TrendingUp
} from 'lucide-react';

const API_BASE_URL = 'http://localhost:5000/api';
const STUDENT_ID = 'DEMO-STU-001';

function findValue(object, possibleKeys) {
  if (
    object === null ||
    object === undefined ||
    typeof object !== 'object'
  ) {
    return undefined;
  }

  for (const key of possibleKeys) {
    if (
      Object.prototype.hasOwnProperty.call(object, key) &&
      object[key] !== undefined &&
      object[key] !== null
    ) {
      return object[key];
    }
  }

  for (const value of Object.values(object)) {
    if (
      value !== null &&
      value !== undefined &&
      typeof value === 'object'
    ) {
      const result = findValue(value, possibleKeys);

      if (result !== undefined) {
        return result;
      }
    }
  }

  return undefined;
}

function extractNumericScore(object, keys) {
  const value = findValue(object, keys);

  if (
    value !== undefined &&
    value !== null &&
    !Number.isNaN(Number(value))
  ) {
    return Number(value);
  }

  return 0;
}

function findBreakdown(object) {
  if (!object || typeof object !== 'object') {
    return {};
  }

  const possibleKeys = [
    'breakdown',
    'scoreBreakdown',
    'matchBreakdown',
    'factors',
    'factorBreakdown'
  ];

  for (const key of possibleKeys) {
    if (
      object[key] &&
      typeof object[key] === 'object'
    ) {
      return object[key];
    }
  }

  return object;
}

function getFactorScore(breakdown, factorNames) {
  const scoreKeys = [
    'score',
    'points',
    'earnedPoints',
    'earned',
    'value',
    'weightedScore',
    'contribution'
  ];

  for (const factorName of factorNames) {
    const factor = findValue(
      breakdown,
      [factorName]
    );

    if (
      factor !== undefined &&
      factor !== null
    ) {
      if (
        typeof factor === 'number' ||
        typeof factor === 'string'
      ) {
        const numeric = Number(factor);

        if (!Number.isNaN(numeric)) {
          return numeric;
        }
      }

      if (typeof factor === 'object') {
        const numeric = extractNumericScore(
          factor,
          scoreKeys
        );

        if (!Number.isNaN(numeric)) {
          return numeric;
        }
      }
    }
  }

  return 0;
}

export default function StudentJobMatching() {
  const [drives, setDrives] = useState([]);
  const [selectedDriveId, setSelectedDriveId] =
    useState('');
  const [matchData, setMatchData] =
    useState(null);

  const [loadingDrives, setLoadingDrives] =
    useState(true);
  const [loadingMatch, setLoadingMatch] =
    useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    loadDrives();
  }, []);

  useEffect(() => {
    if (selectedDriveId) {
      loadMatch(selectedDriveId);
    }
  }, [selectedDriveId]);

  async function loadDrives() {
    try {
      setLoadingDrives(true);
      setError('');

      const response = await fetch(
        `${API_BASE_URL}/drives`
      );

      if (!response.ok) {
        throw new Error(
          'Failed to load placement drives'
        );
      }

      const result = await response.json();

      const driveList =
        Array.isArray(result.data)
          ? result.data
          : [];

      setDrives(driveList);

      if (driveList.length > 0) {
        setSelectedDriveId(
          driveList[0].id
        );
      }
    } catch (err) {
      console.error(err);

      setError(
        err.message ||
          'Unable to load placement drives'
      );
    } finally {
      setLoadingDrives(false);
    }
  }

  async function loadMatch(driveId) {
    try {
      setLoadingMatch(true);
      setError('');
      setMatchData(null);

      const response = await fetch(
        `${API_BASE_URL}/matching/student/${STUDENT_ID}/drive/${driveId}`
      );

      if (!response.ok) {
        throw new Error(
          'Failed to calculate student-job match'
        );
      }

      const result = await response.json();

      console.log(
        '[CampusLink] Matching API response:',
        result
      );

      setMatchData(
        result.data || result
      );
    } catch (err) {
      console.error(err);

      setError(
        err.message ||
          'Unable to calculate match'
      );
    } finally {
      setLoadingMatch(false);
    }
  }

  const selectedDrive =
    drives.find(
      (drive) =>
        drive.id === selectedDriveId
    );

  const score = extractNumericScore(
    matchData,
    [
      'matchScore',
      'overallMatchScore',
      'overallScore',
      'matchingScore',
      'totalScore',
      'score'
    ]
  );

  const breakdown =
    findBreakdown(matchData);

  /*
   * Backend matching weights:
   *
   * Branch Eligibility  = 25
   * Technical Skills    = 35
   * Placement Readiness = 20
   * Mock Interview      = 10
   * Communication       = 10
   */

  const branchScore =
    getFactorScore(
      breakdown,
      [
        'branchEligibility',
        'branchEligibilityScore',
        'branchScore',
        'branch'
      ]
    );

  const technicalScore =
    getFactorScore(
      breakdown,
      [
        'technicalSkillMatch',
        'technicalSkillScore',
        'technicalSkills',
        'technicalScore',
        'technicalSkill'
      ]
    );

  // IMPORTANT:
  // Backend uses "academicReadiness" for the 20-point readiness factor.
  const readinessScore =
    getFactorScore(
      breakdown,
      [
        'academicReadiness',
        'academicReadinessScore',
        'placementReadiness',
        'placementReadinessScore',
        'readinessScore',
        'readiness'
      ]
    );

  const mockScore =
    getFactorScore(
      breakdown,
      [
        'mockInterview',
        'mockInterviewScore',
        'mockScore',
        'interviewScore'
      ]
    );

  const communicationScore =
    getFactorScore(
      breakdown,
      [
        'communication',
        'communicationScore',
        'communicationReadiness'
      ]
    );

  const recommendation =
    findValue(
      matchData,
      [
        'recommendation',
        'recommendationText',
        'actionRecommendation'
      ]
    ) ||
    'Continue improving the skills relevant to this placement drive.';

  function getScoreColor(value) {
    if (value >= 80) return '#10b981';
    if (value >= 60) return '#f59e0b';
    return '#ef4444';
  }

  function getScoreLabel(value) {
    if (value >= 80) {
      return 'Strong Match';
    }

    if (value >= 60) {
      return 'Moderate Match';
    }

    return 'Developing Match';
  }

  const scoreColor =
    getScoreColor(score);

  if (loadingDrives) {
    return (
      <div style={styles.centerState}>
        <Loader2 size={30} />

        <p>
          Loading placement drives...
        </p>
      </div>
    );
  }

  return (
    <div style={styles.page}>
      <div style={styles.header}>
        <div style={styles.titleRow}>
          <div style={styles.titleIcon}>
            <Briefcase size={22} />
          </div>

          <div>
            <h1 style={styles.title}>
              Student Job Matching
            </h1>

            <p style={styles.subtitle}>
              Explainable matching between
              student readiness and placement
              drives.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => {
            if (selectedDriveId) {
              loadMatch(selectedDriveId);
            } else {
              loadDrives();
            }
          }}
          style={styles.refreshButton}
        >
          <RefreshCw size={16} />
          Refresh
        </button>
      </div>

      <div style={styles.demoNotice}>
        <AlertTriangle size={17} />

        <span>
          Demo analysis using synthetic data.
          Match scores are explainable prototype
          scores, not hiring guarantees.
        </span>
      </div>

      {error && (
        <div style={styles.errorBox}>
          <AlertTriangle size={18} />

          <div>
            <strong>
              Matching Service Error
            </strong>

            <p>{error}</p>
          </div>
        </div>
      )}

      <div style={styles.studentCard}>
        <div style={styles.studentIcon}>
          <GraduationCap size={24} />
        </div>

        <div>
          <span style={styles.label}>
            STUDENT PROFILE
          </span>

          <h2 style={styles.studentName}>
            Demo Student A
          </h2>

          <p style={styles.studentMeta}>
            CSE • DEMO-STU-001
          </p>
        </div>

        <div style={styles.studentStatus}>
          <CheckCircle2 size={15} />
          Readiness Profile Available
        </div>
      </div>

      <div style={styles.card}>
        <div style={styles.cardHeader}>
          <div>
            <h2 style={styles.cardTitle}>
              Select Placement Drive
            </h2>

            <p style={styles.cardSubtitle}>
              Choose a drive to calculate
              student-job compatibility.
            </p>
          </div>
        </div>

        <select
          value={selectedDriveId}
          onChange={(event) =>
            setSelectedDriveId(
              event.target.value
            )
          }
          style={styles.select}
        >
          {drives.map((drive) => (
            <option
              key={drive.id}
              value={drive.id}
            >
              {drive.company} — {drive.role}{' '}
              ({drive.id})
            </option>
          ))}
        </select>
      </div>

      {selectedDrive && (
        <div style={styles.driveCard}>
          <div>
            <span style={styles.driveLabel}>
              SELECTED PLACEMENT DRIVE
            </span>

            <h2 style={styles.driveTitle}>
              {selectedDrive.company}
            </h2>

            <p style={styles.driveRole}>
              {selectedDrive.role}
            </p>
          </div>

          <div style={styles.driveDetails}>
            <div>
              <span style={styles.detailLabel}>
                DATE
              </span>

              <span>
                {selectedDrive.date}
              </span>
            </div>

            <div>
              <span style={styles.detailLabel}>
                PACKAGE
              </span>

              <span>
                {String(
                  selectedDrive.packageLPA
                ).replace(/\s*LPA$/i, '')}{' '}
                LPA
              </span>
            </div>

            <div>
              <span style={styles.detailLabel}>
                OPENINGS
              </span>

              <span>
                {selectedDrive.openings}
              </span>
            </div>
          </div>
        </div>
      )}

      {loadingMatch && (
        <div style={styles.centerState}>
          <Loader2 size={30} />

          <p>
            Calculating explainable match...
          </p>
        </div>
      )}

      {!loadingMatch && matchData && (
        <>
          <div style={styles.scoreCard}>
            <div>
              <span style={styles.scoreLabel}>
                STUDENT–JOB MATCH SCORE
              </span>

              <div style={styles.scoreRow}>
                <span
                  style={{
                    ...styles.score,
                    color: scoreColor
                  }}
                >
                  {score}
                </span>

                <span
                  style={{
                    ...styles.scoreOutOf,
                    color: scoreColor
                  }}
                >
                  / 100
                </span>
              </div>

              <div
                style={{
                  ...styles.matchBadge,
                  backgroundColor:
                    `${scoreColor}18`,
                  color: scoreColor
                }}
              >
                <CheckCircle2 size={15} />

                {getScoreLabel(score)}
              </div>
            </div>

            <div
              style={{
                ...styles.targetIcon,
                color: scoreColor,
                backgroundColor:
                  `${scoreColor}18`
              }}
            >
              <Target size={42} />
            </div>
          </div>

          <div style={styles.sectionTitle}>
            Why This Match Score?
          </div>

          <div style={styles.grid}>
            <ScoreFactor
              icon={
                <GraduationCap size={20} />
              }
              title="Branch Eligibility"
              value={branchScore}
              max={25}
            />

            <ScoreFactor
              icon={
                <Code2 size={20} />
              }
              title="Technical Skills"
              value={technicalScore}
              max={35}
            />

            <ScoreFactor
              icon={
                <Target size={20} />
              }
              title="Placement Readiness"
              value={readinessScore}
              max={20}
            />

            <ScoreFactor
              icon={
                <Activity size={20} />
              }
              title="Mock Interview"
              value={mockScore}
              max={10}
            />

            <ScoreFactor
              icon={
                <MessageSquare size={20} />
              }
              title="Communication"
              value={communicationScore}
              max={10}
            />
          </div>

          <div style={styles.bottomGrid}>
            <div style={styles.infoCard}>
              <div style={styles.infoHeader}>
                <TrendingUp size={18} />

                <h3
                  style={
                    styles.infoHeaderTitle
                  }
                >
                  Recommendation
                </h3>
              </div>

              <p style={styles.infoText}>
                {recommendation}
              </p>
            </div>

            <div style={styles.infoCard}>
              <div style={styles.infoHeader}>
                <Target size={18} />

                <h3
                  style={
                    styles.infoHeaderTitle
                  }
                >
                  Match Interpretation
                </h3>
              </div>

              <p style={styles.infoText}>
                {score >= 80
                  ? 'The student demonstrates strong alignment with this placement drive.'
                  : score >= 60
                    ? 'The student has reasonable alignment, with some areas available for improvement.'
                    : 'The student has several improvement areas before becoming strongly aligned with this drive.'}
              </p>
            </div>
          </div>

          <div style={styles.footerNotice}>
            <AlertTriangle size={15} />

            <span>
              This score explains compatibility
              using the current demo profile. It
              does not predict or guarantee
              selection.
            </span>
          </div>
        </>
      )}
    </div>
  );
}

function ScoreFactor({
  icon,
  title,
  value,
  max
}) {
  const numericValue =
    Number(value || 0);

  const percentage =
    max > 0
      ? Math.min(
          100,
          (numericValue / max) * 100
        )
      : 0;

  return (
    <div style={styles.factorCard}>
      <div style={styles.factorTop}>
        <div style={styles.factorIcon}>
          {icon}
        </div>

        <div>
          <h3 style={styles.factorTitle}>
            {title}
          </h3>

          <p style={styles.factorScore}>
            {numericValue} / {max}
          </p>
        </div>
      </div>

      <div style={styles.progressTrack}>
        <div
          style={{
            ...styles.progressBar,
            width: `${percentage}%`
          }}
        />
      </div>
    </div>
  );
}

const styles = {
  page: {
    padding: '28px',
    maxWidth: '1400px',
    margin: '0 auto',
    color: '#e2e8f0'
  },

  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: '20px',
    marginBottom: '20px'
  },

  titleRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '14px'
  },

  titleIcon: {
    width: '46px',
    height: '46px',
    borderRadius: '12px',
    backgroundColor:
      'rgba(99, 102, 241, 0.15)',
    color: '#818cf8',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },

  title: {
    margin: 0,
    fontSize: '24px',
    fontWeight: 750,
    color: '#f8fafc'
  },

  subtitle: {
    margin: '5px 0 0',
    color: '#94a3b8',
    fontSize: '13px'
  },

  refreshButton: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '9px 14px',
    borderRadius: '8px',
    border: '1px solid #334155',
    backgroundColor: '#111827',
    color: '#cbd5e1',
    cursor: 'pointer',
    fontWeight: 600
  },

  demoNotice: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '10px',
    padding: '12px 14px',
    marginBottom: '18px',
    borderRadius: '10px',
    border:
      '1px solid rgba(245, 158, 11, 0.25)',
    backgroundColor:
      'rgba(245, 158, 11, 0.08)',
    color: '#fbbf24',
    fontSize: '12px',
    lineHeight: 1.5
  },

  errorBox: {
    display: 'flex',
    gap: '12px',
    padding: '15px',
    marginBottom: '18px',
    borderRadius: '10px',
    backgroundColor:
      'rgba(239, 68, 68, 0.08)',
    border:
      '1px solid rgba(239, 68, 68, 0.25)',
    color: '#fca5a5'
  },

  studentCard: {
    display: 'flex',
    alignItems: 'center',
    gap: '14px',
    padding: '18px',
    marginBottom: '18px',
    borderRadius: '14px',
    border: '1px solid #1e293b',
    backgroundColor: '#111827'
  },

  studentIcon: {
    width: '44px',
    height: '44px',
    borderRadius: '10px',
    backgroundColor:
      'rgba(16, 185, 129, 0.12)',
    color: '#34d399',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },

  label: {
    display: 'block',
    fontSize: '10px',
    fontWeight: 700,
    letterSpacing: '0.08em',
    color: '#64748b'
  },

  studentName: {
    margin: '3px 0 1px',
    fontSize: '16px',
    color: '#f8fafc'
  },

  studentMeta: {
    margin: 0,
    fontSize: '12px',
    color: '#94a3b8'
  },

  studentStatus: {
    marginLeft: 'auto',
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    padding: '7px 10px',
    borderRadius: '7px',
    backgroundColor:
      'rgba(16, 185, 129, 0.1)',
    color: '#34d399',
    fontSize: '11px',
    fontWeight: 600
  },

  card: {
    padding: '20px',
    borderRadius: '14px',
    border: '1px solid #1e293b',
    backgroundColor: '#111827',
    marginBottom: '18px'
  },

  cardHeader: {
    marginBottom: '12px'
  },

  cardTitle: {
    margin: 0,
    fontSize: '15px',
    color: '#f8fafc'
  },

  cardSubtitle: {
    margin: '4px 0 0',
    fontSize: '12px',
    color: '#64748b'
  },

  select: {
    width: '100%',
    padding: '12px 14px',
    borderRadius: '9px',
    border: '1px solid #334155',
    backgroundColor: '#0f172a',
    color: '#e2e8f0',
    fontSize: '13px',
    outline: 'none'
  },

  driveCard: {
    padding: '20px',
    borderRadius: '14px',
    background:
      'linear-gradient(135deg, rgba(99, 102, 241, 0.12), rgba(15, 23, 42, 0.7))',
    border:
      '1px solid rgba(99, 102, 241, 0.25)',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: '20px',
    marginBottom: '18px'
  },

  driveLabel: {
    fontSize: '10px',
    fontWeight: 700,
    color: '#818cf8',
    letterSpacing: '0.08em'
  },

  driveTitle: {
    margin: '6px 0 2px',
    fontSize: '20px',
    color: '#f8fafc'
  },

  driveRole: {
    margin: 0,
    color: '#94a3b8',
    fontSize: '13px'
  },

  driveDetails: {
    display: 'flex',
    gap: '24px'
  },

  detailLabel: {
    display: 'block',
    marginBottom: '4px',
    fontSize: '9px',
    fontWeight: 700,
    color: '#64748b',
    letterSpacing: '0.08em'
  },

  scoreCard: {
    padding: '24px',
    borderRadius: '14px',
    border: '1px solid #1e293b',
    backgroundColor: '#111827',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '24px'
  },

  scoreLabel: {
    fontSize: '10px',
    fontWeight: 700,
    color: '#64748b',
    letterSpacing: '0.08em'
  },

  scoreRow: {
    display: 'flex',
    alignItems: 'baseline',
    marginTop: '3px'
  },

  score: {
    fontSize: '52px',
    fontWeight: 800,
    lineHeight: 1
  },

  scoreOutOf: {
    fontSize: '18px',
    fontWeight: 600,
    marginLeft: '5px'
  },

  matchBadge: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
    padding: '6px 10px',
    borderRadius: '7px',
    fontSize: '12px',
    fontWeight: 700,
    marginTop: '10px'
  },

  targetIcon: {
    width: '82px',
    height: '82px',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },

  sectionTitle: {
    fontSize: '16px',
    fontWeight: 700,
    color: '#f8fafc',
    marginBottom: '12px'
  },

  grid: {
    display: 'grid',
    gridTemplateColumns:
      'repeat(5, minmax(0, 1fr))',
    gap: '12px',
    marginBottom: '18px'
  },

  factorCard: {
    padding: '16px',
    borderRadius: '12px',
    border: '1px solid #1e293b',
    backgroundColor: '#111827'
  },

  factorTop: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    marginBottom: '14px'
  },

  factorIcon: {
    width: '36px',
    height: '36px',
    borderRadius: '9px',
    backgroundColor:
      'rgba(99, 102, 241, 0.12)',
    color: '#818cf8',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0
  },

  factorTitle: {
    margin: 0,
    fontSize: '11px',
    color: '#94a3b8',
    fontWeight: 600
  },

  factorScore: {
    margin: '3px 0 0',
    fontSize: '14px',
    color: '#f8fafc',
    fontWeight: 700
  },

  progressTrack: {
    height: '5px',
    borderRadius: '5px',
    backgroundColor: '#1e293b',
    overflow: 'hidden'
  },

  progressBar: {
    height: '100%',
    borderRadius: '5px',
    backgroundColor: '#6366f1',
    transition: 'width 0.3s ease'
  },

  bottomGrid: {
    display: 'grid',
    gridTemplateColumns:
      '1fr 1fr',
    gap: '14px'
  },

  infoCard: {
    padding: '18px',
    borderRadius: '12px',
    border: '1px solid #1e293b',
    backgroundColor: '#111827'
  },

  infoHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    color: '#818cf8',
    marginBottom: '9px'
  },

  infoHeaderTitle: {
    margin: 0,
    fontSize: '14px'
  },

  infoText: {
    margin: 0,
    color: '#94a3b8',
    fontSize: '12px',
    lineHeight: 1.6
  },

  footerNotice: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    marginTop: '16px',
    padding: '11px 13px',
    borderRadius: '9px',
    backgroundColor:
      'rgba(99, 102, 241, 0.06)',
    border:
      '1px solid rgba(99, 102, 241, 0.12)',
    color: '#64748b',
    fontSize: '11px'
  },

  centerState: {
    minHeight: '300px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '12px',
    color: '#94a3b8'
  }
};