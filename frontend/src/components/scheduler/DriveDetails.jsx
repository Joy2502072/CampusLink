import React from 'react';
import { X, Calendar, Clock, MapPin, AlertOctagon, CheckSquare, Layers } from 'lucide-react';
import ConflictBadge from './ConflictBadge';
import ConflictResolution from './ConflictResolution';

export default function DriveDetails({ drive, allDrives, onClose, onActionTrigger }) {
  if (!drive) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="drive-drawer-title"
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
          maxWidth: '540px',
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
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
              <ConflictBadge severity={drive.conflictSeverity} />
              <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 600 }}>
                {drive.driveId}
              </span>
            </div>
            <h2 id="drive-drawer-title" style={{ fontSize: '1.3rem', fontWeight: 800, color: '#ffffff' }}>
              {drive.company}
            </h2>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
              {drive.role} • Status: <strong style={{ color: 'var(--text-primary)' }}>{drive.status}</strong>
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close drive details panel"
            style={{
              padding: '6px',
              borderRadius: '8px',
              backgroundColor: 'rgba(255, 255, 255, 0.05)',
              color: 'var(--text-secondary)'
            }}
          >
            <X size={20} aria-hidden="true" />
          </button>
        </div>

        {/* Schedule Metadata Matrix */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '12px',
          padding: '14px',
          backgroundColor: 'rgba(15, 23, 42, 0.5)',
          border: '1px solid var(--border-color)',
          borderRadius: '10px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Calendar size={16} color="var(--accent-blue)" aria-hidden="true" style={{ flexShrink: 0 }} />
            <div>
              <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>Date</div>
              <div style={{ fontSize: '0.82rem', fontWeight: 600, color: '#ffffff' }}>{drive.date}</div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Clock size={16} color="var(--accent-blue)" aria-hidden="true" style={{ flexShrink: 0 }} />
            <div>
              <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>Time Slot</div>
              <div style={{ fontSize: '0.82rem', fontWeight: 600, color: '#ffffff' }}>
                {drive.startTime} – {drive.endTime}
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <MapPin size={16} color="var(--accent-amber)" aria-hidden="true" style={{ flexShrink: 0 }} />
            <div>
              <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>Assigned Venue</div>
              <div style={{ fontSize: '0.82rem', fontWeight: 600, color: '#ffffff' }}>{drive.venue}</div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Layers size={16} color="var(--accent-emerald)" aria-hidden="true" style={{ flexShrink: 0 }} />
            <div>
              <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>Target Branches</div>
              <div style={{ fontSize: '0.82rem', fontWeight: 600, color: '#ffffff' }}>
                {drive.eligibleBranches ? drive.eligibleBranches.join(', ') : 'All'}
              </div>
            </div>
          </div>
        </div>

        {/* Required Resources List */}
        <div>
          <h4 style={{
            fontSize: '0.78rem',
            fontWeight: 700,
            color: 'var(--text-secondary)',
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
            marginBottom: '8px'
          }}>
            Required Infrastructure &amp; Hardware
          </h4>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
            {drive.requiredResources && drive.requiredResources.map((res) => (
              <span
                key={res}
                style={{
                  fontSize: '0.72rem',
                  padding: '4px 10px',
                  borderRadius: '6px',
                  backgroundColor: 'rgba(255, 255, 255, 0.04)',
                  border: '1px solid var(--border-color)',
                  color: 'var(--text-primary)'
                }}
              >
                {res}
              </span>
            ))}
          </div>
        </div>

        {/* Conflict Explanations */}
        {drive.hasConflict && (
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px' }}>
              <AlertOctagon size={16} color="var(--accent-rose)" aria-hidden="true" />
              <h4 style={{
                fontSize: '0.78rem',
                fontWeight: 700,
                color: 'var(--accent-rose)',
                textTransform: 'uppercase',
                letterSpacing: '0.05em'
              }}>
                Conflict Diagnosis ({drive.conflictSeverity})
              </h4>
            </div>
            <ul style={{ display: 'flex', flexDirection: 'column', gap: '8px', paddingLeft: '4px' }}>
              {drive.conflictReasons && drive.conflictReasons.map((reason, idx) => (
                <li key={idx} style={{ fontSize: '0.76rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                  <span style={{ color: 'var(--accent-rose)', marginRight: '6px' }}>•</span>
                  {reason}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Conflict Resolution Recommendations Component */}
        <ConflictResolution
          drive={drive}
          allDrives={allDrives}
          onActionTrigger={onActionTrigger}
        />

        {/* Demo Action Footer */}
        <div style={{
          marginTop: 'auto',
          display: 'flex',
          flexDirection: 'column',
          gap: '8px',
          paddingTop: '16px',
          borderTop: '1px solid var(--border-color)'
        }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
            <button
              type="button"
              onClick={() => onActionTrigger(`Demo Action: Change Venue modal staged for ${drive.driveId}.`)}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px',
                backgroundColor: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid var(--border-color)',
                color: 'var(--text-primary)',
                padding: '9px',
                borderRadius: '8px',
                fontSize: '0.78rem',
                fontWeight: 600
              }}
            >
              <MapPin size={14} aria-hidden="true" />
              Change Venue (Demo)
            </button>

            <button
              type="button"
              onClick={() => onActionTrigger(`Demo Action: Reschedule window opened for ${drive.driveId}.`)}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px',
                backgroundColor: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid var(--border-color)',
                color: 'var(--text-primary)',
                padding: '9px',
                borderRadius: '8px',
                fontSize: '0.78rem',
                fontWeight: 600
              }}
            >
              <Clock size={14} aria-hidden="true" />
              Reschedule Drive (Demo)
            </button>
          </div>

          <button
            type="button"
            onClick={() => onActionTrigger(`Demo Action: Conflict resolution overrides simulated for ${drive.driveId}.`)}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              backgroundColor: 'var(--accent-blue)',
              color: '#ffffff',
              padding: '10px',
              borderRadius: '8px',
              fontSize: '0.82rem',
              fontWeight: 600
            }}
          >
            <CheckSquare size={15} aria-hidden="true" />
            Resolve Conflict in Calendar (Demo)
          </button>
        </div>
      </div>
    </div>
  );
}