import React, { useState } from 'react';
import Layout from './components/layout/Layout.jsx';
import DashboardHome from './components/dashboard/DashboardHome.jsx';
import StudentPortal from './components/studentPortal/StudentPortal.jsx';
import AtRiskStudents from './components/atRisk/AtRiskStudents.jsx';
import SchedulerOverview from './components/scheduler/SchedulerOverview.jsx';
import CommunicationHub from './components/communication/CommunicationHub.jsx';
import StudentReadiness from './components/readiness/StudentReadiness.jsx';
import StudentJobMatching from './components/matching/StudentJobMatching.jsx';
import SkillGapAnalysis from './components/skillGap/SkillGapAnalysis.jsx';
import PlaceholderView from './components/common/PlaceholderView.jsx';

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [searchTerm, setSearchTerm] = useState('');

  const renderActiveView = () => {
    switch (activeTab) {
      case 'dashboard':
        return <DashboardHome />;
      case 'student-portal':
        return <StudentPortal onNavigate={setActiveTab} />;
      case 'at-risk':
        return <AtRiskStudents />;
      case 'readiness':
        return <StudentReadiness />;
      case 'matching':
        return <StudentJobMatching />;
      case 'skill-gap':
        return <SkillGapAnalysis />;
      case 'drives':
        return <SchedulerOverview />;
      case 'communication':
        return <CommunicationHub />;
      case 'analytics':
        return (
          <PlaceholderView
            title="Advanced Placement Analytics"
            description="Deep cohort segmentation, company tiers, and recruiter retention analytics will be available here."
          />
        );
      default:
        return <DashboardHome />;
    }
  };

  return (
    <Layout
      activeTab={activeTab}
      onSelectTab={setActiveTab}
      searchTerm={searchTerm}
      onSearchChange={setSearchTerm}
    >
      {renderActiveView()}
    </Layout>
  );
}