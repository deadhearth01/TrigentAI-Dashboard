'use client';

import { useEffect, useState } from 'react';
import { onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { useAuthStore } from '@/lib/store';
import DatabaseService from '@/lib/database';

export function useFirebaseAuth() {
  const [loading, setLoading] = useState(true);
  const { setUser, mode } = useAuthStore();

  useEffect(() => {
    if (mode !== 'cloud') {
      setLoading(false);
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser: FirebaseUser | null) => {
      try {
        if (firebaseUser) {
          // User is signed in
          const dbUser = await DatabaseService.getUser(firebaseUser.uid);
          
          if (dbUser) {
            setUser({
              id: firebaseUser.uid,
              email: firebaseUser.email || dbUser.email,
              name: firebaseUser.displayName || dbUser.displayName,
              provider: dbUser.provider as any,
              created_at: firebaseUser.metadata.creationTime || new Date().toISOString(),
            });
          }
        } else {
          // User is signed out
          setUser(null);
        }
      } catch (error) {
        console.error('Auth state change error:', error);
      } finally {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, [mode, setUser]);

  return { loading };
}
