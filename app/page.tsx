'use client';

import { useAuthStore } from '@/lib/store';
import { SignInForm } from '@/components/auth/sign-in-form';
import { DashboardLayout } from '@/components/layout/dashboard-layout';

export default function Home() {
  const { isAuthenticated } = useAuthStore();

  if (!isAuthenticated) {
    return <SignInForm />;
  }

  return <DashboardLayout />;
}