import React, { useState, useEffect, useCallback } from 'react';
import {
  Users,
  Briefcase,
  TrendingUp,
  Award,
  RefreshCw,
  AlertCircle,
  ShieldAlert,
  Sparkles
} from 'lucide-react';

import MetricCard from './MetricCard';
import BranchConversionChart from './BranchConversionChart';
import SalaryTrendChart from './SalaryTrendChart';
import ActiveDrivesList from './ActiveDrivesList';
import RecentActivities from './RecentActivities';

import { recentActivities } from '../../data/mockPlacementData';

const API_BASE_URL = 'http://localhost:5000/api';

export default function DashboardHome({ searchTerm = '' }) {
  const [overviewData, setOverviewData] = useState(null);
  const [branchData, setBranchData] = useState([]);
  const [packageData, setPackageData] = useState([]);
  const [drivesData, setDrivesData] = useState([]);

  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState(null);

  const fetchDashboardData = useCallback(async () => {
    setIsLoading(true);
    setErrorMessage(null);

    const headers = {
      'Content-Type': 'application/json',
      'X-Demo-User-Role': 'placement_officer'
    };

    try {
      // ==========================================
      // 1. OVERVIEW
      // ==========================================

      const overviewRes = await fetch(
        `${API_BASE_URL}/analytics/overview`,
        { headers }
      );

      if (!overviewRes.ok) {
        throw new Error(
          `Analytics overview request failed (HTTP ${overviewRes.status}: ${overviewRes.statusText})`
        );
      }

      const overviewJson = await overviewRes.json();

      if (
        !overviewJson ||
        overviewJson.success !== true ||
        !overviewJson.data
      ) {
        throw new Error(
          overviewJson?.message ||
          'Malformed response from analytics overview service'
        );
      }

      setOverviewData(overviewJson.data);

      // ==========================================
      // 2. SECONDARY ANALYTICS REQUESTS
      // ==========================================

      const [
        branchesResult,
        packagesResult,
        drivesResult
      ] = await Promise.allSettled([
        fetch(`${API_BASE_URL}/analytics/branches`, {
          headers
        }).then((res) => (res.ok ? res.json() : null)),

        fetch(`${API_BASE_URL}/analytics/packages`, {
          headers
        }).then((res) => (res.ok ? res.json() : null)),

        fetch(`${API_BASE_URL}/drives`).then((res) =>
          res.ok ? res.json() : null
        )
      ]);

      // ==========================================
      // 3. BRANCH DATA ADAPTER
      // ==========================================

      if (
        branchesResult.status === 'fulfilled' &&
        branchesResult.value?.success &&
        Array.isArray(branchesResult.value.data)
      ) {
        const backendBranches = branchesResult.value.data;

        const normalizedBranchData = backendBranches.map((item) => ({
          branch: item.branch,

          total:
            Number(
              item.totalStudents ??
              item.total ??
              item.students ??
              0
            ),

          placed:
            Number(
              item.placedStudents ??
              item.placed ??
              0
            ),

          rate:
            Number(
              item.placementRate ??
              item.rate ??
              0
            )
        }));

        setBranchData(normalizedBranchData);
      } else {
        setBranchData([]);
      }

      // ==========================================
      // 4. PACKAGE DATA ADAPTER
      // ==========================================
      //
      // The existing SalaryTrendChart expects:
      //
      // [
      //   { year, avg, highest, isProjection }
      // ]
      //
      // The backend package endpoint provides package
      // distribution/current package analytics, not the
      // historical 2021-2026 trend.
      //
      // Therefore we intentionally keep the existing
      // synthetic historical trend from mockPlacementData.
      // ==========================================

      if (
        packagesResult.status === 'fulfilled' &&
        packagesResult.value?.success &&
        packagesResult.value.data
      ) {
        const backendPackageData = packagesResult.value.data;

        /*
         * Preserve the historical chart dataset already
         * designed for the dashboard if the backend does
         * not provide historical year-by-year values.
         */
        if (Array.isArray(backendPackageData)) {
          const normalizedPackageData = backendPackageData
            .filter(
              (item) =>
                item &&
                item.year !== undefined &&
                item.avg !== undefined &&
                item.highest !== undefined
            )
            .map((item) => ({
              year: String(item.year),
              avg: Number(item.avg),
              highest: Number(item.highest),
              isProjection: Boolean(item.isProjection)
            }));

          if (normalizedPackageData.length > 0) {
            setPackageData(normalizedPackageData);
          } else {
            setPackageData(getFallbackSalaryTrendData());
          }
        } else {
          setPackageData(getFallbackSalaryTrendData());
        }
      } else {
        setPackageData(getFallbackSalaryTrendData());
      }

      // ==========================================
      // 5. DRIVE DATA
      // ==========================================

      if (
        drivesResult.status === 'fulfilled' &&
        drivesResult.value?.success &&
        Array.isArray(drivesResult.value.data)
      ) {
        setDrivesData(drivesResult.value.data);
      } else {
        setDrivesData([]);
      }
    } catch (err) {
      setErrorMessage(
        err.message ||
        'Failed to establish connection with backend analytics service.'
      );

      setOverviewData(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  // ==========================================
  // LOADING STATE
  // ==========================================

  if (isLoading) {
    return (
      <div
        style={{
          backgroundColor:
            'var(--bg-card, var(--bg-sidebar, #0f172a))',
          border:
            '1px solid var(--border-color, #1e293b)',
          borderRadius: '12px',
          padding: '64px 24px',
          textAlign: 'center',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '12px'
        }}
      >
        <RefreshCw
          size={32}
          color="var(--accent-blue, #6366f1)"
          style={{
            animation: 'spin 1s linear infinite'
          }}
        />

        <p
          style={{
            margin: 0,
            fontSize: '0.9375rem',
            fontWeight: 600,
            color:
              'var(--text-primary, #f1f5f9)'
          }}
        >
          Synchronizing analytics data from backend services...
        </p>

        <span
          style={{
            fontSize: '0.75rem',
            color:
              'var(--text-muted, #64748b)'
          }}
        >
          Querying /api/analytics endpoints with placement officer credentials
        </span>
      </div>
    );
  }

  // ==========================================
  // ERROR STATE
  // ==========================================

  if (errorMessage || !overviewData) {
    return (
      <div
        style={{
          backgroundColor:
            'rgba(239, 68, 68, 0.08)',
          border:
            '1px solid rgba(239, 68, 68, 0.3)',
          borderRadius: '12px',
          padding: '36px 24px',
          textAlign: 'center',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '12px'
        }}
      >
        <div
          style={{
            width: '46px',
            height: '46px',
            borderRadius: '50%',
            backgroundColor:
              'rgba(239, 68, 68, 0.15)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          <AlertCircle
            size={26}
            color="var(--accent-red, #f87171)"
          />
        </div>

        <h2
          style={{
            margin: 0,
            fontSize: '1.0625rem',
            fontWeight: 600,
            color: '#fca5a5'
          }}
        >
          Analytics Service Unavailable
        </h2>

        <p
          style={{
            margin: 0,
            fontSize: '0.8125rem',
            color:
              'var(--accent-red, #f87171)',
            maxWidth: '480px',
            lineHeight: 1.5
          }}
        >
          {errorMessage ||
            'Failed to retrieve overview metrics from backend.'}
        </p>

        <button
          onClick={fetchDashboardData}
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
          Retry Connection
        </button>
      </div>
    );
  }

  // ==========================================
  // DASHBOARD
  // ==========================================

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
      {/* ========================================
          TOP BANNER
      ======================================== */}

      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '12px',
          paddingBottom: '12px',
          borderBottom:
            '1px solid var(--border-color, #1e293b)'
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}
        >
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
              backgroundColor:
                'rgba(99, 102, 241, 0.12)',
              color:
                'var(--accent-blue, #818cf8)',
              border:
                '1px solid rgba(99, 102, 241, 0.25)'
            }}
          >
            <Sparkles size={12} />
            Backend API Data
          </span>

          <span
            style={{
              fontSize: '0.8125rem',
              color:
                'var(--text-secondary, #94a3b8)'
            }}
          >
            Backend prototype analytics calculated from synthetic placement data
          </span>
        </div>

        <button
          onClick={fetchDashboardData}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            backgroundColor:
              'var(--bg-sidebar, #0f172a)',
            color:
              'var(--text-secondary, #94a3b8)',
            border:
              '1px solid var(--border-color, #334155)',
            borderRadius: '8px',
            padding: '6px 12px',
            fontSize: '0.75rem',
            fontWeight: 600,
            cursor: 'pointer'
          }}
        >
          <RefreshCw size={12} />
          <span>Sync Data</span>
        </button>
      </div>

      {/* ========================================
          1. METRIC CARDS
      ======================================== */}

      <div
        style={{
          display: 'grid',
          gridTemplateColumns:
            'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '16px'
        }}
      >
        <MetricCard
          title="Total Students Placed"
          value={`${overviewData.placedStudents || 0} / ${
            overviewData.totalStudents || 0
          }`}
          trend={`${
            overviewData.placementRate || 0
          }% overall placement rate`}
          trendPositive={
            Number(overviewData.placementRate) >= 60
          }
          icon={Users}
        />

        <MetricCard
          title="Total Offers"
          value={overviewData.totalOffers || 0}
          trend={`${
            overviewData.acceptedOffers || 0
          } accepted offers`}
          trendPositive={true}
          icon={Briefcase}
        />

        <MetricCard
          title="Average Package"
          value={
            overviewData.averagePackageLPA || '—'
          }
          trend={`Highest: ${
            overviewData.highestPackageLPA || '—'
          }`}
          trendPositive={true}
          icon={Award}
        />

        <MetricCard
          title="Active Drives"
          value={
            overviewData.activePlacementDrives || 0
          }
          trend={`${
            overviewData.joiningConfirmedOffers || 0
          } confirmations`}
          trendPositive={true}
          icon={TrendingUp}
        />
      </div>

      {/* ========================================
          2. CHARTS
      ======================================== */}

      <div
        style={{
          display: 'grid',
          gridTemplateColumns:
            'repeat(auto-fit, minmax(360px, 1fr))',
          gap: '20px'
        }}
      >
        {/* IMPORTANT:
            Chart components expect prop name "data"
        */}
        <BranchConversionChart data={branchData} />

        <SalaryTrendChart data={packageData} />
      </div>

      {/* ========================================
          3. ACTIVE DRIVES + RECENT ACTIVITIES
      ======================================== */}

      <div
        style={{
          display: 'grid',
          gridTemplateColumns:
            'repeat(auto-fit, minmax(360px, 1fr))',
          gap: '20px'
        }}
      >
        <ActiveDrivesList
          drives={drivesData}
          searchTerm={searchTerm}
        />

        <RecentActivities
          activities={recentActivities}
        />
      </div>

      {/* ========================================
          4. PROTOTYPE DISCLAIMER
      ======================================== */}

      <div
        style={{
          padding: '12px 16px',
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
          Prototype evaluation dashboard. Statistics are
          computed by backend placement services using
          synthetic campus data, not live institutional data.
        </p>
      </div>
    </div>
  );
}

/*
 * Fallback historical salary dataset.
 *
 * The current backend /analytics/packages endpoint
 * provides package distribution rather than yearly
 * historical trend points.
 *
 * SalaryTrendChart requires:
 * year + avg + highest + isProjection.
 *
 * Therefore this preserves the already-existing
 * dashboard demonstration trend when the backend
 * does not provide historical yearly data.
 */
function getFallbackSalaryTrendData() {
  return [
    {
      year: '2021',
      avg: 5.2,
      median: 4.8,
      highest: 24.0,
      isProjection: false
    },
    {
      year: '2022',
      avg: 6.1,
      median: 5.5,
      highest: 32.0,
      isProjection: false
    },
    {
      year: '2023',
      avg: 7.2,
      median: 6.4,
      highest: 38.5,
      isProjection: false
    },
    {
      year: '2024',
      avg: 7.9,
      median: 7.0,
      highest: 42.0,
      isProjection: false
    },
    {
      year: '2025',
      avg: 8.4,
      median: 7.5,
      highest: 44.0,
      isProjection: false
    },
    {
      year: '2026 (Proj.)',
      avg: 9.1,
      median: 8.0,
      highest: 48.0,
      isProjection: true
    }
  ];
}