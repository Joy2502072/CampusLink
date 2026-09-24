import React from 'react';
import { CheckCircle2, Tag } from 'lucide-react';

export default function RecentActivities({ activities }) {
  return (
    <div style={{
      backgroundColor: 'var(--bg-card)',
      border: '1px solid var(--border-color)',
      borderRadius: '14px',
      padding: '22px',
      display: 'flex',
      flexDirection: 'column'
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px', gap: '12px' }}>
        <div>
          <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#ffffff' }}>Recent Placement Activity</h3>
          <p style={{ fontSize: '0.76rem', color: 'var(--text-muted)' }}>Synthesized mock offers and shortlists</p>
        </div>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '4px',
          fontSize: '0.7rem',
          color: 'var(--text-muted)',
          backgroundColor: 'rgba(255, 255, 255, 0.04)',
          padding: '2px 8px',
          borderRadius: '4px'
        }}>
          <Tag size={12} aria-hidden="true" />
          <span>Demo Feed</span>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {activities.map((act) => (
          <div
            key={act.id}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '10px 12px',
              borderRadius: '8px',
              backgroundColor: 'rgba(255, 255, 255, 0.02)',
              border: '1px solid var(--border-color)',
              gap: '12px'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{
                width: '30px',
                height: '30px',
                borderRadius: '50%',
                backgroundColor: 'var(--accent-emerald-soft)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--accent-emerald)',
                flexShrink: 0
              }}>
                <CheckCircle2 size={15} aria-hidden="true" />
              </div>
              <div>
                <div style={{ fontSize: '0.82rem', fontWeight: 700, color: '#ffffff' }}>
                  {act.studentName}{' '}
                  <span style={{ fontSize: '0.7rem', fontWeight: 500, color: 'var(--text-muted)' }}>
                    [{act.syntheticId} • {act.branch}]
                  </span>
                </div>
                <div style={{ fontSize: '0.74rem', color: 'var(--text-secondary)' }}>
                  Offered by <strong style={{ color: 'var(--text-primary)' }}>{act.company}</strong>
                </div>
              </div>
            </div>

            <div style={{ textAlign: 'right', flexShrink: 0 }}>
              <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--accent-emerald)' }}>
                {act.packageLPA}
              </div>
              <div style={{ fontSize: '0.66rem', color: 'var(--text-muted)' }}>
                {act.timestamp}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}