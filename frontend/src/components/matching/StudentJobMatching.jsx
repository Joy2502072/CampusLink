import React, { useState, useEffect, useCallback } from 'react';
import {
  Briefcase,
  Building2,
  CheckCircle2,
  XCircle,
  AlertCircle,
  RefreshCw,
  Award,
  ChevronRight,
  Sparkles,
  Info,
  ShieldCheck,
  TrendingUp,
  MessageSquare
} from 'lucide-react';

const API_BASE_URL = 'http://localhost:5000/api';
const DEFAULT_STUDENT_ID = 'DEMO-STU-001';

const AUTH_HEADERS = {
  'Content-Type': 'application/json',
  'X-Demo-User-Role': 'placement_officer'
};

export default function StudentJobMatching() {
  const [studentId, setStudentId] = useState(DEFAULT_STUDENT_ID);
  const [drives, setDrives] = useState([]);
  const [selectedDriveId, setSelectedDriveId] = useState('');
  const [matchingData, setMatchingData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  // 1. Fetch drives list on mount
  useEffect(() => {
    async function loadDrives() {
      try {
        const res = await fetch(`${API_BASE_URL}/drives`, { headers: AUTH_HEADERS });
        if (!res.ok) {
          throw new Error(`Failed to load drives (HTTP ${res.status})`);
        }
        const json = await res.json();
        const driveList = Array.isArray(json.data) ? json.data : (Array.isArray(json) ? json : []);
        setDrives(driveList);
        if (driveList.length > 0 && !selectedDriveId) {
          setSelectedDriveId(driveList[0].id);
        }
      } catch (err) {
        setError(err.message || 'Error occurred while loading placement drives.');
      }
    }
    loadDrives();
  }, [selectedDriveId]);

  // 2. Fetch match evaluation for selected student & drive
  const fetchMatchEvaluation = useCallback(async () => {
    if (!studentId || !selectedDriveId) return;

    setError(null);
    try {
      const res = await fetch(
        `${API_BASE_URL}/matching/student/${studentId}/drive/${selectedDriveId}`,
        { headers: AUTH_HEADERS }
      );

      if (!res.ok) {
        throw new Error(`Failed to load matching evaluation (HTTP ${res.status})`);
      }

      const json = await res.json();
      setMatchingData(json.data || json);
    } catch (err) {
      setError(err.message || 'Error occurred while evaluating candidate job matching.');
      setMatchingData(null);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [studentId, selectedDriveId]);

  useEffect(() => {
    if (selectedDriveId) {
      setLoading(true);
      fetchMatchEvaluation();
    }
  }, [fetchMatchEvaluation, selectedDriveId]);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchMatchEvaluation();
  };

  const breakdown = matchingData?.breakdown || {};
  const branchInfo = breakdown.branchEligibility || {};
  const techInfo = breakdown.technicalSkillMatch || {};
  const academicInfo = breakdown.academicReadiness || {};
  const commInfo = breakdown.communication || {};

  const overallScore = matchingData?.overallMatchScore ?? 0;
  const matchLevel = matchingData?.matchLevel || 'Evaluating';

  const getScoreColor = (score) => {
    if (score >= 80) return '#10b981';
    if (score >= 60) return '#3b82f6';
    if (score >= 40) return '#f59e0b';
    return '#ef4444';
  };

  return (
    <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <h1 style={{ margin: 0, fontSize: '1.65rem', fontWeight: 800, color: 'var(--text-primary, #ffffff)', letterSpacing: '-0.02em' }}>
              Student–Job Match Analysis
            </h1>
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '5px',
                padding: '3px 10px',
                borderRadius: '999px',
                fontSize: '11px',
                fontWeight: 600,
                backgroundColor: 'rgba(99, 102, 241, 0.12)',
                color: '#818cf8',
                border: '1px solid rgba(99, 102, 241, 0.25)'
              }}
            >
              <Briefcase size={12} />
              Recruitment Alignment
            </span>
          </div>
          <p style={{ margin: '6px 0 0 0', fontSize: '0.875rem', color: 'var(--text-secondary, #94a3b8)' }}>
            Explainable compatibility evaluation matching student profile parameters against live placement drives
          </p>
        </div>

        <button
          onClick={handleRefresh}
          disabled={loading || refreshing}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            padding: '8px 16px',
            backgroundColor: 'var(--bg-card, #1e293b)',
            border: '1px solid var(--border-color, #334155)',
            borderRadius: '8px',
            color: 'var(--text-primary, #f1f5f9)',
            fontSize: '0.875rem',
            fontWeight: 600,
            cursor: loading || refreshing ? 'not-allowed' : 'pointer',
            opacity: loading || refreshing ? 0.6 : 1,
            transition: 'background-color 0.2s ease'
          }}
        >
          <RefreshCw size={15} style={{ animation: refreshing ? 'spin 1s linear infinite' : 'none' }} />
          {refreshing ? 'Evaluating...' : 'Refresh Match'}
        </button>
      </div>

      {error && (
        <div
          style={{
            padding: '12px 16px',
            borderRadius: '8px',
            backgroundColor: 'rgba(239, 68, 68, 0.12)',
            border: '1px solid rgba(239, 68, 68, 0.3)',
            color: '#f87171',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            fontSize: '0.875rem'
          }}
        >
          <AlertCircle size={18} />
          <span>{error}</span>
        </div>
      )}

      {/* Selector Toolbar */}
      <div
        style={{
          backgroundColor: 'var(--bg-card, #0f172a)',
          border: '1px solid var(--border-color, #1e293b)',
          borderRadius: '12px',
          padding: '16px 20px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '16px'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.6875rem', color: '#94a3b8', textTransform: 'uppercase', marginBottom: '4px', fontWeight: 600 }}>
              Candidate ID
            </label>
            <input
              type="text"
              value={studentId}
              onChange={(e) => setStudentId(e.target.value.trim())}
              placeholder="e.g. DEMO-STU-001"
              style={{
                backgroundColor: '#1e293b',
                color: '#f8fafc',
                border: '1px solid #334155',
                borderRadius: '6px',
                padding: '6px 10px',
                fontSize: '0.8125rem',
                fontFamily: 'monospace',
                outline: 'none',
                width: '140px'
              }}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.6875rem', color: '#94a3b8', textTransform: 'uppercase', marginBottom: '4px', fontWeight: 600 }}>
              Target Recruitment Drive
            </label>
            <select
              value={selectedDriveId}
              onChange={(e) => setSelectedDriveId(e.target.value)}
              style={{
                backgroundColor: '#1e293b',
                color: '#f8fafc',
                border: '1px solid #334155',
                borderRadius: '6px',
                padding: '6px 12px',
                fontSize: '0.8125rem',
                outline: 'none',
                minWidth: '260px'
              }}
            >
              {drives.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.company} — {d.role} ({d.id})
                </option>
              ))}
            </select>
          </div>
        </div>

        {matchingData && (
          <div style={{ fontSize: '0.8125rem', color: '#cbd5e1' }}>
            Authoritative Candidate: <strong style={{ color: '#ffffff' }}>{matchingData.studentName}</strong>
          </div>
        )}
      </div>

      {loading ? (
        <div style={{ padding: '48px', textAlign: 'center', color: '#64748b' }}>
          <RefreshCw size={24} style={{ animation: 'spin 1s linear infinite', margin: '0 auto 12px' }} />
          <p style={{ margin: 0, fontSize: '0.875rem' }}>Evaluating candidate profile against recruiter parameters...</p>
        </div>
      ) : matchingData ? (
        <>
          {/* Main Hero Card */}
          <div
            style={{
              backgroundColor: 'var(--bg-card, #0f172a)',
              border: '1px solid var(--border-color, #1e293b)',
              borderRadius: '14px',
              padding: '24px',
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
              gap: '24px',
              alignItems: 'center'
            }}
          >
            <div>
              <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                Overall Match Compatibility
              </span>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '10px', marginTop: '6px' }}>
                <span style={{ fontSize: '3rem', fontWeight: 800, color: getScoreColor(overallScore), fontFamily: 'monospace' }}>
                  {overallScore}%
                </span>
                <span style={{ fontSize: '0.875rem', color: '#64748b' }}>Match Index</span>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '10px' }}>
                <span
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    padding: '3px 10px',
                    borderRadius: '999px',
                    fontSize: '11px',
                    fontWeight: 700,
                    backgroundColor: `${getScoreColor(overallScore)}22`,
                    color: getScoreColor(overallScore),
                    border: `1px solid ${getScoreColor(overallScore)}44`
                  }}
                >
                  {matchLevel}
                </span>
                <span style={{ fontSize: '0.8125rem', color: '#94a3b8' }}>
                  Drive: <strong style={{ color: '#cbd5e1' }}>{matchingData.company}</strong> ({matchingData.role})
                </span>
              </div>
            </div>

            {/* Recommendation Prompt */}
            <div
              style={{
                backgroundColor: 'rgba(30, 41, 59, 0.5)',
                border: '1px solid #334155',
                borderRadius: '10px',
                padding: '16px',
                display: 'flex',
                flexDirection: 'column',
                gap: '8px'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', color: '#818cf8' }}>
                <Sparkles size={14} /> Deterministic Recommendation
              </div>
              <p style={{ margin: 0, fontSize: '0.8125rem', color: '#cbd5e1', lineHeight: 1.5 }}>
                {matchingData.recommendation}
              </p>
            </div>
          </div>

          {/* 4 Supported Scoring Dimensions */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
              gap: '16px'
            }}
          >
            {/* 1. Branch Eligibility (25 pts) */}
            <div
              style={{
                backgroundColor: 'var(--bg-card, #0f172a)',
                border: '1px solid var(--border-color, #1e293b)',
                borderRadius: '10px',
                padding: '18px',
                display: 'flex',
                flexDirection: 'column',
                gap: '10px'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.8125rem', fontWeight: 700, color: '#f8fafc' }}>
                  Branch Eligibility
                </span>
                <span style={{ fontSize: '0.8125rem', fontWeight: 700, fontFamily: 'monospace', color: branchInfo.matched ? '#10b981' : '#ef4444' }}>
                  {branchInfo.score} / {branchInfo.maxScore} pts
                </span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.75rem', color: branchInfo.matched ? '#34d399' : '#f87171' }}>
                {branchInfo.matched ? <CheckCircle2 size={14} /> : <XCircle size={14} />}
                <span>{branchInfo.matched ? 'Criteria Fulfilled' : 'Disqualified by Branch'}</span>
              </div>
              <p style={{ margin: 0, fontSize: '0.75rem', color: '#94a3b8', lineHeight: 1.4 }}>
                {branchInfo.reason}
              </p>
            </div>

            {/* 2. Technical Skill Match (35 pts) */}
            <div
              style={{
                backgroundColor: 'var(--bg-card, #0f172a)',
                border: '1px solid var(--border-color, #1e293b)',
                borderRadius: '10px',
                padding: '18px',
                display: 'flex',
                flexDirection: 'column',
                gap: '10px'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.8125rem', fontWeight: 700, color: '#f8fafc' }}>
                  Technical Skills
                </span>
                <span style={{ fontSize: '0.8125rem', fontWeight: 700, fontFamily: 'monospace', color: techInfo.status === 'AVAILABLE' ? '#818cf8' : '#f59e0b' }}>
                  {techInfo.status === 'AVAILABLE' ? `${techInfo.score} / ${techInfo.maxScore} pts` : 'Requirements Pending'}
                </span>
              </div>

              {techInfo.status === 'AVAILABLE' ? (
                <>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.75rem', color: '#cbd5e1' }}>
                    <Award size={14} color="#818cf8" />
                    <span>Matched: {techInfo.matchedSkills?.length || 0} | Missing: {techInfo.missingSkills?.length || 0}</span>
                  </div>
                  <p style={{ margin: 0, fontSize: '0.75rem', color: '#94a3b8', lineHeight: 1.4 }}>
                    {techInfo.reason}
                  </p>
                </>
              ) : (
                <>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.75rem', color: '#fbbf24' }}>
                    <Info size={14} />
                    <span>Requirements Unavailable</span>
                  </div>
                  <p style={{ margin: 0, fontSize: '0.75rem', color: '#94a3b8', lineHeight: 1.4 }}>
                    Drive record does not currently list technical prerequisites. Technical compatibility will activate once populated.
                  </p>
                </>
              )}
            </div>

            {/* 3. Placement Readiness (25 pts) */}
            <div
              style={{
                backgroundColor: 'var(--bg-card, #0f172a)',
                border: '1px solid var(--border-color, #1e293b)',
                borderRadius: '10px',
                padding: '18px',
                display: 'flex',
                flexDirection: 'column',
                gap: '10px'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.8125rem', fontWeight: 700, color: '#f8fafc' }}>
                  Placement Readiness
                </span>
                <span style={{ fontSize: '0.8125rem', fontWeight: 700, fontFamily: 'monospace', color: '#10b981' }}>
                  {academicInfo.score} / {academicInfo.maxScore} pts
                </span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.75rem', color: '#cbd5e1' }}>
                <TrendingUp size={14} color="#10b981" />
                <span>Readiness Score: {academicInfo.readinessScore || 0}/100</span>
              </div>
              <p style={{ margin: 0, fontSize: '0.75rem', color: '#94a3b8', lineHeight: 1.4 }}>
                {academicInfo.reason}
              </p>
            </div>

            {/* 4. Communication Benchmark (15 pts) */}
            <div
              style={{
                backgroundColor: 'var(--bg-card, #0f172a)',
                border: '1px solid var(--border-color, #1e293b)',
                borderRadius: '10px',
                padding: '18px',
                display: 'flex',
                flexDirection: 'column',
                gap: '10px'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.8125rem', fontWeight: 700, color: '#f8fafc' }}>
                  Communication
                </span>
                <span style={{ fontSize: '0.8125rem', fontWeight: 700, fontFamily: 'monospace', color: '#60a5fa' }}>
                  {commInfo.score} / {commInfo.maxScore} pts
                </span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.75rem', color: '#cbd5e1' }}>
                <MessageSquare size={14} color="#60a5fa" />
                <span>Communication Score: {commInfo.rawScore || 0}/100</span>
              </div>
              <p style={{ margin: 0, fontSize: '0.75rem', color: '#94a3b8', lineHeight: 1.4 }}>
                {commInfo.reason}
              </p>
            </div>
          </div>

          {/* Strengths & Improvement Observations */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))',
              gap: '20px'
            }}
          >
            {/* Strengths */}
            <div
              style={{
                backgroundColor: 'var(--bg-card, #0f172a)',
                border: '1px solid var(--border-color, #1e293b)',
                borderRadius: '12px',
                padding: '20px',
                display: 'flex',
                flexDirection: 'column',
                gap: '12px'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.875rem', fontWeight: 700, color: '#34d399' }}>
                <CheckCircle2 size={16} /> Observed Alignment Strengths
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {matchingData.strengths?.map((str, i) => (
                  <div
                    key={i}
                    style={{
                      padding: '8px 12px',
                      backgroundColor: 'rgba(16, 185, 129, 0.08)',
                      borderRadius: '6px',
                      border: '1px solid rgba(16, 185, 129, 0.2)',
                      fontSize: '0.8125rem',
                      color: '#cbd5e1'
                    }}
                  >
                    • {str}
                  </div>
                ))}
              </div>
            </div>

            {/* Improvement Areas */}
            <div
              style={{
                backgroundColor: 'var(--bg-card, #0f172a)',
                border: '1px solid var(--border-color, #1e293b)',
                borderRadius: '12px',
                padding: '20px',
                display: 'flex',
                flexDirection: 'column',
                gap: '12px'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.875rem', fontWeight: 700, color: '#fbbf24' }}>
                <AlertCircle size={16} /> Improvement & Preparation Areas
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {matchingData.improvementAreas?.map((area, i) => (
                  <div
                    key={i}
                    style={{
                      padding: '8px 12px',
                      backgroundColor: 'rgba(245, 158, 11, 0.08)',
                      borderRadius: '6px',
                      border: '1px solid rgba(245, 158, 11, 0.2)',
                      fontSize: '0.8125rem',
                      color: '#cbd5e1'
                    }}
                  >
                    • {area}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Operational Methodology Note & Disclaimer */}
          <div
            style={{
              padding: '14px 18px',
              backgroundColor: 'rgba(30, 41, 59, 0.4)',
              borderRadius: '8px',
              border: '1px solid rgba(51, 65, 85, 0.4)',
              display: 'flex',
              alignItems: 'flex-start',
              gap: '10px',
              fontSize: '0.75rem',
              color: '#94a3b8'
            }}
          >
            <ShieldCheck size={16} color="#818cf8" style={{ marginTop: '2px', flexShrink: 0 }} />
            <div>
              <strong style={{ color: '#cbd5e1' }}>Explainable Match Model:</strong> Explainable prototype match analysis using live student and placement data. When recruitment technical prerequisites are unavailable, baseline evaluation scores reflect branch eligibility, institutional readiness, and communication competence. This deterministic model supports placement counseling and does not predict or guarantee company hiring outcomes.
            </div>
          </div>
        </>
      ) : null}
    </div>
  );
}