import React from 'react';
import { Activity, CheckCircle2, Clock, CheckCheck, XCircle } from 'lucide-react';

const STATUS_CONFIG = {
  accepted: {
    label: 'Accepted',
    color: '#10b981',
    bgColor: 'rgba(16, 185, 129, 0.12)',
    borderColor: 'rgba(16, 185, 129, 0.25)',
    Icon: CheckCircle2
  },
  pending: {
    label: 'Pending',
    color: '#f59e0b',
    bgColor: 'rgba(245, 158, 11, 0.12)',
    borderColor: 'rgba(245, 158, 11, 0.25)',
    Icon: Clock
  },
  offered: {
    label: 'Pending',
    color: '#f59e0b',
    bgColor: 'rgba(245, 158, 11, 0.12)',
    borderColor: 'rgba(245, 158, 11, 0.25)',
    Icon: Clock
  },
  'joining confirmed': {
    label: 'Joining Confirmed',
    color: '#818cf8',
    bgColor: 'rgba(129, 140, 248, 0.12)',
    borderColor: 'rgba(129, 140, 248, 0.25)',
    Icon: CheckCheck
  },
  'joining-confirmed': {
    label: 'Joining Confirmed',
    color: '#818cf8',
    bgColor: 'rgba(129, 140, 248, 0.12)',
    borderColor: 'rgba(129, 140, 248, 0.25)',
    Icon: CheckCheck
  },
  rejected: {
    label: 'Rejected',
    color: '#ef4444',
    bgColor: 'rgba(239, 68, 68, 0.12)',
    borderColor: 'rgba(239, 68, 68, 0.25)',
    Icon: XCircle
  }
};

function getStatusDetails(status) {
  const key = (status || '').trim().toLowerCase();
  return (
    STATUS_CONFIG[key] || {
      label: status || 'Pending',
      color: '#94a3b8',
      bgColor: 'rgba(148, 163, 184, 0.12)',
      borderColor: 'rgba(148, 163, 184, 0.25)',
      Icon: Clock
    }
  );
}

function formatOfferDate(rawDate) {
  if (!rawDate) return '';
  const dateObj = new Date(rawDate);
  if (isNaN(dateObj.getTime())) {
    return rawDate;
  }
  return dateObj.toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  });
}

export default function RecentActivities({ offers, loading }) {
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
          Loading recent activities...
        </span>
      </div>
    );
  }

  const rawOffers = Array.isArray(offers) ? offers : [];

  // Sort descending by offerDate when available
  const sortedOffers = [...rawOffers].sort((a, b) => {
    const dateA = a.offerDate ? new Date(a.offerDate).getTime() : 0;
    const dateB = b.offerDate ? new Date(b.offerDate).getTime() : 0;
    return dateB - dateA;
  });

  const displayedOffers = sortedOffers.slice(0, 5);

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
          <Activity size={18} color="var(--accent-blue, #6366f1)" />
          <h2 style={{ margin: 0, fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary, #ffffff)', letterSpacing: '-0.01em' }}>
            Recent Placement Activity
          </h2>
        </div>
        <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--text-secondary, #94a3b8)' }}>
          Latest placement offers from the placement database
        </p>
      </div>

      {/* Activity List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {displayedOffers.length > 0 ? (
          displayedOffers.map((item) => {
            const statusConfig = getStatusDetails(item.status);
            const StatusIcon = statusConfig.Icon;
            const formattedDate = formatOfferDate(item.offerDate);

            return (
              <div
                key={item.id}
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
                {/* Student, Company, Role, and Offer Date */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                    <span style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-primary, #f1f5f9)' }}>
                      {item.studentName || item.studentId || 'Candidate'}
                    </span>
                    <span
                      style={{
                        fontSize: '0.6875rem',
                        color: 'var(--text-muted, #64748b)',
                        fontFamily: 'monospace'
                      }}
                    >
                      {item.studentId}
                    </span>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.75rem', color: 'var(--text-secondary, #94a3b8)' }}>
                    <span>{item.company}</span>
                    <span>·</span>
                    <span style={{ color: 'var(--text-primary, #cbd5e1)', fontWeight: 500 }}>{item.role}</span>
                  </div>

                  {formattedDate && (
                    <div style={{ fontSize: '0.6875rem', color: 'var(--text-muted, #64748b)', marginTop: '2px' }}>
                      {formattedDate}
                    </div>
                  )}
                </div>

                {/* Package & Status Badge */}
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '4px', flexShrink: 0 }}>
                  <span style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--text-primary, #ffffff)', fontFamily: 'monospace' }}>
                    {item.packageLPA}
                  </span>

                  <span
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px',
                      padding: '2px 8px',
                      borderRadius: '999px',
                      fontSize: '11px',
                      fontWeight: 600,
                      backgroundColor: statusConfig.bgColor,
                      color: statusConfig.color,
                      border: `1px solid ${statusConfig.borderColor}`
                    }}
                  >
                    <StatusIcon size={11} />
                    {statusConfig.label}
                  </span>
                </div>
              </div>
            );
          })
        ) : (
          <div style={{ padding: '24px', textAlign: 'center', color: 'var(--text-muted, #64748b)', fontSize: '0.8125rem' }}>
            No placement activity records found in database.
          </div>
        )}
      </div>
    </div>
  );
}