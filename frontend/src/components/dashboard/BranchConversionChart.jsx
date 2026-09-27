import React from 'react';
import { BarChart3, Database } from 'lucide-react';

export default function BranchConversionChart({ data }) {
  const branches = Array.isArray(data) ? data : [];

  return (
    <div
      style={{
        backgroundColor: 'var(--bg-card, var(--bg-sidebar, #0f172a))',
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
            <BarChart3 size={18} color="var(--accent-blue, #818cf8)" />
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
            Mock Dataset
          </span>
        </div>

        <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--text-secondary, #94a3b8)' }}>
          Backend conversion comparison across academic departments
        </p>
      </div>

      {/* Chart Bars List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
        {branches.length > 0 ? (
          branches.map((item, idx) => {
            const branchName = item.branch || item.name || `Branch ${idx + 1}`;
            const rate = Number(item.placementRate ?? item.rate ?? 0);
            const clampedRate = Math.min(100, Math.max(0, rate));

            return (
              <div key={branchName} style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.8125rem' }}>
                  <span style={{ color: 'var(--text-primary, #f1f5f9)', fontWeight: 600 }}>
                    {branchName}
                  </span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    {item.averagePackageLPA && (
                      <span style={{ color: 'var(--text-muted, #64748b)', fontSize: '0.75rem' }}>
                        Avg: {item.averagePackageLPA}
                      </span>
                    )}
                    <span style={{ color: 'var(--accent-blue, #818cf8)', fontWeight: 700, fontFamily: 'monospace' }}>
                      {clampedRate}%
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
                  aria-valuenow={clampedRate}
                  aria-valuemin="0"
                  aria-valuemax="100"
                  aria-label={`${branchName} placement rate`}
                >
                  <div
                    style={{
                      width: `${clampedRate}%`,
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
            No branch conversion metrics available.
          </p>
        )}
      </div>

      {/* Footer Meta */}
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
        <span>Placement rates shown from backend analytics data</span>
        <span>Goal: 70%</span>
      </div>
    </div>
  );
}