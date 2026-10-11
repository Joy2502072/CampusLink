import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  AlertTriangle,
  RefreshCw,
  Search,
  Filter,
  ShieldCheck,
  ChevronRight,
  User,
  AlertCircle,
  X,
  Target,
  Sparkles,
  Calendar,
  CheckCircle2,
  Clock,
  Send,
  Plus,
  BookOpen,
  Award,
  MessageSquare,
  Briefcase
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

  // Intervention Workflow State (Persisted in state across drawer open/close cycles)
  const [interventions, setInterventions] = useState({});
  const [actionType, setActionType] = useState('Mentoring Action');
  const [customNote, setCustomNote] = useState('');
  const [isSubmittingAction, setIsSubmittingAction] = useState(false);
  const [actionSuccessMessage, setActionSuccessMessage] = useState(null);

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

      // Keep currently open student in sync without creating a dependency loop
      setSelectedStudent((prevSelected) => {
        if (!prevSelected) return null;
        const fresh = data.find((s) => s.id === prevSelected.id);
        return fresh || prevSelected;
      });
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

  // Explicit, safe close handler that halts event bubbling
  const handleCloseDrawer = (e) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    setSelectedStudent(null);
    setActionSuccessMessage(null);
    setCustomNote('');
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

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Completed':
        return { bg: 'rgba(16, 185, 129, 0.12)', color: '#34d399', border: 'rgba(16, 185, 129, 0.3)' };
      case 'In Progress':
        return { bg: 'rgba(59, 130, 246, 0.12)', color: '#60a5fa', border: 'rgba(59, 130, 246, 0.3)' };
      default:
        return { bg: 'rgba(245, 158, 11, 0.12)', color: '#fbbf24', border: 'rgba(245, 158, 11, 0.3)' };
    }
  };

  // Add an intervention action for the current student
  const handleCreateIntervention = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!selectedStudent) return;

    setIsSubmittingAction(true);
    setActionSuccessMessage(null);

    const now = new Date();
    const timeString = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    const newAction = {
      id: `INT-${Date.now()}`,
      actionType,
      targetStudentId: selectedStudent.id,
      targetStudentName: selectedStudent.name,
      recommendedReason: selectedStudent.recommendedAction || selectedStudent.primaryReason || 'General placement remediation.',
      note: customNote.trim() || selectedStudent.recommendedAction || 'Action created by placement officer.',
      status: 'Pending',
      createdAt: timeString,
      timestamp: now.toISOString()
    };

    // Attempt optional sync with backend notification API
    try {
      await fetch(`${API_BASE_URL}/notifications`, {
        method: 'POST',
        headers: AUTH_HEADERS,
        body: JSON.stringify({
          recipientId: selectedStudent.id,
          title: `Intervention: ${actionType}`,
          message: newAction.note,
          type: 'intervention',
          priority: selectedStudent.riskLevel === 'High Risk' ? 'high' : 'medium'
        })
      });
    } catch {
      // Non-fatal, persists cleanly in client prototype state
    }

    // Persist action into the student's timeline
    setInterventions((prev) => {
      const studentList = prev[selectedStudent.id] || [];
      return {
        ...prev,
        [selectedStudent.id]: [newAction, ...studentList]
      };
    });

    setCustomNote('');
    setIsSubmittingAction(false);
    setActionSuccessMessage(`Intervention recorded for ${selectedStudent.name}.`);
    setTimeout(() => setActionSuccessMessage(null), 3500);
  };

  // Update status of an existing intervention
  const handleUpdateStatus = (actionId, newStatus, e) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    if (!selectedStudent) return;

    setInterventions((prev) => {
      const studentList = prev[selectedStudent.id] || [];
      const updatedList = studentList.map((item) =>
        item.id === actionId ? { ...item, status: newStatus } : item
      );
      return {
        ...prev,
        [selectedStudent.id]: updatedList
      };
    });
  };

  const studentInterventions = selectedStudent ? (interventions[selectedStudent.id] || []) : [];

  return (
    <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <h1 style={{ margin: 0, fontSize: '1.65rem', fontWeight: 800, color: 'var(--text-primary, #ffffff)', letterSpacing: '-0.02em' }}>
              At-Risk Student Monitoring &amp; Intervention
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
              <AlertTriangle size={12} /> Proactive Mentoring Engine
            </span>
          </div>
          <p style={{ margin: '6px 0 0 0', fontSize: '0.875rem', color: 'var(--text-secondary, #94a3b8)' }}>
            Real-time candidate risk surveillance with integrated counseling and remediation workflows
          </p>
        </div>

        <button
          type="button"
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
                  <th style={{ padding: '12px 18px', fontWeight: 600, textAlign: 'right' }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredStudents.length > 0 ? (
                  filteredStudents.map((candidate) => {
                    const badgeStyle = getRiskBadgeStyle(candidate.riskLevel);
                    const stats = candidate.applicationStats || {};
                    const candidateIntCount = (interventions[candidate.id] || []).length;

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
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedStudent(candidate);
                            }}
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '6px',
                              padding: '6px 14px',
                              borderRadius: '6px',
                              border: '1px solid #334155',
                              backgroundColor: candidateIntCount > 0 ? 'rgba(99, 102, 241, 0.15)' : 'rgba(30, 41, 59, 0.8)',
                              color: candidateIntCount > 0 ? '#a5b4fc' : '#cbd5e1',
                              fontSize: '0.75rem',
                              fontWeight: 600,
                              cursor: 'pointer'
                            }}
                          >
                            Intervene
                            {candidateIntCount > 0 && (
                              <span
                                style={{
                                  fontSize: '10px',
                                  padding: '1px 5px',
                                  borderRadius: '999px',
                                  backgroundColor: '#6366f1',
                                  color: '#fff'
                                }}
                              >
                                {candidateIntCount}
                              </span>
                            )}
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

      {/* Upgraded Candidate Intervention & Mentoring Drawer */}
      {selectedStudent && (
        <div
          onClick={(e) => e.stopPropagation()}
          style={{
            position: 'fixed',
            top: 0,
            right: 0,
            bottom: 0,
            width: '490px',
            maxWidth: '100vw',
            backgroundColor: '#0a0f1d',
            borderLeft: '1px solid #1e293b',
            boxShadow: '-6px 0 30px rgba(0, 0, 0, 0.75)',
            zIndex: 1000,
            padding: '24px',
            display: 'flex',
            flexDirection: 'column',
            gap: '20px',
            overflowY: 'auto'
          }}
        >
          {/* Drawer Header with Bulletproof Close Button */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <User size={18} color="#818cf8" />
              <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 800, color: '#f8fafc' }}>
                Intervention &amp; Mentoring Dossier
              </h3>
            </div>
            <button
              type="button"
              aria-label="Close Dossier"
              onClick={handleCloseDrawer}
              style={{
                background: 'rgba(30, 41, 59, 0.7)',
                border: '1px solid #334155',
                borderRadius: '6px',
                color: '#cbd5e1',
                cursor: 'pointer',
                padding: '6px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'background-color 0.15s ease'
              }}
            >
              <X size={18} />
            </button>
          </div>

          {actionSuccessMessage && (
            <div
              style={{
                padding: '10px 14px',
                borderRadius: '6px',
                backgroundColor: 'rgba(16, 185, 129, 0.12)',
                border: '1px solid rgba(16, 185, 129, 0.3)',
                color: '#34d399',
                fontSize: '0.8125rem',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}
            >
              <CheckCircle2 size={15} />
              <span>{actionSuccessMessage}</span>
            </div>
          )}

          {/* Student Identity Card */}
          <div
            style={{
              padding: '16px',
              backgroundColor: 'rgba(30, 41, 59, 0.45)',
              borderRadius: '10px',
              border: '1px solid #334155',
              display: 'flex',
              flexDirection: 'column',
              gap: '10px'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <div style={{ fontSize: '1.05rem', fontWeight: 700, color: '#ffffff' }}>
                  {selectedStudent.name}
                </div>
                <div style={{ fontSize: '0.75rem', color: '#818cf8', fontFamily: 'monospace', marginTop: '2px' }}>
                  {selectedStudent.id}
                </div>
              </div>
              <span
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  padding: '3px 8px',
                  borderRadius: '999px',
                  fontSize: '11px',
                  fontWeight: 700,
                  ...getRiskBadgeStyle(selectedStudent.riskLevel)
                }}
              >
                {selectedStudent.riskLevel}
              </span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', fontSize: '0.8125rem', color: '#cbd5e1' }}>
              <div>Branch: <strong style={{ color: '#fff' }}>{selectedStudent.branch || 'General'}</strong></div>
              <div>CGPA: <strong style={{ color: '#fff' }}>{Number(selectedStudent.cgpa || 0).toFixed(2)}</strong></div>
              <div>
                Readiness: <strong style={{ color: '#fff' }}>{selectedStudent.readinessScore}/100</strong>
              </div>
              <div>Band: <strong style={{ color: '#fff' }}>{selectedStudent.readinessBand}</strong></div>
            </div>

            {/* Application stats strip */}
            {selectedStudent.applicationStats && selectedStudent.applicationStats.totalApplications > 0 && (
              <div
                style={{
                  padding: '8px 10px',
                  backgroundColor: 'rgba(15, 23, 42, 0.6)',
                  borderRadius: '6px',
                  fontSize: '0.75rem',
                  color: '#94a3b8',
                  display: 'flex',
                  justifyContent: 'space-between'
                }}
              >
                <span>Applied: <strong style={{ color: '#cbd5e1' }}>{selectedStudent.applicationStats.totalApplications}</strong></span>
                <span>Rejected: <strong style={{ color: '#f87171' }}>{selectedStudent.applicationStats.rejectedApplications}</strong></span>
                <span>Rejection Rate: <strong style={{ color: selectedStudent.applicationStats.rejectionRate >= 60 ? '#f87171' : '#34d399' }}>{selectedStudent.applicationStats.rejectionRate}%</strong></span>
              </div>
            )}
          </div>

          {/* Dimension Breakdown */}
          {selectedStudent.dimensions && (
            <div>
              <span style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', color: '#94a3b8', display: 'block', marginBottom: '8px' }}>
                Deterministic Readiness Dimensions
              </span>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '8px' }}>
                <div style={{ padding: '8px 10px', backgroundColor: 'rgba(30, 41, 59, 0.35)', borderRadius: '6px', border: '1px solid #334155' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '0.75rem', color: '#a5b4fc' }}>
                    <BookOpen size={12} /> Academics (25 max)
                  </div>
                  <div style={{ fontSize: '1rem', fontWeight: 700, color: '#fff', marginTop: '2px', fontFamily: 'monospace' }}>
                    {selectedStudent.dimensions.academics ?? '--'}
                  </div>
                </div>

                <div style={{ padding: '8px 10px', backgroundColor: 'rgba(30, 41, 59, 0.35)', borderRadius: '6px', border: '1px solid #334155' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '0.75rem', color: '#34d399' }}>
                    <Award size={12} /> Technical (30 max)
                  </div>
                  <div style={{ fontSize: '1rem', fontWeight: 700, color: '#fff', marginTop: '2px', fontFamily: 'monospace' }}>
                    {selectedStudent.dimensions.technical ?? selectedStudent.dimensions.technicalSkills ?? '--'}
                  </div>
                </div>

                <div style={{ padding: '8px 10px', backgroundColor: 'rgba(30, 41, 59, 0.35)', borderRadius: '6px', border: '1px solid #334155' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '0.75rem', color: '#fbbf24' }}>
                    <MessageSquare size={12} /> Communication (25)
                  </div>
                  <div style={{ fontSize: '1rem', fontWeight: 700, color: '#fff', marginTop: '2px', fontFamily: 'monospace' }}>
                    {selectedStudent.dimensions.communication ?? '--'}
                  </div>
                </div>

                <div style={{ padding: '8px 10px', backgroundColor: 'rgba(30, 41, 59, 0.35)', borderRadius: '6px', border: '1px solid #334155' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '0.75rem', color: '#60a5fa' }}>
                    <Briefcase size={12} /> Practical (20 max)
                  </div>
                  <div style={{ fontSize: '1rem', fontWeight: 700, color: '#fff', marginTop: '2px', fontFamily: 'monospace' }}>
                    {selectedStudent.dimensions.practical ?? selectedStudent.dimensions.practicalExperience ?? '--'}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Next Recommended Action Card */}
          <div
            style={{
              padding: '14px',
              backgroundColor: 'rgba(99, 102, 241, 0.1)',
              borderRadius: '8px',
              border: '1px solid rgba(99, 102, 241, 0.3)',
              display: 'flex',
              flexDirection: 'column',
              gap: '6px'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.75rem', fontWeight: 700, color: '#a5b4fc', textTransform: 'uppercase' }}>
              <Target size={14} color="#818cf8" /> Next Recommended Action
            </div>
            <div style={{ fontSize: '0.8125rem', color: '#f1f5f9', lineHeight: 1.45 }}>
              {selectedStudent.recommendedAction || selectedStudent.primaryReason || 'Conduct placement counseling session.'}
            </div>
          </div>

          {/* Risk Reasons Attribution */}
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
                <div style={{ fontSize: '0.8125rem', color: '#94a3b8' }}>
                  {selectedStudent.primaryReason}
                </div>
              )}
            </div>
          </div>

          {/* Intervention Creator Form */}
          <form
            onSubmit={handleCreateIntervention}
            style={{
              padding: '16px',
              backgroundColor: 'rgba(15, 23, 42, 0.8)',
              borderRadius: '8px',
              border: '1px solid #334155',
              display: 'flex',
              flexDirection: 'column',
              gap: '12px'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8125rem', fontWeight: 700, color: '#f8fafc' }}>
              <Plus size={14} color="#818cf8" /> Log Mentoring / Intervention Action
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '0.75rem', color: '#94a3b8', fontWeight: 600 }}>Action Type</label>
              <select
                value={actionType}
                onChange={(e) => setActionType(e.target.value)}
                style={{
                  backgroundColor: '#1e293b',
                  color: '#f8fafc',
                  border: '1px solid #334155',
                  borderRadius: '6px',
                  padding: '7px 10px',
                  fontSize: '0.8125rem',
                  outline: 'none'
                }}
              >
                <option value="Mentoring Action">Create Mentoring Action</option>
                <option value="Skill Intervention">Assign Skill Intervention</option>
                <option value="Follow-up Session">Schedule Follow-up</option>
              </select>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '0.75rem', color: '#94a3b8', fontWeight: 600 }}>Action Specifics / Guidance</label>
              <textarea
                rows={2}
                placeholder={selectedStudent.recommendedAction || 'Enter specific instructions or counseling plan...'}
                value={customNote}
                onChange={(e) => setCustomNote(e.target.value)}
                style={{
                  backgroundColor: '#1e293b',
                  color: '#f8fafc',
                  border: '1px solid #334155',
                  borderRadius: '6px',
                  padding: '8px 10px',
                  fontSize: '0.8125rem',
                  outline: 'none',
                  resize: 'vertical'
                }}
              />
            </div>

            <button
              type="submit"
              disabled={isSubmittingAction}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                padding: '8px 16px',
                backgroundColor: '#6366f1',
                border: 'none',
                borderRadius: '6px',
                color: '#ffffff',
                fontSize: '0.8125rem',
                fontWeight: 700,
                cursor: isSubmittingAction ? 'not-allowed' : 'pointer',
                opacity: isSubmittingAction ? 0.7 : 1
              }}
            >
              <Send size={13} /> {isSubmittingAction ? 'Recording...' : 'Assign Action'}
            </button>
          </form>

          {/* Intervention Timeline Section */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', color: '#94a3b8' }}>
                Intervention Timeline
              </span>
              <span style={{ fontSize: '0.75rem', color: '#64748b' }}>
                {studentInterventions.length} active logs
              </span>
            </div>

            {studentInterventions.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {studentInterventions.map((action) => {
                  const statusStyle = getStatusBadge(action.status);
                  return (
                    <div
                      key={action.id}
                      style={{
                        padding: '12px 14px',
                        backgroundColor: 'rgba(30, 41, 59, 0.45)',
                        border: '1px solid #334155',
                        borderRadius: '8px',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '8px'
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8125rem', fontWeight: 700, color: '#f8fafc' }}>
                          <Clock size={12} color="#818cf8" />
                          <span>{action.createdAt}</span>
                          <span style={{ color: '#64748b' }}>•</span>
                          <span style={{ color: '#818cf8' }}>{action.actionType}</span>
                        </div>

                        {/* Status Toggle Controls with stopPropagation */}
                        <div style={{ display: 'flex', gap: '4px' }}>
                          {['Pending', 'In Progress', 'Completed'].map((st) => (
                            <button
                              key={st}
                              type="button"
                              onClick={(e) => handleUpdateStatus(action.id, st, e)}
                              style={{
                                padding: '2px 7px',
                                borderRadius: '4px',
                                border: '1px solid',
                                fontSize: '10px',
                                fontWeight: action.status === st ? 700 : 500,
                                cursor: 'pointer',
                                backgroundColor: action.status === st ? statusStyle.bg : 'transparent',
                                color: action.status === st ? statusStyle.color : '#64748b',
                                borderColor: action.status === st ? statusStyle.border : '#334155'
                              }}
                            >
                              {st}
                            </button>
                          ))}
                        </div>
                      </div>

                      <div style={{ fontSize: '0.8125rem', color: '#cbd5e1', lineHeight: '1.4' }}>
                        "{action.note}"
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div
                style={{
                  padding: '18px',
                  textAlign: 'center',
                  backgroundColor: 'rgba(15, 23, 42, 0.4)',
                  border: '1px dashed #334155',
                  borderRadius: '8px',
                  color: '#64748b',
                  fontSize: '0.75rem'
                }}
              >
                No intervention actions logged yet for this candidate. Use the form above to assign remediation.
              </div>
            )}
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
          <strong style={{ color: '#cbd5e1' }}>Proactive Early-Warning System:</strong> Candidates are evaluated across institutional placement readiness scores, recruitment round rejection ratios, communication assessments, and academic CGPA. Students with confirmed accepted offers are automatically excluded from the at-risk queue. Interventions are diagnostic counseling records and do not predict or guarantee placement hiring outcomes.
        </div>
      </div>
    </div>
  );
}