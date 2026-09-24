import React, { useState } from 'react';
import { Filter, ArrowUpDown, ChevronRight, MapPin, Calendar, Clock } from 'lucide-react';
import ConflictBadge from './ConflictBadge';

export default function DriveScheduleTable({ drives, campusVenues, onSelectDrive }) {
  const [filterDate, setFilterDate] = useState('All');
  const [filterVenue, setFilterVenue] = useState('All');
  const [filterConflict, setFilterConflict] = useState('All');
  const [filterStatus, setFilterStatus] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortField, setSortField] = useState('date');
  const [sortOrder, setSortOrder] = useState('asc');

  const availableDates = ['All', ...new Set(drives.map(d => d.date))].sort();
  const conflictOptions = ['All', 'Critical', 'High', 'Medium', 'No Conflict'];
  const statusOptions = ['All', 'Confirmed', 'Scheduled'];

  const filteredDrives = drives.filter((drive) => {
    const matchDate = filterDate === 'All' || drive.date === filterDate;
    const matchVenue = filterVenue === 'All' || drive.venue === filterVenue;
    const matchConflict =
      filterConflict === 'All' ||
      (filterConflict === 'No Conflict' ? !drive.hasConflict : drive.conflictSeverity === filterConflict);
    const matchStatus = filterStatus === 'All' || drive.status === filterStatus;

    const query = searchQuery.trim().toLowerCase();
    const matchSearch =
      query === '' ||
      drive.company.toLowerCase().includes(query) ||
      drive.role.toLowerCase().includes(query) ||
      drive.driveId.toLowerCase().includes(query);

    return matchDate && matchVenue && matchConflict && matchStatus && matchSearch;
  });

  const sortedDrives = [...filteredDrives].sort((a, b) => {
    let aVal = a[sortField];
    let bVal = b[sortField];

    if (sortField === 'time') {
      aVal = a.startTime;
      bVal = b.startTime;
    }

    if (sortOrder === 'asc') {
      return aVal > bVal ? 1 : -1;
    } else {
      return aVal < bVal ? 1 : -1;
    }
  });

  const toggleSort = (field) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  };

  return (
    <div style={{
      backgroundColor: 'var(--bg-card)',
      border: '1px solid var(--border-color)',
      borderRadius: '14px',
      padding: '22px',
      display: 'flex',
      flexDirection: 'column',
      gap: '16px'
    }}>
      {/* Search & Filter Header */}
      <div style={{
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '12px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.78rem', color: 'var(--text-muted)' }}>
            <Filter size={14} aria-hidden="true" />
            <span>Filters:</span>
          </div>

          <select
            aria-label="Filter schedule by Date"
            value={filterDate}
            onChange={(e) => setFilterDate(e.target.value)}
            style={{
              backgroundColor: 'rgba(15, 23, 42, 0.6)',
              border: '1px solid var(--border-color)',
              color: 'var(--text-primary)',
              borderRadius: '6px',
              padding: '6px 10px',
              fontSize: '0.74rem',
              outline: 'none'
            }}
          >
            {availableDates.map(d => (
              <option key={d} value={d} style={{ backgroundColor: '#1e293b' }}>
                Date: {d}
              </option>
            ))}
          </select>

          <select
            aria-label="Filter schedule by Venue"
            value={filterVenue}
            onChange={(e) => setFilterVenue(e.target.value)}
            style={{
              backgroundColor: 'rgba(15, 23, 42, 0.6)',
              border: '1px solid var(--border-color)',
              color: 'var(--text-primary)',
              borderRadius: '6px',
              padding: '6px 10px',
              fontSize: '0.74rem',
              outline: 'none'
            }}
          >
            <option value="All" style={{ backgroundColor: '#1e293b' }}>All Venues</option>
            {campusVenues.map(v => (
              <option key={v} value={v} style={{ backgroundColor: '#1e293b' }}>
                {v}
              </option>
            ))}
          </select>

          <select
            aria-label="Filter schedule by Conflict Status"
            value={filterConflict}
            onChange={(e) => setFilterConflict(e.target.value)}
            style={{
              backgroundColor: 'rgba(15, 23, 42, 0.6)',
              border: '1px solid var(--border-color)',
              color: 'var(--text-primary)',
              borderRadius: '6px',
              padding: '6px 10px',
              fontSize: '0.74rem',
              outline: 'none'
            }}
          >
            {conflictOptions.map(c => (
              <option key={c} value={c} style={{ backgroundColor: '#1e293b' }}>
                Conflict: {c}
              </option>
            ))}
          </select>

          <select
            aria-label="Filter schedule by Drive Status"
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            style={{
              backgroundColor: 'rgba(15, 23, 42, 0.6)',
              border: '1px solid var(--border-color)',
              color: 'var(--text-primary)',
              borderRadius: '6px',
              padding: '6px 10px',
              fontSize: '0.74rem',
              outline: 'none'
            }}
          >
            {statusOptions.map(s => (
              <option key={s} value={s} style={{ backgroundColor: '#1e293b' }}>
                Status: {s}
              </option>
            ))}
          </select>
        </div>

        <input
          type="search"
          placeholder="Search company or role..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          aria-label="Search schedule by company or role"
          style={{
            backgroundColor: 'rgba(15, 23, 42, 0.6)',
            border: '1px solid var(--border-color)',
            color: 'var(--text-primary)',
            borderRadius: '6px',
            padding: '6px 12px',
            fontSize: '0.76rem',
            outline: 'none',
            minWidth: '220px'
          }}
        />
      </div>

      {/* Schedule Table */}
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '780px' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--border-color)', fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              <th scope="col" style={{ padding: '12px 10px' }}>Company &amp; Role</th>
              
              <th scope="col" style={{ padding: '12px 10px' }}>
                <button
                  type="button"
                  onClick={() => toggleSort('date')}
                  aria-label={`Sort by date, current order: ${sortField === 'date' ? sortOrder : 'none'}`}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px',
                    color: sortField === 'date' ? 'var(--accent-blue)' : 'inherit',
                    fontWeight: 'inherit',
                    fontSize: 'inherit',
                    textTransform: 'inherit',
                    letterSpacing: 'inherit'
                  }}
                >
                  <span>Date</span>
                  <ArrowUpDown size={12} aria-hidden="true" />
                </button>
              </th>

              <th scope="col" style={{ padding: '12px 10px' }}>
                <button
                  type="button"
                  onClick={() => toggleSort('time')}
                  aria-label={`Sort by time, current order: ${sortField === 'time' ? sortOrder : 'none'}`}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px',
                    color: sortField === 'time' ? 'var(--accent-blue)' : 'inherit',
                    fontWeight: 'inherit',
                    fontSize: 'inherit',
                    textTransform: 'inherit',
                    letterSpacing: 'inherit'
                  }}
                >
                  <span>Timing</span>
                  <ArrowUpDown size={12} aria-hidden="true" />
                </button>
              </th>

              <th scope="col" style={{ padding: '12px 10px' }}>Venue</th>
              <th scope="col" style={{ padding: '12px 10px' }}>Eligible Branches</th>
              <th scope="col" style={{ padding: '12px 10px' }}>Status</th>
              <th scope="col" style={{ padding: '12px 10px' }}>Conflict Diagnosis</th>
              <th scope="col" style={{ padding: '12px 10px', textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {sortedDrives.length === 0 ? (
              <tr>
                <td colSpan="8" style={{ padding: '32px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.82rem' }}>
                  No placement drive slots match the current filter selection.
                </td>
              </tr>
            ) : (
              sortedDrives.map((d) => (
                <tr
                  key={d.driveId}
                  style={{
                    borderBottom: '1px solid rgba(255, 255, 255, 0.04)',
                    fontSize: '0.8rem',
                    transition: 'background-color 0.15s ease'
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.02)'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; }}
                >
                  <td style={{ padding: '12px 10px' }}>
                    <div style={{ fontWeight: 700, color: '#ffffff' }}>{d.company}</div>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>
                      {d.role} • <span style={{ color: 'var(--text-muted)' }}>{d.driveId}</span>
                    </div>
                  </td>

                  <td style={{ padding: '12px 10px', color: 'var(--text-primary)', whiteSpace: 'nowrap' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                      <Calendar size={13} color="var(--text-muted)" aria-hidden="true" />
                      <span>{d.date}</span>
                    </div>
                  </td>

                  <td style={{ padding: '12px 10px', color: 'var(--text-secondary)', whiteSpace: 'nowrap' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                      <Clock size={13} color="var(--text-muted)" aria-hidden="true" />
                      <span>{d.startTime}–{d.endTime}</span>
                    </div>
                  </td>

                  <td style={{ padding: '12px 10px', color: '#ffffff', whiteSpace: 'nowrap' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                      <MapPin size={13} color="var(--accent-blue)" aria-hidden="true" />
                      <span>{d.venue}</span>
                    </div>
                  </td>

                  <td style={{ padding: '12px 10px', color: 'var(--text-secondary)' }}>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                      {d.eligibleBranches.map((b) => (
                        <span
                          key={b}
                          style={{
                            fontSize: '0.66rem',
                            padding: '1px 5px',
                            borderRadius: '3px',
                            backgroundColor: 'rgba(255, 255, 255, 0.05)',
                            color: 'var(--text-secondary)'
                          }}
                        >
                          {b}
                        </span>
                      ))}
                    </div>
                  </td>

                  <td style={{ padding: '12px 10px' }}>
                    <span style={{
                      fontSize: '0.68rem',
                      fontWeight: 600,
                      padding: '2px 8px',
                      borderRadius: '4px',
                      backgroundColor: d.status === 'Confirmed' ? 'var(--accent-emerald-soft)' : 'rgba(255, 255, 255, 0.05)',
                      color: d.status === 'Confirmed' ? 'var(--accent-emerald)' : 'var(--text-secondary)'
                    }}>
                      {d.status}
                    </span>
                  </td>

                  <td style={{ padding: '12px 10px' }}>
                    <ConflictBadge severity={d.conflictSeverity} />
                  </td>

                  <td style={{ padding: '12px 10px', textAlign: 'right' }}>
                    <button
                      type="button"
                      onClick={() => onSelectDrive(d)}
                      aria-label={`View schedule details for ${d.company}`}
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '4px',
                        backgroundColor: 'rgba(59, 130, 246, 0.12)',
                        color: 'var(--accent-blue)',
                        padding: '5px 10px',
                        borderRadius: '6px',
                        fontSize: '0.74rem',
                        fontWeight: 600
                      }}
                    >
                      Details <ChevronRight size={13} aria-hidden="true" />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Footer Meta Summary */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        fontSize: '0.72rem',
        color: 'var(--text-muted)',
        borderTop: '1px solid var(--border-color)',
        paddingTop: '12px',
        flexWrap: 'wrap',
        gap: '8px'
      }}>
        <span>Displaying {sortedDrives.length} of {drives.length} total scheduled placement sessions</span>
        <span>Active sort: <strong style={{ color: 'var(--text-secondary)' }}>{sortField}</strong> ({sortOrder.toUpperCase()})</span>
      </div>
    </div>
  );
}