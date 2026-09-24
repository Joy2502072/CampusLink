import React from 'react';
import { Award } from 'lucide-react';

export default function BranchConversionChart({ data }) {
  const maxTotal = Math.max(...data.map(d => d.total));

  return (
    <div style={{
      backgroundColor: 'var(--bg-card)',
      border: '1px solid var(--border-color)',
      borderRadius: '14px',
      padding: '22px',
      display: 'flex',
      flexDirection: 'column',
      height: '100%'
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '18px', gap: '12px' }}>
        <div>
          <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#ffffff' }}>
            Branch-wise Placement Rate
          </h3>
          <p style={{ fontSize: '0.76rem', color: 'var(--text-muted)' }}>
            Static conversion comparison across 6 academic departments
          </p>
        </div>
        <span style={{
          fontSize: '0.68rem',
          padding: '3px 8px',
          borderRadius: '4px',
          backgroundColor: 'rgba(255, 255, 255, 0.06)',
          color: 'var(--text-secondary)',
          fontWeight: 600,
          whiteSpace: 'nowrap'
        }}>
          Mock Dataset
        </span>
      </div>

      {/* Visual Bar Breakdown */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', flex: 1, justifyContent: 'center' }}>
        {data.map((item) => {
          const totalWidth = (item.total / maxTotal) * 100;
          const placedRatio = (item.placed / item.total) * 100;

          return (
            <div key={item.branch} style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', fontWeight: 600 }}>
                <span style={{ color: '#ffffff', width: '50px' }}>{item.branch}</span>
                <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>
                  <strong style={{ color: 'var(--text-primary)' }}>{item.placed}</strong> / {item.total} Placed
                </span>
                <span style={{ color: 'var(--accent-blue)', fontWeight: 700, width: '48px', textAlign: 'right' }}>
                  {item.rate.toFixed(1)}%
                </span>
              </div>

              <div
                role="progressbar"
                aria-valuenow={item.placed}
                aria-valuemin={0}
                aria-valuemax={item.total}
                aria-label={`${item.branch} placement progress`}
                style={{
                  height: '8px',
                  backgroundColor: 'rgba(255, 255, 255, 0.05)',
                  borderRadius: '9999px',
                  overflow: 'hidden',
                  position: 'relative'
                }}
              >
                <div
                  style={{
                    height: '100%',
                    width: `${totalWidth}%`,
                    backgroundColor: 'rgba(59, 130, 246, 0.2)',
                    borderRadius: '9999px',
                    position: 'relative'
                  }}
                >
                  <div
                    style={{
                      height: '100%',
                      width: `${placedRatio}%`,
                      background: 'linear-gradient(90deg, #3b82f6, #60a5fa)',
                      borderRadius: '9999px'
                    }}
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div style={{
        marginTop: '18px',
        paddingTop: '12px',
        borderTop: '1px solid var(--border-color)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        fontSize: '0.72rem',
        color: 'var(--text-muted)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#3b82f6' }} />
          <span>Placed Proportion</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--accent-emerald)' }}>
          <Award size={13} aria-hidden="true" />
          <span>CSE leads demo metrics (86.1%)</span>
        </div>
      </div>
    </div>
  );
}