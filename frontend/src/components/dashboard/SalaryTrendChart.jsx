import React from 'react';
import { TrendingUp } from 'lucide-react';

export default function SalaryTrendChart({ data }) {
  const width = 500;
  const height = 190;
  const paddingX = 42;
  const paddingY = 24;

  const maxVal = 50; // max LPA boundary
  const minVal = 0;

  const getX = (index) => paddingX + (index * (width - 2 * paddingX)) / (data.length - 1);
  const getY = (val) => height - paddingY - ((val - minVal) / (maxVal - minVal)) * (height - 2 * paddingY);

  const avgPoints = data.map((d, i) => `${getX(i)},${getY(d.avg)}`).join(' ');
  const highestPoints = data.map((d, i) => `${getX(i)},${getY(d.highest)}`).join(' ');

  const avgAreaPath = `M ${getX(0)},${getY(data[0].avg)} ` +
    data.map((d, i) => `L ${getX(i)},${getY(d.avg)}`).join(' ') +
    ` L ${getX(data.length - 1)},${height - paddingY} L ${getX(0)},${height - paddingY} Z`;

  return (
    <div style={{
      backgroundColor: 'var(--bg-card)',
      border: '1px solid var(--border-color)',
      borderRadius: '14px',
      padding: '22px',
      display: 'flex',
      flexDirection: 'column',
      height: '100%'
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '14px', gap: '12px' }}>
        <div>
          <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#ffffff' }}>
            5-Year Historical Performance &amp; 2026 Projection (LPA)
          </h3>
          <p style={{ fontSize: '0.76rem', color: 'var(--text-muted)' }}>
            Recorded 2021-2025 CTC trends with 2026 projected estimation
          </p>
        </div>
        <div style={{ display: 'flex', gap: '12px', fontSize: '0.72rem', fontWeight: 600, flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--accent-emerald)' }}>
            <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: 'var(--accent-emerald)' }} />
            Highest Offer
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--accent-blue)' }}>
            <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: 'var(--accent-blue)' }} />
            Average CTC
          </div>
        </div>
      </div>

      {/* Zero-Dependency SVG Visualization Canvas */}
      <div style={{ flex: 1, width: '100%', minHeight: '160px', position: 'relative' }}>
        <svg
          viewBox={`0 0 ${width} ${height}`}
          aria-label="Salary package progression graphic from 2021 to 2026 projection"
          role="img"
          style={{ width: '100%', height: '100%', overflow: 'visible' }}
        >
          <defs>
            <linearGradient id="demoAvgGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.3" />
              <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.0" />
            </linearGradient>
          </defs>

          {/* Reference gridlines */}
          {[10, 20, 30, 40].map((level) => {
            const y = getY(level);
            return (
              <g key={level}>
                <line x1={paddingX} y1={y} x2={width - paddingX} y2={y} stroke="rgba(255,255,255,0.06)" strokeDasharray="3 3" />
                <text x={paddingX - 8} y={y + 3} fill="var(--text-muted)" fontSize="9" textAnchor="end">{level}L</text>
              </g>
            );
          })}

          <path d={avgAreaPath} fill="url(#demoAvgGradient)" />
          <polyline fill="none" stroke="var(--accent-emerald)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" points={highestPoints} />
          <polyline fill="none" stroke="var(--accent-blue)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" points={avgPoints} />

          {data.map((d, i) => (
            <g key={d.year}>
              <circle cx={getX(i)} cy={getY(d.avg)} r="3.5" fill="#1e293b" stroke="var(--accent-blue)" strokeWidth="2" />
              <circle cx={getX(i)} cy={getY(d.highest)} r="3.5" fill="#1e293b" stroke="var(--accent-emerald)" strokeWidth="2" />
              <text
                x={getX(i)}
                y={height - 6}
                fill={d.isProjection ? 'var(--accent-amber)' : 'var(--text-secondary)'}
                fontSize="9"
                fontWeight={d.isProjection ? '700' : '400'}
                textAnchor="middle"
              >
                {d.year}
              </text>
            </g>
          ))}
        </svg>
      </div>

      <div style={{
        marginTop: '14px',
        paddingTop: '12px',
        borderTop: '1px solid var(--border-color)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        fontSize: '0.72rem',
        color: 'var(--text-muted)',
        flexWrap: 'wrap',
        gap: '8px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--accent-emerald)' }}>
          <TrendingUp size={13} aria-hidden="true" />
          <span>Average CTC increased from 5.2L to 8.4L (2021–2025)</span>
        </div>
        <span style={{ color: 'var(--text-secondary)' }}>Institutional Target: 10 LPA Avg (2027)</span>
      </div>
    </div>
  );
}