import { 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  addDoc, 
  setDoc, 
  updateDoc, 
  deleteDoc,
  query, 
  where, 
  orderBy, 
  limit,
  startAfter,
  Timestamp,
  serverTimestamp,
  writeBatch,
  DocumentData,
  QueryConstraint
} from 'firebase/firestore';
import { auth, db, storage } from './firebase';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';

// Type Definitions
export interface User {
  id: string;
  email: string;
  displayName: string;
  photoURL?: string;
  provider: 'google' | 'microsoft' | 'email' | 'guest';
  subscription: {
    plan: 'trial' | 'free' | 'pro' | 'business' | 'enterprise';
    status: 'active' | 'cancelled' | 'expired';
    startDate: Date;
    endDate: Date;
    trialEndsAt?: Date;
  };
  preferences: {
    theme: 'light' | 'dark' | 'system';
    defaultWorkspace?: string;
    notifications: boolean;
  };
  usage: {
    apiCalls: number;
    storageUsed: number;
    lastReset: Date;
  };
  createdAt: Date;
  updatedAt: Date;
  lastLoginAt: Date;
}

export interface Workspace {
  id: string;
  name: string;
  description?: string;
  ownerId: string;
  icon?: string;
  color?: string;
  aiInstructions?: string;
  settings: {
    visibility: 'private' | 'team' | 'public';
    defaultAgentMode?: 'BI' | 'AI' | 'GX';
  };
  createdAt: Date;
  updatedAt: Date;
}

export interface Automation {
  id: string;
  userId: string;
  workspaceId?: string;
  name: string;
  description?: string;
  type: 'social_media' | 'email' | 'report' | 'data_sync' | 'custom';
  status: 'active' | 'paused' | 'completed' | 'failed';
  stats: {
    totalRuns: number;
    successfulRuns: number;
    failedRuns: number;
    lastRun?: Date;
    nextRun?: Date;
  };
  createdAt: Date;
  updatedAt: Date;
}

export interface Report {
  id: string;
  userId: string;
  workspaceId?: string;
  name: string;
  type: 'sales' | 'revenue' | 'performance' | 'custom';
  dateRange: {
    start: Date;
    end: Date;
  };
  data: {
    metrics: Record<string, number>;
    insights: Array<string>;
  };
  status: 'generating' | 'completed' | 'failed';
  createdAt: Date;
}

// Database Helper Class
export class DatabaseService {
  // ========================================
  // USER OPERATIONS
  // ========================================
  
  static async createUser(userId: string, userData: Partial<User>) {
    const userRef = doc(db, 'users', userId);
    const defaultData: Partial<User> = {
      subscription: {
        plan: 'trial',
        status: 'active',
        startDate: new Date(),
        endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        trialEndsAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      },
      preferences: {
        theme: 'dark',
        notifications: true,
      },
      usage: {
        apiCalls: 0,
        storageUsed: 0,
        lastReset: new Date(),
      },
      createdAt: new Date(),
      updatedAt: new Date(),
      lastLoginAt: new Date(),
    };
    
    await setDoc(userRef, {
      ...defaultData,
      ...userData,
      id: userId,
    });
    
    return userId;
  }
  
  static async getUser(userId: string): Promise<User | null> {
    const userRef = doc(db, 'users', userId);
    const userSnap = await getDoc(userRef);
    
    if (userSnap.exists()) {
      return { id: userSnap.id, ...userSnap.data() } as User;
    }
    return null;
  }
  
  static async updateUser(userId: string, data: Partial<User>) {
    const userRef = doc(db, 'users', userId);
    await updateDoc(userRef, {
      ...data,
      updatedAt: serverTimestamp(),
    });
  }
  
  static async updateLastLogin(userId: string) {
    const userRef = doc(db, 'users', userId);
    await updateDoc(userRef, {
      lastLoginAt: serverTimestamp(),
    });
  }
  
  // ========================================
  // WORKSPACE OPERATIONS
  // ========================================
  
  static async createWorkspace(userId: string, workspaceData: Partial<Workspace>) {
    const workspacesRef = collection(db, 'workspaces');
    const docRef = await addDoc(workspacesRef, {
      ...workspaceData,
      ownerId: userId,
      settings: workspaceData.settings || {
        visibility: 'private',
      },
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    
    return docRef.id;
  }
  
  static async getUserWorkspaces(userId: string): Promise<Workspace[]> {
    const workspacesRef = collection(db, 'workspaces');
    const q = query(
      workspacesRef,
      where('ownerId', '==', userId),
      orderBy('createdAt', 'desc')
    );
    
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Workspace));
  }
  
  static async getWorkspace(workspaceId: string): Promise<Workspace | null> {
    const workspaceRef = doc(db, 'workspaces', workspaceId);
    const workspaceSnap = await getDoc(workspaceRef);
    
    if (workspaceSnap.exists()) {
      return { id: workspaceSnap.id, ...workspaceSnap.data() } as Workspace;
    }
    return null;
  }
  
  static async updateWorkspace(workspaceId: string, data: Partial<Workspace>) {
    const workspaceRef = doc(db, 'workspaces', workspaceId);
    await updateDoc(workspaceRef, {
      ...data,
      updatedAt: serverTimestamp(),
    });
  }
  
  static async deleteWorkspace(workspaceId: string) {
    const workspaceRef = doc(db, 'workspaces', workspaceId);
    await deleteDoc(workspaceRef);
  }
  
  // ========================================
  // AUTOMATION OPERATIONS
  // ========================================
  
  static async createAutomation(userId: string, automationData: Partial<Automation>) {
    const automationsRef = collection(db, 'automations');
    const docRef = await addDoc(automationsRef, {
      ...automationData,
      userId,
      status: automationData.status || 'active',
      stats: automationData.stats || {
        totalRuns: 0,
        successfulRuns: 0,
        failedRuns: 0,
      },
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    
    return docRef.id;
  }
  
  static async getUserAutomations(userId: string, status?: string): Promise<Automation[]> {
    const automationsRef = collection(db, 'automations');
    const constraints: QueryConstraint[] = [
      where('userId', '==', userId),
      orderBy('createdAt', 'desc')
    ];
    
    if (status) {
      constraints.splice(1, 0, where('status', '==', status));
    }
    
    const q = query(automationsRef, ...constraints);
    const snapshot = await getDocs(q);
    
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Automation));
  }
  
  static async updateAutomation(automationId: string, data: Partial<Automation>) {
    const automationRef = doc(db, 'automations', automationId);
    await updateDoc(automationRef, {
      ...data,
      updatedAt: serverTimestamp(),
    });
  }
  
  static async deleteAutomation(automationId: string) {
    const automationRef = doc(db, 'automations', automationId);
    await deleteDoc(automationRef);
  }
  
  // ========================================
  // REPORT OPERATIONS
  // ========================================
  
  static async createReport(userId: string, reportData: Partial<Report>) {
    const reportsRef = collection(db, 'reports');
    const docRef = await addDoc(reportsRef, {
      ...reportData,
      userId,
      status: 'generating',
      createdAt: serverTimestamp(),
    });
    
    return docRef.id;
  }
  
  static async getUserReports(userId: string, reportType?: string): Promise<Report[]> {
    const reportsRef = collection(db, 'reports');
    const constraints: QueryConstraint[] = [
      where('userId', '==', userId),
      orderBy('createdAt', 'desc'),
      limit(20)
    ];
    
    if (reportType) {
      constraints.splice(1, 0, where('type', '==', reportType));
    }
    
    const q = query(reportsRef, ...constraints);
    const snapshot = await getDocs(q);
    
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Report));
  }
  
  static async updateReport(reportId: string, data: Partial<Report>) {
    const reportRef = doc(db, 'reports', reportId);
    await updateDoc(reportRef, data);
  }
  
  // ========================================
  // SWOT ANALYSIS OPERATIONS
  // ========================================
  
  static async createSwotAnalysis(userId: string, swotData: any) {
    const swotRef = collection(db, 'swot_analyses');
    const docRef = await addDoc(swotRef, {
      ...swotData,
      userId,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    
    return docRef.id;
  }
  
  static async getUserSwotAnalyses(userId: string) {
    const swotRef = collection(db, 'swot_analyses');
    const q = query(
      swotRef,
      where('userId', '==', userId),
      orderBy('createdAt', 'desc')
    );
    
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  }
  
  // ========================================
  // COMPETITIVE ANALYSIS OPERATIONS
  // ========================================
  
  static async createCompetitiveAnalysis(userId: string, analysisData: any) {
    const analysisRef = collection(db, 'competitive_analyses');
    const docRef = await addDoc(analysisRef, {
      ...analysisData,
      userId,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    
    return docRef.id;
  }
  
  static async getUserCompetitiveAnalyses(userId: string) {
    const analysisRef = collection(db, 'competitive_analyses');
    const q = query(
      analysisRef,
      where('userId', '==', userId),
      orderBy('createdAt', 'desc')
    );
    
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  }
  
  // ========================================
  // GROWTH STRATEGY OPERATIONS
  // ========================================
  
  static async createGrowthStrategy(userId: string, strategyData: any) {
    const strategyRef = collection(db, 'growth_strategies');
    const docRef = await addDoc(strategyRef, {
      ...strategyData,
      userId,
      status: strategyData.status || 'draft',
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    
    return docRef.id;
  }
  
  static async getUserGrowthStrategies(userId: string) {
    const strategyRef = collection(db, 'growth_strategies');
    const q = query(
      strategyRef,
      where('userId', '==', userId),
      orderBy('priority', 'desc')
    );
    
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  }
  
  // ========================================
  // SOCIAL CONTENT OPERATIONS
  // ========================================
  
  static async createSocialContent(userId: string, contentData: any) {
    const contentRef = collection(db, 'social_content');
    const docRef = await addDoc(contentRef, {
      ...contentData,
      userId,
      status: 'generating',
      createdAt: serverTimestamp(),
    });
    
    return docRef.id;
  }
  
  static async getUserSocialContent(userId: string, platform?: string) {
    const contentRef = collection(db, 'social_content');
    const constraints: QueryConstraint[] = [
      where('userId', '==', userId),
      orderBy('createdAt', 'desc'),
      limit(20)
    ];
    
    if (platform) {
      constraints.splice(1, 0, where('platform', '==', platform));
    }
    
    const q = query(contentRef, ...constraints);
    const snapshot = await getDocs(q);
    
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  }
  
  static async updateSocialContent(contentId: string, data: any) {
    const contentRef = doc(db, 'social_content', contentId);
    await updateDoc(contentRef, data);
  }
  
  // ========================================
  // NOTIFICATION OPERATIONS
  // ========================================
  
  static async createNotification(userId: string, notificationData: any) {
    const notifRef = collection(db, 'notifications');
    const docRef = await addDoc(notifRef, {
      ...notificationData,
      userId,
      read: false,
      createdAt: serverTimestamp(),
    });
    
    return docRef.id;
  }
  
  static async getUserNotifications(userId: string, unreadOnly = false) {
    const notifRef = collection(db, 'notifications');
    const constraints: QueryConstraint[] = [
      where('userId', '==', userId),
      orderBy('createdAt', 'desc'),
      limit(50)
    ];
    
    if (unreadOnly) {
      constraints.splice(1, 0, where('read', '==', false));
    }
    
    const q = query(notifRef, ...constraints);
    const snapshot = await getDocs(q);
    
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  }
  
  static async markNotificationAsRead(notificationId: string) {
    const notifRef = doc(db, 'notifications', notificationId);
    await updateDoc(notifRef, {
      read: true,
      readAt: serverTimestamp(),
    });
  }
  
  // ========================================
  // STORAGE OPERATIONS
  // ========================================
  
  static async uploadFile(
    path: string,
    file: File | Blob,
    metadata?: any
  ): Promise<string> {
    const storageRef = ref(storage, path);
    const snapshot = await uploadBytes(storageRef, file, metadata);
    const downloadURL = await getDownloadURL(snapshot.ref);
    return downloadURL;
  }
  
  static async uploadUserProfileImage(userId: string, file: File): Promise<string> {
    const path = `users/${userId}/profile/${Date.now()}_${file.name}`;
    return this.uploadFile(path, file, { contentType: file.type });
  }
  
  static async uploadSocialMediaImage(userId: string, contentId: string, file: File): Promise<string> {
    const path = `social-content/${userId}/${contentId}/${Date.now()}_${file.name}`;
    return this.uploadFile(path, file, { contentType: file.type });
  }
  
  static async deleteFile(path: string): Promise<void> {
    const storageRef = ref(storage, path);
    await deleteObject(storageRef);
  }
  
  // ========================================
  // BATCH OPERATIONS
  // ========================================
  
  static async initializeNewUser(userId: string, userData: Partial<User>) {
    const batch = writeBatch(db);
    
    // Create user document
    const userRef = doc(db, 'users', userId);
    batch.set(userRef, {
      ...userData,
      id: userId,
      subscription: {
        plan: 'trial',
        status: 'active',
        startDate: serverTimestamp(),
        endDate: Timestamp.fromDate(new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)),
        trialEndsAt: Timestamp.fromDate(new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)),
      },
      preferences: {
        theme: 'dark',
        notifications: true,
      },
      usage: {
        apiCalls: 0,
        storageUsed: 0,
        lastReset: serverTimestamp(),
      },
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      lastLoginAt: serverTimestamp(),
    });
    
    // Create default workspace
    const workspaceRef = doc(collection(db, 'workspaces'));
    batch.set(workspaceRef, {
      name: 'My Workspace',
      description: 'Default workspace',
      ownerId: userId,
      settings: {
        visibility: 'private',
      },
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    
    // Create subscription
    const subscriptionRef = doc(db, 'subscriptions', userId);
    batch.set(subscriptionRef, {
      userId,
      plan: 'trial',
      status: 'active',
      trialEndsAt: Timestamp.fromDate(new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)),
      features: {
        maxWorkspaces: 1,
        maxTeamMembers: 1,
        apiCallsPerMonth: 1000,
        storageGB: 5,
        customDomain: false,
        whiteLabel: false,
      },
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    
    await batch.commit();
    return workspaceRef.id;
  }
}

export default DatabaseService;
