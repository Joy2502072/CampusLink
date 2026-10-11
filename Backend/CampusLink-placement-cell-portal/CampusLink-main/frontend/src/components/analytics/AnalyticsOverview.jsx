import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  TrendingUp,
  Award,
  Users,
  Briefcase,
  Building2,
  RefreshCw,
  AlertCircle,
  Sparkles,
  Layers,
  GraduationCap,
  ShieldCheck,
  CheckCircle2
} from 'lucide-react';
import './AnalyticsOverview.css';

const API_BASE_URL = 'http://localhost:5000/api';

const AUTH_HEADERS = {
  'Content-Type': 'application/json',
  'X-Demo-User-Role': 'placement_officer'
};

// Safe helper to format package strings without duplicate "LPA"
function formatPackageDisplay(pkg) {
  if (pkg === null || pkg === undefined || pkg === '') return '--';
  const str = String(pkg).trim();
  if (/lpa$/i.test(str)) {
    return str;
  }
  return `${str} LPA`;
}

// Safe helper to parse numeric LPA value from various offer fields
function extractNumericLPA(offer) {
  if (!offer) return null;
  const raw = offer.salaryLpa ?? offer.salary_lpa ?? offer.packageLPA ?? offer.package_lpa ?? offer.ctc ?? offer.package;
  if (raw === null || raw === undefined) return null;
  const num = parseFloat(String(raw).replace(/[^0-9.]/g, ''));
  return isNaN(num) ? null : num;
}

export default function AnalyticsOverview() {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  // Raw API data states
  const [overviewData, setOverviewData] = useState(null);
  const [cohortData, setCohortData] = useState(null);
  const [drivesData, setDrivesData] = useState([]);
  const [studentsData, setStudentsData] = useState([]);
  const [offersData, setOffersData] = useState([]);

  const fetchAnalytics = useCallback(async () => {
    setError(null);
    try {
      const [overviewRes, cohortRes, drivesRes, studentsRes, offersRes] = await Promise.all([
        fetch(`${API_BASE_URL}/analytics/overview`, { headers: AUTH_HEADERS }),
        fetch(`${API_BASE_URL}/readiness/cohort`, { headers: AUTH_HEADERS }),
        fetch(`${API_BASE_URL}/drives`, { headers: AUTH_HEADERS }),
        fetch(`${API_BASE_URL}/students`, { headers: AUTH_HEADERS }),
        fetch(`${API_BASE_URL}/offers`, { headers: AUTH_HEADERS })
      ]);

      if (!overviewRes.ok) {
        throw new Error(`Failed to load placement overview (HTTP ${overviewRes.status})`);
      }

      const overviewJson = await overviewRes.json();
      setOverviewData(overviewJson.data || overviewJson);

      if (cohortRes.ok) {
        const cohortJson = await cohortRes.json();
        setCohortData(cohortJson.data || cohortJson);
      }

      if (drivesRes.ok) {
        const drivesJson = await drivesRes.json();
        const driveList = Array.isArray(drivesJson.data)
          ? drivesJson.data
          : (Array.isArray(drivesJson) ? drivesJson : []);
        setDrivesData(driveList);
      }

      if (studentsRes.ok) {
        const studentsJson = await studentsRes.json();
        const studentList = Array.isArray(studentsJson.data)
          ? studentsJson.data
          : (Array.isArray(studentsJson) ? studentsJson : []);
        setStudentsData(studentList);
      }

      if (offersRes.ok) {
        const offersJson = await offersRes.json();
        const offerList = Array.isArray(offersJson.data)
          ? offersJson.data
          : (Array.isArray(offersJson) ? offersJson : []);
        setOffersData(offerList);
      }
    } catch (err) {
      setError(err.message || 'Error occurred while loading placement analytics.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchAnalytics();
  }, [fetchAnalytics]);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchAnalytics();
  };

  // 1. KPI Extractions directly from flat /api/analytics/overview payload
  const totalStudents = Number(overviewData?.totalStudents ?? 0);
  const placedStudents = Number(overviewData?.placedStudents ?? 0);
  const placementRate = overviewData?.placementRate !== undefined
    ? Number(overviewData.placementRate).toFixed(2)
    : (totalStudents > 0 ? ((placedStudents / totalStudents) * 100).toFixed(2) : '0.00');
  const avgPackage = overviewData?.averagePackageLPA !== undefined
    ? Number(overviewData.averagePackageLPA).toFixed(2)
    : '0.00';
  const highestPackage = overviewData?.highestPackageLPA !== undefined
    ? Number(overviewData.highestPackageLPA).toFixed(2)
    : '0.00';
  const activePlacementDrives = Number(
    overviewData?.activePlacementDrives ?? drivesData.length
  );

  // 2. Dynamic Branch-wise Placement Analysis computed from live students and offers
  const branchStats = useMemo(() => {
    if (!studentsData || studentsData.length === 0) return [];

    // Map confirmed placed student IDs or evaluate from student.status
    const placedStudentIds = new Set();

    // Student status check
    studentsData.forEach((s) => {
      const status = String(s.status || '').toLowerCase().trim();
      if (status === 'placed') {
        placedStudentIds.add(String(s.id));
      }
    });

    // Offer confirmation check
    offersData.forEach((o) => {
      const status = String(o.status || '').toLowerCase().trim();
      if (status === 'accepted' || status === 'joining confirmed' || status === 'verified') {
        const sId = o.studentId ?? o.student_id;
        if (sId) placedStudentIds.add(String(sId));
      }
    });

    // Group packages by studentId to find their placed package
    const studentPackageMap = {};
    offersData.forEach((o) => {
      const sId = String(o.studentId ?? o.student_id ?? '');
      const numLPA = extractNumericLPA(o);
      if (sId && numLPA !== null) {
        if (!studentPackageMap[sId] || numLPA > studentPackageMap[sId]) {
          studentPackageMap[sId] = numLPA;
        }
      }
    });

    // Aggregate by branch
    const branchMap = {};
    studentsData.forEach((s) => {
      const branch = (s.branch || s.department || 'General').toUpperCase().trim();
      if (!branchMap[branch]) {
        branchMap[branch] = {
          branch,
          total: 0,
          placed: 0,
          placedPackagesSum: 0,
          placedPackagesCount: 0
        };
      }
      branchMap[branch].total += 1;

      const isPlaced = placedStudentIds.has(String(s.id));
      if (isPlaced) {
        branchMap[branch].placed += 1;
        const pkg = studentPackageMap[String(s.id)];
        if (pkg !== undefined) {
          branchMap[branch].placedPackagesSum += pkg;
          branchMap[branch].placedPackagesCount += 1;
        }
      }
    });

    return Object.values(branchMap)
      .map((b) => {
        const rate = b.total > 0 ? ((b.placed / b.total) * 100).toFixed(1) : '0.0';
        const avgLpa = b.placedPackagesCount > 0
          ? (b.placedPackagesSum / b.placedPackagesCount).toFixed(2)
          : '--';
        return {
          branch: b.branch,
          total: b.total,
          placed: b.placed,
          rate,
          avgLpa
        };
      })
      .sort((a, b) => b.total - a.total);
  }, [studentsData, offersData]);

  // 3. CTC Package Distribution computed directly from live /api/offers records
  const packageDistribution = useMemo(() => {
    let below10 = 0;
    let range10_15 = 0;
    let range15_20 = 0;
    let above20 = 0;

    offersData.forEach((offer) => {
      const lpa = extractNumericLPA(offer);
      if (lpa !== null) {
        if (lpa < 10) below10 += 1;
        else if (lpa >= 10 && lpa < 15) range10_15 += 1;
        else if (lpa >= 15 && lpa < 20) range15_20 += 1;
        else if (lpa >= 20) above20 += 1;
      }
    });

    return [
      { label: 'Below 10 LPA', count: below10 },
      { label: '10–15 LPA', count: range10_15 },
      { label: '15–20 LPA', count: range15_20 },
      { label: '20+ LPA', count: above20 }
    ];
  }, [offersData]);

  const maxPackageCount = useMemo(() => {
    const counts = packageDistribution.map((d) => d.count);
    return Math.max(...counts, 1);
  }, [packageDistribution]);

  // 4. Readiness Cohort Extraction
  const cohortDist = cohortData?.distribution || {};
  const avgReadiness = cohortData?.averageScore !== undefined
    ? Number(cohortData.averageScore).toFixed(1)
    : '0.0';
  const readinessRate = cohortData?.readinessRate !== undefined
    ? Number(cohortData.readinessRate).toFixed(1)
    : '0.0';

  // 5. In-Demand Skills Frequency computed dynamically from requiredSkills of drives
  const inDemandSkills = useMemo(() => {
    const frequency = {};

    drivesData.forEach((drive) => {
      const skills = Array.isArray(drive.requiredSkills)
        ? drive.requiredSkills
        : (Array.isArray(drive.skills) ? drive.skills : []);

      skills.forEach((sk) => {
        if (typeof sk === 'string' && sk.trim()) {
          const clean = sk.trim();
          frequency[clean] = (frequency[clean] || 0) + 1;
        }
      });
    });

    return Object.entries(frequency)
      .map(([skill, count]) => ({
        skill,
        count,
        percentage: drivesData.length > 0 ? Math.round((count / drivesData.length) * 100) : 0
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 8);
  }, [drivesData]);

  // 6. Deterministic Placement Insights calculated strictly from live data
  const deterministicInsights = useMemo(() => {
    const items = [];

    if (totalStudents > 0) {
      items.push(`Current cohort placement rate is ${placementRate}%.`);
      items.push(`${placedStudents} of ${totalStudents} students are currently recorded as placed.`);
    }

    if (overviewData?.averagePackageLPA !== undefined) {
      items.push(`Average recorded package is ${avgPackage} LPA.`);
    }

    if (activePlacementDrives > 0) {
      items.push(`${activePlacementDrives} placement drives are currently registered.`);
    }

    if (cohortData?.readinessRate !== undefined) {
      items.push(`Cohort readiness rate is ${readinessRate}% based on the current readiness model.`);
    }

    if (inDemandSkills.length > 0) {
      items.push(`Top required skill across current drives is ${inDemandSkills[0].skill} (${inDemandSkills[0].count} drives).`);
    }

    return items;
  }, [
    totalStudents,
    placedStudents,
    placementRate,
    overviewData,
    avgPackage,
    activePlacementDrives,
    cohortData,
    readinessRate,
    inDemandSkills
  ]);

  if (loading) {
    return (
      <div style={{ padding: '48px', textAlign: 'center', color: '#64748b' }}>
        <RefreshCw size={24} style={{ animation: 'spin 1s linear infinite', margin: '0 auto 12px' }} />
        <p style={{ margin: 0, fontSize: '0.875rem' }}>Aggregating live MySQL placement intelligence...</p>
      </div>
    );
  }

  return (
    <div className="analytics-container">
      {/* 1. Header with Live MySQL Data Badge */}
      <div className="analytics-header">
        <div>
          <div className="analytics-title-group">
            <h1 className="analytics-title">Advanced Placement Analytics</h1>
            <span className="analytics-live-badge">
              <span className="analytics-pulse-dot" />
              Live MySQL Data
            </span>
          </div>
          <p className="analytics-subtitle">
            Executive institutional intelligence: cohort readiness, drive requirements, and recruitment distributions
          </p>
        </div>

        <button
          onClick={handleRefresh}
          disabled={loading || refreshing}
          className="analytics-refresh-btn"
        >
          <RefreshCw size={15} style={{ animation: refreshing ? 'spin 1s linear infinite' : 'none' }} />
          {refreshing ? 'Updating Feeds...' : 'Refresh Analytics'}
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

      {/* 2. KPI Cards */}
      <div className="analytics-kpi-grid">
        <div className="analytics-kpi-card">
          <span className="analytics-kpi-label">Total Cohort</span>
          <div className="analytics-kpi-value-row">
            <span className="analytics-kpi-value">{totalStudents}</span>
            <span className="analytics-kpi-subtext">registered</span>
          </div>
          <span style={{ fontSize: '0.75rem', color: '#818cf8', display: 'flex', alignItems: 'center', gap: '4px' }}>
            <Users size={12} /> Total students
          </span>
        </div>

        <div className="analytics-kpi-card">
          <span className="analytics-kpi-label">Students Placed</span>
          <div className="analytics-kpi-value-row">
            <span className="analytics-kpi-value" style={{ color: '#10b981' }}>{placedStudents}</span>
            <span className="analytics-kpi-subtext">confirmed</span>
          </div>
          <span style={{ fontSize: '0.75rem', color: '#10b981', display: 'flex', alignItems: 'center', gap: '4px' }}>
            <CheckCircle2 size={12} /> With verified offers
          </span>
        </div>

        <div className="analytics-kpi-card">
          <span className="analytics-kpi-label">Placement Rate</span>
          <div className="analytics-kpi-value-row">
            <span className="analytics-kpi-value" style={{ color: '#38bdf8' }}>{placementRate}%</span>
          </div>
          <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
            Calculated from current placement records.
          </span>
        </div>

        <div className="analytics-kpi-card">
          <span className="analytics-kpi-label">Average Package</span>
          <div className="analytics-kpi-value-row">
            <span className="analytics-kpi-value">{avgPackage}</span>
            <span className="analytics-kpi-subtext">LPA</span>
          </div>
          <span style={{ fontSize: '0.75rem', color: '#34d399', display: 'flex', alignItems: 'center', gap: '4px' }}>
            <TrendingUp size={12} /> Average of offers
          </span>
        </div>

        <div className="analytics-kpi-card">
          <span className="analytics-kpi-label">Highest Package</span>
          <div className="analytics-kpi-value-row">
            <span className="analytics-kpi-value" style={{ color: '#f59e0b' }}>{highestPackage}</span>
            <span className="analytics-kpi-subtext">LPA</span>
          </div>
          <span style={{ fontSize: '0.75rem', color: '#f59e0b', display: 'flex', alignItems: 'center', gap: '4px' }}>
            <Award size={12} /> Peak offer
          </span>
        </div>

        <div className="analytics-kpi-card">
          <span className="analytics-kpi-label">Placement Drives</span>
          <div className="analytics-kpi-value-row">
            <span className="analytics-kpi-value">{activePlacementDrives}</span>
            <span className="analytics-kpi-subtext">drives</span>
          </div>
          <span style={{ fontSize: '0.75rem', color: '#818cf8', display: 'flex', alignItems: 'center', gap: '4px' }}>
            <Building2 size={12} /> Active drives in database
          </span>
        </div>
      </div>

      {/* 3 & 4. Branch Analysis & Package Distribution */}
      <div className="analytics-two-col">
        {/* Branch-wise Placement Analysis */}
        <div className="analytics-card">
          <div className="analytics-card-header">
            <h2 className="analytics-card-title">
              <Layers size={18} color="#818cf8" />
              Branch-Wise Placement Performance
            </h2>
            <span className="analytics-card-meta">Live Students &amp; Offers Data</span>
          </div>

          {branchStats.length > 0 ? (
            <div>
              {branchStats.map((b) => (
                <div key={b.branch} className="branch-row">
                  <div className="branch-row-header">
                    <span>
                      <strong style={{ color: '#f8fafc' }}>{b.branch}</strong> ({b.placed}/{b.total} Placed)
                    </span>
                    <span>
                      <strong style={{ color: '#818cf8' }}>{b.rate}%</strong>
                      {b.avgLpa !== '--' && ` · Avg ${b.avgLpa} LPA`}
                    </span>
                  </div>
                  <div className="branch-bar-bg">
                    <div className="branch-bar-fill" style={{ width: `${Math.min(Number(b.rate), 100)}%` }} />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div style={{ padding: '24px', textAlign: 'center', color: '#64748b', fontSize: '0.8125rem' }}>
              Branch aggregation updating from current student records.
            </div>
          )}
        </div>

        {/* Package Distribution */}
        <div className="analytics-card">
          <div className="analytics-card-header">
            <h2 className="analytics-card-title">
              <TrendingUp size={18} color="#10b981" />
              CTC Package Distribution
            </h2>
            <span className="analytics-card-meta">From Live Offers Records</span>
          </div>

          <div className="package-chart-container">
            {packageDistribution.map((bracket) => {
              const widthPct = Math.round((bracket.count / maxPackageCount) * 100);
              return (
                <div key={bracket.label} className="package-bracket-row">
                  <span className="package-bracket-name">{bracket.label}</span>
                  <div className="package-bracket-bar-bg">
                    <div className="package-bracket-bar-fill" style={{ width: `${widthPct}%` }} />
                  </div>
                  <span className="package-bracket-count">{bracket.count}</span>
                </div>
              );
            })}
          </div>

          <p style={{ margin: '8px 0 0 0', fontSize: '0.75rem', color: '#94a3b8', lineHeight: 1.45 }}>
            Distribution of currently recorded package brackets.
          </p>
        </div>
      </div>

      {/* 5 & 6. Readiness Intelligence & In-Demand Skills */}
      <div className="analytics-two-col">
        {/* Readiness Intelligence */}
        <div className="analytics-card">
          <div className="analytics-card-header">
            <h2 className="analytics-card-title">
              <GraduationCap size={18} color="#f59e0b" />
              Cohort Readiness Intelligence
            </h2>
            <span className="analytics-card-meta">Live Cohort Assessment</span>
          </div>

          <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', marginBottom: '8px' }}>
            <span style={{ fontSize: '2.5rem', fontWeight: 800, color: '#f8fafc', fontFamily: 'monospace' }}>
              {avgReadiness}
            </span>
            <span style={{ fontSize: '0.875rem', color: '#64748b' }}>/ 100 Mean Readiness Score</span>
          </div>

          <div className="readiness-bands-grid">
            <div className="readiness-band-pill">
              <span className="readiness-band-pill-label">Highly Ready (80+)</span>
              <span className="readiness-band-pill-value" style={{ color: '#10b981' }}>
                {cohortDist.highlyReady ?? 0}
              </span>
            </div>

            <div className="readiness-band-pill">
              <span className="readiness-band-pill-label">Placement Ready (60-79)</span>
              <span className="readiness-band-pill-value" style={{ color: '#38bdf8' }}>
                {cohortDist.placementReady ?? 0}
              </span>
            </div>

            <div className="readiness-band-pill">
              <span className="readiness-band-pill-label">Developing (40-59)</span>
              <span className="readiness-band-pill-value" style={{ color: '#f59e0b' }}>
                {cohortDist.developing ?? 0}
              </span>
            </div>

            <div className="readiness-band-pill">
              <span className="readiness-band-pill-label">Needs Polish (&lt;40)</span>
              <span className="readiness-band-pill-value" style={{ color: '#ef4444' }}>
                {cohortDist.needsImprovement ?? 0}
              </span>
            </div>
          </div>

          <p style={{ margin: 0, fontSize: '0.75rem', color: '#94a3b8', lineHeight: 1.5 }}>
            <strong>Strategic Context:</strong> Institutional readiness rate stands at <strong>{readinessRate}%</strong>. Readiness distribution helps the placement cell identify students who may need additional preparation support.
          </p>
        </div>

        {/* Top In-Demand Industry Skills */}
        <div className="analytics-card">
          <div className="analytics-card-header">
            <h2 className="analytics-card-title">
              <Briefcase size={18} color="#818cf8" />
              Top In-Demand Industry Skills
            </h2>
            <span className="analytics-card-meta">From Current Placement Drives</span>
          </div>

          <div className="skills-badge-grid">
            {inDemandSkills.length > 0 ? (
              inDemandSkills.map((sk) => (
                <div key={sk.skill} className="skill-demand-chip">
                  <div className="skill-chip-header">
                    <span className="skill-chip-name">{sk.skill}</span>
                    <span className="skill-chip-count">{sk.count}</span>
                  </div>
                  <div style={{ height: '4px', backgroundColor: '#1e293b', borderRadius: '2px', overflow: 'hidden' }}>
                    <div style={{ width: `${sk.percentage}%`, height: '100%', backgroundColor: '#6366f1' }} />
                  </div>
                  <span style={{ fontSize: '10px', color: '#64748b' }}>{sk.percentage}% of drives</span>
                </div>
              ))
            ) : (
              <span style={{ color: '#64748b', fontSize: '0.8125rem' }}>Evaluating drive skills...</span>
            )}
          </div>

          <p style={{ margin: 0, fontSize: '0.75rem', color: '#94a3b8' }}>
            Skill demand is calculated dynamically from required skills listed in the current placement drives.
          </p>
        </div>
      </div>

      {/* 7. Institutional Placement Insights */}
      <div className="analytics-card">
        <div className="analytics-card-header">
          <h2 className="analytics-card-title">
            <Sparkles size={18} color="#818cf8" />
            Institutional Placement Insights
          </h2>
          <span className="analytics-card-meta">Calculated Facts from Verified Database Records</span>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '14px' }}>
          {deterministicInsights.map((insight, idx) => (
            <div
              key={idx}
              style={{
                backgroundColor: 'rgba(30, 41, 59, 0.5)',
                border: '1px solid #334155',
                borderRadius: '8px',
                padding: '14px',
                fontSize: '0.8125rem',
                color: '#cbd5e1',
                lineHeight: 1.5,
                display: 'flex',
                alignItems: 'flex-start',
                gap: '8px'
              }}
            >
              <span style={{ color: '#818cf8', fontWeight: 800 }}>•</span>
              <span>{insight}</span>
            </div>
          ))}
        </div>
      </div>

      {/* 8. Placement Drive Intelligence Table */}
      <div className="analytics-card">
        <div className="analytics-card-header">
          <h2 className="analytics-card-title">
            <Building2 size={18} color="#10b981" />
            Placement Drive Intelligence
          </h2>
          <span className="analytics-card-meta">{drivesData.length} Drives Registered in MySQL</span>
        </div>

        <div className="drives-table-wrapper">
          <table className="drives-compact-table">
            <thead>
              <tr>
                <th>Company</th>
                <th>Role</th>
                <th>Package</th>
                <th>Openings</th>
                <th>Applicants</th>
                <th>Shortlisted</th>
                <th>Required Skills</th>
              </tr>
            </thead>
            <tbody>
              {drivesData.length > 0 ? (
                drivesData.map((d) => {
                  const skills = Array.isArray(d.requiredSkills)
                    ? d.requiredSkills
                    : (Array.isArray(d.skills) ? d.skills : []);
                  const skillsDisplay = skills.length > 0 ? skills.join(', ') : '--';
                  const rawPkg = d.packageLPA ?? d.salaryLpa ?? d.package;

                  return (
                    <tr key={d.id}>
                      <td style={{ fontWeight: 700, color: '#f8fafc' }}>{d.company}</td>
                      <td style={{ color: '#cbd5e1' }}>{d.role}</td>
                      <td style={{ color: '#10b981', fontWeight: 700, fontFamily: 'monospace' }}>
                        {formatPackageDisplay(rawPkg)}
                      </td>
                      <td style={{ fontFamily: 'monospace', color: '#cbd5e1' }}>{d.openings ?? '--'}</td>
                      <td style={{ fontFamily: 'monospace', color: '#94a3b8' }}>{d.applicants ?? '--'}</td>
                      <td style={{ fontFamily: 'monospace', color: '#38bdf8', fontWeight: 700 }}>
                        {d.shortlisted ?? '--'}
                      </td>
                      <td style={{ maxWidth: '300px', color: '#94a3b8', fontSize: '0.75rem', lineHeight: '1.4' }}>
                        {skillsDisplay}
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={7} style={{ padding: '24px', textAlign: 'center', color: '#64748b' }}>
                    No recruitment drives found in MySQL database.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Footer Audit Guarantee */}
      <div
        style={{
          padding: '12px 16px',
          backgroundColor: 'rgba(30, 41, 59, 0.4)',
          borderRadius: '8px',
          border: '1px solid rgba(51, 65, 85, 0.4)',
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          fontSize: '0.75rem',
          color: '#94a3b8'
        }}
      >
        <ShieldCheck size={16} color="#818cf8" style={{ flexShrink: 0 }} />
        <span>
          <strong>Data Grounding Guarantee:</strong> All metrics, distributions, branch ratios, and skill counts are derived deterministically from live MySQL endpoints.
        </span>
      </div>
    </div>
  );
}