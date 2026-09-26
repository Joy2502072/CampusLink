import React, { useState, useEffect, useCallback } from 'react';
import {
  Sparkles,
  AlertCircle,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  GraduationCap,
  Award,
  Briefcase,
  MessageSquare,
  Code2,
  FolderCheck,
  Lightbulb,
  ShieldAlert
} from 'lucide-react';

const API_BASE_URL = 'http://localhost:5000/api';

const CANDIDATE_OPTIONS = [
  {
    id: 'DEMO-STU-001',
    name: 'Demo Student A',
    branch: 'CSE'
  }
];

const factorConfig = [
  {
    key: 'technicalSkill',
    label: 'Technical Skill Readiness',
    max: 30,
    icon: Code2
  },
  {
    key: 'academic',
    label: 'Academic (CGPA) Readiness',
    max: 15,
    icon: GraduationCap
  },
  {
    key: 'mockInterview',
    label: 'Mock Interview Readiness',
    max: 20,
    icon: Award
  },
  {
    key: 'communication',
    label: 'Communication Readiness',
    max: 15,
    icon: MessageSquare
  },
  {
    key: 'projectCertification',
    label: 'Project & Certification',
    max: 10,
    icon: FolderCheck
  },
  {
    key: 'applicationEngagement',
    label: 'Application Engagement',
    max: 10,
    icon: Briefcase
  }
];

export default function StudentReadiness({
  defaultStudentId = 'DEMO-STU-001'
}) {
  const [selectedStudentId, setSelectedStudentId] =
    useState(defaultStudentId);

  const [readinessData, setReadinessData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState(null);

  const fetchReadiness = useCallback(async (studentId) => {
    setIsLoading(true);
    setErrorMessage(null);

    try {
      const response = await fetch(
        `${API_BASE_URL}/readiness/student/${studentId}`
      );

      if (!response.ok) {
        throw new Error(
          `Unable to fetch readiness data (HTTP ${response.status}: ${response.statusText})`
        );
      }

      const json = await response.json();

      if (!json || json.success !== true || !json.data) {
        throw new Error(
          json?.message ||
            'Malformed API response received from readiness service'
        );
      }

      setReadinessData(json.data);
    } catch (error) {
      setErrorMessage(
        error.message ||
          'Failed to establish connection with readiness service.'
      );
      setReadinessData(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchReadiness(selectedStudentId);
  }, [selectedStudentId, fetchReadiness]);

  const getLevelStyle = (level) => {
    switch (level) {
      case 'Highly Ready':
        return {
          backgroundColor: 'rgba(16, 185, 129, 0.12)',
          color: 'var(--accent-emerald, #34d399)',
          border: '1px solid rgba(16, 185, 129, 0.3)'
        };

      case 'Placement Ready':
        return {
          backgroundColor: 'rgba(59, 130, 246, 0.12)',
          color: 'var(--accent-blue, #60a5fa)',
          border: '1px solid rgba(59, 130, 246, 0.3)'
        };

      case 'Developing':
        return {
          backgroundColor: 'rgba(245, 158, 11, 0.12)',
          color: 'var(--accent-amber, #fbbf24)',
          border: '1px solid rgba(245, 158, 11, 0.3)'
        };

      default:
        return {
          backgroundColor: 'rgba(239, 68, 68, 0.12)',
          color: 'var(--accent-red, #f87171)',
          border: '1px solid rgba(239, 68, 68, 0.3)'
        };
    }
  };

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '24px',
        width: '100%',
        boxSizing: 'border-box'
      }}
    >
      {/* Header */}
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: '16px',
          paddingBottom: '16px',
          borderBottom:
            '1px solid var(--border-color, #1e293b)'
        }}
      >
        <div>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px'
            }}
          >
            <h1
              style={{
                margin: 0,
                fontSize: '1.5rem',
                fontWeight: 700,
                color: 'var(--text-primary, #ffffff)',
                letterSpacing: '-0.02em'
              }}
            >
              Student Readiness
            </h1>

            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
                padding: '3px 8px',
                borderRadius: '6px',
                fontSize: '11px',
                fontWeight: 600,
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                backgroundColor: 'rgba(99, 102, 241, 0.12)',
                color: 'var(--accent-blue, #818cf8)',
                border: '1px solid rgba(99, 102, 241, 0.25)'
              }}
            >
              <Sparkles size={12} />
              Demo Data
            </span>
          </div>

          <p
            style={{
              margin: '6px 0 0',
              fontSize: '0.875rem',
              color: 'var(--text-secondary, #94a3b8)'
            }}
          >
            Explainable placement readiness scoring, transparent factor
            analysis, and actionable remediation tracks.
          </p>
        </div>

        {/* Candidate Selector */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}
        >
          <label
            htmlFor="student-selector"
            style={{
              fontSize: '0.75rem',
              fontWeight: 600,
              color: 'var(--text-muted, #64748b)'
            }}
          >
            Candidate:
          </label>

          <select
            id="student-selector"
            value={selectedStudentId}
            onChange={(event) =>
              setSelectedStudentId(event.target.value)
            }
            style={{
              backgroundColor:
                'var(--bg-sidebar, #0f172a)',
              color:
                'var(--text-primary, #f8fafc)',
              border:
                '1px solid var(--border-color, #334155)',
              borderRadius: '8px',
              padding: '6px 12px',
              fontSize: '0.875rem',
              outline: 'none',
              cursor: 'pointer'
            }}
          >
            {CANDIDATE_OPTIONS.map((candidate) => (
              <option
                key={candidate.id}
                value={candidate.id}
              >
                {candidate.name} ({candidate.id}) •{' '}
                {candidate.branch}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Loading */}
      {isLoading && (
        <div
          style={{
            backgroundColor:
              'var(--bg-card, var(--bg-sidebar, #0f172a))',
            border:
              '1px solid var(--border-color, #1e293b)',
            borderRadius: '12px',
            padding: '48px 24px',
            textAlign: 'center',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '12px'
          }}
        >
          <RefreshCw
            color="var(--accent-blue, #6366f1)"
            size={28}
          />

          <p
            style={{
              margin: 0,
              fontSize: '0.875rem',
              fontWeight: 600,
              color:
                'var(--text-primary, #f1f5f9)'
            }}
          >
            Calculating student readiness analysis...
          </p>

          <span
            style={{
              fontSize: '0.75rem',
              color:
                'var(--text-muted, #64748b)'
            }}
          >
            Querying endpoint /api/readiness/student/
            {selectedStudentId}
          </span>
        </div>
      )}

      {/* Error */}
      {!isLoading && errorMessage && (
        <div
          style={{
            backgroundColor:
              'rgba(239, 68, 68, 0.08)',
            border:
              '1px solid rgba(239, 68, 68, 0.3)',
            borderRadius: '12px',
            padding: '32px 24px',
            textAlign: 'center',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '12px'
          }}
        >
          <div
            style={{
              width: '44px',
              height: '44px',
              borderRadius: '50%',
              backgroundColor:
                'rgba(239, 68, 68, 0.15)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <AlertCircle
              color="var(--accent-red, #f87171)"
              size={24}
            />
          </div>

          <h2
            style={{
              margin: 0,
              fontSize: '1rem',
              fontWeight: 600,
              color: '#fca5a5'
            }}
          >
            Readiness Service Unavailable
          </h2>

          <p
            style={{
              margin: 0,
              fontSize: '0.8125rem',
              color:
                'var(--accent-red, #f87171)',
              maxWidth: '460px'
            }}
          >
            {errorMessage}
          </p>

          <button
            type="button"
            onClick={() =>
              fetchReadiness(selectedStudentId)
            }
            style={{
              marginTop: '6px',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              backgroundColor: '#dc2626',
              color: '#ffffff',
              border: 'none',
              borderRadius: '8px',
              padding: '8px 16px',
              fontSize: '0.75rem',
              fontWeight: 600,
              cursor: 'pointer'
            }}
          >
            <RefreshCw size={13} />
            Retry Analysis
          </button>
        </div>
      )}

      {/* Readiness Content */}
      {!isLoading && readinessData && (
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '20px'
          }}
        >
          {/* Hero Summary */}
          <div
            style={{
              backgroundColor:
                'var(--bg-card, var(--bg-sidebar, #0f172a))',
              border:
                '1px solid var(--border-color, #1e293b)',
              borderRadius: '12px',
              padding: '24px',
              display: 'flex',
              flexWrap: 'wrap',
              gap: '24px',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}
          >
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '6px',
                minWidth: '220px'
              }}
            >
              <span
                style={{
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  color:
                    'var(--text-muted, #64748b)',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em'
                }}
              >
                Overall Readiness Score
              </span>

              <div
                style={{
                  display: 'flex',
                  alignItems: 'baseline',
                  gap: '6px'
                }}
              >
                <span
                  style={{
                    fontSize: '2.5rem',
                    fontWeight: 800,
                    color:
                      'var(--text-primary, #ffffff)',
                    lineHeight: 1
                  }}
                >
                  {readinessData.totalScore}
                </span>

                <span
                  style={{
                    fontSize: '1.125rem',
                    fontWeight: 500,
                    color:
                      'var(--text-muted, #64748b)'
                  }}
                >
                  / 100
                </span>
              </div>

              <div style={{ marginTop: '4px' }}>
                <span
                  style={{
                    display: 'inline-block',
                    padding: '4px 10px',
                    borderRadius: '6px',
                    fontSize: '0.75rem',
                    fontWeight: 600,
                    ...getLevelStyle(
                      readinessData.readinessLevel
                    )
                  }}
                >
                  {readinessData.readinessLevel}
                </span>
              </div>
            </div>

            <div
              style={{
                flex: '1 1 320px',
                display: 'flex',
                flexDirection: 'column',
                gap: '8px'
              }}
            >
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  fontSize: '0.8125rem'
                }}
              >
                <span
                  style={{
                    color:
                      'var(--text-primary, #e2e8f0)',
                    fontWeight: 600
                  }}
                >
                  {readinessData.studentName} (
                  {readinessData.studentId}) •{' '}
                  {readinessData.branch}
                </span>

                <span
                  style={{
                    color:
                      'var(--text-muted, #64748b)',
                    fontFamily: 'monospace',
                    fontWeight: 600
                  }}
                >
                  {readinessData.totalScore}% Index
                </span>
              </div>

              <div
                role="progressbar"
                aria-valuenow={
                  readinessData.totalScore
                }
                aria-valuemin="0"
                aria-valuemax="100"
                aria-label="Overall readiness completion percentage"
                style={{
                  width: '100%',
                  height: '10px',
                  backgroundColor:
                    'rgba(30, 41, 59, 0.8)',
                  borderRadius: '999px',
                  overflow: 'hidden',
                  border:
                    '1px solid var(--border-color, #334155)'
                }}
              >
                <div
                  style={{
                    width: `${Math.min(
                      100,
                      Math.max(
                        0,
                        readinessData.totalScore
                      )
                    )}%`,
                    height: '100%',
                    backgroundColor:
                      'var(--accent-blue, #6366f1)',
                    borderRadius: '999px',
                    transition:
                      'width 0.4s ease-out'
                  }}
                />
              </div>

              <span
                style={{
                  fontSize: '0.75rem',
                  color:
                    'var(--text-muted, #64748b)',
                  marginTop: '2px'
                }}
              >
                Readiness classification threshold:
                80+ points for Highly Ready.
              </span>
            </div>
          </div>

          {/* Factor Breakdown */}
          <div
            style={{
              backgroundColor:
                'var(--bg-card, var(--bg-sidebar, #0f172a))',
              border:
                '1px solid var(--border-color, #1e293b)',
              borderRadius: '12px',
              padding: '24px'
            }}
          >
            <h2
              style={{
                margin: '0 0 16px',
                fontSize: '1rem',
                fontWeight: 700,
                color:
                  'var(--text-primary, #ffffff)'
              }}
            >
              Explainable Factor Breakdown
            </h2>

            <div
              style={{
                display: 'grid',
                gridTemplateColumns:
                  'repeat(auto-fit, minmax(280px, 1fr))',
                gap: '16px'
              }}
            >
              {factorConfig.map(
                ({
                  key,
                  label,
                  max,
                  icon: Icon
                }) => {
                  const item =
                    readinessData.scoreBreakdown?.[
                      key
                    ] || {
                      score: 0,
                      maxScore: max,
                      reason:
                        'No breakdown available.'
                    };

                  const percentage =
                    item.maxScore > 0
                      ? (item.score /
                          item.maxScore) *
                        100
                      : 0;

                  return (
                    <div
                      key={key}
                      style={{
                        backgroundColor:
                          'rgba(30, 41, 59, 0.4)',
                        border:
                          '1px solid var(--border-color, #1e293b)',
                        borderRadius: '8px',
                        padding: '16px',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '8px'
                      }}
                    >
                      <div
                        style={{
                          display: 'flex',
                          justifyContent:
                            'space-between',
                          alignItems: 'center'
                        }}
                      >
                        <div
                          style={{
                            display: 'flex',
                            alignItems:
                              'center',
                            gap: '8px'
                          }}
                        >
                          <Icon
                            color="var(--accent-blue, #6366f1)"
                            size={16}
                          />

                          <span
                            style={{
                              fontSize:
                                '0.8125rem',
                              fontWeight: 600,
                              color:
                                'var(--text-primary, #f1f5f9)'
                            }}
                          >
                            {label}
                          </span>
                        </div>

                        <span
                          style={{
                            fontSize:
                              '0.75rem',
                            fontFamily:
                              'monospace',
                            fontWeight: 700,
                            color:
                              'var(--accent-blue, #818cf8)'
                          }}
                        >
                          {item.score} /{' '}
                          {item.maxScore}
                        </span>
                      </div>

                      <div
                        role="progressbar"
                        aria-valuenow={item.score}
                        aria-valuemin="0"
                        aria-valuemax={
                          item.maxScore
                        }
                        aria-label={`${label} progress`}
                        style={{
                          width: '100%',
                          height: '6px',
                          backgroundColor:
                            'rgba(15, 23, 42, 0.8)',
                          borderRadius:
                            '999px',
                          overflow: 'hidden'
                        }}
                      >
                        <div
                          style={{
                            width: `${Math.min(
                              100,
                              Math.max(
                                0,
                                percentage
                              )
                            )}%`,
                            height: '100%',
                            backgroundColor:
                              'var(--accent-blue, #6366f1)',
                            borderRadius:
                              '999px'
                          }}
                        />
                      </div>

                      <p
                        style={{
                          margin: 0,
                          fontSize:
                            '0.75rem',
                          color:
                            'var(--text-secondary, #94a3b8)',
                          lineHeight: 1.5
                        }}
                      >
                        {item.reason}
                      </p>
                    </div>
                  );
                }
              )}
            </div>
          </div>

          {/* Strengths and Gaps */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns:
                'repeat(auto-fit, minmax(280px, 1fr))',
              gap: '20px'
            }}
          >
            {/* Strengths */}
            <div
              style={{
                backgroundColor:
                  'var(--bg-card, var(--bg-sidebar, #0f172a))',
                border:
                  '1px solid var(--border-color, #1e293b)',
                borderRadius: '12px',
                padding: '24px'
              }}
            >
              <h2
                style={{
                  margin: '0 0 16px',
                  fontSize: '1rem',
                  fontWeight: 700,
                  color:
                    'var(--text-primary, #ffffff)'
                }}
              >
                Profile Strengths
              </h2>

              {Array.isArray(
                readinessData.strengths
              ) &&
              readinessData.strengths.length >
                0 ? (
                <div
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '10px'
                  }}
                >
                  {readinessData.strengths.map(
                    (strength, index) => (
                      <div
                        key={`${strength}-${index}`}
                        style={{
                          display: 'flex',
                          alignItems:
                            'flex-start',
                          gap: '8px',
                          fontSize:
                            '0.8125rem',
                          color:
                            'var(--text-secondary, #cbd5e1)',
                          backgroundColor:
                            'rgba(30, 41, 59, 0.4)',
                          border:
                            '1px solid var(--border-color, #1e293b)',
                          borderRadius: '8px',
                          padding: '10px 12px'
                        }}
                      >
                        <CheckCircle2
                          size={16}
                          color="var(--accent-emerald, #10b981)"
                          style={{
                            flexShrink: 0,
                            marginTop: '1px'
                          }}
                        />

                        <span>{strength}</span>
                      </div>
                    )
                  )}
                </div>
              ) : (
                <p
                  style={{
                    margin: 0,
                    fontSize:
                      '0.8125rem',
                    color:
                      'var(--text-muted, #64748b)',
                    fontStyle: 'italic'
                  }}
                >
                  No major profile strengths
                  identified from current demo
                  data.
                </p>
              )}
            </div>

            {/* Skill Gaps */}
            <div
              style={{
                backgroundColor:
                  'var(--bg-card, var(--bg-sidebar, #0f172a))',
                border:
                  '1px solid var(--border-color, #1e293b)',
                borderRadius: '12px',
                padding: '24px'
              }}
            >
              <h2
                style={{
                  margin: '0 0 16px',
                  fontSize: '1rem',
                  fontWeight: 700,
                  color:
                    'var(--text-primary, #ffffff)'
                }}
              >
                Identified Skill Gaps
              </h2>

              {Array.isArray(
                readinessData.skillGaps
              ) &&
              readinessData.skillGaps.length >
                0 ? (
                <div
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '10px'
                  }}
                >
                  {readinessData.skillGaps.map(
                    (gap, index) => (
                      <div
                        key={`${gap}-${index}`}
                        style={{
                          display: 'flex',
                          alignItems:
                            'flex-start',
                          gap: '8px',
                          fontSize:
                            '0.8125rem',
                          color:
                            'var(--text-secondary, #cbd5e1)',
                          backgroundColor:
                            'rgba(30, 41, 59, 0.4)',
                          border:
                            '1px solid var(--border-color, #1e293b)',
                          borderRadius: '8px',
                          padding: '10px 12px'
                        }}
                      >
                        <AlertTriangle
                          size={16}
                          color="var(--accent-amber, #f59e0b)"
                          style={{
                            flexShrink: 0,
                            marginTop: '1px'
                          }}
                        />

                        <span>{gap}</span>
                      </div>
                    )
                  )}
                </div>
              ) : (
                <p
                  style={{
                    margin: 0,
                    fontSize:
                      '0.8125rem',
                    color:
                      'var(--text-secondary, #94a3b8)'
                  }}
                >
                  No major gaps identified from
                  current demo data.
                </p>
              )}
            </div>
          </div>

          {/* Recommendations */}
          <div
            style={{
              backgroundColor:
                'var(--bg-card, var(--bg-sidebar, #0f172a))',
              border:
                '1px solid var(--border-color, #1e293b)',
              borderRadius: '12px',
              padding: '24px'
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                marginBottom: '14px'
              }}
            >
              <Lightbulb
                color="var(--accent-blue, #818cf8)"
                size={18}
              />

              <h2
                style={{
                  margin: 0,
                  fontSize: '1rem',
                  fontWeight: 700,
                  color:
                    'var(--text-primary, #ffffff)'
                }}
              >
                Personalized Recommendations
              </h2>
            </div>

            {Array.isArray(
              readinessData.recommendations
            ) &&
            readinessData.recommendations.length >
              0 ? (
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '10px'
                }}
              >
                {readinessData.recommendations.map(
                  (recommendation, index) => (
                    <div
                      key={`${recommendation}-${index}`}
                      style={{
                        display: 'flex',
                        alignItems:
                          'flex-start',
                        gap: '10px',
                        backgroundColor:
                          'rgba(30, 41, 59, 0.35)',
                        border:
                          '1px solid var(--border-color, #1e293b)',
                        borderRadius: '8px',
                        padding: '12px'
                      }}
                    >
                      <span
                        style={{
                          width: '22px',
                          height: '22px',
                          borderRadius: '50%',
                          backgroundColor:
                            'rgba(99, 102, 241, 0.15)',
                          color:
                            'var(--accent-blue, #818cf8)',
                          fontSize: '11px',
                          fontWeight: 700,
                          display: 'flex',
                          alignItems:
                            'center',
                          justifyContent:
                            'center',
                          flexShrink: 0
                        }}
                      >
                        {index + 1}
                      </span>

                      <span
                        style={{
                          fontSize:
                            '0.8125rem',
                          color:
                            'var(--text-secondary, #cbd5e1)',
                          lineHeight: 1.5
                        }}
                      >
                        {recommendation}
                      </span>
                    </div>
                  )
                )}
              </div>
            ) : (
              <p
                style={{
                  margin: 0,
                  fontSize: '0.8125rem',
                  color:
                    'var(--text-muted, #64748b)',
                  fontStyle: 'italic'
                }}
              >
                No recommendations generated from
                current demo data.
              </p>
            )}
          </div>

          {/* Disclaimer */}
          <div
            style={{
              padding: '14px 16px',
              borderRadius: '8px',
              backgroundColor:
                'rgba(15, 23, 42, 0.6)',
              border:
                '1px solid var(--border-color, #1e293b)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              textAlign: 'center'
            }}
          >
            <ShieldAlert
              size={15}
              color="var(--text-muted, #64748b)"
              style={{ flexShrink: 0 }}
            />

            <p
              style={{
                margin: 0,
                fontSize: '0.75rem',
                color:
                  'var(--text-muted, #64748b)',
                lineHeight: 1.5
              }}
            >
              Prototype readiness analysis based on
              synthetic demo data. It is not a guaranteed
              hiring prediction.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}