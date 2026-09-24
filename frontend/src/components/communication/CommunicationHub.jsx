import React, { useState } from 'react';
import CommunicationStats from './CommunicationStats';
import NotificationComposer from './NotificationComposer';
import NotificationPreview from './NotificationPreview';
import NotificationHistory from './NotificationHistory';
import { 
  communicationNotifications, 
  rawDriveSchedules 
} from '../../data/mockPlacementData';
import { Info, RefreshCw } from 'lucide-react';

export default function CommunicationHub() {
  const [notificationsList, setNotificationsList] = useState(communicationNotifications);
  const [toastMessage, setToastMessage] = useState(null);

  const initialFormState = {
    title: 'Round 2 Technical Interview Schedule Released',
    type: 'Drive Schedule',
    priority: 'Urgent',
    targetAudience: 'Specific Drive',
    targetBranch: 'CSE',
    relatedDriveId: 'DEMO-DRV-201',
    relatedCompany: 'Aether Dynamics',
    message: 'Notice to all shortlisted candidates: Interview slots scheduled for Sep 28 have been reassigned to Auditorium 1 to prevent hallway crowding. Please arrive 15 minutes before your time slot.'
  };

  const [formData, setFormData] = useState(initialFormState);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  };

  const handleSendNow = () => {
    if (!formData.title.trim() || !formData.message.trim()) {
      showToast('Validation notice: Please provide both a title and message body.');
      return;
    }

    const newRecord = {
      id: `DEMO-NOTIF-${Date.now().toString().slice(-3)}`,
      title: formData.title,
      type: formData.type,
      priority: formData.priority,
      targetAudience: formData.targetAudience,
      targetBranch: formData.targetBranch,
      relatedDriveId: formData.relatedDriveId || null,
      relatedCompany: formData.relatedCompany || null,
      message: formData.message,
      status: 'Sent',
      createdAt: '2026-09-24 Just now',
      scheduledAt: null
    };

    setNotificationsList([newRecord, ...notificationsList]);
    showToast('Demo notification marked as sent.');
  };

  const handleSchedule = () => {
    if (!formData.title.trim() || !formData.message.trim()) {
      showToast('Validation notice: Please provide both a title and message body.');
      return;
    }

    const newRecord = {
      id: `DEMO-NOTIF-${Date.now().toString().slice(-3)}`,
      title: formData.title,
      type: formData.type,
      priority: formData.priority,
      targetAudience: formData.targetAudience,
      targetBranch: formData.targetBranch,
      relatedDriveId: formData.relatedDriveId || null,
      relatedCompany: formData.relatedCompany || null,
      message: formData.message,
      status: 'Scheduled',
      createdAt: '2026-09-24 Just now',
      scheduledAt: '2026-09-28 09:00'
    };

    setNotificationsList([newRecord, ...notificationsList]);
    showToast('Demo notification scheduled.');
  };

  const handleSaveDraft = () => {
    if (!formData.title.trim()) {
      showToast('Validation notice: Please specify at least a title for the draft.');
      return;
    }

    const newRecord = {
      id: `DEMO-NOTIF-${Date.now().toString().slice(-3)}`,
      title: formData.title,
      type: formData.type,
      priority: formData.priority,
      targetAudience: formData.targetAudience,
      targetBranch: formData.targetBranch,
      relatedDriveId: formData.relatedDriveId || null,
      relatedCompany: formData.relatedCompany || null,
      message: formData.message || 'Draft content in progress...',
      status: 'Draft',
      createdAt: '2026-09-24 Just now',
      scheduledAt: null
    };

    setNotificationsList([newRecord, ...notificationsList]);
    showToast('Demo notification saved as draft.');
  };

  const handleSelectFromHistory = (notif) => {
    setFormData({
      title: notif.title,
      type: notif.type,
      priority: notif.priority,
      targetAudience: notif.targetAudience,
      targetBranch: notif.targetBranch || 'All',
      relatedDriveId: notif.relatedDriveId || '',
      relatedCompany: notif.relatedCompany || '',
      message: notif.message
    });
    showToast(`Loaded "${notif.title}" into composer & preview.`);
  };

  const handlePreviewAction = () => {
    showToast('Live preview updated with current composer content.');
  };

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
        <Info size={16} color="var(--accent-blue)" aria-hidden="true" style={{ flexShrink: 0 }} />
        <p style={{ fontSize: '0.76rem', color: 'var(--text-secondary)' }}>
          <strong style={{ color: '#ffffff' }}>DEMO / SYNTHETIC ENVIRONMENT:</strong> Notifications and communications are simulated for platform evaluation. No emails, SMS, WhatsApp alerts, or real student notifications are triggered.
        </p>
      </div>

      {/* Page Heading */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '14px'
      }}>
        <div>
          <h2 style={{ fontSize: '1.45rem', fontWeight: 800, color: '#ffffff', letterSpacing: '-0.02em' }}>
            Automated Communication &amp; Notification Hub
          </h2>
          <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
            Coordinate targeted student cohort alerts, deadline reminders, and company drive updates.
          </p>
        </div>

        <button
          type="button"
          onClick={() => {
            setFormData(initialFormState);
            showToast('Composer reset to default template.');
          }}
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
          <RefreshCw size={14} aria-hidden="true" />
          Reset Composer (Demo)
        </button>
      </div>

      {/* Communication Summary Stats */}
      <CommunicationStats notifications={notificationsList} />

      {/* Composer & Preview Dual Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 460px), 1fr))',
        gap: '20px'
      }}>
        <NotificationComposer
          formData={formData}
          onChange={setFormData}
          availableDrives={rawDriveSchedules}
          onSend={handleSendNow}
          onSchedule={handleSchedule}
          onSaveDraft={handleSaveDraft}
          onPreview={handlePreviewAction}
        />

        <NotificationPreview previewData={formData} />
      </div>

      {/* Notification Logs & Dispatches History */}
      <NotificationHistory
        notifications={notificationsList}
        onSelectNotification={handleSelectFromHistory}
      />
    </div>
  );
}