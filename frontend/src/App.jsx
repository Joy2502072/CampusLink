import React, { useState } from 'react';
import Layout from './components/layout/Layout';
import DashboardHome from './components/dashboard/DashboardHome';
import AtRiskStudents from './components/atRisk/AtRiskStudents';
import SchedulerOverview from './components/scheduler/SchedulerOverview';
import CommunicationHub from './components/communication/CommunicationHub';
import PlaceholderView from './components/common/PlaceholderView';

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [searchTerm, setSearchTerm] = useState('');

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <DashboardHome searchTerm={searchTerm} />;

      case 'at-risk':
        return <AtRiskStudents />;

      case 'drives':
        return <SchedulerOverview />;

      case 'analytics':
        return (
          <PlaceholderView
            title="Advanced Placement Analytics"
            description="Deep cohort segmentation, company tiers (Dream, Super Dream, Regular), and recruiter retention curves will be available here in a future release."
            onBackToDashboard={() => setActiveTab('dashboard')}
          />
        );

      case 'communication':
        return <CommunicationHub />;

      default:
        return <DashboardHome searchTerm={searchTerm} />;
    }
  };

  return (
    <Layout
      activeTab={activeTab}
      onSelectTab={setActiveTab}
      searchTerm={searchTerm}
      onSearchChange={setSearchTerm}
    >
      {renderContent()}
    </Layout>
  );
}