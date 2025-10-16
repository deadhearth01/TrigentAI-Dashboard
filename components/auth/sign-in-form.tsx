'use client';

import { useState } from 'react';
import { Button, Card, CardBody, Divider, Switch } from '@heroui/react';
import { Chrome, User, Settings, Shield, Zap } from 'lucide-react';
import { useAuthStore } from '@/lib/store';
import { localDB } from '@/lib/local-db';
import { TrigentLogo } from '@/components/ui/trigent-logo';

export function SignInForm() {
  const [isLoading, setIsLoading] = useState(false);
  const { setUser, mode, setMode } = useAuthStore();

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    try {
      if (mode === 'local') {
        // Guest login for local mode
        const guestUser = {
          id: 'guest-' + Date.now(),
          email: 'guest@trigentai.local',
          name: 'Guest User',
          provider: 'guest' as const,
          created_at: new Date().toISOString(),
        };
        await localDB.createUser(guestUser);
        setUser(guestUser);
      } else {
        // TODO: Implement Supabase Google Auth
        console.log('Google sign-in for cloud mode - implement with Supabase');
      }
    } catch (error) {
      console.error('Sign-in error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleMicrosoftSignIn = async () => {
    setIsLoading(true);
    try {
      if (mode === 'local') {
        // Microsoft login simulation for local mode
        const microsoftUser = {
          id: 'microsoft-' + Date.now(),
          email: 'user@outlook.com',
          name: 'Microsoft User',
          provider: 'microsoft' as const,
          created_at: new Date().toISOString(),
        };
        await localDB.createUser(microsoftUser);
        setUser(microsoftUser);
      } else {
        // TODO: Implement Supabase Microsoft Auth
        console.log('Microsoft sign-in for cloud mode - implement with Supabase');
      }
    } catch (error) {
      console.error('Sign-in error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGuestLogin = async () => {
    setIsLoading(true);
    try {
      const guestUser = {
        id: 'guest-' + Date.now(),
        email: 'guest@trigentai.local',
        name: 'Guest User',
        provider: 'guest' as const,
        created_at: new Date().toISOString(),
      };
      await localDB.createUser(guestUser);
      setUser(guestUser);
    } catch (error) {
      console.error('Guest login error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900 p-4">
      <div className="w-full max-w-md">
        {/* Logo and Branding */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <TrigentLogo size="xl" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            TrigentAI
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            AI-Powered Business Intelligence Platform
          </p>
        </div>

        <Card className="p-6 shadow-2xl border-0 bg-white/90 dark:bg-gray-800/90 backdrop-blur-xl">
          <CardBody className="p-0">
            {/* Mode Toggle */}
            <div className="flex items-center justify-between mb-6 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
              <div className="flex items-center space-x-2">
                <Settings className="w-4 h-4" />
                <span className="text-sm font-medium">Mode</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-600 dark:text-gray-400">Local</span>
                <Switch
                  isSelected={mode === 'cloud'}
                  onValueChange={(checked) => setMode(checked ? 'cloud' : 'local')}
                  color="primary"
                  size="sm"
                />
                <span className="text-sm text-gray-600 dark:text-gray-400">Cloud</span>
              </div>
            </div>

            <div className="space-y-4">
              {mode === 'local' ? (
                <>
                  <Button
                    className="w-full h-12 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-medium"
                    onClick={handleGuestLogin}
                    isLoading={isLoading}
                    startContent={<User className="w-5 h-5" />}
                  >
                    Continue as Guest
                  </Button>
                  
                  <Divider className="my-4" />
                  
                  <div className="flex items-center justify-center space-x-2 text-xs text-gray-500 dark:text-gray-400">
                    <Shield className="w-4 h-4" />
                    <span>Local mode - Data stored securely on your device</span>
                  </div>
                </>
              ) : (
                <>
                  <Button
                    className="w-full h-12 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 font-medium hover:bg-gray-50 dark:hover:bg-gray-600"
                    onClick={handleGoogleSignIn}
                    isLoading={isLoading}
                    startContent={<Chrome className="w-5 h-5" />}
                  >
                    Continue with Google
                  </Button>

                  <Button
                    className="w-full h-12 bg-blue-600 hover:bg-blue-700 text-white font-medium"
                    onClick={handleMicrosoftSignIn}
                    isLoading={isLoading}
                    startContent={
                      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M11.4 24H0V12.6h11.4V24zM24 24H12.6V12.6H24V24zM11.4 11.4H0V0h11.4v11.4zM24 11.4H12.6V0H24v11.4z"/>
                      </svg>
                    }
                  >
                    Continue with Microsoft
                  </Button>
                  
                  <Divider className="my-4" />
                  
                  <div className="flex items-center justify-center space-x-2 text-xs text-gray-500 dark:text-gray-400">
                    <Zap className="w-4 h-4" />
                    <span>Cloud mode - Data synced with Supabase</span>
                  </div>
                </>
              )}
            </div>
          </CardBody>
        </Card>

        <p className="text-center text-xs text-gray-500 dark:text-gray-400 mt-6">
          By continuing, you agree to our Terms of Service and Privacy Policy
        </p>
      </div>
    </div>
  );
}
