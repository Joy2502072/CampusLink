import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  BrainCircuit,
  Search,
  Filter,
  RefreshCw,
  AlertCircle,
  Info,
  BookOpen,
  Users,
  Building2,
  CheckCircle2,
  Lightbulb
} from 'lucide-react';
import { PROTOTYPE_CURRICULUM_MAPPING } from '../../data/curriculumData.js';

const API_BASE_URL = 'http://localhost:5000/api';

const AUTH_HEADERS = {
  'Content-Type': 'application/json',
  'X-Demo-User-Role': 'placement_officer'
};

export default function CurriculumIntelligence() {
  const [students, setStudents] = useState([]);
  const [drives, setDrives] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState('ALL');
  const [filterGapOnly, setFilterGapOnly] = useState(false);

  const fetchData = useCallback(async () => {
    setError(null);
    try {
      const [studentsRes, drivesRes] = await Promise.all([
        fetch(`${API_BASE_URL}/students`, { headers: AUTH_HEADERS }),
        fetch(`${API_BASE_URL}/drives`, { headers: AUTH_HEADERS })
      ]);

      if (!studentsRes.ok) {
        throw new Error(`Failed to load student records (HTTP ${studentsRes.status})`);
      }
      if (!drivesRes.ok) {
        throw new Error(`Failed to load recruitment drives (HTTP ${drivesRes.status})`);
      }

      const studentsJson = await studentsRes.json();
      const drivesJson = await drivesRes.json();

      const studentList = Array.isArray(studentsJson.data)
        ? studentsJson.data
        : (Array.isArray(studentsJson) ? studentsJson : []);
      const driveList = Array.isArray(drivesJson.data)
        ? drivesJson.data
        : (Array.isArray(drivesJson) ? drivesJson : []);

      setStudents(studentList);
      setDrives(driveList);
    } catch (err) {
      setError(err.message || 'Error occurred while loading intelligence metrics.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchData();
  };

  // Inspect drive requirements without inventing data
  const driveSkillDemandInfo = useMemo(() => {
    let populatedDriveCount = 0;
    const skillDemandCount = {};

    drives.forEach((drive) => {
      const skills = Array.isArray(drive.requiredSkills) && drive.requiredSkills.length > 0
        ? drive.requiredSkills
        : (Array.isArray(drive.skills) && drive.skills.length > 0 ? drive.skills : []);

      if (skills.length > 0) {
        populatedDriveCount += 1;
        skills.forEach((skillName) => {
          if (typeof skillName === 'string' && skillName.trim()) {
            const key = skillName.trim().toLowerCase();
            skillDemandCount[key] = (skillDemandCount[key] || 0) + 1;
          }
        });
      }
    });

    return {
      hasDemandData: populatedDriveCount > 0,
      populatedDriveCount,
      totalDrives: drives.length,
      skillDemandCount
    };
  }, [drives]);

  // Aggregate student technical skills counts
  const studentSkillDistribution = useMemo(() => {
    const totalStudents = students.length;
    const countMap = {};

    students.forEach((student) => {
      const skills = Array.isArray(student.technicalSkills)
        ? student.technicalSkills
        : (Array.isArray(student.skills) ? student.skills : []);

      const uniqueStudentSkills = new Set();
      skills.forEach((sk) => {
        if (typeof sk === 'string' && sk.trim()) {
          uniqueStudentSkills.add(sk.trim().toLowerCase());
        }
      });

      uniqueStudentSkills.forEach((key) => {
        countMap[key] = (countMap[key] || 0) + 1;
      });
    });

    return {
      totalStudents,
      countMap
    };
  }, [students]);

  // Build combined skill analysis rows
  const analyzedSkills = useMemo(() => {
    const prototypeSkills = Array.isArray(PROTOTYPE_CURRICULUM_MAPPING.skills)
      ? PROTOTYPE_CURRICULUM_MAPPING.skills
      : [];

    return prototypeSkills.map((item) => {
      const key = item.skill.trim().toLowerCase();

      // Real student coverage calculation
      const studentCount = studentSkillDistribution.countMap[key] || 0;
      const totalStudents = studentSkillDistribution.totalStudents;
      const studentCoveragePercent = totalStudents > 0
        ? Math.round((studentCount / totalStudents) * 100)
        : 0;

      // Real industry demand check (no fake calculation)
      let industryDemandText = 'Data unavailable';
      let demandPercent = null;

      if (driveSkillDemandInfo.hasDemandData && driveSkillDemandInfo.totalDrives > 0) {
        const driveCount = driveSkillDemandInfo.skillDemandCount[key] || 0;
        demandPercent = Math.round((driveCount / driveSkillDemandInfo.totalDrives) * 100);
        industryDemandText = `${driveCount} drives (${demandPercent}%)`;
      }

      return {
        skill: item.skill,
        departments: item.departments || [],
        curriculumCoverage: item.curriculumCoverage ?? 0,
        curriculumStatus: item.curriculumStatus || 'Basic',
        courseModule: item.courseModule || 'Prototype mapping',
        studentCount,
        studentCoveragePercent,
        industryDemandText,
        demandPercent,
        isCurriculumGap: (item.curriculumCoverage ?? 0) <= 30 || item.curriculumStatus === 'Basic' || item.curriculumStatus === 'Uncovered'
      };
    });
  }, [studentSkillDistribution, driveSkillDemandInfo]);

  // Filter skills
  const filteredSkills = useMemo(() => {
    return analyzedSkills.filter((row) => {
      const query = searchQuery.trim().toLowerCase();
      const matchesSearch = !query || row.skill.toLowerCase().includes(query) || row.courseModule.toLowerCase().includes(query);
      const matchesDept = selectedDepartment === 'ALL' || row.departments.includes(selectedDepartment);
      const matchesGap = !filterGapOnly || row.isCurriculumGap;

      return matchesSearch && matchesDept && matchesGap;
    });
  }, [analyzedSkills, searchQuery, selectedDepartment, filterGapOnly]);

  // Compute summary signals
  const kpis = useMemo(() => {
    const totalTracked = analyzedSkills.length;
    const observedInStudents = analyzedSkills.filter((s) => s.studentCount > 0).length;

    const strongCurriculumCount = analyzedSkills.filter((s) => (s.curriculumCoverage || 0) >= 70).length;
    const avgCurriculumCoverage = totalTracked > 0
      ? Math.round(analyzedSkills.reduce((acc, curr) => acc + (curr.curriculumCoverage || 0), 0) / totalTracked)
      : 0;

    return {
      totalTracked,
      observedInStudents,
      strongCurriculumCount,
      avgCurriculumCoverage
    };
  }, [analyzedSkills]);

  // Deterministic Academic Signals based on real student skills vs prototype curriculum
  const academicSignals = useMemo(() => {
    const signals = [];

    const popularSkillsWithWeakCurriculum = analyzedSkills.filter(
      (s) => s.studentCount > 0 && s.curriculumCoverage <= 35
    );

    const strongCurriculumZeroStudents = analyzedSkills.filter(
      (s) => s.curriculumCoverage >= 75 && s.studentCount === 0
    );

    if (popularSkillsWithWeakCurriculum.length > 0) {
      signals.push({
        type: 'Student Self-Skilling Signal',
        level: 'Notice',
        title: 'Students Demonstrating Skills Outside Core Curriculum',
        description: `Students have acquired skills like ${popularSkillsWithWeakCurriculum.slice(0, 3).map((s) => `"${s.skill}"`).join(', ')}, despite low prototype curriculum coverage (≤35%). Incorporating practical lab projects or dedicated electives for these tools would formally validate student expertise.`
      });
    }

    if (strongCurriculumZeroStudents.length > 0) {
      signals.push({
        type: 'Curriculum Utilization Signal',
        level: 'Review',
        title: 'High Curriculum Coverage with Low Profile Representation',
        description: `Skills such as ${strongCurriculumZeroStudents.slice(0, 3).map((s) => `"${s.skill}"`).join(', ')} possess strong theoretical coverage in the prototype syllabus (≥75%), yet are not recorded in any current student profile. Consider encouraging students to list verified course projects in their technical inventory.`
      });
    }

    signals.push({
      type: 'Recruiter Alignment Requirement',
      level: 'Pending',
      title: 'Industry Demand Baseline Pending',
      description: 'Currently, registered recruitment drives do not have populated requiredSkills fields. Once recruiter drive requirements are added to the database, demand weighting and gap alerts will update automatically without modifying curriculum definitions.'
    });

    return signals;
  }, [analyzedSkills]);

  if (loading) {
    return (
      <div style={{ padding: '48px', textAlign: 'center', color: 'var(--text-muted, #64748b)' }}>
        <RefreshCw size={24} style={{ animation: 'spin 1s linear infinite', margin: '0 auto 12px' }} />
        <p style={{ margin: 0, fontSize: '0.875rem' }}>Loading Industry Skills &amp; Curriculum Intelligence...</p>
      </div>
    );
  }

  return (
    <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* 1. Header & Subtitle */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <h1 style={{ margin: 0, fontSize: '1.65rem', fontWeight: 800, color: 'var(--text-primary, #ffffff)', letterSpacing: '-0.02em' }}>
              Industry Skills &amp; Curriculum Intelligence
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
                backgroundColor: 'rgba(99, 102, 241, 0.12)',
                color: '#818cf8',
                border: '1px solid rgba(99, 102, 241, 0.25)'
              }}
            >
              <BrainCircuit size={12} />
              Curriculum Diagnostics
            </span>
          </div>
          <p style={{ margin: '6px 0 0 0', fontSize: '0.875rem', color: 'var(--text-secondary, #94a3b8)' }}>
            Compare current student skills with prototype curriculum coverage and available industry requirements.
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
          {refreshing ? 'Refreshing...' : 'Refresh Feed'}
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

      {/* Notice Banner regarding industry data availability */}
      {!driveSkillDemandInfo.hasDemandData && (
        <div
          style={{
            padding: '12px 16px',
            borderRadius: '8px',
            backgroundColor: 'rgba(245, 158, 11, 0.1)',
            border: '1px solid rgba(245, 158, 11, 0.25)',
            color: '#fbbf24',
            display: 'flex',
            alignItems: 'flex-start',
            gap: '10px',
            fontSize: '0.8125rem',
            lineHeight: 1.5
          }}
        >
          <Info size={16} style={{ marginTop: '2px', flexShrink: 0 }} />
          <div>
            <strong>Notice:</strong> Industry skill-demand data is not available yet. All current placement drives ({drives.length} total) return empty required skill sets. Industry demand analysis will become active when recruiter/job requirement skills are populated. Student and prototype curriculum indicators are computed below using live student records.
          </div>
        </div>
      )}

      {/* 2. KPI Cards */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '16px'
        }}
      >
        <div
          style={{
            padding: '20px',
            backgroundColor: 'var(--bg-card, #0f172a)',
            borderRadius: '12px',
            border: '1px solid var(--border-color, #1e293b)',
            display: 'flex',
            flexDirection: 'column',
            gap: '6px'
          }}
        >
          <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            Skills Tracked
          </span>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
            <span style={{ fontSize: '2rem', fontWeight: 800, color: '#f8fafc', fontFamily: 'monospace' }}>
              {kpis.totalTracked}
            </span>
            <span style={{ fontSize: '0.75rem', color: '#64748b' }}>competencies</span>
          </div>
          <span style={{ fontSize: '0.75rem', color: '#818cf8', display: 'flex', alignItems: 'center', gap: '4px' }}>
            <BookOpen size={12} /> Prototype curriculum mapping
          </span>
        </div>

        <div
          style={{
            padding: '20px',
            backgroundColor: 'var(--bg-card, #0f172a)',
            borderRadius: '12px',
            border: '1px solid var(--border-color, #1e293b)',
            display: 'flex',
            flexDirection: 'column',
            gap: '6px'
          }}
        >
          <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            Student Skills Observed
          </span>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
            <span style={{ fontSize: '2rem', fontWeight: 800, color: '#10b981', fontFamily: 'monospace' }}>
              {kpis.observedInStudents}
            </span>
            <span style={{ fontSize: '0.75rem', color: '#64748b' }}>of {kpis.totalTracked} skills</span>
          </div>
          <span style={{ fontSize: '0.75rem', color: '#10b981', display: 'flex', alignItems: 'center', gap: '4px' }}>
            <Users size={12} /> Across {students.length} active students
          </span>
        </div>

        <div
          style={{
            padding: '20px',
            backgroundColor: 'var(--bg-card, #0f172a)',
            borderRadius: '12px',
            border: '1px solid var(--border-color, #1e293b)',
            display: 'flex',
            flexDirection: 'column',
            gap: '6px'
          }}
        >
          <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            Curriculum Coverage
          </span>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
            <span style={{ fontSize: '2rem', fontWeight: 800, color: '#60a5fa', fontFamily: 'monospace' }}>
              {kpis.avgCurriculumCoverage}%
            </span>
            <span style={{ fontSize: '0.75rem', color: '#64748b' }}>avg reference score</span>
          </div>
          <span style={{ fontSize: '0.75rem', color: '#94a3b8', display: 'flex', alignItems: 'center', gap: '4px' }}>
            <CheckCircle2 size={12} /> {kpis.strongCurriculumCount} strong syllabus modules
          </span>
        </div>

        <div
          style={{
            padding: '20px',
            backgroundColor: 'var(--bg-card, #0f172a)',
            borderRadius: '12px',
            border: '1px solid var(--border-color, #1e293b)',
            display: 'flex',
            flexDirection: 'column',
            gap: '6px'
          }}
        >
          <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            Industry Demand Status
          </span>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
            <span style={{ fontSize: '1.25rem', fontWeight: 700, color: driveSkillDemandInfo.hasDemandData ? '#10b981' : '#f59e0b', marginTop: '6px' }}>
              {driveSkillDemandInfo.hasDemandData ? 'Active' : 'Data Unavailable'}
            </span>
          </div>
          <span style={{ fontSize: '0.75rem', color: '#94a3b8', display: 'flex', alignItems: 'center', gap: '4px', marginTop: '2px' }}>
            <Building2 size={12} /> {drives.length} drives registered
          </span>
        </div>
      </div>

      {/* 3. Academic Signals Section */}
      <div
        style={{
          backgroundColor: 'var(--bg-card, #0f172a)',
          border: '1px solid var(--border-color, #1e293b)',
          borderRadius: '12px',
          padding: '20px 24px',
          display: 'flex',
          flexDirection: 'column',
          gap: '14px'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Lightbulb size={18} color="#818cf8" />
          <h2 style={{ margin: 0, fontSize: '1rem', fontWeight: 700, color: '#f1f5f9' }}>
            Academic Signals
          </h2>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '14px' }}>
          {academicSignals.map((signal, idx) => (
            <div
              key={idx}
              style={{
                backgroundColor: 'rgba(30, 41, 59, 0.5)',
                border: '1px solid rgba(51, 65, 85, 0.4)',
                borderRadius: '8px',
                padding: '14px',
                display: 'flex',
                flexDirection: 'column',
                gap: '6px'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.6875rem', fontWeight: 700, textTransform: 'uppercase', color: '#818cf8', letterSpacing: '0.04em' }}>
                  {signal.type}
                </span>
                <span
                  style={{
                    fontSize: '10px',
                    fontWeight: 600,
                    padding: '2px 8px',
                    borderRadius: '999px',
                    backgroundColor: signal.level === 'Pending' ? 'rgba(245, 158, 11, 0.15)' : 'rgba(99, 102, 241, 0.15)',
                    color: signal.level === 'Pending' ? '#fbbf24' : '#a5b4fc',
                    border: `1px solid ${signal.level === 'Pending' ? 'rgba(245, 158, 11, 0.3)' : 'rgba(99, 102, 241, 0.3)'}`
                  }}
                >
                  {signal.level}
                </span>
              </div>
              <h3 style={{ margin: 0, fontSize: '0.875rem', fontWeight: 600, color: '#f8fafc' }}>
                {signal.title}
              </h3>
              <p style={{ margin: 0, fontSize: '0.75rem', color: '#cbd5e1', lineHeight: 1.45 }}>
                {signal.description}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* 4. Filter Toolbar */}
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
              placeholder="Search skill or module..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                background: 'transparent',
                border: 'none',
                outline: 'none',
                color: '#f1f5f9',
                fontSize: '0.8125rem',
                width: '180px'
              }}
            />
          </div>

          {/* Department Filter */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Filter size={13} color="#64748b" />
            <select
              value={selectedDepartment}
              onChange={(e) => setSelectedDepartment(e.target.value)}
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
              <option value="ALL">All Departments</option>
              <option value="CSE">CSE</option>
              <option value="IT">IT</option>
              <option value="ECE">ECE</option>
              <option value="EE">EE</option>
            </select>
          </div>
        </div>

        {/* Curriculum Gaps Only Toggle */}
        <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '0.8125rem', color: '#cbd5e1' }}>
          <input
            type="checkbox"
            checked={filterGapOnly}
            onChange={(e) => setFilterGapOnly(e.target.checked)}
            style={{ cursor: 'pointer' }}
          />
          <span>Show Curriculum Gaps Only (≤30%)</span>
        </label>
      </div>

      {/* 5. Skill Analysis Table */}
      <div
        style={{
          backgroundColor: 'var(--bg-card, #0f172a)',
          border: '1px solid var(--border-color, #1e293b)',
          borderRadius: '12px',
          overflow: 'hidden'
        }}
      >
        <div style={{ padding: '16px 20px', borderBottom: '1px solid #1e293b', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h2 style={{ margin: 0, fontSize: '1rem', fontWeight: 700, color: '#f1f5f9' }}>
              Skill Analysis Matrix
            </h2>
            <p style={{ margin: '3px 0 0 0', fontSize: '0.75rem', color: '#94a3b8' }}>
              Showing {filteredSkills.length} competencies across student records and prototype curriculum
            </p>
          </div>
          <span style={{ fontSize: '0.6875rem', color: '#64748b' }}>
            Prototype curriculum mapping
          </span>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.8125rem' }}>
            <thead>
              <tr style={{ backgroundColor: 'rgba(30, 41, 59, 0.4)', color: '#94a3b8', borderBottom: '1px solid #1e293b' }}>
                <th style={{ padding: '12px 18px', fontWeight: 600 }}>Skill</th>
                <th style={{ padding: '12px 18px', fontWeight: 600 }}>Student Coverage</th>
                <th style={{ padding: '12px 18px', fontWeight: 600 }}>Curriculum Coverage</th>
                <th style={{ padding: '12px 18px', fontWeight: 600 }}>Curriculum Status</th>
                <th style={{ padding: '12px 18px', fontWeight: 600 }}>Departments</th>
                <th style={{ padding: '12px 18px', fontWeight: 600 }}>Industry Demand</th>
              </tr>
            </thead>
            <tbody>
              {filteredSkills.length > 0 ? (
                filteredSkills.map((row) => {
                  let statusBadgeStyle = { bg: 'rgba(59, 130, 246, 0.12)', color: '#60a5fa', border: 'rgba(59, 130, 246, 0.25)' };
                  if (row.curriculumStatus === 'Strong') {
                    statusBadgeStyle = { bg: 'rgba(16, 185, 129, 0.12)', color: '#34d399', border: 'rgba(16, 185, 129, 0.25)' };
                  } else if (row.curriculumStatus === 'Moderate') {
                    statusBadgeStyle = { bg: 'rgba(245, 158, 11, 0.12)', color: '#fbbf24', border: 'rgba(245, 158, 11, 0.25)' };
                  } else if (row.curriculumStatus === 'Uncovered' || row.curriculumStatus === 'Basic') {
                    statusBadgeStyle = { bg: 'rgba(239, 68, 68, 0.12)', color: '#f87171', border: 'rgba(239, 68, 68, 0.25)' };
                  }

                  return (
                    <tr
                      key={row.skill}
                      style={{
                        borderBottom: '1px solid rgba(30, 41, 59, 0.8)',
                        transition: 'background-color 0.15s ease'
                      }}
                    >
                      {/* Skill */}
                      <td style={{ padding: '14px 18px', fontWeight: 700, color: '#f8fafc' }}>
                        <div>{row.skill}</div>
                        <div style={{ fontSize: '0.6875rem', fontWeight: 400, color: '#64748b', marginTop: '2px' }}>
                          {row.courseModule}
                        </div>
                      </td>

                      {/* Student Coverage */}
                      <td style={{ padding: '14px 18px' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '3px', minWidth: '110px' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: '#cbd5e1' }}>
                            <span>{row.studentCount} of {studentSkillDistribution.totalStudents}</span>
                            <span style={{ fontWeight: 700, color: row.studentCoveragePercent > 0 ? '#10b981' : '#64748b' }}>
                              {row.studentCoveragePercent}%
                            </span>
                          </div>
                          <div style={{ height: '6px', backgroundColor: '#1e293b', borderRadius: '999px', overflow: 'hidden' }}>
                            <div
                              style={{
                                width: `${row.studentCoveragePercent}%`,
                                height: '100%',
                                backgroundColor: row.studentCoveragePercent > 0 ? '#10b981' : 'transparent'
                              }}
                            />
                          </div>
                        </div>
                      </td>

                      {/* Curriculum Coverage (Prototype) */}
                      <td style={{ padding: '14px 18px' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '3px', minWidth: '110px' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: '#cbd5e1' }}>
                            <span>Prototype</span>
                            <span style={{ fontWeight: 700 }}>{row.curriculumCoverage}%</span>
                          </div>
                          <div style={{ height: '6px', backgroundColor: '#1e293b', borderRadius: '999px', overflow: 'hidden' }}>
                            <div
                              style={{
                                width: `${row.curriculumCoverage}%`,
                                height: '100%',
                                backgroundColor: row.curriculumCoverage >= 75 ? '#10b981' : row.curriculumCoverage >= 45 ? '#f59e0b' : '#ef4444'
                              }}
                            />
                          </div>
                        </div>
                      </td>

                      {/* Curriculum Status */}
                      <td style={{ padding: '14px 18px' }}>
                        <span
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            padding: '2px 8px',
                            borderRadius: '999px',
                            fontSize: '11px',
                            fontWeight: 600,
                            backgroundColor: statusBadgeStyle.bg,
                            color: statusBadgeStyle.color,
                            border: `1px solid ${statusBadgeStyle.border}`
                          }}
                        >
                          {row.curriculumStatus}
                        </span>
                      </td>

                      {/* Departments */}
                      <td style={{ padding: '14px 18px', color: '#cbd5e1' }}>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                          {row.departments.map((dept) => (
                            <span
                              key={dept}
                              style={{
                                fontSize: '10px',
                                padding: '1px 5px',
                                backgroundColor: '#1e293b',
                                border: '1px solid #334155',
                                borderRadius: '4px',
                                color: '#94a3b8'
                              }}
                            >
                              {dept}
                            </span>
                          ))}
                        </div>
                      </td>

                      {/* Industry Demand */}
                      <td style={{ padding: '14px 18px' }}>
                        <span
                          style={{
                            fontSize: '0.75rem',
                            fontWeight: 500,
                            color: row.demandPercent !== null ? '#f1f5f9' : '#64748b',
                            fontStyle: row.demandPercent === null ? 'italic' : 'normal'
                          }}
                        >
                          {row.industryDemandText}
                        </span>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={6} style={{ padding: '36px', textAlign: 'center', color: '#64748b' }}>
                    No competencies match the selected search or department filter.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* 6. Clarification Footer Note */}
      <div
        style={{
          padding: '12px 16px',
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
        <Info size={15} color="#818cf8" style={{ marginTop: '2px', flexShrink: 0 }} />
        <div>
          Curriculum coverage values reflect prototype curriculum mapping designed for analytical modeling and do not constitute official university syllabus records. Student coverage reflects verified technicalSkills records in the live MySQL database.
        </div>
      </div>
    </div>
  );
}