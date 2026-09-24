import React from 'react';
import { CheckCircle2, RefreshCw, MapPin, Clock } from 'lucide-react';
import { findAlternativeSlots } from '../../data/mockPlacementData';

export default function ConflictResolution({ drive, allDrives, onActionTrigger }) {
  if (!drive) return null;

  if (!drive.hasConflict) {
    return (
      <div style={{
        backgroundColor: 'var(--accent-emerald-soft)',
        border: '1px solid rgba(16, 185, 129, 0.3)',
        borderRadius: '10px',
        padding: '14px',
        display: 'flex',
        alignItems: 'center',
        gap: '10px'
      }}>
        <CheckCircle2 size={18} color="var(--accent-emerald)" aria-hidden="true" style={{ flexShrink: 0 }} />
        <div>
          <div style={{ fontSize: '0.82rem', fontWeight: 700, color: '#ffffff' }}>
            Schedule Is Conflict-Free
          </div>
          <div style={{ fontSize: '0.74rem', color: 'var(--text-secondary)' }}>
            No venue overlaps, infrastructure collisions, or branch conflicts detected for this booking.
          </div>
        </div>
      </div>
    );
  }

  const { recommendedVenues, recommendedTimeSlots } = findAlternativeSlots(drive, allDrives);

  return (
    <div style={{
      backgroundColor: 'rgba(15, 23, 42, 0.7)',
      border: '1px solid var(--border-color)',
      borderRadius: '12px',
      padding: '16px',
      display: 'flex',
      flexDirection: 'column',
      gap: '14px'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <RefreshCw size={16} color="var(--accent-blue)" aria-hidden="true" />
        <h4 style={{ fontSize: '0.85rem', fontWeight: 700, color: '#ffffff' }}>
          Deterministic Resolution Recommendations
        </h4>
      </div>

      {/* Recommended Alternative Venues */}
      <div>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '5px',
          fontSize: '0.74rem',
          fontWeight: 600,
          color: 'var(--text-secondary)',
          marginBottom: '8px'
        }}>
          <MapPin size={13} aria-hidden="true" />
          <span>Available Conflict-Free Venues on {drive.date} ({drive.startTime}–{drive.endTime}):</span>
        </div>
        {recommendedVenues && recommendedVenues.length > 0 ? (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
            {recommendedVenues.map((v) => (
              <button
                key={v}
                type="button"
                onClick={() => onActionTrigger(`Demo Action: Relocated ${drive.driveId} (${drive.company}) to ${v}.`)}
                style={{
                  fontSize: '0.72rem',
                  padding: '5px 10px',
                  borderRadius: '6px',
                  backgroundColor: 'var(--accent-blue-soft)',
                  border: '1px solid rgba(59, 130, 246, 0.3)',
                  color: 'var(--accent-blue)',
                  fontWeight: 600
                }}
              >
                Switch to {v} (Demo)
              </button>
            ))}
          </div>
        ) : (
          <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
            No unreserved alternative campus venues pass all conflict checks during this specific time window.
          </div>
        )}
      </div>

      {/* Recommended Alternative Time Slots */}
      <div>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '5px',
          fontSize: '0.74rem',
          fontWeight: 600,
          color: 'var(--text-secondary)',
          marginBottom: '8px'
        }}>
          <Clock size={13} aria-hidden="true" />
          <span>Alternative Non-Conflicting Slots for {drive.venue} on {drive.date}:</span>
        </div>
        {recommendedTimeSlots && recommendedTimeSlots.length > 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            {recommendedTimeSlots.map((slot) => (
              <button
                key={slot.label}
                type="button"
                onClick={() => onActionTrigger(`Demo Action: Rescheduled ${drive.driveId} (${drive.company}) to ${slot.label}.`)}
                style={{
                  textAlign: 'left',
                  fontSize: '0.72rem',
                  padding: '6px 10px',
                  borderRadius: '6px',
                  backgroundColor: 'rgba(255, 255, 255, 0.04)',
                  border: '1px solid var(--border-color)',
                  color: 'var(--text-primary)',
                  fontWeight: 500
                }}
              >
                Reschedule to {slot.label} (Demo)
              </button>
            ))}
          </div>
        ) : (
          <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
            No standard open slots remain on {drive.date} that satisfy all venue, resource, and branch constraints.
          </div>
        )}
      </div>
    </div>
  );
}