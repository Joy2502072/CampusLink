import React from 'react';
import { Smartphone, Bell, Clock, Building2, Users, AlertTriangle, ShieldCheck } from 'lucide-react';

const PRIORITY_BADGES = {
  Urgent: {
    color: '#ef4444',
    bg: 'rgba(239, 68, 68, 0.15)',
    border: 'rgba(239, 68, 68, 0.3)'
  },
  Important: {
    color: '#f59e0b',
    bg: 'rgba(245, 158, 11, 0.15)',
    border: 'rgba(245, 158, 11, 0.3)'
  },
  Normal: {
    color: '#3b82f6',
    bg: 'rgba(59, 130, 246, 0.15)',
    border: 'rgba(59, 130, 246, 0.3)'
  }
};

export default function NotificationPreview({ previewData }) {
  const title = (previewData?.title || '').trim() || 'Untitled Announcement';
  const message = (previewData?.message || '').trim() || 'The notification body text will render here across student portals and mobile notification surfaces.';
  const type = previewData?.type || 'General Announcement';
  const priority = previewData?.priority || 'Normal';
  const audience = previewData?.targetAudience || 'All Students';
  const branch = previewData?.targetBranch || 'All';
  const driveId = previewData?.relatedDriveId || null;

  const priorityStyle = PRIORITY_BADGES[priority] || PRIORITY_BADGES.Normal;

  return (
    <div
      style={{
        backgroundColor: 'var(--bg-card, #0f172a)',
        border: '1px solid var(--border-color, #1e293b)',
        borderRadius: '12px',
        padding: '24px',
        display: 'flex',
        flexDirection: 'column',
        gap: '20px',
        boxSizing: 'border-box'
      }}
    >
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '10px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Smartphone size={18} color="var(--accent-blue, #6366f1)" />
          <h2 style={{ margin: 0, fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary, #ffffff)', letterSpacing: '-0.01em' }}>
            Preview
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
            color: '#818cf8',
            border: '1px solid rgba(99, 102, 241, 0.25)'
          }}
        >
          STUDENT PREVIEW
        </span>
      </div>

      {/* Simulated Device Surface */}
      <div
        style={{
          backgroundColor: '#020617',
          border: '1px solid rgba(51, 65, 85, 0.6)',
          borderRadius: '10px',
          padding: '16px',
          display: 'flex',
          flexDirection: 'column',
          gap: '12px'
        }}
      >
        {/* Device Status Bar */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.6875rem', color: '#64748b' }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <Bell size={11} color="#94a3b8" /> CampusLink Portal
          </span>
          <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <Clock size={11} /> Just Now
          </span>
        </div>

        {/* Card Body */}
        <div
          style={{
            backgroundColor: 'rgba(15, 23, 42, 0.85)',
            border: `1px solid ${priorityStyle.border}`,
            borderRadius: '8px',
            padding: '14px',
            display: 'flex',
            flexDirection: 'column',
            gap: '10px'
          }}
        >
          {/* Metadata Row */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '6px' }}>
            <span style={{ fontSize: '0.6875rem', fontWeight: 600, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              {type}
            </span>

            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '3px',
                padding: '2px 8px',
                borderRadius: '999px',
                fontSize: '10px',
                fontWeight: 700,
                backgroundColor: priorityStyle.bg,
                color: priorityStyle.color,
                border: `1px solid ${priorityStyle.border}`
              }}
            >
              {priority === 'Urgent' && <AlertTriangle size={10} />}
              {priority} Priority
            </span>
          </div>

          {/* Title */}
          <h3 style={{ margin: 0, fontSize: '0.9375rem', fontWeight: 700, color: '#f8fafc', lineHeight: 1.35 }}>
            {title}
          </h3>

          {/* Message Body */}
          <p style={{ margin: 0, fontSize: '0.8125rem', color: '#cbd5e1', lineHeight: 1.5, whiteSpace: 'pre-wrap' }}>
            {message}
          </p>

          {/* Drive & Scope Badges */}
          <div
            style={{
              paddingTop: '8px',
              borderTop: '1px solid rgba(51, 65, 85, 0.4)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '6px',
              fontSize: '0.6875rem',
              color: '#94a3b8'
            }}
          >
            <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <Users size={11} /> Audience: <strong style={{ color: '#e2e8f0' }}>{audience}</strong>
            </span>

            {branch && branch !== 'All' && (
              <span style={{ color: '#cbd5e1' }}>
                Branch: <strong>{branch}</strong>
              </span>
            )}

            {driveId && (
              <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <Building2 size={11} /> Drive: <strong>{driveId}</strong>
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Dispatch Verification Footer */}
      <div
        style={{
          padding: '10px 14px',
          backgroundColor: 'rgba(30, 41, 59, 0.4)',
          borderRadius: '8px',
          border: '1px solid rgba(51, 65, 85, 0.4)',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          fontSize: '0.75rem',
          color: 'var(--text-muted, #94a3b8)'
        }}
      >
        <ShieldCheck size={14} color="#10b981" />
        <span>CampusLink Placement Cell • Live Database</span>
      </div>
    </div>
  );
}