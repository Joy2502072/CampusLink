import React, { useEffect, useState } from 'react';
import {
  CheckCircle2,
  RefreshCw,
  MapPin,
  Clock
} from 'lucide-react';

const API_BASE = 'http://localhost:5000/api';

const API_HEADERS = {
  'X-Demo-User-Role': 'placement_officer'
};

export default function ConflictResolution({
  drive,
  onActionTrigger
}) {
  const [alternatives, setAlternatives] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!drive?.hasConflict) {
      setAlternatives([]);
      return;
    }

    let cancelled = false;

    const loadAlternatives = async () => {
      try {
        setLoading(true);

        const response = await fetch(
          `${API_BASE}/scheduler/alternatives/${drive.driveId}`,
          {
            headers: API_HEADERS
          }
        );

        if (!response.ok) {
          throw new Error(
            'Failed to load alternative schedule slots.'
          );
        }

        const result = await response.json();

        if (!cancelled) {
          setAlternatives(
            result?.data?.alternatives || []
          );
        }
      } catch (error) {
        console.error(
          'Alternative schedule API error:',
          error
        );

        if (!cancelled) {
          setAlternatives([]);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    loadAlternatives();

    return () => {
      cancelled = true;
    };
  }, [drive]);

  if (!drive) return null;

  if (!drive.hasConflict) {
    return (
      <div
        style={{
          backgroundColor:
            'var(--accent-emerald-soft)',
          border:
            '1px solid rgba(16, 185, 129, 0.3)',
          borderRadius: '10px',
          padding: '14px',
          display: 'flex',
          alignItems: 'center',
          gap: '10px'
        }}
      >
        <CheckCircle2
          size={18}
          color="var(--accent-emerald)"
        />

        <div>
          <div
            style={{
              fontSize: '0.82rem',
              fontWeight: 700,
              color: '#ffffff'
            }}
          >
            Schedule Is Conflict-Free
          </div>

          <div
            style={{
              fontSize: '0.74rem',
              color: 'var(--text-secondary)'
            }}
          >
            No venue, resource, or branch conflict was
            detected for this schedule.
          </div>
        </div>
      </div>
    );
  }

  const venueAlternatives = [];
  const timeAlternatives = [];

  alternatives.forEach((alternative) => {
    if (
      alternative.venue &&
      !venueAlternatives.some(
        (item) => item.venue === alternative.venue
      )
    ) {
      venueAlternatives.push(alternative);
    }

    if (
      alternative.startTime &&
      alternative.endTime &&
      !timeAlternatives.some(
        (item) =>
          item.startTime === alternative.startTime &&
          item.endTime === alternative.endTime
      )
    ) {
      timeAlternatives.push(alternative);
    }
  });

  return (
    <div
      style={{
        backgroundColor:
          'rgba(15, 23, 42, 0.7)',
        border:
          '1px solid var(--border-color)',
        borderRadius: '12px',
        padding: '16px',
        display: 'flex',
        flexDirection: 'column',
        gap: '14px'
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}
      >
        <RefreshCw
          size={16}
          color="var(--accent-blue)"
        />

        <h4
          style={{
            fontSize: '0.85rem',
            fontWeight: 700,
            color: '#ffffff'
          }}
        >
          AI Scheduler Resolution Recommendations
        </h4>
      </div>

      {loading ? (
        <div
          style={{
            fontSize: '0.74rem',
            color: 'var(--text-muted)'
          }}
        >
          Finding conflict-free alternatives...
        </div>
      ) : (
        <>
          <div>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '5px',
                fontSize: '0.74rem',
                fontWeight: 600,
                color: 'var(--text-secondary)',
                marginBottom: '8px'
              }}
            >
              <MapPin size={13} />
              <span>
                Available conflict-free venues
              </span>
            </div>

            {venueAlternatives.length > 0 ? (
              <div
                style={{
                  display: 'flex',
                  flexWrap: 'wrap',
                  gap: '6px'
                }}
              >
                {venueAlternatives.map(
                  (alternative) => (
                    <button
                      key={`${alternative.date}-${alternative.startTime}-${alternative.venue}`}
                      type="button"
                      onClick={() =>
                        onActionTrigger(
                          `Recommended venue selected: ${alternative.venue} for ${drive.driveId}.`
                        )
                      }
                      style={{
                        fontSize: '0.72rem',
                        padding: '5px 10px',
                        borderRadius: '6px',
                        backgroundColor:
                          'var(--accent-blue-soft)',
                        border:
                          '1px solid rgba(59, 130, 246, 0.3)',
                        color:
                          'var(--accent-blue)',
                        fontWeight: 600
                      }}
                    >
                      {alternative.venue}
                    </button>
                  )
                )}
              </div>
            ) : (
              <div
                style={{
                  fontSize: '0.72rem',
                  color: 'var(--text-muted)'
                }}
              >
                No alternative venue found.
              </div>
            )}
          </div>

          <div>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '5px',
                fontSize: '0.74rem',
                fontWeight: 600,
                color: 'var(--text-secondary)',
                marginBottom: '8px'
              }}
            >
              <Clock size={13} />
              <span>
                Alternative time slots
              </span>
            </div>

            {timeAlternatives.length > 0 ? (
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '6px'
                }}
              >
                {timeAlternatives.map(
                  (alternative) => (
                    <button
                      key={`${alternative.date}-${alternative.startTime}-${alternative.endTime}-${alternative.venue}`}
                      type="button"
                      onClick={() =>
                        onActionTrigger(
                          `Recommended time selected: ${alternative.startTime}–${alternative.endTime} for ${drive.driveId}.`
                        )
                      }
                      style={{
                        textAlign: 'left',
                        fontSize: '0.72rem',
                        padding: '6px 10px',
                        borderRadius: '6px',
                        backgroundColor:
                          'rgba(255, 255, 255, 0.04)',
                        border:
                          '1px solid var(--border-color)',
                        color:
                          'var(--text-primary)',
                        fontWeight: 500
                      }}
                    >
                      {alternative.date} •{' '}
                      {alternative.startTime}–
                      {alternative.endTime} •{' '}
                      {alternative.venue}
                    </button>
                  )
                )}
              </div>
            ) : (
              <div
                style={{
                  fontSize: '0.72rem',
                  color: 'var(--text-muted)'
                }}
              >
                No alternative time slot found.
              </div>
            )}
          </div>
        </>
      )}

      <div
        style={{
          fontSize: '0.68rem',
          color: 'var(--text-muted)',
          paddingTop: '4px'
        }}
      >
        Recommendations are generated from the current
        scheduler database state.
      </div>
    </div>
  );
}