import React, { useEffect, useMemo, useState } from 'react';
import SchedulerStats from './SchedulerStats';
import DriveScheduleTable from './DriveScheduleTable';
import DriveDetails from './DriveDetails';
import { Info, PlusCircle, Download, RefreshCw } from 'lucide-react';

const API_BASE = 'http://localhost:5000/api';

const API_HEADERS = {
  'X-Demo-User-Role': 'placement_officer'
};

const CAMPUS_VENUES = [
  'Seminar Hall A',
  'Seminar Hall B',
  'Auditorium 1',
  'Computer Lab 1',
  'Computer Lab 2',
  'Placement Interview Suite',
  'Placement Cell Boardroom',
  'Auditorium Stage',
  'Lab 2 (60 systems)'
];

const severityWeight = {
  Critical: 3,
  High: 2,
  Medium: 1,
  'No Conflict': 0
};

export default function SchedulerOverview() {
  const [drives, setDrives] = useState([]);
  const [conflicts, setConflicts] = useState([]);
  const [summary, setSummary] = useState(null);
  const [selectedDrive, setSelectedDrive] = useState(null);

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [toastMessage, setToastMessage] = useState(null);

  const showToast = (msg) => {
    setToastMessage(msg);

    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  };

  const fetchSchedulerData = async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      setError(null);

      const [
        drivesResponse,
        conflictsResponse,
        summaryResponse
      ] = await Promise.all([
        fetch(`${API_BASE}/drives`, {
          headers: API_HEADERS
        }),
        fetch(`${API_BASE}/scheduler/conflicts`, {
          headers: API_HEADERS
        }),
        fetch(`${API_BASE}/scheduler/summary`, {
          headers: API_HEADERS
        })
      ]);

      if (!drivesResponse.ok) {
        throw new Error('Failed to fetch placement drives.');
      }

      if (!conflictsResponse.ok) {
        throw new Error('Failed to fetch scheduler conflicts.');
      }

      if (!summaryResponse.ok) {
        throw new Error('Failed to fetch scheduler summary.');
      }

      const drivesJson = await drivesResponse.json();
      const conflictsJson = await conflictsResponse.json();
      const summaryJson = await summaryResponse.json();

      const liveDrives = drivesJson?.data || [];
      const liveConflicts =
        conflictsJson?.data?.conflicts || [];
      const liveSummary =
        summaryJson?.data || null;

      /*
       * The placement_drives table contains basic drive information,
       * while drive_schedules contains the actual scheduled
       * date/time/venue.
       *
       * Fetch the scheduler record for every drive so the table
       * always displays the real scheduler data.
       */
      const scheduleResults = await Promise.all(
        liveDrives.map(async (drive) => {
          try {
            const response = await fetch(
              `${API_BASE}/scheduler/conflicts/${drive.id}`,
              {
                headers: API_HEADERS
              }
            );

            if (!response.ok) {
              return {
                driveId: drive.id,
                schedule: null
              };
            }

            const json = await response.json();

            return {
              driveId: drive.id,
              schedule:
                json?.data?.schedule?.[0] || null
            };
          } catch (scheduleError) {
            console.error(
              `Failed to fetch schedule for ${drive.id}:`,
              scheduleError
            );

            return {
              driveId: drive.id,
              schedule: null
            };
          }
        })
      );

      const scheduleMap = new Map(
        scheduleResults.map((item) => [
          item.driveId,
          item.schedule
        ])
      );

      /*
       * Merge placement drive data with the actual scheduler
       * schedule from MySQL.
       */
      const mergedDrives = liveDrives.map((drive) => {
        const schedule = scheduleMap.get(drive.id);

        return {
          ...drive,

          date:
            schedule?.date ||
            drive.date,

          startTime:
            schedule?.startTime ||
            drive.startTime,

          endTime:
            schedule?.endTime ||
            drive.endTime,

          venue:
            schedule?.venue ||
            drive.venue,

          requiredResources:
            schedule?.assignedResources ||
            drive.requiredResources ||
            drive.assignedResources ||
            []
        };
      });

      setDrives(mergedDrives);
      setConflicts(liveConflicts);
      setSummary(liveSummary);

      if (isRefresh) {
        showToast(
          'Scheduler data refreshed from MySQL.'
        );
      }
    } catch (err) {
      console.error(
        'Scheduler API error:',
        err
      );

      setError(
        err.message ||
          'Unable to load scheduler data.'
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchSchedulerData();
  }, []);

  const analyzedDrives = useMemo(() => {
    const conflictMap = new Map();

    conflicts.forEach((conflict) => {
      conflict.affectedDrives?.forEach(
        (affectedDrive) => {
          const driveId =
            affectedDrive.driveId;

          if (!conflictMap.has(driveId)) {
            conflictMap.set(driveId, []);
          }

          conflictMap
            .get(driveId)
            .push(conflict);
        }
      );
    });

    return drives.map((drive) => {
      const driveConflicts =
        conflictMap.get(drive.id) || [];

      let conflictSeverity =
        'No Conflict';

      driveConflicts.forEach((conflict) => {
        if (
          severityWeight[conflict.severity] >
          severityWeight[conflictSeverity]
        ) {
          conflictSeverity =
            conflict.severity;
        }
      });

      const conflictReasons =
        driveConflicts.map(
          (conflict) =>
            conflict.reason ||
            conflict.description
        );

      return {
        driveId: drive.id,
        company: drive.company,
        role: drive.role,
        date: drive.date,
        startTime: drive.startTime,
        endTime: drive.endTime,
        venue: drive.venue,

        eligibleBranches:
          drive.eligibleBranches || [],

        requiredResources:
          drive.requiredResources ||
          drive.assignedResources ||
          [],

        status: drive.status,
        packageLPA: drive.packageLPA,

        hasConflict:
          driveConflicts.length > 0,

        conflictSeverity,
        conflictReasons,

        conflictingDriveIds:
          driveConflicts.flatMap(
            (conflict) =>
              (conflict.affectedDrives || [])
                .filter(
                  (item) =>
                    item.driveId !==
                    drive.id
                )
                .map(
                  (item) =>
                    item.driveId
                )
          ),

        conflicts: driveConflicts
      };
    });
  }, [drives, conflicts]);

  const handleSelectDrive = (drive) => {
    setSelectedDrive(drive);
  };

  if (loading) {
    return (
      <div
        style={{
          minHeight: '300px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'var(--text-secondary)',
          fontSize: '0.9rem'
        }}
      >
        Loading live scheduler data from MySQL...
      </div>
    );
  }

  if (error) {
    return (
      <div
        style={{
          backgroundColor:
            'rgba(244, 63, 94, 0.08)',
          border:
            '1px solid rgba(244, 63, 94, 0.3)',
          borderRadius: '12px',
          padding: '20px',
          color: 'var(--text-secondary)'
        }}
      >
        <strong
          style={{ color: '#ffffff' }}
        >
          Scheduler data could not be loaded.
        </strong>

        <p
          style={{
            marginTop: '6px',
            fontSize: '0.8rem'
          }}
        >
          {error}
        </p>

        <button
          type="button"
          onClick={() =>
            fetchSchedulerData(true)
          }
          style={{
            marginTop: '12px',
            backgroundColor:
              'var(--accent-blue)',
            color: '#ffffff',
            padding: '8px 14px',
            borderRadius: '7px',
            fontSize: '0.78rem',
            fontWeight: 600
          }}
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '22px'
      }}
    >
      {toastMessage && (
        <div
          role="status"
          aria-live="polite"
          style={{
            position: 'fixed',
            bottom: '24px',
            right: '24px',
            backgroundColor: '#1e293b',
            border:
              '1px solid var(--accent-blue)',
            color: '#f8fafc',
            padding: '12px 18px',
            borderRadius: '8px',
            boxShadow:
              '0 10px 25px rgba(0,0,0,0.5)',
            fontSize: '0.82rem',
            zIndex: 70
          }}
        >
          {toastMessage}
        </div>
      )}

      <div
        style={{
          backgroundColor:
            'rgba(16, 185, 129, 0.08)',
          border:
            '1px solid rgba(16, 185, 129, 0.25)',
          borderRadius: '10px',
          padding: '10px 16px',
          display: 'flex',
          alignItems: 'center',
          gap: '10px'
        }}
      >
        <Info
          size={16}
          color="var(--accent-emerald)"
          style={{ flexShrink: 0 }}
        />

        <p
          style={{
            fontSize: '0.76rem',
            color: 'var(--text-secondary)'
          }}
        >
          <strong
            style={{ color: '#ffffff' }}
          >
            LIVE MYSQL DATA:
          </strong>{' '}
          Placement drive schedules and conflict
          analysis are loaded from the CampusLink
          backend and MySQL database.
        </p>
      </div>

      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '14px'
        }}
      >
        <div>
          <h2
            style={{
              fontSize: '1.45rem',
              fontWeight: 800,
              color: '#ffffff',
              letterSpacing: '-0.02em'
            }}
          >
            Placement Drive Scheduler &amp;
            Conflict Management
          </h2>

          <p
            style={{
              fontSize: '0.82rem',
              color: 'var(--text-secondary)',
              marginTop: '2px'
            }}
          >
            Prevent venue double-bookings,
            hardware contention, and student
            cohort overlaps with automated
            schedule analysis.
          </p>
        </div>

        <div
          style={{
            display: 'flex',
            gap: '10px',
            flexWrap: 'wrap'
          }}
        >
          <button
            type="button"
            onClick={() =>
              fetchSchedulerData(true)
            }
            disabled={refreshing}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              backgroundColor:
                'var(--bg-card)',
              border:
                '1px solid var(--border-color)',
              color: 'var(--text-primary)',
              padding: '8px 12px',
              borderRadius: '8px',
              fontSize: '0.78rem',
              fontWeight: 600,
              opacity: refreshing
                ? 0.6
                : 1
            }}
          >
            <RefreshCw size={14} />
            {refreshing
              ? 'Refreshing...'
              : 'Refresh Data'}
          </button>

          <button
            type="button"
            onClick={() =>
              showToast(
                'Calendar export is currently a prototype action.'
              )
            }
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              backgroundColor:
                'var(--bg-card)',
              border:
                '1px solid var(--border-color)',
              color: 'var(--text-primary)',
              padding: '8px 12px',
              borderRadius: '8px',
              fontSize: '0.78rem',
              fontWeight: 600
            }}
          >
            <Download size={14} />
            Export Calendar
          </button>

          <button
            type="button"
            onClick={() =>
              showToast(
                'New drive scheduling workflow is planned for the next backend phase.'
              )
            }
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              background:
                'linear-gradient(135deg, #2563eb, #3b82f6)',
              color: '#ffffff',
              padding: '8px 14px',
              borderRadius: '8px',
              fontSize: '0.78rem',
              fontWeight: 600,
              boxShadow:
                '0 4px 12px rgba(37, 99, 235, 0.35)'
            }}
          >
            <PlusCircle size={14} />
            Schedule New Drive
          </button>
        </div>
      </div>

      <SchedulerStats
        drives={analyzedDrives}
        campusVenues={CAMPUS_VENUES}
        summary={summary}
      />

      <DriveScheduleTable
        drives={analyzedDrives}
        campusVenues={CAMPUS_VENUES}
        onSelectDrive={handleSelectDrive}
      />

      {selectedDrive && (
        <DriveDetails
          drive={selectedDrive}
          allDrives={analyzedDrives}
          onClose={() =>
            setSelectedDrive(null)
          }
          onActionTrigger={(msg) => {
            showToast(msg);
          }}
        />
      )}
    </div>
  );
}