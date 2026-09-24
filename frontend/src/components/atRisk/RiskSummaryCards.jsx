import React from 'react';
import { AlertOctagon, AlertTriangle, ShieldCheck, UserCheck } from 'lucide-react';

export default function RiskSummaryCards({ students }) {
  const highCount = students.filter(s => s.riskLevel === 'High').length;
  const mediumCount = students.filter(s => s.riskLevel === 'Medium').length;
  const lowCount = students.filter(s => s.riskLevel === 'Low').length;
  const interventionCount = highCount + mediumCount;

  const cards = [
    {
      title: "High Risk Students",
      count: highCount,
      subtext: "Score 61-100 • Immediate focus",
      icon: AlertOctagon,
      bg: "var(--accent-rose-soft)",
      border: "rgba(244, 63, 94, 0.3)",
      color: "var(--accent-rose)"
    },
    {
      title: "Medium Risk Students",
      count: mediumCount,
      subtext: "Score 31-60 • Targeted coaching",
      icon: AlertTriangle,
      bg: "var(--accent-amber-soft)",
      border: "rgba(245, 158, 11, 0.3)",
      color: "var(--accent-amber)"
    },
    {
      title: "Low Risk Students",
      count: lowCount,
      subtext: "Score 0-30 • On track for placement",
      icon: ShieldCheck,
      bg: "var(--accent-emerald-soft)",
      border: "rgba(16, 185, 129, 0.3)",
      color: "var(--accent-emerald)"
    },
    {
      title: "Students Needing Intervention",
      count: interventionCount,
      subtext: "Eligible for mentor/skill escalation",
      icon: UserCheck,
      bg: "var(--accent-blue-soft)",
      border: "rgba(59, 130, 246, 0.3)",
      color: "var(--accent-blue)"
    }
  ];

  return (
    <div className="dashboard-grid-cards">
      {cards.map((card) => {
        const Icon = card.icon;
        return (
          <div
            key={card.title}
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
                {card.title}
              </span>
              <div style={{
                width: '36px',
                height: '36px',
                borderRadius: '8px',
                backgroundColor: card.bg,
                border: `1px solid ${card.border}`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: card.color
              }}>
                <Icon size={18} aria-hidden="true" />
              </div>
            </div>

            <div>
              <div style={{ fontSize: '1.85rem', fontWeight: 800, color: '#ffffff', letterSpacing: '-0.03em' }}>
                {card.count}
              </div>
              <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                {card.subtext}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}