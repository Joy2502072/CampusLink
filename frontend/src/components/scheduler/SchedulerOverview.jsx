import React, { useState, useMemo } from 'react';
import SchedulerStats from './SchedulerStats';
import DriveScheduleTable from './DriveScheduleTable';
import DriveDetails from './DriveDetails';
import { 
  rawDriveSchedules, 
  campusVenues, 
  detectScheduleConflicts 
} from '../../data/mockPlacementData';
import { Info, PlusCircle, Download } from 'lucide-react';

export default function SchedulerOverview() {
  const [selectedDrive, setSelectedDrive] = useState(null);
  const [toastMessage, setToastMessage] = useState(null);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  };

  // Dynamically calculate conflicts across all schedule records
  const analyzedDrives = useMemo(() => {
    return detectScheduleConflicts(rawDriveSchedules);
  }, []);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '22px' }}>
      {/* Toast Alert Feedback */}
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
            zIndex: 70
          }}
        >
          {toastMessage}
        </div>
      )}

      {/* Synthetic Demo Disclaimer Banner */}
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
          <strong style={{ color: '#ffffff' }}>DEMO / SYNTHETIC DATA:</strong> Placement drive schedules and conflict matrices shown are evaluated dynamically using a deterministic rule engine. No actual campus bookings are made in this demo sandbox.
        </p>
      </div>

      {/* Page Heading & Actions */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '14px'
      }}>
        <div>
          <h2 style={{ fontSize: '1.45rem', fontWeight: 800, color: '#ffffff', letterSpacing: '-0.02em' }}>
            Placement Drive Scheduler &amp; Conflict Management
          </h2>
          <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
            Prevent venue double-bookings, hardware contention, and student cohort overlaps with automated calendar arbitration.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          <button
            type="button"
            onClick={() => showToast("Demo control: Master placement calendar exported to simulated iCal/ICS file.")}
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
            Export Calendar (Demo)
          </button>

          <button
            type="button"
            onClick={() => showToast("Demo control: Schedule Slot Creation Wizard scheduled for backend Phase 4.")}
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
            Schedule New Drive (Demo)
          </button>
        </div>
      </div>

      {/* Scheduler High-Level Stats */}
      <SchedulerStats
        drives={analyzedDrives}
        campusVenues={campusVenues}
      />

      {/* Interactive Master Schedule Table */}
      <DriveScheduleTable
        drives={analyzedDrives}
        campusVenues={campusVenues}
        onSelectDrive={(drive) => setSelectedDrive(drive)}
      />

      {/* Slide-out Drawer for Drive Details & Resolution */}
      {selectedDrive && (
        <DriveDetails
          drive={selectedDrive}
          allDrives={analyzedDrives}
          onClose={() => setSelectedDrive(null)}
          onActionTrigger={(msg) => {
            showToast(msg);
            setSelectedDrive(null);
          }}
        />
      )}
    </div>
  );
}