'use client';

import { useState, useEffect } from 'react';
import { Card, CardBody, Button, Input, Chip, Tabs, Tab, Spinner, Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, useDisclosure } from '@heroui/react';
import { Newspaper, Search, Bookmark, ExternalLink, Clock, TrendingUp, Filter, RefreshCw, Globe, Building2 } from 'lucide-react';
import { useAuthStore } from '@/lib/store';
import { generateId } from '@/lib/utils';

interface NewsArticle {
  id: string;
  title: string;
  description: string;
  url: string;
  source: string;
  publishedAt: string;
  image?: string;
  category: string;
  isBookmarked?: boolean;
  competitor?: string;
}

const categories = [
  { value: 'all', label: 'All News' },
  { value: 'business', label: 'Business' },
  { value: 'technology', label: 'Technology' },
  { value: 'competitors', label: 'Competitors' },
  { value: 'industry', label: 'Industry' },
  { value: 'market', label: 'Market Trends' }
];

export function NewsFeed() {
  const [articles, setArticles] = useState<NewsArticle[]>([]);
  const [filteredArticles, setFilteredArticles] = useState<NewsArticle[]>([]);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [bookmarkedOnly, setBookmarkedOnly] = useState(false);
  const [competitors, setCompetitors] = useState<string[]>([]);
  const [selectedCompetitor, setSelectedCompetitor] = useState<string>('all');
  const { user } = useAuthStore();
  const { isOpen, onOpen, onOpenChange } = useDisclosure();

  useEffect(() => {
    loadNews();
    loadCompetitors();
  }, [user]);

  useEffect(() => {
    filterArticles();
  }, [articles, selectedCategory, searchQuery, bookmarkedOnly, selectedCompetitor]);

  const loadCompetitors = () => {
    if (user) {
      const saved = localStorage.getItem(`competitors_${user.id}`);
      if (saved) {
        const competitorsList = JSON.parse(saved);
        setCompetitors(competitorsList.map((c: any) => c.name));
      }
    }
  };

  const loadNews = async () => {
    if (user) {
      const saved = localStorage.getItem(`news_${user.id}`);
      if (saved) {
        setArticles(JSON.parse(saved));
      } else {
        // Generate sample news articles
        const sampleNews: NewsArticle[] = [
          {
            id: generateId(),
            title: 'Tech Industry Shows Strong Growth in Q4',
            description: 'Major tech companies report record earnings as digital transformation accelerates across industries.',
            url: 'https://example.com/news/1',
            source: 'TechNews Daily',
            publishedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
            category: 'technology',
            image: 'https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=400'
          },
          {
            id: generateId(),
            title: 'Market Analysis: Competitive Landscape Shifts',
            description: 'New players entering the market are disrupting traditional business models and forcing established companies to innovate.',
            url: 'https://example.com/news/2',
            source: 'Business Insider',
            publishedAt: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
            category: 'market',
            image: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=400'
          },
          {
            id: generateId(),
            title: 'Industry Leaders Announce Strategic Partnership',
            description: 'Two major players in the industry have announced a strategic partnership to expand their market reach and improve customer offerings.',
            url: 'https://example.com/news/3',
            source: 'Industry Week',
            publishedAt: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString(),
            category: 'industry',
            image: 'https://images.unsplash.com/photo-1559136555-9303baea8ebd?w=400'
          },
          {
            id: generateId(),
            title: 'Competitor XYZ Launches New Product Line',
            description: 'Leading competitor announces innovative product line targeting mid-market segment with competitive pricing.',
            url: 'https://example.com/news/4',
            source: 'Market Watch',
            publishedAt: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
            category: 'competitors',
            competitor: 'XYZ Corp',
            image: 'https://images.unsplash.com/photo-1553877522-43269d4ea984?w=400'
          },
          {
            id: generateId(),
            title: 'Business Strategies for 2025: Expert Insights',
            description: 'Industry experts share their predictions and strategies for successful business growth in the coming year.',
            url: 'https://example.com/news/5',
            source: 'Forbes',
            publishedAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
            category: 'business',
            image: 'https://images.unsplash.com/photo-1556761175-b413da4baf72?w=400'
          },
          {
            id: generateId(),
            title: 'Technology Trends Reshaping the Industry',
            description: 'AI and automation continue to transform how businesses operate, creating new opportunities and challenges.',
            url: 'https://example.com/news/6',
            source: 'TechCrunch',
            publishedAt: new Date(Date.now() - 36 * 60 * 60 * 1000).toISOString(),
            category: 'technology',
            image: 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=400'
          }
        ];
        setArticles(sampleNews);
        saveNews(sampleNews);
      }
    }
  };

  const saveNews = (news: NewsArticle[]) => {
    if (user) {
      localStorage.setItem(`news_${user.id}`, JSON.stringify(news));
      setArticles(news);
    }
  };

  const filterArticles = () => {
    let filtered = articles;

    // Filter by category
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(a => a.category === selectedCategory);
    }

    // Filter by competitor
    if (selectedCompetitor !== 'all') {
      filtered = filtered.filter(a => a.competitor === selectedCompetitor);
    }

    // Filter by search query
    if (searchQuery) {
      filtered = filtered.filter(a =>
        a.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        a.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        a.source.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Filter bookmarked
    if (bookmarkedOnly) {
      filtered = filtered.filter(a => a.isBookmarked);
    }

    setFilteredArticles(filtered);
  };

  const toggleBookmark = (id: string) => {
    const updated = articles.map(a =>
      a.id === id ? { ...a, isBookmarked: !a.isBookmarked } : a
    );
    saveNews(updated);
  };

  const refreshNews = async () => {
    setIsLoading(true);
    // In a real implementation, this would fetch from News API
    // For now, we'll simulate with a delay
    await new Promise(resolve => setTimeout(resolve, 1500));
    await loadNews();
    setIsLoading(false);
  };

  const getTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (seconds < 60) return 'Just now';
    if (seconds < 3600) return `${Math.floor(seconds / 60)} minutes ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)} hours ago`;
    if (seconds < 604800) return `${Math.floor(seconds / 86400)} days ago`;
    return date.toLocaleDateString();
  };

  const getCategoryColor = (category: string): "default" | "primary" | "secondary" | "success" | "warning" | "danger" => {
    const colors: { [key: string]: "default" | "primary" | "secondary" | "success" | "warning" | "danger" } = {
      business: 'primary',
      technology: 'secondary',
      competitors: 'danger',
      industry: 'success',
      market: 'warning'
    };
    return colors[category] || 'default';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center space-x-3 mb-2">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-r from-blue-500 to-indigo-600 flex items-center justify-center">
              <Newspaper className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">News Feed</h1>
          </div>
          <p className="text-gray-600 dark:text-gray-400">
            Stay updated with industry news and competitor insights
          </p>
        </div>
        <div className="flex space-x-2">
          <Button
            color="primary"
            variant={bookmarkedOnly ? 'solid' : 'light'}
            startContent={<Bookmark className="w-4 h-4" />}
            onClick={() => setBookmarkedOnly(!bookmarkedOnly)}
          >
            Bookmarked
          </Button>
          <Button
            color="primary"
            variant="light"
            isIconOnly
            onClick={refreshNews}
            isLoading={isLoading}
          >
            <RefreshCw className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20">
          <CardBody className="p-4">
            <div className="flex items-center space-x-3">
              <Newspaper className="w-8 h-8 text-blue-600 dark:text-blue-400" />
              <div>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{articles.length}</p>
                <p className="text-xs text-gray-600 dark:text-gray-400">Total Articles</p>
              </div>
            </div>
          </CardBody>
        </Card>

        <Card className="bg-gradient-to-r from-purple-50 to-violet-50 dark:from-purple-900/20 dark:to-violet-900/20">
          <CardBody className="p-4">
            <div className="flex items-center space-x-3">
              <Bookmark className="w-8 h-8 text-purple-600 dark:text-purple-400" />
              <div>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {articles.filter(a => a.isBookmarked).length}
                </p>
                <p className="text-xs text-gray-600 dark:text-gray-400">Bookmarked</p>
              </div>
            </div>
          </CardBody>
        </Card>

        <Card className="bg-gradient-to-r from-red-50 to-rose-50 dark:from-red-900/20 dark:to-rose-900/20">
          <CardBody className="p-4">
            <div className="flex items-center space-x-3">
              <Building2 className="w-8 h-8 text-red-600 dark:text-red-400" />
              <div>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {articles.filter(a => a.category === 'competitors').length}
                </p>
                <p className="text-xs text-gray-600 dark:text-gray-400">Competitor News</p>
              </div>
            </div>
          </CardBody>
        </Card>

        <Card className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20">
          <CardBody className="p-4">
            <div className="flex items-center space-x-3">
              <TrendingUp className="w-8 h-8 text-green-600 dark:text-green-400" />
              <div>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {articles.filter(a => a.category === 'market').length}
                </p>
                <p className="text-xs text-gray-600 dark:text-gray-400">Market Trends</p>
              </div>
            </div>
          </CardBody>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardBody>
          <div className="space-y-4">
            <Input
              placeholder="Search articles..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              startContent={<Search className="w-4 h-4 text-gray-400" />}
            />

            <div className="flex flex-wrap gap-2">
              {categories.map(cat => (
                <Button
                  key={cat.value}
                  size="sm"
                  variant={selectedCategory === cat.value ? 'solid' : 'light'}
                  color={selectedCategory === cat.value ? 'primary' : 'default'}
                  onClick={() => setSelectedCategory(cat.value)}
                >
                  {cat.label}
                </Button>
              ))}
            </div>

            {competitors.length > 0 && (
              <div className="flex flex-wrap gap-2">
                <Button
                  size="sm"
                  variant={selectedCompetitor === 'all' ? 'solid' : 'light'}
                  color={selectedCompetitor === 'all' ? 'secondary' : 'default'}
                  onClick={() => setSelectedCompetitor('all')}
                >
                  All Competitors
                </Button>
                {competitors.map(comp => (
                  <Button
                    key={comp}
                    size="sm"
                    variant={selectedCompetitor === comp ? 'solid' : 'light'}
                    color={selectedCompetitor === comp ? 'secondary' : 'default'}
                    onClick={() => setSelectedCompetitor(comp)}
                  >
                    {comp}
                  </Button>
                ))}
              </div>
            )}
          </div>
        </CardBody>
      </Card>

      {/* Articles */}
      {isLoading ? (
        <Card>
          <CardBody className="flex items-center justify-center py-12">
            <Spinner size="lg" />
            <p className="mt-4 text-gray-600 dark:text-gray-400">Loading latest news...</p>
          </CardBody>
        </Card>
      ) : filteredArticles.length === 0 ? (
        <Card>
          <CardBody className="text-center py-12">
            <Newspaper className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              No Articles Found
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              Try adjusting your filters or search query
            </p>
          </CardBody>
        </Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredArticles.map(article => (
            <Card key={article.id} className="hover:shadow-lg transition-shadow">
              <CardBody className="p-0">
                {article.image && (
                  <div className="relative w-full h-48 bg-gray-200 dark:bg-gray-700">
                    <img
                      src={article.image}
                      alt={article.title}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.currentTarget.src = 'https://via.placeholder.com/400x200?text=News';
                      }}
                    />
                    <Button
                      isIconOnly
                      size="sm"
                      variant="flat"
                      className="absolute top-2 right-2 bg-white/90 dark:bg-gray-800/90"
                      onClick={() => toggleBookmark(article.id)}
                    >
                      <Bookmark
                        className={`w-4 h-4 ${
                          article.isBookmarked
                            ? 'fill-yellow-500 text-yellow-500'
                            : 'text-gray-600'
                        }`}
                      />
                    </Button>
                  </div>
                )}
                
                <div className="p-6">
                  <div className="flex items-center justify-between mb-3">
                    <Chip size="sm" color={getCategoryColor(article.category)} variant="flat">
                      {article.category}
                    </Chip>
                    <div className="flex items-center text-xs text-gray-500 dark:text-gray-400">
                      <Clock className="w-3 h-3 mr-1" />
                      {getTimeAgo(article.publishedAt)}
                    </div>
                  </div>

                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                    {article.title}
                  </h3>
                  
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 line-clamp-2">
                    {article.description}
                  </p>

                  <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-700">
                    <div className="flex items-center space-x-2">
                      <Globe className="w-4 h-4 text-gray-400" />
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        {article.source}
                      </span>
                    </div>
                    <Button
                      size="sm"
                      variant="light"
                      color="primary"
                      endContent={<ExternalLink className="w-4 h-4" />}
                      as="a"
                      href={article.url}
                      target="_blank"
                    >
                      Read More
                    </Button>
                  </div>

                  {article.competitor && (
                    <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
                      <div className="flex items-center text-sm">
                        <Building2 className="w-4 h-4 text-gray-400 mr-2" />
                        <span className="text-gray-600 dark:text-gray-400">
                          Related to: <strong>{article.competitor}</strong>
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              </CardBody>
            </Card>
          ))}
        </div>
      )}

      {/* Info Card */}
      <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border-2 border-blue-200 dark:border-blue-700">
        <CardBody>
          <div className="flex items-start space-x-3">
            <Globe className="w-6 h-6 text-blue-600 dark:text-blue-400 mt-1" />
            <div>
              <h4 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">
                Connect News API for Real-time Updates
              </h4>
              <p className="text-sm text-blue-700 dark:text-blue-300 mb-3">
                Get access to thousands of news sources and articles by connecting a News API key.
                Track competitors, industry trends, and market movements in real-time.
              </p>
              <div className="space-y-2 text-sm text-blue-700 dark:text-blue-300">
                <p>📰 <strong>50,000+</strong> news sources worldwide</p>
                <p>🔍 <strong>Real-time</strong> competitor monitoring</p>
                <p>📊 <strong>Custom</strong> alerts and notifications</p>
                <p>🌍 <strong>Multi-language</strong> support</p>
              </div>
              <Button
                size="sm"
                color="primary"
                className="mt-4"
                as="a"
                href="https://newsapi.org/"
                target="_blank"
              >
                Get News API Key
              </Button>
            </div>
          </div>
        </CardBody>
      </Card>
    </div>
  );
}
