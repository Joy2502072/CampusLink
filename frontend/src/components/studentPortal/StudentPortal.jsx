import React, { useEffect, useMemo, useState } from 'react';
import {
  RefreshCw,
  User,
  TrendingUp,
  Target,
  Sparkles,
  CheckCircle2,
  ArrowRight,
  AlertCircle,
  Briefcase,
  GraduationCap,
  MessageCircle,
  Code2,
  FolderKanban,
  ChevronRight
} from 'lucide-react';

const API_BASE_URL = 'http://localhost:5000/api';

const AUTH_HEADERS = {
  'Content-Type': 'application/json',
  'X-Demo-User-Role': 'placement_officer'
};

const STUDENT_ID = 'DEMO-STU-001';

function getData(response) {
  return response?.data ?? null;
}

async function fetchApi(url) {
  const response = await fetch(url, {
    headers: AUTH_HEADERS
  });

  const json = await response.json();

  if (!response.ok || json.success === false) {
    throw new Error(
      json.message || `Request failed: ${response.status}`
    );
  }

  return json;
}

function formatNumber(value, decimals = 1) {
  if (typeof value !== 'number') return '—';
  return value.toFixed(decimals);
}

export default function StudentPortal({ onNavigate }) {
  const [student, setStudent] = useState(null);
  const [drives, setDrives] = useState([]);
  const [readiness, setReadiness] = useState(null);
  const [skillGap, setSkillGap] = useState(null);
  const [matching, setMatching] = useState(null);

  const [selectedDriveId, setSelectedDriveId] = useState('');
  const [loading, setLoading] = useState(true);
  const [analysisLoading, setAnalysisLoading] = useState(false);
  const [error, setError] = useState('');

  const selectedDrive = useMemo(
    () => drives.find((drive) => drive.id === selectedDriveId) || null,
    [drives, selectedDriveId]
  );

  const studentName =
    student?.name ||
    student?.fullName ||
    readiness?.name ||
    'Student';

  const branch =
    student?.branch ||
    student?.department ||
    readiness?.branch ||
    '—';

  const cgpa =
    typeof student?.cgpa === 'number'
      ? student.cgpa
      : typeof readiness?.cgpa === 'number'
        ? readiness.cgpa
        : null;

  const readinessScore =
    readiness?.readinessScore ??
    readiness?.totalScore ??
    null;

  const readinessBand =
    readiness?.readinessBand ||
    readiness?.readinessLevel ||
    '—';

  const riskLevel =
    readiness?.riskLevel ||
    '—';

  const dimensions = readiness?.dimensions || {};

  const communicationScore =
    readiness?.rawMetrics?.communicationScore ?? null;

  const technicalSkills =
    student?.technicalSkills ||
    student?.skills ||
    [];

  const projectsCount =
    readiness?.rawMetrics?.projectsCount ??
    student?.projectsCount ??
    0;

  const certificationsCount =
    readiness?.rawMetrics?.certificationsCount ??
    student?.certificationsCount ??
    0;

  const skillCoverage =
    skillGap?.skillCoverageScore ?? null;

  const missingSkills =
    Array.isArray(skillGap?.missingSkills)
      ? skillGap.missingSkills
      : [];

  const priorityMissingSkills =
    Array.isArray(skillGap?.priorityMissingSkills)
      ? skillGap.priorityMissingSkills
      : [];

  const primaryMissingSkill =
    priorityMissingSkills[0]?.skill ||
    missingSkills[0] ||
    null;

  const matchScore =
    matching?.overallMatchScore ?? null;

  async function loadBaseData() {
    try {
      setLoading(true);
      setError('');

      const [
        studentResponse,
        drivesResponse,
        readinessResponse
      ] = await Promise.all([
        fetchApi(`${API_BASE_URL}/students/${STUDENT_ID}`),
        fetchApi(`${API_BASE_URL}/drives`),
        fetchApi(
          `${API_BASE_URL}/students/${STUDENT_ID}/readiness`
        )
      ]);

      const studentData = getData(studentResponse);
      const drivesData = getData(drivesResponse);
      const readinessData = getData(readinessResponse);

      const driveList = Array.isArray(drivesData)
        ? drivesData
        : Array.isArray(drivesData?.drives)
          ? drivesData.drives
          : [];

      setStudent(studentData);
      setDrives(driveList);
      setReadiness(readinessData);

      setSelectedDriveId((current) => {
        if (current && driveList.some((drive) => drive.id === current)) {
          return current;
        }

        return driveList[0]?.id || '';
      });
    } catch (err) {
      console.error(err);
      setError(err.message || 'Unable to load student portal.');
    } finally {
      setLoading(false);
    }
  }

  async function loadPlacementAnalysis(driveId) {
    if (!driveId) {
      setSkillGap(null);
      setMatching(null);
      return;
    }

    try {
      setAnalysisLoading(true);
      setError('');

      const [
        skillGapResponse,
        matchingResponse
      ] = await Promise.all([
        fetchApi(
          `${API_BASE_URL}/skill-gap/student/${STUDENT_ID}/drive/${driveId}`
        ),
        fetchApi(
          `${API_BASE_URL}/matching/student/${STUDENT_ID}/drive/${driveId}`
        )
      ]);

      setSkillGap(getData(skillGapResponse));
      setMatching(getData(matchingResponse));
    } catch (err) {
      console.error(err);
      setError(
        err.message ||
        'Unable to load skill gap and job matching analysis.'
      );
      setSkillGap(null);
      setMatching(null);
    } finally {
      setAnalysisLoading(false);
    }
  }

  useEffect(() => {
    loadBaseData();
  }, []);

  useEffect(() => {
    if (selectedDriveId) {
      loadPlacementAnalysis(selectedDriveId);
    }
  }, [selectedDriveId]);

  function refreshPortal() {
    loadBaseData();
  }

  function navigate(tab) {
    if (typeof onNavigate === 'function') {
      onNavigate(tab);
    }
  }

  if (loading) {
    return (
      <div className="student-portal-loading">
        <RefreshCw size={22} className="spin" />
        Loading Student Placement Portal...
      </div>
    );
  }

  return (
    <div className="student-portal">
      <style>{`
        .student-portal {
          padding: 34px 46px 60px;
          color: #f8fafc;
          min-height: 100%;
        }

        .student-portal-loading {
          min-height: 500px;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          color: #94a3b8;
        }

        .spin {
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }

        .portal-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          gap: 20px;
          margin-bottom: 24px;
        }

        .title-row {
          display: flex;
          align-items: center;
          gap: 9px;
        }

        .portal-title {
          margin: 0;
          font-size: 24px;
          font-weight: 800;
          letter-spacing: -0.5px;
        }

        .career-badge {
          color: #a5b4fc;
          background: rgba(99,102,241,.12);
          border: 1px solid rgba(99,102,241,.4);
          border-radius: 999px;
          padding: 5px 9px;
          font-size: 9px;
          font-weight: 700;
        }

        .portal-subtitle {
          margin: 8px 0 0;
          color: #8ea2c5;
          font-size: 12px;
        }

        .refresh-button {
          display: flex;
          align-items: center;
          gap: 7px;
          padding: 9px 13px;
          border-radius: 7px;
          border: 1px solid #334155;
          background: #182337;
          color: #e2e8f0;
          cursor: pointer;
          font-size: 11px;
          font-weight: 700;
        }

        .refresh-button:hover {
          background: #22304a;
        }

        .error-box {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-bottom: 18px;
          padding: 11px 13px;
          border-radius: 8px;
          border: 1px solid rgba(239,68,68,.35);
          background: rgba(127,29,29,.15);
          color: #fca5a5;
          font-size: 11px;
        }

        .journey-card,
        .portal-card {
          border: 1px solid #273653;
          background: rgba(15,25,45,.82);
          border-radius: 12px;
        }

        .journey-card {
          padding: 20px;
          margin-bottom: 20px;
        }

        .section-label {
          font-size: 10px;
          font-weight: 800;
          text-transform: uppercase;
          margin-bottom: 13px;
        }

        .journey-grid {
          display: grid;
          grid-template-columns: repeat(5, 1fr);
          gap: 10px;
        }

        .journey-step {
          min-height: 75px;
          padding: 11px;
          border-radius: 7px;
          border: 1px solid #334155;
          background: #111c31;
        }

        .journey-step.complete {
          border-color: rgba(20,184,166,.45);
          background: rgba(13,148,136,.1);
        }

        .journey-step.active {
          border-color: rgba(99,102,241,.55);
          background: rgba(79,70,229,.1);
        }

        .journey-title {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 10px;
          font-weight: 750;
          color: #dbeafe;
        }

        .complete .journey-title {
          color: #5eead4;
        }

        .active .journey-title {
          color: #a5b4fc;
        }

        .journey-detail {
          margin: 6px 0 0 19px;
          color: #7186aa;
          font-size: 9px;
          line-height: 1.45;
        }

        .next-action {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 18px;
          padding: 19px;
          margin-bottom: 20px;
          border-radius: 10px;
          border: 1px solid rgba(99,102,241,.55);
          background: linear-gradient(
            105deg,
            rgba(30,41,87,.95),
            rgba(17,24,50,.95)
          );
        }

        .action-left {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .action-icon {
          width: 40px;
          height: 40px;
          display: grid;
          place-items: center;
          border-radius: 9px;
          background: rgba(99,102,241,.18);
          color: #a5b4fc;
        }

        .action-label {
          display: flex;
          align-items: center;
          gap: 7px;
          color: #a5b4fc;
          font-size: 9px;
          font-weight: 800;
          text-transform: uppercase;
        }

        .priority {
          padding: 3px 7px;
          border-radius: 999px;
          color: #fda4af;
          background: rgba(225,29,72,.18);
          font-size: 7px;
        }

        .action-title {
          margin-top: 4px;
          font-size: 16px;
          font-weight: 800;
        }

        .action-description {
          margin-top: 4px;
          color: #9aaed0;
          font-size: 10px;
        }

        .primary-button {
          display: flex;
          align-items: center;
          gap: 6px;
          border: 0;
          border-radius: 7px;
          padding: 10px 14px;
          background: #6366f1;
          color: white;
          font-size: 10px;
          font-weight: 750;
          cursor: pointer;
          white-space: nowrap;
        }

        .primary-button:hover {
          background: #5558e8;
        }

        .portal-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 20px;
          margin-bottom: 20px;
        }

        .portal-card {
          padding: 20px;
          min-width: 0;
        }

        .card-heading {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 10px;
          margin-bottom: 16px;
        }

        .card-heading-left {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .card-heading-left svg {
          color: #818cf8;
        }

        .card-title {
          margin: 0;
          font-size: 12px;
          font-weight: 750;
        }

        .status {
          border-radius: 999px;
          padding: 4px 8px;
          font-size: 8px;
          font-weight: 750;
        }

        .status.success {
          color: #34d399;
          background: rgba(16,185,129,.13);
        }

        .status.warning {
          color: #fbbf24;
          background: rgba(245,158,11,.13);
        }

        .profile-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 9px;
        }

        .profile-field {
          padding: 11px;
          border-radius: 7px;
          border: 1px solid #334155;
          background: #172337;
        }

        .field-label {
          color: #7890b5;
          font-size: 8px;
          text-transform: uppercase;
        }

        .field-value {
          margin-top: 4px;
          font-size: 12px;
          font-weight: 750;
        }

        .blue {
          color: #818cf8;
        }

        .green {
          color: #34d399;
        }

        .skills-title {
          margin: 14px 0 7px;
          color: #9fb2d2;
          font-size: 9px;
        }

        .skills {
          display: flex;
          flex-wrap: wrap;
          gap: 5px;
        }

        .skill-tag {
          padding: 5px 7px;
          border-radius: 5px;
          border: 1px solid #334155;
          background: #172337;
          color: #cbd5e1;
          font-size: 8px;
        }

        .profile-footer {
          display: flex;
          gap: 15px;
          border-top: 1px solid #26344e;
          margin-top: 13px;
          padding-top: 11px;
          color: #94a3b8;
          font-size: 9px;
        }

        .readiness-top {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 17px;
        }

        .readiness-score {
          font-size: 30px;
          font-weight: 850;
        }

        .readiness-score span {
          color: #7186aa;
          font-size: 12px;
          font-weight: 500;
        }

        .band {
          text-align: right;
        }

        .band-label {
          color: #7186aa;
          font-size: 8px;
          text-transform: uppercase;
        }

        .band-value {
          margin-top: 4px;
          color: #34d399;
          font-size: 12px;
          font-weight: 800;
        }

        .dimension-list {
          display: grid;
          gap: 11px;
        }

        .dimension {
          display: grid;
          grid-template-columns: 140px 1fr 55px;
          align-items: center;
          gap: 9px;
        }

        .dimension-name {
          display: flex;
          align-items: center;
          gap: 6px;
          color: #b7c5dc;
          font-size: 9px;
        }

        .dimension-name svg {
          color: #818cf8;
        }

        .bar {
          height: 6px;
          background: #26344e;
          border-radius: 999px;
          overflow: hidden;
        }

        .bar-fill {
          height: 100%;
          border-radius: inherit;
          background: linear-gradient(90deg,#6366f1,#22c55e);
        }

        .dimension-value {
          color: #dbeafe;
          text-align: right;
          font-size: 8px;
        }

        .reason {
          margin-top: 13px;
          color: #7186aa;
          font-size: 8px;
          line-height: 1.5;
        }

        .full-button {
          width: 100%;
          margin-top: 13px;
          padding: 8px;
          border-radius: 6px;
          border: 1px solid rgba(20,184,166,.45);
          background: rgba(13,148,136,.1);
          color: #5eead4;
          font-size: 9px;
          font-weight: 750;
          cursor: pointer;
        }

        .full-button:hover {
          background: rgba(13,148,136,.18);
        }

        .drive-select {
          max-width: 170px;
          padding: 6px 8px;
          border-radius: 6px;
          border: 1px solid #334155;
          background: #111c31;
          color: #dbeafe;
          font-size: 8px;
        }

        .coverage-header {
          display: flex;
          justify-content: space-between;
          margin-bottom: 8px;
        }

        .coverage-label {
          color: #cbd5e1;
          font-size: 9px;
        }

        .coverage-value {
          color: #fbbf24;
          font-size: 14px;
          font-weight: 850;
        }

        .coverage-track {
          height: 6px;
          border-radius: 999px;
          background: #26344e;
          overflow: hidden;
        }

        .coverage-fill {
          height: 100%;
          background: #f59e0b;
          border-radius: inherit;
        }

        .gap-info {
          margin-top: 13px;
          color: #fb7185;
          font-size: 9px;
          display: flex;
          align-items: center;
          gap: 5px;
        }

        .missing-list {
          margin-top: 9px;
          display: flex;
          flex-wrap: wrap;
          gap: 5px;
        }

        .missing-tag {
          padding: 4px 6px;
          border-radius: 4px;
          background: rgba(244,63,94,.1);
          border: 1px solid rgba(244,63,94,.25);
          color: #fda4af;
          font-size: 8px;
        }

        .match-top {
          display: flex;
          justify-content: space-between;
          gap: 15px;
        }

        .company {
          font-size: 14px;
          font-weight: 800;
        }

        .role {
          margin-top: 3px;
          color: #8ea2c5;
          font-size: 9px;
        }

        .match-score {
          color: #818cf8;
          font-size: 21px;
          font-weight: 850;
        }

        .match-level {
          margin-top: 2px;
          color: #7186aa;
          text-align: right;
          font-size: 7px;
        }

        .match-recommendation {
          margin-top: 13px;
          padding: 9px;
          border-radius: 6px;
          background: #111c31;
          color: #94a3b8;
          font-size: 9px;
          line-height: 1.5;
        }

        .match-strength {
          margin-top: 9px;
          color: #5eead4;
          font-size: 8px;
        }

        .empty-analysis {
          min-height: 130px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #7186aa;
          font-size: 9px;
          text-align: center;
        }

        @media (max-width: 1050px) {
          .student-portal {
            padding: 24px;
          }

          .journey-grid {
            grid-template-columns: repeat(2,1fr);
          }

          .portal-grid {
            grid-template-columns: 1fr;
          }
        }

        @media (max-width: 700px) {
          .student-portal {
            padding: 18px;
          }

          .portal-header,
          .next-action {
            flex-direction: column;
            align-items: stretch;
          }

          .journey-grid,
          .profile-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>

      <div className="portal-header">
        <div>
          <div className="title-row">
            <h1 className="portal-title">
              Student Placement Portal
            </h1>

            <span className="career-badge">
              Career Progress
            </span>
          </div>

          <p className="portal-subtitle">
            Your personalized placement readiness and career progress
          </p>
        </div>

        <button
          className="refresh-button"
          onClick={refreshPortal}
          type="button"
        >
          <RefreshCw size={13} />
          Refresh Portal
        </button>
      </div>

      {error && (
        <div className="error-box">
          <AlertCircle size={14} />
          {error}
        </div>
      )}

      {/* JOURNEY */}
      <section className="journey-card">
        <div className="section-label">
          Placement Journey
        </div>

        <div className="journey-grid">
          <div className="journey-step complete">
            <div className="journey-title">
              <CheckCircle2 size={12} />
              1. Profile Active
            </div>

            <div className="journey-detail">
              {studentName} ({branch})
            </div>
          </div>

          <div className="journey-step active">
            <div className="journey-title">
              <TrendingUp size={12} />
              2. Readiness Assessed
            </div>

            <div className="journey-detail">
              {readinessScore !== null
                ? `${formatNumber(readinessScore)}/100 • ${readinessBand}`
                : 'Pending evaluation'}
            </div>
          </div>

          <div className="journey-step complete">
            <div className="journey-title">
              <CheckCircle2 size={12} />
              3. Skill Gap Identified
            </div>

            <div className="journey-detail">
              {skillCoverage !== null
                ? `${formatNumber(skillCoverage, 0)}% Coverage • ${missingSkills.length} missing`
                : 'Analysis pending'}
            </div>
          </div>

          <div className="journey-step complete">
            <div className="journey-title">
              <CheckCircle2 size={12} />
              4. Job Match Analysed
            </div>

            <div className="journey-detail">
              {matchScore !== null
                ? `${formatNumber(matchScore)}% Match (${selectedDrive?.company || 'Drive'})`
                : 'Analysis pending'}
            </div>
          </div>

          <div className="journey-step active">
            <div className="journey-title">
              <Sparkles size={12} />
              5. Recommended Action
            </div>

            <div className="journey-detail">
              {primaryMissingSkill
                ? `Focus on ${primaryMissingSkill}`
                : 'Review placement recommendations'}
            </div>
          </div>
        </div>
      </section>

      {/* NEXT ACTION */}
      <section className="next-action">
        <div className="action-left">
          <div className="action-icon">
            <Sparkles size={19} />
          </div>

          <div>
            <div className="action-label">
              What Should I Do Next?

              {primaryMissingSkill && (
                <span className="priority">
                  HIGH PRIORITY
                </span>
              )}
            </div>

            <div className="action-title">
              {primaryMissingSkill
                ? `Address Missing Skill: "${primaryMissingSkill}"`
                : 'Review Placement Readiness'}
            </div>

            <div className="action-description">
              {primaryMissingSkill && skillCoverage !== null
                ? `Your verified skill coverage is ${formatNumber(
                    skillCoverage,
                    0
                  )}%. Focus on ${primaryMissingSkill} for ${
                    selectedDrive?.company || 'the selected drive'
                  }.`
                : `Your current readiness score is ${
                    readinessScore !== null
                      ? `${formatNumber(readinessScore)}/100`
                      : 'not available'
                  }.`}
            </div>
          </div>
        </div>

        <button
          className="primary-button"
          onClick={() => navigate('skill-gap')}
          type="button"
        >
          View Full Skill Gap
          <ArrowRight size={13} />
        </button>
      </section>

      {/* PROFILE + READINESS */}
      <div className="portal-grid">
        <section className="portal-card">
          <div className="card-heading">
            <div className="card-heading-left">
              <User size={14} />
              <h2 className="card-title">
                Profile Snapshot
              </h2>
            </div>

            <span className="status warning">
              {student?.status || 'Unplaced'}
            </span>
          </div>

          <div className="profile-grid">
            <div className="profile-field">
              <div className="field-label">Full Name</div>
              <div className="field-value">
                {studentName}
              </div>
            </div>

            <div className="profile-field">
              <div className="field-label">Department</div>
              <div className="field-value blue">
                {branch}
              </div>
            </div>

            <div className="profile-field">
              <div className="field-label">Academic CGPA</div>
              <div className="field-value">
                {cgpa !== null
                  ? `${cgpa.toFixed(2)} / 10.0`
                  : '—'}
              </div>
            </div>

            <div className="profile-field">
              <div className="field-label">Communication</div>
              <div className="field-value green">
                {communicationScore !== null
                  ? `${communicationScore} / 100`
                  : '—'}
              </div>
            </div>
          </div>

          <div className="skills-title">
            Technical Skills Inventory ({technicalSkills.length})
          </div>

          <div className="skills">
            {technicalSkills.length > 0 ? (
              technicalSkills.map((skill, index) => {
                const name =
                  typeof skill === 'string'
                    ? skill
                    : skill?.name ||
                      skill?.skill ||
                      skill?.skillName ||
                      `Skill ${index + 1}`;

                return (
                  <span
                    className="skill-tag"
                    key={`${name}-${index}`}
                  >
                    {name}
                  </span>
                );
              })
            ) : (
              <span className="skill-tag">
                No skills recorded
              </span>
            )}
          </div>

          <div className="profile-footer">
            <span>
              {projectsCount} Practical Projects
            </span>

            <span>
              {certificationsCount} Certifications
            </span>
          </div>
        </section>

        <section className="portal-card">
          <div className="card-heading">
            <div className="card-heading-left">
              <TrendingUp size={14} />
              <h2 className="card-title">
                Readiness Snapshot
              </h2>
            </div>

            <span className="status success">
              {riskLevel}
            </span>
          </div>

          {readinessScore !== null ? (
            <>
              <div className="readiness-top">
                <div className="readiness-score">
                  {formatNumber(readinessScore)}
                  <span> /100</span>
                </div>

                <div className="band">
                  <div className="band-label">
                    Readiness Band
                  </div>

                  <div className="band-value">
                    {readinessBand}
                  </div>
                </div>
              </div>

              <div className="dimension-list">
                <Dimension
                  icon={GraduationCap}
                  label="Academics"
                  value={dimensions.academics}
                  max={25}
                />

                <Dimension
                  icon={Code2}
                  label="Technical Skills"
                  value={dimensions.technicalSkills}
                  max={30}
                />

                <Dimension
                  icon={MessageCircle}
                  label="Communication"
                  value={dimensions.communication}
                  max={25}
                />

                <Dimension
                  icon={FolderKanban}
                  label="Practical Experience"
                  value={dimensions.practicalExperience}
                  max={20}
                />
              </div>

              <div className="reason">
                {readiness?.riskProfile?.mainReason ||
                  'Readiness calculated from current student profile data.'}
              </div>
            </>
          ) : (
            <div className="empty-analysis">
              Readiness data not available.
            </div>
          )}

          <button
            className="full-button"
            onClick={() => navigate('readiness')}
            type="button"
          >
            View Full Readiness
            <ChevronRight
              size={12}
              style={{ verticalAlign: 'middle' }}
            />
          </button>
        </section>
      </div>

      {/* SKILL GAP + MATCHING */}
      <div className="portal-grid">
        <section className="portal-card">
          <div className="card-heading">
            <div className="card-heading-left">
              <Target size={14} />
              <h2 className="card-title">
                Skill Gap Snapshot
              </h2>
            </div>

            <select
              className="drive-select"
              value={selectedDriveId}
              onChange={(event) =>
                setSelectedDriveId(event.target.value)
              }
            >
              {drives.map((drive) => (
                <option
                  key={drive.id}
                  value={drive.id}
                >
                  {drive.company}
                </option>
              ))}
            </select>
          </div>

          {analysisLoading ? (
            <div className="empty-analysis">
              <RefreshCw size={14} className="spin" />
              Loading skill analysis...
            </div>
          ) : skillGap ? (
            <>
              <div className="coverage-header">
                <span className="coverage-label">
                  Skill Coverage Ratio
                </span>

                <span className="coverage-value">
                  {formatNumber(skillCoverage, 0)}%
                </span>
              </div>

              <div className="coverage-track">
                <div
                  className="coverage-fill"
                  style={{
                    width: `${Math.min(
                      100,
                      Math.max(0, skillCoverage || 0)
                    )}%`
                  }}
                />
              </div>

              {primaryMissingSkill && (
                <div className="gap-info">
                  <AlertCircle size={11} />
                  Priority Missing Skill:
                  <strong>{primaryMissingSkill}</strong>
                </div>
              )}

              <div className="missing-list">
                {missingSkills.map((skill) => (
                  <span
                    className="missing-tag"
                    key={skill}
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </>
          ) : (
            <div className="empty-analysis">
              Select a drive to view skill-gap analysis.
            </div>
          )}

          <button
            className="full-button"
            onClick={() => navigate('skill-gap')}
            type="button"
          >
            View Full Skill Gap
            <ChevronRight
              size={12}
              style={{ verticalAlign: 'middle' }}
            />
          </button>
        </section>

        <section className="portal-card">
          <div className="card-heading">
            <div className="card-heading-left">
              <Briefcase size={14} />
              <h2 className="card-title">
                Job Match Snapshot
              </h2>
            </div>

            {matching?.breakdown?.branchEligibility?.matched && (
              <span className="status success">
                Branch Eligible
              </span>
            )}
          </div>

          {analysisLoading ? (
            <div className="empty-analysis">
              <RefreshCw size={14} className="spin" />
              Calculating job match...
            </div>
          ) : matching && selectedDrive ? (
            <>
              <div className="match-top">
                <div>
                  <div className="company">
                    {matching.company ||
                      selectedDrive.company}
                  </div>

                  <div className="role">
                    {matching.role ||
                      selectedDrive.role}
                  </div>
                </div>

                <div>
                  <div className="match-score">
                    {formatNumber(matchScore)}%
                  </div>

                  <div className="match-level">
                    {matching.matchLevel ||
                      'Match Index'}
                  </div>
                </div>
              </div>

              <div className="match-recommendation">
                {matching.recommendation ||
                  'Review the detailed matching analysis for this opportunity.'}
              </div>

              {Array.isArray(matching.strengths) &&
                matching.strengths.length > 0 && (
                  <div className="match-strength">
                    ✓ {matching.strengths[0]}
                  </div>
                )}
            </>
          ) : (
            <div className="empty-analysis">
              Select a drive to view job-match analysis.
            </div>
          )}

          <button
            className="full-button"
            onClick={() => navigate('matching')}
            type="button"
          >
            View Full Job Matching
            <ChevronRight
              size={12}
              style={{ verticalAlign: 'middle' }}
            />
          </button>
        </section>
      </div>
    </div>
  );
}

function Dimension({
  icon: Icon,
  label,
  value,
  max
}) {
  if (typeof value !== 'number') {
    return null;
  }

  const percentage = Math.min(
    100,
    Math.max(0, (value / max) * 100)
  );

  return (
    <div className="dimension">
      <div className="dimension-name">
        <Icon size={11} />
        {label}
      </div>

      <div className="bar">
        <div
          className="bar-fill"
          style={{
            width: `${percentage}%`
          }}
        />
      </div>

      <div className="dimension-value">
        {value.toFixed(1)} / {max}
      </div>
    </div>
  );
}