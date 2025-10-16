import { initializeApp, getApps, FirebaseApp } from 'firebase/app';
import { 
  getAuth, 
  Auth,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  User
} from 'firebase/auth';
import { 
  getFirestore, 
  Firestore,
  collection,
  doc,
  setDoc,
  getDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  Timestamp
} from 'firebase/firestore';
import { 
  getStorage, 
  FirebaseStorage,
  ref,
  uploadBytes,
  getDownloadURL,
  deleteObject
} from 'firebase/storage';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// Initialize Firebase
let app: FirebaseApp;
let auth: Auth;
let db: Firestore;
let firebaseStorage: FirebaseStorage;

if (typeof window !== 'undefined') {
  if (!getApps().length) {
    app = initializeApp(firebaseConfig);
  } else {
    app = getApps()[0];
  }
  
  auth = getAuth(app);
  db = getFirestore(app);
  firebaseStorage = getStorage(app);
}

// Firebase Service Class
export class FirebaseService {
  private static instance: FirebaseService;
  
  static getInstance(): FirebaseService {
    if (!FirebaseService.instance) {
      FirebaseService.instance = new FirebaseService();
    }
    return FirebaseService.instance;
  }

  // Check if Firebase is configured
  isConfigured(): boolean {
    return !!(
      process.env.NEXT_PUBLIC_FIREBASE_API_KEY &&
      process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID
    );
  }

  // Authentication Methods
  async signIn(email: string, password: string): Promise<User> {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    return userCredential.user;
  }

  async signUp(email: string, password: string, displayName?: string): Promise<User> {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    
    // Create user profile in Firestore
    await this.createUserProfile(user.uid, {
      email,
      displayName: displayName || email.split('@')[0],
      createdAt: new Date().toISOString()
    });
    
    return user;
  }

  async signOut(): Promise<void> {
    return signOut(auth);
  }

  onAuthStateChange(callback: (user: User | null) => void): () => void {
    return onAuthStateChanged(auth, callback);
  }

  getCurrentUser(): User | null {
    return auth.currentUser;
  }

  // Firestore Methods - Users
  async createUserProfile(userId: string, data: any): Promise<void> {
    await setDoc(doc(db, 'users', userId), {
      ...data,
      created_at: Timestamp.now(),
      updated_at: Timestamp.now()
    });
  }

  async getUserProfile(userId: string): Promise<any> {
    const docSnap = await getDoc(doc(db, 'users', userId));
    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() };
    }
    return null;
  }

  async updateUserProfile(userId: string, data: any): Promise<void> {
    await updateDoc(doc(db, 'users', userId), {
      ...data,
      updated_at: Timestamp.now()
    });
  }

  // Firestore Methods - Workspaces
  async createWorkspace(userId: string, data: any): Promise<string> {
    const workspaceRef = doc(collection(db, 'workspaces'));
    await setDoc(workspaceRef, {
      ...data,
      user_id: userId,
      created_at: Timestamp.now(),
      updated_at: Timestamp.now()
    });
    return workspaceRef.id;
  }

  async getWorkspaces(userId: string): Promise<any[]> {
    const q = query(
      collection(db, 'workspaces'),
      where('user_id', '==', userId),
      orderBy('updated_at', 'desc')
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  }

  async updateWorkspace(workspaceId: string, data: any): Promise<void> {
    await updateDoc(doc(db, 'workspaces', workspaceId), {
      ...data,
      updated_at: Timestamp.now()
    });
  }

  async deleteWorkspace(workspaceId: string): Promise<void> {
    await deleteDoc(doc(db, 'workspaces', workspaceId));
  }

  // Firestore Methods - Automations
  async createAutomation(userId: string, data: any): Promise<string> {
    const automationRef = doc(collection(db, 'automations'));
    await setDoc(automationRef, {
      ...data,
      user_id: userId,
      status: 'inactive',
      created_at: Timestamp.now(),
      updated_at: Timestamp.now()
    });
    return automationRef.id;
  }

  async getAutomations(userId: string): Promise<any[]> {
    const q = query(
      collection(db, 'automations'),
      where('user_id', '==', userId),
      orderBy('created_at', 'desc')
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  }

  async updateAutomation(automationId: string, data: any): Promise<void> {
    await updateDoc(doc(db, 'automations', automationId), {
      ...data,
      updated_at: Timestamp.now()
    });
  }

  async deleteAutomation(automationId: string): Promise<void> {
    await deleteDoc(doc(db, 'automations', automationId));
  }

  // Firestore Methods - Social Posts
  async createSocialPost(userId: string, data: any): Promise<string> {
    const postRef = doc(collection(db, 'social_posts'));
    await setDoc(postRef, {
      ...data,
      user_id: userId,
      created_at: Timestamp.now()
    });
    return postRef.id;
  }

  async getSocialPosts(userId: string, limitCount: number = 50): Promise<any[]> {
    const q = query(
      collection(db, 'social_posts'),
      where('user_id', '==', userId),
      orderBy('created_at', 'desc'),
      limit(limitCount)
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  }

  async deleteSocialPost(postId: string): Promise<void> {
    await deleteDoc(doc(db, 'social_posts', postId));
  }

  // Firestore Methods - Reports
  async createReport(userId: string, data: any): Promise<string> {
    const reportRef = doc(collection(db, 'reports'));
    await setDoc(reportRef, {
      ...data,
      user_id: userId,
      created_at: Timestamp.now()
    });
    return reportRef.id;
  }

  async getReports(userId: string, agent?: string): Promise<any[]> {
    let q;
    if (agent) {
      q = query(
        collection(db, 'reports'),
        where('user_id', '==', userId),
        where('agent', '==', agent),
        orderBy('created_at', 'desc')
      );
    } else {
      q = query(
        collection(db, 'reports'),
        where('user_id', '==', userId),
        orderBy('created_at', 'desc')
      );
    }
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  }

  async deleteReport(reportId: string): Promise<void> {
    await deleteDoc(doc(db, 'reports', reportId));
  }

  // Firestore Methods - Uploads
  async createUpload(userId: string, data: any): Promise<string> {
    const uploadRef = doc(collection(db, 'uploads'));
    await setDoc(uploadRef, {
      ...data,
      user_id: userId,
      uploaded_at: Timestamp.now()
    });
    return uploadRef.id;
  }

  async getUploads(userId: string): Promise<any[]> {
    const q = query(
      collection(db, 'uploads'),
      where('user_id', '==', userId),
      orderBy('uploaded_at', 'desc')
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  }

  async deleteUpload(uploadId: string): Promise<void> {
    await deleteDoc(doc(db, 'uploads', uploadId));
  }

  // Firestore Methods - Growth Data
  async getGrowthData(userId: string): Promise<any> {
    const docSnap = await getDoc(doc(db, 'growth_data', userId));
    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() };
    }
    
    // Return default growth data
    const defaultData = {
      user_id: userId,
      target: 40,
      current_growth: 25.8,
      strategies: [
        { id: '1', name: 'Expand into new markets', status: 'active', progress: 60 },
        { id: '2', name: 'Increase digital marketing campaigns', status: 'planning', progress: 0 },
        { id: '3', name: 'Introduce referral programs', status: 'active', progress: 30 },
        { id: '4', name: 'Product diversification', status: 'research', progress: 15 }
      ],
      market_reach: {
        local: 45,
        regional: 30,
        national: 20,
        international: 5
      },
      recommendations: [
        'Focus on Tier-2 cities for market expansion',
        'Invest in influencer marketing for better reach',
        'Optimize conversion funnel to improve sales',
        'Implement customer retention strategies'
      ],
      updated_at: Timestamp.now()
    };
    
    await setDoc(doc(db, 'growth_data', userId), defaultData);
    return defaultData;
  }

  async updateGrowthData(userId: string, data: any): Promise<void> {
    await setDoc(doc(db, 'growth_data', userId), {
      ...data,
      user_id: userId,
      updated_at: Timestamp.now()
    }, { merge: true });
  }

  // Firestore Methods - SWOT Analysis
  async createSWOTAnalysis(userId: string, data: any): Promise<string> {
    const swotRef = doc(collection(db, 'swot_analysis'));
    await setDoc(swotRef, {
      ...data,
      user_id: userId,
      created_at: Timestamp.now(),
      updated_at: Timestamp.now()
    });
    return swotRef.id;
  }

  async getSWOTAnalyses(userId: string): Promise<any[]> {
    const q = query(
      collection(db, 'swot_analysis'),
      where('user_id', '==', userId),
      orderBy('updated_at', 'desc')
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  }

  async updateSWOTAnalysis(swotId: string, data: any): Promise<void> {
    await updateDoc(doc(db, 'swot_analysis', swotId), {
      ...data,
      updated_at: Timestamp.now()
    });
  }

  async deleteSWOTAnalysis(swotId: string): Promise<void> {
    await deleteDoc(doc(db, 'swot_analysis', swotId));
  }

  // Storage Methods
  async uploadFile(userId: string, file: File, path: string): Promise<string> {
    const storageRef = ref(firebaseStorage, `${userId}/${path}/${file.name}`);
    await uploadBytes(storageRef, file);
    return getDownloadURL(storageRef);
  }

  async deleteFile(filePath: string): Promise<void> {
    const storageRef = ref(firebaseStorage, filePath);
    await deleteObject(storageRef);
  }
}

export const firebaseService = FirebaseService.getInstance();
export { auth, db, firebaseStorage as storage };
