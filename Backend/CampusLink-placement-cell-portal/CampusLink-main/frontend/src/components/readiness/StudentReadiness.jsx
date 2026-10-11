import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  TrendingUp,
  Award,
  BookOpen,
  MessageSquare,
  Briefcase,
  AlertTriangle,
  RefreshCw,
  Database,
  ChevronRight,
  Sliders,
  Sparkles,
  ShieldCheck,
  RotateCcw,
  Target,
  Play
} from 'lucide-react';

const API_BASE_URL = 'http://localhost:5000/api';
const DEFAULT_STUDENT_ID = 'DEMO-STU-001';

const AUTH_HEADERS = {
  'Content-Type': 'application/json',
  'X-Demo-User-Role': 'placement_officer'
};

export default function StudentReadiness({ studentId = DEFAULT_STUDENT_ID }) {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [simulating, setSimulating] = useState(false);
  const [error, setError] = useState(null);

  // Authoritative baseline retrieved from MySQL
  const [readinessData, setReadinessData] = useState(null);

  // What-If slider states (0 - 100 percentage of dimension capacity)
  const [sliderValues, setSliderValues] = useState({
    academics: 0,
    technical: 0,
    communication: 0,
    practical: 0
  });

  // What-If simulation results
  const [simulationResult, setSimulationResult] = useState(null);

  // Debounce timer ref to prevent network spam during rapid slider drags
  const debounceTimerRef = useRef(null);

  // 1. Fetch Authoritative Readiness Baseline from MySQL
  const fetchReadiness = useCallback(async () => {
    setError(null);
    try {
      const response = await fetch(`${API_BASE_URL}/readiness/${studentId}`, {
        headers: AUTH_HEADERS
      });

      if (!response.ok) {
        throw new Error(`Failed to load readiness evaluation (HTTP ${response.status})`);
      }

      const resJson = await response.json();
      const data = resJson.data || resJson;
      setReadinessData(data);

      // Initialize sliders directly from authoritative baseline metrics
      const dims = data.dimensions || {};
      const initialSliders = {
        academics: Math.round(((dims.academics || 0) / 25) * 100),
        technical: Math.round(((dims.technical || dims.technicalSkills || 0) / 30) * 100),
        communication: Math.round(((dims.communication || 0) / 25) * 100),
        practical: Math.round(((dims.practical || dims.practicalExperience || 0) / 20) * 100)
      };
      setSliderValues(initialSliders);

      // Fetch initial simulation comparison
      const simRes = await fetch(`${API_BASE_URL}/readiness/what-if`, {
        method: 'POST',
        headers: AUTH_HEADERS,
        body: JSON.stringify({
          studentId,
          simulatedDimensions: initialSliders
        })
      });
      if (simRes.ok) {
        const simJson = await simRes.json();
        setSimulationResult(simJson.data || simJson);
      }
    } catch (err) {
      setError(err.message || 'Error occurred while loading student readiness.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [studentId]);

  useEffect(() => {
    fetchReadiness();
    return () => {
      if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
    };
  }, [fetchReadiness]);

  // 2. Perform What-If simulation
  const executeSimulation = useCallback(
    async (valuesToSimulate) => {
      setSimulating(true);
      try {
        const response = await fetch(`${API_BASE_URL}/readiness/what-if`, {
          method: 'POST',
          headers: AUTH_HEADERS,
          body: JSON.stringify({
            studentId,
            simulatedDimensions: valuesToSimulate
          })
        });

        if (response.ok) {
          const json = await response.json();
          setSimulationResult(json.data || json);
        }
      } catch {
        // Non-fatal error; baseline remains displayed
      } finally {
        setSimulating(false);
      }
    },
    [studentId]
  );

  // Debounced slider handler (500ms delay)
  const handleSliderChange = (dimension, value) => {
    const updated = {
      ...sliderValues,
      [dimension]: Number(value)
    };
    setSliderValues(updated);

    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    debounceTimerRef.current = setTimeout(() => {
      executeSimulation(updated);
    }, 500);
  };

  const handleManualSimulate = () => {
    if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
    executeSimulation(sliderValues);
  };

  // Reset sliders back to authoritative MySQL baseline
  const handleResetSliders = () => {
    if (!readinessData) return;
    if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);

    const dims = readinessData.dimensions || {};
    const baselineSliders = {
      academics: Math.round(((dims.academics || 0) / 25) * 100),
      technical: Math.round(((dims.technical || dims.technicalSkills || 0) / 30) * 100),
      communication: Math.round(((dims.communication || 0) / 25) * 100),
      practical: Math.round(((dims.practical || dims.practicalExperience || 0) / 20) * 100)
    };
    setSliderValues(baselineSliders);
    executeSimulation(baselineSliders);
  };

  const handleRefresh = () => {
    setRefreshing(true);
    fetchReadiness();
  };

  const totalScore = readinessData?.totalScore ?? readinessData?.readinessScore ?? 0;
  const readinessBand = readinessData?.readinessBand ?? 'Developing';
  const dimensions = readinessData?.dimensions || {};
  const rawMetrics = readinessData?.rawMetrics || {};
  const riskProfile = readinessData?.riskProfile || {};

  const getBandBadge = (band) => {
    switch (band) {
      case 'Highly Ready':
        return { color: '#10b981', bg: 'rgba(16, 185, 129, 0.12)', border: 'rgba(16, 185, 129, 0.3)' };
      case 'Placement Ready':
        return { color: '#3b82f6', bg: 'rgba(59, 130, 246, 0.12)', border: 'rgba(59, 130, 246, 0.3)' };
      case 'Developing':
        return { color: '#f59e0b', bg: 'rgba(245, 158, 11, 0.12)', border: 'rgba(245, 158, 11, 0.3)' };
      default:
        return { color: '#ef4444', bg: 'rgba(239, 68, 68, 0.12)', border: 'rgba(239, 68, 68, 0.3)' };
    }
  };

  const bandStyle = getBandBadge(readinessBand);
  const simBandStyle = getBandBadge(simulationResult?.simulatedBand || readinessBand);

  if (loading) {
    return (
      <div style={{ padding: '48px', textAlign: 'center', color: 'var(--text-muted, #64748b)' }}>
        <RefreshCw size={24} style={{ animation: 'spin 1s linear infinite', margin: '0 auto 12px' }} />
        <p style={{ margin: 0, fontSize: '0.875rem' }}>Evaluating placement readiness from MySQL...</p>
      </div>
    );
  }

  return (
    <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Page Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <h1 style={{ margin: 0, fontSize: '1.65rem', fontWeight: 800, color: 'var(--text-primary, #ffffff)', letterSpacing: '-0.02em' }}>
              Student Placement Readiness
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
                backgroundColor: 'rgba(16, 185, 129, 0.12)',
                color: '#10b981',
                border: '1px solid rgba(16, 185, 129, 0.25)'
              }}
            >
              <Database size={12} />
              Authoritative MySQL Baseline
            </span>
          </div>
          <p style={{ margin: '6px 0 0 0', fontSize: '0.875rem', color: 'var(--text-secondary, #94a3b8)' }}>
            Deterministic 4-dimension readiness diagnostics with real-time What-If skill trajectory modeling
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
          {refreshing ? 'Evaluating...' : 'Refresh Score'}
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

      {/* 1. Authoritative Baseline Hero Card */}
      <div
        style={{
          backgroundColor: 'var(--bg-card, #0f172a)',
          border: '1px solid var(--border-color, #1e293b)',
          borderRadius: '14px',
          padding: '24px',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: '24px',
          alignItems: 'center'
        }}
      >
        <div>
          <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary, #94a3b8)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Overall Placement Readiness
          </span>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '10px', marginTop: '6px' }}>
            <span style={{ fontSize: '3rem', fontWeight: 800, color: '#f8fafc', fontFamily: 'monospace' }}>
              {totalScore}
            </span>
            <span style={{ fontSize: '1rem', color: '#64748b' }}>/ 100</span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '12px' }}>
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                padding: '4px 12px',
                borderRadius: '999px',
                fontSize: '12px',
                fontWeight: 700,
                backgroundColor: bandStyle.bg,
                color: bandStyle.color,
                border: `1px solid ${bandStyle.border}`
              }}
            >
              {readinessBand}
            </span>
            <span style={{ fontSize: '0.8125rem', color: '#94a3b8' }}>
              Student: <strong style={{ color: '#cbd5e1' }}>{readinessData?.studentName || studentId}</strong>
            </span>
          </div>
        </div>

        {/* 4 Dimension Progress Trackers */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8125rem', marginBottom: '4px', color: '#cbd5e1' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <BookOpen size={14} color="#6366f1" /> Academics (CGPA: {Number(rawMetrics.cgpa || 0).toFixed(2)})
              </span>
              <span><strong>{dimensions.academics || 0}</strong> / 25 pts</span>
            </div>
            <div style={{ height: '7px', backgroundColor: '#1e293b', borderRadius: '999px', overflow: 'hidden' }}>
              <div style={{ width: `${((dimensions.academics || 0) / 25) * 100}%`, height: '100%', backgroundColor: '#6366f1' }} />
            </div>
          </div>

          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8125rem', marginBottom: '4px', color: '#cbd5e1' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Award size={14} color="#10b981" /> Technical Stack ({rawMetrics.skillsCount || 0} verified)
              </span>
              <span><strong>{dimensions.technical || dimensions.technicalSkills || 0}</strong> / 30 pts</span>
            </div>
            <div style={{ height: '7px', backgroundColor: '#1e293b', borderRadius: '999px', overflow: 'hidden' }}>
              <div style={{ width: `${((dimensions.technical || dimensions.technicalSkills || 0) / 30) * 100}%`, height: '100%', backgroundColor: '#10b981' }} />
            </div>
          </div>

          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8125rem', marginBottom: '4px', color: '#cbd5e1' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <MessageSquare size={14} color="#f59e0b" /> Communication Benchmark ({rawMetrics.communicationScore || 0}/100)
              </span>
              <span><strong>{dimensions.communication || 0}</strong> / 25 pts</span>
            </div>
            <div style={{ height: '7px', backgroundColor: '#1e293b', borderRadius: '999px', overflow: 'hidden' }}>
              <div style={{ width: `${((dimensions.communication || 0) / 25) * 100}%`, height: '100%', backgroundColor: '#f59e0b' }} />
            </div>
          </div>

          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8125rem', marginBottom: '4px', color: '#cbd5e1' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Briefcase size={14} color="#3b82f6" /> Practical &amp; Projects ({rawMetrics.projectsCount || 0} projects)
              </span>
              <span><strong>{dimensions.practical || dimensions.practicalExperience || 0}</strong> / 20 pts</span>
            </div>
            <div style={{ height: '7px', backgroundColor: '#1e293b', borderRadius: '999px', overflow: 'hidden' }}>
              <div style={{ width: `${((dimensions.practical || dimensions.practicalExperience || 0) / 20) * 100}%`, height: '100%', backgroundColor: '#3b82f6' }} />
            </div>
          </div>
        </div>
      </div>

      {/* 2. WHAT-IF SKILL SIMULATOR CARD */}
      <div
        style={{
          background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.08) 0%, rgba(15, 23, 42, 0.95) 100%)',
          border: '1px solid rgba(99, 102, 241, 0.35)',
          borderRadius: '14px',
          padding: '24px',
          display: 'flex',
          flexDirection: 'column',
          gap: '20px'
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Sliders size={20} color="#818cf8" />
            <div>
              <h2 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 700, color: '#ffffff' }}>
                What-If Skill Simulator
              </h2>
              <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
                Model projected readiness by adjusting target competencies in memory (zero database mutation)
              </span>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
            <button
              onClick={handleManualSimulate}
              disabled={simulating}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '6px 14px',
                backgroundColor: 'var(--accent-blue, #6366f1)',
                border: 'none',
                borderRadius: '6px',
                color: '#ffffff',
                fontSize: '0.75rem',
                fontWeight: 700,
                cursor: simulating ? 'not-allowed' : 'pointer'
              }}
            >
              <Play size={12} fill="#ffffff" /> {simulating ? 'Calculating...' : 'Recalculate'}
            </button>

            <button
              onClick={handleResetSliders}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '6px 12px',
                backgroundColor: 'rgba(30, 41, 59, 0.8)',
                border: '1px solid #334155',
                borderRadius: '6px',
                color: '#cbd5e1',
                fontSize: '0.75rem',
                fontWeight: 600,
                cursor: 'pointer'
              }}
            >
              <RotateCcw size={13} /> Reset Baseline
            </button>
          </div>
        </div>

        {/* Sliders Grid */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
            gap: '20px'
          }}
        >
          {/* Academics Slider */}
          <div style={{ backgroundColor: 'rgba(30, 41, 59, 0.5)', padding: '16px', borderRadius: '10px', border: '1px solid #334155' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: '#f1f5f9' }}>
                Academic Performance
              </span>
              <span style={{ fontSize: '0.8125rem', fontWeight: 700, color: '#818cf8', fontFamily: 'monospace' }}>
                {sliderValues.academics}%
              </span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              value={sliderValues.academics}
              onChange={(e) => handleSliderChange('academics', e.target.value)}
              style={{ width: '100%', cursor: 'pointer', accentColor: '#6366f1' }}
            />
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.6875rem', color: '#64748b', marginTop: '4px' }}>
              <span>Baseline: {Math.round(((dimensions.academics || 0) / 25) * 100)}%</span>
              <span>Weight: 25 pts</span>
            </div>
          </div>

          {/* Technical Skills Slider */}
          <div style={{ backgroundColor: 'rgba(30, 41, 59, 0.5)', padding: '16px', borderRadius: '10px', border: '1px solid #334155' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: '#f1f5f9' }}>
                Technical Skill Mastery
              </span>
              <span style={{ fontSize: '0.8125rem', fontWeight: 700, color: '#10b981', fontFamily: 'monospace' }}>
                {sliderValues.technical}%
              </span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              value={sliderValues.technical}
              onChange={(e) => handleSliderChange('technical', e.target.value)}
              style={{ width: '100%', cursor: 'pointer', accentColor: '#10b981' }}
            />
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.6875rem', color: '#64748b', marginTop: '4px' }}>
              <span>Baseline: {Math.round(((dimensions.technical || 0) / 30) * 100)}%</span>
              <span>Weight: 30 pts</span>
            </div>
          </div>

          {/* Communication Slider */}
          <div style={{ backgroundColor: 'rgba(30, 41, 59, 0.5)', padding: '16px', borderRadius: '10px', border: '1px solid #334155' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: '#f1f5f9' }}>
                Communication Practice
              </span>
              <span style={{ fontSize: '0.8125rem', fontWeight: 700, color: '#f59e0b', fontFamily: 'monospace' }}>
                {sliderValues.communication}%
              </span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              value={sliderValues.communication}
              onChange={(e) => handleSliderChange('communication', e.target.value)}
              style={{ width: '100%', cursor: 'pointer', accentColor: '#f59e0b' }}
            />
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.6875rem', color: '#64748b', marginTop: '4px' }}>
              <span>Baseline: {Math.round(((dimensions.communication || 0) / 25) * 100)}%</span>
              <span>Weight: 25 pts</span>
            </div>
          </div>

          {/* Practical Projects Slider */}
          <div style={{ backgroundColor: 'rgba(30, 41, 59, 0.5)', padding: '16px', borderRadius: '10px', border: '1px solid #334155' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: '#f1f5f9' }}>
                Projects &amp; Practical Work
              </span>
              <span style={{ fontSize: '0.8125rem', fontWeight: 700, color: '#3b82f6', fontFamily: 'monospace' }}>
                {sliderValues.practical}%
              </span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              value={sliderValues.practical}
              onChange={(e) => handleSliderChange('practical', e.target.value)}
              style={{ width: '100%', cursor: 'pointer', accentColor: '#3b82f6' }}
            />
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.6875rem', color: '#64748b', marginTop: '4px' }}>
              <span>Baseline: {Math.round(((dimensions.practical || 0) / 20) * 100)}%</span>
              <span>Weight: 20 pts</span>
            </div>
          </div>
        </div>

        {/* Live Simulation Outcomes Bar */}
        {simulationResult && (
          <div
            style={{
              backgroundColor: 'rgba(15, 23, 42, 0.75)',
              border: '1px solid rgba(99, 102, 241, 0.3)',
              borderRadius: '10px',
              padding: '16px 20px',
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: '16px',
              alignItems: 'center'
            }}
          >
            <div>
              <span style={{ fontSize: '0.6875rem', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 600 }}>
                Simulated Score
              </span>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', marginTop: '2px' }}>
                <span style={{ fontSize: '2rem', fontWeight: 800, color: '#ffffff', fontFamily: 'monospace' }}>
                  {simulationResult.simulatedScore}
                </span>
                <span style={{ fontSize: '0.8125rem', color: '#64748b' }}>/ 100</span>
              </div>
            </div>

            <div>
              <span style={{ fontSize: '0.6875rem', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 600 }}>
                Score Delta
              </span>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '4px' }}>
                <span
                  style={{
                    fontSize: '1.25rem',
                    fontWeight: 700,
                    color: simulationResult.improvement >= 0 ? '#10b981' : '#f87171',
                    fontFamily: 'monospace'
                  }}
                >
                  {simulationResult.improvement >= 0 ? `+${simulationResult.improvement}` : simulationResult.improvement} pts
                </span>
                <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
                  vs current baseline
                </span>
              </div>
            </div>

            <div>
              <span style={{ fontSize: '0.6875rem', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 600 }}>
                Simulated Band
              </span>
              <div style={{ marginTop: '4px' }}>
                <span
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    padding: '3px 10px',
                    borderRadius: '999px',
                    fontSize: '11px',
                    fontWeight: 700,
                    backgroundColor: simBandStyle.bg,
                    color: simBandStyle.color,
                    border: `1px solid ${simBandStyle.border}`
                  }}
                >
                  {simulationResult.simulatedBand}
                </span>
              </div>
            </div>

            <div>
              <span style={{ fontSize: '0.6875rem', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 600 }}>
                Highest Contributor
              </span>
              <div style={{ fontSize: '0.8125rem', fontWeight: 600, color: '#cbd5e1', marginTop: '4px' }}>
                {simulationResult.highestContributor ? (
                  <span style={{ color: '#818cf8', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <Sparkles size={13} /> {simulationResult.highestContributor}
                  </span>
                ) : (
                  'No Delta Observed'
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 3. Detailed Diagnostics & Action Plan */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(420px, 1fr))',
          gap: '20px'
        }}
      >
        {/* Observations & Drivers */}
        <div
          style={{
            backgroundColor: 'var(--bg-card, #0f172a)',
            border: '1px solid var(--border-color, #1e293b)',
            borderRadius: '12px',
            padding: '24px',
            display: 'flex',
            flexDirection: 'column',
            gap: '14px'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <TrendingUp size={18} color="#818cf8" />
            <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 700, color: '#f1f5f9' }}>
              Readiness Observations
            </h3>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {riskProfile.reasons && riskProfile.reasons.length > 0 ? (
              riskProfile.reasons.map((r, i) => (
                <div
                  key={i}
                  style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '10px',
                    padding: '10px 12px',
                    backgroundColor: 'rgba(30, 41, 59, 0.4)',
                    borderRadius: '8px',
                    border: '1px solid #334155'
                  }}
                >
                  <span style={{ color: '#818cf8', fontWeight: 700 }}>•</span>
                  <span style={{ fontSize: '0.8125rem', color: '#cbd5e1', lineHeight: '1.4' }}>{r}</span>
                </div>
              ))
            ) : (
              <p style={{ fontSize: '0.8125rem', color: '#94a3b8', margin: 0 }}>
                {riskProfile.mainReason || 'Candidate meets institutional baseline readiness parameters.'}
              </p>
            )}
          </div>
        </div>

        {/* Personalized Action Plan */}
        <div
          style={{
            backgroundColor: 'var(--bg-card, #0f172a)',
            border: '1px solid var(--border-color, #1e293b)',
            borderRadius: '12px',
            padding: '24px',
            display: 'flex',
            flexDirection: 'column',
            gap: '14px'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Target size={18} color="#10b981" />
            <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 700, color: '#f1f5f9' }}>
              Personalized Action Plan
            </h3>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {riskProfile.actions && riskProfile.actions.length > 0 ? (
              riskProfile.actions.map((a, i) => (
                <div
                  key={i}
                  style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '10px',
                    padding: '10px 12px',
                    backgroundColor: 'rgba(16, 185, 129, 0.08)',
                    borderRadius: '8px',
                    border: '1px solid rgba(16, 185, 129, 0.25)'
                  }}
                >
                  <ChevronRight size={14} color="#10b981" style={{ marginTop: '2px', flexShrink: 0 }} />
                  <span style={{ fontSize: '0.8125rem', color: '#cbd5e1', lineHeight: '1.4' }}>{a}</span>
                </div>
              ))
            ) : (
              <p style={{ fontSize: '0.8125rem', color: '#94a3b8', margin: 0 }}>
                {riskProfile.recommendedAction || 'Maintain standard candidate preparation tracks for upcoming recruitment drives.'}
              </p>
            )}

            {simulationResult?.recommendations && simulationResult.recommendations.length > 0 && (
              <div
                style={{
                  marginTop: '6px',
                  padding: '10px 12px',
                  backgroundColor: 'rgba(99, 102, 241, 0.1)',
                  borderRadius: '8px',
                  border: '1px solid rgba(99, 102, 241, 0.25)',
                  fontSize: '0.75rem',
                  color: '#a5b4fc',
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '8px'
                }}
              >
                <Sparkles size={14} style={{ marginTop: '2px', flexShrink: 0 }} />
                <span><strong>Simulator Insight:</strong> {simulationResult.recommendations.join(' ')}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 4. Explainability & Non-Destructive Modeling Note */}
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
          <strong style={{ color: '#cbd5e1' }}>Explainability &amp; Non-Destructive Simulation:</strong> Readiness scoring is deterministic across Academics (25%), Technical Skills (30%), Communication (25%), and Practical Experience (20%). The What-If Simulator executes in-memory calculations without modifying student records in MySQL. Simulations and recommendations serve strictly as counseling diagnostics and do not predict or guarantee placement hiring outcomes.
        </div>
      </div>
    </div>
  );
}