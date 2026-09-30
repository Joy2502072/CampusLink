import React from 'react';
import { Briefcase, Calendar, MapPin, Users } from 'lucide-react';

export default function ActiveDrivesList({ drives, loading }) {
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
          minHeight: '280px'
        }}
      >
        <span style={{ color: 'var(--text-muted, #64748b)', fontSize: '0.875rem' }}>
          Loading active placement drives...
        </span>
      </div>
    );
  }

  const rawDrives = Array.isArray(drives) ? drives : [];
  const displayedDrives = rawDrives.slice(0, 5);

  return (
    <div
      style={{
        backgroundColor: 'var(--bg-card, #0f172a)',
        border: '1px solid var(--border-color, #1e293b)',
        borderRadius: '12px',
        padding: '24px',
        display: 'flex',
        flexDirection: 'column',
        gap: '16px',
        boxSizing: 'border-box'
      }}
    >
      {/* Header */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
          <Briefcase size={18} color="var(--accent-amber, #f59e0b)" />
          <h2 style={{ margin: 0, fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary, #ffffff)', letterSpacing: '-0.01em' }}>
            Active Placement Drives
          </h2>
        </div>
        <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--text-secondary, #94a3b8)' }}>
          Active recruitment drives currently open
        </p>
      </div>

      {/* Drives List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {displayedDrives.length > 0 ? (
          displayedDrives.map((drive) => (
            <div
              key={drive.id}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '10px 14px',
                backgroundColor: 'rgba(30, 41, 59, 0.5)',
                border: '1px solid rgba(51, 65, 85, 0.4)',
                borderRadius: '8px',
                gap: '12px'
              }}
            >
              {/* Drive Info */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '3px', minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                  <span style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-primary, #f1f5f9)' }}>
                    {drive.company}
                  </span>
                  <span
                    style={{
                      fontSize: '0.6875rem',
                      color: 'var(--text-muted, #64748b)',
                      fontFamily: 'monospace'
                    }}
                  >
                    {drive.id}
                  </span>
                </div>

                <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary, #94a3b8)' }}>
                  {drive.role}
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.6875rem', color: 'var(--text-muted, #64748b)', marginTop: '2px', flexWrap: 'wrap' }}>
                  {drive.date && (
                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <Calendar size={11} />
                      {drive.date}
                    </span>
                  )}
                  {drive.venue && (
                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <MapPin size={11} />
                      {drive.venue}
                    </span>
                  )}
                  {drive.openings !== undefined && drive.openings > 0 && (
                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <Users size={11} />
                      {drive.openings} openings
                    </span>
                  )}
                </div>
              </div>

              {/* Package & Status */}
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '4px', flexShrink: 0 }}>
                <span style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--accent-amber, #f59e0b)', fontFamily: 'monospace' }}>
                  {drive.packageLPA}
                </span>

                <span
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    padding: '2px 8px',
                    borderRadius: '999px',
                    fontSize: '11px',
                    fontWeight: 600,
                    backgroundColor: 'rgba(245, 158, 11, 0.12)',
                    color: '#fbbf24',
                    border: '1px solid rgba(245, 158, 11, 0.25)'
                  }}
                >
                  {drive.status || 'Active'}
                </span>
              </div>
            </div>
          ))
        ) : (
          <div style={{ padding: '24px', textAlign: 'center', color: 'var(--text-muted, #64748b)', fontSize: '0.8125rem' }}>
            No active placement drives found.
          </div>
        )}
      </div>
    </div>
  );
}