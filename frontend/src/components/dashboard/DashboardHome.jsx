import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  TrendingUp,
  Award,
  Users,
  Building2,
  RefreshCw,
  AlertCircle,
  CheckCircle2,
  ArrowRight,
  ShieldCheck
} from 'lucide-react';

const API_BASE_URL = 'http://localhost:5000/api';

const AUTH_HEADERS = {
  'Content-Type': 'application/json',
  'X-Demo-User-Role': 'placement_officer'
};

// Safely parse numeric LPA from offer records
function extractNumericLPA(offer) {
  if (!offer) return null;

  const raw =
    offer.salaryLpa ??
    offer.salary_lpa ??
    offer.packageLPA ??
    offer.package_lpa ??
    offer.ctc ??
    offer.package;

  if (raw === null || raw === undefined) return null;

  const num = parseFloat(String(raw).replace(/[^0-9.]/g, ''));

  return Number.isNaN(num) ? null : num;
}

export default function DashboardHome({ onNavigate }) {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  const [overviewData, setOverviewData] = useState(null);
  const [drivesData, setDrivesData] = useState([]);
  const [offersData, setOffersData] = useState([]);

  const fetchDashboardData = useCallback(async () => {
    setError(null);

    try {
      const [overviewRes, drivesRes, offersRes] = await Promise.all([
        fetch(`${API_BASE_URL}/analytics/overview`, {
          headers: AUTH_HEADERS
        }),
        fetch(`${API_BASE_URL}/drives`, {
          headers: AUTH_HEADERS
        }),
        fetch(`${API_BASE_URL}/offers`, {
          headers: AUTH_HEADERS
        })
      ]);

      if (!overviewRes.ok) {
        throw new Error(
          `Failed to load placement overview (HTTP ${overviewRes.status})`
        );
      }

      const overviewJson = await overviewRes.json();

      setOverviewData(overviewJson.data || overviewJson);

      if (drivesRes.ok) {
        const drivesJson = await drivesRes.json();

        const driveList = Array.isArray(drivesJson.data)
          ? drivesJson.data
          : Array.isArray(drivesJson)
          ? drivesJson
          : [];

        setDrivesData(driveList);
      }

      if (offersRes.ok) {
        const offersJson = await offersRes.json();

        const offerList = Array.isArray(offersJson.data)
          ? offersJson.data
          : Array.isArray(offersJson)
          ? offersJson
          : [];

        setOffersData(offerList);
      }
    } catch (err) {
      setError(
        err.message || 'Error occurred while loading dashboard metrics.'
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchDashboardData();
  };

  // KPI values from live overview
  const totalStudents = Number(overviewData?.totalStudents ?? 0);

  const placedStudents = Number(overviewData?.placedStudents ?? 0);

  const placementRate =
    overviewData?.placementRate !== undefined
      ? Number(overviewData.placementRate).toFixed(1)
      : totalStudents > 0
      ? ((placedStudents / totalStudents) * 100).toFixed(1)
      : '0.0';

  const avgPackage =
    overviewData?.averagePackageLPA !== undefined
      ? Number(overviewData.averagePackageLPA).toFixed(2)
      : '0.00';

  const highestPackage =
    overviewData?.highestPackageLPA !== undefined
      ? Number(overviewData.highestPackageLPA).toFixed(2)
      : '0.00';

  const activeDrivesCount = Number(
    overviewData?.activePlacementDrives ?? drivesData.length
  );

  /*
   * Package brackets:
   * < 10       => Below 10 LPA
   * 10 to <15   => 10–15 LPA
   * 15 to <20   => 15–20 LPA
   * >= 20       => 20+ LPA
   *
   * This matches the Analytics module.
   */
  const packageDistribution = useMemo(() => {
    let below10 = 0;
    let range10_15 = 0;
    let range15_20 = 0;
    let above20 = 0;

    offersData.forEach((offer) => {
      const lpa = extractNumericLPA(offer);

      if (lpa !== null) {
        if (lpa < 10) {
          below10 += 1;
        } else if (lpa >= 10 && lpa < 15) {
          range10_15 += 1;
        } else if (lpa >= 15 && lpa < 20) {
          range15_20 += 1;
        } else if (lpa >= 20) {
          above20 += 1;
        }
      }
    });

    return [
      {
        label: 'Below 10 LPA',
        count: below10
      },
      {
        label: '10–15 LPA',
        count: range10_15
      },
      {
        label: '15–20 LPA',
        count: range15_20
      },
      {
        label: '20+ LPA',
        count: above20
      }
    ];
  }, [offersData]);

  const totalCalculatedOffers = useMemo(() => {
    return packageDistribution.reduce(
      (acc, curr) => acc + curr.count,
      0
    );
  }, [packageDistribution]);

  const maxBracketCount = useMemo(() => {
    const counts = packageDistribution.map((item) => item.count);

    return Math.max(...counts, 1);
  }, [packageDistribution]);

  if (loading) {
    return (
      <div
        style={{
          padding: '48px',
          textAlign: 'center',
          color: '#64748b'
        }}
      >
        <RefreshCw
          size={24}
          style={{
            animation: 'spin 1s linear infinite',
            margin: '0 auto 12px'
          }}
        />

        <p
          style={{
            margin: 0,
            fontSize: '0.875rem'
          }}
        >
          Loading live placement metrics...
        </p>
      </div>
    );
  }

  return (
    <div
      style={{
        padding: '24px',
        display: 'flex',
        flexDirection: 'column',
        gap: '24px',
        color: '#f8fafc'
      }}
    >
      {/* Header */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          flexWrap: 'wrap',
          gap: '16px'
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
                fontSize: '1.65rem',
                fontWeight: 800,
                color: '#ffffff',
                letterSpacing: '-0.02em'
              }}
            >
              Placement Command Center
            </h1>

            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '3px 10px',
                borderRadius: '999px',
                fontSize: '11px',
                fontWeight: 700,
                textTransform: 'uppercase',
                backgroundColor: 'rgba(16, 185, 129, 0.12)',
                color: '#34d399',
                border: '1px solid rgba(16, 185, 129, 0.3)'
              }}
            >
              <span
                style={{
                  width: '6px',
                  height: '6px',
                  borderRadius: '50%',
                  backgroundColor: '#10b981',
                  boxShadow: '0 0 8px #10b981'
                }}
              />

              Live MySQL Data
            </span>
          </div>

          <p
            style={{
              margin: '6px 0 0 0',
              fontSize: '0.875rem',
              color: '#94a3b8'
            }}
          >
            Institutional overview of active placement drives, verified offers,
            and recruitment statistics
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
            backgroundColor: '#1e293b',
            border: '1px solid #334155',
            borderRadius: '8px',
            color: '#f1f5f9',
            fontSize: '0.875rem',
            fontWeight: 600,
            cursor:
              loading || refreshing ? 'not-allowed' : 'pointer',
            opacity: loading || refreshing ? 0.6 : 1,
            transition: 'all 0.2s ease'
          }}
        >
          <RefreshCw
            size={15}
            style={{
              animation: refreshing
                ? 'spin 1s linear infinite'
                : 'none'
            }}
          />

          {refreshing ? 'Updating Feeds...' : 'Refresh Overview'}
        </button>
      </div>

      {/* Error */}
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

      {/* KPI Cards */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns:
            'repeat(auto-fit, minmax(180px, 1fr))',
          gap: '16px'
        }}
      >
        {/* Total Cohort */}
        <div
          style={{
            padding: '18px 20px',
            backgroundColor: '#0f172a',
            border: '1px solid #1e293b',
            borderRadius: '12px',
            display: 'flex',
            flexDirection: 'column',
            gap: '6px'
          }}
        >
          <span
            style={{
              fontSize: '0.75rem',
              fontWeight: 600,
              color: '#94a3b8',
              textTransform: 'uppercase',
              letterSpacing: '0.04em'
            }}
          >
            Total Cohort
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
                fontSize: '1.85rem',
                fontWeight: 800,
                color: '#f8fafc',
                fontFamily: 'monospace'
              }}
            >
              {totalStudents}
            </span>

            <span
              style={{
                fontSize: '0.75rem',
                color: '#64748b'
              }}
            >
              registered
            </span>
          </div>

          <span
            style={{
              fontSize: '0.75rem',
              color: '#818cf8',
              display: 'flex',
              alignItems: 'center',
              gap: '4px'
            }}
          >
            <Users size={12} />
            BPUT Batch 2026
          </span>
        </div>

        {/* Students Placed */}
        <div
          style={{
            padding: '18px 20px',
            backgroundColor: '#0f172a',
            border: '1px solid #1e293b',
            borderRadius: '12px',
            display: 'flex',
            flexDirection: 'column',
            gap: '6px'
          }}
        >
          <span
            style={{
              fontSize: '0.75rem',
              fontWeight: 600,
              color: '#94a3b8',
              textTransform: 'uppercase',
              letterSpacing: '0.04em'
            }}
          >
            Students Placed
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
                fontSize: '1.85rem',
                fontWeight: 800,
                color: '#10b981',
                fontFamily: 'monospace'
              }}
            >
              {placedStudents}
            </span>

            <span
              style={{
                fontSize: '0.75rem',
                color: '#64748b'
              }}
            >
              confirmed
            </span>
          </div>

          <span
            style={{
              fontSize: '0.75rem',
              color: '#10b981',
              display: 'flex',
              alignItems: 'center',
              gap: '4px'
            }}
          >
            <CheckCircle2 size={12} />
            With verified offers
          </span>
        </div>

        {/* Placement Rate */}
        <div
          style={{
            padding: '18px 20px',
            backgroundColor: '#0f172a',
            border: '1px solid #1e293b',
            borderRadius: '12px',
            display: 'flex',
            flexDirection: 'column',
            gap: '6px'
          }}
        >
          <span
            style={{
              fontSize: '0.75rem',
              fontWeight: 600,
              color: '#94a3b8',
              textTransform: 'uppercase',
              letterSpacing: '0.04em'
            }}
          >
            Placement Rate
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
                fontSize: '1.85rem',
                fontWeight: 800,
                color: '#38bdf8',
                fontFamily: 'monospace'
              }}
            >
              {placementRate}%
            </span>
          </div>

          <span
            style={{
              fontSize: '0.75rem',
              color: '#94a3b8'
            }}
          >
            Current placement ratio
          </span>
        </div>

        {/* Average Package */}
        <div
          style={{
            padding: '18px 20px',
            backgroundColor: '#0f172a',
            border: '1px solid #1e293b',
            borderRadius: '12px',
            display: 'flex',
            flexDirection: 'column',
            gap: '6px'
          }}
        >
          <span
            style={{
              fontSize: '0.75rem',
              fontWeight: 600,
              color: '#94a3b8',
              textTransform: 'uppercase',
              letterSpacing: '0.04em'
            }}
          >
            Average Package
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
                fontSize: '1.85rem',
                fontWeight: 800,
                color: '#f8fafc',
                fontFamily: 'monospace'
              }}
            >
              {avgPackage}
            </span>

            <span
              style={{
                fontSize: '0.75rem',
                color: '#64748b'
              }}
            >
              LPA
            </span>
          </div>

          <span
            style={{
              fontSize: '0.75rem',
              color: '#34d399',
              display: 'flex',
              alignItems: 'center',
              gap: '4px'
            }}
          >
            <TrendingUp size={12} />
            Normalized offers
          </span>
        </div>

        {/* Highest Package */}
        <div
          style={{
            padding: '18px 20px',
            backgroundColor: '#0f172a',
            border: '1px solid #1e293b',
            borderRadius: '12px',
            display: 'flex',
            flexDirection: 'column',
            gap: '6px'
          }}
        >
          <span
            style={{
              fontSize: '0.75rem',
              fontWeight: 600,
              color: '#94a3b8',
              textTransform: 'uppercase',
              letterSpacing: '0.04em'
            }}
          >
            Highest Package
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
                fontSize: '1.85rem',
                fontWeight: 800,
                color: '#f59e0b',
                fontFamily: 'monospace'
              }}
            >
              {highestPackage}
            </span>

            <span
              style={{
                fontSize: '0.75rem',
                color: '#64748b'
              }}
            >
              LPA
            </span>
          </div>

          <span
            style={{
              fontSize: '0.75rem',
              color: '#f59e0b',
              display: 'flex',
              alignItems: 'center',
              gap: '4px'
            }}
          >
            <Award size={12} />
            Peak offer recorded
          </span>
        </div>

        {/* Active Drives */}
        <div
          style={{
            padding: '18px 20px',
            backgroundColor: '#0f172a',
            border: '1px solid #1e293b',
            borderRadius: '12px',
            display: 'flex',
            flexDirection: 'column',
            gap: '6px'
          }}
        >
          <span
            style={{
              fontSize: '0.75rem',
              fontWeight: 600,
              color: '#94a3b8',
              textTransform: 'uppercase',
              letterSpacing: '0.04em'
            }}
          >
            Active Drives
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
                fontSize: '1.85rem',
                fontWeight: 800,
                color: '#f8fafc',
                fontFamily: 'monospace'
              }}
            >
              {activeDrivesCount}
            </span>

            <span
              style={{
                fontSize: '0.75rem',
                color: '#64748b'
              }}
            >
              drives
            </span>
          </div>

          <span
            style={{
              fontSize: '0.75rem',
              color: '#818cf8',
              display: 'flex',
              alignItems: 'center',
              gap: '4px'
            }}
          >
            <Building2 size={12} />
            Live in MySQL
          </span>
        </div>
      </div>

      {/* Main Grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns:
            'repeat(auto-fit, minmax(440px, 1fr))',
          gap: '20px'
        }}
      >
        {/* Package Distribution */}
        <div
          style={{
            backgroundColor: '#0f172a',
            border: '1px solid #1e293b',
            borderRadius: '12px',
            padding: '22px',
            display: 'flex',
            flexDirection: 'column',
            gap: '16px'
          }}
        >
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}
          >
            <h2
              style={{
                margin: 0,
                fontSize: '1rem',
                fontWeight: 700,
                color: '#f1f5f9',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}
            >
              <TrendingUp size={18} color="#10b981" />
              Placement Package Distribution
            </h2>

            <span
              style={{
                fontSize: '0.75rem',
                color: '#64748b'
              }}
            >
              Total Offers:{' '}
              <strong style={{ color: '#cbd5e1' }}>
                {totalCalculatedOffers}
              </strong>
            </span>
          </div>

          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '14px'
            }}
          >
            {packageDistribution.map((bracket) => {
              const widthPct = Math.round(
                (bracket.count / maxBracketCount) * 100
              );

              return (
                <div
                  key={bracket.label}
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '140px 1fr 60px',
                    alignItems: 'center',
                    gap: '12px',
                    fontSize: '0.8125rem'
                  }}
                >
                  <span
                    style={{
                      color: '#cbd5e1',
                      fontWeight: 500
                    }}
                  >
                    {bracket.label}
                  </span>

                  <div
                    style={{
                      height: '14px',
                      backgroundColor: '#1e293b',
                      borderRadius: '4px',
                      overflow: 'hidden'
                    }}
                  >
                    <div
                      style={{
                        width: `${widthPct}%`,
                        height: '100%',
                        background:
                          'linear-gradient(90deg, #10b981, #34d399)',
                        borderRadius: '4px',
                        transition: 'width 0.4s ease'
                      }}
                    />
                  </div>

                  <span
                    style={{
                      fontFamily: 'monospace',
                      fontWeight: 700,
                      color: '#f8fafc',
                      textAlign: 'right'
                    }}
                  >
                    {bracket.count}
                  </span>
                </div>
              );
            })}
          </div>

          <p
            style={{
              margin: '8px 0 0 0',
              fontSize: '0.75rem',
              color: '#94a3b8',
              lineHeight: 1.45
            }}
          >
            Distribution of currently recorded package brackets across
            verified student offers.
          </p>
        </div>

        {/* Recruitment Drives */}
        <div
          style={{
            backgroundColor: '#0f172a',
            border: '1px solid #1e293b',
            borderRadius: '12px',
            padding: '22px',
            display: 'flex',
            flexDirection: 'column',
            gap: '16px'
          }}
        >
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}
          >
            <h2
              style={{
                margin: 0,
                fontSize: '1rem',
                fontWeight: 700,
                color: '#f1f5f9',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}
            >
              <Building2 size={18} color="#818cf8" />
              Registered Recruitment Drives
            </h2>

            <span
              style={{
                fontSize: '0.75rem',
                color: '#64748b'
              }}
            >
              {drivesData.length} Drives Registered
            </span>
          </div>

          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '10px'
            }}
          >
            {drivesData.slice(0, 4).map((d) => (
              <div
                key={d.id}
                style={{
                  padding: '12px 14px',
                  backgroundColor: 'rgba(30, 41, 59, 0.45)',
                  border: '1px solid #334155',
                  borderRadius: '8px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}
              >
                <div>
                  <div
                    style={{
                      fontWeight: 700,
                      color: '#f8fafc',
                      fontSize: '0.875rem'
                    }}
                  >
                    {d.company}
                  </div>

                  <div
                    style={{
                      fontSize: '0.75rem',
                      color: '#94a3b8',
                      marginTop: '2px'
                    }}
                  >
                    {d.role} • {d.date || d.driveDate}
                  </div>
                </div>

                <div style={{ textAlign: 'right' }}>
                  <div
                    style={{
                      color: '#10b981',
                      fontWeight: 700,
                      fontFamily: 'monospace',
                      fontSize: '0.875rem'
                    }}
                  >
                    {d.packageLPA ?? d.salaryLpa ?? '--'} LPA
                  </div>

                  <div
                    style={{
                      fontSize: '0.75rem',
                      color: '#38bdf8'
                    }}
                  >
                    {d.openings ?? '--'} openings
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div
            style={{
              display: 'flex',
              justifyContent: 'flex-end',
              paddingTop: '4px'
            }}
          >
            {onNavigate && (
              <button
                type="button"
                onClick={() => onNavigate('analytics')}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: '#818cf8',
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px'
                }}
              >
                View Full Analytics
                <ArrowRight size={13} />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Footer */}
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
        <ShieldCheck
          size={16}
          color="#818cf8"
          style={{ flexShrink: 0 }}
        />

        <span>
          <strong>Data Grounding Guarantee:</strong> All dashboard metrics
          and package brackets are dynamically evaluated from live MySQL
          database records.
        </span>
      </div>
    </div>
  );
}
