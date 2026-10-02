import React, { useState, useEffect, useCallback } from 'react';
import { RefreshCw, Info, AlertCircle, CheckCircle2 } from 'lucide-react';
import CommunicationStats from './CommunicationStats';
import NotificationComposer from './NotificationComposer';
import NotificationPreview from './NotificationPreview';
import NotificationHistory from './NotificationHistory';
import { rawDriveSchedules } from '../../data/mockPlacementData';

const API_BASE_URL = 'http://localhost:5000/api';

const AUTH_HEADERS = {
  'Content-Type': 'application/json',
  'X-Demo-User-Role': 'placement_officer'
};

const TYPE_API_MAP = {
  'Drive Schedule': 'Schedule_Change',
  'Document Deadline': 'Document_Deadline',
  'Eligibility Update': 'Eligibility_Update',
  'General Announcement': 'General'
};

const initialFormData = {
  title: '',
  message: '',
  type: 'General Announcement',
  priority: 'Normal',
  targetAudience: 'All Students',
  targetBranch: 'All',
  relatedDriveId: '',
  scheduledTime: '',
  recipientsCount: 0
};

function mapApiNotification(item) {
  if (!item) return null;

  let displayType = item.type;
  if (item.type === 'Schedule_Change') displayType = 'Drive Schedule';
  else if (item.type === 'Document_Deadline') displayType = 'Document Deadline';
  else if (item.type === 'Eligibility_Update') displayType = 'Eligibility Update';
  else if (item.type === 'General') displayType = 'General Announcement';
  else if (item.type === 'Drive_Alert') displayType = 'Drive Schedule';
  else if (item.type === 'Offer_Update') displayType = 'General Announcement';

  const matchedDrive = (rawDriveSchedules || []).find((d) => d.id === (item.driveId || item.relatedDriveId));
  const relatedCompany = matchedDrive ? matchedDrive.company : '';

  return {
    id: item.id,
    title: item.title || '',
    message: item.message || '',
    type: displayType,
    priority: item.priority || 'Normal',
    targetAudience: item.audience || item.targetAudience || 'All Students',
    targetBranch: item.branch || item.targetBranch || 'All',
    relatedDriveId: item.driveId || item.relatedDriveId || null,
    relatedCompany,
    status: item.status || 'Draft',
    scheduledAt: item.scheduledFor || item.scheduledAt || null,
    timestamp: item.createdAt || item.timestamp || new Date().toISOString(),
    recipientsCount: Number(item.recipientsCount || 0),
    createdAt: item.createdAt || null
  };
}

export default function CommunicationHub() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState(null);
  const [formData, setFormData] = useState(initialFormData);

  const fetchNotifications = useCallback(async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/notifications`, {
        method: 'GET',
        headers: AUTH_HEADERS
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Failed to fetch notifications (HTTP ${response.status})`);
      }

      const resJson = await response.json();
      const rawList = Array.isArray(resJson.data)
        ? resJson.data
        : Array.isArray(resJson)
        ? resJson
        : [];

      const mapped = rawList.map(mapApiNotification).filter(Boolean);
      setNotifications(mapped);
    } catch (err) {
      setFeedback({
        type: 'error',
        message: err.message || 'Unable to connect to notifications service.'
      });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchNotifications();
  };

  const handleFormChange = (updatedFields) => {
    setFormData((prev) => ({
      ...prev,
      ...updatedFields
    }));
  };

  const resetForm = () => {
    setFormData(initialFormData);
  };

  const buildPayload = (isSchedule = false) => {
    const apiType = TYPE_API_MAP[formData.type] || 'General';
    const branch = !formData.targetBranch || formData.targetBranch === 'All'
      ? null
      : formData.targetBranch;
    const driveId = formData.relatedDriveId && formData.relatedDriveId.trim()
      ? formData.relatedDriveId.trim()
      : null;

    const payload = {
      title: (formData.title || '').trim(),
      message: (formData.message || '').trim(),
      type: apiType,
      priority: formData.priority || 'Normal',
      audience: formData.targetAudience || 'All Students',
      branch,
      driveId,
      recipientsCount: Number(formData.recipientsCount || 0)
    };

    if (isSchedule) {
      let scheduledForValue = formData.scheduledTime;
      if (!scheduledForValue) {
        const fallbackDate = new Date(Date.now() + 24 * 60 * 60 * 1000);
        scheduledForValue = fallbackDate.toISOString();
      } else {
        const parsed = new Date(scheduledForValue);
        scheduledForValue = isNaN(parsed.getTime())
          ? new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
          : parsed.toISOString();
      }
      payload.scheduledFor = scheduledForValue;
    }

    return payload;
  };

  const handleSendNow = async () => {
    if (!formData.title || !formData.title.trim()) {
      setFeedback({ type: 'error', message: 'Notification title is required.' });
      return;
    }
    if (!formData.message || !formData.message.trim()) {
      setFeedback({ type: 'error', message: 'Notification message body is required.' });
      return;
    }

    setSubmitting(true);
    setFeedback(null);

    try {
      const payload = buildPayload(false);
      const response = await fetch(`${API_BASE_URL}/notifications`, {
        method: 'POST',
        headers: AUTH_HEADERS,
        body: JSON.stringify(payload)
      });

      const resJson = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(resJson.message || `Failed to dispatch notification (HTTP ${response.status})`);
      }

      setFeedback({ type: 'success', message: 'Notification sent successfully.' });
      resetForm();
      await fetchNotifications();
    } catch (err) {
      setFeedback({ type: 'error', message: err.message || 'Error occurred while sending notification.' });
    } finally {
      setSubmitting(false);
    }
  };

  const handleSchedule = async () => {
    if (!formData.title || !formData.title.trim()) {
      setFeedback({ type: 'error', message: 'Notification title is required.' });
      return;
    }
    if (!formData.message || !formData.message.trim()) {
      setFeedback({ type: 'error', message: 'Notification message body is required.' });
      return;
    }

    setSubmitting(true);
    setFeedback(null);

    try {
      const payload = buildPayload(true);
      const response = await fetch(`${API_BASE_URL}/notifications/schedule`, {
        method: 'POST',
        headers: AUTH_HEADERS,
        body: JSON.stringify(payload)
      });

      const resJson = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(resJson.message || `Failed to schedule notification (HTTP ${response.status})`);
      }

      setFeedback({ type: 'success', message: 'Notification scheduled successfully.' });
      resetForm();
      await fetchNotifications();
    } catch (err) {
      setFeedback({ type: 'error', message: err.message || 'Error occurred while scheduling notification.' });
    } finally {
      setSubmitting(false);
    }
  };

  const handleSaveDraft = async () => {
    if (!formData.title || !formData.title.trim()) {
      setFeedback({ type: 'error', message: 'Title is required to save a draft.' });
      return;
    }

    setSubmitting(true);
    setFeedback(null);

    try {
      const payload = buildPayload(false);
      const response = await fetch(`${API_BASE_URL}/notifications/draft`, {
        method: 'POST',
        headers: AUTH_HEADERS,
        body: JSON.stringify(payload)
      });

      const resJson = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(resJson.message || `Failed to save draft (HTTP ${response.status})`);
      }

      setFeedback({ type: 'success', message: 'Notification draft saved successfully.' });
      resetForm();
      await fetchNotifications();
    } catch (err) {
      setFeedback({ type: 'error', message: err.message || 'Error occurred while saving notification draft.' });
    } finally {
      setSubmitting(false);
    }
  };

  const handleSelectNotification = (notification) => {
    if (!notification) return;
    setFormData({
      title: notification.title || '',
      message: notification.message || '',
      type: notification.type || 'General Announcement',
      priority: notification.priority || 'Normal',
      targetAudience: notification.targetAudience || 'All Students',
      targetBranch: notification.targetBranch || 'All',
      relatedDriveId: notification.relatedDriveId || '',
      scheduledTime: notification.scheduledAt || '',
      recipientsCount: Number(notification.recipientsCount || 0)
    });
  };

  return (
    <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <h1 style={{ margin: 0, fontSize: '1.65rem', fontWeight: 800, color: 'var(--text-primary, #ffffff)', letterSpacing: '-0.02em' }}>
              Communication & Broadcast Hub
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
                backgroundColor: 'rgba(59, 130, 246, 0.12)',
                color: '#60a5fa',
                border: '1px solid rgba(59, 130, 246, 0.25)'
              }}
            >
              <Info size={12} />
              Placement Operations
            </span>
          </div>
          <p style={{ margin: '6px 0 0 0', fontSize: '0.875rem', color: 'var(--text-secondary, #94a3b8)' }}>
            Author, target, schedule, and review placement notifications dispatched across academic cohorts
          </p>
        </div>

        <button
          onClick={handleRefresh}
          disabled={loading || refreshing || submitting}
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
            cursor: loading || refreshing || submitting ? 'not-allowed' : 'pointer',
            opacity: loading || refreshing || submitting ? 0.6 : 1,
            transition: 'background-color 0.2s ease'
          }}
        >
          <RefreshCw size={15} style={{ animation: refreshing ? 'spin 1s linear infinite' : 'none' }} />
          {refreshing ? 'Refreshing...' : 'Refresh Feed'}
        </button>
      </div>

      {feedback && (
        <div
          style={{
            padding: '12px 16px',
            borderRadius: '8px',
            backgroundColor: feedback.type === 'error' ? 'rgba(239, 68, 68, 0.12)' : 'rgba(16, 185, 129, 0.12)',
            border: feedback.type === 'error' ? '1px solid rgba(239, 68, 68, 0.3)' : '1px solid rgba(16, 185, 129, 0.3)',
            color: feedback.type === 'error' ? '#f87171' : '#34d399',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            fontSize: '0.875rem'
          }}
        >
          {feedback.type === 'error' ? <AlertCircle size={18} /> : <CheckCircle2 size={18} />}
          <span>{feedback.message}</span>
        </div>
      )}

      <CommunicationStats notifications={notifications} />

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(420px, 1fr))',
          gap: '20px',
          alignItems: 'start'
        }}
      >
        <NotificationComposer
          formData={formData}
          onChange={handleFormChange}
          availableDrives={rawDriveSchedules}
          onSend={handleSendNow}
          onSchedule={handleSchedule}
          onSaveDraft={handleSaveDraft}
          onPreview={() => {}}
        />

        <NotificationPreview previewData={formData} />
      </div>

      <NotificationHistory
        notifications={notifications}
        onSelectNotification={handleSelectNotification}
      />
    </div>
  );
}