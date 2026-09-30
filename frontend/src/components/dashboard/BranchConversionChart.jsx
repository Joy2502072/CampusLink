import React from 'react';
import { Award, Database } from 'lucide-react';

export default function BranchConversionChart({ data, loading }) {
  if (loading) {
    return (
      <div
        style={{
          backgroundColor: 'var(--bg-card, #0f172a)',
          border: '1px solid var(--border-color, #1e293b)',
          borderRadius: '12px',
          padding: '24px',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '320px'
        }}
      >
        <span style={{ color: 'var(--text-muted, #64748b)', fontSize: '0.875rem' }}>
          Loading branch analytics...
        </span>
      </div>
    );
  }

  const branches = Array.isArray(data) ? data : [];

  return (
    <div
      style={{
        backgroundColor: 'var(--bg-card, #0f172a)',
        border: '1px solid var(--border-color, #1e293b)',
        borderRadius: '12px',
        padding: '24px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        gap: '20px',
        boxSizing: 'border-box'
      }}
    >
      {/* Header */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px', marginBottom: '6px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Award size={18} color="var(--accent-blue, #6366f1)" />
            <h2 style={{ margin: 0, fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary, #ffffff)', letterSpacing: '-0.01em' }}>
              Branch Conversion Comparison
            </h2>
          </div>

          <span
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px',
              padding: '2px 8px',
              borderRadius: '6px',
              fontSize: '10px',
              fontWeight: 600,
              textTransform: 'uppercase',
              letterSpacing: '0.04em',
              backgroundColor: 'rgba(99, 102, 241, 0.12)',
              color: 'var(--accent-blue, #818cf8)',
              border: '1px solid rgba(99, 102, 241, 0.25)'
            }}
          >
            <Database size={10} />
            LIVE ANALYTICS
          </span>
        </div>

        <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--text-secondary, #94a3b8)' }}>
          Placement conversion rates and average packages across engineering departments
        </p>
      </div>

      {/* Department Conversion Progress Bars */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
        {branches.length > 0 ? (
          branches.map((b) => {
            const rate = Number(b.placementRate ?? 0);
            const total = Number(b.totalStudents ?? 0);
            const placed = Number(b.placedStudents ?? 0);
            const avgPkg = b.averagePackageLPA || '0 LPA';

            return (
              <div key={b.branch} style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.8125rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span style={{ color: 'var(--text-primary, #f1f5f9)', fontWeight: 600 }}>
                      {b.branch}
                    </span>
                    <span style={{ color: 'var(--text-muted, #64748b)', fontSize: '0.75rem' }}>
                      ({placed}/{total} placed)
                    </span>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span style={{ color: 'var(--text-secondary, #94a3b8)', fontSize: '0.75rem' }}>
                      Avg: <strong style={{ color: 'var(--text-primary, #e2e8f0)' }}>{avgPkg}</strong>
                    </span>
                    <span
                      style={{
                        color: 'var(--accent-blue, #818cf8)',
                        fontWeight: 700,
                        fontFamily: 'monospace',
                        minWidth: '46px',
                        textAlign: 'right'
                      }}
                    >
                      {rate}%
                    </span>
                  </div>
                </div>

                <div
                  style={{
                    width: '100%',
                    height: '8px',
                    backgroundColor: 'rgba(30, 41, 59, 0.8)',
                    borderRadius: '999px',
                    overflow: 'hidden'
                  }}
                  role="progressbar"
                  aria-valuenow={rate}
                  aria-valuemin={0}
                  aria-valuemax={100}
                  aria-label={`${b.branch} placement rate: ${rate}%`}
                >
                  <div
                    style={{
                      width: `${Math.min(rate, 100)}%`,
                      height: '100%',
                      backgroundColor: 'var(--accent-blue, #6366f1)',
                      borderRadius: '999px',
                      transition: 'width 0.4s ease-out'
                    }}
                  />
                </div>
              </div>
            );
          })
        ) : (
          <p style={{ margin: 0, fontSize: '0.8125rem', color: 'var(--text-muted, #64748b)', fontStyle: 'italic' }}>
            No branch placement data available.
          </p>
        )}
      </div>

      {/* Footer Benchmark Note */}
      <div
        style={{
          paddingTop: '12px',
          borderTop: '1px solid var(--border-color, #1e293b)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          fontSize: '0.75rem',
          color: 'var(--text-muted, #64748b)'
        }}
      >
        <span>Ranked by placement conversion rate</span>
        <span>{branches.length} departments recorded</span>
      </div>
    </div>
  );
}