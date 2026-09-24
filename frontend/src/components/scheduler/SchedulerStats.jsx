import React from 'react';
import { CalendarDays, AlertOctagon, Building2, Clock } from 'lucide-react';

export default function SchedulerStats({ drives, campusVenues }) {
  const totalDrives = drives.length;
  // Dynamic count of all drives flagged with Critical, High, or Medium conflicts
  const conflictCount = drives.filter(d => d.hasConflict).length;
  
  // Calculate distinct occupied venues vs campus total
  const occupiedVenuesCount = new Set(drives.map(d => d.venue)).size;
  const availableVenuesCount = Math.max(0, campusVenues.length - occupiedVenuesCount);

  // Target date simulation count (2026-09-28 simulated horizon)
  const todayDrivesCount = drives.filter(d => d.date === '2026-09-28').length;

  const stats = [
    {
      title: 'Total Scheduled Drives',
      value: totalDrives,
      subtext: 'Across 3 calendar days',
      icon: CalendarDays,
      bg: 'var(--accent-blue-soft)',
      border: 'rgba(59, 130, 246, 0.3)',
      color: 'var(--accent-blue)'
    },
    {
      title: 'Active Conflicts Detected',
      value: conflictCount,
      subtext: 'Requires placement cell review',
      icon: AlertOctagon,
      bg: conflictCount > 0 ? 'var(--accent-rose-soft)' : 'var(--accent-emerald-soft)',
      border: conflictCount > 0 ? 'rgba(244, 63, 94, 0.3)' : 'rgba(16, 185, 129, 0.3)',
      color: conflictCount > 0 ? 'var(--accent-rose)' : 'var(--accent-emerald)'
    },
    {
      title: 'Venue Availability',
      value: `${availableVenuesCount} / ${campusVenues.length}`,
      subtext: `${occupiedVenuesCount} venues currently assigned`,
      icon: Building2,
      bg: 'var(--accent-amber-soft)',
      border: 'rgba(245, 158, 11, 0.3)',
      color: 'var(--accent-amber)'
    },
    {
      title: "Today's Active Drives",
      value: todayDrivesCount,
      subtext: 'Date: 2026-09-28 (Simulated)',
      icon: Clock,
      bg: 'var(--accent-violet-soft)',
      border: 'rgba(139, 92, 246, 0.3)',
      color: 'var(--accent-violet)'
    }
  ];

  return (
    <div className="dashboard-grid-cards">
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
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
              <span style={{ fontSize: '0.76rem', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                {stat.title}
              </span>
              <div style={{
                width: '36px',
                height: '36px',
                borderRadius: '8px',
                backgroundColor: stat.bg,
                border: `1px solid ${stat.border}`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: stat.color
              }}>
                <Icon size={18} aria-hidden="true" />
              </div>
            </div>

            <div>
              <div style={{ fontSize: '1.85rem', fontWeight: 800, color: '#ffffff', letterSpacing: '-0.03em' }}>
                {stat.value}
              </div>
              <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                {stat.subtext}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}