import React from 'react';
import { Send, Clock, Save, Eye, Sparkles, Layers } from 'lucide-react';
import {
  communicationBranches,
  communicationNotificationTypes,
  communicationPriorities,
  communicationAudiences,
  getSmartTargetingDescription
} from '../../data/mockPlacementData';

export default function NotificationComposer({
  formData,
  onChange,
  availableDrives = [],
  onSend,
  onSchedule,
  onSaveDraft,
  onPreview
}) {
  const targetingExplanation = getSmartTargetingDescription(
    formData.targetAudience,
    formData.targetBranch,
    formData.relatedCompany
  );

  const handleDriveChange = (e) => {
    const driveId = e.target.value;
    if (!driveId) {
      onChange({
        ...formData,
        relatedDriveId: '',
        relatedCompany: ''
      });
      return;
    }
    const selected = availableDrives.find(
      (d) => (d.driveId || d.id) === driveId
    );
    onChange({
      ...formData,
      relatedDriveId: driveId,
      relatedCompany: selected ? selected.company : ''
    });
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
        gap: '18px'
      }}
    >
      {/* Header */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '8px'
        }}
      >
        <div>
          <h3
            style={{
              fontSize: '1.05rem',
              fontWeight: 700,
              color: '#ffffff'
            }}
          >
            Compose Placement Notice
          </h3>
          <p style={{ fontSize: '0.76rem', color: 'var(--text-muted)' }}>
            Draft and dispatch simulated campus-wide bulletins and drive updates
          </p>
        </div>
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '5px',
            backgroundColor: 'var(--accent-blue-soft)',
            border: '1px solid rgba(59, 130, 246, 0.3)',
            borderRadius: '6px',
            padding: '4px 10px',
            fontSize: '0.7rem',
            color: 'var(--accent-blue)',
            fontWeight: 600
          }}
        >
          <Sparkles size={12} aria-hidden="true" />
          <span>Smart Audience Engine</span>
        </div>
      </div>

      {/* Form Fields */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
        {/* 1. Notification Title */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <label
            htmlFor="composer-title"
            style={{
              fontSize: '0.76rem',
              fontWeight: 600,
              color: 'var(--text-secondary)'
            }}
          >
            Notification Title *
          </label>
          <input
            id="composer-title"
            type="text"
            placeholder="e.g., Technical Assessment Link & Instructions"
            value={formData.title}
            onChange={(e) => onChange({ ...formData, title: e.target.value })}
            style={{
              backgroundColor: 'rgba(15, 23, 42, 0.6)',
              border: '1px solid var(--border-color)',
              color: 'var(--text-primary)',
              borderRadius: '8px',
              padding: '9px 12px',
              fontSize: '0.82rem',
              outline: 'none'
            }}
          />
        </div>

        {/* 2. Type & 3. Priority */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '12px'
          }}
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <label
              htmlFor="composer-type"
              style={{
                fontSize: '0.76rem',
                fontWeight: 600,
                color: 'var(--text-secondary)'
              }}
            >
              Notification Type
            </label>
            <select
              id="composer-type"
              value={formData.type}
              onChange={(e) => onChange({ ...formData, type: e.target.value })}
              style={{
                backgroundColor: 'rgba(15, 23, 42, 0.6)',
                border: '1px solid var(--border-color)',
                color: 'var(--text-primary)',
                borderRadius: '8px',
                padding: '9px 12px',
                fontSize: '0.82rem',
                outline: 'none'
              }}
            >
              {communicationNotificationTypes.map((t) => (
                <option key={t} value={t} style={{ backgroundColor: '#1e293b' }}>
                  {t}
                </option>
              ))}
            </select>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <label
              htmlFor="composer-priority"
              style={{
                fontSize: '0.76rem',
                fontWeight: 600,
                color: 'var(--text-secondary)'
              }}
            >
              Priority
            </label>
            <select
              id="composer-priority"
              value={formData.priority}
              onChange={(e) =>
                onChange({ ...formData, priority: e.target.value })
              }
              style={{
                backgroundColor: 'rgba(15, 23, 42, 0.6)',
                border: '1px solid var(--border-color)',
                color: 'var(--text-primary)',
                borderRadius: '8px',
                padding: '9px 12px',
                fontSize: '0.82rem',
                outline: 'none'
              }}
            >
              {communicationPriorities.map((p) => (
                <option key={p} value={p} style={{ backgroundColor: '#1e293b' }}>
                  {p}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* 4. Target Audience, 5. Branch & 6. Related Drive */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '12px'
          }}
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <label
              htmlFor="composer-audience"
              style={{
                fontSize: '0.76rem',
                fontWeight: 600,
                color: 'var(--text-secondary)'
              }}
            >
              Target Audience
            </label>
            <select
              id="composer-audience"
              value={formData.targetAudience}
              onChange={(e) =>
                onChange({ ...formData, targetAudience: e.target.value })
              }
              style={{
                backgroundColor: 'rgba(15, 23, 42, 0.6)',
                border: '1px solid var(--border-color)',
                color: 'var(--text-primary)',
                borderRadius: '8px',
                padding: '9px 12px',
                fontSize: '0.82rem',
                outline: 'none'
              }}
            >
              {communicationAudiences.map((a) => (
                <option key={a} value={a} style={{ backgroundColor: '#1e293b' }}>
                  {a}
                </option>
              ))}
            </select>
          </div>

          {/* Conditional Branch Selector */}
          {formData.targetAudience === 'Specific Branch' && (
            <div
              style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}
            >
              <label
                htmlFor="composer-branch"
                style={{
                  fontSize: '0.76rem',
                  fontWeight: 600,
                  color: 'var(--text-secondary)'
                }}
              >
                Engineering Branch
              </label>
              <select
                id="composer-branch"
                value={formData.targetBranch}
                onChange={(e) =>
                  onChange({ ...formData, targetBranch: e.target.value })
                }
                style={{
                  backgroundColor: 'rgba(15, 23, 42, 0.6)',
                  border: '1px solid var(--border-color)',
                  color: 'var(--text-primary)',
                  borderRadius: '8px',
                  padding: '9px 12px',
                  fontSize: '0.82rem',
                  outline: 'none'
                }}
              >
                {communicationBranches.map((b) => (
                  <option
                    key={b}
                    value={b}
                    style={{ backgroundColor: '#1e293b' }}
                  >
                    {b}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Conditional or Optional Related Drive Selector */}
          {(formData.targetAudience === 'Specific Drive' ||
            formData.targetAudience === 'Eligible Students') && (
            <div
              style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}
            >
              <label
                htmlFor="composer-drive"
                style={{
                  fontSize: '0.76rem',
                  fontWeight: 600,
                  color: 'var(--text-secondary)'
                }}
              >
                Related Drive
              </label>
              <select
                id="composer-drive"
                value={formData.relatedDriveId || ''}
                onChange={handleDriveChange}
                style={{
                  backgroundColor: 'rgba(15, 23, 42, 0.6)',
                  border: '1px solid var(--border-color)',
                  color: 'var(--text-primary)',
                  borderRadius: '8px',
                  padding: '9px 12px',
                  fontSize: '0.82rem',
                  outline: 'none'
                }}
              >
                <option value="" style={{ backgroundColor: '#1e293b' }}>
                  -- Select Placement Drive --
                </option>
                {availableDrives.map((d) => {
                  const id = d.driveId || d.id;
                  return (
                    <option
                      key={id}
                      value={id}
                      style={{ backgroundColor: '#1e293b' }}
                    >
                      {id}: {d.company} ({d.role || 'Placement Drive'})
                    </option>
                  );
                })}
              </select>
            </div>
          )}
        </div>

        {/* Smart Targeting Visual Explanation */}
        <div
          style={{
            backgroundColor: 'rgba(15, 23, 42, 0.5)',
            border: '1px dashed var(--border-color)',
            borderRadius: '8px',
            padding: '10px 14px',
            display: 'flex',
            alignItems: 'flex-start',
            gap: '10px'
          }}
        >
          <Layers
            size={16}
            color="var(--accent-blue)"
            aria-hidden="true"
            style={{ flexShrink: 0, marginTop: '2px' }}
          />
          <div>
            <div
              style={{
                fontSize: '0.74rem',
                fontWeight: 700,
                color: '#ffffff'
              }}
            >
              Audience Scope Summary
            </div>
            <div
              style={{
                fontSize: '0.72rem',
                color: 'var(--text-secondary)',
                marginTop: '2px'
              }}
            >
              {targetingExplanation}
            </div>
          </div>
        </div>

        {/* 7. Message Body */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <label
            htmlFor="composer-message"
            style={{
              fontSize: '0.76rem',
              fontWeight: 600,
              color: 'var(--text-secondary)'
            }}
          >
            Notification Message *
          </label>
          <textarea
            id="composer-message"
            rows="4"
            placeholder="Type the official announcement body or drive directives..."
            value={formData.message}
            onChange={(e) => onChange({ ...formData, message: e.target.value })}
            style={{
              backgroundColor: 'rgba(15, 23, 42, 0.6)',
              border: '1px solid var(--border-color)',
              color: 'var(--text-primary)',
              borderRadius: '8px',
              padding: '10px 12px',
              fontSize: '0.82rem',
              outline: 'none',
              resize: 'vertical',
              fontFamily: 'inherit',
              lineHeight: 1.5
            }}
          />
        </div>
      </div>

      {/* Actions Footer */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'flex-end',
          gap: '10px',
          borderTop: '1px solid var(--border-color)',
          paddingTop: '16px',
          flexWrap: 'wrap'
        }}
      >
        {onPreview && (
          <button
            type="button"
            onClick={onPreview}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              backgroundColor: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid var(--border-color)',
              color: 'var(--text-primary)',
              padding: '8px 14px',
              borderRadius: '8px',
              fontSize: '0.78rem',
              fontWeight: 600
            }}
          >
            <Eye size={14} aria-hidden="true" />
            Preview (Demo)
          </button>
        )}

        <button
          type="button"
          onClick={onSaveDraft}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            backgroundColor: 'rgba(255, 255, 255, 0.05)',
            border: '1px solid var(--border-color)',
            color: 'var(--text-primary)',
            padding: '8px 14px',
            borderRadius: '8px',
            fontSize: '0.78rem',
            fontWeight: 600
          }}
        >
          <Save size={14} aria-hidden="true" />
          Save Draft (Demo)
        </button>

        <button
          type="button"
          onClick={onSchedule}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            backgroundColor: 'var(--accent-amber-soft)',
            border: '1px solid rgba(245, 158, 11, 0.3)',
            color: 'var(--accent-amber)',
            padding: '8px 14px',
            borderRadius: '8px',
            fontSize: '0.78rem',
            fontWeight: 600
          }}
        >
          <Clock size={14} aria-hidden="true" />
          Schedule (Demo)
        </button>

        <button
          type="button"
          onClick={onSend}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            background: 'linear-gradient(135deg, #2563eb, #3b82f6)',
            color: '#ffffff',
            padding: '8px 18px',
            borderRadius: '8px',
            fontSize: '0.78rem',
            fontWeight: 600,
            boxShadow: '0 4px 12px rgba(37, 99, 235, 0.35)'
          }}
        >
          <Send size={14} aria-hidden="true" />
          Send Now (Demo)
        </button>
      </div>
    </div>
  );
}