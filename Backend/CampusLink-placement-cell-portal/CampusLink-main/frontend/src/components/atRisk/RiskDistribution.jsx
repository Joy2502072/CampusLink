import React from 'react';

export default function RiskDistribution({ students = [] }) {
  const highRisk = students.filter(
    (student) => student.riskLevel === 'High Risk'
  ).length;

  const mediumRisk = students.filter(
    (student) => student.riskLevel === 'Medium Risk'
  ).length;

  const lowRisk = students.filter(
    (student) => student.riskLevel === 'Low Risk'
  ).length;

  const total = students.length;

  const highPercentage = total
    ? ((highRisk / total) * 100).toFixed(1)
    : '0.0';

  const mediumPercentage = total
    ? ((mediumRisk / total) * 100).toFixed(1)
    : '0.0';

  const lowPercentage = total
    ? ((lowRisk / total) * 100).toFixed(1)
    : '0.0';

  return (
    <div
      style={{
        backgroundColor: 'var(--bg-card)',
        border: '1px solid var(--border-color)',
        borderRadius: '12px',
        padding: '20px'
      }}
    >
      {/* Header */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          marginBottom: '16px',
          gap: '12px'
        }}
      >
        <div>
          <h3
            style={{
              color: '#ffffff',
              fontSize: '0.95rem',
              fontWeight: 700,
              marginBottom: '5px'
            }}
          >
            Cohort Risk Profile Distribution
          </h3>

          <p
            style={{
              color: 'var(--text-secondary)',
              fontSize: '0.72rem'
            }}
          >
            Proportional breakdown of monitored cohort across prototype risk
            bands
          </p>
        </div>

        <div
          style={{
            backgroundColor: 'rgba(148, 163, 184, 0.08)',
            color: 'var(--text-secondary)',
            padding: '7px 10px',
            borderRadius: '6px',
            fontSize: '0.7rem',
            whiteSpace: 'nowrap'
          }}
        >
          Total Sample: {total} Students
        </div>
      </div>

      {/* Distribution Bar */}
      <div
        style={{
          width: '100%',
          height: '10px',
          backgroundColor: '#273449',
          borderRadius: '999px',
          overflow: 'hidden',
          display: 'flex'
        }}
      >
        {highRisk > 0 && (
          <div
            style={{
              width: `${highPercentage}%`,
              backgroundColor: '#ef4444',
              height: '100%'
            }}
          />
        )}

        {mediumRisk > 0 && (
          <div
            style={{
              width: `${mediumPercentage}%`,
              backgroundColor: '#f59e0b',
              height: '100%'
            }}
          />
        )}

        {lowRisk > 0 && (
          <div
            style={{
              width: `${lowPercentage}%`,
              backgroundColor: '#10b981',
              height: '100%'
            }}
          />
        )}
      </div>

      {/* Legend */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: '16px',
          marginTop: '18px'
        }}
      >
        {/* High */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}
        >
          <span
            style={{
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              backgroundColor: '#ef4444',
              flexShrink: 0
            }}
          />

          <span
            style={{
              color: 'var(--text-secondary)',
              fontSize: '0.75rem'
            }}
          >
            High Risk:{' '}
            <strong style={{ color: '#ffffff' }}>
              {highRisk}
            </strong>{' '}
            ({highPercentage}%)
          </span>
        </div>

        {/* Medium */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}
        >
          <span
            style={{
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              backgroundColor: '#f59e0b',
              flexShrink: 0
            }}
          />

          <span
            style={{
              color: 'var(--text-secondary)',
              fontSize: '0.75rem'
            }}
          >
            Medium Risk:{' '}
            <strong style={{ color: '#ffffff' }}>
              {mediumRisk}
            </strong>{' '}
            ({mediumPercentage}%)
          </span>
        </div>

        {/* Low */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}
        >
          <span
            style={{
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              backgroundColor: '#10b981',
              flexShrink: 0
            }}
          />

          <span
            style={{
              color: 'var(--text-secondary)',
              fontSize: '0.75rem'
            }}
          >
            Low Risk:{' '}
            <strong style={{ color: '#ffffff' }}>
              {lowRisk}
            </strong>{' '}
            ({lowPercentage}%)
          </span>
        </div>
      </div>
    </div>
  );
}