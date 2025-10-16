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
  Clock,
  Menu
} from 'lucide-react';
import { useTheme } from 'next-themes';
import { useAuthStore, useAppStore } from '@/lib/store';
import { WorkspaceSelector } from '@/components/ui/workspace-selector';

export function TopNavigation() {
  const [notifications] = useState([
    { id: '1', message: 'New report generated', time: '2 min ago' },
    { id: '2', message: 'Automation completed', time: '5 min ago' },
  ]);
  const { theme, setTheme } = useTheme();
  const { user, logout, isTrialExpired, getTrialDaysLeft } = useAuthStore();
  const { sidebarCollapsed, setSidebarCollapsed } = useAppStore();

  const trialDaysLeft = getTrialDaysLeft();
  const isExpired = isTrialExpired();
  const isTrialUser = user?.subscription?.type === 'trial';

  const handleLogout = () => {
    logout();
  };

  return (
    <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-3 sm:px-4 md:px-6 py-3 md:py-4">
      <div className="flex items-center justify-between">
        {/* Left side - mobile menu + workspace selector */}
        <div className="flex items-center space-x-2 sm:space-x-4">
          {/* Mobile menu toggle */}
          <Button
            isIconOnly
            variant="light"
            size="sm"
            className="md:hidden"
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
          >
            <Menu className="w-5 h-5" />
          </Button>
          
          <div className="hidden sm:block">
            <WorkspaceSelector />
          </div>
          <div className="hidden lg:block">
            <h1 className="text-lg md:text-xl font-medium text-gray-700 dark:text-gray-300">
              Welcome back, {user?.name || 'User'}
            </h1>
          </div>
        </div>

        {/* Right side - actions */}
        <div className="flex items-center space-x-1 sm:space-x-2 md:space-x-4">
          {/* Trial Status Badge - Hidden on very small screens */}
          {isTrialUser && (
            <div className="hidden sm:flex items-center space-x-2">
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
                    className="hidden md:flex"
                  >
                    Trial
                  </Button>
                  <Button
                    isIconOnly
                    variant="flat"
                    color="warning"
                    size="sm"
                    className="md:hidden"
                  >
                    <Clock className="w-4 h-4" />
                  </Button>
                </Badge>
              ) : (
                <>
                  <Button
                    variant="flat"
                    color="danger"
                    size="sm"
                    startContent={<Crown className="w-4 h-4" />}
                    className="hidden md:flex"
                  >
                    Upgrade to Pro
                  </Button>
                  <Button
                    isIconOnly
                    variant="flat"
                    color="danger"
                    size="sm"
                    className="md:hidden"
                  >
                    <Crown className="w-4 h-4" />
                  </Button>
                </>
              )}
            </div>
          )}

          {user?.subscription?.type === 'pro' && (
            <>
              <Button
                variant="flat"
                color="success"
                size="sm"
                startContent={<Crown className="w-4 h-4" />}
                className="hidden md:flex"
              >
                Pro
              </Button>
              <Button
                isIconOnly
                variant="flat"
                color="success"
                size="sm"
                className="md:hidden"
              >
                <Crown className="w-4 h-4" />
              </Button>
            </>
          )}

          {/* Theme Toggle - Simplified for mobile */}
          <div className="hidden sm:flex items-center space-x-2">
            <Sun className="w-4 h-4 text-gray-500 dark:text-gray-400" />
            <Switch
              isSelected={theme === 'dark'}
              onValueChange={(checked) => setTheme(checked ? 'dark' : 'light')}
              color="primary"
              size="sm"
            />
            <Moon className="w-4 h-4 text-gray-500 dark:text-gray-400" />
          </div>
          
          {/* Mobile theme toggle */}
          <Button
            isIconOnly
            variant="light"
            size="sm"
            className="sm:hidden"
            onPress={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          >
            {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </Button>

          {/* Notifications */}
          <Dropdown>
            <DropdownTrigger>
              <Button
                isIconOnly
                variant="light"
                size="sm"
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              >
                <Badge content={notifications.length} color="danger" size="sm">
                  <Bell className="w-4 h-4 sm:w-5 sm:h-5" />
                </Badge>
              </Button>
            </DropdownTrigger>
            <DropdownMenu aria-label="Notifications" className="w-64 sm:w-80">
              {notifications.map((notification) => (
                <DropdownItem
                  key={notification.id}
                  className="p-2 sm:p-3"
                  textValue={notification.message}
                >
                  <div>
                    <p className="text-xs sm:text-sm font-medium">{notification.message}</p>
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
