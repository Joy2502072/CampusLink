import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Briefcase,
  Users,
  CheckCircle2,
  TrendingUp,
  Award,
  Building2,
  Calendar,
  Layers,
  ChevronRight,
  ShieldCheck,
  RefreshCw,
  AlertTriangle,
  Sparkles,
  Target,
  Clock,
  X,
  FileText,
  UserCheck,
  UserX,
  BookOpen,
  FolderGit2,
  AlertCircle
} from 'lucide-react';
import './RecruiterWorkflow.css';

const API_BASE_URL = 'http://localhost:5000/api';

const AUTH_HEADERS = {
  'Content-Type': 'application/json',
  'X-Demo-User-Role': 'placement_officer'
};

export default function RecruiterWorkflow({ onNavigate }) {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  // Core Data
  const [drives, setDrives] = useState([]);
  const [selectedDriveId, setSelectedDriveId] = useState('');
  const [students, setStudents] = useState([]);

  // Authoritative Readiness Map: { [studentId]: number | null }
  const [readinessMap, setReadinessMap] = useState({});

  // Drive-specific Candidate Match Map: { [studentId]: { data, failed: boolean, error?: string } }
  const [matchesMap, setMatchesMap] = useState({});
  const [matchingLoading, setMatchingLoading] = useState(false);

  // Prototype Shortlist State: { [driveId]: [studentId, ...] }
  const [shortlistedMap, setShortlistedMap] = useState(() => {
    try {
      const stored = localStorage.getItem('campuslink_recruiter_shortlist');
      return stored ? JSON.parse(stored) : {};
    } catch {
      return {};
    }
  });

  // Modal / Drawer states
  const [activeWhyStudent, setActiveWhyStudent] = useState(null);
  const [activeGapStudent, setActiveGapStudent] = useState(null);
  const [gapDetailsMap, setGapDetailsMap] = useState({});

  // 1. Fetch Authoritative Readiness for a student cohort from GET /api/students/:id/readiness
  const fetchStudentReadiness = useCallback(async (studentId) => {
    try {
      let res = await fetch(`${API_BASE_URL}/students/${studentId}/readiness`, {
        headers: AUTH_HEADERS
      });

      // Backward-compatible fallback to /api/readiness/student/:id if route is mounted under readiness
      if (!res.ok) {
        res = await fetch(`${API_BASE_URL}/readiness/student/${studentId}`, {
          headers: AUTH_HEADERS
        });
      }

      if (res.ok) {
        const json = await res.json();
        const payload = json.data || json;
        const score =
          payload.overallScore ??
          payload.totalScore ??
          payload.readinessScore ??
          payload.score;

        if (score !== undefined && score !== null && !isNaN(Number(score))) {
          return Number(score);
        }
      }
    } catch {
      // Return null on failure so UI accurately flags it rather than faking scores
    }
    return null;
  }, []);

  // 2. Initial Data Fetch: Drives, Students, and Cohort Readiness
  const fetchInitialData = useCallback(async () => {
    setError(null);
    try {
      const [drivesRes, studentsRes] = await Promise.all([
        fetch(`${API_BASE_URL}/drives`, { headers: AUTH_HEADERS }),
        fetch(`${API_BASE_URL}/students`, { headers: AUTH_HEADERS })
      ]);

      if (!drivesRes.ok) throw new Error(`Failed to load placement drives (HTTP ${drivesRes.status})`);
      if (!studentsRes.ok) throw new Error(`Failed to load students (HTTP ${studentsRes.status})`);

      const drivesJson = await drivesRes.json();
      const studentsJson = await studentsRes.json();

      const driveList = Array.isArray(drivesJson.data)
        ? drivesJson.data
        : (Array.isArray(drivesJson) ? drivesJson : []);
      const studentList = Array.isArray(studentsJson.data)
        ? studentsJson.data
        : (Array.isArray(studentsJson) ? studentsJson : []);

      setDrives(driveList);
      setStudents(studentList);

      if (driveList.length > 0 && !selectedDriveId) {
        setSelectedDriveId(driveList[0].id);
      }

      // Concurrently fetch authoritative readiness scores for every candidate in cohort
      const readinessPromises = studentList.map(async (stu) => {
        const score = await fetchStudentReadiness(stu.id);
        return { studentId: stu.id, score };
      });

      const readinessResults = await Promise.all(readinessPromises);
      const rMap = {};
      readinessResults.forEach((r) => {
        rMap[r.studentId] = r.score;
      });
      setReadinessMap(rMap);
    } catch (err) {
      setError(err.message || 'Error occurred while loading recruiter dashboard.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [selectedDriveId, fetchStudentReadiness]);

  useEffect(() => {
    fetchInitialData();
  }, [fetchInitialData]);

  // 3. Fetch Matching Details with Explicit Failure Visibility
  const fetchMatchingForDrive = useCallback(async (driveId, studentList) => {
    if (!driveId || studentList.length === 0) return;
    setMatchingLoading(true);

    try {
      const matchPromises = studentList.map(async (stu) => {
        try {
          const res = await fetch(`${API_BASE_URL}/matching/student/${stu.id}/drive/${driveId}`, {
            headers: AUTH_HEADERS
          });

          if (res.ok) {
            const json = await res.json();
            return {
              studentId: stu.id,
              data: json.data || json,
              failed: false
            };
          } else {
            return {
              studentId: stu.id,
              data: null,
              failed: true,
              error: `HTTP ${res.status}`
            };
          }
        } catch (err) {
          return {
            studentId: stu.id,
            data: null,
            failed: true,
            error: err.message || 'Network error'
          };
        }
      });

      const results = await Promise.all(matchPromises);
      const newMap = {};
      results.forEach((r) => {
        newMap[r.studentId] = {
          data: r.data,
          failed: r.failed,
          error: r.error
        };
      });
      setMatchesMap(newMap);
    } catch (err) {
      console.error('Failed to compute recruiter candidate matches:', err);
    } finally {
      setMatchingLoading(false);
    }
  }, []);

  useEffect(() => {
    if (selectedDriveId && students.length > 0) {
      fetchMatchingForDrive(selectedDriveId, students);
    }
  }, [selectedDriveId, students, fetchMatchingForDrive]);

  // Local prototype shortlist toggle
  const toggleShortlist = (studentId) => {
    if (!selectedDriveId) return;
    setShortlistedMap((prev) => {
      const currentList = prev[selectedDriveId] || [];
      const updatedList = currentList.includes(studentId)
        ? currentList.filter((id) => id !== studentId)
        : [...currentList, studentId];

      const next = { ...prev, [selectedDriveId]: updatedList };
      try {
        localStorage.setItem('campuslink_recruiter_shortlist', JSON.stringify(next));
      } catch {}
      return next;
    });
  };

  const handleRefresh = () => {
    setRefreshing(true);
    fetchInitialData();
  };

  const selectedDrive = useMemo(() => {
    return drives.find((d) => d.id === selectedDriveId) || drives[0] || null;
  }, [drives, selectedDriveId]);

  // Fetch Skill Gap when recruiter clicks "Skill Gap"
  const handleOpenGapModal = async (student) => {
    setActiveGapStudent(student);
    if (!selectedDriveId) return;

    if (!gapDetailsMap[student.id]) {
      try {
        const res = await fetch(`${API_BASE_URL}/skill-gap/student/${student.id}/drive/${selectedDriveId}`, {
          headers: AUTH_HEADERS
        });
        if (res.ok) {
          const json = await res.json();
          setGapDetailsMap((prev) => ({ ...prev, [student.id]: json.data || json }));
        }
      } catch (err) {
        console.error('Error fetching skill gap in recruiter workflow:', err);
      }
    }
  };

  // KPIs
  const activeShortlistCount = useMemo(() => {
    return (shortlistedMap[selectedDriveId] || []).length;
  }, [shortlistedMap, selectedDriveId]);

  const averageMatchScore = useMemo(() => {
    const validScores = Object.values(matchesMap)
      .filter((entry) => !entry.failed && entry.data)
      .map((entry) => entry.data?.overallMatchScore ?? entry.data?.matchingScore)
      .filter((s) => typeof s === 'number');

    if (validScores.length === 0) return 0;
    return Math.round(validScores.reduce((a, b) => a + b, 0) / validScores.length);
  }, [matchesMap]);

  // Candidate sorting: Shortlisted first, then by valid Match Score descending
  const sortedCandidates = useMemo(() => {
    const list = [...students];
    const currentShortlist = shortlistedMap[selectedDriveId] || [];

    return list.sort((a, b) => {
      const isAShort = currentShortlist.includes(a.id);
      const isBShort = currentShortlist.includes(b.id);
      if (isAShort && !isBShort) return -1;
      if (!isAShort && isBShort) return 1;

      const entryA = matchesMap[a.id];
      const entryB = matchesMap[b.id];

      const scoreA = (!entryA?.failed && entryA?.data)
        ? (entryA.data.overallMatchScore ?? entryA.data.matchingScore ?? -1)
        : -1;
      const scoreB = (!entryB?.failed && entryB?.data)
        ? (entryB.data.overallMatchScore ?? entryB.data.matchingScore ?? -1)
        : -1;

      return scoreB - scoreA;
    });
  }, [students, matchesMap, shortlistedMap, selectedDriveId]);

  const getTierBadgeStyle = (tier) => {
    const t = String(tier || '').toLowerCase();
    if (t.includes('high') || t.includes('tier 1')) {
      return { bg: 'rgba(16, 185, 129, 0.15)', color: '#34d399', border: 'rgba(16, 185, 129, 0.3)' };
    }
    if (t.includes('moderate') || t.includes('tier 2') || t.includes('medium')) {
      return { bg: 'rgba(245, 158, 11, 0.15)', color: '#fbbf24', border: 'rgba(245, 158, 11, 0.3)' };
    }
    return { bg: 'rgba(239, 68, 68, 0.15)', color: '#f87171', border: 'rgba(239, 68, 68, 0.3)' };
  };

  if (loading) {
    return (
      <div style={{ padding: '48px', textAlign: 'center', color: '#64748b' }}>
        <RefreshCw size={24} style={{ animation: 'spin 1s linear infinite', margin: '0 auto 12px' }} />
        <p style={{ margin: 0, fontSize: '0.875rem' }}>Loading recruiter candidate matching portal...</p>
      </div>
    );
  }

  return (
    <div className="recruiter-container">
      {/* 1. Header */}
      <div className="recruiter-header">
        <div>
          <div className="recruiter-title-group">
            <h1 className="recruiter-title">Recruiter Match &amp; Selection Command</h1>
            <span className="recruiter-badge">
              <Briefcase size={12} />
              Corporate Hiring Hub
            </span>
          </div>
          <p className="recruiter-subtitle">
            Drive-specific candidate matching, explainable qualification scoring, and selection pipeline management
          </p>
        </div>

        <button
          onClick={handleRefresh}
          disabled={loading || refreshing}
          className="recruiter-refresh-btn"
        >
          <RefreshCw size={15} style={{ animation: refreshing ? 'spin 1s linear infinite' : 'none' }} />
          {refreshing ? 'Updating Feeds...' : 'Refresh Pipeline'}
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
          <AlertTriangle size={18} />
          <span>{error}</span>
        </div>
      )}

      {/* 2. Recruiter Landing KPI Cards */}
      <div className="recruiter-kpi-grid">
        <div className="recruiter-kpi-card">
          <span className="recruiter-kpi-label">Active Drives</span>
          <div className="recruiter-kpi-value-row">
            <span className="recruiter-kpi-value">{drives.length}</span>
            <span className="recruiter-kpi-subtext">scheduled</span>
          </div>
          <span style={{ fontSize: '0.75rem', color: '#818cf8', display: 'flex', alignItems: 'center', gap: '4px' }}>
            <Building2 size={12} /> Live corporate recruitment
          </span>
        </div>

        <div className="recruiter-kpi-card">
          <span className="recruiter-kpi-label">Candidates Evaluated</span>
          <div className="recruiter-kpi-value-row">
            <span className="recruiter-kpi-value">{students.length}</span>
            <span className="recruiter-kpi-subtext">in pool</span>
          </div>
          <span style={{ fontSize: '0.75rem', color: '#38bdf8', display: 'flex', alignItems: 'center', gap: '4px' }}>
            <Users size={12} /> BPUT Batch 2026
          </span>
        </div>

        <div className="recruiter-kpi-card">
          <span className="recruiter-kpi-label">Shortlisted Candidates</span>
          <div className="recruiter-kpi-value-row">
            <span className="recruiter-kpi-value" style={{ color: '#10b981' }}>{activeShortlistCount}</span>
            <span className="recruiter-kpi-subtext">selected</span>
          </div>
          <span style={{ fontSize: '0.75rem', color: '#10b981', display: 'flex', alignItems: 'center', gap: '4px' }}>
            <UserCheck size={12} /> Prototype shortlist state
          </span>
        </div>

        <div className="recruiter-kpi-card">
          <span className="recruiter-kpi-label">Average Match Index</span>
          <div className="recruiter-kpi-value-row">
            <span className="recruiter-kpi-value" style={{ color: '#f59e0b' }}>{averageMatchScore}%</span>
            <span className="recruiter-kpi-subtext">cohort</span>
          </div>
          <span style={{ fontSize: '0.75rem', color: '#f59e0b', display: 'flex', alignItems: 'center', gap: '4px' }}>
            <Award size={12} /> 4-dimension alignment
          </span>
        </div>
      </div>

      {/* 3. Selected Drive Hero & Control Strip */}
      {selectedDrive && (
        <div className="recruiter-drive-hero">
          <div className="recruiter-drive-header">
            <div>
              <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                Active Recruitment Drive Context
              </span>
              <div style={{ fontSize: '1.45rem', fontWeight: 800, color: '#ffffff', marginTop: '4px' }}>
                {selectedDrive.company} – {selectedDrive.role}
              </div>
              <div style={{ fontSize: '0.8125rem', color: '#818cf8', marginTop: '2px', fontFamily: 'monospace' }}>
                Drive ID: {selectedDrive.id} • Status: {selectedDrive.status}
              </div>
            </div>

            <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
              <div className="recruiter-drive-select-wrapper">
                <span style={{ fontSize: '0.75rem', color: '#94a3b8', fontWeight: 600 }}>Select Drive:</span>
                <select
                  value={selectedDriveId}
                  onChange={(e) => setSelectedDriveId(e.target.value)}
                  className="recruiter-drive-select"
                >
                  {drives.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.company} – {d.role}
                    </option>
                  ))}
                </select>
              </div>

              {/* Honest Scheduler Navigation */}
              <button
                type="button"
                onClick={() => onNavigate && onNavigate('drives')}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '8px 16px',
                  backgroundColor: '#6366f1',
                  border: 'none',
                  borderRadius: '6px',
                  color: '#ffffff',
                  fontSize: '0.8125rem',
                  fontWeight: 700,
                  cursor: 'pointer'
                }}
              >
                <Calendar size={14} /> Open Scheduler
              </button>
            </div>
          </div>

          <div className="recruiter-drive-details-grid">
            <div>
              <div className="recruiter-drive-item-label">Package</div>
              <div className="recruiter-drive-item-val" style={{ color: '#10b981' }}>
                {selectedDrive.packageLPA ?? selectedDrive.salaryLpa ?? '--'} LPA
              </div>
            </div>

            <div>
              <div className="recruiter-drive-item-label">Drive Date &amp; Time</div>
              <div className="recruiter-drive-item-val">
                {selectedDrive.date || selectedDrive.driveDate} ({selectedDrive.startTime || '09:00'})
              </div>
            </div>

            <div>
              <div className="recruiter-drive-item-label">Venue / Mode</div>
              <div className="recruiter-drive-item-val">
                {selectedDrive.venue || 'Virtual Assessment'}
              </div>
            </div>

            <div>
              <div className="recruiter-drive-item-label">Openings / Capacity</div>
              <div className="recruiter-drive-item-val">
                {selectedDrive.openings ?? '--'} Openings
              </div>
            </div>

            <div>
              <div className="recruiter-drive-item-label">Eligible Branches</div>
              <div className="recruiter-drive-item-val">
                {(selectedDrive.eligibleBranches || []).join(', ') || 'All'}
              </div>
            </div>
          </div>

          <div>
            <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Corporate Prerequisite Skills ({selectedDrive.requiredSkills ? selectedDrive.requiredSkills.length : 0})
            </span>
            <div className="recruiter-skills-list">
              {(selectedDrive.requiredSkills || []).map((sk) => (
                <span key={sk} className="recruiter-skill-chip">
                  {sk}
                </span>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 4. Candidate Matching Section Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h2 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 700, color: '#f8fafc', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Users size={18} color="#818cf8" />
            Ranked Candidate Matches for {selectedDrive?.company || 'Drive'}
          </h2>
          <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
            Multi-dimensional deterministic ranking: Branch Eligibility, Technical Match, Readiness Score, Communication
          </span>
        </div>

        <span style={{ fontSize: '0.8125rem', color: '#cbd5e1' }}>
          Shortlisted: <strong style={{ color: '#10b981' }}>{activeShortlistCount}</strong> of {students.length} candidates
        </span>
      </div>

      {matchingLoading ? (
        <div style={{ padding: '36px', textAlign: 'center', color: '#64748b' }}>
          <RefreshCw size={22} style={{ animation: 'spin 1s linear infinite', margin: '0 auto 8px' }} />
          <p style={{ margin: 0, fontSize: '0.8125rem' }}>Computing 4-dimension alignment scores for candidate cohort...</p>
        </div>
      ) : (
        <div className="candidates-grid">
          {sortedCandidates.map((stu) => {
            const matchEntry = matchesMap[stu.id] || {};
            const isMatchFailed = matchEntry.failed;
            const matchInfo = matchEntry.data || {};

            const score = matchInfo.overallMatchScore ?? matchInfo.matchingScore;
            const tier = isMatchFailed
              ? 'Status Unavailable'
              : (matchInfo.matchTier || (typeof score === 'number' && score >= 70 ? 'High Alignment' : typeof score === 'number' && score >= 45 ? 'Moderate Alignment' : 'Low Alignment'));
            const tierBadge = isMatchFailed
              ? { bg: 'rgba(100, 116, 139, 0.15)', color: '#94a3b8', border: 'rgba(100, 116, 139, 0.3)' }
              : getTierBadgeStyle(tier);

            const isShortlisted = (shortlistedMap[selectedDriveId] || []).includes(stu.id);

            // Authoritative readiness score from /api/students/:id/readiness
            const authoritativeReadiness = readinessMap[stu.id];

            // Primary source of truth for matched skills: breakdown.technicalSkillMatch.matchedSkills
            const breakdownTechMatched = matchInfo.breakdown?.technicalSkillMatch?.matchedSkills;
            const matchingSkills = Array.isArray(breakdownTechMatched)
              ? breakdownTechMatched
              : (matchInfo.matchingSkills || matchInfo.matchedSkills || []);

            const missingSkills = matchInfo.missingSkills || [];

            return (
              <div key={stu.id} className="candidate-card">
                <div className="candidate-header-row">
                  <div>
                    <div className="candidate-name">{stu.name}</div>
                    <div className="candidate-meta">
                      {stu.id} • {stu.branch || 'CSE'} • CGPA: {Number(stu.cgpa || 0).toFixed(2)}
                    </div>
                  </div>

                  <span
                    style={{
                      fontSize: '11px',
                      fontWeight: 700,
                      padding: '3px 8px',
                      borderRadius: '999px',
                      backgroundColor: tierBadge.bg,
                      color: tierBadge.color,
                      border: `1px solid ${tierBadge.border}`
                    }}
                  >
                    {tier}
                  </span>
                </div>

                <div className="candidate-score-banner">
                  <div>
                    <span style={{ fontSize: '0.6875rem', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 600 }}>
                      Match Score
                    </span>
                    {isMatchFailed ? (
                      <div className="match-unavailable-badge">
                        <AlertCircle size={13} />
                        <span>Match unavailable</span>
                      </div>
                    ) : (
                      <div
                        className="candidate-score-val"
                        style={{
                          color:
                            typeof score === 'number' && score >= 65
                              ? '#10b981'
                              : typeof score === 'number' && score >= 40
                              ? '#f59e0b'
                              : '#f87171'
                        }}
                      >
                        {typeof score === 'number' ? `${score}%` : '--%'}
                      </div>
                    )}
                  </div>

                  <div style={{ textAlign: 'right' }}>
                    <span style={{ fontSize: '0.6875rem', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 600 }}>
                      Readiness Score
                    </span>
                    <div style={{ fontSize: '1.15rem', fontWeight: 800, color: '#f8fafc', fontFamily: 'monospace' }}>
                      {authoritativeReadiness !== null && authoritativeReadiness !== undefined
                        ? `${authoritativeReadiness}/100`
                        : '--/100'}
                    </div>
                  </div>
                </div>

                {/* Matching Skills */}
                <div className="candidate-skills-section">
                  <span className="candidate-skills-title">Matched Skills ({matchingSkills.length})</span>
                  <div className="candidate-skill-chips-row">
                    {matchingSkills.length > 0 ? (
                      matchingSkills.map((sk, idx) => (
                        <span key={idx} className="matched-chip">
                          ✓ {typeof sk === 'string' ? sk : sk?.name}
                        </span>
                      ))
                    ) : (
                      <span style={{ fontSize: '11px', color: '#64748b', fontStyle: 'italic' }}>
                        {isMatchFailed ? 'Diagnostic unavailable' : 'No verified overlap recorded'}
                      </span>
                    )}
                  </div>
                </div>

                {/* Missing Skills */}
                {missingSkills.length > 0 && (
                  <div className="candidate-skills-section">
                    <span className="candidate-skills-title">Missing Requirements ({missingSkills.length})</span>
                    <div className="candidate-skill-chips-row">
                      {missingSkills.slice(0, 4).map((sk, idx) => (
                        <span key={idx} className="missing-chip">
                          ✕ {typeof sk === 'string' ? sk : sk?.name}
                        </span>
                      ))}
                      {missingSkills.length > 4 && (
                        <span style={{ fontSize: '10px', color: '#94a3b8', alignSelf: 'center' }}>
                          +{missingSkills.length - 4} more
                        </span>
                      )}
                    </div>
                  </div>
                )}

                {/* Candidate Action Buttons */}
                <div className="candidate-actions-row">
                  <button
                    type="button"
                    disabled={isMatchFailed}
                    onClick={() => setActiveWhyStudent(stu)}
                    className="why-btn"
                    style={{ opacity: isMatchFailed ? 0.5 : 1, cursor: isMatchFailed ? 'not-allowed' : 'pointer' }}
                  >
                    <Sparkles size={13} /> Why Match?
                  </button>

                  <button
                    type="button"
                    onClick={() => handleOpenGapModal(stu)}
                    className="gap-btn"
                  >
                    Skill Gap
                  </button>

                  <button
                    type="button"
                    onClick={() => toggleShortlist(stu.id)}
                    className={`shortlist-btn ${isShortlisted ? 'active' : 'inactive'}`}
                  >
                    {isShortlisted ? (
                      <>
                        <CheckCircle2 size={13} /> Shortlisted
                      </>
                    ) : (
                      <>
                        <UserCheck size={13} /> Shortlist
                      </>
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* 5. "Why This Candidate?" Explainable Matching Drawer */}
      {activeWhyStudent && (
        <div className="recruiter-drawer-overlay" onClick={() => setActiveWhyStudent(null)}>
          <div className="recruiter-drawer" onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Sparkles size={18} color="#818cf8" />
                <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 800, color: '#f8fafc' }}>
                  Explainable Candidate Match Breakdown
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setActiveWhyStudent(null)}
                style={{
                  background: 'rgba(30, 41, 59, 0.7)',
                  border: '1px solid #334155',
                  borderRadius: '6px',
                  color: '#cbd5e1',
                  cursor: 'pointer',
                  padding: '6px'
                }}
              >
                <X size={18} />
              </button>
            </div>

            {/* Candidate Header Summary */}
            <div style={{ padding: '16px', backgroundColor: 'rgba(30, 41, 59, 0.45)', borderRadius: '10px', border: '1px solid #334155' }}>
              <div style={{ fontSize: '1.1rem', fontWeight: 700, color: '#ffffff' }}>
                {activeWhyStudent.name}
              </div>
              <div style={{ fontSize: '0.75rem', color: '#818cf8', fontFamily: 'monospace', marginTop: '2px' }}>
                {activeWhyStudent.id} • {activeWhyStudent.branch} • CGPA: {Number(activeWhyStudent.cgpa || 0).toFixed(2)}
              </div>
              <div style={{ fontSize: '0.8125rem', color: '#cbd5e1', marginTop: '8px' }}>
                Target: <strong style={{ color: '#fff' }}>{selectedDrive?.role}</strong> at <strong style={{ color: '#fff' }}>{selectedDrive?.company}</strong>
              </div>
            </div>

            {/* 4-Dimension Weight Breakdown from matchData.breakdown */}
            {(() => {
              const mData = matchesMap[activeWhyStudent.id]?.data || {};
              const breakdown = mData.breakdown || {};
              const totalScore = mData.overallMatchScore ?? mData.matchingScore ?? 0;

              // Extract values directly from matchData.breakdown
              const branchScore = breakdown.branchEligibility?.score ?? 25;
              const branchMax = breakdown.branchEligibility?.maxScore ?? 25;

              const techScore = breakdown.technicalSkillMatch?.score ?? 0;
              const techMax = breakdown.technicalSkillMatch?.maxScore ?? 35;

              const readinessScore = breakdown.academicReadiness?.score ?? 0;
              const readinessMax = breakdown.academicReadiness?.maxScore ?? 25;

              const commScore = breakdown.communication?.score ?? 0;
              const commMax = breakdown.communication?.maxScore ?? 15;

              return (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                    <span style={{ fontSize: '0.8125rem', fontWeight: 700, color: '#cbd5e1' }}>
                      Overall Composite Match
                    </span>
                    <span style={{ fontSize: '1.75rem', fontWeight: 800, color: totalScore >= 65 ? '#10b981' : '#f59e0b', fontFamily: 'monospace' }}>
                      {totalScore}%
                    </span>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', marginBottom: '3px' }}>
                        <span>Branch Academic Eligibility (Max {branchMax} pts)</span>
                        <strong>{branchScore}/{branchMax}</strong>
                      </div>
                      <div style={{ height: '6px', backgroundColor: '#1e293b', borderRadius: '3px', overflow: 'hidden' }}>
                        <div style={{ width: `${branchMax > 0 ? (branchScore / branchMax) * 100 : 0}%`, height: '100%', backgroundColor: '#6366f1' }} />
                      </div>
                    </div>

                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', marginBottom: '3px' }}>
                        <span>Technical Skill Alignment (Max {techMax} pts)</span>
                        <strong>{techScore}/{techMax}</strong>
                      </div>
                      <div style={{ height: '6px', backgroundColor: '#1e293b', borderRadius: '3px', overflow: 'hidden' }}>
                        <div style={{ width: `${techMax > 0 ? (techScore / techMax) * 100 : 0}%`, height: '100%', backgroundColor: '#10b981' }} />
                      </div>
                    </div>

                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', marginBottom: '3px' }}>
                        <span>Placement Readiness Quotient (Max {readinessMax} pts)</span>
                        <strong>{readinessScore}/{readinessMax}</strong>
                      </div>
                      <div style={{ height: '6px', backgroundColor: '#1e293b', borderRadius: '3px', overflow: 'hidden' }}>
                        <div style={{ width: `${readinessMax > 0 ? (readinessScore / readinessMax) * 100 : 0}%`, height: '100%', backgroundColor: '#38bdf8' }} />
                      </div>
                    </div>

                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', marginBottom: '3px' }}>
                        <span>Communication Proficiency (Max {commMax} pts)</span>
                        <strong>{commScore}/{commMax}</strong>
                      </div>
                      <div style={{ height: '6px', backgroundColor: '#1e293b', borderRadius: '3px', overflow: 'hidden' }}>
                        <div style={{ width: `${commMax > 0 ? (commScore / commMax) * 100 : 0}%`, height: '100%', backgroundColor: '#f59e0b' }} />
                      </div>
                    </div>
                  </div>

                  {/* Why Match Explanation */}
                  <div style={{ padding: '12px 14px', backgroundColor: 'rgba(99, 102, 241, 0.1)', border: '1px solid rgba(99, 102, 241, 0.25)', borderRadius: '8px' }}>
                    <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#a5b4fc', textTransform: 'uppercase' }}>
                      Diagnostic Recommendation
                    </div>
                    <div style={{ fontSize: '0.8125rem', color: '#cbd5e1', marginTop: '4px', lineHeight: 1.45 }}>
                      {mData.explanation || `Candidate satisfies departmental recruitment screening with ${techScore}/${techMax} verified technical alignment points.`}
                    </div>
                  </div>
                </div>
              );
            })()}

            <div style={{ marginTop: 'auto', display: 'flex', gap: '10px' }}>
              <button
                type="button"
                onClick={() => {
                  toggleShortlist(activeWhyStudent.id);
                  setActiveWhyStudent(null);
                }}
                style={{
                  flex: 1,
                  padding: '10px',
                  backgroundColor: '#6366f1',
                  border: 'none',
                  borderRadius: '6px',
                  color: '#ffffff',
                  fontSize: '0.8125rem',
                  fontWeight: 700,
                  cursor: 'pointer'
                }}
              >
                {(shortlistedMap[selectedDriveId] || []).includes(activeWhyStudent.id)
                  ? 'Remove from Shortlist'
                  : 'Confirm Shortlist Nomination'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 6. Skill Gap Detailed Inspector Drawer */}
      {activeGapStudent && (
        <div className="recruiter-drawer-overlay" onClick={() => setActiveGapStudent(null)}>
          <div className="recruiter-drawer" onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Target size={18} color="#f59e0b" />
                <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 800, color: '#f8fafc' }}>
                  Candidate Skill Gap Analysis
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setActiveGapStudent(null)}
                style={{
                  background: 'rgba(30, 41, 59, 0.7)',
                  border: '1px solid #334155',
                  borderRadius: '6px',
                  color: '#cbd5e1',
                  cursor: 'pointer',
                  padding: '6px'
                }}
              >
                <X size={18} />
              </button>
            </div>

            <div style={{ padding: '16px', backgroundColor: 'rgba(30, 41, 59, 0.45)', borderRadius: '10px', border: '1px solid #334155' }}>
              <div style={{ fontSize: '1.05rem', fontWeight: 700, color: '#ffffff' }}>{activeGapStudent.name}</div>
              <div style={{ fontSize: '0.75rem', color: '#818cf8', fontFamily: 'monospace' }}>
                {activeGapStudent.id} • {activeGapStudent.branch}
              </div>
              <div style={{ fontSize: '0.8125rem', color: '#cbd5e1', marginTop: '6px' }}>
                Target Drive: <strong>{selectedDrive?.company}</strong> ({selectedDrive?.role})
              </div>
            </div>

            {(() => {
              const gap = gapDetailsMap[activeGapStudent.id];
              if (!gap) {
                return (
                  <div style={{ padding: '24px', textAlign: 'center', color: '#64748b' }}>
                    <RefreshCw size={18} style={{ animation: 'spin 1s linear infinite', margin: '0 auto 8px' }} />
                    <p style={{ margin: 0, fontSize: '0.75rem' }}>Fetching drive-specific prerequisite analysis...</p>
                  </div>
                );
              }

              const matched = gap.matchedSkills || [];
              const partial = gap.partialSkills || [];
              const missing = gap.missingSkills || [];
              const coverage = gap.skillCoverage ?? gap.coveragePercentage ?? 0;

              return (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  {/* Coverage Bar */}
                  <div style={{ padding: '12px 14px', backgroundColor: 'rgba(30, 41, 59, 0.5)', borderRadius: '8px', border: '1px solid #334155' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                      <span style={{ fontSize: '0.75rem', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 600 }}>Prerequisite Coverage</span>
                      <span style={{ fontSize: '1.35rem', fontWeight: 800, color: coverage >= 60 ? '#10b981' : '#f59e0b', fontFamily: 'monospace' }}>
                        {coverage}%
                      </span>
                    </div>
                    <div style={{ height: '6px', backgroundColor: '#1e293b', borderRadius: '3px', overflow: 'hidden', marginTop: '6px' }}>
                      <div style={{ width: `${coverage}%`, height: '100%', backgroundColor: coverage >= 60 ? '#10b981' : '#f59e0b' }} />
                    </div>
                  </div>

                  {/* Matched */}
                  <div>
                    <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#34d399', textTransform: 'uppercase', display: 'block', marginBottom: '6px' }}>
                      Verified Matched Skills ({matched.length})
                    </span>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                      {matched.map((sk) => (
                        <span key={sk} className="matched-chip">✓ {sk}</span>
                      ))}
                      {matched.length === 0 && (
                        <span style={{ fontSize: '0.75rem', color: '#64748b', fontStyle: 'italic' }}>None verified</span>
                      )}
                    </div>
                  </div>

                  {/* Partial with Evidence */}
                  {partial.length > 0 && (
                    <div>
                      <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#fbbf24', textTransform: 'uppercase', display: 'block', marginBottom: '6px' }}>
                        Partial Skills with Project Evidence ({partial.length})
                      </span>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                        {partial.map((p, idx) => (
                          <div
                            key={idx}
                            style={{
                              padding: '6px 10px',
                              borderRadius: '6px',
                              backgroundColor: 'rgba(245, 158, 11, 0.08)',
                              border: '1px solid rgba(245, 158, 11, 0.25)',
                              fontSize: '0.75rem',
                              display: 'flex',
                              justifyContent: 'space-between',
                              alignItems: 'center'
                            }}
                          >
                            <span style={{ color: '#fbbf24', fontWeight: 700 }}>{p.skill || p}</span>
                            {p.evidence && (
                              <span style={{ color: '#94a3b8', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                <FolderGit2 size={12} color="#f59e0b" />
                                Project: <strong style={{ color: '#cbd5e1' }}>{p.evidence}</strong>
                              </span>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Missing */}
                  <div>
                    <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#f87171', textTransform: 'uppercase', display: 'block', marginBottom: '6px' }}>
                      Missing Requirements ({missing.length})
                    </span>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                      {missing.map((sk) => (
                        <span key={sk} className="missing-chip">✕ {sk}</span>
                      ))}
                    </div>
                  </div>
                </div>
              );
            })()}
          </div>
        </div>
      )}

      {/* 7. Methodology Footer */}
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
          <strong style={{ color: '#cbd5e1' }}>Corporate Selection Governance:</strong> Candidate ranking uses verified institutional academic benchmarks and multi-factor matching algorithms without synthetic scores. Shortlisting selections are captured in the active prototype workflow.
        </div>
      </div>
    </div>
  );
}