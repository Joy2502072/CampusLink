import React from 'react';
import { BarChart2, Database } from 'lucide-react';

function ensureLpaUnit(val) {
  if (val === null || val === undefined || val === '') return '0 LPA';
  const str = String(val).trim();
  if (/lpa$/i.test(str)) {
    return str;
  }
  return `${str} LPA`;
}

export default function SalaryTrendChart({ packageData, loading }) {
  if (loading) {
    return (
      <div
        style={{
          backgroundColor: 'var(--bg-card, #0f172a)',
          border: '1px solid var(--border-color, #1e293b)',
          borderRadius: '12px',
          padding: '24px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '320px'
        }}
      >
        <span style={{ color: 'var(--text-muted, #64748b)', fontSize: '0.875rem' }}>
          Loading package distribution...
        </span>
      </div>
    );
  }

  // Fallback if data is missing or empty
  if (!packageData) {
    return (
      <div
        style={{
          backgroundColor: 'var(--bg-card, #0f172a)',
          border: '1px solid var(--border-color, #1e293b)',
          borderRadius: '12px',
          padding: '24px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '320px'
        }}
      >
        <span style={{ color: 'var(--text-muted, #64748b)', fontSize: '0.875rem' }}>
          Package distribution data is unavailable.
        </span>
      </div>
    );
  }

  // Extract distribution brackets from backend analytics response
  const rawDistribution = Array.isArray(packageData.distribution) ? packageData.distribution : [];

  // Normalize range and count keys
  const distribution = rawDistribution.map((item) => ({
    range: item.range || 'Unspecified',
    count: Number(item.offerCount ?? item.count ?? 0)
  }));

  const maxCount = Math.max(...distribution.map((d) => d.count), 1);
  const totalOffersCount = distribution.reduce((sum, d) => sum + d.count, 0);

  const highestPkg = ensureLpaUnit(
    packageData.highestPackageLPA || packageData.highestPackage || packageData.highestPackageNumeric || packageData.highestNumeric
  );
  const averagePkg = ensureLpaUnit(
    packageData.averagePackageLPA || packageData.averagePackage || packageData.averagePackageNumeric || packageData.averageNumeric
  );
  const lowestPkg = ensureLpaUnit(
    packageData.lowestPackageLPA || packageData.lowestPackage || packageData.lowestPackageNumeric || packageData.lowestNumeric
  );

  return (
    <div
      style={{
        backgroundColor: 'var(--bg-card, #0f172a)',
        border: '1px solid var(--border-color, #1e293b)',
        borderRadius: '12px',
        padding: '24px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        gap: '20px',
        boxSizing: 'border-box'
      }}
    >
      {/* Header */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px', marginBottom: '6px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <BarChart2 size={18} color="var(--accent-teal, #14b8a6)" />
            <h2 style={{ margin: 0, fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary, #ffffff)', letterSpacing: '-0.01em' }}>
              Placement Package Distribution
            </h2>
          </div>

          <span
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px',
              padding: '2px 8px',
              borderRadius: '6px',
              fontSize: '10px',
              fontWeight: 600,
              textTransform: 'uppercase',
              letterSpacing: '0.04em',
              backgroundColor: 'rgba(20, 184, 166, 0.12)',
              color: 'var(--accent-teal, #14b8a6)',
              border: '1px solid rgba(20, 184, 166, 0.25)'
            }}
          >
            <Database size={10} />
            Live Analytics
          </span>
        </div>

        <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--text-secondary, #94a3b8)' }}>
          Current offer distribution across package ranges
        </p>
      </div>

      {/* Package Brackets Histogram / Bars */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {distribution.length > 0 ? (
          distribution.map((item) => {
            const barWidthPercent = (item.count / maxCount) * 100;
            const percentageOfTotal = totalOffersCount > 0 ? Math.round((item.count / totalOffersCount) * 100) : 0;

            return (
              <div key={item.range} style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.8125rem' }}>
                  <span style={{ color: 'var(--text-primary, #f1f5f9)', fontWeight: 600 }}>
                    {item.range}
                  </span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ color: 'var(--text-muted, #64748b)', fontSize: '0.75rem' }}>
                      {percentageOfTotal}%
                    </span>
                    <span
                      style={{
                        color: 'var(--accent-teal, #14b8a6)',
                        fontWeight: 700,
                        fontFamily: 'monospace',
                        minWidth: '40px',
                        textAlign: 'right'
                      }}
                    >
                      {item.count} {item.count === 1 ? 'offer' : 'offers'}
                    </span>
                  </div>
                </div>

                <div
                  style={{
                    width: '100%',
                    height: '8px',
                    backgroundColor: 'rgba(30, 41, 59, 0.8)',
                    borderRadius: '999px',
                    overflow: 'hidden'
                  }}
                  role="progressbar"
                  aria-valuenow={item.count}
                  aria-valuemin={0}
                  aria-valuemax={maxCount}
                  aria-label={`${item.range} count: ${item.count}`}
                >
                  <div
                    style={{
                      width: `${barWidthPercent}%`,
                      height: '100%',
                      backgroundColor: 'var(--accent-teal, #14b8a6)',
                      borderRadius: '999px',
                      transition: 'width 0.4s ease-out'
                    }}
                  />
                </div>
              </div>
            );
          })
        ) : (
          <p style={{ margin: 0, fontSize: '0.8125rem', color: 'var(--text-muted, #64748b)', fontStyle: 'italic' }}>
            No package distribution metrics available.
          </p>
        )}
      </div>

      {/* Summary Footer Badges */}
      <div
        style={{
          paddingTop: '14px',
          borderTop: '1px solid var(--border-color, #1e293b)',
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: '8px',
          textAlign: 'center'
        }}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
          <span style={{ fontSize: '0.6875rem', color: 'var(--text-muted, #64748b)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Min CTC
          </span>
          <span style={{ fontSize: '0.8125rem', fontWeight: 700, color: 'var(--text-primary, #ffffff)', fontFamily: 'monospace' }}>
            {lowestPkg}
          </span>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
          <span style={{ fontSize: '0.6875rem', color: 'var(--text-muted, #64748b)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Average CTC
          </span>
          <span style={{ fontSize: '0.8125rem', fontWeight: 700, color: 'var(--accent-teal, #14b8a6)', fontFamily: 'monospace' }}>
            {averagePkg}
          </span>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
          <span style={{ fontSize: '0.6875rem', color: 'var(--text-muted, #64748b)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Max CTC
          </span>
          <span style={{ fontSize: '0.8125rem', fontWeight: 700, color: 'var(--text-primary, #ffffff)', fontFamily: 'monospace' }}>
            {highestPkg}
          </span>
        </div>
      </div>
    </div>
  );
}