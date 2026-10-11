import React from 'react';
import { Bell, Search, UserCheck, Menu } from 'lucide-react';

export default function Header({ onOpenSidebar, searchTerm, onSearchChange }) {
  const handleDemoNotificationClick = () => {
    alert("Demo Notification: This is a frontend demo sandbox. No notifications are currently active.");
  };

  return (
    <header style={{
      height: '70px',
      backgroundColor: 'rgba(15, 23, 42, 0.85)',
      backdropFilter: 'blur(10px)',
      borderBottom: '1px solid var(--border-color)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '0 20px',
      position: 'sticky',
      top: 0,
      zIndex: 25,
      gap: '12px'
    }}>
      {/* Mobile Menu Button & Search */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1, maxWidth: '480px' }}>
        <button
          type="button"
          onClick={onOpenSidebar}
          className="mobile-only"
          aria-label="Open navigation menu"
          style={{
            padding: '8px',
            borderRadius: '8px',
            backgroundColor: 'var(--bg-card)',
            border: '1px solid var(--border-color)',
            color: 'var(--text-primary)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          <Menu size={20} aria-hidden="true" />
        </button>

        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          backgroundColor: 'var(--bg-card)',
          border: '1px solid var(--border-color)',
          borderRadius: '8px',
          padding: '8px 12px',
          width: '100%'
        }}>
          <Search size={16} color="var(--text-muted)" aria-hidden="true" />
          <label htmlFor="dashboard-search-input" style={{ position: 'absolute', width: '1px', height: '1px', margin: '-1px', padding: 0, overflow: 'hidden', clip: 'rect(0, 0, 0, 0)', border: 0 }}>
            Search demo drives and activities
          </label>
          <input
            id="dashboard-search-input"
            type="search"
            placeholder="Search demo drives, companies..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            style={{
              background: 'none',
              border: 'none',
              outline: 'none',
              color: 'var(--text-primary)',
              fontSize: '0.82rem',
              width: '100%'
            }}
          />
        </div>
      </div>

      {/* Right Controls */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        {/* Environment Status Badge */}
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '6px',
          backgroundColor: 'var(--accent-amber-soft)',
          border: '1px solid rgba(245, 158, 11, 0.3)',
          borderRadius: '9999px',
          padding: '4px 10px',
          fontSize: '0.72rem',
          fontWeight: 600,
          color: 'var(--accent-amber)',
          whiteSpace: 'nowrap'
        }}>
          <span style={{
            width: '6px',
            height: '6px',
            borderRadius: '50%',
            backgroundColor: 'var(--accent-amber)'
          }} />
          Demo Mode
        </div>

        {/* Notifications Icon Button */}
        <button
          type="button"
          onClick={handleDemoNotificationClick}
          aria-label="View demo notifications"
          style={{
            position: 'relative',
            padding: '8px',
            borderRadius: '8px',
            backgroundColor: 'var(--bg-card)',
            border: '1px solid var(--border-color)',
            color: 'var(--text-secondary)'
          }}
        >
          <Bell size={18} aria-hidden="true" />
          <span style={{
            position: 'absolute',
            top: '6px',
            right: '6px',
            width: '6px',
            height: '6px',
            borderRadius: '50%',
            backgroundColor: 'var(--accent-amber)'
          }} />
        </button>

        {/* User Identity Profile Block */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          paddingLeft: '8px',
          borderLeft: '1px solid var(--border-color)'
        }}>
          <div style={{
            width: '36px',
            height: '36px',
            borderRadius: '8px',
            backgroundColor: 'var(--accent-blue-soft)',
            border: '1px solid var(--accent-blue)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--accent-blue)'
          }}>
            <UserCheck size={18} aria-hidden="true" />
          </div>
          <div className="desktop-only">
            <div style={{ fontSize: '0.82rem', fontWeight: 600, color: '#ffffff' }}>T&P Coordinator</div>
            <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>Demo Profile</div>
          </div>
        </div>
      </div>
    </header>
  );
}