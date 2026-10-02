import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Briefcase,
  AlertTriangle,
  RefreshCw,
  CheckCircle2,
  Clock,
  XCircle,
  TrendingUp,
  FolderGit2,
  ChevronRight,
  ShieldCheck,
  Building2,
  Target,
  Layers,
  Sparkles
} from 'lucide-react';

const API_BASE_URL = 'http://localhost:5000/api';
const DEMO_STUDENT_ID = 'DEMO-STU-001';

const AUTH_HEADERS = {
  'Content-Type': 'application/json',
  'X-Demo-User-Role': 'placement_officer'
};

export default function SkillGapAnalysis({ studentId = DEMO_STUDENT_ID }) {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  const [drives, setDrives] = useState([]);
  const [selectedDriveId, setSelectedDriveId] = useState('');
  const [analysisData, setAnalysisData] = useState(null);

  // 1. Fetch available placement drives with required authentication header
  const fetchDrives = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/drives`, {
        headers: AUTH_HEADERS
      });

      if (!res.ok) {
        throw new Error(`Failed to load drives (HTTP ${res.status})`);
      }

      const json = await res.json();
      const list = Array.isArray(json?.data)
        ? json.data
        : (Array.isArray(json) ? json : []);

      setDrives(list);

      if (list.length > 0 && !selectedDriveId) {
        setSelectedDriveId(list[0].id);
      }
    } catch (err) {
      setError(err.message || 'Error occurred while loading placement drives.');
    }
  }, [selectedDriveId]);

  // 2. Fetch Skill Gap Evaluation for the selected student & drive with required authentication header
  const fetchGapAnalysis = useCallback(async (driveId) => {
    if (!driveId) return;
    setError(null);
    setRefreshing(true);
    try {
      const res = await fetch(
        `${API_BASE_URL}/skill-gap/student/${studentId}/drive/${driveId}`,
        {
          headers: AUTH_HEADERS
        }
      );

      if (!res.ok) {
        throw new Error(`Failed to compute skill gap (HTTP ${res.status})`);
      }

      const json = await res.json();
      setAnalysisData(json?.data || json);
    } catch (err) {
      setError(err.message || 'Error evaluating skill gap for selected drive.');
      setAnalysisData(null);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [studentId]);

  useEffect(() => {
    fetchDrives();
  }, [fetchDrives]);

  useEffect(() => {
    if (selectedDriveId) {
      fetchGapAnalysis(selectedDriveId);
    }
  }, [selectedDriveId, fetchGapAnalysis]);

  const handleDriveChange = (e) => {
    setSelectedDriveId(e.target.value);
  };

  const handleRefresh = () => {
    if (selectedDriveId) {
      fetchGapAnalysis(selectedDriveId);
    }
  };

  // Safe field extractions supporting both current backend contract and legacy fallback keys
  const matched = useMemo(() => {
    if (Array.isArray(analysisData?.matchedSkills)) return analysisData.matchedSkills;
    return [];
  }, [analysisData]);

  const partial = useMemo(() => {
    if (Array.isArray(analysisData?.partialSkills)) return analysisData.partialSkills;
    return [];
  }, [analysisData]);

  const missing = useMemo(() => {
    if (Array.isArray(analysisData?.missingSkills)) return analysisData.missingSkills;
    return [];
  }, [analysisData]);

  const coverage = useMemo(() => {
    const rawVal =
      analysisData?.skillCoverage ??
      analysisData?.coveragePercentage ??
      analysisData?.skillCoverageScore ??
      0;
    return Math.max(0, Math.min(100, Math.round(Number(rawVal) || 0)));
  }, [analysisData]);

  const totalRequired = useMemo(() => {
    return (
      analysisData?.totalRequiredSkills ??
      (matched.length + partial.length + missing.length)
    );
  }, [analysisData, matched.length, partial.length, missing.length]);

  const actions = useMemo(() => {
    if (Array.isArray(analysisData?.recommendedActions)) return analysisData.recommendedActions;
    if (Array.isArray(analysisData?.recommendations)) return analysisData.recommendations;
    if (Array.isArray(analysisData?.actionPlan)) return analysisData.actionPlan;
    return [];
  }, [analysisData]);

  const priorityMissing = useMemo(() => {
    if (Array.isArray(analysisData?.priorityMissingSkills) && analysisData.priorityMissingSkills.length > 0) {
      return analysisData.priorityMissingSkills;
    }
    return missing.slice(0, 3);
  }, [analysisData, missing]);

  const gapSeverity = useMemo(() => {
    if (analysisData?.gapSeverity) return analysisData.gapSeverity;
    if (coverage >= 75) return 'Low Gap';
    if (coverage >= 40) return 'Moderate Gap';
    return 'Critical Gap';
  }, [analysisData, coverage]);

  const getCoverageColor = (pct) => {
    if (pct >= 75) return '#10b981';
    if (pct >= 40) return '#f59e0b';
    return '#ef4444';
  };

  const coverageColor = getCoverageColor(coverage);

  const getSeverityBadgeStyle = (sev) => {
    const lower = String(sev || '').toLowerCase();
    if (lower.includes('low')) {
      return { bg: 'rgba(16, 185, 129, 0.12)', color: '#34d399', border: 'rgba(16, 185, 129, 0.3)' };
    }
    if (lower.includes('moderate') || lower.includes('medium')) {
      return { bg: 'rgba(245, 158, 11, 0.12)', color: '#fbbf24', border: 'rgba(245, 158, 11, 0.3)' };
    }
    return { bg: 'rgba(239, 68, 68, 0.12)', color: '#f87171', border: 'rgba(239, 68, 68, 0.3)' };
  };

  const severityBadge = getSeverityBadgeStyle(gapSeverity);

  if (loading && !analysisData) {
    return (
      <div style={{ padding: '48px', textAlign: 'center', color: '#64748b' }}>
        <RefreshCw size={24} style={{ animation: 'spin 1s linear infinite', margin: '0 auto 12px' }} />
        <p style={{ margin: 0, fontSize: '0.875rem' }}>Evaluating candidate technical profile against drive requirements...</p>
      </div>
    );
  }

  return (
    <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Page Header & Drive Selector */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <h1 style={{ margin: 0, fontSize: '1.65rem', fontWeight: 800, color: 'var(--text-primary, #ffffff)', letterSpacing: '-0.02em' }}>
              Skill Gap Analysis
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
              <Briefcase size={12} /> Target Drive Diagnostics
            </span>
          </div>
          <p style={{ margin: '6px 0 0 0', fontSize: '0.875rem', color: 'var(--text-secondary, #94a3b8)' }}>
            Compare candidate verified technical profile and project evidence against active recruitment drives
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Building2 size={16} color="#818cf8" />
            <select
              value={selectedDriveId}
              onChange={handleDriveChange}
              style={{
                backgroundColor: '#1e293b',
                color: '#f8fafc',
                border: '1px solid #334155',
                borderRadius: '8px',
                padding: '8px 12px',
                fontSize: '0.875rem',
                outline: 'none',
                cursor: 'pointer'
              }}
            >
              {drives.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.company} – {d.role}
                </option>
              ))}
            </select>
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
            {refreshing ? 'Evaluating...' : 'Refresh'}
          </button>
        </div>
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

      {/* Target Drive & Summary Card */}
      {analysisData && (
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
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                Target Role &amp; Company
              </span>
              <span
                style={{
                  fontSize: '10px',
                  fontWeight: 700,
                  padding: '2px 8px',
                  borderRadius: '999px',
                  backgroundColor: severityBadge.bg,
                  color: severityBadge.color,
                  border: `1px solid ${severityBadge.border}`
                }}
              >
                {gapSeverity}
              </span>
            </div>

            <div style={{ fontSize: '1.35rem', fontWeight: 800, color: '#ffffff' }}>
              {analysisData.role || 'Role Specification'}
            </div>
            <div style={{ fontSize: '0.875rem', color: '#818cf8', marginTop: '2px', fontWeight: 600 }}>
              {analysisData.company || 'Recruiting Company'} ({analysisData.driveId || selectedDriveId})
            </div>

            <div style={{ marginTop: '14px', fontSize: '0.8125rem', color: '#94a3b8' }}>
              Candidate: <strong style={{ color: '#cbd5e1' }}>{analysisData.studentName || 'Candidate Profile'}</strong> ({analysisData.studentId || studentId})
            </div>
          </div>

          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '6px' }}>
              <span style={{ fontSize: '0.8125rem', color: '#cbd5e1', fontWeight: 600 }}>
                Prerequisite Skill Coverage
              </span>
              <span style={{ fontSize: '1.75rem', fontWeight: 800, color: coverageColor, fontFamily: 'monospace' }}>
                {coverage}%
              </span>
            </div>

            <div style={{ height: '8px', backgroundColor: '#1e293b', borderRadius: '999px', overflow: 'hidden' }}>
              <div style={{ width: `${coverage}%`, height: '100%', backgroundColor: coverageColor, transition: 'width 0.4s ease' }} />
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: '#94a3b8', marginTop: '8px' }}>
              <span>{totalRequired} Total Required</span>
              <span>Matched: {matched.length} • Partial: {partial.length} • Missing: {missing.length}</span>
            </div>
          </div>
        </div>
      )}

      {/* 3-Column Categorization View */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: '20px'
        }}
      >
        {/* 1. Matched Skills */}
        <div
          style={{
            backgroundColor: '#0f172a',
            border: '1px solid rgba(16, 185, 129, 0.25)',
            borderRadius: '12px',
            padding: '20px',
            display: 'flex',
            flexDirection: 'column',
            gap: '14px'
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <CheckCircle2 size={18} color="#10b981" />
              <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 700, color: '#f8fafc' }}>
                Matched Skills
              </h3>
            </div>
            <span
              style={{
                fontSize: '11px',
                padding: '2px 8px',
                borderRadius: '999px',
                backgroundColor: 'rgba(16, 185, 129, 0.12)',
                color: '#34d399',
                fontWeight: 700
              }}
            >
              {matched.length} Verified
            </span>
          </div>

          <p style={{ margin: 0, fontSize: '0.75rem', color: '#94a3b8' }}>
            Skills verified in the student's authoritative profile that satisfy target drive requirements.
          </p>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
            {matched.length > 0 ? (
              matched.map((sk, idx) => {
                const label = typeof sk === 'string' ? sk : (sk.skill || sk.name || JSON.stringify(sk));
                return (
                  <span
                    key={idx}
                    style={{
                      padding: '6px 12px',
                      borderRadius: '6px',
                      backgroundColor: 'rgba(16, 185, 129, 0.1)',
                      border: '1px solid rgba(16, 185, 129, 0.3)',
                      color: '#34d399',
                      fontSize: '0.8125rem',
                      fontWeight: 600
                    }}
                  >
                    ✓ {label}
                  </span>
                );
              })
            ) : (
              <span style={{ fontSize: '0.8125rem', color: '#64748b', fontStyle: 'italic' }}>
                No direct verified skills matched for this role.
              </span>
            )}
          </div>
        </div>

        {/* 2. Partial Skills (Evidence in Projects) */}
        <div
          style={{
            backgroundColor: '#0f172a',
            border: '1px solid rgba(245, 158, 11, 0.25)',
            borderRadius: '12px',
            padding: '20px',
            display: 'flex',
            flexDirection: 'column',
            gap: '14px'
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Clock size={18} color="#f59e0b" />
              <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 700, color: '#f8fafc' }}>
                Partial Skills (Evidenced)
              </h3>
            </div>
            <span
              style={{
                fontSize: '11px',
                padding: '2px 8px',
                borderRadius: '999px',
                backgroundColor: 'rgba(245, 158, 11, 0.12)',
                color: '#fbbf24',
                fontWeight: 700
              }}
            >
              {partial.length} Evidenced
            </span>
          </div>

          <p style={{ margin: 0, fontSize: '0.75rem', color: '#94a3b8' }}>
            Observed in candidate project repositories, but not yet verified as a formal competency.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {partial.length > 0 ? (
              partial.map((item, idx) => {
                const skillName = typeof item === 'string' ? item : (item.skill || item.name || 'Competency');
                const evidence = typeof item === 'object' ? item.evidence : null;
                const reason = typeof item === 'object' ? (item.reason || item.verificationRequired) : null;

                return (
                  <div
                    key={idx}
                    style={{
                      padding: '10px 12px',
                      borderRadius: '8px',
                      backgroundColor: 'rgba(245, 158, 11, 0.08)',
                      border: '1px solid rgba(245, 158, 11, 0.25)',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '4px'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontWeight: 700, color: '#fbbf24', fontSize: '0.875rem' }}>
                        {skillName}
                      </span>
                      <span style={{ fontSize: '10px', color: '#94a3b8', textTransform: 'uppercase' }}>
                        Unverified Project Evidence
                      </span>
                    </div>

                    {evidence && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '0.75rem', color: '#cbd5e1' }}>
                        <FolderGit2 size={12} color="#f59e0b" />
                        <span>Project: <strong>{evidence}</strong></span>
                      </div>
                    )}

                    {reason && (
                      <div style={{ fontSize: '0.6875rem', color: '#94a3b8', lineHeight: 1.35, marginTop: '2px' }}>
                        {reason}
                      </div>
                    )}
                  </div>
                );
              })
            ) : (
              <span style={{ fontSize: '0.8125rem', color: '#64748b', fontStyle: 'italic' }}>
                No practical partial evidence observed for missing prerequisites.
              </span>
            )}
          </div>
        </div>

        {/* 3. Missing Skills */}
        <div
          style={{
            backgroundColor: '#0f172a',
            border: '1px solid rgba(239, 68, 68, 0.25)',
            borderRadius: '12px',
            padding: '20px',
            display: 'flex',
            flexDirection: 'column',
            gap: '14px'
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <XCircle size={18} color="#ef4444" />
              <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 700, color: '#f8fafc' }}>
                Missing Skills
              </h3>
            </div>
            <span
              style={{
                fontSize: '11px',
                padding: '2px 8px',
                borderRadius: '999px',
                backgroundColor: 'rgba(239, 68, 68, 0.12)',
                color: '#f87171',
                fontWeight: 700
              }}
            >
              {missing.length} Gaps
            </span>
          </div>

          <p style={{ margin: 0, fontSize: '0.75rem', color: '#94a3b8' }}>
            Required drive competencies with no verified credit and no practical repository evidence.
          </p>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
            {missing.length > 0 ? (
              missing.map((sk, idx) => {
                const label = typeof sk === 'string' ? sk : (sk.skill || sk.name || JSON.stringify(sk));
                return (
                  <span
                    key={idx}
                    style={{
                      padding: '6px 12px',
                      borderRadius: '6px',
                      backgroundColor: 'rgba(239, 68, 68, 0.08)',
                      border: '1px solid rgba(239, 68, 68, 0.25)',
                      color: '#f87171',
                      fontSize: '0.8125rem',
                      fontWeight: 600
                    }}
                  >
                    ✕ {label}
                  </span>
                );
              })
            ) : (
              <span style={{ fontSize: '0.8125rem', color: '#10b981', fontStyle: 'italic' }}>
                No prerequisite skills are missing for this drive.
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Priority Missing Skills Callout (if available or non-empty missing) */}
      {priorityMissing.length > 0 && (
        <div
          style={{
            backgroundColor: '#0f172a',
            border: '1px solid rgba(239, 68, 68, 0.2)',
            borderRadius: '12px',
            padding: '16px 20px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '12px'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Target size={18} color="#ef4444" />
            <div>
              <div style={{ fontSize: '0.8125rem', fontWeight: 700, color: '#f8fafc' }}>
                Priority Prerequisite Gaps
              </div>
              <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
                Prerequisites demanding immediate technical focus before recruitment screening:
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            {priorityMissing.map((item, idx) => {
              const label = typeof item === 'string' ? item : (item.skill || item.name || 'Prerequisite');
              return (
                <span
                  key={idx}
                  style={{
                    padding: '4px 10px',
                    borderRadius: '4px',
                    backgroundColor: 'rgba(239, 68, 68, 0.15)',
                    color: '#f87171',
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    border: '1px solid rgba(239, 68, 68, 0.3)'
                  }}
                >
                  {label}
                </span>
              );
            })}
          </div>
        </div>
      )}

      {/* Actionable Recommendations / Action Plan */}
      <div
        style={{
          backgroundColor: '#0f172a',
          border: '1px solid #1e293b',
          borderRadius: '12px',
          padding: '20px',
          display: 'flex',
          flexDirection: 'column',
          gap: '12px'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <TrendingUp size={18} color="#818cf8" />
          <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 700, color: '#f8fafc' }}>
            Action Plan for Skill Bridge
          </h3>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {actions.length > 0 ? (
            actions.map((act, i) => {
              const text = typeof act === 'string' ? act : (act.action || act.description || act.title || JSON.stringify(act));
              return (
                <div
                  key={i}
                  style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '8px',
                    padding: '10px 12px',
                    backgroundColor: 'rgba(30, 41, 59, 0.45)',
                    borderRadius: '8px',
                    border: '1px solid #334155',
                    fontSize: '0.8125rem',
                    color: '#cbd5e1',
                    lineHeight: 1.45
                  }}
                >
                  <ChevronRight size={14} color="#818cf8" style={{ marginTop: '2px', flexShrink: 0 }} />
                  <span>{text}</span>
                </div>
              );
            })
          ) : (
            <div
              style={{
                padding: '10px 12px',
                backgroundColor: 'rgba(30, 41, 59, 0.45)',
                borderRadius: '8px',
                border: '1px solid #334155',
                fontSize: '0.8125rem',
                color: '#94a3b8'
              }}
            >
              Candidate demonstrates sufficient preparation alignment for this recruitment drive.
            </div>
          )}
        </div>
      </div>

      {/* Methodology Footer */}
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
          <strong style={{ color: '#cbd5e1' }}>Explainability &amp; Verification Protocol:</strong> Matched skills are drawn strictly from authoritative student records. Skills evidenced solely in project repositories are classified as Partial and require technical assessment before counting toward formal institutional readiness.
        </div>
      </div>
    </div>
  );
}