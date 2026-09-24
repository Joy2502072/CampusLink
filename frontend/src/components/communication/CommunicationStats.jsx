import React from 'react';
import { Send, Clock, FileText, BellRing } from 'lucide-react';

export default function CommunicationStats({ notifications = [] }) {
  const total = notifications.length;
  const sent = notifications.filter((n) => n.status === 'Sent').length;
  const scheduled = notifications.filter((n) => n.status === 'Scheduled').length;
  const drafts = notifications.filter((n) => n.status === 'Draft').length;

  const stats = [
    {
      title: 'Total Notifications',
      value: total,
      subtext: 'In-app notification records',
      icon: BellRing,
      bg: 'var(--accent-blue-soft)',
      border: 'rgba(59, 130, 246, 0.3)',
      color: 'var(--accent-blue)',
    },
    {
      title: 'Dispatched / Sent',
      value: sent,
      subtext: 'Delivered to student feeds',
      icon: Send,
      bg: 'var(--accent-emerald-soft)',
      border: 'rgba(16, 185, 129, 0.3)',
      color: 'var(--accent-emerald)',
    },
    {
      title: 'Scheduled Releases',
      value: scheduled,
      subtext: 'Automated pending delivery',
      icon: Clock,
      bg: 'var(--accent-amber-soft)',
      border: 'rgba(245, 158, 11, 0.3)',
      color: 'var(--accent-amber)',
    },
    {
      title: 'Saved Drafts',
      value: drafts,
      subtext: 'Unpublished message templates',
      icon: FileText,
      bg: 'var(--accent-violet-soft)',
      border: 'rgba(139, 92, 246, 0.3)',
      color: 'var(--accent-violet)',
    },
  ];

  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(4, minmax(0, 1fr))',
        gap: '16px',
        marginBottom: '20px',
      }}
    >
      {stats.map((stat) => {
        const Icon = stat.icon;

        return (
          <div
            key={stat.title}
            style={{
              backgroundColor: 'var(--bg-card)',
              border: '1px solid var(--border-color)',
              borderRadius: '14px',
              padding: '20px',
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: '14px',
              }}
            >
              <span
                style={{
                  fontSize: '0.76rem',
                  fontWeight: 600,
                  color: 'var(--text-secondary)',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                }}
              >
                {stat.title}
              </span>

              <div
                style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '8px',
                  backgroundColor: stat.bg,
                  border: `1px solid ${stat.border}`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: stat.color,
                }}
              >
                <Icon size={18} aria-hidden="true" />
              </div>
            </div>

            <div
              style={{
                fontSize: '1.85rem',
                fontWeight: 800,
                color: '#ffffff',
                letterSpacing: '-0.03em',
              }}
            >
              {stat.value}
            </div>

            <div
              style={{
                fontSize: '0.74rem',
                color: 'var(--text-muted)',
                marginTop: '4px',
              }}
            >
              {stat.subtext}
            </div>
          </div>
        );
      })}
    </div>
  );
}