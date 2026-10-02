import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  User,
  Award,
  BookOpen,
  Briefcase,
  TrendingUp,
  Target,
  ArrowRight,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Layers,
  ChevronRight,
  RefreshCw,
  FolderGit2,
  Building2,
  ShieldCheck,
  Sparkles
} from 'lucide-react';

const API_BASE_URL = 'http://localhost:5000/api';
const DEFAULT_STUDENT_ID = 'DEMO-STU-001';

const AUTH_HEADERS = {
  'Content-Type': 'application/json',
  'X-Demo-User-Role': 'placement_officer'
};

export default function StudentPortal({ onNavigate, studentId = DEFAULT_STUDENT_ID }) {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  // Authoritative API states
  const [student, setStudent] = useState(null);
  const [readiness, setReadiness] = useState(null);
  const [drives, setDrives] = useState([]);
  const [selectedDriveId, setSelectedDriveId] = useState('');
  const [skillGap, setSkillGap] = useState(null);
  const [matching, setMatching] = useState(null);

  // 1. Fetch Authoritative Student Identity, Readiness, and Active Drives
  const fetchPortalData = useCallback(async () => {
    setError(null);
    try {
      const [stuRes, readRes, drivesRes] = await Promise.all([
        fetch(`${API_BASE_URL}/students/${studentId}`, { headers: AUTH_HEADERS }),
        fetch(`${API_BASE_URL}/readiness/student/${studentId}`, { headers: AUTH_HEADERS }),
        fetch(`${API_BASE_URL}/drives`, { headers: AUTH_HEADERS })
      ]);

      if (!stuRes.ok) {
        throw new Error(`Failed to load student identity record (HTTP ${stuRes.status})`);
      }

      const stuJson = await stuRes.json();
      setStudent(stuJson?.data || stuJson);

      if (readRes.ok) {
        const readJson = await readRes.json();
        setReadiness(readJson?.data || readJson);
      }

      if (drivesRes.ok) {
        const drivesJson = await drivesRes.json();
        const driveList = Array.isArray(drivesJson?.data)
          ? drivesJson.data
          : (Array.isArray(drivesJson) ? drivesJson : []);
        setDrives(driveList);

        if (driveList.length > 0 && !selectedDriveId) {
          setSelectedDriveId(driveList[0].id);
        }
      }
    } catch (err) {
      setError(err.message || 'Error occurred while loading student placement portal.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [studentId, selectedDriveId]);

  // 2. Fetch Target Drive Skill Gap & Matching Diagnostics
  const fetchDriveDiagnostics = useCallback(async (driveId) => {
    if (!driveId) return;
    try {
      const [gapRes, matchRes] = await Promise.all([
        fetch(`${API_BASE_URL}/skill-gap/student/${studentId}/drive/${driveId}`, {
          headers: AUTH_HEADERS
        }),
        fetch(`${API_BASE_URL}/matching/student/${studentId}/drive/${driveId}`, {
          headers: AUTH_HEADERS
        })
      ]);

      if (gapRes.ok) {
        const gapJson = await gapRes.json();
        setSkillGap(gapJson?.data || null);
      } else {
        setSkillGap(null);
      }

      if (matchRes.ok) {
        const matchJson = await matchRes.json();
        setMatching(matchJson?.data || null);
      } else {
        setMatching(null);
      }
    } catch {
      setSkillGap(null);
      setMatching(null);
    }
  }, [studentId]);

  useEffect(() => {
    fetchPortalData();
  }, [fetchPortalData]);

  useEffect(() => {
    if (selectedDriveId) {
      fetchDriveDiagnostics(selectedDriveId);
    }
  }, [selectedDriveId, fetchDriveDiagnostics]);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchPortalData();
    if (selectedDriveId) {
      fetchDriveDiagnostics(selectedDriveId);
    }
  };

  // Safe Mappings & Field Resolution
  const verifiedSkills = useMemo(() => {
    if (Array.isArray(student?.technicalSkills)) return student.technicalSkills;
    if (Array.isArray(student?.skills)) return student.skills;
    return [];
  }, [student]);

  const projects = useMemo(() => {
    if (Array.isArray(student?.projects)) return student.projects;
    return [];
  }, [student]);

  const readinessScore = readiness?.totalScore ?? readiness?.readinessScore ?? null;
  const readinessBand = readiness?.readinessBand ?? 'Developing';
  const dimensions = readiness?.dimensions || {};

  // Exact skill coverage mapping with safe fallback
  const skillCoverage = useMemo(() => {
    if (skillGap?.skillCoverage !== undefined && skillGap?.skillCoverage !== null) {
      return Number(skillGap.skillCoverage);
    }
    if (skillGap?.coveragePercentage !== undefined && skillGap?.coveragePercentage !== null) {
      return Number(skillGap.coveragePercentage);
    }
    return null;
  }, [skillGap]);

  const matchedSkills = Array.isArray(skillGap?.matchedSkills) ? skillGap.matchedSkills : [];
  const partialSkills = Array.isArray(skillGap?.partialSkills) ? skillGap.partialSkills : [];
  const missingSkills = Array.isArray(skillGap?.missingSkills) ? skillGap.missingSkills : [];

  // Determine top missing prerequisite from live missingSkills list
  const priorityMissingSkill = useMemo(() => {
    if (missingSkills.length > 0) {
      const first = missingSkills[0];
      return typeof first === 'string' ? first : (first?.skill || first?.name || null);
    }
    return null;
  }, [missingSkills]);

  const matchIndex = matching?.matchingScore ?? matching?.overallMatchScore ?? null;
  const matchTier = matching?.matchTier ?? (
    matchIndex !== null
      ? (matchIndex >= 70 ? 'High Alignment' : matchIndex >= 45 ? 'Moderate Alignment' : 'Low Alignment')
      : '--'
  );

  const selectedDrive = useMemo(() => {
    if (!selectedDriveId) return drives[0] || null;
    return drives.find((d) => d.id === selectedDriveId) || drives[0] || null;
  }, [drives, selectedDriveId]);

  const activeCompanyName = skillGap?.company || selectedDrive?.company || selectedDriveId || '--';
  const activeRoleName = skillGap?.role || selectedDrive?.role || 'Placement Drive';

  // Placement Stepper Steps based strictly on current state
  const journeySteps = [
    {
      label: 'Profile Active',
      subtext: student ? `${student.name || studentId} (${student.id || studentId})` : 'Loading profile...',
      done: Boolean(student)
    },
    {
      label: 'Readiness Assessed',
      subtext: readinessScore !== null ? `${readinessScore}/100 • ${readinessBand}` : 'Assessment pending',
      done: readinessScore !== null
    },
    {
      label: 'Skill Gap Identified',
      subtext: skillCoverage !== null ? `${skillCoverage}% Coverage • ${missingSkills.length} missing` : 'Analysis pending',
      done: skillCoverage !== null
    },
    {
      label: 'Job Match Analysed',
      subtext: matchIndex !== null ? `${matchIndex}% Match (${activeCompanyName})` : 'Target drive pending',
      done: matchIndex !== null
    },
    {
      label: 'Recommended Action',
      subtext: priorityMissingSkill ? `Focus on ${priorityMissingSkill}` : 'Verify core skills',
      done: true
    }
  ];

  if (loading) {
    return (
      <div style={{ padding: '48px', textAlign: 'center', color: '#64748b' }}>
        <RefreshCw size={24} style={{ animation: 'spin 1s linear infinite', margin: '0 auto 12px' }} />
        <p style={{ margin: 0, fontSize: '0.875rem' }}>Loading placement portal diagnostics...</p>
      </div>
    );
  }

  return (
    <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* 1. Header with Live Status & Refresh */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <h1 style={{ margin: 0, fontSize: '1.65rem', fontWeight: 800, color: 'var(--text-primary, #ffffff)', letterSpacing: '-0.02em' }}>
              Student Placement Portal
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
                backgroundColor: 'rgba(16, 185, 129, 0.12)',
                color: '#34d399',
                border: '1px solid rgba(16, 185, 129, 0.25)'
              }}
            >
              <CheckCircle2 size={12} /> Active Candidate Profile
            </span>
          </div>
          <p style={{ margin: '6px 0 0 0', fontSize: '0.875rem', color: 'var(--text-secondary, #94a3b8)' }}>
            Individual candidate command center: readiness diagnostics, target drive skill gap, and actionable roadmap
          </p>
        </div>

        <button
          onClick={handleRefresh}
          disabled={refreshing}
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
            cursor: refreshing ? 'not-allowed' : 'pointer',
            opacity: refreshing ? 0.6 : 1
          }}
        >
          <RefreshCw size={15} style={{ animation: refreshing ? 'spin 1s linear infinite' : 'none' }} />
          {refreshing ? 'Updating Profile...' : 'Refresh Portal'}
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
          <AlertTriangle size={18} />
          <span>{error}</span>
        </div>
      )}

      {/* 2. Identity Hero & Academic Snapshot */}
      <div
        style={{
          backgroundColor: '#0f172a',
          border: '1px solid #1e293b',
          borderRadius: '14px',
          padding: '24px',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: '24px',
          alignItems: 'center'
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <User size={18} color="#818cf8" />
            <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Candidate Identity
            </span>
          </div>
          <div style={{ fontSize: '1.65rem', fontWeight: 800, color: '#ffffff', marginTop: '6px' }}>
            {student?.name || studentId}
          </div>
          <div style={{ fontSize: '0.8125rem', color: '#818cf8', fontFamily: 'monospace', marginTop: '2px' }}>
            {student?.id || studentId} {student?.branch ? `• ${student.branch}` : ''}
          </div>

          <div style={{ display: 'flex', gap: '16px', marginTop: '16px', fontSize: '0.8125rem', color: '#cbd5e1' }}>
            <div>CGPA: <strong style={{ color: '#fff' }}>{student?.cgpa !== undefined ? Number(student.cgpa).toFixed(2) : '--'}</strong></div>
            <div>Status: <strong style={{ color: '#34d399' }}>{student?.status || 'Active'}</strong></div>
            <div>Projects: <strong style={{ color: '#fff' }}>{projects.length}</strong></div>
          </div>
        </div>

        {/* Verified Skills Chip Wall */}
        <div>
          <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.04em', display: 'block', marginBottom: '8px' }}>
            Verified Technical Profile ({verifiedSkills.length})
          </span>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
            {verifiedSkills.length > 0 ? (
              verifiedSkills.map((sk, idx) => (
                <span
                  key={idx}
                  style={{
                    padding: '5px 12px',
                    borderRadius: '6px',
                    backgroundColor: 'rgba(99, 102, 241, 0.12)',
                    border: '1px solid rgba(99, 102, 241, 0.3)',
                    color: '#a5b4fc',
                    fontSize: '0.8125rem',
                    fontWeight: 600
                  }}
                >
                  {typeof sk === 'string' ? sk : (sk?.name || sk?.skill)}
                </span>
              ))
            ) : (
              <span style={{ fontSize: '0.8125rem', color: '#64748b' }}>No verified technical skills documented.</span>
            )}
          </div>
        </div>
      </div>

      {/* 3. Placement Journey Progress Stepper */}
      <div
        style={{
          backgroundColor: '#0f172a',
          border: '1px solid #1e293b',
          borderRadius: '12px',
          padding: '20px',
          display: 'flex',
          flexDirection: 'column',
          gap: '14px'
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: '0.8125rem', fontWeight: 700, color: '#f8fafc', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <TrendingUp size={16} color="#818cf8" />
            Placement Journey Stepper
          </span>
          <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Institutional Career Readiness Pipeline</span>
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
            gap: '12px'
          }}
        >
          {journeySteps.map((st, i) => (
            <div
              key={i}
              style={{
                padding: '12px 14px',
                borderRadius: '8px',
                backgroundColor: st.done ? 'rgba(30, 41, 59, 0.6)' : 'rgba(15, 23, 42, 0.4)',
                border: `1px solid ${st.done ? '#334155' : '#1e293b'}`,
                display: 'flex',
                flexDirection: 'column',
                gap: '4px'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.75rem', fontWeight: 700, color: st.done ? '#34d399' : '#94a3b8' }}>
                <CheckCircle2 size={13} color={st.done ? '#10b981' : '#64748b'} />
                <span>Step {i + 1}: {st.label}</span>
              </div>
              <div style={{ fontSize: '0.75rem', color: '#cbd5e1', lineHeight: '1.3' }}>
                {st.subtext}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 4. Priority Decision Card: "What Should I Do Next?" */}
      <div
        style={{
          background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.12) 0%, rgba(15, 23, 42, 0.95) 100%)',
          border: '1px solid rgba(99, 102, 241, 0.35)',
          borderRadius: '12px',
          padding: '20px 24px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '16px'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '14px', maxWidth: '680px' }}>
          <Sparkles size={24} color="#818cf8" style={{ marginTop: '2px', flexShrink: 0 }} />
          <div>
            <div style={{ fontSize: '1rem', fontWeight: 800, color: '#ffffff' }}>
              What Should I Do Next?
            </div>
            <p style={{ margin: '4px 0 0 0', fontSize: '0.8125rem', color: '#cbd5e1', lineHeight: '1.45' }}>
              {priorityMissingSkill ? (
                <>
                  Your primary technical prerequisite gap for <strong>{activeCompanyName}</strong> is <strong>{priorityMissingSkill}</strong>. Validate foundational competencies or apply practical project evidence to elevate your match index.
                </>
              ) : (
                <>Maintain balanced academic benchmarks and practice coding consistency across your verified technical stack.</>
              )}
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          <button
            type="button"
            onClick={() => onNavigate && onNavigate('skill-gap')}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '8px 16px',
              backgroundColor: '#6366f1',
              border: 'none',
              borderRadius: '6px',
              color: '#ffffff',
              fontSize: '0.8125rem',
              fontWeight: 700,
              cursor: 'pointer'
            }}
          >
            Review Skill Gap <ArrowRight size={14} />
          </button>
          <button
            type="button"
            onClick={() => onNavigate && onNavigate('readiness')}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '8px 14px',
              backgroundColor: 'rgba(30, 41, 59, 0.8)',
              border: '1px solid #334155',
              borderRadius: '6px',
              color: '#cbd5e1',
              fontSize: '0.8125rem',
              fontWeight: 600,
              cursor: 'pointer'
            }}
          >
            Open Simulator
          </button>
        </div>
      </div>

      {/* 5. Two-Column Diagnostic Breakdown */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(420px, 1fr))',
          gap: '20px'
        }}
      >
        {/* Left Card: 4-Dimension Readiness Breakdown */}
        <div
          style={{
            backgroundColor: '#0f172a',
            border: '1px solid #1e293b',
            borderRadius: '12px',
            padding: '22px',
            display: 'flex',
            flexDirection: 'column',
            gap: '16px'
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Award size={18} color="#818cf8" />
              <h2 style={{ margin: 0, fontSize: '1rem', fontWeight: 700, color: '#f8fafc' }}>
                Readiness Evaluation Snapshot
              </h2>
            </div>
            <span
              style={{
                fontSize: '11px',
                fontWeight: 700,
                padding: '3px 10px',
                borderRadius: '999px',
                backgroundColor: 'rgba(59, 130, 246, 0.12)',
                color: '#60a5fa',
                border: '1px solid rgba(59, 130, 246, 0.3)'
              }}
            >
              {readinessBand}
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px' }}>
            <span style={{ fontSize: '2.5rem', fontWeight: 800, color: '#ffffff', fontFamily: 'monospace' }}>
              {readinessScore !== null ? readinessScore : '--'}
            </span>
            <span style={{ fontSize: '0.875rem', color: '#64748b' }}>/ 100 Baseline Points</span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8125rem', marginBottom: '4px', color: '#cbd5e1' }}>
                <span>Academics (25 max)</span>
                <span><strong>{dimensions.academics ?? '--'}</strong> pts</span>
              </div>
              <div style={{ height: '6px', backgroundColor: '#1e293b', borderRadius: '999px', overflow: 'hidden' }}>
                <div style={{ width: `${((dimensions.academics || 0) / 25) * 100}%`, height: '100%', backgroundColor: '#6366f1' }} />
              </div>
            </div>

            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8125rem', marginBottom: '4px', color: '#cbd5e1' }}>
                <span>Technical Skills (30 max)</span>
                <span><strong>{dimensions.technical ?? dimensions.technicalSkills ?? '--'}</strong> pts</span>
              </div>
              <div style={{ height: '6px', backgroundColor: '#1e293b', borderRadius: '999px', overflow: 'hidden' }}>
                <div style={{ width: `${((dimensions.technical || dimensions.technicalSkills || 0) / 30) * 100}%`, height: '100%', backgroundColor: '#10b981' }} />
              </div>
            </div>

            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8125rem', marginBottom: '4px', color: '#cbd5e1' }}>
                <span>Communication Benchmark (25 max)</span>
                <span><strong>{dimensions.communication ?? '--'}</strong> pts</span>
              </div>
              <div style={{ height: '6px', backgroundColor: '#1e293b', borderRadius: '999px', overflow: 'hidden' }}>
                <div style={{ width: `${((dimensions.communication || 0) / 25) * 100}%`, height: '100%', backgroundColor: '#f59e0b' }} />
              </div>
            </div>

            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8125rem', marginBottom: '4px', color: '#cbd5e1' }}>
                <span>Practical &amp; Projects (20 max)</span>
                <span><strong>{dimensions.practical ?? dimensions.practicalExperience ?? '--'}</strong> pts</span>
              </div>
              <div style={{ height: '6px', backgroundColor: '#1e293b', borderRadius: '999px', overflow: 'hidden' }}>
                <div style={{ width: `${((dimensions.practical || dimensions.practicalExperience || 0) / 20) * 100}%`, height: '100%', backgroundColor: '#38bdf8' }} />
              </div>
            </div>
          </div>

          <div style={{ borderTop: '1px solid #1e293b', paddingTop: '12px', fontSize: '0.75rem', color: '#94a3b8' }}>
            Readiness scores map deterministically from institutional MySQL student records across verified academic benchmarks.
          </div>
        </div>

        {/* Right Card: Target Drive Skill Gap Snapshot */}
        <div
          style={{
            backgroundColor: '#0f172a',
            border: '1px solid #1e293b',
            borderRadius: '12px',
            padding: '22px',
            display: 'flex',
            flexDirection: 'column',
            gap: '16px'
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Briefcase size={18} color="#10b981" />
              <h2 style={{ margin: 0, fontSize: '1rem', fontWeight: 700, color: '#f8fafc' }}>
                Target Drive Skill Gap Snapshot
              </h2>
            </div>

            {/* Target Drive Selector */}
            {drives.length > 0 && (
              <select
                value={selectedDriveId}
                onChange={(e) => setSelectedDriveId(e.target.value)}
                style={{
                  backgroundColor: '#1e293b',
                  color: '#f8fafc',
                  border: '1px solid #334155',
                  borderRadius: '6px',
                  padding: '4px 8px',
                  fontSize: '0.75rem',
                  outline: 'none',
                  cursor: 'pointer'
                }}
              >
                {drives.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.company}
                  </option>
                ))}
              </select>
            )}
          </div>

          <div style={{ padding: '12px', backgroundColor: 'rgba(30, 41, 59, 0.4)', borderRadius: '8px', border: '1px solid #334155' }}>
            <div style={{ fontSize: '0.875rem', fontWeight: 700, color: '#fff' }}>
              {activeRoleName}
            </div>
            <div style={{ fontSize: '0.75rem', color: '#818cf8', marginTop: '2px' }}>
              {activeCompanyName} ({skillGap?.driveId || selectedDriveId})
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px' }}>
            <div style={{ padding: '12px', backgroundColor: 'rgba(30, 41, 59, 0.5)', borderRadius: '8px', border: '1px solid #334155' }}>
              <span style={{ fontSize: '0.6875rem', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 600 }}>Skill Coverage Ratio</span>
              <div style={{ fontSize: '1.65rem', fontWeight: 800, color: skillCoverage !== null ? '#34d399' : '#94a3b8', fontFamily: 'monospace', marginTop: '4px' }}>
                {skillCoverage !== null ? `${skillCoverage}%` : '—%'}
              </div>
              <span style={{ fontSize: '11px', color: '#64748b' }}>
                Matched: {matchedSkills.length} • Partial: {partialSkills.length}
              </span>
            </div>

            <div style={{ padding: '12px', backgroundColor: 'rgba(30, 41, 59, 0.5)', borderRadius: '8px', border: '1px solid #334155' }}>
              <span style={{ fontSize: '0.6875rem', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 600 }}>Priority Missing Skill</span>
              <div style={{ fontSize: '1.1rem', fontWeight: 800, color: priorityMissingSkill ? '#f87171' : '#34d399', marginTop: '8px' }}>
                {priorityMissingSkill || 'None'}
              </div>
              <span style={{ fontSize: '11px', color: '#64748b' }}>
                Total missing: {missingSkills.length}
              </span>
            </div>
          </div>

          {/* Partial Skills Project Evidence */}
          {partialSkills.length > 0 && (
            <div>
              <span style={{ fontSize: '0.75rem', color: '#94a3b8', display: 'block', marginBottom: '6px' }}>
                Partial Skills (Evidenced in Projects):
              </span>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                {partialSkills.map((p, idx) => {
                  const skillName = typeof p === 'string' ? p : p.skill;
                  const evidence = typeof p === 'object' ? p.evidence : null;
                  return (
                    <div
                      key={idx}
                      style={{
                        padding: '6px 10px',
                        borderRadius: '6px',
                        backgroundColor: 'rgba(245, 158, 11, 0.08)',
                        border: '1px solid rgba(245, 158, 11, 0.25)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        fontSize: '0.75rem'
                      }}
                    >
                      <span style={{ color: '#fbbf24', fontWeight: 700 }}>{skillName}</span>
                      {evidence && (
                        <span style={{ color: '#94a3b8', display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <FolderGit2 size={12} color="#f59e0b" />
                          Project: <strong style={{ color: '#cbd5e1' }}>{evidence}</strong>
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Missing Skills Tags */}
          <div>
            <span style={{ fontSize: '0.75rem', color: '#94a3b8', display: 'block', marginBottom: '6px' }}>
              Missing Requirements ({missingSkills.length}):
            </span>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
              {missingSkills.length > 0 ? (
                missingSkills.map((sk, idx) => (
                  <span
                    key={idx}
                    style={{
                      padding: '3px 8px',
                      borderRadius: '4px',
                      backgroundColor: 'rgba(239, 68, 68, 0.1)',
                      border: '1px solid rgba(239, 68, 68, 0.25)',
                      color: '#f87171',
                      fontSize: '11px',
                      fontWeight: 600
                    }}
                  >
                    ✕ {typeof sk === 'string' ? sk : sk?.skill}
                  </span>
                ))
              ) : (
                <span style={{ fontSize: '0.75rem', color: '#34d399' }}>Full prerequisite alignment achieved.</span>
              )}
            </div>
          </div>

          <div style={{ borderTop: '1px solid #1e293b', paddingTop: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
              Alignment Tier: <strong style={{ color: '#fff' }}>{matchTier}</strong>
            </span>
            <button
              type="button"
              onClick={() => onNavigate && onNavigate('matching')}
              style={{
                background: 'transparent',
                border: 'none',
                color: '#818cf8',
                fontSize: '0.75rem',
                fontWeight: 600,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '4px'
              }}
            >
              Open Match View <ChevronRight size={13} />
            </button>
          </div>
        </div>
      </div>

      {/* 6. Grounding Methodology Footer */}
      <div
        style={{
          padding: '14px 18px',
          backgroundColor: 'rgba(30, 41, 59, 0.4)',
          borderRadius: '8px',
          border: '1px solid rgba(51, 65, 85, 0.4)',
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          fontSize: '0.75rem',
          color: '#94a3b8'
        }}
      >
        <ShieldCheck size={16} color="#818cf8" style={{ flexShrink: 0 }} />
        <span>
          <strong>Deterministic Grounding Protocol:</strong> Candidate profile, readiness indicators, and drive prerequisites are sourced directly from verified MySQL backend records.
        </span>
      </div>
    </div>
  );
}