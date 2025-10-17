'use client';

import { useAuthStore } from '@/lib/store';
import { SignInForm } from '@/components/auth/sign-in-form';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { useFirebaseAuth } from '@/lib/hooks/use-firebase-auth';
import { Spinner } from '@heroui/react';

export default function Home() {
  const { isAuthenticated } = useAuthStore();
  const { loading } = useFirebaseAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Spinner size="lg" label="Loading..." />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <SignInForm />;
  }

  return <DashboardLayout />;
}