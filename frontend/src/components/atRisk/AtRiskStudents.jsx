import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  AlertTriangle,
  RefreshCw,
  Search,
  Filter,
  ShieldCheck,
  ChevronRight,
  User,
  ArrowUpDown,
  AlertCircle,
  X,
  Target,
  Sparkles
} from 'lucide-react';
import RiskSummaryCards from './RiskSummaryCards.jsx';

const API_BASE_URL = 'http://localhost:5000/api';

const AUTH_HEADERS = {
  'Content-Type': 'application/json',
  'X-Demo-User-Role': 'placement_officer'
};

export default function AtRiskStudents() {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  // Filters & Drawer State
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRiskFilter, setSelectedRiskFilter] = useState('ALL');
  const [selectedBranchFilter, setSelectedBranchFilter] = useState('ALL');
  const [selectedStudent, setSelectedStudent] = useState(null);

  const fetchAtRiskStudents = useCallback(async () => {
    setError(null);
    try {
      const response = await fetch(`${API_BASE_URL}/readiness/at-risk`, {
        headers: AUTH_HEADERS
      });

      if (!response.ok) {
        throw new Error(`Failed to load at-risk students (HTTP ${response.status})`);
      }

      const resJson = await response.json();
      const data = Array.isArray(resJson?.data)
        ? resJson.data
        : (Array.isArray(resJson) ? resJson : []);

      setStudents(data);
    } catch (err) {
      setError(err.message || 'Error occurred while loading at-risk candidates.');
      setStudents([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchAtRiskStudents();
  }, [fetchAtRiskStudents]);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchAtRiskStudents();
  };

  // Safe Filtered List Computation
  const filteredStudents = useMemo(() => {
    const list = Array.isArray(students) ? students : [];

    return list.filter((item) => {
      const query = (searchQuery || '').trim().toLowerCase();
      const matchesSearch =
        !query ||
        (item?.name && item.name.toLowerCase().includes(query)) ||
        (item?.id && item.id.toLowerCase().includes(query)) ||
        (item?.branch && item.branch.toLowerCase().includes(query));

      const matchesRisk =
        selectedRiskFilter === 'ALL' ||
        (item?.riskLevel || '').toLowerCase() === selectedRiskFilter.toLowerCase();

      const matchesBranch =
        selectedBranchFilter === 'ALL' ||
        (item?.branch || '').toUpperCase() === selectedBranchFilter.toUpperCase();

      return matchesSearch && matchesRisk && matchesBranch;
    });
  }, [students, searchQuery, selectedRiskFilter, selectedBranchFilter]);

  const availableBranches = useMemo(() => {
    const list = Array.isArray(students) ? students : [];
    const branches = new Set();
    list.forEach((s) => {
      if (s?.branch) branches.add(s.branch.toUpperCase());
    });
    return Array.from(branches);
  }, [students]);

  const getRiskBadgeStyle = (level) => {
    const l = (level || '').toLowerCase();
    if (l === 'high risk') {
      return { bg: 'rgba(239, 68, 68, 0.15)', color: '#f87171', border: 'rgba(239, 68, 68, 0.3)' };
    }
    if (l === 'medium risk' || l === 'moderate risk') {
      return { bg: 'rgba(245, 158, 11, 0.15)', color: '#fbbf24', border: 'rgba(245, 158, 11, 0.3)' };
    }
    return { bg: 'rgba(59, 130, 246, 0.15)', color: '#60a5fa', border: 'rgba(59, 130, 246, 0.3)' };
  };

  return (
    <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <h1 style={{ margin: 0, fontSize: '1.65rem', fontWeight: 800, color: 'var(--text-primary, #ffffff)', letterSpacing: '-0.02em' }}>
              At-Risk Student Monitoring
            </h1>
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '5px',
                padding: '3px 10px',
                borderRadius: '999px',
                fontSize: '11px',
                fontWeight: 600,
                backgroundColor: 'rgba(239, 68, 68, 0.12)',
                color: '#f87171',
                border: '1px solid rgba(239, 68, 68, 0.25)'
              }}
            >
              <AlertTriangle size={12} /> Proactive Intervention Engine
            </span>
          </div>
          <p style={{ margin: '6px 0 0 0', fontSize: '0.875rem', color: 'var(--text-secondary, #94a3b8)' }}>
            Identify candidates experiencing recruitment friction or scoring below placement readiness thresholds
          </p>
        </div>

        <button
          onClick={handleRefresh}
          disabled={loading || refreshing}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            padding: '8px 16px',
            backgroundColor: 'var(--bg-card, #1e293b)',
            border: '1px solid var(--border-color, #334155)',
            borderRadius: '8px',
            color: 'var(--text-primary, #f1f5f9)',
            fontSize: '0.875rem',
            fontWeight: 600,
            cursor: loading || refreshing ? 'not-allowed' : 'pointer',
            opacity: loading || refreshing ? 0.6 : 1,
            transition: 'background-color 0.2s ease'
          }}
        >
          <RefreshCw size={15} style={{ animation: refreshing ? 'spin 1s linear infinite' : 'none' }} />
          {refreshing ? 'Evaluating Queue...' : 'Refresh List'}
        </button>
      </div>

      {error && (
        <div
          style={{
            padding: '12px 16px',
            borderRadius: '8px',
            backgroundColor: 'rgba(239, 68, 68, 0.12)',
            border: '1px solid rgba(239, 68, 68, 0.3)',
            color: '#f87171',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            fontSize: '0.875rem'
          }}
        >
          <AlertCircle size={18} />
          <span>{error}</span>
        </div>
      )}

      {/* Summary Cards */}
      <RiskSummaryCards students={students} />

      {/* Filter Toolbar */}
      <div
        style={{
          backgroundColor: 'var(--bg-card, #0f172a)',
          border: '1px solid var(--border-color, #1e293b)',
          borderRadius: '10px',
          padding: '12px 18px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '12px'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
          {/* Search */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              backgroundColor: '#1e293b',
              padding: '6px 12px',
              borderRadius: '6px',
              border: '1px solid #334155'
            }}
          >
            <Search size={14} color="#64748b" />
            <input
              type="text"
              placeholder="Search candidate name or ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                background: 'transparent',
                border: 'none',
                outline: 'none',
                color: '#f1f5f9',
                fontSize: '0.8125rem',
                width: '210px'
              }}
            />
          </div>

          {/* Risk Level Filter */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Filter size={13} color="#64748b" />
            <select
              value={selectedRiskFilter}
              onChange={(e) => setSelectedRiskFilter(e.target.value)}
              style={{
                backgroundColor: '#1e293b',
                color: '#cbd5e1',
                border: '1px solid #334155',
                borderRadius: '6px',
                padding: '6px 10px',
                fontSize: '0.8125rem',
                outline: 'none'
              }}
            >
              <option value="ALL">All Risk Levels</option>
              <option value="High Risk">High Risk</option>
              <option value="Medium Risk">Medium Risk</option>
              <option value="Low Risk">Low Risk</option>
            </select>
          </div>

          {/* Department Filter */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <select
              value={selectedBranchFilter}
              onChange={(e) => setSelectedBranchFilter(e.target.value)}
              style={{
                backgroundColor: '#1e293b',
                color: '#cbd5e1',
                border: '1px solid #334155',
                borderRadius: '6px',
                padding: '6px 10px',
                fontSize: '0.8125rem',
                outline: 'none'
              }}
            >
              <option value="ALL">All Branches</option>
              {availableBranches.map((br) => (
                <option key={br} value={br}>
                  {br}
                </option>
              ))}
            </select>
          </div>
        </div>

        <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
          Showing <strong>{filteredStudents.length}</strong> of {students.length} flagged candidates
        </span>
      </div>

      {/* Main Table View */}
      {loading ? (
        <div style={{ padding: '48px', textAlign: 'center', color: '#64748b' }}>
          <RefreshCw size={24} style={{ animation: 'spin 1s linear infinite', margin: '0 auto 12px' }} />
          <p style={{ margin: 0, fontSize: '0.875rem' }}>Evaluating candidate risk thresholds from live records...</p>
        </div>
      ) : (
        <div
          style={{
            backgroundColor: 'var(--bg-card, #0f172a)',
            border: '1px solid var(--border-color, #1e293b)',
            borderRadius: '12px',
            overflow: 'hidden'
          }}
        >
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.8125rem' }}>
              <thead>
                <tr style={{ backgroundColor: 'rgba(30, 41, 59, 0.4)', color: '#94a3b8', borderBottom: '1px solid #1e293b' }}>
                  <th style={{ padding: '12px 18px', fontWeight: 600 }}>Candidate</th>
                  <th style={{ padding: '12px 18px', fontWeight: 600 }}>Branch &amp; CGPA</th>
                  <th style={{ padding: '12px 18px', fontWeight: 600 }}>Readiness Score</th>
                  <th style={{ padding: '12px 18px', fontWeight: 600 }}>Risk Level</th>
                  <th style={{ padding: '12px 18px', fontWeight: 600 }}>Primary Risk Factor</th>
                  <th style={{ padding: '12px 18px', fontWeight: 600 }}>Application History</th>
                  <th style={{ padding: '12px 18px', fontWeight: 600, textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredStudents.length > 0 ? (
                  filteredStudents.map((candidate) => {
                    const badgeStyle = getRiskBadgeStyle(candidate.riskLevel);
                    const stats = candidate.applicationStats || {};

                    return (
                      <tr
                        key={candidate.id}
                        style={{
                          borderBottom: '1px solid rgba(30, 41, 59, 0.8)',
                          transition: 'background-color 0.15s ease'
                        }}
                      >
                        {/* Candidate */}
                        <td style={{ padding: '14px 18px' }}>
                          <div style={{ fontWeight: 700, color: '#f8fafc' }}>{candidate.name}</div>
                          <div style={{ fontSize: '0.6875rem', color: '#818cf8', fontFamily: 'monospace', marginTop: '2px' }}>
                            {candidate.id}
                          </div>
                        </td>

                        {/* Branch & CGPA */}
                        <td style={{ padding: '14px 18px', color: '#cbd5e1' }}>
                          <div>{candidate.branch || 'General'}</div>
                          <div style={{ fontSize: '0.6875rem', color: '#94a3b8', marginTop: '2px' }}>
                            CGPA: {Number(candidate.cgpa || 0).toFixed(2)}
                          </div>
                        </td>

                        {/* Readiness Score */}
                        <td style={{ padding: '14px 18px' }}>
                          <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px' }}>
                            <span style={{ fontSize: '1.05rem', fontWeight: 800, color: '#f8fafc', fontFamily: 'monospace' }}>
                              {candidate.readinessScore}
                            </span>
                            <span style={{ fontSize: '0.6875rem', color: '#64748b' }}>/ 100</span>
                          </div>
                          <div style={{ fontSize: '0.6875rem', color: '#94a3b8' }}>
                            {candidate.readinessBand || 'Developing'}
                          </div>
                        </td>

                        {/* Risk Level */}
                        <td style={{ padding: '14px 18px' }}>
                          <span
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              padding: '3px 8px',
                              borderRadius: '999px',
                              fontSize: '11px',
                              fontWeight: 700,
                              backgroundColor: badgeStyle.bg,
                              color: badgeStyle.color,
                              border: `1px solid ${badgeStyle.border}`
                            }}
                          >
                            {candidate.riskLevel}
                          </span>
                        </td>

                        {/* Primary Reason */}
                        <td style={{ padding: '14px 18px', color: '#cbd5e1', maxWidth: '240px' }}>
                          <span style={{ display: 'block', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }} title={candidate.primaryReason}>
                            {candidate.primaryReason}
                          </span>
                        </td>

                        {/* Application Stats */}
                        <td style={{ padding: '14px 18px', color: '#cbd5e1' }}>
                          {stats.totalApplications > 0 ? (
                            <div>
                              <span>{stats.rejectedApplications} rejected / {stats.totalApplications} applied</span>
                              <div style={{ fontSize: '0.6875rem', color: stats.rejectionRate >= 60 ? '#f87171' : '#94a3b8' }}>
                                {stats.rejectionRate}% rejection rate
                              </div>
                            </div>
                          ) : (
                            <span style={{ fontSize: '0.75rem', color: '#64748b' }}>No drive records</span>
                          )}
                        </td>

                        {/* Actions */}
                        <td style={{ padding: '14px 18px', textAlign: 'right' }}>
                          <button
                            onClick={() => setSelectedStudent(candidate)}
                            style={{
                              padding: '5px 12px',
                              borderRadius: '6px',
                              border: '1px solid #334155',
                              backgroundColor: 'rgba(30, 41, 59, 0.8)',
                              color: '#cbd5e1',
                              fontSize: '0.75rem',
                              fontWeight: 600,
                              cursor: 'pointer'
                            }}
                          >
                            Details
                          </button>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={7} style={{ padding: '36px', textAlign: 'center', color: '#64748b' }}>
                      No students meet the current at-risk criteria.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Details Side Drawer */}
      {selectedStudent && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            right: 0,
            bottom: 0,
            width: '420px',
            backgroundColor: '#0a0f1d',
            borderLeft: '1px solid #1e293b',
            boxShadow: '-4px 0 24px rgba(0, 0, 0, 0.6)',
            zIndex: 1000,
            padding: '24px',
            display: 'flex',
            flexDirection: 'column',
            gap: '20px',
            overflowY: 'auto'
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <User size={18} color="#818cf8" />
              <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 700, color: '#f8fafc' }}>
                Candidate Intervention Profile
              </h3>
            </div>
            <button
              onClick={() => setSelectedStudent(null)}
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
          </div>

          <div style={{ padding: '14px', backgroundColor: 'rgba(30, 41, 59, 0.4)', borderRadius: '8px', border: '1px solid #334155' }}>
            <div style={{ fontSize: '1rem', fontWeight: 700, color: '#ffffff' }}>{selectedStudent.name}</div>
            <div style={{ fontSize: '0.75rem', color: '#818cf8', fontFamily: 'monospace' }}>{selectedStudent.id}</div>
            <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '6px' }}>
              {selectedStudent.branch} • CGPA: {Number(selectedStudent.cgpa || 0).toFixed(2)}
            </div>
          </div>

          <div>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', color: '#94a3b8', display: 'block', marginBottom: '8px' }}>
              Risk Attribution Factors
            </span>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {selectedStudent.reasons && selectedStudent.reasons.length > 0 ? (
                selectedStudent.reasons.map((r, i) => (
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
                <div style={{ fontSize: '0.8125rem', color: '#94a3b8' }}>{selectedStudent.primaryReason}</div>
              )}
            </div>
          </div>

          <div>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', color: '#94a3b8', display: 'block', marginBottom: '8px' }}>
              Recommended Mentoring Actions
            </span>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {selectedStudent.actions && selectedStudent.actions.length > 0 ? (
                selectedStudent.actions.map((a, i) => (
                  <div
                    key={i}
                    style={{
                      padding: '8px 12px',
                      backgroundColor: 'rgba(16, 185, 129, 0.08)',
                      borderRadius: '6px',
                      border: '1px solid rgba(16, 185, 129, 0.2)',
                      fontSize: '0.8125rem',
                      color: '#cbd5e1',
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: '6px'
                    }}
                  >
                    <ChevronRight size={14} color="#10b981" style={{ marginTop: '2px', flexShrink: 0 }} />
                    <span>{a}</span>
                  </div>
                ))
              ) : (
                <div style={{ fontSize: '0.8125rem', color: '#94a3b8' }}>{selectedStudent.recommendedAction}</div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Methodology Footer */}
      <div
        style={{
          padding: '14px 18px',
          backgroundColor: 'rgba(30, 41, 59, 0.4)',
          borderRadius: '8px',
          border: '1px solid rgba(51, 65, 85, 0.4)',
          display: 'flex',
          alignItems: 'flex-start',
          gap: '10px',
          fontSize: '0.75rem',
          color: '#94a3b8'
        }}
      >
        <ShieldCheck size={16} color="#818cf8" style={{ marginTop: '2px', flexShrink: 0 }} />
        <div>
          <strong style={{ color: '#cbd5e1' }}>Proactive Early-Warning System:</strong> Candidates are evaluated across institutional placement readiness scores, recruitment round rejection ratios, communication assessments, and academic CGPA. Students with confirmed accepted offers are automatically excluded from the at-risk queue.
        </div>
      </div>
    </div>
  );
}