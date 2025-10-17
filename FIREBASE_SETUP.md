# Firebase Integration Guide

## Overview
Firebase has been successfully integrated into the TrigentAI Dashboard application.

## Configuration
The following Firebase services are configured:

- **Project ID**: `trigentai`
- **Auth Domain**: `trigentai.firebaseapp.com`
- **Storage Bucket**: `trigentai.firebasestorage.app`

## Services Enabled

### 1. **Firebase Authentication** (`auth`)
- Email/Password authentication
- Sign up, sign in, sign out methods
- Auth state management

### 2. **Cloud Firestore** (`db`)
- User profiles
- Workspaces
- Automations
- Social posts
- Reports
- SWOT analysis
- Growth data

### 3. **Firebase Storage** (`storage`)
- File uploads
- Image storage
- Document storage

### 4. **Firebase Analytics** (`analytics`)
- User behavior tracking
- Performance monitoring
- Custom events

## Usage Examples

### Authentication
```typescript
import { firebaseService } from '@/lib/firebase';

// Sign up new user
const user = await firebaseService.signUp('email@example.com', 'password', 'Display Name');

// Sign in existing user
const user = await firebaseService.signIn('email@example.com', 'password');

// Sign out
await firebaseService.signOut();

// Listen to auth state changes
const unsubscribe = firebaseService.onAuthStateChange((user) => {
  if (user) {
    console.log('User signed in:', user.email);
  } else {
    console.log('User signed out');
  }
});
```

### Firestore Database
```typescript
import { firebaseService } from '@/lib/firebase';

// Create workspace
const workspaceId = await firebaseService.createWorkspace(userId, {
  name: 'My Workspace',
  description: 'Project workspace',
  color: 'blue'
});

// Get workspaces
const workspaces = await firebaseService.getWorkspaces(userId);

// Update workspace
await firebaseService.updateWorkspace(workspaceId, {
  name: 'Updated Name'
});

// Delete workspace
await firebaseService.deleteWorkspace(workspaceId);
```

### File Storage
```typescript
import { firebaseService } from '@/lib/firebase';

// Upload file
const file = document.querySelector('input[type="file"]').files[0];
const downloadUrl = await firebaseService.uploadFile(userId, file, 'uploads');

// Delete file
await firebaseService.deleteFile('path/to/file');
```

### Direct Firebase SDK Usage
```typescript
import { auth, db, storage, analytics } from '@/lib/firebase';
import { collection, addDoc } from 'firebase/firestore';
import { logEvent } from 'firebase/analytics';

// Add document to Firestore
const docRef = await addDoc(collection(db, 'custom_collection'), {
  field: 'value'
});

// Log analytics event
if (analytics) {
  logEvent(analytics, 'custom_event', {
    event_category: 'engagement',
    event_label: 'button_click'
  });
}
```

## Available Methods

### FirebaseService Class

#### Authentication
- `signIn(email, password)` - Sign in user
- `signUp(email, password, displayName)` - Create new user
- `signOut()` - Sign out current user
- `onAuthStateChange(callback)` - Listen to auth changes
- `getCurrentUser()` - Get current signed-in user

#### User Profiles
- `createUserProfile(userId, data)` - Create user profile
- `getUserProfile(userId)` - Get user profile
- `updateUserProfile(userId, data)` - Update user profile

#### Workspaces
- `createWorkspace(userId, data)` - Create workspace
- `getWorkspaces(userId)` - Get all workspaces
- `updateWorkspace(workspaceId, data)` - Update workspace
- `deleteWorkspace(workspaceId)` - Delete workspace

#### Automations
- `createAutomation(userId, data)` - Create automation
- `getAutomations(userId)` - Get all automations
- `updateAutomation(automationId, data)` - Update automation
- `deleteAutomation(automationId)` - Delete automation

#### Social Posts
- `createSocialPost(userId, data)` - Create social post
- `getSocialPosts(userId, limit)` - Get social posts
- `deleteSocialPost(postId)` - Delete social post

#### Reports
- `createReport(userId, data)` - Create report
- `getReports(userId, agent)` - Get reports (optionally filtered by agent)
- `deleteReport(reportId)` - Delete report

#### SWOT Analysis
- `createSWOTAnalysis(userId, data)` - Create SWOT analysis
- `getSWOTAnalyses(userId)` - Get all SWOT analyses
- `updateSWOTAnalysis(swotId, data)` - Update SWOT analysis
- `deleteSWOTAnalysis(swotId)` - Delete SWOT analysis

#### Growth Data
- `getGrowthData(userId)` - Get growth data (creates default if not exists)
- `updateGrowthData(userId, data)` - Update growth data

#### File Storage
- `uploadFile(userId, file, path)` - Upload file to storage
- `deleteFile(filePath)` - Delete file from storage

## Firestore Collections Structure

```
users/{userId}
  - email: string
  - displayName: string
  - created_at: timestamp
  - updated_at: timestamp

workspaces/{workspaceId}
  - name: string
  - description: string
  - color: string
  - user_id: string
  - ai_instructions: string
  - agent_type: string
  - created_at: timestamp
  - updated_at: timestamp

automations/{automationId}
  - user_id: string
  - name: string
  - status: 'active' | 'inactive'
  - created_at: timestamp
  - updated_at: timestamp

social_posts/{postId}
  - user_id: string
  - content: string
  - platform: string
  - created_at: timestamp

reports/{reportId}
  - user_id: string
  - agent: string
  - data: object
  - created_at: timestamp

swot_analysis/{swotId}
  - user_id: string
  - strengths: array
  - weaknesses: array
  - opportunities: array
  - threats: array
  - created_at: timestamp
  - updated_at: timestamp

growth_data/{userId}
  - user_id: string
  - target: number
  - current_growth: number
  - strategies: array
  - market_reach: object
  - recommendations: array
  - updated_at: timestamp
```

## Security Notes

⚠️ **Important**: The Firebase configuration is currently hardcoded in the application. For production:

1. Move sensitive keys to environment variables
2. Set up Firebase Security Rules for Firestore and Storage
3. Enable Firebase App Check for additional security
4. Implement proper user authentication before accessing data

## Next Steps

1. **Set up Firebase Security Rules** in the Firebase Console
2. **Enable additional Firebase features** as needed (Cloud Functions, etc.)
3. **Implement user authentication flows** in your components
4. **Configure Firebase hosting** (optional)

## Resources

- [Firebase Documentation](https://firebase.google.com/docs)
- [Firebase Console](https://console.firebase.google.com/project/trigentai)
- [Firestore Security Rules](https://firebase.google.com/docs/firestore/security/get-started)
