import React from 'react';
import { X, BookOpen, Send, Calendar } from 'lucide-react';

export default function StudentRiskDetails({ student, onClose, onActionTrigger }) {
  if (!student) return null;

  const getRiskColor = (level) => {
    switch (level) {
      case 'High':
        return { text: 'var(--accent-rose)', bg: 'var(--accent-rose-soft)', border: 'rgba(244, 63, 94, 0.3)' };
      case 'Medium':
        return { text: 'var(--accent-amber)', bg: 'var(--accent-amber-soft)', border: 'rgba(245, 158, 11, 0.3)' };
      default:
        return { text: 'var(--accent-emerald)', bg: 'var(--accent-emerald-soft)', border: 'rgba(16, 185, 129, 0.3)' };
    }
  };

  const riskStyle = getRiskColor(student.riskLevel);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="drawer-student-title"
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        backdropFilter: 'blur(4px)',
        zIndex: 60,
        display: 'flex',
        justifyContent: 'flex-end'
      }}
      onClick={onClose}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '520px',
          backgroundColor: 'var(--bg-card)',
          height: '100%',
          overflowY: 'auto',
          padding: '28px',
          display: 'flex',
          flexDirection: 'column',
          gap: '22px',
          borderLeft: '1px solid var(--border-color)',
          boxShadow: '-10px 0 30px rgba(0,0,0,0.5)'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <span style={{
              fontSize: '0.68rem',
              fontWeight: 700,
              padding: '2px 8px',
              borderRadius: '4px',
              backgroundColor: riskStyle.bg,
              color: riskStyle.text,
              border: `1px solid ${riskStyle.border}`
            }}>
              {student.riskLevel} Placement Risk
            </span>
            <h2 id="drawer-student-title" style={{ fontSize: '1.3rem', fontWeight: 800, color: '#ffffff', marginTop: '6px' }}>
              {student.name}
            </h2>
            <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
              Synthetic Identifier: <strong style={{ color: 'var(--text-secondary)' }}>{student.studentId}</strong> • Branch: {student.branch}
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close details panel"
            style={{
              padding: '6px',
              borderRadius: '8px',
              backgroundColor: 'rgba(255, 255, 255, 0.05)',
              color: 'var(--text-secondary)'
            }}
          >
            <X size={20} />
          </button>
        </div>

        <div style={{
          backgroundColor: 'rgba(15, 23, 42, 0.6)',
          border: '1px solid var(--border-color)',
          borderRadius: '12px',
          padding: '18px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <div>
            <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Calculated Prototype Score
            </div>
            <div style={{ fontSize: '2rem', fontWeight: 800, color: riskStyle.text }}>
              {student.riskScore} <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>/ 100</span>
            </div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
              Band: <strong>{student.riskLevel} Risk</strong>
            </div>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
              Deterministic Rule Model
            </div>
          </div>
        </div>

        <div>
          <h4 style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '10px' }}>
            Factor Analysis
          </h4>
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '10px'
          }}>
            <div style={{ padding: '10px 12px', backgroundColor: 'rgba(255,255,255,0.02)', border: '1px solid var(--border-color)', borderRadius: '8px' }}>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Readiness Score</div>
              <div style={{ fontSize: '1rem', fontWeight: 700, color: student.readinessScore < 60 ? 'var(--accent-rose)' : '#ffffff' }}>
                {student.readinessScore}%
              </div>
            </div>
            <div style={{ padding: '10px 12px', backgroundColor: 'rgba(255,255,255,0.02)', border: '1px solid var(--border-color)', borderRadius: '8px' }}>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Mock Interview</div>
              <div style={{ fontSize: '1rem', fontWeight: 700, color: student.mockInterviewScore < 60 ? 'var(--accent-amber)' : '#ffffff' }}>
                {student.mockInterviewScore}%
              </div>
            </div>
            <div style={{ padding: '10px 12px', backgroundColor: 'rgba(255,255,255,0.02)', border: '1px solid var(--border-color)', borderRadius: '8px' }}>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Applications / Rejections</div>
              <div style={{ fontSize: '1rem', fontWeight: 700, color: '#ffffff' }}>
                {student.applications} apps • {student.rejections} rej
              </div>
            </div>
            <div style={{ padding: '10px 12px', backgroundColor: 'rgba(255,255,255,0.02)', border: '1px solid var(--border-color)', borderRadius: '8px' }}>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Skill Gap Severity</div>
              <div style={{ fontSize: '1rem', fontWeight: 700, color: student.skillGap === 'High' ? 'var(--accent-rose)' : student.skillGap === 'Medium' ? 'var(--accent-amber)' : 'var(--accent-emerald)' }}>
                {student.skillGap}
              </div>
            </div>
          </div>
        </div>

        <div>
          <h4 style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '8px' }}>
            Why This Student Is Flagged
          </h4>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '10px' }}>
            This student is flagged for early intervention based on prototype risk indicators:
          </p>
          <ul style={{ display: 'flex', flexDirection: 'column', gap: '8px', paddingLeft: '4px' }}>
            {student.riskReasons.map((reason, idx) => (
              <li key={idx} style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                <span style={{ color: 'var(--accent-amber)', marginTop: '2px' }}>•</span>
                <span>{reason}</span>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h4 style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '8px' }}>
            Recommended Intervention Strategy
          </h4>
          <div style={{
            backgroundColor: 'var(--accent-blue-soft)',
            border: '1px solid rgba(59, 130, 246, 0.3)',
            borderRadius: '10px',
            padding: '14px',
            display: 'flex',
            alignItems: 'flex-start',
            gap: '10px'
          }}>
            <BookOpen size={18} color="var(--accent-blue)" style={{ flexShrink: 0, marginTop: '2px' }} aria-hidden="true" />
            <div>
              <div style={{ fontSize: '0.82rem', fontWeight: 700, color: '#ffffff' }}>
                {student.recommendedAction}
              </div>
              <div style={{ fontSize: '0.74rem', color: 'var(--text-secondary)', marginTop: '3px' }}>
                Early proactive escalation prevents end-of-season placement backlogs and reinforces core readiness competencies.
              </div>
            </div>
          </div>
        </div>

        <div style={{ marginTop: 'auto', display: 'flex', flexDirection: 'column', gap: '8px', paddingTop: '16px', borderTop: '1px solid var(--border-color)' }}>
          <button
            type="button"
            onClick={() => onActionTrigger(`Demo Action: Mentor escalation session staged for ${student.studentId}.`)}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              backgroundColor: 'var(--accent-blue)',
              color: '#ffffff',
              padding: '10px',
              borderRadius: '8px',
              fontSize: '0.82rem',
              fontWeight: 600
            }}
          >
            <Calendar size={15} aria-hidden="true" />
            Schedule Mentor Intervention (Demo)
          </button>

          <button
            type="button"
            onClick={() => onActionTrigger(`Demo Action: Skill training recommendation logged for ${student.studentId}.`)}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              backgroundColor: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid var(--border-color)',
              color: 'var(--text-primary)',
              padding: '10px',
              borderRadius: '8px',
              fontSize: '0.82rem',
              fontWeight: 600
            }}
          >
            <Send size={15} aria-hidden="true" />
            Assign Targeted Skill Module (Demo)
          </button>
        </div>
      </div>
    </div>
  );
}