import React, { useState, useEffect, useCallback } from 'react';
import {
  GraduationCap,
  TrendingUp,
  Award,
  BookOpen,
  MessageSquare,
  Briefcase,
  AlertTriangle,
  RefreshCw,
  Database,
  CheckCircle2,
  ChevronRight
} from 'lucide-react';

const API_BASE_URL = 'http://localhost:5000/api';
const DEFAULT_STUDENT_ID = 'DEMO-STU-001';

const AUTH_HEADERS = {
  'Content-Type': 'application/json',
  'X-Demo-User-Role': 'placement_officer'
};

export default function StudentReadiness({ studentId = DEFAULT_STUDENT_ID }) {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [readinessData, setReadinessData] = useState(null);

  const fetchReadiness = useCallback(async () => {
    setError(null);
    try {
      const response = await fetch(`${API_BASE_URL}/readiness/${studentId}`, {
        headers: AUTH_HEADERS
      });

      if (!response.ok) {
        throw new Error(`Failed to load readiness evaluation (HTTP ${response.status})`);
      }

      const resJson = await response.json();
      setReadinessData(resJson.data || resJson);
    } catch (err) {
      setError(err.message || 'Error occurred while loading student readiness.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [studentId]);

  useEffect(() => {
    fetchReadiness();
  }, [fetchReadiness]);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchReadiness();
  };

  const totalScore = readinessData?.totalScore ?? readinessData?.readinessScore ?? 0;
  const readinessBand = readinessData?.readinessBand ?? 'Developing';
  const dimensions = readinessData?.dimensions || {};
  const rawMetrics = readinessData?.rawMetrics || {};
  const riskProfile = readinessData?.riskProfile || {};

  const getBandBadge = (band) => {
    switch (band) {
      case 'Ready':
        return { color: '#10b981', bg: 'rgba(16, 185, 129, 0.12)', border: 'rgba(16, 185, 129, 0.3)' };
      case 'Proficient':
        return { color: '#3b82f6', bg: 'rgba(59, 130, 246, 0.12)', border: 'rgba(59, 130, 246, 0.3)' };
      case 'Developing':
        return { color: '#f59e0b', bg: 'rgba(245, 158, 11, 0.12)', border: 'rgba(245, 158, 11, 0.3)' };
      default:
        return { color: '#ef4444', bg: 'rgba(239, 68, 68, 0.12)', border: 'rgba(239, 68, 68, 0.3)' };
    }
  };

  const bandStyle = getBandBadge(readinessBand);

  if (loading) {
    return (
      <div style={{ padding: '48px', textAlign: 'center', color: 'var(--text-muted, #64748b)' }}>
        <RefreshCw size={24} style={{ animation: 'spin 1s linear infinite', margin: '0 auto 12px' }} />
        <p style={{ margin: 0, fontSize: '0.875rem' }}>Evaluating placement readiness from MySQL...</p>
      </div>
    );
  }

  return (
    <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <h1 style={{ margin: 0, fontSize: '1.65rem', fontWeight: 800, color: 'var(--text-primary, #ffffff)', letterSpacing: '-0.02em' }}>
              Student Placement Readiness
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
                color: '#10b981',
                border: '1px solid rgba(16, 185, 129, 0.25)'
              }}
            >
              <Database size={12} />
              Live MySQL Data
            </span>
          </div>
          <p style={{ margin: '6px 0 0 0', fontSize: '0.875rem', color: 'var(--text-secondary, #94a3b8)' }}>
            Comprehensive institutional readiness diagnostics computed across academics, technical stack, and engagement
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
          {refreshing ? 'Evaluating...' : 'Refresh Score'}
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

      {/* Hero Overview Card */}
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
          <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary, #94a3b8)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Overall Placement Readiness
          </span>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '10px', marginTop: '6px' }}>
            <span style={{ fontSize: '3rem', fontWeight: 800, color: '#f8fafc', fontFamily: 'monospace' }}>
              {totalScore}
            </span>
            <span style={{ fontSize: '1rem', color: '#64748b' }}>/ 100</span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '12px' }}>
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                padding: '4px 12px',
                borderRadius: '999px',
                fontSize: '12px',
                fontWeight: 700,
                backgroundColor: bandStyle.bg,
                color: bandStyle.color,
                border: `1px solid ${bandStyle.border}`
              }}
            >
              {readinessBand}
            </span>
            <span style={{ fontSize: '0.8125rem', color: '#94a3b8' }}>
              Student ID: <strong style={{ color: '#cbd5e1', fontFamily: 'monospace' }}>{studentId}</strong>
            </span>
          </div>
        </div>

        {/* Dimension Progress Trackers */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8125rem', marginBottom: '4px', color: '#cbd5e1' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <BookOpen size={14} color="#6366f1" /> Academics (CGPA: {Number(rawMetrics.cgpa || 0).toFixed(2)})
              </span>
              <span><strong>{dimensions.academics || 0}</strong> / 25</span>
            </div>
            <div style={{ height: '7px', backgroundColor: '#1e293b', borderRadius: '999px', overflow: 'hidden' }}>
              <div style={{ width: `${((dimensions.academics || 0) / 25) * 100}%`, height: '100%', backgroundColor: '#6366f1' }} />
            </div>
          </div>

          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8125rem', marginBottom: '4px', color: '#cbd5e1' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Award size={14} color="#10b981" /> Technical Skills ({rawMetrics.skillsCount || 0} verified)
              </span>
              <span><strong>{dimensions.technicalSkills || 0}</strong> / 30</span>
            </div>
            <div style={{ height: '7px', backgroundColor: '#1e293b', borderRadius: '999px', overflow: 'hidden' }}>
              <div style={{ width: `${((dimensions.technicalSkills || 0) / 30) * 100}%`, height: '100%', backgroundColor: '#10b981' }} />
            </div>
          </div>

          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8125rem', marginBottom: '4px', color: '#cbd5e1' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <MessageSquare size={14} color="#f59e0b" /> Communication Benchmark
              </span>
              <span><strong>{dimensions.communication || 0}</strong> / 25</span>
            </div>
            <div style={{ height: '7px', backgroundColor: '#1e293b', borderRadius: '999px', overflow: 'hidden' }}>
              <div style={{ width: `${((dimensions.communication || 0) / 25) * 100}%`, height: '100%', backgroundColor: '#f59e0b' }} />
            </div>
          </div>

          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8125rem', marginBottom: '4px', color: '#cbd5e1' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Briefcase size={14} color="#3b82f6" /> Projects & Certifications
              </span>
              <span><strong>{dimensions.practicalExperience || 0}</strong> / 20</span>
            </div>
            <div style={{ height: '7px', backgroundColor: '#1e293b', borderRadius: '999px', overflow: 'hidden' }}>
              <div style={{ width: `${((dimensions.practicalExperience || 0) / 20) * 100}%`, height: '100%', backgroundColor: '#3b82f6' }} />
            </div>
          </div>
        </div>
      </div>

      {/* Detailed Diagnostics Grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(420px, 1fr))',
          gap: '20px'
        }}
      >
        {/* Identified Observations & Drivers */}
        <div
          style={{
            backgroundColor: 'var(--bg-card, #0f172a)',
            border: '1px solid var(--border-color, #1e293b)',
            borderRadius: '12px',
            padding: '24px',
            display: 'flex',
            flexDirection: 'column',
            gap: '14px'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <TrendingUp size={18} color="#818cf8" />
            <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 700, color: '#f1f5f9' }}>
              Readiness Observations
            </h3>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {riskProfile.reasons && riskProfile.reasons.length > 0 ? (
              riskProfile.reasons.map((r, i) => (
                <div
                  key={i}
                  style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '10px',
                    padding: '10px 12px',
                    backgroundColor: 'rgba(30, 41, 59, 0.4)',
                    borderRadius: '8px',
                    border: '1px solid #334155'
                  }}
                >
                  <span style={{ color: '#818cf8', fontWeight: 700 }}>•</span>
                  <span style={{ fontSize: '0.8125rem', color: '#cbd5e1', lineHeight: '1.4' }}>{r}</span>
                </div>
              ))
            ) : (
              <p style={{ fontSize: '0.8125rem', color: '#94a3b8', margin: 0 }}>
                {riskProfile.mainReason || 'Candidate meets institutional baseline readiness parameters.'}
              </p>
            )}
          </div>
        </div>

        {/* Action & Remediation Guidance */}
        <div
          style={{
            backgroundColor: 'var(--bg-card, #0f172a)',
            border: '1px solid var(--border-color, #1e293b)',
            borderRadius: '12px',
            padding: '24px',
            display: 'flex',
            flexDirection: 'column',
            gap: '14px'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <CheckCircle2 size={18} color="#10b981" />
            <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 700, color: '#f1f5f9' }}>
              Remediation Action Plan
            </h3>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {riskProfile.actions && riskProfile.actions.length > 0 ? (
              riskProfile.actions.map((a, i) => (
                <div
                  key={i}
                  style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '10px',
                    padding: '10px 12px',
                    backgroundColor: 'rgba(16, 185, 129, 0.08)',
                    borderRadius: '8px',
                    border: '1px solid rgba(16, 185, 129, 0.25)'
                  }}
                >
                  <ChevronRight size={14} color="#10b981" style={{ marginTop: '2px', flexShrink: 0 }} />
                  <span style={{ fontSize: '0.8125rem', color: '#cbd5e1', lineHeight: '1.4' }}>{a}</span>
                </div>
              ))
            ) : (
              <p style={{ fontSize: '0.8125rem', color: '#94a3b8', margin: 0 }}>
                {riskProfile.recommendedAction || 'Maintain standard candidate preparation tracks for upcoming recruitment drives.'}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}