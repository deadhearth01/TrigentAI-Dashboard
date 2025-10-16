# Google Cloud OAuth Setup for Imagen 4.0

## Overview
To use the real Imagen 4.0 API, you need to set up Google Cloud Platform OAuth 2.0 authentication. This guide walks you through the process.

## Prerequisites
- Google Cloud Platform account
- Project with billing enabled
- Vertex AI API enabled

## Setup Steps

### 1. Create Google Cloud Project

```bash
# Visit: https://console.cloud.google.com/
# Click "New Project"
# Name: trigentai-dashboard
# Click "Create"
```

### 2. Enable Required APIs

```bash
# Navigate to: APIs & Services > Library
# Search and enable:
- Vertex AI API
- Cloud Resource Manager API
- IAM Service Account Credentials API
```

### 3. Create OAuth 2.0 Credentials

```bash
# Navigate to: APIs & Services > Credentials
# Click "Create Credentials" > "OAuth 2.0 Client ID"

# Configure OAuth consent screen:
- User Type: External
- App name: TrigentAI Dashboard
- User support email: your-email@example.com
- Developer contact: your-email@example.com
- Scopes: Add "https://www.googleapis.com/auth/cloud-platform"

# Create OAuth Client:
- Application type: Web application
- Name: TrigentAI Web Client
- Authorized redirect URIs:
  * http://localhost:3000/api/auth/callback/google
  * https://your-domain.com/api/auth/callback/google
```

### 4. Download Credentials

```bash
# Click the download icon next to your OAuth client
# Save as: google-oauth-credentials.json
# DO NOT commit this file to version control!
```

### 5. Add to .env.local

```bash
# .env.local
NEXT_PUBLIC_GEMINI_API_KEY=your_existing_key

# Google Cloud OAuth
GOOGLE_CLOUD_PROJECT_ID=trigentai-dashboard
GOOGLE_CLOUD_LOCATION=us-central1
GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-client-secret
GOOGLE_REDIRECT_URI=http://localhost:3000/api/auth/callback/google
```

### 6. Install Required Packages

```bash
npm install google-auth-library googleapis
```

### 7. Create OAuth Helper

Create `lib/google-oauth.ts`:

```typescript
import { OAuth2Client } from 'google-auth-library';

const oauth2Client = new OAuth2Client(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  process.env.GOOGLE_REDIRECT_URI
);

// Generate auth URL
export function getAuthUrl() {
  return oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: ['https://www.googleapis.com/auth/cloud-platform']
  });
}

// Exchange code for tokens
export async function getTokensFromCode(code: string) {
  const { tokens } = await oauth2Client.getToken(code);
  oauth2Client.setCredentials(tokens);
  return tokens;
}

// Get access token
export async function getAccessToken() {
  const { token } = await oauth2Client.getAccessToken();
  return token;
}

export { oauth2Client };
```

### 8. Create Auth API Route

Create `app/api/auth/google/route.ts`:

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { getAuthUrl } from '@/lib/google-oauth';

export async function GET(request: NextRequest) {
  const authUrl = getAuthUrl();
  return NextResponse.redirect(authUrl);
}
```

Create `app/api/auth/callback/google/route.ts`:

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { getTokensFromCode } from '@/lib/google-oauth';
import { cookies } from 'next/headers';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const code = searchParams.get('code');
  
  if (!code) {
    return NextResponse.redirect('/error?message=No authorization code');
  }
  
  try {
    const tokens = await getTokensFromCode(code);
    
    // Store tokens securely (use encrypted cookies or session storage)
    cookies().set('google_access_token', tokens.access_token || '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 3600 // 1 hour
    });
    
    if (tokens.refresh_token) {
      cookies().set('google_refresh_token', tokens.refresh_token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        maxAge: 60 * 60 * 24 * 30 // 30 days
      });
    }
    
    return NextResponse.redirect('/?auth=success');
  } catch (error) {
    console.error('OAuth error:', error);
    return NextResponse.redirect('/error?message=Authentication failed');
  }
}
```

### 9. Update Imagen Service

Update `lib/imagen.ts`:

```typescript
import { getAccessToken } from './google-oauth';

class ImagenService {
  private baseUrl = 'https://us-central1-aiplatform.googleapis.com/v1';
  private projectId = process.env.GOOGLE_CLOUD_PROJECT_ID;
  private location = process.env.GOOGLE_CLOUD_LOCATION;

  async generateImages(options: ImageGenerationOptions): Promise<ImageGenerationResult> {
    const { prompt, numberOfImages = 1, aspectRatio = '1:1', modelType = 'standard' } = options;
    
    // Get OAuth access token
    const accessToken = await getAccessToken();
    
    const model = 'imagen-4.0-generate-001';
    const endpoint = `${this.baseUrl}/projects/${this.projectId}/locations/${this.location}/publishers/google/models/${model}:predict`;
    
    const requestBody = {
      instances: [{ prompt }],
      parameters: {
        sampleCount: numberOfImages,
        aspectRatio: aspectRatio,
        safetyFilterLevel: "block_some",
        personGeneration: "allow_adult"
      }
    };
    
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`
      },
      body: JSON.stringify(requestBody)
    });
    
    if (!response.ok) {
      throw new Error(`Imagen API error: ${response.statusText}`);
    }
    
    const data = await response.json();
    
    // Convert base64 images to data URLs
    const images = data.predictions?.map((pred: any) => 
      `data:image/png;base64,${pred.bytesBase64Encoded}`
    ) || [];
    
    return { images, prompt };
  }
}
```

### 10. Add Auth Button to UI

Add to your dashboard layout or AI Agent:

```typescript
<Button
  onClick={() => window.location.href = '/api/auth/google'}
  startContent={<Key className="w-4 h-4" />}
>
  Connect Google Cloud
</Button>
```

### 11. Test the Integration

```bash
# Start dev server
npm run dev

# Click "Connect Google Cloud" button
# Authorize the application
# Test image generation
# Check console for success messages
```

## Security Best Practices

### 1. Never Commit Credentials
```bash
# .gitignore
google-oauth-credentials.json
.env.local
```

### 2. Use Environment Variables
- Store all secrets in environment variables
- Use different credentials for dev/staging/production

### 3. Implement Token Refresh
```typescript
// Check token expiration and refresh if needed
if (isTokenExpired(accessToken)) {
  accessToken = await refreshAccessToken();
}
```

### 4. Rate Limiting
```typescript
// Implement rate limiting to avoid quota exhaustion
const RATE_LIMIT = 10; // requests per minute
```

### 5. Error Handling
```typescript
try {
  const images = await imagenService.generateImages(options);
} catch (error) {
  if (error.code === 429) {
    // Handle rate limit
  } else if (error.code === 401) {
    // Re-authenticate
  }
}
```

## Costs

**Imagen 4.0 Pricing** (as of 2024):
- Standard: ~$0.020 per image
- Fast: ~$0.010 per image
- Ultra: ~$0.040 per image

**Example Monthly Costs**:
- 100 posts/month × 3 images = 300 images
- 300 × $0.020 = $6/month (Standard)
- 300 × $0.010 = $3/month (Fast)

## Troubleshooting

### Issue: "Request had invalid authentication credentials"
**Solution**: 
- Verify OAuth token is valid
- Check token hasn't expired
- Ensure correct scopes are requested

### Issue: "Project not found"
**Solution**:
- Verify `GOOGLE_CLOUD_PROJECT_ID` is correct
- Check project has billing enabled
- Ensure Vertex AI API is enabled

### Issue: "Quota exceeded"
**Solution**:
- Check quota limits in GCP Console
- Request quota increase if needed
- Implement rate limiting in your app

### Issue: "Permission denied"
**Solution**:
- Verify service account has necessary permissions
- Check IAM roles include "Vertex AI User"
- Ensure OAuth scopes include cloud-platform

## Additional Resources

- [Google Cloud Console](https://console.cloud.google.com/)
- [Vertex AI Documentation](https://cloud.google.com/vertex-ai/docs)
- [Imagen API Reference](https://cloud.google.com/vertex-ai/docs/generative-ai/image/overview)
- [OAuth 2.0 Guide](https://developers.google.com/identity/protocols/oauth2)
- [Google Auth Library](https://github.com/googleapis/google-auth-library-nodejs)

---

**Status**: 📋 Ready for Implementation
**Complexity**: ⭐⭐⭐ Moderate (OAuth setup required)
**Time**: ~1-2 hours for initial setup
