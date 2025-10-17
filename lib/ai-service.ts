import { GoogleGenerativeAI } from '@google/generative-ai';

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(process.env.NEXT_PUBLIC_GEMINI_API_KEY || '');

export interface AIAnalysisResult {
  summary: string;
  insights: string[];
  recommendations: string[];
  data?: any[];
  charts?: any;
}

export interface SWOTResult {
  strengths: Array<{ id: string; text: string; score: number; aiGenerated: boolean }>;
  weaknesses: Array<{ id: string; text: string; severity: 'low' | 'medium' | 'high'; aiGenerated: boolean }>;
  opportunities: Array<{ id: string; text: string; potential: 'low' | 'medium' | 'high'; aiGenerated: boolean }>;
  threats: Array<{ id: string; text: string; risk: 'low' | 'medium' | 'high'; aiGenerated: boolean }>;
  recommendations: string[];
}

export interface CompetitiveAnalysisResult {
  competitors: Array<{
    id: string;
    name: string;
    strengths: string[];
    weaknesses: string[];
    marketShare?: number;
    rating?: number;
  }>;
  summary: {
    marketSize?: number;
    growth?: number;
    keyTrends: string[];
  };
}

export interface GrowthStrategyResult {
  title: string;
  description: string;
  goals: Array<{
    id: string;
    title: string;
    metric: string;
    target: number;
    deadline: Date;
  }>;
  tactics: Array<{
    id: string;
    title: string;
    description: string;
    priority: 'low' | 'medium' | 'high';
    estimatedImpact: number;
  }>;
}

class AIService {
  private model = genAI.getGenerativeModel({ model: 'gemini-pro' });

  // BI Agent - Data Analysis
  async analyzeBusinessData(query: string, data?: any[]): Promise<AIAnalysisResult> {
    try {
      const prompt = `
You are a Business Intelligence analyst. Analyze the following query and provide insights.

Query: ${query}

${data ? `Data: ${JSON.stringify(data, null, 2)}` : ''}

Provide a JSON response with the following structure:
{
  "summary": "Brief overview of the analysis",
  "insights": ["insight 1", "insight 2", "insight 3"],
  "recommendations": ["recommendation 1", "recommendation 2", "recommendation 3"]
}
`;

      const result = await this.model.generateContent(prompt);
      const response = result.response;
      const text = response.text();
      
      // Try to parse JSON from the response
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        return {
          summary: parsed.summary || text,
          insights: parsed.insights || [],
          recommendations: parsed.recommendations || [],
          data,
        };
      }
      
      // Fallback to text-based parsing
      return {
        summary: text,
        insights: this.extractBulletPoints(text, 'insights'),
        recommendations: this.extractBulletPoints(text, 'recommendations'),
        data,
      };
    } catch (error) {
      console.error('AI Analysis error:', error);
      return {
        summary: 'Analysis temporarily unavailable. Please try again.',
        insights: ['Unable to generate insights at this time'],
        recommendations: ['Please retry the analysis'],
        data,
      };
    }
  }

  // Generate SWOT Analysis
  async generateSWOT(businessContext: string): Promise<SWOTResult> {
    try {
      const prompt = `
You are a strategic business analyst. Generate a comprehensive SWOT analysis for the following business:

Business Context: ${businessContext}

Provide a JSON response with this exact structure:
{
  "strengths": [{"text": "strength description", "score": 1-10}],
  "weaknesses": [{"text": "weakness description", "severity": "low|medium|high"}],
  "opportunities": [{"text": "opportunity description", "potential": "low|medium|high"}],
  "threats": [{"text": "threat description", "risk": "low|medium|high"}],
  "recommendations": ["strategic recommendation 1", "recommendation 2"]
}

Provide 3-5 items for each category.
`;

      const result = await this.model.generateContent(prompt);
      const text = result.response.text();
      
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        
        return {
          strengths: (parsed.strengths || []).map((s: any, i: number) => ({
            id: `s${i + 1}`,
            text: s.text,
            score: s.score || 7,
            aiGenerated: true,
          })),
          weaknesses: (parsed.weaknesses || []).map((w: any, i: number) => ({
            id: `w${i + 1}`,
            text: w.text,
            severity: w.severity || 'medium',
            aiGenerated: true,
          })),
          opportunities: (parsed.opportunities || []).map((o: any, i: number) => ({
            id: `o${i + 1}`,
            text: o.text,
            potential: o.potential || 'medium',
            aiGenerated: true,
          })),
          threats: (parsed.threats || []).map((t: any, i: number) => ({
            id: `t${i + 1}`,
            text: t.text,
            risk: t.risk || 'medium',
            aiGenerated: true,
          })),
          recommendations: parsed.recommendations || [],
        };
      }
      
      throw new Error('Failed to parse SWOT response');
    } catch (error) {
      console.error('SWOT generation error:', error);
      throw error;
    }
  }

  // Generate Competitive Analysis
  async analyzeCompetitors(industry: string, marketScope: string): Promise<CompetitiveAnalysisResult> {
    try {
      const prompt = `
You are a market research analyst. Analyze the competitive landscape for:

Industry: ${industry}
Market Scope: ${marketScope}

Provide a JSON response with this structure:
{
  "competitors": [
    {
      "name": "Competitor Name",
      "strengths": ["strength 1", "strength 2"],
      "weaknesses": ["weakness 1", "weakness 2"],
      "marketShare": 25,
      "rating": 4.5
    }
  ],
  "summary": {
    "keyTrends": ["trend 1", "trend 2", "trend 3"]
  }
}

Identify 3-5 key competitors.
`;

      const result = await this.model.generateContent(prompt);
      const text = result.response.text();
      
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        
        return {
          competitors: (parsed.competitors || []).map((c: any, i: number) => ({
            id: `c${i + 1}`,
            name: c.name,
            strengths: c.strengths || [],
            weaknesses: c.weaknesses || [],
            marketShare: c.marketShare,
            rating: c.rating,
          })),
          summary: {
            keyTrends: parsed.summary?.keyTrends || [],
          },
        };
      }
      
      throw new Error('Failed to parse competitive analysis response');
    } catch (error) {
      console.error('Competitive analysis error:', error);
      throw error;
    }
  }

  // Generate Growth Strategy (GX Agent)
  async generateGrowthStrategy(
    businessContext: string,
    currentMetrics: any,
    targetGoals: string
  ): Promise<GrowthStrategyResult> {
    try {
      const prompt = `
You are a growth strategist. Create a comprehensive growth strategy for:

Business Context: ${businessContext}
Current Metrics: ${JSON.stringify(currentMetrics)}
Target Goals: ${targetGoals}

Provide a JSON response with this structure:
{
  "title": "Strategy Title",
  "description": "Strategy overview",
  "goals": [
    {
      "title": "Goal title",
      "metric": "metric name",
      "target": 1000,
      "timeframe": "3 months"
    }
  ],
  "tactics": [
    {
      "title": "Tactic title",
      "description": "Tactic description",
      "priority": "high|medium|low",
      "estimatedImpact": 1-10
    }
  ]
}

Provide 3-5 goals and 5-7 tactics.
`;

      const result = await this.model.generateContent(prompt);
      const text = result.response.text();
      
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        
        return {
          title: parsed.title,
          description: parsed.description,
          goals: (parsed.goals || []).map((g: any, i: number) => ({
            id: `g${i + 1}`,
            title: g.title,
            metric: g.metric,
            target: g.target,
            deadline: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000), // 3 months
          })),
          tactics: (parsed.tactics || []).map((t: any, i: number) => ({
            id: `t${i + 1}`,
            title: t.title,
            description: t.description,
            priority: t.priority || 'medium',
            estimatedImpact: t.estimatedImpact || 5,
          })),
        };
      }
      
      throw new Error('Failed to parse growth strategy response');
    } catch (error) {
      console.error('Growth strategy generation error:', error);
      throw error;
    }
  }

  // Generate social media content caption
  async generateSocialCaption(
    platform: string,
    topic: string,
    tone: string = 'professional'
  ): Promise<{ caption: string; hashtags: string[] }> {
    try {
      const prompt = `
Generate a ${tone} social media post for ${platform} about: ${topic}

Provide a JSON response with:
{
  "caption": "The post caption text",
  "hashtags": ["hashtag1", "hashtag2", "hashtag3"]
}

Keep it concise and engaging.
`;

      const result = await this.model.generateContent(prompt);
      const text = result.response.text();
      
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        return {
          caption: parsed.caption || text,
          hashtags: parsed.hashtags || [],
        };
      }
      
      return {
        caption: text,
        hashtags: [],
      };
    } catch (error) {
      console.error('Caption generation error:', error);
      return {
        caption: `Check out our latest update about ${topic}! #business #innovation`,
        hashtags: ['business', 'innovation', 'growth'],
      };
    }
  }

  // Helper function to extract bullet points from text
  private extractBulletPoints(text: string, section: string): string[] {
    const lines = text.split('\n');
    const points: string[] = [];
    let inSection = false;

    for (const line of lines) {
      if (line.toLowerCase().includes(section.toLowerCase())) {
        inSection = true;
        continue;
      }
      
      if (inSection && (line.startsWith('-') || line.startsWith('•') || line.startsWith('*'))) {
        points.push(line.replace(/^[-•*]\s*/, '').trim());
      }
      
      if (inSection && line.trim() === '' && points.length > 0) {
        break;
      }
    }

    return points.length > 0 ? points : [text];
  }
}

export const aiService = new AIService();
export default aiService;
