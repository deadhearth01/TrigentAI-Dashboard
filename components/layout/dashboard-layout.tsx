'use client';

import { useState } from 'react';
import { Sidebar } from './sidebar';
import { TopNavigation } from './top-navigation';
import { DashboardOverview } from '@/components/dashboard/dashboard-overview';
import { BIAgent } from '@/components/agents/bi-agent';
import { AIAgent } from '@/components/agents/ai-agent';
import { GXAgent } from '@/components/agents/gx-agent';
import { SettingsPage } from '@/components/settings/settings-page';
import { ConnectionsPage } from '@/components/connections/connections-page';
import { SWOTAnalysis } from '@/components/analysis/swot-analysis';
import { CompetitiveAnalysis } from '@/components/analysis/competitive-analysis';
import { NewsFeedPage } from '@/components/news/news-feed-page';
import { useAppStore } from '@/lib/store';

export function DashboardLayout() {
  const { activeAgent } = useAppStore();

  const renderContent = () => {
    switch (activeAgent) {
      case 'dashboard':
        return <DashboardOverview />;
      case 'bi-agent':
        return <BIAgent />;
      case 'ai-agent':
        return <AIAgent />;
      case 'gx-agent':
        return <GXAgent />;
      case 'swot':
        return <SWOTAnalysis />;
      case 'competitive':
        return <CompetitiveAnalysis />;
      case 'news':
        return <NewsFeedPage />;
      case 'settings':
        return <SettingsPage />;
      case 'connections':
        return <ConnectionsPage />;
      default:
        return <DashboardOverview />;
    }
  };

  return (
    <div className="h-screen flex bg-gray-50 dark:bg-gray-900">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <TopNavigation />
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-50 dark:bg-gray-900">
          <div className="container mx-auto px-6 py-8">
            {renderContent()}
          </div>
        </main>
      </div>
    </div>
  );
}
