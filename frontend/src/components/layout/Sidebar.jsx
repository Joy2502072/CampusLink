import React from 'react';
import {
  LayoutDashboard,
  Calendar,
  Briefcase,
  AlertTriangle,
  GraduationCap,
  MessageSquare,
  Building2,
  BarChart3,
  Compass,
  BrainCircuit
} from 'lucide-react';

const NAV_ITEMS = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'student-portal', label: 'Student Portal', icon: Compass },
  { id: 'at-risk', label: 'At-Risk Students', icon: AlertTriangle },
  { id: 'readiness', label: 'Student Readiness', icon: GraduationCap },
  { id: 'matching', label: 'Job Matching', icon: Briefcase },
  { id: 'skill-gap', label: 'Skill Gap Analysis', icon: Building2 },
  { id: 'drives', label: 'Scheduler', icon: Calendar },
  { id: 'analytics', label: 'Analytics', icon: BarChart3 },
  { id: 'curriculum-intelligence', label: 'Curriculum Intelligence', icon: BrainCircuit },
  { id: 'communication', label: 'Communication Hub', icon: MessageSquare }
];

export default function Sidebar({ activeTab, onSelectTab, searchTerm = '', onSearchChange }) {
  const filteredNavItems = NAV_ITEMS.filter((item) =>
    item.label.toLowerCase().includes((searchTerm || '').toLowerCase())
  );

  return (
    <aside
      style={{
        width: '240px',
        minHeight: '100vh',
        backgroundColor: '#0a0f1d',
        borderRight: '1px solid #1e293b',
        display: 'flex',
        flexDirection: 'column',
        flexShrink: 0,
        boxSizing: 'border-box'
      }}
    >
      {/* Brand Header */}
      <div
        style={{
          padding: '24px 20px',
          borderBottom: '1px solid #1e293b',
          display: 'flex',
          alignItems: 'center',
          gap: '12px'
        }}
      >
        <div
          style={{
            width: '36px',
            height: '36px',
            borderRadius: '8px',
            backgroundColor: 'var(--accent-blue, #6366f1)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#ffffff',
            fontWeight: 800,
            fontSize: '1.1rem'
          }}
        >
          C
        </div>
        <div>
          <div style={{ fontSize: '1rem', fontWeight: 800, color: '#ffffff', letterSpacing: '-0.02em' }}>
            CampusLink
          </div>
          <div style={{ fontSize: '0.6875rem', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Placement Cell
          </div>
        </div>
      </div>

      {/* Optional Search Filter */}
      {typeof onSearchChange === 'function' && (
        <div style={{ padding: '12px 14px 4px 14px' }}>
          <input
            type="text"
            placeholder="Search navigation..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            style={{
              width: '100%',
              padding: '6px 10px',
              backgroundColor: '#1e293b',
              border: '1px solid #334155',
              borderRadius: '6px',
              color: '#f8fafc',
              fontSize: '0.75rem',
              outline: 'none',
              boxSizing: 'border-box'
            }}
          />
        </div>
      )}

      {/* Navigation Items */}
      <nav style={{ padding: '12px', display: 'flex', flexDirection: 'column', gap: '4px', flex: 1 }}>
        {filteredNavItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;

          return (
            <button
              key={item.id}
              onClick={() => onSelectTab(item.id)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '10px 14px',
                borderRadius: '8px',
                border: 'none',
                backgroundColor: isActive ? 'rgba(99, 102, 241, 0.15)' : 'transparent',
                color: isActive ? '#ffffff' : '#94a3b8',
                fontWeight: isActive ? 600 : 500,
                fontSize: '0.875rem',
                cursor: 'pointer',
                textAlign: 'left',
                transition: 'all 0.15s ease'
              }}
            >
              <Icon size={18} color={isActive ? 'var(--accent-blue, #818cf8)' : '#64748b'} />
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>

      {/* Footer Info */}
      <div
        style={{
          padding: '16px 20px',
          borderTop: '1px solid #1e293b',
          fontSize: '0.6875rem',
          color: '#475569'
        }}
      >
        <span>CampusLink • BPUT Hackathon 2026</span>
      </div>
    </aside>
  );
}