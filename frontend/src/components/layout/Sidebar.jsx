import React from 'react';
import {
  LayoutDashboard,
  UserCheck,
  Briefcase,
  AlertTriangle,
  Award,
  Target,
  FileSearch,
  Calendar,
  FileCheck,
  BarChart3,
  BookOpen,
  MessageSquare
} from 'lucide-react';

export default function Sidebar({ activeTab, onSelectTab }) {
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'student-portal', label: 'Student Portal', icon: UserCheck },
    { id: 'recruiter-workflow', label: 'Recruiter Workflow', icon: Briefcase },
    { id: 'at-risk', label: 'At-Risk Students', icon: AlertTriangle },
    { id: 'readiness', label: 'Student Readiness', icon: Award },
    { id: 'matching', label: 'Job Matching', icon: Target },
    { id: 'skill-gap', label: 'Skill Gap Analysis', icon: FileSearch },
    { id: 'drives', label: 'Scheduler', icon: Calendar },
    { id: 'offers', label: 'Offer & Documents', icon: FileCheck },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
    { id: 'curriculum-intelligence', label: 'Curriculum Intelligence', icon: BookOpen },
    { id: 'communication', label: 'Communication Hub', icon: MessageSquare }
  ];

  return (
    <aside
      style={{
        width: '260px',
        backgroundColor: '#0a0f1d',
        borderRight: '1px solid #1e293b',
        display: 'flex',
        flexDirection: 'column',
        height: '100vh',
        position: 'sticky',
        top: 0
      }}
    >
      {/* Brand Header */}
      <div
        style={{
          padding: '24px 20px',
          borderBottom: '1px solid #1e293b',
          display: 'flex',
          alignItems: 'center',
          gap: '10px'
        }}
      >
        <div
          style={{
            width: '36px',
            height: '36px',
            borderRadius: '8px',
            backgroundColor: '#6366f1',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#fff',
            fontWeight: 800,
            fontSize: '18px'
          }}
        >
          C
        </div>
        <div>
          <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#fff', letterSpacing: '-0.02em' }}>
            CampusLink
          </div>
          <div style={{ fontSize: '10px', color: '#818cf8', fontWeight: 600, letterSpacing: '0.05em' }}>
            BPUT PLACEMENT COMMAND
          </div>
        </div>
      </div>

      {/* Nav Menu */}
      <nav style={{ padding: '16px 12px', flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '4px' }}>
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;

          return (
            <button
              key={item.id}
              type="button"
              onClick={() => onSelectTab && onSelectTab(item.id)}
              style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '10px 14px',
                borderRadius: '8px',
                border: 'none',
                backgroundColor: isActive ? 'rgba(99, 102, 241, 0.15)' : 'transparent',
                color: isActive ? '#a5b4fc' : '#94a3b8',
                fontWeight: isActive ? 700 : 500,
                fontSize: '0.875rem',
                cursor: 'pointer',
                textAlign: 'left',
                transition: 'all 0.15s ease'
              }}
            >
              <Icon size={18} color={isActive ? '#818cf8' : '#64748b'} />
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>

      {/* User Session Footer */}
      <div
        style={{
          padding: '16px 20px',
          borderTop: '1px solid #1e293b',
          fontSize: '0.75rem',
          color: '#64748b',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}
      >
        <span>Role: Placement Officer</span>
        <span style={{ color: '#10b981' }}>Live Demo</span>
      </div>
    </aside>
  );
}