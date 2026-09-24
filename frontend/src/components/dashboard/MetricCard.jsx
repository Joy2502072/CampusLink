import React from 'react';

export default function MetricCard({ title, value, subtext, icon: Icon, trend, colorScheme = 'blue' }) {
  const colors = {
    blue: { bg: 'var(--accent-blue-soft)', border: 'rgba(59, 130, 246, 0.3)', text: 'var(--accent-blue)' },
    emerald: { bg: 'var(--accent-emerald-soft)', border: 'rgba(16, 185, 129, 0.3)', text: 'var(--accent-emerald)' },
    violet: { bg: 'var(--accent-violet-soft)', border: 'rgba(139, 92, 246, 0.3)', text: 'var(--accent-violet)' },
    amber: { bg: 'var(--accent-amber-soft)', border: 'rgba(245, 158, 11, 0.3)', text: 'var(--accent-amber)' },
  };

  const scheme = colors[colorScheme] || colors.blue;

  return (
    <div style={{
      backgroundColor: 'var(--bg-card)',
      border: '1px solid var(--border-color)',
      borderRadius: '14px',
      padding: '20px',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'space-between',
      position: 'relative',
      overflow: 'hidden'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
        <span style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          {title}
        </span>
        <div style={{
          width: '36px',
          height: '36px',
          borderRadius: '8px',
          backgroundColor: scheme.bg,
          border: `1px solid ${scheme.border}`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: scheme.text
        }}>
          <Icon size={18} aria-hidden="true" />
        </div>
      </div>

      <div>
        <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#ffffff', letterSpacing: '-0.03em' }}>
          {value}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '6px', flexWrap: 'wrap' }}>
          {trend && (
            <span style={{
              fontSize: '0.72rem',
              fontWeight: 700,
              color: 'var(--accent-emerald)',
              backgroundColor: 'var(--accent-emerald-soft)',
              padding: '2px 6px',
              borderRadius: '4px'
            }}>
              {trend}
            </span>
          )}
          <span style={{ fontSize: '0.76rem', color: 'var(--text-muted)' }}>
            {subtext}
          </span>
        </div>
      </div>
    </div>
  );
}