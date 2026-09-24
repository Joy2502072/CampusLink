import React, { useState } from 'react';
import { ArrowUpDown, ChevronRight, Filter } from 'lucide-react';

export default function RiskStudentTable({ students, onSelectStudent }) {
  const [filterLevel, setFilterLevel] = useState('All');
  const [filterBranch, setFilterBranch] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortField, setSortField] = useState('riskScore');
  const [sortOrder, setSortOrder] = useState('desc');

  const branches = ['All', 'CSE', 'IT', 'ECE', 'EE', 'MECH', 'CIVIL'];
  const levels = ['All', 'High', 'Medium', 'Low'];

  const filtered = students.filter((s) => {
    const matchLevel = filterLevel === 'All' || s.riskLevel === filterLevel;
    const matchBranch = filterBranch === 'All' || s.branch === filterBranch;
    const query = searchQuery.trim().toLowerCase();
    const matchSearch =
      query === '' ||
      s.studentId.toLowerCase().includes(query) ||
      s.name.toLowerCase().includes(query) ||
      s.branch.toLowerCase().includes(query);

    return matchLevel && matchBranch && matchSearch;
  });

  const sorted = [...filtered].sort((a, b) => {
    let aVal = a[sortField];
    let bVal = b[sortField];

    if (sortOrder === 'asc') {
      return aVal > bVal ? 1 : -1;
    } else {
      return aVal < bVal ? 1 : -1;
    }
  });

  const toggleSort = (field) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('desc');
    }
  };

  const getRiskBadge = (level) => {
    switch (level) {
      case 'High':
        return { bg: 'var(--accent-rose-soft)', text: 'var(--accent-rose)', border: 'rgba(244, 63, 94, 0.3)' };
      case 'Medium':
        return { bg: 'var(--accent-amber-soft)', text: 'var(--accent-amber)', border: 'rgba(245, 158, 11, 0.3)' };
      default:
        return { bg: 'var(--accent-emerald-soft)', text: 'var(--accent-emerald)', border: 'rgba(16, 185, 129, 0.3)' };
    }
  };

  return (
    <div style={{
      backgroundColor: 'var(--bg-card)',
      border: '1px solid var(--border-color)',
      borderRadius: '14px',
      padding: '22px',
      display: 'flex',
      flexDirection: 'column',
      gap: '16px'
    }}>
      <div style={{
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '12px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.78rem', color: 'var(--text-muted)' }}>
            <Filter size={14} aria-hidden="true" />
            <span>Risk Level:</span>
          </div>
          {levels.map((lvl) => (
            <button
              key={lvl}
              type="button"
              onClick={() => setFilterLevel(lvl)}
              style={{
                fontSize: '0.74rem',
                padding: '5px 10px',
                borderRadius: '6px',
                fontWeight: 600,
                backgroundColor: filterLevel === lvl ? 'var(--accent-blue)' : 'rgba(255, 255, 255, 0.05)',
                color: filterLevel === lvl ? '#ffffff' : 'var(--text-secondary)',
                border: '1px solid var(--border-color)'
              }}
            >
              {lvl}
            </button>
          ))}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
          <select
            aria-label="Filter by Branch"
            value={filterBranch}
            onChange={(e) => setFilterBranch(e.target.value)}
            style={{
              backgroundColor: 'rgba(15, 23, 42, 0.6)',
              border: '1px solid var(--border-color)',
              color: 'var(--text-primary)',
              borderRadius: '6px',
              padding: '6px 10px',
              fontSize: '0.76rem',
              outline: 'none'
            }}
          >
            {branches.map(b => (
              <option key={b} value={b} style={{ backgroundColor: '#1e293b' }}>
                Branch: {b}
              </option>
            ))}
          </select>

          <input
            type="search"
            placeholder="Search student ID..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            aria-label="Search student by ID, name, or branch"
            style={{
              backgroundColor: 'rgba(15, 23, 42, 0.6)',
              border: '1px solid var(--border-color)',
              color: 'var(--text-primary)',
              borderRadius: '6px',
              padding: '6px 12px',
              fontSize: '0.76rem',
              outline: 'none'
            }}
          />
        </div>
      </div>

      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '700px' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--border-color)', fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              <th style={{ padding: '12px 10px' }}>Student</th>
              <th style={{ padding: '12px 10px' }}>Branch</th>
              <th style={{ padding: '12px 10px', cursor: 'pointer' }} onClick={() => toggleSort('cgpa')}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  CGPA <ArrowUpDown size={12} />
                </div>
              </th>
              <th style={{ padding: '12px 10px', cursor: 'pointer' }} onClick={() => toggleSort('readinessScore')}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  Readiness <ArrowUpDown size={12} />
                </div>
              </th>
              <th style={{ padding: '12px 10px' }}>Mock Interview</th>
              <th style={{ padding: '12px 10px', cursor: 'pointer' }} onClick={() => toggleSort('applications')}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  Applications <ArrowUpDown size={12} />
                </div>
              </th>
              <th style={{ padding: '12px 10px' }}>Shortlisted</th>
              <th style={{ padding: '12px 10px', cursor: 'pointer' }} onClick={() => toggleSort('riskScore')}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--accent-blue)' }}>
                  Risk Score <ArrowUpDown size={12} />
                </div>
              </th>
              <th style={{ padding: '12px 10px' }}>Risk Band</th>
              <th style={{ padding: '12px 10px', textAlign: 'right' }}>Action</th>
            </tr>
          </thead>
          <tbody>
            {sorted.length === 0 ? (
              <tr>
                <td colSpan="10" style={{ padding: '32px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.82rem' }}>
                  No synthetic student records match the active filter criteria.
                </td>
              </tr>
            ) : (
              sorted.map((s) => {
                const badge = getRiskBadge(s.riskLevel);
                return (
                  <tr
                    key={s.studentId}
                    style={{
                      borderBottom: '1px solid rgba(255, 255, 255, 0.04)',
                      fontSize: '0.8rem',
                      transition: 'background-color 0.15s ease'
                    }}
                    onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.02)'; }}
                    onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; }}
                  >
                    <td style={{ padding: '12px 10px', fontWeight: 600, color: '#ffffff' }}>
                      {s.name}
                      <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>{s.studentId}</div>
                    </td>
                    <td style={{ padding: '12px 10px', color: 'var(--text-secondary)' }}>{s.branch}</td>
                    <td style={{ padding: '12px 10px', color: 'var(--text-secondary)', fontWeight: 600 }}>{s.cgpa}</td>
                    <td style={{ padding: '12px 10px' }}>
                      <span style={{ color: s.readinessScore < 60 ? 'var(--accent-rose)' : 'var(--text-primary)', fontWeight: 600 }}>
                        {s.readinessScore}%
                      </span>
                    </td>
                    <td style={{ padding: '12px 10px' }}>
                      <span style={{ color: s.mockInterviewScore < 60 ? 'var(--accent-amber)' : 'var(--text-primary)', fontWeight: 600 }}>
                        {s.mockInterviewScore}%
                      </span>
                    </td>
                    <td style={{ padding: '12px 10px', color: 'var(--text-secondary)' }}>{s.applications}</td>
                    <td style={{ padding: '12px 10px', color: 'var(--text-secondary)' }}>{s.shortlisted}</td>
                    <td style={{ padding: '12px 10px' }}>
                      <span style={{ fontWeight: 800, color: badge.text }}>
                        {s.riskScore}
                      </span>
                      <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>/100</span>
                    </td>
                    <td style={{ padding: '12px 10px' }}>
                      <span style={{
                        fontSize: '0.68rem',
                        fontWeight: 700,
                        padding: '2px 8px',
                        borderRadius: '4px',
                        backgroundColor: badge.bg,
                        color: badge.text,
                        border: `1px solid ${badge.border}`
                      }}>
                        {s.riskLevel}
                      </span>
                    </td>
                    <td style={{ padding: '12px 10px', textAlign: 'right' }}>
                      <button
                        type="button"
                        onClick={() => onSelectStudent(s)}
                        aria-label={`View risk details for ${s.studentId}`}
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '4px',
                          backgroundColor: 'rgba(59, 130, 246, 0.12)',
                          color: 'var(--accent-blue)',
                          padding: '5px 10px',
                          borderRadius: '6px',
                          fontSize: '0.74rem',
                          fontWeight: 600
                        }}
                      >
                        View Details <ChevronRight size={13} aria-hidden="true" />
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        fontSize: '0.72rem',
        color: 'var(--text-muted)',
        borderTop: '1px solid var(--border-color)',
        paddingTop: '12px',
        flexWrap: 'wrap',
        gap: '8px'
      }}>
        <span>Showing {sorted.length} of {students.length} monitored students</span>
        <span>Sorting by: <strong style={{ color: 'var(--text-secondary)' }}>{sortField}</strong> ({sortOrder.toUpperCase()})</span>
      </div>
    </div>
  );
}