// NewsData.io API Service
// Documentation: https://newsdata.io/documentation

export interface NewsArticle {
  article_id: string;
  title: string;
  link: string;
  keywords?: string[];
  creator?: string[];
  video_url?: string | null;
  description?: string;
  content?: string;
  pubDate: string;
  pubDateTZ?: string;
  image_url?: string;
  source_id: string;
  source_priority: number;
  source_name?: string;
  source_url?: string;
  source_icon?: string;
  language: string;
  country: string[];
  category: string[];
  ai_tag?: string;
  sentiment?: string;
  sentiment_stats?: string;
  ai_region?: string;
  ai_org?: string;
  duplicate?: boolean;
}

export interface NewsResponse {
  status: string;
  totalResults: number;
  results: NewsArticle[];
  nextPage?: string;
}

export interface NewsSearchParams {
  q?: string;
  qInTitle?: string;
  qInMeta?: string;
  timeframe?: string;
  from_date?: string;
  to_date?: string;
  country?: string;
  language?: string;
  category?: string;
  domain?: string;
  domainurl?: string;
  excludedomain?: string;
  prioritydomain?: 'top' | 'medium' | 'low';
  timezone?: string;
  full_content?: 0 | 1;
  image?: 0 | 1;
  video?: 0 | 1;
  removeduplicate?: 0 | 1;
  size?: number;
  page?: string;
}

export class NewsDataService {
  private apiKey: string;
  private baseUrl = 'https://newsdata.io/api/1';

  constructor() {
    this.apiKey = process.env.NEXT_PUBLIC_NEWSDATA_API_KEY || '';
    if (!this.apiKey) {
      console.warn('⚠️ NewsData API key not found');
    }
  }

  /**
   * Fetch latest news with optional filters
   */
  async getLatestNews(params: NewsSearchParams = {}): Promise<NewsResponse> {
    try {
      const queryParams = new URLSearchParams({
        apikey: this.apiKey,
        language: 'en',
        ...this.buildQueryParams(params),
      });

      const response = await fetch(`${this.baseUrl}/latest?${queryParams}`);
      
      if (!response.ok) {
        throw new Error(`NewsData API error: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('❌ Failed to fetch latest news:', error);
      throw error;
    }
  }

  /**
   * Search news by keyword
   */
  async searchNews(query: string, params: NewsSearchParams = {}): Promise<NewsResponse> {
    return this.getLatestNews({
      q: query,
      ...params,
    });
  }

  /**
   * Get market/financial news
   */
  async getMarketNews(params: { symbol?: string; organization?: string; sentiment?: string } = {}): Promise<NewsResponse> {
    try {
      const queryParams = new URLSearchParams({
        apikey: this.apiKey,
        language: 'en',
      });

      if (params.symbol) queryParams.append('symbol', params.symbol);
      if (params.organization) queryParams.append('organization', params.organization);
      if (params.sentiment) queryParams.append('sentiment', params.sentiment);

      const response = await fetch(`${this.baseUrl}/market?${queryParams}`);
      
      if (!response.ok) {
        throw new Error(`NewsData API error: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('❌ Failed to fetch market news:', error);
      throw error;
    }
  }

  /**
   * Get news by category
   */
  async getNewsByCategory(category: string, params: NewsSearchParams = {}): Promise<NewsResponse> {
    return this.getLatestNews({
      category,
      ...params,
    });
  }

  /**
   * Get news sources
   */
  async getSources(params: { country?: string; category?: string; language?: string } = {}): Promise<any> {
    try {
      const queryParams = new URLSearchParams({
        apikey: this.apiKey,
      });

      if (params.country) queryParams.append('country', params.country);
      if (params.category) queryParams.append('category', params.category);
      if (params.language) queryParams.append('language', params.language);

      const response = await fetch(`${this.baseUrl}/sources?${queryParams}`);
      
      if (!response.ok) {
        throw new Error(`NewsData API error: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('❌ Failed to fetch news sources:', error);
      throw error;
    }
  }

  private buildQueryParams(params: NewsSearchParams): Record<string, string> {
    const query: Record<string, string> = {};

    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        query[key] = String(value);
      }
    });

    return query;
  }
}

// Singleton instance
export const newsDataService = new NewsDataService();
