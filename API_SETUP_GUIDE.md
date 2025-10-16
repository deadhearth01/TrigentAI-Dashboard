# 🔑 API Setup Guide - Trigent AI Dashboard

This guide will help you set up all the necessary API keys to enable AI features in the dashboard.

## 📋 Table of Contents
1. [Gemini API (Google AI)](#gemini-api-google-ai)
2. [Testing Your Setup](#testing-your-setup)
3. [Image Generation](#image-generation)
4. [Troubleshooting](#troubleshooting)

---

## 🤖 Gemini API (Google AI)

### What it does:
- Powers AI-driven content generation
- Generates SWOT analysis insights
- Creates workflow automations
- Writes social media posts
- Provides intelligent business recommendations

### How to get your API key:

1. **Visit Google AI Studio**
   - Go to: https://makersuite.google.com/app/apikey
   - Sign in with your Google account

2. **Create an API Key**
   - Click "Get API Key" or "Create API Key"
   - Select "Create API key in new project" or choose an existing project
   - Copy the generated API key (starts with `AIza...`)

3. **Add to your `.env.local` file**
   ```bash
   NEXT_PUBLIC_GEMINI_API_KEY=AIzaSy...your_actual_key_here
   ```

### Models Used:
- **gemini-1.5-flash**: Fast, efficient model for general text generation
- **gemini-1.5-pro**: More capable model for complex tasks (available in code)

### Pricing:
- ✅ **Free Tier**: 15 requests per minute, 1 million tokens per day
- ✅ **Generous Limits**: Perfect for development and small-scale production
- 💰 **Paid Plans**: Available if you need higher limits

### Rate Limits:
```
Free Tier:
- 15 requests per minute
- 1 million tokens per day
- 1,500 requests per day

Pay-as-you-go:
- 360 requests per minute
- 4 million tokens per day
```

---

## 🖼️ Image Generation

### Current Implementation:
The dashboard uses **multiple fallback services** to ensure images always load:

1. **Lorem Picsum** (Primary)
   - High-quality random stock photos
   - No API key required
   - Free and reliable

2. **Unsplash Source** (Secondary)
   - Keyword-based stock photos
   - No API key required
   - Free service

3. **Placeholder.co** (Fallback)
   - Text-based placeholder images
   - Always available
   - No API key required

### Why this approach?
- ✅ No additional API keys needed
- ✅ Always works, even without configuration
- ✅ Professional-looking images
- ✅ Zero cost

### Optional: Use AI Image Generation
If you want to use actual AI-generated images (like DALL-E or Stable Diffusion), you can:

1. **Replicate API** (Recommended)
   - Sign up at: https://replicate.com
   - Get API token from: https://replicate.com/account/api-tokens
   - Add to `.env.local`:
     ```bash
     NEXT_PUBLIC_REPLICATE_API_TOKEN=r8_...your_token
     ```

2. **Update the code** in `lib/image-generation.ts` to use Replicate models

---

## 🧪 Testing Your Setup

### Method 1: Settings Page
1. Navigate to **Settings** → **API Configuration** tab
2. Look for the "Current Model Configuration" section
3. Click the **"Test API"** button
4. You should see: ✅ "API Connection Successful!"

### Method 2: Try Features
1. **SWOT Analysis**: Click SWOT Analysis in sidebar → "Generate AI Analysis"
2. **AI Agent**: Click AI Agent → Create Automation → "Generate with AI"
3. **Social Media**: Click AI Agent → Social Media Post → Generate

### Method 3: Browser Console
```javascript
// Open browser console (F12)
// Check if API key is configured
console.log(process.env.NEXT_PUBLIC_GEMINI_API_KEY ? 'API Key Found' : 'API Key Missing');
```

---

## 🔧 Troubleshooting

### Error: "API key not configured"
**Solution**: 
1. Check your `.env.local` file exists in the project root
2. Verify the variable name is exactly: `NEXT_PUBLIC_GEMINI_API_KEY`
3. Restart your development server: `npm run dev`

### Error: "API_KEY_ERROR: 403"
**Possible causes**:
- Invalid API key
- API key restrictions (check Google Cloud Console)
- Billing not enabled (rare, free tier usually works)

**Solution**:
1. Regenerate your API key at https://makersuite.google.com/app/apikey
2. Replace the old key in `.env.local`
3. Restart the dev server

### Error: "QUOTA_EXCEEDED: 429"
**Cause**: You've exceeded the free tier rate limits

**Solutions**:
1. Wait a minute and try again (rate limit is per minute)
2. The app will automatically use fallback content
3. Upgrade to paid plan for higher limits

### Error: "MODEL_ERROR: Model not found"
**Cause**: The specified model is not available

**Solution**:
1. The app uses stable models: `gemini-1.5-flash` and `gemini-1.5-pro`
2. These should always be available
3. If error persists, check Google AI Studio for model availability

### Error: No response from API
**Debug Steps**:
1. Check your internet connection
2. Verify API key is correct (no extra spaces)
3. Check browser console for detailed error messages
4. Try the "Test API" button in Settings

### Images not loading
**This should NOT happen** as we use multiple fallbacks, but if it does:

1. Check browser console for CORS errors
2. Try a different browser
3. Clear browser cache
4. The app should automatically fallback to placeholder images

---

## 📝 Environment Variables Reference

Your `.env.local` file should look like this:

```bash
# Required for AI Features
NEXT_PUBLIC_GEMINI_API_KEY=AIzaSy...your_actual_key

# Optional - Image Generation (not required, uses fallbacks)
NEXT_PUBLIC_NANO_BANANA_API_KEY=your_key_if_you_have_one

# Optional - Social Media Integration
INSTAGRAM_ACCESS_TOKEN=your_token
FACEBOOK_ACCESS_TOKEN=your_token

# Mode
NEXT_PUBLIC_MODE=local
```

---

## 🎯 Quick Start Checklist

- [ ] Create Google AI Studio account
- [ ] Generate Gemini API key
- [ ] Create `.env.local` file in project root
- [ ] Add `NEXT_PUBLIC_GEMINI_API_KEY=your_key`
- [ ] Restart dev server: `npm run dev`
- [ ] Test API in Settings page
- [ ] Try SWOT Analysis or AI Agent features
- [ ] ✅ Enjoy AI-powered features!

---

## 🆘 Need Help?

### Common Questions:

**Q: Do I need a credit card for Gemini API?**
A: No! The free tier is generous and doesn't require payment information.

**Q: Will the app work without API keys?**
A: Yes! The app has fallback content generators for offline/demo use. Images will still work using free stock photo services.

**Q: How much does it cost per request?**
A: In the free tier: $0 (up to limits). Paid tier: ~$0.001-0.005 per request (very cheap).

**Q: Can I use other AI services?**
A: Yes! You can modify `lib/gemini.ts` to use OpenAI, Anthropic, or any other API.

---

## 📚 Additional Resources

- [Google AI Studio Documentation](https://ai.google.dev/docs)
- [Gemini API Pricing](https://ai.google.dev/pricing)
- [Rate Limits & Quotas](https://ai.google.dev/docs/quota)
- [Model Information](https://ai.google.dev/models/gemini)

---

**Last Updated**: October 15, 2025
**Version**: 1.0.0
