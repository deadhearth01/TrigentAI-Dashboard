'use client';

import { useState, useEffect } from 'react';
import { useAuthStore } from '@/lib/store';
import DatabaseService, { Workspace } from '@/lib/database';
import { auth } from '@/lib/firebase';

export function useWorkspaces() {
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [loading, setLoading] = useState(true);
  const { user, mode, currentWorkspace, setCurrentWorkspace } = useAuthStore();

  useEffect(() => {
    loadWorkspaces();
  }, [user, mode]);

  const loadWorkspaces = async () => {
    if (!user) {
      setWorkspaces([]);
      setLoading(false);
      return;
    }

    try {
      if (mode === 'cloud' && auth.currentUser) {
        const userWorkspaces = await DatabaseService.getUserWorkspaces(auth.currentUser.uid);
        setWorkspaces(userWorkspaces);
        
        // Set first workspace as current if none selected
        if (!currentWorkspace && userWorkspaces.length > 0) {
          setCurrentWorkspace(userWorkspaces[0]);
        }
      }
    } catch (error) {
      console.error('Error loading workspaces:', error);
    } finally {
      setLoading(false);
    }
  };

  const createWorkspace = async (name: string, description?: string) => {
    if (!user || mode !== 'cloud' || !auth.currentUser) {
      throw new Error('User not authenticated');
    }

    try {
      const workspaceId = await DatabaseService.createWorkspace(auth.currentUser.uid, {
        name,
        description,
        settings: {
          visibility: 'private',
        },
      });

      await loadWorkspaces();
      return workspaceId;
    } catch (error) {
      console.error('Error creating workspace:', error);
      throw error;
    }
  };

  const updateWorkspace = async (workspaceId: string, updates: Partial<Workspace>) => {
    try {
      await DatabaseService.updateWorkspace(workspaceId, updates);
      await loadWorkspaces();
    } catch (error) {
      console.error('Error updating workspace:', error);
      throw error;
    }
  };

  const deleteWorkspace = async (workspaceId: string) => {
    try {
      await DatabaseService.deleteWorkspace(workspaceId);
      
      // If deleted workspace was current, select another
      if (currentWorkspace?.id === workspaceId) {
        const remaining = workspaces.filter(w => w.id !== workspaceId);
        setCurrentWorkspace(remaining[0] || null);
      }
      
      await loadWorkspaces();
    } catch (error) {
      console.error('Error deleting workspace:', error);
      throw error;
    }
  };

  return {
    workspaces,
    loading,
    currentWorkspace,
    setCurrentWorkspace,
    createWorkspace,
    updateWorkspace,
    deleteWorkspace,
    reload: loadWorkspaces,
  };
}
