import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  FileCheck,
  CheckCircle2,
  Clock,
  XCircle,
  AlertTriangle,
  RefreshCw,
  Search,
  X,
  FileText,
  UserCheck,
  ShieldCheck
} from 'lucide-react';
import './OfferTracking.css';

const API_BASE_URL = 'http://localhost:5000/api';

const AUTH_HEADERS = {
  'Content-Type': 'application/json',
  'X-Demo-User-Role': 'placement_officer'
};

const STATUS_FILTERS = [
  'All',
  'Accepted',
  'Pending',
  'Joining Confirmed',
  'Rejected'
];

export default function OfferTracking() {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  const [offers, setOffers] = useState([]);
  const [selectedOffer, setSelectedOffer] = useState(null);

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('All');

  // Fetch placement offers from live API
  const fetchOffers = useCallback(async () => {
    setError(null);
    try {
      const res = await fetch(`${API_BASE_URL}/offers`, {
        headers: AUTH_HEADERS
      });

      if (!res.ok) {
        throw new Error(`Failed to load placement offers (HTTP ${res.status})`);
      }

      const json = await res.json();
      const list = Array.isArray(json?.data)
        ? json.data
        : (Array.isArray(json) ? json : []);

      setOffers(list);
    } catch (err) {
      setError(err.message || 'Error occurred while loading placement offers.');
      setOffers([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchOffers();
  }, [fetchOffers]);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchOffers();
  };

  // Helper to calculate verified documents per offer
  const calculateOfferDocProgress = (docs = []) => {
    const list = Array.isArray(docs) ? docs : [];
    const verifiedDocs = list.filter(
      (d) => String(d?.status).toLowerCase().trim() === 'verified'
    );
    const total = list.length;
    const verified = verifiedDocs.length;
    const percentage = total > 0 ? Math.round((verified / total) * 100) : 0;
    return { verified, total, percentage };
  };

  // KPI Calculations across entire cohort
  const kpis = useMemo(() => {
    let total = offers.length;
    let accepted = 0;
    let pending = 0;
    let joiningConfirmed = 0;
    let rejected = 0;

    let totalDocs = 0;
    let verifiedDocs = 0;

    offers.forEach((o) => {
      const st = String(o.status || '').toLowerCase().trim();
      if (st === 'accepted') accepted += 1;
      else if (st === 'pending') pending += 1;
      else if (st === 'joining-confirmed' || st === 'joining confirmed') joiningConfirmed += 1;
      else if (st === 'rejected') rejected += 1;

      const docs = Array.isArray(o.documents) ? o.documents : [];
      docs.forEach((d) => {
        totalDocs += 1;
        if (String(d?.status).toLowerCase().trim() === 'verified') {
          verifiedDocs += 1;
        }
      });
    });

    const completionRate =
      totalDocs > 0 ? Math.round((verifiedDocs / totalDocs) * 100) : 0;

    return {
      total,
      accepted,
      pending,
      joiningConfirmed,
      rejected,
      completionRate
    };
  }, [offers]);

  // Filtered and Searched Offer records
  const filteredOffers = useMemo(() => {
    return offers.filter((o) => {
      // 1. Status Filter
      if (selectedStatus !== 'All') {
        const normFilter = selectedStatus.toLowerCase().replace(/[^a-z]/g, '');
        const normStatus = String(o.status || '').toLowerCase().replace(/[^a-z]/g, '');
        if (normFilter !== normStatus) return false;
      }

      // 2. Search query matching Student Name, Company, or Role
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const studentName = String(o.studentName || o.studentId || '').toLowerCase();
        const company = String(o.company || '').toLowerCase();
        const role = String(o.role || '').toLowerCase();
        return (
          studentName.includes(q) ||
          company.includes(q) ||
          role.includes(q)
        );
      }

      return true;
    });
  }, [offers, selectedStatus, searchQuery]);

  const getStatusBadgeClass = (st) => {
    const s = String(st || '').toLowerCase().trim();
    if (s === 'accepted') return 'status-badge accepted';
    if (s === 'pending') return 'status-badge pending';
    if (s === 'joining-confirmed' || s === 'joining confirmed') return 'status-badge joining-confirmed';
    if (s === 'rejected') return 'status-badge rejected';
    return 'status-badge';
  };

  const getProgressColor = (pct) => {
    if (pct >= 85) return '#10b981';
    if (pct >= 50) return '#3b82f6';
    if (pct >= 25) return '#f59e0b';
    return '#ef4444';
  };

  if (loading) {
    return (
      <div style={{ padding: '48px', textAlign: 'center', color: '#64748b' }}>
        <RefreshCw
          size={24}
          style={{ animation: 'spin 1s linear infinite', margin: '0 auto 12px' }}
        />
        <p style={{ margin: 0, fontSize: '0.875rem' }}>
          Loading verified placement offers and document credentials...
        </p>
      </div>
    );
  }

  return (
    <div className="offers-container">
      {/* 1. Header */}
      <div className="offers-header">
        <div>
          <div className="offers-title-group">
            <h1 className="offers-title">Offer &amp; Document Tracking</h1>
            <span className="offers-badge">
              <FileCheck size={12} /> Verification Governance
            </span>
          </div>
          <p className="offers-subtitle">
            Track verified placement offers, joining timelines, and document completion.
          </p>
        </div>

        <button
          onClick={handleRefresh}
          disabled={loading || refreshing}
          className="offers-refresh-btn"
        >
          <RefreshCw
            size={15}
            style={{ animation: refreshing ? 'spin 1s linear infinite' : 'none' }}
          />
          {refreshing ? 'Updating Records...' : 'Refresh Records'}
        </button>
      </div>

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
          <AlertTriangle size={18} />
          <span>{error}</span>
        </div>
      )}

      {/* 2. Summary KPI Cards */}
      <div className="offers-kpi-grid">
        <div className="offers-kpi-card">
          <span className="offers-kpi-label">Total Offers</span>
          <div className="offers-kpi-value-row">
            <span className="offers-kpi-value">{kpis.total}</span>
            <span className="offers-kpi-subtext">recorded</span>
          </div>
          <span style={{ fontSize: '0.75rem', color: '#818cf8', display: 'flex', alignItems: 'center', gap: '4px' }}>
            <FileText size={12} /> Active batch offers
          </span>
        </div>

        <div className="offers-kpi-card">
          <span className="offers-kpi-label">Accepted</span>
          <div className="offers-kpi-value-row">
            <span className="offers-kpi-value" style={{ color: '#10b981' }}>{kpis.accepted}</span>
            <span className="offers-kpi-subtext">confirmed</span>
          </div>
          <span style={{ fontSize: '0.75rem', color: '#10b981', display: 'flex', alignItems: 'center', gap: '4px' }}>
            <CheckCircle2 size={12} /> Signed by student
          </span>
        </div>

        <div className="offers-kpi-card">
          <span className="offers-kpi-label">Pending</span>
          <div className="offers-kpi-value-row">
            <span className="offers-kpi-value" style={{ color: '#f59e0b' }}>{kpis.pending}</span>
            <span className="offers-kpi-subtext">under review</span>
          </div>
          <span style={{ fontSize: '0.75rem', color: '#f59e0b', display: 'flex', alignItems: 'center', gap: '4px' }}>
            <Clock size={12} /> Awaiting decision
          </span>
        </div>

        <div className="offers-kpi-card">
          <span className="offers-kpi-label">Joining Confirmed</span>
          <div className="offers-kpi-value-row">
            <span className="offers-kpi-value" style={{ color: '#38bdf8' }}>{kpis.joiningConfirmed}</span>
            <span className="offers-kpi-subtext">onboarded</span>
          </div>
          <span style={{ fontSize: '0.75rem', color: '#38bdf8', display: 'flex', alignItems: 'center', gap: '4px' }}>
            <UserCheck size={12} /> Joining scheduled
          </span>
        </div>

        <div className="offers-kpi-card">
          <span className="offers-kpi-label">Rejected</span>
          <div className="offers-kpi-value-row">
            <span className="offers-kpi-value" style={{ color: '#f87171' }}>{kpis.rejected}</span>
            <span className="offers-kpi-subtext">declined</span>
          </div>
          <span style={{ fontSize: '0.75rem', color: '#f87171', display: 'flex', alignItems: 'center', gap: '4px' }}>
            <XCircle size={12} /> Alternate placement
          </span>
        </div>

        <div className="offers-kpi-card">
          <span className="offers-kpi-label">Document Completion</span>
          <div className="offers-kpi-value-row">
            <span className="offers-kpi-value" style={{ color: getProgressColor(kpis.completionRate) }}>
              {kpis.completionRate}%
            </span>
            <span className="offers-kpi-subtext">verified</span>
          </div>
          <span style={{ fontSize: '0.75rem', color: '#a5b4fc', display: 'flex', alignItems: 'center', gap: '4px' }}>
            <ShieldCheck size={12} /> Required documents
          </span>
        </div>
      </div>

      {/* 3. Search & Filter Controls */}
      <div className="offers-controls-card">
        <div className="offers-search-box">
          <Search size={16} color="#64748b" />
          <input
            type="text"
            className="offers-search-input"
            placeholder="Search by student, company, or role..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="offers-filter-pills">
          {STATUS_FILTERS.map((status) => {
            const isActive = selectedStatus === status;
            return (
              <button
                key={status}
                type="button"
                onClick={() => setSelectedStatus(status)}
                className={`offers-pill-btn ${isActive ? 'active' : 'inactive'}`}
              >
                {status}
              </button>
            );
          })}
        </div>
      </div>

      {/* 4. Offers Table */}
      <div className="offers-table-card">
        {filteredOffers.length > 0 ? (
          <table className="offers-table">
            <thead>
              <tr>
                <th>Student</th>
                <th>Company</th>
                <th>Role</th>
                <th>Package</th>
                <th>Offer Date</th>
                <th>Joining Date</th>
                <th>Status</th>
                <th>Documents</th>
              </tr>
            </thead>
            <tbody>
              {filteredOffers.map((offer) => {
                const { verified, total, percentage } = calculateOfferDocProgress(
                  offer.documents
                );
                const progressColor = getProgressColor(percentage);

                return (
                  <tr
                    key={offer.id}
                    className="offers-row-clickable"
                    onClick={() => setSelectedOffer(offer)}
                  >
                    <td>
                      <div style={{ fontWeight: 700, color: '#f8fafc' }}>
                        {offer.studentName || offer.studentId}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: '#818cf8', fontFamily: 'monospace' }}>
                        {offer.studentId}
                      </div>
                    </td>

                    <td>
                      <div style={{ fontWeight: 600, color: '#ffffff' }}>
                        {offer.company}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
                        {offer.driveId}
                      </div>
                    </td>

                    <td>{offer.role}</td>

                    <td>
                      <span style={{ fontFamily: 'monospace', fontWeight: 700, color: '#10b981' }}>
                        {offer.packageLPA} LPA
                      </span>
                    </td>

                    <td style={{ fontSize: '0.8125rem', color: '#94a3b8' }}>
                      {offer.offerDate || '--'}
                    </td>

                    <td style={{ fontSize: '0.8125rem', color: '#cbd5e1' }}>
                      {offer.joiningDate || '--'}
                    </td>

                    <td>
                      <span className={getStatusBadgeClass(offer.status)}>
                        {offer.status || 'Pending'}
                      </span>
                    </td>

                    <td>
                      <div className="doc-progress-wrapper">
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem' }}>
                          <span style={{ color: '#cbd5e1' }}>
                            {verified} / {total} verified
                          </span>
                          <span style={{ color: progressColor, fontWeight: 700 }}>
                            {percentage}%
                          </span>
                        </div>
                        <div className="doc-progress-track">
                          <div
                            className="doc-progress-fill"
                            style={{
                              width: `${percentage}%`,
                              backgroundColor: progressColor
                            }}
                          />
                        </div>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        ) : (
          <div className="offers-empty-state">
            <FileText size={32} />
            <div style={{ fontSize: '0.9375rem', fontWeight: 600, color: '#f8fafc' }}>
              No matching placement offers found
            </div>
            <p style={{ margin: 0, fontSize: '0.8125rem' }}>
              Adjust your search keywords or status filter to view available offer records.
            </p>
          </div>
        )}
      </div>

      {/* 5. Read-Only Offer Details Drawer */}
      {selectedOffer && (
        <div className="offers-drawer-overlay" onClick={() => setSelectedOffer(null)}>
          <div className="offers-drawer" onClick={(e) => e.stopPropagation()}>
            <div className="offers-drawer-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <FileCheck size={20} color="#818cf8" />
                <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 800, color: '#ffffff' }}>
                  Offer Dossier
                </h3>
              </div>
              <button
                type="button"
                className="offers-drawer-close"
                onClick={() => setSelectedOffer(null)}
              >
                <X size={18} />
              </button>
            </div>

            {/* Candidate & Role Overview */}
            <div style={{ padding: '16px', backgroundColor: 'rgba(30, 41, 59, 0.45)', borderRadius: '10px', border: '1px solid #334155' }}>
              <div style={{ fontSize: '1.2rem', fontWeight: 800, color: '#ffffff' }}>
                {selectedOffer.studentName}
              </div>
              <div style={{ fontSize: '0.75rem', color: '#818cf8', fontFamily: 'monospace', marginTop: '2px' }}>
                {selectedOffer.studentId} • Offer Ref: {selectedOffer.id}
              </div>
              <div style={{ marginTop: '10px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span className={getStatusBadgeClass(selectedOffer.status)}>
                  {selectedOffer.status}
                </span>
                <span style={{ fontSize: '0.8125rem', color: '#cbd5e1' }}>
                  {selectedOffer.driveId}
                </span>
              </div>
            </div>

            {/* Key Offer Attributes */}
            <div className="offers-detail-grid">
              <div>
                <span style={{ fontSize: '0.6875rem', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 600 }}>
                  Company
                </span>
                <div style={{ fontSize: '0.875rem', fontWeight: 700, color: '#ffffff', marginTop: '2px' }}>
                  {selectedOffer.company}
                </div>
              </div>

              <div>
                <span style={{ fontSize: '0.6875rem', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 600 }}>
                  Designation
                </span>
                <div style={{ fontSize: '0.875rem', fontWeight: 700, color: '#ffffff', marginTop: '2px' }}>
                  {selectedOffer.role}
                </div>
              </div>

              <div>
                <span style={{ fontSize: '0.6875rem', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 600 }}>
                  Package (CTC)
                </span>
                <div style={{ fontSize: '0.9375rem', fontWeight: 800, color: '#10b981', fontFamily: 'monospace', marginTop: '2px' }}>
                  {selectedOffer.packageLPA} LPA
                </div>
              </div>

              <div>
                <span style={{ fontSize: '0.6875rem', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 600 }}>
                  Offer Released
                </span>
                <div style={{ fontSize: '0.875rem', color: '#cbd5e1', marginTop: '2px' }}>
                  {selectedOffer.offerDate || '--'}
                </div>
              </div>

              <div style={{ gridColumn: 'span 2' }}>
                <span style={{ fontSize: '0.6875rem', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 600 }}>
                  Scheduled Joining Date
                </span>
                <div style={{ fontSize: '0.875rem', color: '#cbd5e1', marginTop: '2px' }}>
                  {selectedOffer.joiningDate || '--'}
                </div>
              </div>
            </div>

            {/* Required Verification Documents (All Documents) */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                <span style={{ fontSize: '0.8125rem', fontWeight: 700, color: '#ffffff', textTransform: 'uppercase' }}>
                  Compliance Documents ({Array.isArray(selectedOffer.documents) ? selectedOffer.documents.length : 0})
                </span>
                {(() => {
                  const { verified, total } = calculateOfferDocProgress(selectedOffer.documents);
                  return (
                    <span style={{ fontSize: '0.75rem', color: '#818cf8', fontWeight: 700 }}>
                      {verified} / {total} Verified
                    </span>
                  );
                })()}
              </div>

              <div className="offers-doc-list">
                {Array.isArray(selectedOffer.documents) && selectedOffer.documents.length > 0 ? (
                  selectedOffer.documents.map((doc, idx) => {
                    const isVerified = String(doc?.status).toLowerCase().trim() === 'verified';
                    return (
                      <div key={idx} className="offers-doc-item">
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <FileText size={15} color={isVerified ? '#10b981' : '#f59e0b'} />
                          <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: '#f8fafc' }}>
                            {doc.type}
                          </span>
                        </div>
                        <span
                          style={{
                            fontSize: '11px',
                            fontWeight: 700,
                            padding: '2px 8px',
                            borderRadius: '999px',
                            backgroundColor: isVerified ? 'rgba(16, 185, 129, 0.15)' : 'rgba(245, 158, 11, 0.15)',
                            color: isVerified ? '#34d399' : '#fbbf24',
                            border: `1px solid ${isVerified ? 'rgba(16, 185, 129, 0.3)' : 'rgba(245, 158, 11, 0.3)'}`
                          }}
                        >
                          {doc.status}
                        </span>
                      </div>
                    );
                  })
                ) : (
                  <div style={{ fontSize: '0.75rem', color: '#64748b', fontStyle: 'italic' }}>
                    No documents uploaded.
                  </div>
                )}
              </div>
            </div>

            {/* Read-Only Governance Note */}
            <div
              style={{
                marginTop: 'auto',
                padding: '12px 14px',
                backgroundColor: 'rgba(30, 41, 59, 0.4)',
                borderRadius: '8px',
                border: '1px solid #334155',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                fontSize: '0.75rem',
                color: '#94a3b8'
              }}
            >
              <ShieldCheck size={16} color="#818cf8" style={{ flexShrink: 0 }} />
              <span>
                Verified records are synchronized from institutional MySQL databases. Read-only audit mode.
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}