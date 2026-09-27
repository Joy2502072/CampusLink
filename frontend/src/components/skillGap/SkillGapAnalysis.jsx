import React, { useState, useEffect, useCallback } from 'react';
import { 
  Sparkles, 
  AlertCircle, 
  CheckCircle2, 
  AlertTriangle, 
  RefreshCw, 
  Briefcase, 
  Building2, 
  GraduationCap, 
  Calendar, 
  Clock, 
  Lightbulb, 
  TrendingUp, 
  ShieldAlert, 
  Check, 
  Minus, 
  X,
  Target
} from 'lucide-react';

const API_BASE_URL = 'http://localhost:5000/api';
const DEMO_STUDENT_ID = 'DEMO-STU-001';
const DEFAULT_DRIVE_ID = 'DRV-201';

export default function SkillGapAnalysis() {
  const [drivesList, setDrivesList] = useState([]);
  const [selectedDriveId, setSelectedDriveId] = useState(DEFAULT_DRIVE_ID);
  const [analysisData, setAnalysisData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isDrivesLoading, setIsDrivesLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState(null);

  // 1. Fetch all placement drives for the selector
  useEffect(() => {
    let isMounted = true;
    const fetchDrives = async () => {
      setIsDrivesLoading(true);
      try {
        const response = await fetch(`${API_BASE_URL}/drives`);
        if (!response.ok) {
          throw new Error(`Failed to load drives (HTTP ${response.status})`);
        }
        const json = await response.json();
        if (isMounted) {
          if (json && json.success && Array.isArray(json.data)) {
            setDrivesList(json.data);
          } else {
            setDrivesList([]);
          }
        }
      } catch (err) {
        if (isMounted) {
          console.error('Drive list error:', err);
          setDrivesList([]);
        }
      } finally {
        if (isMounted) {
          setIsDrivesLoading(false);
        }
      }
    };

    fetchDrives();
    return () => {
      isMounted = false;
    };
  }, []);

  // 2. Fetch skill gap analysis for DEMO_STUDENT_ID + selectedDriveId
  const fetchSkillGap = useCallback(async (driveId) => {
    if (!driveId) return;
    setIsLoading(true);
    setErrorMessage(null);

    try {
      const response = await fetch(`${API_BASE_URL}/skill-gap/student/${DEMO_STUDENT_ID}/drive/${driveId}`);
      if (!response.ok) {
        throw new Error(`Unable to fetch skill gap analysis (HTTP ${response.status}: ${response.statusText})`);
      }

      const json = await response.json();

      if (!json || json.success !== true || !json.data) {
        throw new Error(json?.message || 'Malformed API response from skill gap service');
      }

      setAnalysisData(json.data);
    } catch (err) {
      setErrorMessage(err.message || 'Failed to connect to the skill gap analysis service.');
      setAnalysisData(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSkillGap(selectedDriveId);
  }, [selectedDriveId, fetchSkillGap]);

  const getSeverityStyle = (severity) => {
    switch (severity) {
      case 'Low':
        return {
          backgroundColor: 'rgba(16, 185, 129, 0.12)',
          color: 'var(--accent-emerald, #34d399)',
          border: '1px solid rgba(16, 185, 129, 0.3)'
        };
      case 'Moderate':
      case 'Medium':
        return {
          backgroundColor: 'rgba(59, 130, 246, 0.12)',
          color: 'var(--accent-blue, #60a5fa)',
          border: '1px solid rgba(59, 130, 246, 0.3)'
        };
      case 'High':
        return {
          backgroundColor: 'rgba(245, 158, 11, 0.12)',
          color: 'var(--accent-amber, #fbbf24)',
          border: '1px solid rgba(245, 158, 11, 0.3)'
        };
      case 'Critical':
        return {
          backgroundColor: 'rgba(239, 68, 68, 0.12)',
          color: 'var(--accent-red, #f87171)',
          border: '1px solid rgba(239, 68, 68, 0.3)'
        };
      default:
        return {
          backgroundColor: 'rgba(148, 163, 184, 0.12)',
          color: 'var(--text-muted, #94a3b8)',
          border: '1px solid rgba(148, 163, 184, 0.3)'
        };
    }
  };

  const getPriorityStyle = (priority) => {
    switch (priority) {
      case 'High':
        return {
          backgroundColor: 'rgba(239, 68, 68, 0.12)',
          color: 'var(--accent-red, #f87171)',
          border: '1px solid rgba(239, 68, 68, 0.25)'
        };
      case 'Medium':
        return {
          backgroundColor: 'rgba(245, 158, 11, 0.12)',
          color: 'var(--accent-amber, #fbbf24)',
          border: '1px solid rgba(245, 158, 11, 0.25)'
        };
      default:
        return {
          backgroundColor: 'rgba(59, 130, 246, 0.12)',
          color: 'var(--accent-blue, #60a5fa)',
          border: '1px solid rgba(59, 130, 246, 0.25)'
        };
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', width: '100%', boxSizing: 'border-box' }}>
      
      {/* 1. Page Header */}
      <div 
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: '16px',
          paddingBottom: '16px',
          borderBottom: '1px solid var(--border-color, #1e293b)'
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <h1 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 700, color: 'var(--text-primary, #ffffff)', letterSpacing: '-0.02em' }}>
              Skill Gap & Improvement
            </h1>
            <span 
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
                padding: '3px 8px',
                borderRadius: '6px',
                fontSize: '11px',
                fontWeight: 600,
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                backgroundColor: 'rgba(99, 102, 241, 0.12)',
                color: 'var(--accent-blue, #818cf8)',
                border: '1px solid rgba(99, 102, 241, 0.25)'
              }}
            >
              <Sparkles size={12} />
              Explainable Analysis
            </span>
          </div>
          <p style={{ margin: '6px 0 0 0', fontSize: '0.875rem', color: 'var(--text-secondary, #94a3b8)' }}>
            Understand what skills you are missing for your target placement drive.
          </p>
        </div>

        {/* Target Drive Selector */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <label 
            htmlFor="drive-selector" 
            style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted, #64748b)' }}
          >
            Target Drive:
          </label>
          <select
            id="drive-selector"
            value={selectedDriveId}
            onChange={(e) => setSelectedDriveId(e.target.value)}
            disabled={isDrivesLoading || drivesList.length === 0}
            style={{
              backgroundColor: 'var(--bg-sidebar, #0f172a)',
              color: 'var(--text-primary, #f8fafc)',
              border: '1px solid var(--border-color, #334155)',
              borderRadius: '8px',
              padding: '6px 12px',
              fontSize: '0.875rem',
              outline: 'none',
              cursor: drivesList.length > 0 ? 'pointer' : 'default'
            }}
          >
            {isDrivesLoading ? (
              <option value="" disabled>Loading placement drives...</option>
            ) : drivesList.length > 0 ? (
              drivesList.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.company} &bull; {d.role} ({d.packageLPA})
                </option>
              ))
            ) : (
              <option value="" disabled>No placement drives available</option>
            )}
          </select>
        </div>
      </div>

      {/* 2. Student & Target Drive Context Card */}
      <div 
        style={{
          backgroundColor: 'var(--bg-card, var(--bg-sidebar, #0f172a))',
          border: '1px solid var(--border-color, #1e293b)',
          borderRadius: '12px',
          padding: '18px 24px',
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '16px'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div 
            style={{
              width: '42px',
              height: '42px',
              borderRadius: '10px',
              backgroundColor: 'rgba(99, 102, 241, 0.12)',
              color: 'var(--accent-blue, #818cf8)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <GraduationCap size={22} />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '0.9375rem', fontWeight: 700, color: 'var(--text-primary, #ffffff)' }}>
                {analysisData?.studentName || '—'}
              </span>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted, #64748b)', fontFamily: 'monospace' }}>
                ({analysisData?.studentId || '—'})
              </span>
            </div>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary, #94a3b8)' }}>
              Branch: {analysisData?.branch || '—'}
            </span>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '8px 14px', borderRadius: '8px', backgroundColor: 'rgba(30, 41, 59, 0.45)', border: '1px solid var(--border-color, #1e293b)' }}>
          <Building2 size={16} style={{ color: 'var(--accent-blue, #818cf8)' }} />
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-primary, #f1f5f9)' }}>
              {analysisData?.targetDrive?.company || '—'}
            </span>
            <span style={{ fontSize: '0.6875rem', color: 'var(--text-muted, #64748b)' }}>
              {analysisData?.targetDrive?.role || '—'} &bull; {analysisData?.targetDrive?.packageLPA || '—'}
            </span>
          </div>
        </div>
      </div>

      {/* Loading View */}
      {isLoading && (
        <div 
          style={{
            backgroundColor: 'var(--bg-card, var(--bg-sidebar, #0f172a))',
            border: '1px solid var(--border-color, #1e293b)',
            borderRadius: '12px',
            padding: '48px 24px',
            textAlign: 'center',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '12px'
          }}
        >
          <RefreshCw size={28} color="var(--accent-blue, #6366f1)" style={{ animation: 'spin 1s linear infinite' }} />
          <p style={{ margin: 0, fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-primary, #f1f5f9)' }}>
            Analyzing target drive skill requirements...
          </p>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted, #64748b)' }}>
            Comparing {DEMO_STUDENT_ID} profile against {selectedDriveId}
          </span>
        </div>
      )}

      {/* Error View */}
      {!isLoading && errorMessage && (
        <div 
          style={{
            backgroundColor: 'rgba(239, 68, 68, 0.08)',
            border: '1px solid rgba(239, 68, 68, 0.3)',
            borderRadius: '12px',
            padding: '32px 24px',
            textAlign: 'center',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '12px'
          }}
        >
          <div 
            style={{
              width: '44px',
              height: '44px',
              borderRadius: '50%',
              backgroundColor: 'rgba(239, 68, 68, 0.15)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <AlertCircle size={24} color="var(--accent-red, #f87171)" />
          </div>
          <h2 style={{ margin: 0, fontSize: '1rem', fontWeight: 600, color: '#fca5a5' }}>
            Skill Gap Service Unavailable
          </h2>
          <p style={{ margin: 0, fontSize: '0.8125rem', color: 'var(--accent-red, #f87171)', maxWidth: '460px' }}>
            {errorMessage}
          </p>
          <button
            onClick={() => fetchSkillGap(selectedDriveId)}
            style={{
              marginTop: '6px',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              backgroundColor: '#dc2626',
              color: '#ffffff',
              border: 'none',
              borderRadius: '8px',
              padding: '8px 16px',
              fontSize: '0.75rem',
              fontWeight: 600,
              cursor: 'pointer'
            }}
          >
            <RefreshCw size={13} />
            Retry Analysis
          </button>
        </div>
      )}

      {/* Loaded Analysis View */}
      {!isLoading && analysisData && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          
          {/* 4. Skill Coverage Hero Card */}
          <div 
            style={{
              backgroundColor: 'var(--bg-card, var(--bg-sidebar, #0f172a))',
              border: '1px solid var(--border-color, #1e293b)',
              borderRadius: '12px',
              padding: '24px',
              display: 'flex',
              flexWrap: 'wrap',
              gap: '24px',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}
          >
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', minWidth: '220px' }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted, #64748b)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Skill Coverage
              </span>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
                <span style={{ fontSize: '2.5rem', fontWeight: 800, color: 'var(--text-primary, #ffffff)', letterSpacing: '-0.02em', lineHeight: 1 }}>
                  {analysisData.skillCoverageScore}%
                </span>
                <span style={{ fontSize: '0.875rem', color: 'var(--text-muted, #64748b)' }}>
                  Profile Alignment
                </span>
              </div>
              <div style={{ marginTop: '4px' }}>
                <span 
                  style={{
                    display: 'inline-block',
                    padding: '4px 10px',
                    borderRadius: '6px',
                    fontSize: '0.75rem',
                    fontWeight: 600,
                    ...getSeverityStyle(analysisData.gapSeverity)
                  }}
                >
                  Gap Severity: {analysisData.gapSeverity}
                </span>
              </div>
            </div>

            <div style={{ flex: '1 1 320px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.8125rem' }}>
                <span style={{ color: 'var(--text-primary, #e2e8f0)', fontWeight: 600 }}>
                  Target Requirement Coverage
                </span>
                <span style={{ color: 'var(--text-muted, #64748b)', fontFamily: 'monospace', fontWeight: 600 }}>
                  {analysisData.skillCoverageScore}%
                </span>
              </div>

              {/* Progress Track */}
              <div 
                style={{
                  width: '100%',
                  height: '10px',
                  backgroundColor: 'rgba(30, 41, 59, 0.8)',
                  borderRadius: '999px',
                  overflow: 'hidden',
                  border: '1px solid var(--border-color, #334155)'
                }}
                role="progressbar"
                aria-valuenow={analysisData.skillCoverageScore}
                aria-valuemin="0"
                aria-valuemax="100"
                aria-label="Skill coverage score percentage"
              >
                <div 
                  style={{
                    width: `${Math.min(100, Math.max(0, analysisData.skillCoverageScore))}%`,
                    height: '100%',
                    backgroundColor: 'var(--accent-blue, #6366f1)',
                    borderRadius: '999px',
                    transition: 'width 0.4s ease-out'
                  }}
                />
              </div>

              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted, #64748b)', marginTop: '2px' }}>
                Calculated deterministically from target drive requirements versus current student skills.
              </span>
            </div>
          </div>

          {/* 5. Skills Section: Matched, Partial, and Missing Groups */}
          <div 
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
              gap: '16px'
            }}
          >
            {/* Matched Skills */}
            <div 
              style={{
                backgroundColor: 'var(--bg-card, var(--bg-sidebar, #0f172a))',
                border: '1px solid var(--border-color, #1e293b)',
                borderRadius: '12px',
                padding: '20px',
                display: 'flex',
                flexDirection: 'column',
                gap: '12px'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <div style={{ width: '24px', height: '24px', borderRadius: '6px', backgroundColor: 'rgba(16, 185, 129, 0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Check size={14} color="var(--accent-emerald, #34d399)" />
                  </div>
                  <h3 style={{ margin: 0, fontSize: '0.875rem', fontWeight: 700, color: 'var(--text-primary, #ffffff)' }}>
                    Matched Skills
                  </h3>
                </div>
                <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--accent-emerald, #34d399)' }}>
                  {analysisData.matchedSkills?.length || 0}
                </span>
              </div>

              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                {analysisData.matchedSkills && analysisData.matchedSkills.length > 0 ? (
                  analysisData.matchedSkills.map((skill, idx) => (
                    <span 
                      key={idx}
                      style={{
                        padding: '4px 10px',
                        borderRadius: '6px',
                        fontSize: '0.75rem',
                        fontWeight: 600,
                        backgroundColor: 'rgba(16, 185, 129, 0.1)',
                        color: 'var(--accent-emerald, #34d399)',
                        border: '1px solid rgba(16, 185, 129, 0.25)'
                      }}
                    >
                      {skill}
                    </span>
                  ))
                ) : (
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted, #64748b)', fontStyle: 'italic' }}>
                    No exact matching skills found.
                  </span>
                )}
              </div>
            </div>

            {/* Partial Skills */}
            <div 
              style={{
                backgroundColor: 'var(--bg-card, var(--bg-sidebar, #0f172a))',
                border: '1px solid var(--border-color, #1e293b)',
                borderRadius: '12px',
                padding: '20px',
                display: 'flex',
                flexDirection: 'column',
                gap: '12px'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <div style={{ width: '24px', height: '24px', borderRadius: '6px', backgroundColor: 'rgba(59, 130, 246, 0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Minus size={14} color="var(--accent-blue, #60a5fa)" />
                  </div>
                  <h3 style={{ margin: 0, fontSize: '0.875rem', fontWeight: 700, color: 'var(--text-primary, #ffffff)' }}>
                    Partial Skills
                  </h3>
                </div>
                <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--accent-blue, #60a5fa)' }}>
                  {analysisData.partialSkills?.length || 0}
                </span>
              </div>

              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                {analysisData.partialSkills && analysisData.partialSkills.length > 0 ? (
                  analysisData.partialSkills.map((item, idx) => (
                    <span 
                      key={idx}
                      title={item.note || ''}
                      style={{
                        padding: '4px 10px',
                        borderRadius: '6px',
                        fontSize: '0.75rem',
                        fontWeight: 600,
                        backgroundColor: 'rgba(59, 130, 246, 0.1)',
                        color: 'var(--accent-blue, #60a5fa)',
                        border: '1px solid rgba(59, 130, 246, 0.25)',
                        cursor: 'help'
                      }}
                    >
                      {item.requiredSkill || item}
                    </span>
                  ))
                ) : (
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted, #64748b)', fontStyle: 'italic' }}>
                    No partial skill equivalents detected.
                  </span>
                )}
              </div>
            </div>

            {/* Missing Skills */}
            <div 
              style={{
                backgroundColor: 'var(--bg-card, var(--bg-sidebar, #0f172a))',
                border: '1px solid var(--border-color, #1e293b)',
                borderRadius: '12px',
                padding: '20px',
                display: 'flex',
                flexDirection: 'column',
                gap: '12px'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <div style={{ width: '24px', height: '24px', borderRadius: '6px', backgroundColor: 'rgba(239, 68, 68, 0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <X size={14} color="var(--accent-red, #f87171)" />
                  </div>
                  <h3 style={{ margin: 0, fontSize: '0.875rem', fontWeight: 700, color: 'var(--text-primary, #ffffff)' }}>
                    Missing Skills
                  </h3>
                </div>
                <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--accent-red, #f87171)' }}>
                  {analysisData.missingSkills?.length || 0}
                </span>
              </div>

              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                {analysisData.missingSkills && analysisData.missingSkills.length > 0 ? (
                  analysisData.missingSkills.map((skill, idx) => (
                    <span 
                      key={idx}
                      style={{
                        padding: '4px 10px',
                        borderRadius: '6px',
                        fontSize: '0.75rem',
                        fontWeight: 600,
                        backgroundColor: 'rgba(239, 68, 68, 0.1)',
                        color: 'var(--accent-red, #f87171)',
                        border: '1px solid rgba(239, 68, 68, 0.25)'
                      }}
                    >
                      {skill}
                    </span>
                  ))
                ) : (
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted, #64748b)', fontStyle: 'italic' }}>
                    All target skills are matched.
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* 6. Priority Missing Skills */}
          <div 
            style={{
              backgroundColor: 'var(--bg-card, var(--bg-sidebar, #0f172a))',
              border: '1px solid var(--border-color, #1e293b)',
              borderRadius: '12px',
              padding: '24px'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
              <Target size={18} color="var(--accent-amber, #fbbf24)" />
              <h2 style={{ margin: 0, fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary, #ffffff)' }}>
                Priority Missing Skills
              </h2>
            </div>

            {Array.isArray(analysisData.priorityMissingSkills) && analysisData.priorityMissingSkills.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {analysisData.priorityMissingSkills.map((item, idx) => (
                  <div 
                    key={idx}
                    style={{
                      display: 'flex',
                      alignItems: 'flex-start',
                      justifyContent: 'space-between',
                      flexWrap: 'wrap',
                      gap: '12px',
                      backgroundColor: 'rgba(30, 41, 59, 0.4)',
                      border: '1px solid var(--border-color, #1e293b)',
                      borderRadius: '8px',
                      padding: '12px 16px'
                    }}
                  >
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', flex: '1 1 240px' }}>
                      <span style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--text-primary, #f1f5f9)' }}>
                        {item.skill}
                      </span>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary, #94a3b8)', lineHeight: 1.4 }}>
                        {item.reason}
                      </span>
                    </div>

                    <span 
                      style={{
                        padding: '3px 8px',
                        borderRadius: '6px',
                        fontSize: '0.6875rem',
                        fontWeight: 700,
                        textTransform: 'uppercase',
                        letterSpacing: '0.04em',
                        ...getPriorityStyle(item.priority)
                      }}
                    >
                      {item.priority} Priority
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p style={{ margin: 0, fontSize: '0.8125rem', color: 'var(--text-muted, #64748b)', fontStyle: 'italic' }}>
                No priority skill deficiencies identified for this drive.
              </p>
            )}
          </div>

          {/* 7. Personalized Recommendations */}
          <div 
            style={{
              backgroundColor: 'var(--bg-card, var(--bg-sidebar, #0f172a))',
              border: '1px solid var(--border-color, #1e293b)',
              borderRadius: '12px',
              padding: '24px'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
              <Lightbulb size={18} color="var(--accent-blue, #818cf8)" />
              <h2 style={{ margin: 0, fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary, #ffffff)' }}>
                Personalized Recommendations
              </h2>
            </div>

            {Array.isArray(analysisData.recommendations) && analysisData.recommendations.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {analysisData.recommendations.map((rec, idx) => (
                  <div 
                    key={idx}
                    style={{
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: '12px',
                      backgroundColor: 'rgba(30, 41, 59, 0.35)',
                      border: '1px solid var(--border-color, #1e293b)',
                      borderRadius: '8px',
                      padding: '12px 14px'
                    }}
                  >
                    <span 
                      style={{
                        width: '22px',
                        height: '22px',
                        borderRadius: '50%',
                        backgroundColor: 'rgba(99, 102, 241, 0.15)',
                        color: 'var(--accent-blue, #818cf8)',
                        fontSize: '11px',
                        fontWeight: 700,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0
                      }}
                    >
                      {idx + 1}
                    </span>
                    <span style={{ fontSize: '0.8125rem', color: 'var(--text-secondary, #cbd5e1)', lineHeight: 1.5 }}>
                      {rec}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p style={{ margin: 0, fontSize: '0.8125rem', color: 'var(--text-muted, #64748b)', fontStyle: 'italic' }}>
                No active recommendations queued.
              </p>
            )}
          </div>

          {/* 8. 7-Day Action Plan */}
          <div 
            style={{
              backgroundColor: 'var(--bg-card, var(--bg-sidebar, #0f172a))',
              border: '1px solid var(--border-color, #1e293b)',
              borderRadius: '12px',
              padding: '24px'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
              <Calendar size={18} color="var(--accent-blue, #818cf8)" />
              <h2 style={{ margin: 0, fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary, #ffffff)' }}>
                7-Day Action Plan
              </h2>
            </div>

            {Array.isArray(analysisData.actionPlan) && analysisData.actionPlan.length > 0 ? (
              <div 
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
                  gap: '12px'
                }}
              >
                {analysisData.actionPlan.map((planItem) => (
                  <div 
                    key={planItem.day}
                    style={{
                      backgroundColor: 'rgba(30, 41, 59, 0.4)',
                      border: '1px solid var(--border-color, #1e293b)',
                      borderRadius: '8px',
                      padding: '14px',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '8px'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--accent-blue, #818cf8)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                        Day {planItem.day}
                      </span>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--text-muted, #64748b)', fontSize: '0.6875rem' }}>
                        <Clock size={12} />
                        <span>{planItem.estimatedMinutes}m</span>
                      </div>
                    </div>

                    <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-primary, #f1f5f9)' }}>
                      {planItem.focus}
                    </span>

                    <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--text-secondary, #94a3b8)', lineHeight: 1.45 }}>
                      {planItem.action}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <p style={{ margin: 0, fontSize: '0.8125rem', color: 'var(--text-muted, #64748b)', fontStyle: 'italic' }}>
                No action plan available.
              </p>
            )}
          </div>

          {/* 9. What-If Simulation */}
          <div 
            style={{
              backgroundColor: 'var(--bg-card, var(--bg-sidebar, #0f172a))',
              border: '1px solid var(--border-color, #1e293b)',
              borderRadius: '12px',
              padding: '24px',
              display: 'flex',
              flexDirection: 'column',
              gap: '16px'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <TrendingUp size={18} color="var(--accent-emerald, #34d399)" />
                <h2 style={{ margin: 0, fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary, #ffffff)' }}>
                  {analysisData.whatIfSimulation?.label || 'Prototype What-if Simulation'}
                </h2>
              </div>
              <span 
                style={{
                  fontSize: '0.6875rem',
                  fontWeight: 600,
                  textTransform: 'uppercase',
                  padding: '2px 8px',
                  borderRadius: '4px',
                  backgroundColor: 'rgba(99, 102, 241, 0.1)',
                  color: 'var(--accent-blue, #818cf8)'
                }}
              >
                Simulation Only
              </span>
            </div>

            <div 
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                gap: '16px'
              }}
            >
              {/* Current Coverage Box */}
              <div style={{ padding: '16px', borderRadius: '8px', backgroundColor: 'rgba(30, 41, 59, 0.45)', border: '1px solid var(--border-color, #1e293b)' }}>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted, #64748b)', fontWeight: 600 }}>
                  Current Skill Coverage
                </span>
                <div style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-primary, #ffffff)', marginTop: '4px' }}>
                  {analysisData.whatIfSimulation?.currentSkillCoverage}%
                </div>
              </div>

              {/* Assumed Added Skills */}
              <div style={{ padding: '16px', borderRadius: '8px', backgroundColor: 'rgba(30, 41, 59, 0.45)', border: '1px solid var(--border-color, #1e293b)' }}>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted, #64748b)', fontWeight: 600 }}>
                  Assumed Skills Added
                </span>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '8px' }}>
                  {analysisData.whatIfSimulation?.assumedSkillsAdded && analysisData.whatIfSimulation.assumedSkillsAdded.length > 0 ? (
                    analysisData.whatIfSimulation.assumedSkillsAdded.map((skill, idx) => (
                      <span 
                        key={idx}
                        style={{
                          padding: '2px 8px',
                          borderRadius: '4px',
                          fontSize: '0.6875rem',
                          fontWeight: 600,
                          backgroundColor: 'rgba(99, 102, 241, 0.15)',
                          color: 'var(--accent-blue, #818cf8)'
                        }}
                      >
                        +{skill}
                      </span>
                    ))
                  ) : (
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted, #64748b)' }}>None required</span>
                  )}
                </div>
              </div>

              {/* Projected Coverage */}
              <div style={{ padding: '16px', borderRadius: '8px', backgroundColor: 'rgba(16, 185, 129, 0.08)', border: '1px solid rgba(16, 185, 129, 0.25)' }}>
                <span style={{ fontSize: '0.75rem', color: 'var(--accent-emerald, #34d399)', fontWeight: 600 }}>
                  Projected Skill Coverage
                </span>
                <div style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--accent-emerald, #34d399)', marginTop: '4px' }}>
                  {analysisData.whatIfSimulation?.projectedSkillCoverage}%
                </div>
              </div>
            </div>

            <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--text-secondary, #94a3b8)', lineHeight: 1.5 }}>
              {analysisData.whatIfSimulation?.explanation}
            </p>
          </div>

          {/* 10. Disclaimer Banner */}
          <div 
            style={{
              padding: '14px 18px',
              borderRadius: '8px',
              backgroundColor: 'rgba(15, 23, 42, 0.6)',
              border: '1px solid var(--border-color, #1e293b)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '10px',
              textAlign: 'center'
            }}
          >
            <ShieldAlert size={16} color="var(--text-muted, #64748b)" style={{ flexShrink: 0 }} />
            <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--text-muted, #64748b)', lineHeight: 1.5 }}>
              {analysisData.disclaimer || 'This readiness analysis is a deterministic prototype recommendation derived from available student profile attributes and placement drive criteria. It does not predict or guarantee hiring outcomes.'}
            </p>
          </div>

        </div>
      )}
    </div>
  );
}