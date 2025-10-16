'use client';

interface GeminiResponse {
  candidates?: Array<{
    content: {
      parts: Array<{
        text: string;
      }>;
    };
  }>;
  error?: {
    message: string;
    code: number;
  };
}

interface WorkflowStep {
  id: string;
  title: string;
  description: string;
  type: 'action' | 'condition' | 'trigger';
  estimated_time?: string;
  requirements?: string[];
}

interface WorkflowResult {
  name: string;
  description: string;
  steps: WorkflowStep[];
  estimated_total_time: string;
  difficulty: 'easy' | 'medium' | 'hard';
  tags: string[];
}

export class GeminiService {
  private apiKey: string | null;
  private baseApiUrl = 'https://generativelanguage.googleapis.com/v1beta/models';
  
  // Model configurations - Using working Gemini 2.0 models
  private models = {
    text: 'gemini-2.0-flash-exp',      // ✅ Working! Latest Gemini 2.0 Flash
    lite: 'gemini-2.0-flash-exp',      // Same model for consistency
    image: 'gemini-2.0-flash-exp'      // Supports image understanding
  };

  constructor() {
    this.apiKey = typeof window !== 'undefined' ? process.env.NEXT_PUBLIC_GEMINI_API_KEY || null : null;
  }

  private async makeRequest(prompt: string, workspaceInstructions?: string, useAdvancedModel: boolean = false): Promise<GeminiResponse> {
    if (!this.apiKey) {
      throw new Error('Gemini API key not configured. Please add NEXT_PUBLIC_GEMINI_API_KEY to your environment variables.');
    }

    // Combine workspace instructions with the main prompt
    const enhancedPrompt = workspaceInstructions 
      ? `${workspaceInstructions}\n\n${prompt}`
      : prompt;

    const modelName = useAdvancedModel ? this.models.text : this.models.lite;
    const requestUrl = `${this.baseApiUrl}/${modelName}:generateContent`;
    
    // Log which model we're using for debugging
    if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
      console.log(`Using Gemini model: ${modelName}`);
      console.log(`API URL: ${requestUrl}`);
    }

    const response = await fetch(`${requestUrl}?key=${this.apiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: enhancedPrompt
          }]
        }],
        generationConfig: {
          temperature: 0.7,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 2048,
        }
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const errorMessage = errorData.error?.message || 'Unknown error';
      
      // Log detailed error information
      console.error(`Gemini API Error Details:`, {
        status: response.status,
        statusText: response.statusText,
        model: modelName,
        error: errorData,
        url: requestUrl
      });
      
      // Handle different types of errors
      if (response.status === 429) {
        // Rate limit exceeded
        throw new Error(`QUOTA_EXCEEDED: ${errorMessage}`);
      } else if (response.status === 403) {
        // API key issues
        throw new Error(`API_KEY_ERROR: ${errorMessage}`);
      } else if (response.status === 404) {
        // Model not found
        throw new Error(`MODEL_ERROR: Model ${modelName} not found or unavailable`);
      } else {
        throw new Error(`GEMINI_API_ERROR: ${response.status} - ${errorMessage}`);
      }
    }

    return response.json();
  }

  async generateWorkflow(description: string, workspaceInstructions?: string): Promise<WorkflowResult> {
    const prompt = `
You are a business process automation expert. Create a detailed workflow automation plan for the following business process:

"${description}"

Please respond with a JSON object in this exact format:
{
  "name": "Clear workflow name",
  "description": "Brief description of what this workflow accomplishes",
  "steps": [
    {
      "id": "step-1",
      "title": "Step title",
      "description": "Detailed description of what happens in this step",
      "type": "trigger|action|condition",
      "estimated_time": "e.g., 2 minutes",
      "requirements": ["List of requirements or tools needed"]
    }
  ],
  "estimated_total_time": "Total time estimate",
  "difficulty": "easy|medium|hard",
  "tags": ["relevant", "tags"]
}

Make sure the workflow is practical, actionable, and includes 3-8 specific steps. Focus on real-world implementation.
`;

    try {
      const response = await this.makeRequest(prompt, workspaceInstructions, false);
      
      if (response.error) {
        console.error('Gemini API error:', response.error);
        throw new Error(`Gemini API error: ${response.error.message}`);
      }

      const text = response.candidates?.[0]?.content?.parts?.[0]?.text;
      if (!text) {
        throw new Error('No response text from Gemini API');
      }

      // Extract JSON from the response (handle markdown code blocks too)
      let jsonText = text;
      const codeBlockMatch = text.match(/```(?:json)?\s*([\s\S]*?)```/);
      if (codeBlockMatch) {
        jsonText = codeBlockMatch[1];
      } else {
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          jsonText = jsonMatch[0];
        }
      }

      const workflowData = JSON.parse(jsonText.trim());
      
      // Validate the response structure
      if (!workflowData.name || !workflowData.steps || !Array.isArray(workflowData.steps)) {
        throw new Error('Invalid workflow structure from Gemini API');
      }

      return workflowData as WorkflowResult;
    } catch (error) {
      console.error('Gemini workflow generation error:', error);
      
      // Return a fallback workflow based on the description
      return this.generateFallbackWorkflow(description);
    }
  }

  async generateSocialMediaPost(topic: string, workspaceInstructions?: string): Promise<{
    text: string;
    hashtags: string[];
    description: string;
    imagePrompt: string;
  }> {
    const prompt = `
Create an engaging social media post about "${topic}".

Please respond with a JSON object in this exact format:
{
  "text": "Engaging social media post text (150-200 characters)",
  "hashtags": ["relevant", "hashtags", "without", "hash"],
  "description": "Brief description of the post strategy",
  "imagePrompt": "Detailed prompt for AI image generation"
}

Make the post engaging, professional, and suitable for business social media accounts.
`;

    try {
      const response = await this.makeRequest(prompt, workspaceInstructions, false);
      
      if (response.error) {
        console.error('Gemini API error:', response.error);
        throw new Error(`Gemini API error: ${response.error.message}`);
      }

      const text = response.candidates?.[0]?.content?.parts?.[0]?.text;
      if (!text) {
        throw new Error('No response text from Gemini API');
      }

      // Extract JSON from the response (handle markdown code blocks too)
      let jsonText = text;
      const codeBlockMatch = text.match(/```(?:json)?\s*([\s\S]*?)```/);
      if (codeBlockMatch) {
        jsonText = codeBlockMatch[1];
      } else {
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          jsonText = jsonMatch[0];
        }
      }

      return JSON.parse(jsonText.trim());
    } catch (error) {
      console.error('Gemini social post generation error:', error);
      
      // Return a fallback post
      return {
        text: `🚀 Exciting developments in ${topic}! Discover how this can transform your business strategy and drive growth. #Innovation #Business`,
        hashtags: ['Innovation', 'Business', 'Growth', 'Strategy'],
        description: `Engaging post about ${topic} with business focus`,
        imagePrompt: `Professional business illustration about ${topic}, modern design, clean background`
      };
    }
  }

  private generateFallbackWorkflow(description: string): WorkflowResult {
    // Generate a basic workflow structure when API is unavailable
    const words = description.toLowerCase().split(' ');
    const isEmail = words.some(w => ['email', 'mail', 'newsletter'].includes(w));
    const isCustomer = words.some(w => ['customer', 'client', 'user'].includes(w));
    const isReport = words.some(w => ['report', 'analytics', 'data'].includes(w));

    if (isEmail) {
      return {
        name: 'Email Automation Workflow',
        description: 'Automated email workflow based on your requirements',
        steps: [
          {
            id: 'trigger',
            title: 'Set Email Trigger',
            description: 'Define when the email should be sent (e.g., user signup, purchase)',
            type: 'trigger',
            estimated_time: '5 minutes',
            requirements: ['Email platform access', 'Trigger criteria']
          },
          {
            id: 'segment',
            title: 'Audience Segmentation',
            description: 'Identify and segment your target audience',
            type: 'action',
            estimated_time: '10 minutes',
            requirements: ['Customer database', 'Segmentation criteria']
          },
          {
            id: 'compose',
            title: 'Create Email Content',
            description: 'Design and write the email content',
            type: 'action',
            estimated_time: '20 minutes',
            requirements: ['Email template', 'Content guidelines']
          },
          {
            id: 'schedule',
            title: 'Schedule Delivery',
            description: 'Set up timing and delivery schedule',
            type: 'action',
            estimated_time: '5 minutes',
            requirements: ['Scheduling system', 'Optimal send times']
          },
          {
            id: 'monitor',
            title: 'Monitor Performance',
            description: 'Track open rates, clicks, and conversions',
            type: 'action',
            estimated_time: 'Ongoing',
            requirements: ['Analytics dashboard', 'KPI definitions']
          }
        ],
        estimated_total_time: '40 minutes setup + ongoing monitoring',
        difficulty: 'medium',
        tags: ['email', 'marketing', 'automation']
      };
    } else if (isCustomer && !isReport) {
      return {
        name: 'Customer Onboarding Workflow',
        description: 'Streamlined customer onboarding process',
        steps: [
          {
            id: 'welcome',
            title: 'Welcome Message',
            description: 'Send personalized welcome message to new customers',
            type: 'trigger',
            estimated_time: '2 minutes',
            requirements: ['CRM system', 'Welcome template']
          },
          {
            id: 'account-setup',
            title: 'Account Setup Guide',
            description: 'Provide step-by-step account setup instructions',
            type: 'action',
            estimated_time: '5 minutes',
            requirements: ['Setup documentation', 'Tutorial videos']
          },
          {
            id: 'followup',
            title: 'Follow-up Check-in',
            description: 'Schedule follow-up after 48 hours',
            type: 'action',
            estimated_time: '3 minutes',
            requirements: ['Scheduling system', 'Check-in template']
          },
          {
            id: 'feedback',
            title: 'Collect Feedback',
            description: 'Request feedback on onboarding experience',
            type: 'action',
            estimated_time: '2 minutes',
            requirements: ['Feedback form', 'Survey tool']
          }
        ],
        estimated_total_time: '12 minutes setup',
        difficulty: 'easy',
        tags: ['onboarding', 'customer', 'experience']
      };
    } else {
      return {
        name: 'Custom Business Workflow',
        description: 'Tailored workflow for your business process',
        steps: [
          {
            id: 'analyze',
            title: 'Process Analysis',
            description: 'Analyze current process and identify automation opportunities',
            type: 'action',
            estimated_time: '15 minutes',
            requirements: ['Process documentation', 'Stakeholder input']
          },
          {
            id: 'design',
            title: 'Workflow Design',
            description: 'Design the automated workflow structure',
            type: 'action',
            estimated_time: '20 minutes',
            requirements: ['Workflow tools', 'Process map']
          },
          {
            id: 'implement',
            title: 'Implementation',
            description: 'Set up the automation in your chosen platform',
            type: 'action',
            estimated_time: '30 minutes',
            requirements: ['Automation platform', 'Technical setup']
          },
          {
            id: 'test',
            title: 'Testing & Validation',
            description: 'Test the workflow with sample data',
            type: 'action',
            estimated_time: '10 minutes',
            requirements: ['Test scenarios', 'Sample data']
          },
          {
            id: 'deploy',
            title: 'Deploy & Monitor',
            description: 'Deploy to production and monitor performance',
            type: 'action',
            estimated_time: '5 minutes',
            requirements: ['Monitoring tools', 'Performance metrics']
          }
        ],
        estimated_total_time: '80 minutes',
        difficulty: 'medium',
        tags: ['automation', 'business', 'process']
      };
    }
  }

  async generateText(prompt: string, workspaceInstructions?: string, useAdvancedModel: boolean = false): Promise<string> {
    try {
      const response = await this.makeRequest(prompt, workspaceInstructions, useAdvancedModel);
      
      if (response.error) {
        console.error('Gemini API error:', response.error);
        throw new Error(`Gemini API error: ${response.error.message}`);
      }

      const text = response.candidates?.[0]?.content?.parts?.[0]?.text;
      if (!text) {
        throw new Error('No response text from Gemini API');
      }

      return text;
    } catch (error) {
      console.error('Gemini text generation error:', error);
      throw error;
    }
  }

  isConfigured(): boolean {
    return !!this.apiKey;
  }

  getModelInfo() {
    return {
      textModel: this.models.text,
      liteModel: this.models.lite,
      imageModel: this.models.image,
      isConfigured: this.isConfigured()
    };
  }

  // Test the API connection
  async testConnection(): Promise<{ success: boolean; message: string; modelInfo?: any }> {
    if (!this.isConfigured()) {
      return {
        success: false,
        message: 'API key not configured'
      };
    }

    try {
      const testPrompt = 'Say "Hello! Gemini API is working correctly." in one sentence.';
      const response = await this.generateText(testPrompt);
      
      return {
        success: true,
        message: 'Gemini API is working correctly',
        modelInfo: this.getModelInfo()
      };
    } catch (error: any) {
      return {
        success: false,
        message: error.message || 'Failed to connect to Gemini API'
      };
    }
  }
}

export const geminiService = new GeminiService();
