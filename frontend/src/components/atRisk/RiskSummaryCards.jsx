import React from 'react';
import { AlertTriangle, AlertCircle, ShieldAlert, Users } from 'lucide-react';

export default function RiskSummaryCards({ students = [] }) {
  const safeStudents = Array.isArray(students) ? students : [];

  const totalFlagged = safeStudents.length;
  const highRiskCount = safeStudents.filter(
    (s) => (s?.riskLevel || '').toLowerCase() === 'high risk'
  ).length;
  const mediumRiskCount = safeStudents.filter(
    (s) => (s?.riskLevel || '').toLowerCase() === 'medium risk' || (s?.riskLevel || '').toLowerCase() === 'moderate risk'
  ).length;
  const lowRiskCount = safeStudents.filter(
    (s) => (s?.riskLevel || '').toLowerCase() === 'low risk'
  ).length;

  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))',
        gap: '16px'
      }}
    >
      {/* Total Flagged Candidates */}
      <div
        style={{
          padding: '20px',
          backgroundColor: 'var(--bg-card, #0f172a)',
          borderRadius: '12px',
          border: '1px solid var(--border-color, #1e293b)',
          display: 'flex',
          flexDirection: 'column',
          gap: '8px'
        }}
      >
        <span
          style={{
            fontSize: '0.75rem',
            fontWeight: 600,
            color: '#94a3b8',
            textTransform: 'uppercase',
            letterSpacing: '0.04em'
          }}
        >
          Total Flagged Candidates
        </span>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
          <span style={{ fontSize: '2rem', fontWeight: 800, color: '#f8fafc', fontFamily: 'monospace' }}>
            {totalFlagged}
          </span>
          <span style={{ fontSize: '0.75rem', color: '#64748b' }}>active in queue</span>
        </div>
        <span style={{ fontSize: '0.75rem', color: '#818cf8', display: 'flex', alignItems: 'center', gap: '4px' }}>
          <Users size={12} /> Monitoring pool
        </span>
      </div>

      {/* High Risk Critical */}
      <div
        style={{
          padding: '20px',
          backgroundColor: 'var(--bg-card, #0f172a)',
          borderRadius: '12px',
          border: '1px solid rgba(239, 68, 68, 0.3)',
          display: 'flex',
          flexDirection: 'column',
          gap: '8px'
        }}
      >
        <span
          style={{
            fontSize: '0.75rem',
            fontWeight: 600,
            color: '#f87171',
            textTransform: 'uppercase',
            letterSpacing: '0.04em'
          }}
        >
          High Risk (Urgent)
        </span>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
          <span style={{ fontSize: '2rem', fontWeight: 800, color: '#ef4444', fontFamily: 'monospace' }}>
            {highRiskCount}
          </span>
          <span style={{ fontSize: '0.75rem', color: '#64748b' }}>candidates</span>
        </div>
        <span style={{ fontSize: '0.75rem', color: '#f87171', display: 'flex', alignItems: 'center', gap: '4px' }}>
          <ShieldAlert size={12} /> Priority 1 mentoring
        </span>
      </div>

      {/* Medium Risk */}
      <div
        style={{
          padding: '20px',
          backgroundColor: 'var(--bg-card, #0f172a)',
          borderRadius: '12px',
          border: '1px solid rgba(245, 158, 11, 0.3)',
          display: 'flex',
          flexDirection: 'column',
          gap: '8px'
        }}
      >
        <span
          style={{
            fontSize: '0.75rem',
            fontWeight: 600,
            color: '#fbbf24',
            textTransform: 'uppercase',
            letterSpacing: '0.04em'
          }}
        >
          Medium Risk
        </span>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
          <span style={{ fontSize: '2rem', fontWeight: 800, color: '#f59e0b', fontFamily: 'monospace' }}>
            {mediumRiskCount}
          </span>
          <span style={{ fontSize: '0.75rem', color: '#64748b' }}>candidates</span>
        </div>
        <span style={{ fontSize: '0.75rem', color: '#fbbf24', display: 'flex', alignItems: 'center', gap: '4px' }}>
          <AlertTriangle size={12} /> Interview round alerts
        </span>
      </div>

      {/* Low Risk */}
      <div
        style={{
          padding: '20px',
          backgroundColor: 'var(--bg-card, #0f172a)',
          borderRadius: '12px',
          border: '1px solid var(--border-color, #1e293b)',
          display: 'flex',
          flexDirection: 'column',
          gap: '8px'
        }}
      >
        <span
          style={{
            fontSize: '0.75rem',
            fontWeight: 600,
            color: '#94a3b8',
            textTransform: 'uppercase',
            letterSpacing: '0.04em'
          }}
        >
          Low Risk / Watchlist
        </span>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
          <span style={{ fontSize: '2rem', fontWeight: 800, color: '#60a5fa', fontFamily: 'monospace' }}>
            {lowRiskCount}
          </span>
          <span style={{ fontSize: '0.75rem', color: '#64748b' }}>candidates</span>
        </div>
        <span style={{ fontSize: '0.75rem', color: '#60a5fa', display: 'flex', alignItems: 'center', gap: '4px' }}>
          <AlertCircle size={12} /> Regular tracking
        </span>
      </div>
    </div>
  );
}