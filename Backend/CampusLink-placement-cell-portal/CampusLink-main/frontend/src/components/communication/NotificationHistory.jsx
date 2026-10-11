import React, { useState } from 'react';
import { Filter, Search, Building2, Tag, Calendar } from 'lucide-react';

export default function NotificationHistory({ notifications = [], onSelectNotification }) {
  const [filterStatus, setFilterStatus] = useState('All');
  const [filterType, setFilterType] = useState('All');
  const [filterPriority, setFilterPriority] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  const statusOptions = ['All', 'Sent', 'Scheduled', 'Draft'];
  const typeOptions = [
    'All',
    'Drive Schedule',
    'Document Deadline',
    'Eligibility Update',
    'General Announcement'
  ];
  const priorityOptions = ['All', 'Normal', 'Important', 'Urgent'];

  const filtered = notifications.filter((notif) => {
    const matchStatus = filterStatus === 'All' || notif.status === filterStatus;
    const matchType = filterType === 'All' || notif.type === filterType;
    const matchPriority = filterPriority === 'All' || notif.priority === filterPriority;

    const q = searchQuery.trim().toLowerCase();
    const matchSearch =
      q === '' ||
      (notif.title && notif.title.toLowerCase().includes(q)) ||
      (notif.message && notif.message.toLowerCase().includes(q)) ||
      (notif.relatedCompany && notif.relatedCompany.toLowerCase().includes(q)) ||
      (notif.targetBranch && notif.targetBranch.toLowerCase().includes(q));

    return matchStatus && matchType && matchPriority && matchSearch;
  });

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Sent':
        return {
          bg: 'var(--accent-emerald-soft)',
          color: 'var(--accent-emerald)',
          border: 'rgba(16, 185, 129, 0.3)'
        };
      case 'Scheduled':
        return {
          bg: 'var(--accent-amber-soft)',
          color: 'var(--accent-amber)',
          border: 'rgba(245, 158, 11, 0.3)'
        };
      default:
        return {
          bg: 'rgba(255, 255, 255, 0.06)',
          color: 'var(--text-secondary)',
          border: 'var(--border-color)'
        };
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'Urgent':
        return 'var(--accent-rose)';
      case 'Important':
        return 'var(--accent-amber)';
      default:
        return 'var(--accent-blue)';
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
      {/* Header and Controls */}
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '12px'
        }}
      >
        <div>
          <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#ffffff' }}>
            Notification Logs &amp; Dispatches
          </h3>
          <p style={{ fontSize: '0.76rem', color: 'var(--text-muted)' }}>
            Historical audit log of sent broadcasts, scheduled releases, and saved drafts
          </p>
        </div>

        {/* Search Input */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            backgroundColor: 'rgba(15, 23, 42, 0.6)',
            border: '1px solid var(--border-color)',
            borderRadius: '8px',
            padding: '7px 12px',
            minWidth: '240px'
          }}
        >
          <Search size={15} color="var(--text-muted)" aria-hidden="true" />
          <input
            type="search"
            placeholder="Search title, company, text..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            aria-label="Search notifications"
            style={{
              background: 'none',
              border: 'none',
              outline: 'none',
              color: 'var(--text-primary)',
              fontSize: '0.78rem',
              width: '100%'
            }}
          />
        </div>
      </div>

      {/* Filters Bar */}
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          gap: '10px',
          paddingBottom: '4px'
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
            fontSize: '0.74rem',
            color: 'var(--text-muted)'
          }}
        >
          <Filter size={13} aria-hidden="true" />
          <span>Filters:</span>
        </div>

        {/* Status Filter */}
        <select
          aria-label="Filter notifications by Status"
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          style={{
            backgroundColor: 'rgba(15, 23, 42, 0.6)',
            border: '1px solid var(--border-color)',
            color: 'var(--text-primary)',
            borderRadius: '6px',
            padding: '5px 10px',
            fontSize: '0.74rem',
            outline: 'none'
          }}
        >
          {statusOptions.map((s) => (
            <option key={s} value={s} style={{ backgroundColor: '#1e293b' }}>
              Status: {s}
            </option>
          ))}
        </select>

        {/* Type Filter */}
        <select
          aria-label="Filter notifications by Type"
          value={filterType}
          onChange={(e) => setFilterType(e.target.value)}
          style={{
            backgroundColor: 'rgba(15, 23, 42, 0.6)',
            border: '1px solid var(--border-color)',
            color: 'var(--text-primary)',
            borderRadius: '6px',
            padding: '5px 10px',
            fontSize: '0.74rem',
            outline: 'none'
          }}
        >
          {typeOptions.map((t) => (
            <option key={t} value={t} style={{ backgroundColor: '#1e293b' }}>
              Type: {t}
            </option>
          ))}
        </select>

        {/* Priority Filter */}
        <select
          aria-label="Filter notifications by Priority"
          value={filterPriority}
          onChange={(e) => setFilterPriority(e.target.value)}
          style={{
            backgroundColor: 'rgba(15, 23, 42, 0.6)',
            border: '1px solid var(--border-color)',
            color: 'var(--text-primary)',
            borderRadius: '6px',
            padding: '5px 10px',
            fontSize: '0.74rem',
            outline: 'none'
          }}
        >
          {priorityOptions.map((p) => (
            <option key={p} value={p} style={{ backgroundColor: '#1e293b' }}>
              Priority: {p}
            </option>
          ))}
        </select>
      </div>

      {/* History Table */}
      <div style={{ overflowX: 'auto' }}>
        <table
          style={{
            width: '100%',
            borderCollapse: 'collapse',
            textAlign: 'left',
            minWidth: '760px'
          }}
        >
          <thead>
            <tr
              style={{
                borderBottom: '1px solid var(--border-color)',
                fontSize: '0.72rem',
                color: 'var(--text-muted)',
                textTransform: 'uppercase',
                letterSpacing: '0.05em'
              }}
            >
              <th scope="col" style={{ padding: '12px 10px' }}>
                Title &amp; Context
              </th>
              <th scope="col" style={{ padding: '12px 10px' }}>
                Type
              </th>
              <th scope="col" style={{ padding: '12px 10px' }}>
                Target Audience
              </th>
              <th scope="col" style={{ padding: '12px 10px' }}>
                Priority
              </th>
              <th scope="col" style={{ padding: '12px 10px' }}>
                Status
              </th>
              <th scope="col" style={{ padding: '12px 10px' }}>
                Date / Schedule
              </th>
              <th scope="col" style={{ padding: '12px 10px', textAlign: 'right' }}>
                Action
              </th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td
                  colSpan="7"
                  style={{
                    padding: '32px',
                    textAlign: 'center',
                    color: 'var(--text-muted)',
                    fontSize: '0.82rem'
                  }}
                >
                  No synthetic notification records match the current filter selection.
                </td>
              </tr>
            ) : (
              filtered.map((notif) => {
                const badge = getStatusBadge(notif.status);
                const priorityColor = getPriorityColor(notif.priority);
                const dateDisplay =
                  notif.status === 'Scheduled' && notif.scheduledAt
                    ? notif.scheduledAt
                    : notif.createdAt;

                return (
                  <tr
                    key={notif.id}
                    style={{
                      borderBottom: '1px solid rgba(255, 255, 255, 0.04)',
                      fontSize: '0.8rem',
                      transition: 'background-color 0.15s ease'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.02)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = 'transparent';
                    }}
                  >
                    <td style={{ padding: '12px 10px', maxWidth: '280px' }}>
                      <div style={{ fontWeight: 700, color: '#ffffff' }}>
                        {notif.title}
                      </div>
                      <div
                        style={{
                          fontSize: '0.72rem',
                          color: 'var(--text-muted)',
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          marginTop: '2px'
                        }}
                      >
                        {notif.message}
                      </div>
                      {notif.relatedCompany && (
                        <div
                          style={{
                            fontSize: '0.68rem',
                            color: 'var(--accent-blue)',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '3px',
                            marginTop: '2px'
                          }}
                        >
                          <Building2 size={11} aria-hidden="true" />
                          <span>{notif.relatedCompany}</span>
                        </div>
                      )}
                    </td>

                    <td style={{ padding: '12px 10px', color: 'var(--text-secondary)', whiteSpace: 'nowrap' }}>
                      {notif.type}
                    </td>

                    <td style={{ padding: '12px 10px', color: 'var(--text-primary)', whiteSpace: 'nowrap' }}>
                      <div>{notif.targetAudience}</div>
                      {notif.targetBranch && notif.targetBranch !== 'All' && (
                        <span
                          style={{
                            fontSize: '0.66rem',
                            backgroundColor: 'rgba(255, 255, 255, 0.05)',
                            padding: '1px 6px',
                            borderRadius: '4px',
                            color: 'var(--text-secondary)'
                          }}
                        >
                          {notif.targetBranch}
                        </span>
                      )}
                    </td>

                    <td style={{ padding: '12px 10px', whiteSpace: 'nowrap' }}>
                      <span
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '5px',
                          fontSize: '0.72rem',
                          fontWeight: 700,
                          color: priorityColor
                        }}
                      >
                        <span
                          style={{
                            width: '6px',
                            height: '6px',
                            borderRadius: '50%',
                            backgroundColor: priorityColor
                          }}
                        />
                        {notif.priority}
                      </span>
                    </td>

                    <td style={{ padding: '12px 10px', whiteSpace: 'nowrap' }}>
                      <span
                        style={{
                          fontSize: '0.68rem',
                          fontWeight: 700,
                          padding: '2px 8px',
                          borderRadius: '4px',
                          backgroundColor: badge.bg,
                          color: badge.color,
                          border: `1px solid ${badge.border}`
                        }}
                      >
                        {notif.status}
                      </span>
                    </td>

                    <td style={{ padding: '12px 10px', color: 'var(--text-muted)', fontSize: '0.72rem', whiteSpace: 'nowrap' }}>
                      {dateDisplay}
                    </td>

                    <td style={{ padding: '12px 10px', textAlign: 'right', whiteSpace: 'nowrap' }}>
                      {onSelectNotification && (
                        <button
                          type="button"
                          onClick={() => onSelectNotification(notif)}
                          style={{
                            backgroundColor: 'rgba(59, 130, 246, 0.12)',
                            color: 'var(--accent-blue)',
                            padding: '5px 10px',
                            borderRadius: '6px',
                            fontSize: '0.74rem',
                            fontWeight: 600
                          }}
                        >
                          Load to Preview
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Footer Meta */}
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
          Showing {filtered.length} of {notifications.length} simulated notifications
        </span>
        <span>Environment: Placement Cell Dispatch Terminal</span>
      </div>
    </div>
  );
}