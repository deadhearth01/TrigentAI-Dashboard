'use client';

import { useState, useEffect } from 'react';
import { newsDataService, type NewsArticle } from '@/lib/newsdata';
import { Input, Button, Card, CardHeader, CardBody, CardFooter, Chip, Select, SelectItem, Spinner, Image } from '@heroui/react';
import { Search, ExternalLink, Calendar, TrendingUp, Globe, Clock, Tag } from 'lucide-react';

const categories = [
  { value: '', label: 'All News' },
  { value: 'ai-trends', label: 'AI & Technology Trends', isCustom: true },
  { value: 'business', label: 'Business' },
  { value: 'technology', label: 'Technology' },
  { value: 'sports', label: 'Sports' },
  { value: 'entertainment', label: 'Entertainment' },
  { value: 'health', label: 'Health' },
  { value: 'science', label: 'Science' },
  { value: 'world', label: 'World' },
];

export function NewsFeedPage() {
  const [articles, setArticles] = useState<NewsArticle[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('business'); // Default to business
  const [nextPage, setNextPage] = useState<string | undefined>();
  const [hasMore, setHasMore] = useState(false);

  // Fetch initial news
  useEffect(() => {
    loadNews();
  }, [selectedCategory]);

  const loadNews = async (page?: string) => {
    try {
      setLoading(true);
      
      const params: any = {
        size: 10,
        language: 'en',
      };

      // Handle custom AI Trends category
      if (selectedCategory === 'ai-trends') {
        // Search for AI-related topics
        params.q = 'artificial intelligence OR AI OR machine learning OR ChatGPT OR OpenAI OR generative AI OR LLM';
        params.category = 'technology';
      } else if (selectedCategory) {
        params.category = selectedCategory;
      }

      if (page) {
        params.page = page;
      }

      const response = await newsDataService.getLatestNews(params);
      
      if (page) {
        setArticles(prev => [...prev, ...response.results]);
      } else {
        setArticles(response.results);
      }
      
      setNextPage(response.nextPage);
      setHasMore(!!response.nextPage);
    } catch (error) {
      console.error('Failed to load news:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      loadNews();
      return;
    }

    try {
      setLoading(true);
      
      const params: any = {
        size: 10,
        language: 'en',
        q: searchQuery,
      };

      // Handle custom AI Trends category with search
      if (selectedCategory === 'ai-trends') {
        params.category = 'technology';
      } else if (selectedCategory) {
        params.category = selectedCategory;
      }

      const response = await newsDataService.searchNews(searchQuery, params);
      
      setArticles(response.results);
      setNextPage(response.nextPage);
      setHasMore(!!response.nextPage);
    } catch (error) {
      console.error('Failed to search news:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadMore = () => {
    if (nextPage && !loading) {
      loadNews(nextPage);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffHours / 24);

    if (diffHours < 1) {
      const diffMins = Math.floor(diffMs / (1000 * 60));
      return `${diffMins} minute${diffMins !== 1 ? 's' : ''} ago`;
    } else if (diffHours < 24) {
      return `${diffHours} hour${diffHours !== 1 ? 's' : ''} ago`;
    } else if (diffDays < 7) {
      return `${diffDays} day${diffDays !== 1 ? 's' : ''} ago`;
    } else {
      return date.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric', 
        year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined 
      });
    }
  };

  return (
    <div className="w-full h-full overflow-y-auto p-3 sm:p-4 md:p-6 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      <div className="max-w-7xl mx-auto space-y-4 md:space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-2 sm:gap-3">
              <TrendingUp className="text-purple-600" size={28} />
              <span className="hidden sm:inline">News Feed</span>
              <span className="sm:hidden">News</span>
            </h1>
            <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mt-1">
              {selectedCategory === 'ai-trends' 
                ? '🤖 AI & Tech Trends'
                : 'Latest news worldwide'
              }
            </p>
          </div>
        </div>

        {/* Search & Filters */}
        <Card className="bg-white dark:bg-gray-800 shadow-lg">
          <CardBody>
            <div className="flex flex-col gap-3">
              {/* Search Input */}
              <Input
                placeholder="Search news..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                startContent={<Search size={18} className="text-gray-400" />}
                size="lg"
                classNames={{
                  input: "text-sm sm:text-base",
                  inputWrapper: "bg-gray-50 dark:bg-gray-700",
                }}
              />

              {/* Filters Row */}
              <div className="flex gap-2 sm:gap-3">
                {/* Category Filter */}
                <Select
                  placeholder="Category"
                  selectedKeys={selectedCategory ? [selectedCategory] : []}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="flex-1"
                  size="lg"
                  classNames={{
                    trigger: "bg-gray-50 dark:bg-gray-700",
                    value: "text-sm sm:text-base"
                  }}
                >
                  {categories.map((cat) => (
                    <SelectItem key={cat.value}>
                      {cat.label}
                    </SelectItem>
                  ))}
                </Select>

                {/* Search Button */}
                <Button
                  color="primary"
                  size="lg"
                  onPress={handleSearch}
                  className="bg-gradient-to-r from-purple-600 to-blue-600 min-w-[100px] sm:min-w-[120px]"
                  startContent={<Search size={18} />}
                >
                  <span className="hidden sm:inline">Search</span>
                  <span className="sm:hidden">Go</span>
                </Button>
              </div>
            </div>
          </CardBody>
        </Card>

        {/* News Articles Grid */}
        {loading && articles.length === 0 ? (
          <div className="flex justify-center items-center py-20">
            <Spinner size="lg" color="primary" />
          </div>
        ) : articles.length === 0 ? (
          <Card className="bg-white dark:bg-gray-800">
            <CardBody className="text-center py-12">
              <Globe size={48} className="mx-auto text-gray-400 mb-4" />
              <p className="text-gray-600 dark:text-gray-400 text-lg">
                No news articles found. Try a different search or category.
              </p>
            </CardBody>
          </Card>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 md:gap-6">
              {articles.map((article) => (
                <Card
                  key={article.article_id}
                  className="bg-white dark:bg-gray-800 hover:shadow-xl transition-all duration-300 border border-gray-200 dark:border-gray-700"
                >
                  {/* Article Image */}
                  {article.image_url && (
                    <div 
                      className="relative h-40 sm:h-48 overflow-hidden cursor-pointer"
                      onClick={() => window.open(article.link, '_blank')}
                    >
                      <Image
                        src={article.image_url}
                        alt={article.title}
                        className="w-full h-full object-cover"
                        removeWrapper
                      />
                      {/* Category Badge */}
                      {article.category && article.category.length > 0 && (
                        <Chip
                          size="sm"
                          className="absolute top-2 sm:top-3 right-2 sm:right-3 bg-purple-600/90 text-white font-semibold backdrop-blur-sm text-[10px] sm:text-xs"
                          startContent={<Tag size={12} className="sm:w-3.5 sm:h-3.5" />}
                        >
                          {article.category[0]}
                        </Chip>
                      )}
                    </div>
                  )}

                  <CardHeader className="flex-col items-start gap-2 sm:gap-3 px-3 sm:px-4 pt-3 sm:pt-4 pb-2">
                    {/* Source and Date Row */}
                    <div className="flex items-center justify-between w-full">
                      <div className="flex items-center gap-1.5 sm:gap-2">
                        {article.source_icon ? (
                          <Image
                            src={article.source_icon}
                            alt={article.source_name || article.source_id}
                            className="w-4 h-4 sm:w-5 sm:h-5 rounded-full"
                          />
                        ) : (
                          <Globe size={14} className="sm:w-4 sm:h-4 text-purple-600" />
                        )}
                        <span className="text-[10px] sm:text-xs text-purple-600 dark:text-purple-400 font-semibold truncate max-w-[100px] sm:max-w-[150px]">
                          {article.source_name || article.source_id}
                        </span>
                      </div>
                      <Chip 
                        size="sm" 
                        variant="flat" 
                        className="text-[10px] sm:text-xs"
                        startContent={<Clock size={10} className="sm:w-3 sm:h-3" />}
                      >
                        {formatDate(article.pubDate)}
                      </Chip>
                    </div>

                    {/* Title */}
                    <h3 
                      className="text-sm sm:text-base md:text-lg font-bold text-gray-900 dark:text-white line-clamp-2 leading-tight cursor-pointer hover:text-purple-600 transition-colors"
                      onClick={() => window.open(article.link, '_blank')}
                    >
                      {article.title}
                    </h3>
                  </CardHeader>

                  <CardBody className="px-3 sm:px-4 py-2 sm:py-3 space-y-2 sm:space-y-3">
                    {/* Description */}
                    <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 line-clamp-2 sm:line-clamp-3 leading-relaxed">
                      {article.description || 'No description available'}
                    </p>

                    {/* Meta Information Tags */}
                    <div className="flex flex-wrap gap-1 sm:gap-2">
                      {/* Language Tag */}
                      {article.language && (
                        <Chip size="sm" variant="bordered" className="text-[10px] sm:text-xs">
                          {article.language.toUpperCase()}
                        </Chip>
                      )}
                      
                      {/* Country Tag */}
                      {article.country && article.country.length > 0 && (
                        <Chip size="sm" variant="bordered" className="text-[10px] sm:text-xs">
                          {article.country[0].toUpperCase()}
                        </Chip>
                      )}

                      {/* Creator/Author Tag */}
                      {article.creator && article.creator.length > 0 && (
                        <Chip size="sm" variant="flat" color="secondary" className="text-[10px] sm:text-xs">
                          By {article.creator[0]}
                        </Chip>
                      )}
                    </div>

                    {/* Keywords/Tags */}
                    {article.keywords && article.keywords.length > 0 && (
                      <div className="flex flex-wrap gap-1 sm:gap-1.5">
                        {article.keywords.slice(0, 3).map((keyword, idx) => (
                          <Chip 
                            key={idx} 
                            size="sm" 
                            variant="dot" 
                            className="text-[10px] sm:text-xs"
                            color="primary"
                          >
                            {keyword}
                          </Chip>
                        ))}
                      </div>
                    )}
                  </CardBody>

                  <CardFooter className="px-3 sm:px-4 pb-3 sm:pb-4 pt-2">
                    <Button
                      size="sm"
                      variant="flat"
                      color="primary"
                      endContent={<ExternalLink size={14} className="sm:w-4 sm:h-4" />}
                      className="w-full font-medium text-xs sm:text-sm"
                      onPress={() => window.open(article.link, '_blank')}
                    >
                      Read Full Article
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>

            {/* Load More Button */}
            {hasMore && (
              <div className="flex justify-center pt-2 sm:pt-4">
                <Button
                  size="lg"
                  variant="bordered"
                  onPress={loadMore}
                  isLoading={loading}
                  className="min-w-[160px] sm:min-w-[200px] text-sm sm:text-base"
                >
                  {loading ? 'Loading...' : 'Load More News'}
                </Button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
