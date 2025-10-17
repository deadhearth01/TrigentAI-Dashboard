# Frontend-Backend Integration Guide

## 🎯 Integration Status

### ✅ Completed Integrations

#### 1. Authentication System
- **Firebase Auth** fully integrated with Google, Microsoft, and Anonymous sign-in
- Auto-creates user profile in Firestore on first login
- Initializes default workspace for new users
- Maintains auth state across page reloads
- Supports local mode (guest) and cloud mode (Firebase)

**Files Updated:**
- `components/auth/sign-in-form.tsx` - Firebase authentication
- `lib/hooks/use-firebase-auth.ts` - Auth state persistence
- `lib/store.ts` - Store types updated for Firebase compatibility
- `app/page.tsx` - Loading state while checking auth

#### 2. Database Operations
- **DatabaseService** class with 30+ helper methods
- Full CRUD operations for all 14 collections
- User initialization with workspace creation
- Workspace management (create, read, update, delete)
- Batch operations for efficient writes

**Key Methods:**
```typescript
// User Management
DatabaseService.createUser(userId, userData)
DatabaseService.getUser(userId)
DatabaseService.updateUser(userId, updates)
DatabaseService.initializeNewUser(userId, userData) // Creates user + workspace + subscription

// Workspace Management
DatabaseService.createWorkspace(userId, workspaceData)
DatabaseService.getUserWorkspaces(userId)
DatabaseService.updateWorkspace(workspaceId, updates)
DatabaseService.deleteWorkspace(workspaceId)

// Reports & Analytics
DatabaseService.createReport(userId, reportData)
DatabaseService.getUserReports(userId, reportType)

// Automations
DatabaseService.createAutomation(userId, automationData)
DatabaseService.getUserAutomations(userId, status)

// SWOT & Competitive Analysis
DatabaseService.createSwotAnalysis(userId, swotData)
DatabaseService.createCompetitiveAnalysis(userId, analysisData)

// Growth Strategies
DatabaseService.createGrowthStrategy(userId, strategyData)
DatabaseService.getUserGrowthStrategies(userId)

// Social Media Content
DatabaseService.createSocialContent(userId, contentData)
DatabaseService.getUserSocialContent(userId, platform)

// Storage Operations
DatabaseService.uploadUserProfileImage(userId, file)
DatabaseService.uploadSocialMediaImage(userId, contentId, file)
DatabaseService.deleteFile(path)
```

#### 3. AI Services
- **AI Service** class for Gemini AI integration
- Business Intelligence analysis
- SWOT generation
- Competitive analysis
- Growth strategy generation
- Social media content generation

**AI Service Methods:**
```typescript
// BI Agent
aiService.analyzeBusinessData(query, data)
  → Returns: { summary, insights, recommendations, data }

// SWOT Analysis
aiService.generateSWOT(businessContext)
  → Returns: { strengths, weaknesses, opportunities, threats, recommendations }

// Competitive Analysis
aiService.analyzeCompetitors(industry, marketScope)
  → Returns: { competitors, summary }

// Growth Strategy (GX Agent)
aiService.generateGrowthStrategy(context, metrics, goals)
  → Returns: { title, description, goals, tactics }

// Social Media Content
aiService.generateSocialCaption(platform, topic, tone)
  → Returns: { caption, hashtags }
```

#### 4. Workspace Management
- Custom hook `useWorkspaces()` for workspace operations
- Real-time workspace loading from Firestore
- Workspace switching with persistent state
- Create, update, and delete workspaces

**Usage:**
```typescript
const {
  workspaces,          // All user workspaces
  loading,             // Loading state
  currentWorkspace,    // Active workspace
  setCurrentWorkspace, // Switch workspace
  createWorkspace,     // Create new workspace
  updateWorkspace,     // Update workspace details
  deleteWorkspace,     // Delete workspace
  reload              // Refresh workspace list
} = useWorkspaces();
```

---

## 🔗 How to Use the Integration

### 1. User Sign-In Flow

```typescript
// components/auth/sign-in-form.tsx

// Google Sign-In
const handleGoogleSignIn = async () => {
  const provider = new GoogleAuthProvider();
  const result = await signInWithPopup(auth, provider);
  
  // Check if user exists
  let dbUser = await DatabaseService.getUser(result.user.uid);
  
  if (!dbUser) {
    // Create new user with default workspace
    await DatabaseService.initializeNewUser(result.user.uid, {
      email: result.user.email!,
      displayName: result.user.displayName || 'User',
      photoURL: result.user.photoURL,
      provider: 'google',
    });
  } else {
    // Update last login
    await DatabaseService.updateLastLogin(result.user.uid);
  }
};
```

### 2. Create and Manage Workspaces

```typescript
// In any component
import { useWorkspaces } from '@/lib/hooks/use-workspaces';

function MyComponent() {
  const { createWorkspace, workspaces, currentWorkspace } = useWorkspaces();

  const handleCreate = async () => {
    const workspaceId = await createWorkspace(
      'Marketing Campaign',
      'Q4 2025 campaign workspace'
    );
    console.log('Created workspace:', workspaceId);
  };

  return (
    <div>
      <p>Current: {currentWorkspace?.name}</p>
      <button onClick={handleCreate}>Create Workspace</button>
    </div>
  );
}
```

### 3. Use AI Services in Agents

```typescript
// components/agents/bi-agent.tsx
import aiService from '@/lib/ai-service';

const analyzeData = async (query: string) => {
  try {
    const result = await aiService.analyzeBusinessData(query, myData);
    
    console.log('Summary:', result.summary);
    console.log('Insights:', result.insights);
    console.log('Recommendations:', result.recommendations);
    
    // Save to Firestore
    await DatabaseService.createReport(auth.currentUser!.uid, {
      name: 'Analysis Report',
      type: 'custom',
      dateRange: { start: new Date(), end: new Date() },
      data: {
        metrics: {},
        insights: result.insights,
      },
    });
  } catch (error) {
    console.error('Analysis failed:', error);
  }
};
```

### 4. Generate SWOT Analysis

```typescript
// components/dashboard/swot-section.tsx
import aiService from '@/lib/ai-service';
import DatabaseService from '@/lib/database';

const generateSWOT = async () => {
  const businessContext = `
    E-commerce company selling electronics.
    Current revenue: $2M/year
    Team size: 15 people
    Market: North America
  `;
  
  try {
    const swot = await aiService.generateSWOT(businessContext);
    
    // Save to Firestore
    const swotId = await DatabaseService.createSwotAnalysis(
      auth.currentUser!.uid,
      {
        title: 'Q4 2025 SWOT Analysis',
        ...swot,
      }
    );
    
    console.log('SWOT saved with ID:', swotId);
  } catch (error) {
    console.error('SWOT generation failed:', error);
  }
};
```

### 5. Create Automations

```typescript
import DatabaseService from '@/lib/database';

const createSocialMediaAutomation = async () => {
  const automationId = await DatabaseService.createAutomation(userId, {
    name: 'Daily Social Media Post',
    type: 'social_media',
    description: 'Generate and post content daily at 9 AM',
    trigger: {
      type: 'schedule',
      schedule: '0 9 * * *', // Cron: 9 AM daily
    },
    actions: [
      {
        type: 'generate_image',
        config: { platform: 'instagram', prompt: 'Motivational quote' },
      },
      {
        type: 'post_to_social',
        config: { platform: 'instagram' },
      },
    ],
  });
};
```

### 6. Upload Files to Storage

```typescript
import DatabaseService from '@/lib/database';

// Upload profile image
const handleProfileUpload = async (file: File) => {
  try {
    const url = await DatabaseService.uploadUserProfileImage(userId, file);
    
    // Update user profile
    await DatabaseService.updateUser(userId, { photoURL: url });
    
    console.log('Profile image uploaded:', url);
  } catch (error) {
    console.error('Upload failed:', error);
  }
};

// Upload social media content
const handleSocialUpload = async (contentId: string, file: File) => {
  const url = await DatabaseService.uploadSocialMediaImage(
    userId,
    contentId,
    file
  );
  
  // Update content with image URL
  await DatabaseService.updateSocialContent(contentId, {
    variations: [
      {
        id: '1',
        imageUrl: url,
        caption: 'Generated caption',
        selected: true,
      },
    ],
    status: 'ready',
  });
};
```

---

## 📝 Next Integration Steps

### Immediate Tasks

1. **Update BI Agent** (`components/agents/bi-agent.tsx`)
   - Replace mock analysis with `aiService.analyzeBusinessData()`
   - Save reports to Firestore using `DatabaseService.createReport()`
   - Load previous reports from Firestore

2. **Update AI Agent** (`components/agents/ai-agent.tsx`)
   - Integrate image generation (Imagen 4.0)
   - Use `aiService.generateSocialCaption()` for captions
   - Save content to Firestore
   - Upload images to Firebase Storage

3. **Update GX Agent** (`components/agents/gx-agent.tsx`)
   - Use `aiService.generateGrowthStrategy()`
   - Save strategies to Firestore
   - Track goal progress

4. **Update Dashboard** (`components/dashboard/dashboard-overview.tsx`)
   - Load real data from Firestore
   - Display user's recent reports
   - Show active automations
   - Real metrics from database

5. **Update Connections Page** (`components/connections/connections-page.tsx`)
   - Save API connections to Firestore
   - Encrypt sensitive data
   - Test connections

6. **Update Settings Page** (`components/settings/settings-page.tsx`)
   - Load user preferences from Firestore
   - Update subscription status
   - Display usage metrics
   - Manage workspaces

---

## 🔐 Security Considerations

1. **Environment Variables** (Production)
   - Move Firebase config to `.env.production`
   - Never commit API keys to git
   - Use Firebase App Check for API protection

2. **Data Validation**
   - Always validate user input before saving
   - Sanitize AI-generated content
   - Check file types and sizes before upload

3. **Access Control**
   - Firestore rules enforce user ownership
   - Storage rules limit file sizes
   - Rate limiting on AI API calls

---

## 🚀 Deployment Checklist

Before deploying to production:

- [ ] Enable Storage in Firebase Console
- [ ] Enable Auth providers (Google, Microsoft, Anonymous)
- [ ] Deploy Firestore rules: `firebase deploy --only firestore`
- [ ] Deploy Storage rules: `firebase deploy --only storage`
- [ ] Set up environment variables in Vercel
- [ ] Test authentication flow end-to-end
- [ ] Test database operations
- [ ] Test AI service with real API
- [ ] Test file uploads to Storage
- [ ] Set up Firebase budget alerts
- [ ] Enable Firebase Performance Monitoring
- [ ] Configure error reporting

---

## 📚 Documentation

- **Database Schema:** `DATABASE_STRUCTURE.md`
- **Backend Setup:** `BACKEND_SETUP.md`
- **Firebase Config:** `FIREBASE_SETUP.md`
- **App Overview:** `APP_OVERVIEW.md`
- **Quick Reference:** `QUICK_REFERENCE.md`

---

## 🆘 Troubleshooting

### Auth Issues
```typescript
// Check if Firebase is initialized
import { auth } from '@/lib/firebase';
console.log('Auth:', auth.currentUser);

// Listen for auth state changes
import { onAuthStateChanged } from 'firebase/auth';
onAuthStateChanged(auth, (user) => {
  console.log('User:', user);
});
```

### Database Issues
```typescript
// Test database connection
import DatabaseService from '@/lib/database';
const user = await DatabaseService.getUser('test-user-id');
console.log('User from DB:', user);
```

### AI Service Issues
```typescript
// Test AI service
import aiService from '@/lib/ai-service';
const result = await aiService.analyzeBusinessData('Test query');
console.log('AI Result:', result);
```

---

**Last Updated:** October 17, 2025
**Integration Status:** ✅ Core Integration Complete
**Ready for:** Agent-specific implementation
