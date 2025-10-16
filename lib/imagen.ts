/**
 * Imagen Service using Google GenAI - Gemini 2.5 Flash Image
 * Pure AI image generation - no third-party image services
 */

import { GoogleGenAI } from '@google/genai';

interface ImageGenerationOptions {
  prompt: string;
  numberOfImages?: number; // 1-4
  aspectRatio?: '1:1' | '3:4' | '4:3' | '9:16' | '16:9';
  modelType?: 'standard' | 'ultra' | 'fast';
}

interface ImageGenerationResult {
  images: string[];
  prompt: string;
  error?: string;
}

class ImagenService {
  private ai: GoogleGenAI | null = null;
  private model = 'gemini-2.5-flash-image';

  constructor() {
    try {
      const apiKey = process.env.NEXT_PUBLIC_GOOGLE_CLOUD_API_KEY || process.env.GOOGLE_CLOUD_API_KEY;
      
      if (!apiKey) {
        console.error('❌ Google Cloud API key not found in environment variables');
        console.log('Available env vars:', Object.keys(process.env).filter(k => k.includes('GOOGLE')));
        return;
      }

      console.log('🔑 Initializing Google GenAI with API key:', apiKey.substring(0, 10) + '...');
      this.ai = new GoogleGenAI({ apiKey });
      console.log('✅ Google GenAI initialized successfully');
    } catch (error) {
      console.error('❌ Failed to initialize Google GenAI:', error);
    }
  }

  /**
   * Generate pure AI images using Gemini 2.5 Flash Image
   * NO third-party image services - 100% AI generated
   */
  async generateImages(options: ImageGenerationOptions): Promise<ImageGenerationResult> {
    const {
      prompt,
      numberOfImages = 3,
      aspectRatio = '1:1',
      modelType = 'standard'
    } = options;

    console.log('🎨 Generating PURE AI images with Gemini 2.5 Flash Image:', {
      prompt: prompt.substring(0, 50) + '...',
      numberOfImages,
      aspectRatio,
      modelType
    });

    if (!this.ai) {
      const error = 'Google GenAI not initialized - API key may be missing';
      console.error('❌', error);
      return {
        images: [],
        prompt,
        error
      };
    }

    try {
      const images: string[] = [];

      // Generate each image with AI
      for (let i = 0; i < numberOfImages; i++) {
        console.log(`🖼️ AI generating image ${i + 1}/${numberOfImages}...`);

        // Add variation to prompt for diversity
        const variations = [
          'professional style, high quality',
          'modern aesthetic, creative design',
          'business oriented, clean composition'
        ];
        const variation = variations[i % variations.length];
        const enhancedPrompt = `${prompt}, ${variation}`;

        // Generation config - simplified without safety settings for now
        const generationConfig = {
          maxOutputTokens: 32768,
          temperature: 1,
          topP: 0.95,
          responseModalities: ["IMAGE"],
        };

        const req = {
          model: this.model,
          contents: [
            {
              role: 'user' as const,
              parts: [
                { text: enhancedPrompt }
              ]
            }
          ],
          config: generationConfig,
        };

        try {
          // Use streaming response to get image data
          const streamingResp = await this.ai.models.generateContentStream(req);
          
          let imageData: string | null = null;
          let mimeType = 'image/png';

          for await (const chunk of streamingResp) {
            // Check for inline data in chunk
            if (chunk.candidates && chunk.candidates[0]) {
              const candidate = chunk.candidates[0];
              if (candidate.content && candidate.content.parts) {
                for (const part of candidate.content.parts) {
                  if (part.inlineData && part.inlineData.data) {
                    imageData = part.inlineData.data || null;
                    mimeType = part.inlineData.mimeType || 'image/png';
                    console.log(`✅ Image ${i + 1} generated (${mimeType})`);
                    break;
                  }
                }
              }
            }
          }

          if (imageData) {
            // Convert base64 to data URL
            const dataUrl = `data:${mimeType};base64,${imageData}`;
            images.push(dataUrl);
          } else {
            console.warn(`⚠️ No image data received for image ${i + 1}`);
          }

        } catch (imageError: any) {
          console.error(`❌ Failed to generate image ${i + 1}:`, imageError.message);
          
          // If it's an auth error, stop trying
          if (imageError.message && imageError.message.includes('401')) {
            throw new Error('Authentication failed - OAuth required for Gemini image generation');
          }
        }
      }

      if (images.length === 0) {
        throw new Error('No AI images were generated - API may require OAuth authentication');
      }

      console.log(`✅ Successfully generated ${images.length} pure AI images`);

      return {
        images,
        prompt
      };

    } catch (error: any) {
      console.error('❌ AI image generation error:', error.message);
      
      return {
        images: [],
        prompt,
        error: error.message || 'Failed to generate AI images'
      };
    }
  }

  /**
   * Generate social media optimized images
   */
  async generateSocialMediaImages(
    topic: string,
    platform: 'instagram' | 'twitter' | 'facebook' | 'linkedin' = 'instagram',
    numberOfOptions: number = 3
  ): Promise<ImageGenerationResult> {
    const aspectRatios: { [key: string]: '1:1' | '3:4' | '4:3' | '9:16' | '16:9' } = {
      instagram: '1:1',
      twitter: '16:9',
      facebook: '16:9',
      linkedin: '4:3'
    };

    const enhancedPrompt = this.enhancePrompt(topic, platform);

    return this.generateImages({
      prompt: enhancedPrompt,
      numberOfImages: Math.min(numberOfOptions, 4),
      aspectRatio: aspectRatios[platform] || '1:1',
      modelType: 'standard'
    });
  }

  /**
   * Enhance prompt for better image generation
   */
  private enhancePrompt(topic: string, platform?: string): string {
    const qualityModifiers = [
      'professional',
      'high quality',
      'business',
      'modern',
      'corporate'
    ];

    const platformModifiers: { [key: string]: string } = {
      instagram: 'visually striking social media',
      twitter: 'news worthy professional',
      facebook: 'engaging community',
      linkedin: 'professional corporate'
    };

    let enhanced = topic;
    
    // Add quality modifiers
    enhanced += ' ' + qualityModifiers.slice(0, 2).join(' ');
    
    // Add platform-specific modifiers
    if (platform && platformModifiers[platform]) {
      enhanced += ' ' + platformModifiers[platform];
    }

    return enhanced;
  }

  /**
   * Extract meaningful keywords from prompt
   */
  private extractKeywords(prompt: string): string[] {
    const stopWords = ['the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 
                       'of', 'with', 'professional', 'high', 'quality', 'photography', 
                       'detailed', 'vibrant', 'modern', 'business'];
    
    const words = prompt.toLowerCase()
      .replace(/[^\w\s]/g, ' ')
      .split(/\s+/)
      .filter(word => word.length > 3 && !stopWords.includes(word));
    
    return words.slice(0, 3).length > 0 ? words.slice(0, 3) : ['business', 'professional', 'team'];
  }

  /**
   * Get fallback images using Unsplash
   */
  private getFallbackImages(prompt: string, count: number): ImageGenerationResult {
    const keywords = this.extractKeywords(prompt);
    const images: string[] = [];
    
    for (let i = 0; i < count; i++) {
      const keyword = keywords[i % keywords.length] || 'business';
      const variation = ['professional', 'modern', 'business', 'creative'][i % 4];
      const query = `${keyword},${variation}`;
      
      images.push(
        `https://source.unsplash.com/800x800/?${encodeURIComponent(query)},professional&${Date.now() + i}`
      );
    }
    
    console.log('⚠️ Using fallback images (Unsplash)');
    
    return {
      images,
      prompt,
      error: 'Using fallback image service'
    };
  }

  /**
   * Get single fallback image
   */
  private async getSingleFallbackImage(prompt: string, index: number): Promise<string> {
    const keywords = this.extractKeywords(prompt);
    const keyword = keywords[index % keywords.length] || 'business';
    const variation = ['professional', 'modern', 'business', 'creative'][index % 4];
    const query = `${keyword},${variation}`;
    
    return `https://source.unsplash.com/800x800/?${encodeURIComponent(query)},professional&${Date.now() + index}`;
  }
}

export const imagenService = new ImagenService();
