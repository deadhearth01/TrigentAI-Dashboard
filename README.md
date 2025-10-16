# TrigentAI Dashboard

TrigentAI is an AI-powered business intelligence platform with three core agents: BI Agent (Business Intelligence), AI Agent (Automation), and GX Agent (Growth Intelligence).

## 🚀 Features

### 🎯 Core Agents
- **BI Agent**: Upload CSV/Excel/PDF files, generate insights, create visualizations
- **AI Agent**: Workflow automation + Social media content generation with AI images (Imagen 4.0 - 3 options per post)
- **GX Agent**: Growth planning, strategy tracking, and AI-powered recommendations

### 🔧 Technical Features
- **Dual Mode**: Local storage or Cloud (Supabase) sync
- **Authentication**: Google Auth, Microsoft Auth, or Guest login (local mode)
- **Dark/Light Theme**: Full theme support with system preference detection
- **Responsive Design**: Mobile-first responsive layout
- **Real-time Updates**: Live dashboard with KPI tracking

## 🛠 Tech Stack

- **Frontend**: Next.js 15 + React 18 + TypeScript
- **UI Components**: HeroUI + TailwindCSS
- **State Management**: Zustand
- **Charts**: Recharts
- **Backend**: Supabase (PostgreSQL, Auth, Storage)
- **AI**: Google Gemini API + Imagen 4.0 (image generation)
- **Deployment**: Vercel

## 📦 Installation

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd trigentai-dashboard
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.local.example .env.local
   ```

4. **Configure environment variables** in `.env.local`:
   ```env
   # Mode Selection
   NEXT_PUBLIC_MODE=local  # or 'cloud'
   
   # Supabase (Required for cloud mode)
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   
   # AI Services
   NEXT_PUBLIC_GEMINI_API_KEY=your_gemini_api_key
   
   # Google Cloud (Optional - for production Imagen 4.0)
   GOOGLE_CLOUD_PROJECT_ID=your_project_id
   GOOGLE_CLIENT_ID=your_oauth_client_id
   GOOGLE_CLIENT_SECRET=your_oauth_client_secret
   
   # Social Media (Optional)
   INSTAGRAM_ACCESS_TOKEN=your_instagram_token
   FACEBOOK_ACCESS_TOKEN=your_facebook_token
   ```

5. **Run the development server**
   ```bash
   npm run dev
   ```

6. **Open the application**
   Visit [http://localhost:3000](http://localhost:3000)

## 🔑 API Keys Setup

### Google Gemini API
1. Visit [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Create a new API key
3. Add to environment variables
4. Used for: Text generation (social posts, insights, recommendations)

### Imagen 4.0 (Optional - Production)
1. Set up Google Cloud Platform project
2. Enable Vertex AI API
3. Configure OAuth 2.0 credentials
4. Follow [GOOGLE-OAUTH-SETUP.md](./GOOGLE-OAUTH-SETUP.md) for detailed instructions
5. Used for: AI image generation (3 options per social media post)

**Note**: Current implementation uses fallback image services (Lorem Picsum, Unsplash, Placeholder.co) for demonstration. See [IMAGEN-INTEGRATION.md](./IMAGEN-INTEGRATION.md) for details.

### Supabase Setup (Cloud Mode)
1. Create a project at [Supabase](https://supabase.com)
2. Get your project URL and anon key
3. Configure authentication providers (Google, Microsoft)
4. Set up Row Level Security policies

### Social Media Integration

#### Instagram Publishing
Requirements:
- Instagram Business Account
- Facebook Developer Account  
- Instagram Basic Display API access
- Instagram Graph API permissions

Setup:
1. Create Facebook App
2. Add Instagram Basic Display product
3. Configure OAuth redirect URIs
4. Get access tokens

#### Facebook Publishing  
Requirements:
- Facebook Business Account
- Facebook Developer Account
- Facebook Graph API access
- Pages permissions

## 🔗 Third-Party Integrations

The Connections page supports integration with:

1. **Email**: Gmail
2. **Productivity**: Notion, Airtable  
3. **Project Management**: Trello
4. **Communication**: Slack
5. **CRM**: Salesforce, HubSpot
6. **E-commerce**: Shopify
7. **Payments**: Stripe  
8. **Automation**: Zapier

Each integration requires specific API credentials. Check the in-app setup instructions.

## 🏗 Database Schema (Supabase)

```sql
-- Users table
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT UNIQUE NOT NULL,
  name TEXT,
  avatar_url TEXT,
  provider TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- File uploads
CREATE TABLE uploads (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  file_url TEXT NOT NULL,
  file_name TEXT,
  file_type TEXT,
  file_size INTEGER,
  uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Reports
CREATE TABLE reports (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  agent TEXT NOT NULL, -- 'BI', 'AI', 'GX'
  title TEXT,
  content JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Automations
CREATE TABLE automations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  steps JSONB,
  status TEXT DEFAULT 'inactive',
  logs JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Social media posts
CREATE TABLE social_posts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  topic TEXT,
  text TEXT,
  image_url TEXT,
  hashtags TEXT[],
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Growth data
CREATE TABLE growth_data (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  target DECIMAL,
  current_growth DECIMAL,
  strategies JSONB,
  market_reach JSONB,
  recommendations JSONB,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

## 🚀 Deployment

### Vercel Deployment

1. **Connect repository to Vercel**
2. **Add environment variables** in Vercel dashboard
3. **Deploy**

### Environment Variables for Production
- Set `NEXT_PUBLIC_MODE=cloud` for production
- Configure all Supabase and API keys
- Ensure all domains are whitelisted

## 🔧 Development

### Project Structure
```
trigentai-dashboard/
├── app/                    # Next.js app directory
├── components/             # React components
│   ├── agents/            # BI, AI, GX agent components
│   ├── auth/              # Authentication components
│   ├── connections/       # Third-party integrations
│   ├── dashboard/         # Dashboard overview
│   ├── layout/            # Layout components
│   └── settings/          # Settings pages
├── lib/                   # Utilities and configurations
│   ├── local-db.ts        # Local storage database
│   ├── store.ts           # Zustand state management
│   └── utils.ts           # Utility functions
└── public/                # Static assets
```

### Key Scripts
```bash
npm run dev        # Development server
npm run build      # Production build  
npm run start      # Start production server
npm run lint       # Run ESLint
```

## 📖 Usage Guide

### Local Mode
- **Authentication**: Guest login (no registration required)
- **Data Storage**: Browser localStorage
- **Sync**: No cloud sync
- **Offline**: Fully functional offline

### Cloud Mode  
- **Authentication**: Google/Microsoft OAuth via Supabase
- **Data Storage**: Supabase PostgreSQL
- **Sync**: Real-time sync across devices
- **Collaborative**: Multi-user support

### BI Agent Usage
1. Upload CSV, Excel, or PDF files
2. Ask questions about your data
3. Generate insights and visualizations
4. Export reports as CSV/PDF

### AI Agent Usage
1. **Workflows**: Describe business processes to automate
2. **Social Media**: 
   - Enter topic for social media post
   - Gemini AI generates engaging text + hashtags
   - Imagen 4.0 generates 3 image options
   - Choose your favorite image from the 3 options
   - Save post with selected image
3. **Publishing**: Connect social accounts to publish directly

### GX Agent Usage
1. Set growth targets
2. Track progress with visualizations
3. Manage growth strategies
4. Get AI-powered recommendations

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

For support and questions:
- Create an issue on GitHub
- Email: support@trigentai.com
- Documentation: [docs.trigentai.com](https://docs.trigentai.com)

## 🎉 Roadmap

- [ ] Advanced AI model integration (GPT-4, Claude)
- [ ] Real-time collaboration features  
- [ ] Mobile app (React Native)
- [ ] Advanced workflow builder (drag-and-drop)
- [ ] Custom dashboard builder
- [ ] Advanced analytics and forecasting
- [ ] Multi-language support
- [ ] Enterprise SSO integration

---

Made with ❤️ by the TrigentAI Team
