'use client';

import { useState, useEffect } from 'react';
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
  const { activeAgent, sidebarCollapsed, setSidebarCollapsed } = useAppStore();
  const [isMobile, setIsMobile] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      
      // Only auto-collapse on initial load if mobile
      if (!isInitialized && mobile) {
        setSidebarCollapsed(true);
        setIsInitialized(true);
      }
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, [isInitialized, setSidebarCollapsed]);

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
    <div className="h-screen flex flex-col md:flex-row bg-gray-50 dark:bg-gray-900">
      {/* Mobile overlay for sidebar */}
      {isMobile && !sidebarCollapsed && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={() => setSidebarCollapsed(true)}
        />
      )}
      
      {/* Sidebar */}
      <div className={`${isMobile && !sidebarCollapsed ? 'fixed inset-y-0 left-0 z-50' : ''} ${isMobile && sidebarCollapsed ? 'hidden' : ''}`}>
        <Sidebar />
      </div>
      
      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden w-full">
        <TopNavigation />
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-50 dark:bg-gray-900">
          <div className="container mx-auto px-3 sm:px-4 md:px-6 py-4 sm:py-6 md:py-8">
            {renderContent()}
          </div>
        </main>
      </div>
    </div>
  );
}
