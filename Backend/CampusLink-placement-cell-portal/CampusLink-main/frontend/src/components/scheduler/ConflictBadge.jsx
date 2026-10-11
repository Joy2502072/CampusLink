import React from 'react';
import { AlertOctagon, AlertTriangle, Info, CheckCircle2 } from 'lucide-react';

export default function ConflictBadge({ severity }) {
  // Normalize input and provide a safe fallback
  const normalizedSeverity = typeof severity === 'string' ? severity.trim() : '';

  const badgeConfigs = {
    Critical: {
      label: 'Critical Conflict',
      bg: 'var(--accent-rose-soft)',
      text: 'var(--accent-rose)',
      border: 'rgba(244, 63, 94, 0.4)',
      icon: AlertOctagon
    },
    High: {
      label: 'High (Resource)',
      bg: 'var(--accent-amber-soft)',
      text: 'var(--accent-amber)',
      border: 'rgba(245, 158, 11, 0.4)',
      icon: AlertTriangle
    },
    Medium: {
      label: 'Medium (Branch)',
      bg: 'rgba(234, 179, 8, 0.15)',
      text: '#facc15',
      border: 'rgba(234, 179, 8, 0.35)',
      icon: Info
    },
    'No Conflict': {
      label: 'No Conflict',
      bg: 'var(--accent-emerald-soft)',
      text: 'var(--accent-emerald)',
      border: 'rgba(16, 185, 129, 0.3)',
      icon: CheckCircle2
    }
  };

  const current = badgeConfigs[normalizedSeverity] || badgeConfigs['No Conflict'];
  const Icon = current.icon;

  return (
    <span
      role="status"
      aria-label={`Conflict status: ${current.label}`}
      title={current.label}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '5px',
        fontSize: '0.68rem',
        fontWeight: 700,
        padding: '3px 8px',
        borderRadius: '4px',
        backgroundColor: current.bg,
        color: current.text,
        border: `1px solid ${current.border}`,
        whiteSpace: 'nowrap',
        letterSpacing: '0.02em',
        userSelect: 'none'
      }}
    >
      <Icon size={12} aria-hidden="true" style={{ flexShrink: 0 }} />
      <span>{current.label}</span>
    </span>
  );
}