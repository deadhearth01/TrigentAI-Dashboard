# TrigentAI Dashboard - Quick Reference

## 🎯 What is TrigentAI?

TrigentAI Dashboard is an **all-in-one AI-powered business management platform** that helps businesses:
- 📊 Analyze data and generate insights (BI Agent)
- 🤖 Automate workflows and create content (AI Agent)  
- 📈 Plan and execute growth strategies (GX Agent)
- 🎯 Conduct SWOT and competitive analysis
- 📰 Stay updated with industry news
- 💼 Manage workspaces and teams

## 🚀 Quick Start

### For Development
```bash
npm install
npm run dev
# Open http://localhost:3000
```

### For Production
```bash
npm run build
npm start
```

## 🔑 Required Services

### 1. **Firebase** (Backend)
- ✅ Already configured
- Project: trigentai
- Services: Auth, Firestore, Storage, Analytics

### 2. **Google GenAI** (AI Features)
- API Key: AIzaSyCd0-T1nLAEABtWXvfPDr4IBPt1o7syugg
- Used for: Text generation, image creation (Imagen 4.0)

### 3. **NewsData.io** (News Feed)
- API Key: pub_7bb2688cac2944e08d153e1fc5a0d858
- Used for: Real-time news aggregation

## 📱 Application Structure

### Main Sections
```
Overview
├── Dashboard (Home page with KPIs)

Trigent AI Agents
├── BI Agent (Business Intelligence & Analytics)
├── AI Agent (Automation & Content Creation)
└── GX Agent (Growth Strategy & Planning)

Business Intelligence
├── SWOT Analysis (Strategic Planning)
├── Competitive Analysis (Market Research)
└── News Feed (Industry Updates)

Configuration
├── Connections (Integrations)
└── Settings (User Preferences)
```

## 🎨 Key Features

### BI Agent
- Upload data files (CSV, Excel, PDF)
- Generate insights and reports
- Create visualizations
- Export analysis

### AI Agent
- Create social media content
- Generate 3 AI image options per post
- Automate workflows
- Schedule tasks

### GX Agent
- Set growth targets
- Track progress
- Get AI recommendations
- Plan market expansion

### SWOT Analysis
- Identify strengths, weaknesses, opportunities, threats
- AI-powered strategic insights
- Actionable recommendations

### Competitive Analysis
- Track competitors
- Market share analysis
- Competitive positioning
- Benchmarking

### News Feed
- Industry news from Google News
- AI & Technology trends
- Business updates
- Category filtering

## 🔐 Authentication

### Supported Methods
- Firebase Auth
- Guest Mode (Local)
- Google OAuth
- Microsoft OAuth

### Subscription Tiers
- **Trial**: 7 days full access
- **Free**: Basic features
- **Pro**: Full features ($29-49/month)

## 🛠️ Tech Stack Summary

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 15.5.4, React 18, TypeScript |
| UI | HeroUI, TailwindCSS |
| State | Zustand |
| Backend | Firebase (Auth, Firestore, Storage) |
| AI | Google Gemini AI, Imagen 4.0 |
| Charts | Recharts |
| Deployment | Vercel, Firebase Hosting |

## 📂 Important Files

| File | Purpose |
|------|---------|
| `/lib/firebase.ts` | Firebase configuration & services |
| `/lib/store.ts` | Zustand state management |
| `/lib/gemini.ts` | Google GenAI integration |
| `/lib/newsdata.ts` | News API service |
| `/components/layout/` | App layout components |
| `/components/agents/` | AI agent components |
| `/app/` | Next.js pages |

## 🔧 Environment Variables

```env
# Google GenAI
NEXT_PUBLIC_GOOGLE_CLOUD_API_KEY=AIzaSyCd0-...

# NewsData API
NEXT_PUBLIC_NEWSDATA_API_KEY=pub_7bb2688cac...

# Firebase (hardcoded in lib/firebase.ts)
# No env vars needed - already configured
```

## 📊 Key Metrics Tracked

- Total Revenue & Growth
- Active Automations
- Growth Rate & Targets
- Efficiency Score
- Competitor Count
- SWOT Items
- News Articles
- Agent Usage

## 🎯 User Journey

```
1. Sign In/Sign Up
   ↓
2. View Dashboard (KPIs & metrics)
   ↓
3. Select AI Agent or Tool
   ↓
4. Perform Analysis/Automation
   ↓
5. Get AI-Powered Insights
   ↓
6. Take Action & Monitor Results
```

## 🚀 Deployment Commands

### Vercel
```bash
vercel deploy --prod
```

### Firebase Hosting
```bash
npm run build
firebase deploy
```

## 📱 Mobile Optimization

✅ Fully responsive design
✅ Mobile-first approach
✅ Touch-optimized controls
✅ Responsive charts and grids
✅ Mobile sidebar with overlay
✅ Icon-only buttons on small screens

## 🔗 Key URLs

- **Local Dev**: http://localhost:3000
- **Production**: https://trigentai-dashboard.vercel.app
- **GitHub**: https://github.com/deadhearth01/TrigentAI-Dashboard
- **Firebase Console**: https://console.firebase.google.com/project/trigentai

## 🆘 Common Commands

```bash
# Install dependencies with legacy peer deps
npm install --legacy-peer-deps

# Start development server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Deploy to Vercel
vercel --prod

# Initialize Firebase
firebase init

# Deploy to Firebase
firebase deploy

# Check Firebase login
firebase login

# Git commands
git add .
git commit -m "message"
git push origin main
```

## 📖 Documentation Files

- `README.md` - Full project documentation
- `APP_OVERVIEW.md` - Application concept and vision
- `FIREBASE_SETUP.md` - Firebase integration guide
- `GOOGLE-OAUTH-SETUP.md` - OAuth configuration
- `IMAGEN-INTEGRATION.md` - Image generation setup

## 🎨 Brand Colors

- Primary: Purple/Blue gradient
- Success: Green
- Warning: Orange
- Danger: Red
- Dark Theme: Gray-900 background
- Light Theme: Gray-50 background

## 🔥 Firebase Collections

```
users/           - User profiles
workspaces/      - User workspaces
automations/     - Automation workflows
social_posts/    - Generated content
reports/         - BI reports
swot_analysis/   - SWOT analyses
growth_data/     - Growth metrics
uploads/         - File storage refs
```

---

**TrigentAI Dashboard** - Intelligence • Automation • Growth

For detailed information, see:
- **Full Overview**: [APP_OVERVIEW.md](./APP_OVERVIEW.md)
- **Technical Docs**: [README.md](./README.md)
- **Firebase Setup**: [FIREBASE_SETUP.md](./FIREBASE_SETUP.md)
