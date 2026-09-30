import React, { useState, useEffect, useCallback } from 'react';
import {
  Users,
  Briefcase,
  TrendingUp,
  FileCheck2,
  AlertCircle,
  RefreshCw,
  Database
} from 'lucide-react';
import MetricCard from './MetricCard';
import SalaryTrendChart from './SalaryTrendChart';
import BranchConversionChart from './BranchConversionChart';
import RecentActivities from './RecentActivities';
import ActiveDrivesList from './ActiveDrivesList';

const API_BASE_URL = 'http://localhost:5000/api';

const HEADERS = {
  'Content-Type': 'application/json',
  'X-Demo-User-Role': 'placement_officer'
};

function formatAveragePackageDisplay(val) {
  if (val === null || val === undefined || val === '') return '--';
  const str = String(val).trim();
  if (/lpa$/i.test(str)) {
    return str;
  }
  return `${str} LPA`;
}

export default function DashboardHome() {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  // Real backend analytics and operational datasets
  const [overview, setOverview] = useState(null);
  const [branches, setBranches] = useState([]);
  const [packages, setPackages] = useState(null);
  const [drives, setDrives] = useState([]);
  const [offers, setOffers] = useState([]);

  // Per-section error tracking for resilient UI degradation
  const [sectionErrors, setSectionErrors] = useState({
    overview: false,
    branches: false,
    packages: false,
    drives: false,
    offers: false
  });

  const fetchDashboardData = useCallback(async () => {
    setError(null);
    const newSectionErrors = {
      overview: false,
      branches: false,
      packages: false,
      drives: false,
      offers: false
    };

    try {
      const [
        overviewRes,
        branchesRes,
        packagesRes,
        drivesRes,
        offersRes
      ] = await Promise.allSettled([
        fetch(`${API_BASE_URL}/analytics/overview`, { headers: HEADERS }),
        fetch(`${API_BASE_URL}/analytics/branches`, { headers: HEADERS }),
        fetch(`${API_BASE_URL}/analytics/packages`, { headers: HEADERS }),
        fetch(`${API_BASE_URL}/drives`, { headers: HEADERS }),
        fetch(`${API_BASE_URL}/offers`, { headers: HEADERS })
      ]);

      // Process Overview
      if (overviewRes.status === 'fulfilled' && overviewRes.value.ok) {
        const json = await overviewRes.value.json();
        setOverview(json.data || json);
      } else {
        newSectionErrors.overview = true;
      }

      // Process Branches
      if (branchesRes.status === 'fulfilled' && branchesRes.value.ok) {
        const json = await branchesRes.value.json();
        setBranches(json.data || json || []);
      } else {
        newSectionErrors.branches = true;
      }

      // Process Packages
      if (packagesRes.status === 'fulfilled' && packagesRes.value.ok) {
        const json = await packagesRes.value.json();
        setPackages(json.data || json || null);
      } else {
        newSectionErrors.packages = true;
      }

      // Process Drives
      if (drivesRes.status === 'fulfilled' && drivesRes.value.ok) {
        const json = await drivesRes.value.json();
        setDrives(json.data || json || []);
      } else {
        newSectionErrors.drives = true;
      }

      // Process Offers
      if (offersRes.status === 'fulfilled' && offersRes.value.ok) {
        const json = await offersRes.value.json();
        setOffers(json.data || json || []);
      } else {
        newSectionErrors.offers = true;
      }

      setSectionErrors(newSectionErrors);

      // If all endpoints failed, set a general error
      const allFailed = Object.values(newSectionErrors).every(Boolean);
      if (allFailed) {
        setError('Unable to connect to the backend API. Please ensure the server is running on port 5000.');
      }
    } catch (err) {
      setError(err.message || 'An error occurred while fetching dashboard metrics.');
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

  return (
    <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Top Header & Refresh Control */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <h1 style={{ margin: 0, fontSize: '1.65rem', fontWeight: 800, color: 'var(--text-primary, #ffffff)', letterSpacing: '-0.02em' }}>
              Placement Cell Intelligence
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
              Live MySQL Data
            </span>
          </div>
          <p style={{ margin: '6px 0 0 0', fontSize: '0.875rem', color: 'var(--text-secondary, #94a3b8)' }}>
            Institutional metrics and active recruitment tracking powered by real database persistence
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
          {refreshing ? 'Refreshing...' : 'Refresh Metrics'}
        </button>
      </div>

      {/* Global Error Banner */}
      {error && (
        <div
          style={{
            padding: '14px 18px',
            borderRadius: '8px',
            backgroundColor: 'rgba(239, 68, 68, 0.12)',
            border: '1px solid rgba(239, 68, 68, 0.3)',
            color: '#f87171',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            fontSize: '0.875rem'
          }}
        >
          <AlertCircle size={20} />
          <span>{error}</span>
        </div>
      )}

      {/* Metric Cards Grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
          gap: '16px'
        }}
      >
        <MetricCard
          title="Placement Rate"
          value={sectionErrors.overview ? 'Unavailable' : overview ? `${overview.placementRate ?? 0}%` : '--'}
          subtitle={
            overview && !sectionErrors.overview
              ? `${overview.placedStudents ?? overview.totalPlaced ?? 0} of ${overview.totalStudents ?? 0} students placed`
              : 'Placement conversion metric'
          }
          icon={TrendingUp}
          color="emerald"
          loading={loading}
        />

        <MetricCard
          title="Total Offers"
          value={sectionErrors.overview ? 'Unavailable' : overview ? (overview.totalOffers ?? 0) : '--'}
          subtitle={
            overview && !sectionErrors.overview
              ? `${overview.acceptedOffers ?? 0} accepted · ${overview.joiningConfirmedOffers ?? 0} confirmed`
              : 'Cumulative offers extended'
          }
          icon={FileCheck2}
          color="blue"
          loading={loading}
        />

        <MetricCard
          title="Average Package"
          value={
            sectionErrors.overview
              ? 'Unavailable'
              : overview
              ? formatAveragePackageDisplay(
                  overview.averagePackageLPA || overview.averagePackage || overview.averagePackageNumeric || overview.averageNumeric
                )
              : '--'
          }
          subtitle={
            overview && !sectionErrors.overview
              ? `Highest: ${overview.highestPackageLPA || overview.highestPackage || '0 LPA'}`
              : 'Across all active offers'
          }
          icon={Users}
          color="indigo"
          loading={loading}
        />

        <MetricCard
          title="Active Drives"
          value={
            sectionErrors.overview
              ? 'Unavailable'
              : overview
              ? (overview.activePlacementDrives ?? overview.activeDrives ?? drives.length)
              : '--'
          }
          subtitle="Recruitment drives in pipeline"
          icon={Briefcase}
          color="amber"
          loading={loading}
        />
      </div>

      {/* Charts Grid: Package Distribution & Branch Conversion */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(420px, 1fr))',
          gap: '20px'
        }}
      >
        {sectionErrors.packages ? (
          <div
            style={{
              padding: '32px',
              backgroundColor: 'var(--bg-card, #0f172a)',
              borderRadius: '12px',
              border: '1px solid var(--border-color, #1e293b)',
              textAlign: 'center',
              color: 'var(--text-muted, #64748b)'
            }}
          >
            <AlertCircle size={28} style={{ margin: '0 auto 10px', color: '#f87171' }} />
            <p style={{ margin: 0, fontWeight: 600 }}>Package Distribution Data Unavailable</p>
            <p style={{ margin: '4px 0 0 0', fontSize: '0.75rem' }}>Failed to retrieve package distribution from API.</p>
          </div>
        ) : (
          <SalaryTrendChart packageData={packages} loading={loading} />
        )}

        {sectionErrors.branches ? (
          <div
            style={{
              padding: '32px',
              backgroundColor: 'var(--bg-card, #0f172a)',
              borderRadius: '12px',
              border: '1px solid var(--border-color, #1e293b)',
              textAlign: 'center',
              color: 'var(--text-muted, #64748b)'
            }}
          >
            <AlertCircle size={28} style={{ margin: '0 auto 10px', color: '#f87171' }} />
            <p style={{ margin: 0, fontWeight: 600 }}>Branch Conversion Data Unavailable</p>
            <p style={{ margin: '4px 0 0 0', fontSize: '0.75rem' }}>Failed to retrieve department metrics from API.</p>
          </div>
        ) : (
          <BranchConversionChart data={branches} loading={loading} />
        )}
      </div>

      {/* Operational Feeds: Active Drives & Recent Activities */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(420px, 1fr))',
          gap: '20px'
        }}
      >
        {sectionErrors.drives ? (
          <div
            style={{
              padding: '32px',
              backgroundColor: 'var(--bg-card, #0f172a)',
              borderRadius: '12px',
              border: '1px solid var(--border-color, #1e293b)',
              textAlign: 'center',
              color: 'var(--text-muted, #64748b)'
            }}
          >
            <AlertCircle size={28} style={{ margin: '0 auto 10px', color: '#f87171' }} />
            <p style={{ margin: 0, fontWeight: 600 }}>Active Drives Unavailable</p>
            <p style={{ margin: '4px 0 0 0', fontSize: '0.75rem' }}>Could not load placement drives list from backend.</p>
          </div>
        ) : (
          <ActiveDrivesList drives={drives} loading={loading} />
        )}

        {sectionErrors.offers ? (
          <div
            style={{
              padding: '32px',
              backgroundColor: 'var(--bg-card, #0f172a)',
              borderRadius: '12px',
              border: '1px solid var(--border-color, #1e293b)',
              textAlign: 'center',
              color: 'var(--text-muted, #64748b)'
            }}
          >
            <AlertCircle size={28} style={{ margin: '0 auto 10px', color: '#f87171' }} />
            <p style={{ margin: 0, fontWeight: 600 }}>Recent Activity Feed Unavailable</p>
            <p style={{ margin: '4px 0 0 0', fontSize: '0.75rem' }}>Could not load placement offers from database.</p>
          </div>
        ) : (
          <RecentActivities offers={offers} loading={loading} />
        )}
      </div>
    </div>
  );
}