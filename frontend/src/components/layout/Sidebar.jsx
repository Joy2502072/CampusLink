import React from 'react';
import { 
  LayoutDashboard, 
  BarChart3, 
  CalendarDays, 
  AlertTriangle, 
  MessageSquareShare, 
  GraduationCap, 
  ShieldCheck, 
  X 
} from 'lucide-react';

export default function Sidebar({ activeTab, onSelectTab, isOpen, onClose }) {
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
    { id: 'drives', label: 'Drive Scheduler', icon: CalendarDays },
    { id: 'at-risk', label: 'At-Risk Students', icon: AlertTriangle },
    { id: 'communication', label: 'Communication', icon: MessageSquareShare },
  ];

  const handleSelect = (id) => {
    onSelectTab(id);
    if (onClose) {
      onClose();
    }
  };

  return (
    <>
      {/* Mobile background overlay */}
      {isOpen && (
        <div
          onClick={onClose}
          aria-hidden="true"
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.65)',
            backdropFilter: 'blur(4px)',
            zIndex: 35
          }}
        />
      )}

      <aside
        aria-label="Primary Navigation"
        className="sidebar-container"
        style={{
          width: '260px',
          backgroundColor: 'var(--bg-sidebar)',
          borderRight: '1px solid var(--border-color)',
          display: 'flex',
          flexDirection: 'column',
          height: '100vh',
          position: 'fixed',
          top: 0,
          left: 0,
          zIndex: 40,
          transform: isOpen ? 'translateX(0)' : 'translateX(-100%)',
          transition: 'transform 0.25s cubic-bezier(0.4, 0, 0.2, 1)'
        }}
      >
        {/* Brand Header */}
        <div style={{
          padding: '20px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderBottom: '1px solid var(--border-color)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{
              width: '40px',
              height: '40px',
              borderRadius: '10px',
              background: 'linear-gradient(135deg, #2563eb, #3b82f6)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#ffffff',
              boxShadow: '0 8px 16px -4px rgba(37, 99, 235, 0.4)'
            }}>
              <GraduationCap size={22} aria-hidden="true" />
            </div>
            <div>
              <h1 style={{ fontSize: '1.1rem', fontWeight: 800, letterSpacing: '-0.02em', color: '#ffffff' }}>
                Campus<span style={{ color: 'var(--accent-blue)' }}>Link</span>
              </h1>
              <p style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 600 }}>
                Placement Cell Portal
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="mobile-only"
            aria-label="Close navigation sidebar"
            style={{
              color: 'var(--text-secondary)',
              padding: '6px',
              borderRadius: '6px'
            }}
          >
            <X size={20} aria-hidden="true" />
          </button>
        </div>

        {/* Navigation Links */}
        <nav style={{ padding: '20px 12px', flex: 1, display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <div style={{ 
            fontSize: '0.68rem', 
            fontWeight: 700, 
            color: 'var(--text-muted)', 
            textTransform: 'uppercase', 
            padding: '0 12px 6px',
            letterSpacing: '0.08em' 
          }}>
            Control Panel
          </div>

          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => handleSelect(item.id)}
                aria-current={isActive ? 'page' : undefined}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '11px 14px',
                  borderRadius: '8px',
                  fontSize: '0.88rem',
                  fontWeight: isActive ? 600 : 500,
                  color: isActive ? '#ffffff' : 'var(--text-secondary)',
                  backgroundColor: isActive ? 'var(--accent-blue)' : 'transparent',
                  transition: 'background-color 0.15s ease, color 0.15s ease',
                  width: '100%',
                  textAlign: 'left'
                }}
              >
                <Icon size={18} aria-hidden="true" style={{ color: isActive ? '#ffffff' : 'var(--text-secondary)' }} />
                <span>{item.label}</span>
                {isActive && (
                  <span style={{
                    marginLeft: 'auto',
                    width: '6px',
                    height: '6px',
                    borderRadius: '50%',
                    backgroundColor: '#ffffff'
                  }} />
                )}
              </button>
            );
          })}
        </nav>

        {/* Simulation Security & Scope Notice */}
        <div style={{ padding: '16px', borderTop: '1px solid var(--border-color)' }}>
          <div style={{
            backgroundColor: 'rgba(15, 23, 42, 0.7)',
            border: '1px solid var(--border-color)',
            borderRadius: '10px',
            padding: '12px',
            display: 'flex',
            alignItems: 'center',
            gap: '10px'
          }}>
            <ShieldCheck size={20} color="var(--accent-emerald)" aria-hidden="true" />
            <div>
              <p style={{ fontSize: '0.78rem', fontWeight: 600, color: '#f1f5f9' }}>Demo Environment</p>
              <p style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>Session: 2025-2026 (Mock)</p>
            </div>
          </div>
        </div>
      </aside>

      <style>{`
        @media (min-width: 769px) {
          .sidebar-container {
            transform: none !important;
            position: sticky !important;
          }
        }
      `}</style>
    </>
  );
}