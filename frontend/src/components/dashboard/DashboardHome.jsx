import React, { useState } from 'react';
import MetricCard from './MetricCard';
import BranchConversionChart from './BranchConversionChart';
import SalaryTrendChart from './SalaryTrendChart';
import ActiveDrivesList from './ActiveDrivesList';
import RecentActivities from './RecentActivities';
import { 
  Users, 
  Briefcase, 
  CheckCircle, 
  Percent, 
  Download, 
  PlusCircle, 
  Info 
} from 'lucide-react';
import {
  placementOverviewStats,
  branchWiseConversion,
  salaryTrends,
  activePlacementDrives,
  recentActivities
} from '../../data/mockPlacementData';

export default function DashboardHome({ searchTerm = '' }) {
  const [toastMessage, setToastMessage] = useState(null);

  const showDemoToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3500);
  };

  // Client-side search filter against synthetic mock records
  const query = searchTerm.trim().toLowerCase();

  const filteredDrives = activePlacementDrives.filter(drive =>
    drive.company.toLowerCase().includes(query) ||
    drive.role.toLowerCase().includes(query) ||
    drive.eligibility.toLowerCase().includes(query)
  );

  const filteredActivities = recentActivities.filter(act =>
    act.studentName.toLowerCase().includes(query) ||
    act.syntheticId.toLowerCase().includes(query) ||
    act.company.toLowerCase().includes(query) ||
    act.branch.toLowerCase().includes(query)
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '22px' }}>
      {/* Toast notification for demo button interactions */}
      {toastMessage && (
        <div
          role="status"
          aria-live="polite"
          style={{
            position: 'fixed',
            bottom: '24px',
            right: '24px',
            backgroundColor: '#1e293b',
            border: '1px solid var(--accent-blue)',
            color: '#f8fafc',
            padding: '12px 18px',
            borderRadius: '8px',
            boxShadow: '0 10px 25px rgba(0,0,0,0.5)',
            fontSize: '0.82rem',
            zIndex: 50
          }}
        >
          {toastMessage}
        </div>
      )}

      {/* Synthetic Demo Data Disclaimer Banner */}
      <div style={{
        backgroundColor: 'rgba(59, 130, 246, 0.08)',
        border: '1px solid rgba(59, 130, 246, 0.25)',
        borderRadius: '10px',
        padding: '10px 16px',
        display: 'flex',
        alignItems: 'center',
        gap: '10px'
      }}>
        <Info size={16} color="var(--accent-blue)" style={{ flexShrink: 0 }} aria-hidden="true" />
        <p style={{ fontSize: '0.76rem', color: 'var(--text-secondary)' }}>
          <strong style={{ color: '#ffffff' }}>DEMO DATA MODE:</strong> All figures, company names, student identifiers (e.g., DEMO-STU-XXX), and compensation listings shown are synthetic and simulated for hackathon review.
        </p>
      </div>

      {/* Top Banner & Demo Controls */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '14px'
      }}>
        <div>
          <h2 style={{ fontSize: '1.45rem', fontWeight: 800, color: '#ffffff', letterSpacing: '-0.02em' }}>
            Placement Cell Command Center
          </h2>
          <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
            Curated Demo Overview • Session {placementOverviewStats.batchYear} (Static Mock Simulation)
          </p>
        </div>

        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          <button
            type="button"
            onClick={() => showDemoToast("Demo control: Export feature will interface with report generator API in Phase 2.")}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              backgroundColor: 'var(--bg-card)',
              border: '1px solid var(--border-color)',
              color: 'var(--text-primary)',
              padding: '8px 12px',
              borderRadius: '8px',
              fontSize: '0.78rem',
              fontWeight: 600
            }}
          >
            <Download size={14} aria-hidden="true" />
            Export T&P Report (Demo)
          </button>

          <button
            type="button"
            onClick={() => showDemoToast("Demo control: Placement Drive creation modal scheduled for Scheduler module.")}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              background: 'linear-gradient(135deg, #2563eb, #3b82f6)',
              color: '#ffffff',
              padding: '8px 14px',
              borderRadius: '8px',
              fontSize: '0.78rem',
              fontWeight: 600,
              boxShadow: '0 4px 12px rgba(37, 99, 235, 0.35)'
            }}
          >
            <PlusCircle size={14} aria-hidden="true" />
            Initiate New Drive (Demo)
          </button>
        </div>
      </div>

      {/* Primary KPI Cards */}
      <div className="dashboard-grid-cards">
        <MetricCard
          title="Total Registered Students"
          value={placementOverviewStats.totalStudents.toLocaleString()}
          subtext="Graduating batch of 2026"
          trend="+8.2% YoY"
          icon={Users}
          colorScheme="blue"
        />
        <MetricCard
          title="Active Placement Drives"
          value={placementOverviewStats.activeDrives}
          subtext="4 in final interview rounds"
          trend="Current Cohort"
          icon={Briefcase}
          colorScheme="amber"
        />
        <MetricCard
          title="Students Placed"
          value={placementOverviewStats.studentsPlaced.toLocaleString()}
          subtext="Unique job offers registered"
          trend="+14% vs 2025"
          icon={CheckCircle}
          colorScheme="emerald"
        />
        <MetricCard
          title="Placement / Conversion Rate"
          value={`${placementOverviewStats.placementRate}%`}
          subtext={`Avg CTC: ₹${placementOverviewStats.averagePackage} LPA`}
          trend="Max: ₹44 LPA"
          icon={Percent}
          colorScheme="violet"
        />
      </div>

      {/* Visual Analytics Row */}
      <div className="dashboard-grid-dual">
        <BranchConversionChart data={branchWiseConversion} />
        <SalaryTrendChart data={salaryTrends} />
      </div>

      {/* Feeds & Drives Row */}
      <div className="dashboard-grid-dual">
        <ActiveDrivesList drives={filteredDrives} />
        <RecentActivities activities={filteredActivities} />
      </div>
    </div>
  );
}