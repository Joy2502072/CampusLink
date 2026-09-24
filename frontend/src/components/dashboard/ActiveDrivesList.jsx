import React from 'react';
import { Calendar, Users } from 'lucide-react';

export default function ActiveDrivesList({ drives }) {
  const getBadgeStyle = (color) => {
    switch (color) {
      case 'emerald':
        return { bg: 'var(--accent-emerald-soft)', text: 'var(--accent-emerald)' };
      case 'blue':
        return { bg: 'var(--accent-blue-soft)', text: 'var(--accent-blue)' };
      case 'amber':
        return { bg: 'var(--accent-amber-soft)', text: 'var(--accent-amber)' };
      default:
        return { bg: 'var(--accent-violet-soft)', text: 'var(--accent-violet)' };
    }
  };

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
          <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#ffffff' }}>Active Placement Drives</h3>
          <p style={{ fontSize: '0.76rem', color: 'var(--text-muted)' }}>Simulated hiring pipelines currently open</p>
        </div>
        <span style={{
          fontSize: '0.7rem',
          color: 'var(--text-muted)',
          backgroundColor: 'rgba(255, 255, 255, 0.04)',
          padding: '2px 8px',
          borderRadius: '4px'
        }}>
          {drives.length} drives listed
        </span>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {drives.map((drive) => {
          const badge = getBadgeStyle(drive.badgeColor);
          return (
            <div
              key={drive.id}
              style={{
                backgroundColor: 'rgba(15, 23, 42, 0.4)',
                border: '1px solid var(--border-color)',
                borderRadius: '8px',
                padding: '12px 14px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: '12px'
              }}
            >
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                  <h4 style={{ fontSize: '0.88rem', fontWeight: 700, color: '#ffffff' }}>{drive.company}</h4>
                  <span style={{
                    fontSize: '0.66rem',
                    fontWeight: 700,
                    padding: '2px 6px',
                    borderRadius: '4px',
                    backgroundColor: badge.bg,
                    color: badge.text
                  }}>
                    {drive.status}
                  </span>
                </div>
                <div style={{ fontSize: '0.76rem', color: 'var(--text-secondary)' }}>
                  {drive.role} • <span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>{drive.packageLPA}</span>
                </div>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                  Eligibility: {drive.eligibility}
                </div>
              </div>

              <div style={{ textAlign: 'right' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.75rem', color: 'var(--text-secondary)', justifyContent: 'flex-end' }}>
                  <Users size={12} aria-hidden="true" />
                  <span><strong>{drive.appliedCount}</strong> Registered</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                  <Calendar size={11} aria-hidden="true" />
                  <span>{drive.date}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}