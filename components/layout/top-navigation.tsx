'use client';

import { useState } from 'react';
import { 
  Button, 
  Avatar, 
  Dropdown, 
  DropdownTrigger, 
  DropdownMenu, 
  DropdownItem,
  Badge,
  Switch
} from '@heroui/react';
import { 
  Bell, 
  Sun, 
  Moon, 
  LogOut, 
  User, 
  Settings,
  Crown,
  Clock
} from 'lucide-react';
import { useTheme } from 'next-themes';
import { useAuthStore } from '@/lib/store';
import { WorkspaceSelector } from '@/components/ui/workspace-selector';

export function TopNavigation() {
  const [notifications] = useState([
    { id: '1', message: 'New report generated', time: '2 min ago' },
    { id: '2', message: 'Automation completed', time: '5 min ago' },
  ]);
  const { theme, setTheme } = useTheme();
  const { user, logout, isTrialExpired, getTrialDaysLeft } = useAuthStore();

  const trialDaysLeft = getTrialDaysLeft();
  const isExpired = isTrialExpired();
  const isTrialUser = user?.subscription?.type === 'trial';

  const handleLogout = () => {
    logout();
  };

  return (
    <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4">
      <div className="flex items-center justify-between">
        {/* Left side - workspace selector and breadcrumbs */}
        <div className="flex items-center space-x-4">
          <WorkspaceSelector />
          <div className="hidden md:block">
            <h1 className="text-xl font-medium text-gray-700 dark:text-gray-300">
              Welcome back, {user?.name || 'User'}
            </h1>
          </div>
        </div>

        {/* Right side - actions */}
        <div className="flex items-center space-x-4">
          {/* Trial Status Badge */}
          {isTrialUser && (
            <div className="flex items-center space-x-2">
              {!isExpired ? (
                <Badge 
                  content={trialDaysLeft}
                  color="warning"
                  size="sm"
                  showOutline={false}
                >
                  <Button
                    variant="flat"
                    color="warning"
                    size="sm"
                    startContent={<Clock className="w-4 h-4" />}
                  >
                    Trial
                  </Button>
                </Badge>
              ) : (
                <Button
                  variant="flat"
                  color="danger"
                  size="sm"
                  startContent={<Crown className="w-4 h-4" />}
                >
                  Upgrade to Pro
                </Button>
              )}
            </div>
          )}

          {user?.subscription?.type === 'pro' && (
            <Button
              variant="flat"
              color="success"
              size="sm"
              startContent={<Crown className="w-4 h-4" />}
            >
              Pro
            </Button>
          )}

          {/* Theme Toggle */}
          <div className="flex items-center space-x-2">
            <Sun className="w-4 h-4 text-gray-500 dark:text-gray-400" />
            <Switch
              isSelected={theme === 'dark'}
              onValueChange={(checked) => setTheme(checked ? 'dark' : 'light')}
              color="primary"
              size="sm"
            />
            <Moon className="w-4 h-4 text-gray-500 dark:text-gray-400" />
          </div>

          {/* Notifications */}
          <Dropdown>
            <DropdownTrigger>
              <Button
                isIconOnly
                variant="light"
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              >
                <Badge content={notifications.length} color="danger" size="sm">
                  <Bell className="w-5 h-5" />
                </Badge>
              </Button>
            </DropdownTrigger>
            <DropdownMenu aria-label="Notifications" className="w-80">
              {notifications.map((notification) => (
                <DropdownItem
                  key={notification.id}
                  className="p-3"
                  textValue={notification.message}
                >
                  <div>
                    <p className="text-sm font-medium">{notification.message}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{notification.time}</p>
                  </div>
                </DropdownItem>
              ))}
            </DropdownMenu>
          </Dropdown>

          {/* User Menu */}
          <Dropdown>
            <DropdownTrigger>
              <Avatar
                as="button"
                className="transition-transform"
                name={user?.name}
                size="sm"
                src={user?.avatar}
              />
            </DropdownTrigger>
            <DropdownMenu aria-label="User Actions">
              <DropdownItem
                key="profile"
                startContent={<User className="w-4 h-4" />}
              >
                Profile
              </DropdownItem>
              <DropdownItem
                key="settings"
                startContent={<Settings className="w-4 h-4" />}
              >
                Settings
              </DropdownItem>
              <DropdownItem
                key="logout"
                color="danger"
                startContent={<LogOut className="w-4 h-4" />}
                onClick={handleLogout}
              >
                Sign Out
              </DropdownItem>
            </DropdownMenu>
          </Dropdown>
        </div>
      </div>
    </header>
  );
}
