import React from 'react';
import { Bell, Clock, Building2, Eye, ShieldCheck, AlertTriangle, Target } from 'lucide-react';

export default function NotificationPreview({ previewData = {} }) {
  const getPriorityStyle = (priority) => {
    switch (priority) {
      case 'Urgent':
        return {
          badgeBg: 'var(--accent-rose-soft)',
          badgeColor: 'var(--accent-rose)',
          badgeBorder: 'rgba(244, 63, 94, 0.4)',
          indicatorBg: 'var(--accent-rose)'
        };
      case 'Important':
        return {
          badgeBg: 'var(--accent-amber-soft)',
          badgeColor: 'var(--accent-amber)',
          badgeBorder: 'rgba(245, 158, 11, 0.4)',
          indicatorBg: 'var(--accent-amber)'
        };
      default:
        return {
          badgeBg: 'var(--accent-blue-soft)',
          badgeColor: 'var(--accent-blue)',
          badgeBorder: 'rgba(59, 130, 246, 0.3)',
          indicatorBg: 'var(--accent-blue)'
        };
    }
  };

  const priority = previewData.priority || 'Normal';
  const style = getPriorityStyle(priority);
  const displayTitle = (previewData.title && previewData.title.trim()) || 'Announcement Title Preview';
  const displayMessage =
    (previewData.message && previewData.message.trim()) ||
    'Compose notification content in the editor to preview how this message appears on the student mobile and web portal feeds.';
  const displayType = previewData.type || 'General Announcement';
  const displayCompany = previewData.relatedCompany || null;
  const displayAudience = previewData.targetAudience || 'All Students';
  const displayBranch = previewData.targetBranch && previewData.targetBranch !== 'All' ? previewData.targetBranch : null;
  const displayTime = previewData.timestamp || 'Just now (Simulated)';

  return (
    <div
      style={{
        backgroundColor: 'var(--bg-card)',
        border: '1px solid var(--border-color)',
        borderRadius: '14px',
        padding: '22px',
        display: 'flex',
        flexDirection: 'column',
        gap: '16px'
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Eye size={16} color="var(--accent-blue)" aria-hidden="true" />
          <h3 style={{ fontSize: '0.98rem', fontWeight: 700, color: '#ffffff' }}>
            Student Notification Preview
          </h3>
        </div>
        <span
          style={{
            fontSize: '0.68rem',
            fontWeight: 700,
            padding: '2px 8px',
            borderRadius: '4px',
            backgroundColor: 'rgba(255, 255, 255, 0.05)',
            color: 'var(--text-secondary)',
            border: '1px solid var(--border-color)',
            letterSpacing: '0.04em'
          }}
        >
          DEMO PREVIEW
        </span>
      </div>

      {/* Simulated Student Portal Card */}
      <div
        style={{
          backgroundColor: '#0b1120',
          border: `1px solid ${style.badgeBorder}`,
          borderRadius: '12px',
          padding: '18px 16px',
          display: 'flex',
          flexDirection: 'column',
          gap: '12px',
          position: 'relative',
          boxShadow: '0 8px 24px rgba(0,0,0,0.35)'
        }}
      >
        {/* Top Priority Accent Strip */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: '3px',
            backgroundColor: style.indicatorBg,
            borderTopLeftRadius: '12px',
            borderTopRightRadius: '12px'
          }}
        />

        {/* Card Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '8px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div
              style={{
                width: '34px',
                height: '34px',
                borderRadius: '8px',
                backgroundColor: style.badgeBg,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: style.badgeColor,
                flexShrink: 0
              }}
            >
              <Bell size={16} aria-hidden="true" />
            </div>
            <div>
              <div
                style={{
                  fontSize: '0.68rem',
                  fontWeight: 700,
                  color: 'var(--text-muted)',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em'
                }}
              >
                {displayType}
              </div>
              <div
                style={{
                  fontSize: '0.92rem',
                  fontWeight: 700,
                  color: '#ffffff',
                  lineHeight: 1.3
                }}
              >
                {displayTitle}
              </div>
            </div>
          </div>

          <span
            style={{
              fontSize: '0.66rem',
              fontWeight: 700,
              padding: '2px 8px',
              borderRadius: '4px',
              backgroundColor: style.badgeBg,
              color: style.badgeColor,
              border: `1px solid ${style.badgeBorder}`,
              whiteSpace: 'nowrap'
            }}
          >
            {priority} Priority
          </span>
        </div>

        {/* Message Body */}
        <p
          style={{
            fontSize: '0.8rem',
            color: 'var(--text-secondary)',
            lineHeight: 1.55,
            whiteSpace: 'pre-wrap'
          }}
        >
          {displayMessage}
        </p>

        {/* Metadata Badges: Target Audience & Related Company */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '2px' }}>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '5px',
              backgroundColor: 'rgba(255, 255, 255, 0.04)',
              border: '1px solid var(--border-color)',
              borderRadius: '6px',
              padding: '3px 8px',
              fontSize: '0.7rem',
              color: 'var(--text-secondary)'
            }}
          >
            <Target size={12} color="var(--accent-blue)" aria-hidden="true" />
            <span>
              Target: <strong style={{ color: 'var(--text-primary)' }}>{displayAudience}</strong>
              {displayBranch ? ` (${displayBranch})` : ''}
            </span>
          </div>

          {displayCompany && (
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '5px',
                backgroundColor: 'rgba(255, 255, 255, 0.04)',
                border: '1px solid var(--border-color)',
                borderRadius: '6px',
                padding: '3px 8px',
                fontSize: '0.7rem',
                color: 'var(--text-secondary)'
              }}
            >
              <Building2 size={12} color="var(--accent-emerald)" aria-hidden="true" />
              <span>
                Drive: <strong style={{ color: 'var(--text-primary)' }}>{displayCompany}</strong>
              </span>
            </div>
          )}
        </div>

        {/* Card Footer */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            borderTop: '1px solid rgba(255, 255, 255, 0.06)',
            paddingTop: '10px',
            fontSize: '0.68rem',
            color: 'var(--text-muted)'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <Clock size={12} aria-hidden="true" />
            <span>{displayTime}</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--accent-emerald)' }}>
            <ShieldCheck size={13} aria-hidden="true" />
            <span>CampusLink Verified Notice</span>
          </div>
        </div>
      </div>

      {/* Simulated Sandbox Transparency Banner */}
      <div
        style={{
          fontSize: '0.7rem',
          color: 'var(--text-muted)',
          backgroundColor: 'rgba(255, 255, 255, 0.02)',
          border: '1px solid var(--border-color)',
          borderRadius: '8px',
          padding: '8px 12px',
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}
      >
        <AlertTriangle size={13} color="var(--accent-amber)" aria-hidden="true" style={{ flexShrink: 0 }} />
        <span>Simulated Student View: Notifications are rendered locally and are not transmitted externally.</span>
      </div>
    </div>
  );
}