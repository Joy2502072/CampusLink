import React from 'react';
import { Construction } from 'lucide-react';

export default function PlaceholderView({ title, description, onBackToDashboard }) {
  return (
    <div style={{
      backgroundColor: 'var(--bg-card)',
      border: '1px solid var(--border-color)',
      borderRadius: '16px',
      padding: '48px 24px',
      textAlign: 'center',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '380px'
    }}>
      <div style={{
        width: '56px',
        height: '56px',
        borderRadius: '14px',
        backgroundColor: 'var(--accent-blue-soft)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: 'var(--accent-blue)',
        marginBottom: '16px'
      }}>
        <Construction size={28} aria-hidden="true" />
      </div>
      <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#ffffff', marginBottom: '8px' }}>
        {title}
      </h2>
      <p style={{ fontSize: '0.84rem', color: 'var(--text-secondary)', maxWidth: '440px', marginBottom: '20px', lineHeight: 1.6 }}>
        {description}
      </p>
      <button
        type="button"
        onClick={onBackToDashboard}
        style={{
          padding: '8px 18px',
          backgroundColor: 'var(--accent-blue)',
          color: '#ffffff',
          borderRadius: '8px',
          fontSize: '0.82rem',
          fontWeight: 600
        }}
      >
        Return to Placement Command Center
      </button>
    </div>
  );
}