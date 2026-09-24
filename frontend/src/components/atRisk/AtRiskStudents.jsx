import React, { useState } from 'react';
import RiskSummaryCards from './RiskSummaryCards';
import RiskDistribution from './RiskDistribution';
import RiskStudentTable from './RiskStudentTable';
import StudentRiskDetails from './StudentRiskDetails';
import { atRiskStudentsData } from '../../data/mockPlacementData';
import { Info, Sparkles, Download } from 'lucide-react';

export default function AtRiskStudents() {
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [toastMessage, setToastMessage] = useState(null);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '22px' }}>
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
          <strong style={{ color: '#ffffff' }}>DEMO / SYNTHETIC DATA:</strong> Risk scoring shown uses an explainable deterministic prototype model based on synthetic readiness indicators. Not real student data or trained ML inferences.
        </p>
      </div>

      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '14px'
      }}>
        <div>
          <h2 style={{ fontSize: '1.45rem', fontWeight: 800, color: '#ffffff', letterSpacing: '-0.02em' }}>
            At-Risk Student Monitoring
          </h2>
          <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
            Identify students who may need early placement intervention based on transparent readiness indicators.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          <button
            type="button"
            onClick={() => showToast("Demo control: At-Risk cohort report exported to simulated PDF/CSV.")}
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
            Export Intervention List (Demo)
          </button>

          <button
            type="button"
            onClick={() => showToast("Demo control: Batch mentor allocation trigger will integrate with Communication Hub in Phase 4.")}
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
            <Sparkles size={14} aria-hidden="true" />
            Trigger Batch Intervention (Demo)
          </button>
        </div>
      </div>

      <RiskSummaryCards students={atRiskStudentsData} />
      <RiskDistribution students={atRiskStudentsData} />
      <RiskStudentTable
        students={atRiskStudentsData}
        onSelectStudent={(student) => setSelectedStudent(student)}
      />

      {selectedStudent && (
        <StudentRiskDetails
          student={selectedStudent}
          onClose={() => setSelectedStudent(null)}
          onActionTrigger={(msg) => {
            showToast(msg);
            setSelectedStudent(null);
          }}
        />
      )}
    </div>
  );
}