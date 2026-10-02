import React from 'react';
import {
  User,
  AlertTriangle,
  Target,
  CheckCircle2,
  Clock,
  BookOpen,
  Award,
  MessageSquare,
  Briefcase,
  X
} from 'lucide-react';

export default function StudentRiskDetails({
  student,
  onClose,
  interventions = [],
  onUpdateStatus,
  onCreateAction
}) {
  if (!student) return null;

  const stats = student.applicationStats || {};
  const dimensions = student.dimensions || {};

  const getRiskBadge = (level) => {
    const l = (level || '').toLowerCase();
    if (l === 'high risk') {
      return { bg: 'rgba(239, 68, 68, 0.15)', color: '#f87171', border: 'rgba(239, 68, 68, 0.3)' };
    }
    if (l === 'medium risk' || l === 'moderate risk') {
      return { bg: 'rgba(245, 158, 11, 0.15)', color: '#fbbf24', border: 'rgba(245, 158, 11, 0.3)' };
    }
    return { bg: 'rgba(59, 130, 246, 0.15)', color: '#60a5fa', border: 'rgba(59, 130, 246, 0.3)' };
  };

  const riskBadge = getRiskBadge(student.riskLevel);

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '20px',
        color: '#f8fafc'
      }}
    >
      {/* Header bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <User size={18} color="#818cf8" />
          <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 800 }}>
            Candidate Profile &amp; Intervention History
          </h3>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            style={{
              background: 'transparent',
              border: 'none',
              color: '#94a3b8',
              cursor: 'pointer',
              padding: '4px'
            }}
          >
            <X size={18} />
          </button>
        )}
      </div>

      {/* Main Student Card */}
      <div
        style={{
          padding: '16px',
          backgroundColor: 'rgba(30, 41, 59, 0.45)',
          borderRadius: '10px',
          border: '1px solid #334155',
          display: 'flex',
          flexDirection: 'column',
          gap: '12px'
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <div style={{ fontSize: '1.1rem', fontWeight: 700, color: '#ffffff' }}>
              {student.name}
            </div>
            <div style={{ fontSize: '0.75rem', color: '#818cf8', fontFamily: 'monospace', marginTop: '2px' }}>
              {student.id}
            </div>
          </div>
          <span
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              padding: '3px 10px',
              borderRadius: '999px',
              fontSize: '11px',
              fontWeight: 700,
              backgroundColor: riskBadge.bg,
              color: riskBadge.color,
              border: `1px solid ${riskBadge.border}`
            }}
          >
            {student.riskLevel}
          </span>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', fontSize: '0.8125rem', color: '#cbd5e1' }}>
          <div>Branch: <strong style={{ color: '#fff' }}>{student.branch || 'General'}</strong></div>
          <div>CGPA: <strong style={{ color: '#fff' }}>{Number(student.cgpa || 0).toFixed(2)}</strong></div>
          <div>Readiness: <strong style={{ color: '#fff' }}>{student.readinessScore}/100</strong></div>
          <div>Band: <strong style={{ color: '#fff' }}>{student.readinessBand || 'Developing'}</strong></div>
        </div>

        {/* Application Stats */}
        {stats.totalApplications > 0 && (
          <div
            style={{
              padding: '8px 12px',
              backgroundColor: 'rgba(15, 23, 42, 0.6)',
              borderRadius: '6px',
              fontSize: '0.75rem',
              color: '#94a3b8',
              display: 'flex',
              justifyContent: 'space-between'
            }}
          >
            <span>Total Applied: <strong style={{ color: '#cbd5e1' }}>{stats.totalApplications}</strong></span>
            <span>Rejected: <strong style={{ color: '#f87171' }}>{stats.rejectedApplications}</strong></span>
            <span>Rejection Rate: <strong style={{ color: stats.rejectionRate >= 60 ? '#f87171' : '#34d399' }}>{stats.rejectionRate}%</strong></span>
          </div>
        )}
      </div>

      {/* Deterministic Readiness Dimensions (No Mock Interview) */}
      <div>
        <span style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', color: '#94a3b8', display: 'block', marginBottom: '8px' }}>
          Deterministic Readiness Dimensions
        </span>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '8px' }}>
          <div style={{ padding: '8px 10px', backgroundColor: 'rgba(30, 41, 59, 0.35)', borderRadius: '6px', border: '1px solid #334155' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '0.75rem', color: '#a5b4fc' }}>
              <BookOpen size={12} /> Academics (25 max)
            </div>
            <div style={{ fontSize: '1rem', fontWeight: 700, color: '#fff', marginTop: '2px', fontFamily: 'monospace' }}>
              {dimensions.academics ?? '--'}
            </div>
          </div>

          <div style={{ padding: '8px 10px', backgroundColor: 'rgba(30, 41, 59, 0.35)', borderRadius: '6px', border: '1px solid #334155' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '0.75rem', color: '#34d399' }}>
              <Award size={12} /> Technical (30 max)
            </div>
            <div style={{ fontSize: '1rem', fontWeight: 700, color: '#fff', marginTop: '2px', fontFamily: 'monospace' }}>
              {dimensions.technical ?? dimensions.technicalSkills ?? '--'}
            </div>
          </div>

          <div style={{ padding: '8px 10px', backgroundColor: 'rgba(30, 41, 59, 0.35)', borderRadius: '6px', border: '1px solid #334155' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '0.75rem', color: '#fbbf24' }}>
              <MessageSquare size={12} /> Communication (25)
            </div>
            <div style={{ fontSize: '1rem', fontWeight: 700, color: '#fff', marginTop: '2px', fontFamily: 'monospace' }}>
              {dimensions.communication ?? '--'}
            </div>
          </div>

          <div style={{ padding: '8px 10px', backgroundColor: 'rgba(30, 41, 59, 0.35)', borderRadius: '6px', border: '1px solid #334155' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '0.75rem', color: '#60a5fa' }}>
              <Briefcase size={12} /> Practical (20 max)
            </div>
            <div style={{ fontSize: '1rem', fontWeight: 700, color: '#fff', marginTop: '2px', fontFamily: 'monospace' }}>
              {dimensions.practical ?? dimensions.practicalExperience ?? '--'}
            </div>
          </div>
        </div>
      </div>

      {/* Next Recommended Action */}
      <div
        style={{
          padding: '14px',
          backgroundColor: 'rgba(99, 102, 241, 0.1)',
          borderRadius: '8px',
          border: '1px solid rgba(99, 102, 241, 0.3)',
          display: 'flex',
          flexDirection: 'column',
          gap: '6px'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.75rem', fontWeight: 700, color: '#a5b4fc', textTransform: 'uppercase' }}>
          <Target size={14} color="#818cf8" /> Next Recommended Action
        </div>
        <div style={{ fontSize: '0.8125rem', color: '#f1f5f9', lineHeight: 1.45 }}>
          {student.recommendedAction || student.primaryReason || 'Schedule 1-on-1 placement mentoring check-in.'}
        </div>
      </div>

      {/* Risk Attribution Reasons */}
      <div>
        <span style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', color: '#94a3b8', display: 'block', marginBottom: '8px' }}>
          Risk Attribution Factors
        </span>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {student.reasons && student.reasons.length > 0 ? (
            student.reasons.map((r, i) => (
              <div
                key={i}
                style={{
                  padding: '8px 12px',
                  backgroundColor: 'rgba(239, 68, 68, 0.08)',
                  borderRadius: '6px',
                  border: '1px solid rgba(239, 68, 68, 0.2)',
                  fontSize: '0.8125rem',
                  color: '#cbd5e1'
                }}
              >
                • {r}
              </div>
            ))
          ) : (
            <div style={{ fontSize: '0.8125rem', color: '#94a3b8' }}>
              {student.primaryReason || 'Identified for proactive placement supervision.'}
            </div>
          )}
        </div>
      </div>

      {/* Active Interventions Timeline */}
      <div>
        <span style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', color: '#94a3b8', display: 'block', marginBottom: '8px' }}>
          Intervention History ({interventions.length})
        </span>
        {interventions.length > 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {interventions.map((action) => (
              <div
                key={action.id}
                style={{
                  padding: '10px 12px',
                  backgroundColor: 'rgba(30, 41, 59, 0.5)',
                  border: '1px solid #334155',
                  borderRadius: '6px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '6px'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.75rem', color: '#818cf8', fontWeight: 700 }}>
                    {action.createdAt} • {action.actionType}
                  </span>
                  <span
                    style={{
                      fontSize: '10px',
                      padding: '2px 6px',
                      borderRadius: '4px',
                      backgroundColor: action.status === 'Completed' ? 'rgba(16, 185, 129, 0.15)' : 'rgba(245, 158, 11, 0.15)',
                      color: action.status === 'Completed' ? '#34d399' : '#fbbf24'
                    }}
                  >
                    {action.status}
                  </span>
                </div>
                <div style={{ fontSize: '0.8125rem', color: '#cbd5e1' }}>
                  "{action.note}"
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div style={{ fontSize: '0.75rem', color: '#64748b', fontStyle: 'italic' }}>
            No recorded interventions logged yet.
          </div>
        )}
      </div>
    </div>
  );
}