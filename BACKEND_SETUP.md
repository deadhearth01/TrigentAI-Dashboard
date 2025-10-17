# Firebase Backend Setup - Complete Guide

## 🎯 Setup Status

### ✅ Completed
- [x] Firebase SDK installed and configured
- [x] Firebase Authentication enabled
- [x] Firestore Database rules created and deployed
- [x] Firestore indexes configured and deployed
- [x] Firebase Hosting configured with GitHub Actions
- [x] Database structure documented

### ⚠️ Manual Steps Required
- [ ] Enable Firebase Storage in Console
- [ ] Enable Firebase Authentication providers (Google, Microsoft)
- [ ] Configure Firebase Authentication settings
- [ ] Review and test security rules

---

## 📋 Step-by-Step Setup Instructions

### 1. Enable Firebase Storage

**Action Required:** Visit Firebase Console
```
https://console.firebase.google.com/project/trigentai/storage
```

**Steps:**
1. Click "Get Started" button
2. Accept default security rules
3. Choose storage location (us-central1 recommended)
4. Click "Done"

After enabling, run:
```bash
firebase deploy --only storage
```

---

### 2. Configure Firebase Authentication

**Visit:** https://console.firebase.google.com/project/trigentai/authentication

#### Enable Sign-in Methods:

**Google Sign-In:**
1. Go to Authentication → Sign-in method
2. Click "Google"
3. Toggle "Enable"
4. Set support email: evanriosprojects@gmail.com
5. Save

**Microsoft Sign-In:**
1. Click "Microsoft"
2. Toggle "Enable"
3. Add Application (client) ID and Client secret from Azure AD
4. Save

**Email/Password (Optional):**
1. Click "Email/Password"
2. Toggle "Enable"
3. Save

**Anonymous Sign-In (for Guest Mode):**
1. Click "Anonymous"
2. Toggle "Enable"
3. Save

---

### 3. Firestore Database Configuration

**Status:** ✅ Already Configured

**Database:** Cloud Firestore (Native Mode)
**Location:** us-central1
**Rules:** Deployed from `firestore.rules`
**Indexes:** Deployed from `firestore.indexes.json`

**Collections Created:**
- users
- workspaces
- agents
- automations
- reports
- swot_analyses
- competitive_analyses
- growth_strategies
- social_content
- connections
- subscriptions
- usage
- news_cache
- notifications

---

### 4. Firebase Storage Configuration

**Status:** ⚠️ Needs Enabling

**Bucket Structure:**
```
/users/{userId}/profile/           - Profile images
/workspaces/{workspaceId}/         - Workspace files
/social-content/{userId}/          - Generated social media images
/reports/{userId}/                 - Exported reports
/automations/{userId}/             - Automation outputs
/analytics/{userId}/               - Analytics exports
/temp/{userId}/                    - Temporary files
/public/                           - Public assets
```

---

## 🔐 Security Rules Summary

### Firestore Rules
All collections require authentication. Users can only access their own data.

**Key Security Features:**
- User authentication required for all operations
- Owner-based access control
- Workspace membership validation
- Subscription-based feature access
- Activity logging

### Storage Rules
File upload size limits enforced.

**Key Security Features:**
- Images: 10MB max
- Files: 50MB max
- User-based access control
- Content type validation

---

## 🚀 Quick Start Commands

### Deploy All Firebase Services
```bash
# Deploy everything
firebase deploy

# Deploy specific services
firebase deploy --only firestore
firebase deploy --only storage
firebase deploy --only hosting
```

### Test Firebase Configuration
```bash
# Run the test file
node test-firebase.js
```

### View Firebase Console
```bash
# Open project overview
firebase open

# Open Firestore
firebase open firestore

# Open Storage
firebase open storage

# Open Authentication
firebase open auth
```

---

## 💻 Usage in Code

### Initialize User on First Sign-In
```typescript
import { DatabaseService } from '@/lib/database';
import { auth } from '@/lib/firebase';

// After successful authentication
const user = auth.currentUser;
if (user) {
  // Check if user exists
  const existingUser = await DatabaseService.getUser(user.uid);
  
  if (!existingUser) {
    // Initialize new user with default workspace
    await DatabaseService.initializeNewUser(user.uid, {
      email: user.email!,
      displayName: user.displayName || 'User',
      photoURL: user.photoURL || undefined,
      provider: 'google', // or 'microsoft', 'email', 'guest'
    });
  } else {
    // Update last login
    await DatabaseService.updateLastLogin(user.uid);
  }
}
```

### Create a Workspace
```typescript
const workspaceId = await DatabaseService.createWorkspace(userId, {
  name: 'My New Workspace',
  description: 'Workspace for my business',
  aiInstructions: 'Be concise and professional',
  settings: {
    visibility: 'private',
    defaultAgentMode: 'BI',
  },
});
```

### Create an Automation
```typescript
const automationId = await DatabaseService.createAutomation(userId, {
  name: 'Daily Social Media Post',
  type: 'social_media',
  description: 'Auto-generate and post content daily',
  trigger: {
    type: 'schedule',
    schedule: '0 9 * * *', // 9 AM daily
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
```

### Generate a Report
```typescript
const reportId = await DatabaseService.createReport(userId, {
  name: 'Monthly Revenue Report',
  type: 'revenue',
  dateRange: {
    start: new Date('2025-10-01'),
    end: new Date('2025-10-31'),
  },
  data: {
    metrics: {
      revenue: 50000,
      growth: 15.5,
    },
    insights: [
      'Revenue increased by 15.5%',
      'Top performing product: Enterprise Plan',
    ],
  },
});

// Update when generation is complete
await DatabaseService.updateReport(reportId, {
  status: 'completed',
});
```

### Upload Files to Storage
```typescript
// Upload user profile image
const photoURL = await DatabaseService.uploadUserProfileImage(userId, imageFile);
await DatabaseService.updateUser(userId, { photoURL });

// Upload social media content
const imageUrl = await DatabaseService.uploadSocialMediaImage(
  userId,
  contentId,
  generatedImageFile
);
```

### Create SWOT Analysis
```typescript
const swotId = await DatabaseService.createSwotAnalysis(userId, {
  title: 'Q4 2025 SWOT Analysis',
  strengths: [
    { id: '1', text: 'Strong brand recognition', score: 9, aiGenerated: true },
    { id: '2', text: 'Experienced team', score: 8, aiGenerated: false },
  ],
  weaknesses: [
    { id: '1', text: 'Limited market reach', severity: 'medium', aiGenerated: true },
  ],
  opportunities: [
    { id: '1', text: 'Expand to new markets', potential: 'high', aiGenerated: true },
  ],
  threats: [
    { id: '1', text: 'Increasing competition', risk: 'high', aiGenerated: true },
  ],
  recommendations: [
    'Focus on market expansion',
    'Invest in marketing',
  ],
});
```

### Create Growth Strategy
```typescript
const strategyId = await DatabaseService.createGrowthStrategy(userId, {
  title: 'Market Expansion Strategy',
  description: 'Expand to 3 new states by Q2 2026',
  category: 'market_expansion',
  goals: [
    {
      id: '1',
      title: 'Launch in California',
      metric: 'customers',
      target: 1000,
      current: 0,
      deadline: new Date('2026-03-31'),
      status: 'not_started',
    },
  ],
  tactics: [
    {
      id: '1',
      title: 'Partner with local distributors',
      description: 'Find 5 distribution partners',
      priority: 'high',
      estimatedImpact: 8,
      completed: false,
    },
  ],
  priority: 10,
});
```

### Create Social Media Content
```typescript
const contentId = await DatabaseService.createSocialContent(userId, {
  platform: 'instagram',
  prompt: 'Create motivational business quote with modern design',
  variations: [], // Will be populated by AI Agent
  status: 'generating',
});

// After AI generates images
await DatabaseService.updateSocialContent(contentId, {
  status: 'ready',
  variations: [
    {
      id: '1',
      imageUrl: 'https://storage.googleapis.com/...',
      caption: 'Success is built one day at a time',
      hashtags: ['#motivation', '#business', '#success'],
      selected: false,
    },
    // ... more variations
  ],
});
```

### Get User Data
```typescript
// Get user's workspaces
const workspaces = await DatabaseService.getUserWorkspaces(userId);

// Get active automations
const automations = await DatabaseService.getUserAutomations(userId, 'active');

// Get recent reports
const reports = await DatabaseService.getUserReports(userId);

// Get notifications
const notifications = await DatabaseService.getUserNotifications(userId, true); // unread only
```

---

## 🔧 Environment Variables

Update `.env.local` with Firebase configuration:

```env
# Firebase Configuration (Already in code)
NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSyCClmtOtcXW07MKSCrPRf0_x1-cTb0Rg9g
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=trigentai.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=trigentai
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=trigentai.firebasestorage.app
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=713759613857
NEXT_PUBLIC_FIREBASE_APP_ID=1:713759613857:web:08905bbfdee8ae79f8e1e0
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=G-6RLZRY4YC9

# Other APIs
NEXT_PUBLIC_GEMINI_API_KEY=your_gemini_api_key
NEXT_PUBLIC_NEWSDATA_API_KEY=your_newsdata_api_key
```

---

## 📊 Database Monitoring

### View Database Console
```bash
firebase open firestore
```

### Check Usage
Visit: https://console.firebase.google.com/project/trigentai/usage

### Set Budget Alerts
Visit: https://console.firebase.google.com/project/trigentai/usage/alerts

**Recommended Alerts:**
- Firestore reads: 50,000/day
- Storage: 5GB
- Authentication: 10,000/month

---

## 🧪 Testing

### Test Authentication
```typescript
import { signInWithPopup, GoogleAuthProvider } from 'firebase/auth';
import { auth } from '@/lib/firebase';

const provider = new GoogleAuthProvider();
const result = await signInWithPopup(auth, provider);
console.log('Signed in:', result.user);
```

### Test Database Operations
```typescript
import { DatabaseService } from '@/lib/database';

// Create test workspace
const workspaceId = await DatabaseService.createWorkspace('test-user-id', {
  name: 'Test Workspace',
});

console.log('Created workspace:', workspaceId);
```

### Test Storage Upload
```typescript
const file = new File(['test'], 'test.txt', { type: 'text/plain' });
const url = await DatabaseService.uploadFile('test/test.txt', file);
console.log('Uploaded file:', url);
```

---

## 🚨 Production Checklist

Before going to production:

- [ ] Move Firebase config to environment variables (remove hardcoded values)
- [ ] Review and tighten security rules
- [ ] Set up Firebase App Check for abuse prevention
- [ ] Configure backup schedule for Firestore
- [ ] Set up monitoring and alerts
- [ ] Enable Firebase Performance Monitoring
- [ ] Configure CORS for Storage bucket
- [ ] Set up custom domain for Firebase Hosting
- [ ] Review and optimize Firestore indexes
- [ ] Implement rate limiting for API calls
- [ ] Set up Error reporting (Sentry or Firebase Crashlytics)
- [ ] Configure email templates for Firebase Auth
- [ ] Test all authentication providers
- [ ] Implement data retention policies
- [ ] Set up automated database backups

---

## 📚 Additional Resources

- **Firebase Documentation:** https://firebase.google.com/docs
- **Firestore Rules Reference:** https://firebase.google.com/docs/firestore/security/rules-structure
- **Storage Rules Reference:** https://firebase.google.com/docs/storage/security
- **Authentication Guide:** https://firebase.google.com/docs/auth
- **Database Structure:** See `DATABASE_STRUCTURE.md`

---

## 🆘 Troubleshooting

### Common Issues

**1. "Permission Denied" errors**
- Check if user is authenticated
- Verify security rules allow the operation
- Ensure user owns the resource

**2. "Index Required" errors**
- Check Firebase Console for index creation link
- Or run: `firebase deploy --only firestore:indexes`

**3. Storage upload fails**
- Verify Storage is enabled in Firebase Console
- Check file size limits (10MB for images, 50MB for files)
- Ensure content type is correct

**4. Authentication fails**
- Check if provider is enabled in Firebase Console
- Verify OAuth credentials are correct
- Check browser console for detailed errors

---

## 📞 Support

For Firebase-specific issues:
- Firebase Support: https://firebase.google.com/support
- Stack Overflow: https://stackoverflow.com/questions/tagged/firebase

For TrigentAI Dashboard issues:
- GitHub: https://github.com/deadhearth01/TrigentAI-Dashboard
- Email: evanriosprojects@gmail.com

---

**Last Updated:** October 17, 2025
**Firebase Project:** trigentai
**Project ID:** 713759613857
