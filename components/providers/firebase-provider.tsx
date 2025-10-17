'use client';

import { useEffect, useState } from 'react';
import { auth, analytics } from '@/lib/firebase';

export function FirebaseProvider({ children }: { children: React.ReactNode }) {
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    // Firebase is automatically initialized when imported
    // This component ensures it happens early in the app lifecycle
    if (typeof window !== 'undefined') {
      console.log('🔥 Firebase Provider: Checking initialization...');
      
      // Check if auth is available
      if (auth) {
        console.log('✅ Firebase Auth is ready');
      }
      
      // Check if analytics is available
      if (analytics) {
        console.log('✅ Firebase Analytics is ready');
      }
      
      setIsInitialized(true);
    }
  }, []);

  // You can optionally show a loading state
  if (!isInitialized && typeof window !== 'undefined') {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Initializing Firebase...</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
