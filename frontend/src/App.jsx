import React, { useState } from 'react';
import Layout from './components/layout/Layout.jsx';
import DashboardHome from './components/dashboard/DashboardHome.jsx';
import RecruiterWorkflow from './components/recruiter/RecruiterWorkflow.jsx';
import StudentPortal from './components/studentPortal/StudentPortal.jsx';
import AtRiskStudents from './components/atRisk/AtRiskStudents.jsx';
import SchedulerOverview from './components/scheduler/SchedulerOverview.jsx';
import CommunicationHub from './components/communication/CommunicationHub.jsx';
import StudentReadiness from './components/readiness/StudentReadiness.jsx';
import StudentJobMatching from './components/matching/StudentJobMatching.jsx';
import SkillGapAnalysis from './components/skillGap/SkillGapAnalysis.jsx';
import CurriculumIntelligence from './components/curriculum/CurriculumIntelligence.jsx';
import AnalyticsOverview from './components/analytics/AnalyticsOverview.jsx';

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [searchTerm, setSearchTerm] = useState('');

  const renderActiveView = () => {
    switch (activeTab) {
      case 'dashboard':
        return <DashboardHome onNavigate={setActiveTab} />;
      case 'recruiter-workflow':
        return <RecruiterWorkflow onNavigate={setActiveTab} />;
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
      case 'analytics':
        return <AnalyticsOverview />;
      case 'curriculum-intelligence':
        return <CurriculumIntelligence />;
      case 'communication':
        return <CommunicationHub />;
      default:
        return <DashboardHome onNavigate={setActiveTab} />;
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