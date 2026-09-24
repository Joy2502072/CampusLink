import React from 'react';
import { Info } from 'lucide-react';

export default function RiskDistribution({ students }) {
  const total = students.length || 1;
  const high = students.filter(s => s.riskLevel === 'High').length;
  const medium = students.filter(s => s.riskLevel === 'Medium').length;
  const low = students.filter(s => s.riskLevel === 'Low').length;

  const highPct = ((high / total) * 100).toFixed(1);
  const medPct = ((medium / total) * 100).toFixed(1);
  const lowPct = ((low / total) * 100).toFixed(1);

  return (
    <div style={{
      backgroundColor: 'var(--bg-card)',
      border: '1px solid var(--border-color)',
      borderRadius: '14px',
      padding: '20px',
      display: 'flex',
      flexDirection: 'column',
      gap: '14px'
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
        <div>
          <h3 style={{ fontSize: '0.98rem', fontWeight: 700, color: '#ffffff' }}>
            Cohort Risk Profile Distribution
          </h3>
          <p style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>
            Proportional breakdown of monitored cohort across prototype risk bands
          </p>
        </div>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          fontSize: '0.72rem',
          color: 'var(--text-secondary)',
          backgroundColor: 'rgba(255, 255, 255, 0.04)',
          padding: '4px 10px',
          borderRadius: '6px'
        }}>
          <Info size={13} aria-hidden="true" />
          <span>Total Sample: {total} Students</span>
        </div>
      </div>

      <div
        role="progressbar"
        aria-label="Risk level distribution bar"
        aria-valuemin={0}
        aria-valuemax={100}
        style={{
          display: 'flex',
          height: '14px',
          borderRadius: '9999px',
          overflow: 'hidden',
          backgroundColor: 'rgba(255, 255, 255, 0.06)',
          width: '100%',
          gap: '2px'
        }}
      >
        <div
          title={`High Risk: ${high} (${highPct}%)`}
          style={{
            width: `${highPct}%`,
            backgroundColor: 'var(--accent-rose)',
            transition: 'width 0.3s ease'
          }}
        />
        <div
          title={`Medium Risk: ${medium} (${medPct}%)`}
          style={{
            width: `${medPct}%`,
            backgroundColor: 'var(--accent-amber)',
            transition: 'width 0.3s ease'
          }}
        />
        <div
          title={`Low Risk: ${low} (${lowPct}%)`}
          style={{
            width: `${lowPct}%`,
            backgroundColor: 'var(--accent-emerald)',
            transition: 'width 0.3s ease'
          }}
        />
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
        gap: '12px',
        paddingTop: '6px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: 'var(--accent-rose)' }} />
          <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
            High Risk: <strong style={{ color: '#ffffff' }}>{high}</strong> ({highPct}%)
          </span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: 'var(--accent-amber)' }} />
          <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
            Medium Risk: <strong style={{ color: '#ffffff' }}>{medium}</strong> ({medPct}%)
          </span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: 'var(--accent-emerald)' }} />
          <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
            Low Risk: <strong style={{ color: '#ffffff' }}>{low}</strong> ({lowPct}%)
          </span>
        </div>
      </div>
    </div>
  );
}