import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  provider: 'google' | 'microsoft' | 'guest';
  created_at: string;
  subscription?: {
    type: 'free' | 'pro' | 'trial';
    trial_start?: string;
    trial_end?: string;
    expires_at?: string;
  };
}

export interface Workspace {
  id: string;
  name: string;
  description?: string;
  ownerId?: string;
  icon?: string;
  color?: string;
  aiInstructions?: string;
  settings?: {
    visibility: 'private' | 'team' | 'public';
    defaultAgentMode?: 'BI' | 'AI' | 'GX';
  };
  createdAt?: Date;
  updatedAt?: Date;
  // Legacy fields for compatibility
  created_at?: string;
  user_id?: string;
  ai_instructions?: string;
  agent_type?: 'bi' | 'ai' | 'gx' | 'all';
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  mode: 'local' | 'cloud';
  currentWorkspace: Workspace | null;
  workspaces: Workspace[];
  setUser: (user: User | null) => void;
  logout: () => void;
  setMode: (mode: 'local' | 'cloud') => void;
  updateSubscription: (subscription: User['subscription']) => void;
  isTrialExpired: () => boolean;
  getTrialDaysLeft: () => number;
  setCurrentWorkspace: (workspace: Workspace) => void;
  addWorkspace: (workspace: Workspace) => void;
  updateWorkspace: (workspaceId: string, updates: Partial<Workspace>) => void;
  deleteWorkspace: (workspaceId: string) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      mode: (process.env.NEXT_PUBLIC_MODE as 'local' | 'cloud') || 'local',
      currentWorkspace: null,
      workspaces: [],
      setUser: (user: User | null) => {
        if (!user) {
          set({ user: null, isAuthenticated: false, currentWorkspace: null });
          return;
        }
        
        // Initialize trial for new users
        if (!user.subscription && user.provider !== 'guest') {
          const trialStart = new Date();
          const trialEnd = new Date();
          trialEnd.setDate(trialStart.getDate() + 7);
          
          user.subscription = {
            type: 'trial',
            trial_start: trialStart.toISOString(),
            trial_end: trialEnd.toISOString(),
          };
        }

        // Create default workspace for new users
        const defaultWorkspace: Workspace = {
          id: 'default-' + Date.now(),
          name: 'My Workspace',
          description: 'Default workspace for getting started',
          color: 'blue',
          ai_instructions: 'Provide clear, actionable insights and recommendations.',
          created_at: new Date().toISOString(),
          user_id: user.id,
          agent_type: 'all'
        };

        set({ 
          user, 
          isAuthenticated: true, 
          workspaces: [defaultWorkspace],
          currentWorkspace: defaultWorkspace
        });
      },
      logout: () =>
        set({ user: null, isAuthenticated: false, currentWorkspace: null, workspaces: [] }),
      setMode: (mode: 'local' | 'cloud') =>
        set({ mode }),
      updateSubscription: (subscription: User['subscription']) => {
        const user = get().user;
        if (user) {
          set({
            user: { ...user, subscription },
          });
        }
      },
      isTrialExpired: () => {
        const user = get().user;
        if (!user?.subscription || user.subscription.type !== 'trial') return false;
        if (!user.subscription.trial_end) return false;
        return new Date() > new Date(user.subscription.trial_end);
      },
      getTrialDaysLeft: () => {
        const user = get().user;
        if (!user?.subscription || user.subscription.type !== 'trial') return 0;
        if (!user.subscription.trial_end) return 0;
        
        const endDate = new Date(user.subscription.trial_end);
        const now = new Date();
        const diffTime = endDate.getTime() - now.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return Math.max(0, diffDays);
      },
      setCurrentWorkspace: (workspace: Workspace) => {
        set({ currentWorkspace: workspace });
      },
      addWorkspace: (workspace: Workspace) => {
        const workspaces = get().workspaces;
        set({ 
          workspaces: [...workspaces, workspace],
          currentWorkspace: workspace
        });
      },
      updateWorkspace: (workspaceId: string, updates: Partial<Workspace>) => {
        const workspaces = get().workspaces;
        const currentWorkspace = get().currentWorkspace;
        const updatedWorkspaces = workspaces.map(w => 
          w.id === workspaceId ? { ...w, ...updates } : w
        );
        set({ 
          workspaces: updatedWorkspaces,
          currentWorkspace: currentWorkspace?.id === workspaceId 
            ? { ...currentWorkspace, ...updates }
            : currentWorkspace
        });
      },
      deleteWorkspace: (workspaceId: string) => {
        const workspaces = get().workspaces;
        const currentWorkspace = get().currentWorkspace;
        const filteredWorkspaces = workspaces.filter(w => w.id !== workspaceId);
        
        set({ 
          workspaces: filteredWorkspaces,
          currentWorkspace: currentWorkspace?.id === workspaceId 
            ? filteredWorkspaces[0] || null
            : currentWorkspace
        });
      },
    }),
    {
      name: 'trigent-auth',
    }
  )
);

export interface AppState {
  sidebarCollapsed: boolean;
  activeAgent: string;
  notifications: any[];
  theme: 'light' | 'dark' | 'system';
  setSidebarCollapsed: (collapsed: boolean) => void;
  setActiveAgent: (agent: string) => void;
  addNotification: (notification: any) => void;
  removeNotification: (id: string) => void;
  setTheme: (theme: 'light' | 'dark' | 'system') => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      sidebarCollapsed: false,
      activeAgent: 'dashboard',
      notifications: [],
      theme: 'dark',
      setSidebarCollapsed: (collapsed: boolean) =>
        set({ sidebarCollapsed: collapsed }),
      setActiveAgent: (agent: string) =>
        set({ activeAgent: agent }),
      addNotification: (notification: any) =>
        set({ notifications: [...get().notifications, notification] }),
      removeNotification: (id: string) =>
        set({
          notifications: get().notifications.filter((n) => n.id !== id),
        }),
      setTheme: (theme: 'light' | 'dark' | 'system') =>
        set({ theme }),
    }),
    {
      name: 'trigent-app',
    }
  )
);
