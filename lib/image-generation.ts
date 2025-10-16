'use client';

interface ImageGenerationResponse {
  success: boolean;
  image_url?: string;
  error?: string;
}

interface NanoBananaResponse {
  status: string;
  output?: string[];
  image_url?: string;
  url?: string;
  error?: string;
}

export class ImageGenerationService {
  private apiKey: string | null;

  constructor() {
    // Use dedicated Nano Banana API key
    this.apiKey = typeof window !== 'undefined' ? process.env.NEXT_PUBLIC_NANO_BANANA_API_KEY || null : null;
  }

  async generateImage(prompt: string, style: 'professional' | 'creative' | 'minimal' = 'professional'): Promise<ImageGenerationResponse> {
    if (typeof window === 'undefined') {
      return this.getPlaceholderImageResponse(prompt);
    }

    // Try Nano Banana API first if available
    if (this.apiKey) {
      try {
        const result = await this.tryNanoBanana(prompt, style);
        if (result.success) {
          return result;
        }
      } catch (error) {
        console.log('Nano Banana API failed, trying fallbacks', error);
      }
    }

    // Try multiple image generation services in order
    const services = [
      () => this.tryPicsum(prompt),
      () => this.tryUnsplash(prompt),
      () => this.tryPlaceholder(prompt)
    ];

    for (const service of services) {
      try {
        const result = await service();
        if (result.success) {
          return result;
        }
      } catch (error) {
        console.log('Image service failed, trying next option');
        continue;
      }
    }

    // Final fallback
    return this.getPlaceholderImageResponse(prompt);
  }

  private async tryNanoBanana(prompt: string, style: 'professional' | 'creative' | 'minimal'): Promise<ImageGenerationResponse> {
    if (!this.apiKey) {
      return { success: false };
    }

    console.log('Attempting Nano Banana API for image generation...');

    try {
      // Nano Banana API endpoint (adjust based on actual API documentation)
      const response = await fetch('https://api.nanobanana.ai/v1/generate', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          prompt: this.enhancePrompt(prompt, style),
          width: 800,
          height: 600,
          num_outputs: 1,
          style: style
        })
      });

      if (!response.ok) {
        console.error('Nano Banana API error:', response.status, response.statusText);
        return { success: false };
      }

      const data: NanoBananaResponse = await response.json();
      
      // Handle different response formats
      const imageUrl = data.output?.[0] || data.image_url || data.url;
      
      if (imageUrl) {
        console.log('✅ Nano Banana API success!');
        return {
          success: true,
          image_url: imageUrl
        };
      }

      return { success: false };
    } catch (error) {
      console.error('Nano Banana API exception:', error);
      return { success: false };
    }
  }

  private enhancePrompt(prompt: string, style: 'professional' | 'creative' | 'minimal'): string {
    const styleModifiers: Record<'professional' | 'creative' | 'minimal', string> = {
      professional: 'professional, business, clean, modern, high quality',
      creative: 'creative, artistic, vibrant, dynamic, eye-catching',
      minimal: 'minimal, simple, clean lines, elegant, sophisticated'
    };

    return `${prompt}, ${styleModifiers[style]}, detailed, sharp focus, studio lighting`;
  }

  private async tryPicsum(prompt: string): Promise<ImageGenerationResponse> {
    // Use Lorem Picsum for random professional images
    const seed = this.hashCode(prompt);
    const imageUrl = `https://picsum.photos/seed/${seed}/800/600`;
    
    try {
      const response = await fetch(imageUrl, { method: 'HEAD' });
      if (response.ok) {
        return {
          success: true,
          image_url: imageUrl
        };
      }
    } catch (error) {
      console.log('Picsum failed');
    }
    
    return { success: false };
  }

  private async tryUnsplash(prompt: string): Promise<ImageGenerationResponse> {
    // Use Unsplash Source for keyword-based images
    const keywords = this.extractKeywords(prompt);
    const imageUrl = `https://source.unsplash.com/800x600/?${encodeURIComponent(keywords)}&sig=${Date.now()}`;
    
    try {
      // Unsplash doesn't support HEAD requests well, so we'll just use it
      return {
        success: true,
        image_url: imageUrl
      };
    } catch (error) {
      console.log('Unsplash failed');
    }
    
    return { success: false };
  }

  private async tryPlaceholder(prompt: string): Promise<ImageGenerationResponse> {
    return this.getPlaceholderImageResponse(prompt);
  }

  private getPlaceholderImageResponse(prompt: string): ImageGenerationResponse {
    const keywords = this.extractKeywords(prompt);
    const colors = [
      { bg: '4F46E5', text: 'FFFFFF' },  // Indigo
      { bg: '7C3AED', text: 'FFFFFF' },  // Purple
      { bg: '059669', text: 'FFFFFF' },  // Green
      { bg: 'DC2626', text: 'FFFFFF' },  // Red
      { bg: 'EA580C', text: 'FFFFFF' },  // Orange
      { bg: '0891B2', text: 'FFFFFF' },  // Cyan
      { bg: 'DB2777', text: 'FFFFFF' },  // Pink
    ];
    
    const hash = this.hashCode(prompt);
    const color = colors[Math.abs(hash) % colors.length];
    
    return {
      success: true,
      image_url: `https://placehold.co/800x600/${color.bg}/${color.text}?text=${encodeURIComponent(keywords)}`
    };
  }

  private extractKeywords(prompt: string): string {
    // Extract meaningful keywords from the prompt
    const stopWords = ['a', 'an', 'the', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by'];
    const words = prompt.toLowerCase()
      .replace(/[^a-zA-Z0-9\s]/g, '')
      .split(' ')
      .filter(word => word.length > 3 && !stopWords.includes(word))
      .slice(0, 3);
    
    return words.length > 0 ? words.join('+') : 'business';
  }

  private hashCode(str: string): number {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return hash;
  }

  isConfigured(): boolean {
    // Always return true since we have fallback options
    return true;
  }

  getServiceStatus(): { service: string; available: boolean; description: string }[] {
    return [
      {
        service: 'Nano Banana AI',
        available: !!this.apiKey,
        description: 'AI-powered image generation (primary)'
      },
      {
        service: 'Lorem Picsum',
        available: true,
        description: 'Random high-quality stock photos'
      },
      {
        service: 'Unsplash Source',
        available: true,
        description: 'Keyword-based stock photos'
      },
      {
        service: 'Placeholder',
        available: true,
        description: 'Text-based placeholder images'
      }
    ];
  }
}

export const imageService = new ImageGenerationService();
