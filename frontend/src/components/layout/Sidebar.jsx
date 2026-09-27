import React from 'react';
import {
  LayoutDashboard,
  BarChart3,
  Calendar,
  AlertTriangle,
  GraduationCap,
  MessageSquare,
  Briefcase,
  ShieldCheck,
  Sparkles,
  X
} from 'lucide-react';

export default function Sidebar({
  activeTab,
  onSelectTab,
  isOpen,
  onClose
}) {
  const menuItems = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: LayoutDashboard
    },
    {
      id: 'analytics',
      label: 'Analytics',
      icon: BarChart3
    },
    {
      id: 'drives',
      label: 'Drive Scheduler',
      icon: Calendar
    },
    {
      id: 'at-risk',
      label: 'At-Risk Students',
      icon: AlertTriangle
    },
    {
      id: 'readiness',
      label: 'Student Readiness',
      icon: GraduationCap
    },
    {
      id: 'matching',
      label: 'Job Matching',
      icon: Briefcase
    },
    {
      id: 'communication',
      label: 'Communication',
      icon: MessageSquare
    }
  ];

  return (
    <>
      {isOpen && (
        <div
          onClick={onClose}
          aria-hidden="true"
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(15, 23, 42, 0.65)',
            backdropFilter: 'blur(4px)',
            WebkitBackdropFilter: 'blur(4px)',
            zIndex: 40
          }}
        />
      )}

      <aside
        style={{
          width: '260px',
          backgroundColor: 'var(--bg-sidebar, #0f172a)',
          borderRight:
            '1px solid var(--border-color, #1e293b)',
          display: 'flex',
          flexDirection: 'column',
          minHeight: '100vh',
          flexShrink: 0,
          zIndex: 50,
          boxSizing: 'border-box',
          ...(isOpen !== undefined
            ? {
                position:
                  window.innerWidth < 1024
                    ? 'fixed'
                    : 'relative',
                top: 0,
                bottom: 0,
                left: 0,
                transform:
                  window.innerWidth < 1024 && !isOpen
                    ? 'translateX(-100%)'
                    : 'translateX(0)',
                transition:
                  'transform 0.3s ease-in-out'
              }
            : {})
        }}
      >
        {/* Header */}
        <div
          style={{
            height: '76px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '0 20px',
            borderBottom:
              '1px solid var(--border-color, #1e293b)',
            flexShrink: 0
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px'
            }}
          >
            <div
              style={{
                width: '38px',
                height: '38px',
                borderRadius: '10px',
                background:
                  'linear-gradient(135deg, var(--accent-blue, #6366f1) 0%, #4f46e5 100%)',
                color: '#ffffff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 800,
                fontSize: '18px',
                letterSpacing: '-0.03em',
                boxShadow:
                  '0 4px 12px rgba(99, 102, 241, 0.25)'
              }}
            >
              CL
            </div>

            <div>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
                <span
                  style={{
                    color: '#ffffff',
                    fontWeight: 700,
                    fontSize: '16px',
                    letterSpacing: '-0.01em'
                  }}
                >
                  CampusLink
                </span>

                <span
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '3px',
                    padding: '1px 5px',
                    borderRadius: '4px',
                    fontSize: '10px',
                    fontWeight: 600,
                    backgroundColor:
                      'rgba(99, 102, 241, 0.15)',
                    color:
                      'var(--accent-blue, #818cf8)',
                    border:
                      '1px solid rgba(99, 102, 241, 0.25)'
                  }}
                >
                  <Sparkles size={10} />
                  AI
                </span>
              </div>

              <p
                style={{
                  margin: '2px 0 0 0',
                  fontSize: '11px',
                  color:
                    'var(--text-muted, #64748b)',
                  fontWeight: 500
                }}
              >
                Placement Management
              </p>
            </div>
          </div>

          {onClose && (
            <button
              onClick={onClose}
              aria-label="Close sidebar"
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '6px',
                color:
                  'var(--text-muted, #64748b)',
                backgroundColor: 'transparent',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer'
              }}
            >
              <X size={18} />
            </button>
          )}
        </div>

        {/* Navigation */}
        <nav
          aria-label="Control Panel Navigation"
          style={{
            flex: 1,
            overflowY: 'auto',
            padding: '20px 12px',
            display: 'flex',
            flexDirection: 'column',
            gap: '4px'
          }}
        >
          <div
            style={{
              padding: '0 12px 8px 12px',
              fontSize: '11px',
              fontWeight: 600,
              textTransform: 'uppercase',
              letterSpacing: '0.06em',
              color:
                'var(--text-muted, #64748b)'
            }}
          >
            Control Panel
          </div>

          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive =
              activeTab === item.id;

            return (
              <button
                key={item.id}
                onClick={() => {
                  onSelectTab(item.id);

                  if (onClose) {
                    onClose();
                  }
                }}
                aria-current={
                  isActive ? 'page' : undefined
                }
                style={{
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '10px 14px',
                  borderRadius: '10px',
                  fontSize: '13px',
                  fontWeight: 600,
                  border: 'none',
                  textAlign: 'left',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                  backgroundColor: isActive
                    ? 'var(--accent-blue, #6366f1)'
                    : 'transparent',
                  color: isActive
                    ? '#ffffff'
                    : 'var(--text-secondary, #94a3b8)',
                  boxShadow: isActive
                    ? '0 4px 12px rgba(99, 102, 241, 0.28)'
                    : 'none'
                }}
                onMouseEnter={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.backgroundColor =
                      'rgba(30, 41, 59, 0.6)';
                    e.currentTarget.style.color =
                      '#f1f5f9';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.backgroundColor =
                      'transparent';
                    e.currentTarget.style.color =
                      'var(--text-secondary, #94a3b8)';
                  }
                }}
              >
                <Icon
                  color={
                    isActive
                      ? '#ffffff'
                      : 'var(--text-muted, #64748b)'
                  }
                  size={18}
                  style={{
                    flexShrink: 0
                  }}
                />

                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Demo Environment */}
        <div
          style={{
            padding: '16px',
            borderTop:
              '1px solid var(--border-color, #1e293b)',
            flexShrink: 0
          }}
        >
          <div
            style={{
              padding: '12px 14px',
              borderRadius: '10px',
              backgroundColor:
                'rgba(30, 41, 59, 0.45)',
              border:
                '1px solid var(--border-color, #1e293b)',
              display: 'flex',
              alignItems: 'flex-start',
              gap: '10px'
            }}
          >
            <ShieldCheck
              color="var(--accent-emerald, #10b981)"
              size={18}
              style={{
                flexShrink: 0,
                marginTop: '1px'
              }}
            />

            <div>
              <p
                style={{
                  margin: 0,
                  fontSize: '12px',
                  fontWeight: 600,
                  color: '#e2e8f0'
                }}
              >
                Demo Environment
              </p>

              <p
                style={{
                  margin: '2px 0 0 0',
                  fontSize: '11px',
                  color:
                    'var(--text-muted, #64748b)',
                  lineHeight: 1.4
                }}
              >
                Deterministic synthetic data
                prototype. No production credentials
                exposed.
              </p>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}