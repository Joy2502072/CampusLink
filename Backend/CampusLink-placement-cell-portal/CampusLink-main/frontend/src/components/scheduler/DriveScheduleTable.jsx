import React, { useState } from 'react';
import {
  Filter,
  ArrowUpDown,
  ChevronRight,
  MapPin,
  Calendar,
  Clock
} from 'lucide-react';
import ConflictBadge from './ConflictBadge';

export default function DriveScheduleTable({
  drives,
  campusVenues,
  onSelectDrive
}) {
  const [filterDate, setFilterDate] = useState('All');
  const [filterVenue, setFilterVenue] = useState('All');
  const [filterConflict, setFilterConflict] = useState('All');
  const [filterStatus, setFilterStatus] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortField, setSortField] = useState('date');
  const [sortOrder, setSortOrder] = useState('asc');

  const availableDates = [
    'All',
    ...new Set(drives.map((drive) => drive.date).filter(Boolean))
  ].sort();

  const conflictOptions = [
    'All',
    'Critical',
    'High',
    'Medium',
    'No Conflict'
  ];

  const statusOptions = [
    'All',
    ...new Set(drives.map((drive) => drive.status).filter(Boolean))
  ];

  const filteredDrives = drives.filter((drive) => {
    const matchDate =
      filterDate === 'All' ||
      drive.date === filterDate;

    const matchVenue =
      filterVenue === 'All' ||
      drive.venue === filterVenue;

    const matchConflict =
      filterConflict === 'All' ||
      (filterConflict === 'No Conflict'
        ? !drive.hasConflict
        : drive.conflictSeverity === filterConflict);

    const matchStatus =
      filterStatus === 'All' ||
      drive.status === filterStatus;

    const query = searchQuery.trim().toLowerCase();

    const matchSearch =
      query === '' ||
      (drive.company || '').toLowerCase().includes(query) ||
      (drive.role || '').toLowerCase().includes(query) ||
      (drive.driveId || '').toLowerCase().includes(query);

    return (
      matchDate &&
      matchVenue &&
      matchConflict &&
      matchStatus &&
      matchSearch
    );
  });

  const sortedDrives = [...filteredDrives].sort((a, b) => {
    let aVal = a[sortField];
    let bVal = b[sortField];

    if (sortField === 'time') {
      aVal = a.startTime;
      bVal = b.startTime;
    }

    aVal = aVal || '';
    bVal = bVal || '';

    if (sortOrder === 'asc') {
      return aVal > bVal ? 1 : aVal < bVal ? -1 : 0;
    }

    return aVal < bVal ? 1 : aVal > bVal ? -1 : 0;
  });

  const toggleSort = (field) => {
    if (sortField === field) {
      setSortOrder(
        sortOrder === 'asc' ? 'desc' : 'asc'
      );
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  };

  return (
    <div
      style={{
        backgroundColor: 'var(--bg-card)',
        border: '1px solid var(--border-color)',
        borderRadius: '14px',
        padding: '22px',
        display: 'flex',
        flexDirection: 'column',
        gap: '16px'
      }}
    >
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '12px'
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            flexWrap: 'wrap'
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              fontSize: '0.78rem',
              color: 'var(--text-muted)'
            }}
          >
            <Filter size={14} />
            <span>Filters:</span>
          </div>

          <select
            value={filterDate}
            onChange={(e) => setFilterDate(e.target.value)}
            style={selectStyle}
          >
            {availableDates.map((date) => (
              <option
                key={date}
                value={date}
                style={optionStyle}
              >
                Date: {date}
              </option>
            ))}
          </select>

          <select
            value={filterVenue}
            onChange={(e) => setFilterVenue(e.target.value)}
            style={selectStyle}
          >
            <option value="All" style={optionStyle}>
              All Venues
            </option>

            {campusVenues.map((venue) => (
              <option
                key={venue}
                value={venue}
                style={optionStyle}
              >
                {venue}
              </option>
            ))}
          </select>

          <select
            value={filterConflict}
            onChange={(e) =>
              setFilterConflict(e.target.value)
            }
            style={selectStyle}
          >
            {conflictOptions.map((conflict) => (
              <option
                key={conflict}
                value={conflict}
                style={optionStyle}
              >
                Conflict: {conflict}
              </option>
            ))}
          </select>

          <select
            value={filterStatus}
            onChange={(e) =>
              setFilterStatus(e.target.value)
            }
            style={selectStyle}
          >
            {statusOptions.map((status) => (
              <option
                key={status}
                value={status}
                style={optionStyle}
              >
                Status: {status}
              </option>
            ))}
          </select>
        </div>

        <input
          type="search"
          placeholder="Search company or role..."
          value={searchQuery}
          onChange={(e) =>
            setSearchQuery(e.target.value)
          }
          style={{
            ...selectStyle,
            minWidth: '220px'
          }}
        />
      </div>

      <div style={{ overflowX: 'auto' }}>
        <table
          style={{
            width: '100%',
            borderCollapse: 'collapse',
            textAlign: 'left',
            minWidth: '850px'
          }}
        >
          <thead>
            <tr
              style={{
                borderBottom:
                  '1px solid var(--border-color)',
                fontSize: '0.72rem',
                color: 'var(--text-muted)',
                textTransform: 'uppercase',
                letterSpacing: '0.05em'
              }}
            >
              <th style={thStyle}>Company &amp; Role</th>

              <th style={thStyle}>
                <SortButton
                  label="Date"
                  active={sortField === 'date'}
                  order={sortOrder}
                  onClick={() => toggleSort('date')}
                />
              </th>

              <th style={thStyle}>
                <SortButton
                  label="Timing"
                  active={sortField === 'time'}
                  order={sortOrder}
                  onClick={() => toggleSort('time')}
                />
              </th>

              <th style={thStyle}>Venue</th>
              <th style={thStyle}>Eligible Branches</th>
              <th style={thStyle}>Status</th>
              <th style={thStyle}>Conflict</th>
              <th style={{ ...thStyle, textAlign: 'right' }}>
                Actions
              </th>
            </tr>
          </thead>

          <tbody>
            {sortedDrives.length === 0 ? (
              <tr>
                <td
                  colSpan="8"
                  style={{
                    padding: '32px',
                    textAlign: 'center',
                    color: 'var(--text-muted)',
                    fontSize: '0.82rem'
                  }}
                >
                  No placement drive slots match the
                  current filter selection.
                </td>
              </tr>
            ) : (
              sortedDrives.map((drive) => (
                <tr
                  key={drive.driveId}
                  style={{
                    borderBottom:
                      '1px solid rgba(255, 255, 255, 0.04)',
                    fontSize: '0.8rem'
                  }}
                >
                  <td style={tdStyle}>
                    <div
                      style={{
                        fontWeight: 700,
                        color: '#ffffff'
                      }}
                    >
                      {drive.company}
                    </div>

                    <div
                      style={{
                        fontSize: '0.72rem',
                        color: 'var(--text-secondary)'
                      }}
                    >
                      {drive.role} •{' '}
                      <span style={{ color: 'var(--text-muted)' }}>
                        {drive.driveId}
                      </span>
                    </div>
                  </td>

                  <td style={tdStyle}>
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '5px',
                        whiteSpace: 'nowrap'
                      }}
                    >
                      <Calendar
                        size={13}
                        color="var(--text-muted)"
                      />
                      {drive.date}
                    </div>
                  </td>

                  <td style={tdStyle}>
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '5px',
                        whiteSpace: 'nowrap'
                      }}
                    >
                      <Clock
                        size={13}
                        color="var(--text-muted)"
                      />
                      {drive.startTime}–{drive.endTime}
                    </div>
                  </td>

                  <td style={tdStyle}>
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '5px',
                        whiteSpace: 'nowrap'
                      }}
                    >
                      <MapPin
                        size={13}
                        color="var(--accent-blue)"
                      />
                      {drive.venue}
                    </div>
                  </td>

                  <td style={tdStyle}>
                    <div
                      style={{
                        display: 'flex',
                        flexWrap: 'wrap',
                        gap: '4px'
                      }}
                    >
                      {(drive.eligibleBranches || []).map(
                        (branch) => (
                          <span
                            key={branch}
                            style={{
                              fontSize: '0.66rem',
                              padding: '1px 5px',
                              borderRadius: '3px',
                              backgroundColor:
                                'rgba(255, 255, 255, 0.05)',
                              color:
                                'var(--text-secondary)'
                            }}
                          >
                            {branch}
                          </span>
                        )
                      )}
                    </div>
                  </td>

                  <td style={tdStyle}>
                    <span
                      style={{
                        fontSize: '0.68rem',
                        fontWeight: 600,
                        padding: '2px 8px',
                        borderRadius: '4px',
                        backgroundColor:
                          drive.status === 'Confirmed'
                            ? 'var(--accent-emerald-soft)'
                            : 'rgba(255, 255, 255, 0.05)',
                        color:
                          drive.status === 'Confirmed'
                            ? 'var(--accent-emerald)'
                            : 'var(--text-secondary)'
                      }}
                    >
                      {drive.status}
                    </span>
                  </td>

                  <td style={tdStyle}>
                    <ConflictBadge
                      severity={drive.conflictSeverity}
                    />
                  </td>

                  <td
                    style={{
                      ...tdStyle,
                      textAlign: 'right'
                    }}
                  >
                    <button
                      type="button"
                      onClick={() =>
                        onSelectDrive(drive)
                      }
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '4px',
                        backgroundColor:
                          'rgba(59, 130, 246, 0.12)',
                        color: 'var(--accent-blue)',
                        padding: '5px 10px',
                        borderRadius: '6px',
                        fontSize: '0.74rem',
                        fontWeight: 600
                      }}
                    >
                      Details
                      <ChevronRight size={13} />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          fontSize: '0.72rem',
          color: 'var(--text-muted)',
          borderTop: '1px solid var(--border-color)',
          paddingTop: '12px',
          flexWrap: 'wrap',
          gap: '8px'
        }}
      >
        <span>
          Displaying {sortedDrives.length} of{' '}
          {drives.length} total scheduled drives
        </span>

        <span>
          Active sort:{' '}
          <strong style={{ color: 'var(--text-secondary)' }}>
            {sortField}
          </strong>{' '}
          ({sortOrder.toUpperCase()})
        </span>
      </div>
    </div>
  );
}

const selectStyle = {
  backgroundColor: 'rgba(15, 23, 42, 0.6)',
  border: '1px solid var(--border-color)',
  color: 'var(--text-primary)',
  borderRadius: '6px',
  padding: '6px 10px',
  fontSize: '0.74rem',
  outline: 'none'
};

const optionStyle = {
  backgroundColor: '#1e293b'
};

const thStyle = {
  padding: '12px 10px'
};

const tdStyle = {
  padding: '12px 10px',
  color: 'var(--text-secondary)'
};

function SortButton({
  label,
  active,
  order,
  onClick
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '4px',
        color: active
          ? 'var(--accent-blue)'
          : 'inherit',
        fontWeight: 'inherit',
        fontSize: 'inherit',
        textTransform: 'inherit',
        letterSpacing: 'inherit'
      }}
    >
      {label}
      <ArrowUpDown size={12} />
    </button>
  );
}