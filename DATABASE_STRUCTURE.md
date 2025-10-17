# Firebase Database Structure

## Overview
This document outlines the complete Firestore database structure for TrigentAI Dashboard.

---

## Collections

### 1. **users** Collection
User profiles and account information.

```typescript
interface User {
  id: string;                    // Document ID (same as Firebase Auth UID)
  email: string;
  displayName: string;
  photoURL?: string;
  provider: 'google' | 'microsoft' | 'email' | 'guest';
  subscription: {
    plan: 'trial' | 'free' | 'pro' | 'business' | 'enterprise';
    status: 'active' | 'cancelled' | 'expired';
    startDate: Timestamp;
    endDate: Timestamp;
    trialEndsAt?: Timestamp;
  };
  preferences: {
    theme: 'light' | 'dark' | 'system';
    defaultWorkspace?: string;
    notifications: boolean;
  };
  usage: {
    apiCalls: number;
    storageUsed: number;
    lastReset: Timestamp;
  };
  createdAt: Timestamp;
  updatedAt: Timestamp;
  lastLoginAt: Timestamp;
}
```

**Subcollections:**
- `settings/{settingId}` - User-specific settings
- `activity/{activityId}` - User activity logs

---

### 2. **workspaces** Collection
Multi-workspace support for organizing projects.

```typescript
interface Workspace {
  id: string;
  name: string;
  description?: string;
  ownerId: string;               // User ID of workspace owner
  icon?: string;
  color?: string;
  aiInstructions?: string;       // Custom AI behavior instructions
  settings: {
    visibility: 'private' | 'team' | 'public';
    defaultAgentMode?: 'BI' | 'AI' | 'GX';
  };
  createdAt: Timestamp;
  updatedAt: Timestamp;
}
```

**Subcollections:**
- `members/{userId}` - Workspace team members with roles
- `instructions/{instructionId}` - Agent-specific instructions
- `analytics/{date}` - Daily workspace analytics

---

### 3. **agents** Collection
AI Agent sessions and configurations.

```typescript
interface AgentSession {
  id: string;
  userId: string;
  workspaceId?: string;
  type: 'BI' | 'AI' | 'GX';      // Business Intelligence, AI Automation, Growth Strategy
  status: 'active' | 'completed' | 'failed';
  config: {
    model: string;
    temperature: number;
    maxTokens: number;
  };
  metadata: {
    totalInteractions: number;
    lastQuery?: string;
    lastResponse?: string;
  };
  createdAt: Timestamp;
  lastUsed: Timestamp;
}
```

**Subcollections:**
- `sessions/{sessionId}` - Individual conversation sessions
- `content/{contentId}` - Generated content and outputs

---

### 4. **automations** Collection
Automated workflows and tasks.

```typescript
interface Automation {
  id: string;
  userId: string;
  workspaceId?: string;
  name: string;
  description?: string;
  type: 'social_media' | 'email' | 'report' | 'data_sync' | 'custom';
  trigger: {
    type: 'schedule' | 'event' | 'manual';
    schedule?: string;            // Cron expression
    event?: string;
  };
  actions: Array<{
    type: string;
    config: Record<string, any>;
  }>;
  status: 'active' | 'paused' | 'completed' | 'failed';
  stats: {
    totalRuns: number;
    successfulRuns: number;
    failedRuns: number;
    lastRun?: Timestamp;
    nextRun?: Timestamp;
  };
  createdAt: Timestamp;
  updatedAt: Timestamp;
}
```

**Subcollections:**
- `logs/{logId}` - Execution logs and history

---

### 5. **reports** Collection
BI Agent generated reports and analytics.

```typescript
interface Report {
  id: string;
  userId: string;
  workspaceId?: string;
  name: string;
  type: 'sales' | 'revenue' | 'performance' | 'custom';
  dateRange: {
    start: Timestamp;
    end: Timestamp;
  };
  data: {
    metrics: Record<string, number>;
    charts: Array<ChartConfig>;
    insights: Array<string>;
  };
  format: 'json' | 'pdf' | 'csv' | 'excel';
  fileUrl?: string;
  status: 'generating' | 'completed' | 'failed';
  createdAt: Timestamp;
  expiresAt?: Timestamp;
}
```

---

### 6. **swot_analyses** Collection
SWOT (Strengths, Weaknesses, Opportunities, Threats) analyses.

```typescript
interface SwotAnalysis {
  id: string;
  userId: string;
  workspaceId?: string;
  title: string;
  strengths: Array<{
    id: string;
    text: string;
    score: number;
    aiGenerated: boolean;
  }>;
  weaknesses: Array<{
    id: string;
    text: string;
    severity: 'low' | 'medium' | 'high';
    aiGenerated: boolean;
  }>;
  opportunities: Array<{
    id: string;
    text: string;
    potential: 'low' | 'medium' | 'high';
    aiGenerated: boolean;
  }>;
  threats: Array<{
    id: string;
    text: string;
    risk: 'low' | 'medium' | 'high';
    aiGenerated: boolean;
  }>;
  recommendations: Array<string>;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}
```

---

### 7. **competitive_analyses** Collection
Market and competitor analysis data.

```typescript
interface CompetitiveAnalysis {
  id: string;
  userId: string;
  workspaceId?: string;
  title: string;
  industry: string;
  marketScope: 'local' | 'regional' | 'national' | 'international';
  summary: {
    marketSize?: number;
    growth?: number;
    keyTrends: Array<string>;
  };
  createdAt: Timestamp;
  updatedAt: Timestamp;
}
```

**Subcollections:**
- `competitors/{competitorId}` - Individual competitor data

```typescript
interface Competitor {
  id: string;
  name: string;
  website?: string;
  description?: string;
  strengths: Array<string>;
  weaknesses: Array<string>;
  marketShare?: number;
  pricing: {
    model: string;
    range?: string;
  };
  features: Array<string>;
  rating?: number;
  source: 'manual' | 'ai_generated';
}
```

---

### 8. **growth_strategies** Collection
GX Agent growth strategies and goals.

```typescript
interface GrowthStrategy {
  id: string;
  userId: string;
  workspaceId?: string;
  title: string;
  description: string;
  category: 'customer_acquisition' | 'revenue' | 'market_expansion' | 'product' | 'operations';
  goals: Array<{
    id: string;
    title: string;
    metric: string;
    target: number;
    current: number;
    deadline: Timestamp;
    status: 'not_started' | 'in_progress' | 'completed';
  }>;
  tactics: Array<{
    id: string;
    title: string;
    description: string;
    priority: 'low' | 'medium' | 'high';
    estimatedImpact: number;
    completed: boolean;
  }>;
  status: 'draft' | 'active' | 'completed' | 'archived';
  priority: number;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}
```

---

### 9. **social_content** Collection
AI Agent generated social media content.

```typescript
interface SocialContent {
  id: string;
  userId: string;
  workspaceId?: string;
  platform: 'instagram' | 'facebook' | 'twitter' | 'linkedin' | 'tiktok' | 'general';
  prompt: string;
  variations: Array<{
    id: string;
    imageUrl: string;
    caption?: string;
    hashtags?: Array<string>;
    selected: boolean;
  }>;
  status: 'generating' | 'ready' | 'scheduled' | 'posted' | 'failed';
  scheduledFor?: Timestamp;
  postedAt?: Timestamp;
  engagement?: {
    likes: number;
    comments: number;
    shares: number;
  };
  createdAt: Timestamp;
}
```

---

### 10. **connections** Collection
Third-party integrations and API connections.

```typescript
interface Connection {
  id: string;
  userId: string;
  workspaceId?: string;
  provider: 'google' | 'microsoft' | 'salesforce' | 'hubspot' | 'stripe' | 'custom';
  name: string;
  status: 'connected' | 'disconnected' | 'error';
  credentials: {
    encrypted: string;            // Encrypted connection credentials
  };
  scopes: Array<string>;
  metadata: Record<string, any>;
  lastSync?: Timestamp;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}
```

---

### 11. **subscriptions** Collection
User subscription and billing information.

```typescript
interface Subscription {
  id: string;
  userId: string;
  plan: 'trial' | 'free' | 'pro' | 'business' | 'enterprise';
  status: 'active' | 'cancelled' | 'past_due' | 'expired';
  billing: {
    interval: 'monthly' | 'annual';
    amount: number;
    currency: string;
    paymentMethod?: string;
    nextBillingDate?: Timestamp;
  };
  features: {
    maxWorkspaces: number;
    maxTeamMembers: number;
    apiCallsPerMonth: number;
    storageGB: number;
    customDomain: boolean;
    whiteLabel: boolean;
  };
  trialEndsAt?: Timestamp;
  cancelledAt?: Timestamp;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}
```

---

### 12. **usage** Collection
Track API usage and resource consumption.

```typescript
interface Usage {
  id: string;
  userId: string;
  period: string;                // Format: YYYY-MM
  aiAgentCalls: {
    BI: number;
    AI: number;
    GX: number;
    total: number;
  };
  imageGenerations: number;
  storageUsedMB: number;
  reportsGenerated: number;
  automationsRun: number;
  limits: {
    aiAgentCalls: number;
    imageGenerations: number;
    storageMB: number;
  };
  warnings: Array<{
    type: string;
    message: string;
    timestamp: Timestamp;
  }>;
  resetAt: Timestamp;
}
```

---

### 13. **news_cache** Collection
Cached news articles for performance.

```typescript
interface NewsCache {
  id: string;
  category: string;
  query?: string;
  articles: Array<{
    title: string;
    description: string;
    url: string;
    imageUrl?: string;
    source: string;
    publishedAt: Timestamp;
  }>;
  fetchedAt: Timestamp;
  expiresAt: Timestamp;
}
```

---

### 14. **notifications** Collection
System notifications and alerts.

```typescript
interface Notification {
  id: string;
  userId: string;
  type: 'info' | 'success' | 'warning' | 'error';
  title: string;
  message: string;
  actionUrl?: string;
  actionText?: string;
  read: boolean;
  readAt?: Timestamp;
  createdAt: Timestamp;
  expiresAt?: Timestamp;
}
```

---

## Composite Indexes

The following composite indexes are configured in `firestore.indexes.json`:

1. **users**: `email` (ASC) + `createdAt` (DESC)
2. **workspaces**: `ownerId` (ASC) + `createdAt` (DESC)
3. **agents**: `userId` (ASC) + `type` (ASC) + `lastUsed` (DESC)
4. **automations**: `userId` (ASC) + `status` (ASC) + `createdAt` (DESC)
5. **reports**: `userId` (ASC) + `type` (ASC) + `createdAt` (DESC)
6. **social_content**: `userId` (ASC) + `platform` (ASC) + `createdAt` (DESC)
7. **growth_strategies**: `userId` (ASC) + `status` (ASC) + `priority` (DESC)
8. **notifications**: `userId` (ASC) + `read` (ASC) + `createdAt` (DESC)

---

## Security Rules Summary

### Authentication Required
All collections require user authentication for read/write operations.

### Ownership Rules
- Users can only read/write their own data
- Workspace members have access based on workspace membership
- Owner has full control over workspace and related data

### File Size Limits
- Images: 10MB max
- General files: 50MB max

### Special Permissions
- `news_cache`: Read-only for authenticated users (backend writes only)
- Public assets: Read-only for all authenticated users

---

## Best Practices

1. **Always use transactions** for operations that modify multiple documents
2. **Batch writes** when updating multiple documents at once
3. **Use subcollections** for one-to-many relationships
4. **Implement pagination** for large result sets (limit + startAfter)
5. **Cache frequently accessed data** in local storage
6. **Set expiration dates** for temporary data
7. **Use indexes** for complex queries
8. **Validate data** on client and server side

---

## Example Queries

### Get User's Workspaces
```typescript
const workspacesRef = collection(db, 'workspaces');
const q = query(
  workspacesRef,
  where('ownerId', '==', userId),
  orderBy('createdAt', 'desc')
);
```

### Get Active Automations
```typescript
const automationsRef = collection(db, 'automations');
const q = query(
  automationsRef,
  where('userId', '==', userId),
  where('status', '==', 'active'),
  orderBy('createdAt', 'desc')
);
```

### Get Recent Reports
```typescript
const reportsRef = collection(db, 'reports');
const q = query(
  reportsRef,
  where('userId', '==', userId),
  orderBy('createdAt', 'desc'),
  limit(10)
);
```

---

## Migration & Seeding

For initial user setup, create a default workspace and subscription document:

```typescript
async function createUserDefaults(userId: string) {
  const batch = writeBatch(db);
  
  // Create default subscription
  const subscriptionRef = doc(db, 'subscriptions', userId);
  batch.set(subscriptionRef, {
    userId,
    plan: 'trial',
    status: 'active',
    trialEndsAt: addDays(new Date(), 7),
    features: DEFAULT_TRIAL_FEATURES,
    createdAt: serverTimestamp()
  });
  
  // Create default workspace
  const workspaceRef = doc(collection(db, 'workspaces'));
  batch.set(workspaceRef, {
    name: 'My Workspace',
    ownerId: userId,
    createdAt: serverTimestamp()
  });
  
  await batch.commit();
}
```
