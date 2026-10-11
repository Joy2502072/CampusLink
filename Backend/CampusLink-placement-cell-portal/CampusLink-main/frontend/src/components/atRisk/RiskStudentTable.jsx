import React, { useMemo, useState } from 'react';
import { ChevronDown, ChevronUp, Search, SlidersHorizontal } from 'lucide-react';

export default function RiskStudentTable({
  students = [],
  onSelectStudent
}) {
  const [riskFilter, setRiskFilter] = useState('All');
  const [branchFilter, setBranchFilter] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortDirection, setSortDirection] = useState('desc');

  const branches = [
    'All',
    ...new Set(students.map((student) => student.branch).filter(Boolean))
  ];

  const filteredStudents = useMemo(() => {
    const filtered = students.filter((student) => {
      const matchesRisk =
        riskFilter === 'All' ||
        student.riskLevel === `${riskFilter} Risk`;

      const matchesBranch =
        branchFilter === 'All' ||
        student.branch === branchFilter;

      const search = searchTerm.toLowerCase().trim();

      const matchesSearch =
        !search ||
        student.name?.toLowerCase().includes(search) ||
        student.id?.toLowerCase().includes(search);

      return matchesRisk && matchesBranch && matchesSearch;
    });

    return [...filtered].sort((a, b) => {
      const scoreA = Number(a.readinessScore ?? 0);
      const scoreB = Number(b.readinessScore ?? 0);

      return sortDirection === 'desc'
        ? scoreB - scoreA
        : scoreA - scoreB;
    });
  }, [
    students,
    riskFilter,
    branchFilter,
    searchTerm,
    sortDirection
  ]);

  const getRiskStyle = (riskLevel) => {
    if (riskLevel === 'High Risk') {
      return {
        backgroundColor: 'rgba(239,68,68,0.12)',
        border: '1px solid rgba(239,68,68,0.35)',
        color: '#f87171'
      };
    }

    if (riskLevel === 'Medium Risk') {
      return {
        backgroundColor: 'rgba(245,158,11,0.12)',
        border: '1px solid rgba(245,158,11,0.35)',
        color: '#fbbf24'
      };
    }

    return {
      backgroundColor: 'rgba(16,185,129,0.12)',
      border: '1px solid rgba(16,185,129,0.35)',
      color: '#34d399'
    };
  };

  return (
    <div
      style={{
        backgroundColor: 'var(--bg-card)',
        border: '1px solid var(--border-color)',
        borderRadius: '12px',
        overflow: 'hidden'
      }}
    >
      {/* Filters */}
      <div
        style={{
          padding: '16px 18px',
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          flexWrap: 'wrap',
          borderBottom: '1px solid var(--border-color)'
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            color: 'var(--text-secondary)',
            fontSize: '0.75rem'
          }}
        >
          <SlidersHorizontal size={14} />
          Risk Level:
        </div>

        {['All', 'High', 'Medium', 'Low'].map((risk) => (
          <button
            key={risk}
            type="button"
            onClick={() => setRiskFilter(risk)}
            style={{
              padding: '6px 11px',
              borderRadius: '6px',
              border: '1px solid var(--border-color)',
              backgroundColor:
                riskFilter === risk
                  ? '#3b82f6'
                  : 'rgba(255,255,255,0.03)',
              color: '#ffffff',
              fontSize: '0.72rem',
              cursor: 'pointer'
            }}
          >
            {risk}
          </button>
        ))}

        {/* Branch */}
        <select
          value={branchFilter}
          onChange={(e) => setBranchFilter(e.target.value)}
          style={{
            marginLeft: 'auto',
            backgroundColor: '#182338',
            border: '1px solid var(--border-color)',
            color: '#ffffff',
            padding: '7px 10px',
            borderRadius: '6px',
            fontSize: '0.72rem'
          }}
        >
          {branches.map((branch) => (
            <option key={branch} value={branch}>
              {branch === 'All' ? 'Branch: All' : `Branch: ${branch}`}
            </option>
          ))}
        </select>

        {/* Search */}
        <div
          style={{
            position: 'relative'
          }}
        >
          <Search
            size={14}
            style={{
              position: 'absolute',
              left: '9px',
              top: '50%',
              transform: 'translateY(-50%)',
              color: '#64748b'
            }}
          />

          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search student ID..."
            style={{
              width: '145px',
              backgroundColor: '#182338',
              border: '1px solid var(--border-color)',
              color: '#ffffff',
              padding: '7px 10px 7px 30px',
              borderRadius: '6px',
              fontSize: '0.72rem',
              outline: 'none'
            }}
          />
        </div>
      </div>

      {/* Table */}
      <div style={{ overflowX: 'auto' }}>
        <table
          style={{
            width: '100%',
            borderCollapse: 'collapse',
            minWidth: '900px'
          }}
        >
          <thead>
            <tr>
              {[
                'STUDENT',
                'BRANCH',
                'CGPA',
                'READINESS',
                'APPLICATIONS',
                'REJECTIONS',
                'RISK SCORE',
                'RISK BAND',
                'ACTION'
              ].map((heading, index) => (
                <th
                  key={heading}
                  style={{
                    textAlign: index === 0 ? 'left' : 'left',
                    padding: '12px 10px',
                    color: '#64748b',
                    fontSize: '0.65rem',
                    fontWeight: 700,
                    borderBottom: '1px solid var(--border-color)',
                    whiteSpace: 'nowrap'
                  }}
                >
                  {heading}

                  {heading === 'READINESS' && (
                    <button
                      type="button"
                      onClick={() =>
                        setSortDirection(
                          sortDirection === 'desc'
                            ? 'asc'
                            : 'desc'
                        )
                      }
                      style={{
                        border: 'none',
                        background: 'transparent',
                        color: '#3b82f6',
                        cursor: 'pointer',
                        padding: 0,
                        marginLeft: '4px'
                      }}
                    >
                      {sortDirection === 'desc' ? (
                        <ChevronDown size={12} />
                      ) : (
                        <ChevronUp size={12} />
                      )}
                    </button>
                  )}
                </th>
              ))}
            </tr>
          </thead>

          <tbody>
            {filteredStudents.length === 0 ? (
              <tr>
                <td
                  colSpan="9"
                  style={{
                    padding: '30px',
                    textAlign: 'center',
                    color: '#64748b'
                  }}
                >
                  No students found.
                </td>
              </tr>
            ) : (
              filteredStudents.map((student) => {
                const riskStyle = getRiskStyle(student.riskLevel);

                return (
                  <tr
                    key={student.id}
                    style={{
                      borderBottom:
                        '1px solid rgba(148,163,184,0.08)'
                    }}
                  >
                    {/* Student */}
                    <td
                      style={{
                        padding: '13px 10px'
                      }}
                    >
                      <div
                        style={{
                          color: '#ffffff',
                          fontWeight: 700,
                          fontSize: '0.76rem'
                        }}
                      >
                        {student.name}
                      </div>

                      <div
                        style={{
                          color: '#64748b',
                          fontSize: '0.64rem',
                          marginTop: '3px'
                        }}
                      >
                        {student.id}
                      </div>
                    </td>

                    {/* Branch */}
                    <td
                      style={{
                        padding: '13px 10px',
                        color: '#94a3b8',
                        fontSize: '0.72rem'
                      }}
                    >
                      {student.branch || '-'}
                    </td>

                    {/* CGPA */}
                    <td
                      style={{
                        padding: '13px 10px',
                        color: '#ffffff',
                        fontWeight: 600,
                        fontSize: '0.72rem'
                      }}
                    >
                      {student.cgpa ?? '-'}
                    </td>

                    {/* Readiness */}
                    <td
                      style={{
                        padding: '13px 10px',
                        color: '#ffffff',
                        fontWeight: 700,
                        fontSize: '0.72rem'
                      }}
                    >
                      {student.readinessScore ?? 0}%
                    </td>

                    {/* Applications */}
                    <td
                      style={{
                        padding: '13px 10px',
                        color: '#94a3b8',
                        fontSize: '0.72rem'
                      }}
                    >
                      {student.rawMetrics?.applicationsCount ?? '-'}
                    </td>

                    {/* Rejections */}
                    <td
                      style={{
                        padding: '13px 10px',
                        color: '#94a3b8',
                        fontSize: '0.72rem'
                      }}
                    >
                      {student.rawMetrics?.rejectionsCount ?? '-'}
                    </td>

                    {/* Risk Score */}
                    <td
                      style={{
                        padding: '13px 10px',
                        color: '#ffffff',
                        fontWeight: 700,
                        fontSize: '0.72rem'
                      }}
                    >
                      {student.readinessScore ?? 0}/100
                    </td>

                    {/* Risk Level */}
                    <td
                      style={{
                        padding: '13px 10px'
                      }}
                    >
                      <span
                        style={{
                          ...riskStyle,
                          display: 'inline-block',
                          padding: '4px 8px',
                          borderRadius: '5px',
                          fontSize: '0.62rem',
                          fontWeight: 700
                        }}
                      >
                        {student.riskLevel || 'Unknown'}
                      </span>
                    </td>

                    {/* Action */}
                    <td
                      style={{
                        padding: '13px 10px'
                      }}
                    >
                      <button
                        type="button"
                        onClick={() =>
                          onSelectStudent?.(student)
                        }
                        style={{
                          backgroundColor:
                            'rgba(37,99,235,0.18)',
                          border: 'none',
                          color: '#60a5fa',
                          padding: '6px 10px',
                          borderRadius: '5px',
                          fontSize: '0.65rem',
                          fontWeight: 600,
                          cursor: 'pointer'
                        }}
                      >
                        View Details →
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Footer */}
      <div
        style={{
          padding: '11px 18px',
          display: 'flex',
          justifyContent: 'space-between',
          color: '#64748b',
          fontSize: '0.68rem'
        }}
      >
        <span>
          Showing {filteredStudents.length} of {students.length}{' '}
          monitored students
        </span>

        <span>
          Sorting by: readinessScore (
          {sortDirection === 'desc' ? 'DESC' : 'ASC'})
        </span>
      </div>
    </div>
  );
}