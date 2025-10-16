'use client';

import { useState } from 'react';
import { Button, Tooltip, Divider } from '@heroui/react';
import { 
  Home, 
  BarChart3, 
  Bot, 
  TrendingUp, 
  Settings, 
  ChevronLeft, 
  ChevronRight,
  Link as LinkIcon,
  Target,
  Building2,
  Newspaper,
  Sparkles,
  Briefcase
} from 'lucide-react';
import { useAppStore, useAuthStore } from '@/lib/store';
import { cn } from '@/lib/utils';
import { TrigentLogo } from '@/components/ui/trigent-logo';

const sidebarSections = [
  {
    title: 'Overview',
    items: [
      { id: 'dashboard', label: 'Dashboard', icon: Home }
    ]
  },
  {
    title: 'Trigent AI Agents',
    items: [
      { id: 'bi-agent', label: 'BI Agent', icon: BarChart3 },
      { id: 'ai-agent', label: 'AI Agent', icon: Bot },
      { id: 'gx-agent', label: 'GX Agent', icon: TrendingUp }
    ]
  },
  {
    title: 'Business Intelligence',
    items: [
      { id: 'swot', label: 'SWOT Analysis', icon: Target },
      { id: 'competitive', label: 'Competitive Analysis', icon: Building2 },
      { id: 'news', label: 'News Feed', icon: Newspaper }
    ]
  },
  {
    title: 'Configuration',
    items: [
      { id: 'connections', label: 'Connections', icon: LinkIcon },
      { id: 'settings', label: 'Settings', icon: Settings }
    ]
  }
];

export function Sidebar() {
  const { activeAgent, setActiveAgent, sidebarCollapsed, setSidebarCollapsed } = useAppStore();
  const { user, getTrialDaysLeft, isTrialExpired } = useAuthStore();

  const trialDaysLeft = getTrialDaysLeft();
  const isExpired = isTrialExpired();
  const isTrialUser = user?.subscription?.type === 'trial';

  const handleMenuItemClick = (itemId: string) => {
    setActiveAgent(itemId);
    // Auto-close sidebar on mobile after selecting an item
    if (window.innerWidth < 768) {
      setSidebarCollapsed(true);
    }
  };

  return (
    <div
      className={cn(
        'bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 transition-all duration-300 flex flex-col h-full',
        sidebarCollapsed ? 'w-16' : 'w-64'
      )}
    >
      {/* Header */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between flex-shrink-0">
        {!sidebarCollapsed && (
          <div className="flex items-center space-x-3">
            <TrigentLogo size="sm" />
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">TrigentAI</h2>
          </div>
        )}
        {sidebarCollapsed && (
          <TrigentLogo size="sm" />
        )}
        <Button
          isIconOnly
          variant="ghost"
          size="sm"
          onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
          className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
        >
          {sidebarCollapsed ? (
            <ChevronRight className="w-4 h-4" />
          ) : (
            <ChevronLeft className="w-4 h-4" />
          )}
        </Button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-4 overflow-y-auto overflow-x-hidden">
        <div className="space-y-6 px-2">
          {sidebarSections.map((section, sectionIndex) => (
            <div key={section.title}>
              {/* Section Header */}
              {!sidebarCollapsed && (
                <h3 className="px-3 mb-2 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  {section.title}
                </h3>
              )}
              {sidebarCollapsed && sectionIndex > 0 && (
                <Divider className="my-2" />
              )}
              
              {/* Section Items */}
              <ul className="space-y-1">
                {section.items.map((item) => {
                  const Icon = item.icon;
                  const isActive = activeAgent === item.id;
                  
                  const buttonContent = (
                    <Button
                      key={item.id}
                      isIconOnly={sidebarCollapsed}
                      className={cn(
                        'w-full h-11 font-medium transition-all duration-200',
                        sidebarCollapsed ? 'min-w-[44px]' : 'justify-start',
                        isActive
                          ? sidebarCollapsed 
                            ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400'
                            : 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 border-r-2 border-blue-600'
                          : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                      )}
                      variant="light"
                      startContent={!sidebarCollapsed ? <Icon className="w-5 h-5" /> : undefined}
                      onClick={() => handleMenuItemClick(item.id)}
                    >
                      {sidebarCollapsed ? <Icon className="w-5 h-5" /> : item.label}
                    </Button>
                  );

                  if (sidebarCollapsed) {
                    return (
                      <li key={item.id}>
                        <Tooltip content={item.label} placement="right">
                          {buttonContent}
                        </Tooltip>
                      </li>
                    );
                  }

                  return <li key={item.id}>{buttonContent}</li>;
                })}
              </ul>
            </div>
          ))}
        </div>
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-gray-200 dark:border-gray-700 flex-shrink-0">
        {!sidebarCollapsed && (
          <div className="space-y-3">
            {/* Trial Status */}
            {isTrialUser && (
              <div className={`p-2 rounded-lg text-center ${
                isExpired 
                  ? 'bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800' 
                  : 'bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800'
              }`}>
                <p className={`text-xs font-medium ${
                  isExpired 
                    ? 'text-red-700 dark:text-red-300' 
                    : 'text-orange-700 dark:text-orange-300'
                }`}>
                  {isExpired ? 'Trial Expired' : `Trial: ${trialDaysLeft} days left`}
                </p>
              </div>
            )}

            {user?.subscription?.type === 'pro' && (
              <div className="p-2 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg text-center">
                <p className="text-xs font-medium text-green-700 dark:text-green-300">
                  Pro Plan Active
                </p>
              </div>
            )}

            <div className="text-xs text-gray-500 dark:text-gray-400 text-center">
              <p className="mb-1">TrigentAI v1.0</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
