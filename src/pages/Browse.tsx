import { useState, useEffect, useMemo, useRef } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Search, Filter, Grid3X3, List, Star, ArrowRight, X, Loader2, Sparkles, CheckCircle2, AlertCircle, ExternalLink, Database, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { mockTools, categoryLabels, sourceLabels } from '@/data/mockData';
import { useToolSearch } from '@/hooks/useToolSearch';
import { useGitHubStars } from '@/hooks/useGitHubStars';
import { ResearchReport } from '@/components/ResearchReport';
import { SearchResultsDialog } from '@/components/SearchResultsDialog';
import type { AITool, ToolCategory, SortOption } from '@/types';

const Browse = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || '');
  const [selectedCategory, setSelectedCategory] = useState<ToolCategory>('all');
  const [sortOption, setSortOption] = useState<SortOption>('newest');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  
  // 使用新的搜索 hook
  const { 
    search, 
    clear, 
    results: searchResults, 
    localResults,
    kimiResults,
    isSearching, 
    isSaving,
    error,
    hasSearched,
    discoveredCount,
    discoveredToolsList,
    showResultsDialog,
    closeResultsDialog,
    saveSelectedTools
  } = useToolSearch();

  // 当 URL 参数变化时触发搜索
  useEffect(() => {
    const search = searchParams.get('search');
    if (search) {
      setSearchQuery(search);
    } else {
      setSearchQuery('');
      clear();
    }
  }, [searchParams, clear]);

  // 手动触发搜索
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setSearchParams({ search: searchQuery });
      search(searchQuery);
    } else {
      setSearchParams({});
      clear();
    }
  };

  const clearFilters = () => {
    setSearchQuery('');
    setSelectedCategory('all');
    setSortOption('newest');
    setSearchParams({});
    clear();
  };

  // Filter and sort tools
  const filteredTools = useMemo(() => {
    // 合并基础工具 + 发现库工具 + 搜索结果
    let result: AITool[] = [...mockTools];
    
    // 1. 先合并发现库的工具（排除已在基础库中的）
    if (discoveredToolsList.length > 0) {
      const existingSlugs = new Set(mockTools.map(t => t.slug));
      const existingWebsites = new Set(mockTools.map(t => t.website));
      
      const uniqueDiscovered = discoveredToolsList.filter((t: any) => 
        !existingSlugs.has(t.slug) && 
        !existingWebsites.has(t.website)
      );
      result = [...uniqueDiscovered, ...result];
    }
    
    // 2. 如果有搜索结果，合并（去重）
    if (searchResults.length > 0) {
      const existingSlugs = new Set(result.map(t => t.slug));
      const existingWebsites = new Set(result.map(t => t.website));
      
      const uniqueResults = searchResults.filter(r => 
        !existingSlugs.has(r.slug) && 
        !existingWebsites.has(r.website)
      );
      result = [...uniqueResults, ...result];
    }

    // Filter by search query (本地过滤)
    if (searchQuery && !hasSearched) {
      const query = searchQuery.toLowerCase();
      const queryWords = query.split(/\s+/).filter(w => w.length > 0);
      
      result = result.filter((tool) => {
        const textToSearch = (
          tool.name + ' ' + 
          tool.chineseName + ' ' + 
          tool.tagline + ' ' + 
          tool.description + ' ' +
          tool.category
        ).toLowerCase();
        
        return queryWords.some(word => textToSearch.includes(word));
      });
    }

    // Filter by category
    if (selectedCategory !== 'all') {
      result = result.filter((tool) => tool.category === selectedCategory);
    }

    // Sort
    switch (sortOption) {
      case 'newest':
        result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        break;
      case 'popular':
        result.sort((a, b) => b.viewCount - a.viewCount);
        break;
      case 'rating':
        result.sort((a, b) => b.rating - a.rating);
        break;
    }

    return result;
  }, [searchQuery, selectedCategory, sortOption, searchResults, hasSearched, discoveredToolsList]);

  const categories: ToolCategory[] = ['all', 'resume', 'interview', 'career', 'skill', 'matching'];
  const sortOptions: { value: SortOption; label: string }[] = [
    { value: 'newest', label: '最新发布' },
    { value: 'popular', label: '最多浏览' },
    { value: 'rating', label: '评分最高' },
  ];

  return (
    <div className="min-h-screen bg-gray-50 pt-20">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">浏览工具</h1>
              <p className="text-gray-600 flex items-center gap-2 flex-wrap">
                <Database className="w-4 h-4" />
                <span>基础库 {mockTools.length} 个 + 发现库 {discoveredCount} 个</span>
                {discoveredCount > 0 && (
                  <Badge className="bg-green-100 text-green-700 text-xs">
                    自增长!
                  </Badge>
                )}
                <span className="text-gray-400 text-xs ml-2">（每次搜索都会扩大工具库）</span>
              </p>
            </div>

            {/* Search Box */}
            <form onSubmit={handleSearch} className="w-full md:w-auto">
              <div className="flex gap-2">
                <div className="relative flex-1 md:w-80">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <Input
                    type="text"
                    placeholder="搜索AI工具（支持Kimi智能搜索）..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 h-11"
                    disabled={isSearching}
                  />
                  {searchQuery && !isSearching && (
                    <button
                      type="button"
                      onClick={() => {
                        setSearchQuery('');
                        setSearchParams({});
                      }}
                      className="absolute right-3 top-1/2 -translate-y-1/2"
                    >
                      <X className="w-4 h-4 text-gray-400 hover:text-gray-600" />
                    </button>
                  )}
                  {isSearching && (
                    <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#7e43ff] animate-spin" />
                  )}
                </div>
                <Button 
                  type="submit" 
                  className="h-11 bg-[#7e43ff] hover:bg-[#6527ec]"
                  disabled={isSearching}
                >
                  {isSearching ? '搜索中...' : '搜索'}
                </Button>
              </div>
            </form>
          </div>
          
          {/* 搜索状态提示 */}
          {hasSearched && (
            <div className="mt-4 flex flex-wrap items-center gap-2 text-sm">
              <Sparkles className="w-4 h-4 text-[#7e43ff]" />
              {isSearching ? (
                <>
                  <span className="text-gray-600">Kimi AI 搜索中...</span>
                  <span className="text-gray-400">|</span>
                  <span className="text-gray-600">本地库查询中...</span>
                </>
              ) : isSaving ? (
                <span className="text-green-600">正在保存新发现的工具到知识库...</span>
              ) : error ? (
                <span className="text-orange-600">
                  Kimi 搜索遇到问题：{error}，已显示本地匹配结果
                </span>
              ) : (
                <>
                  {kimiResults.length > 0 && (
                    <span className="text-blue-600 font-medium">
                      🔥 Kimi 新发现 {kimiResults.length} 个（已保存）
                    </span>
                  )}
                  {kimiResults.length > 0 && localResults.length > 0 && (
                    <span className="text-gray-400">+</span>
                  )}
                  {localResults.length > 0 && (
                    <span className="text-green-600">
                      📚 本地库 {localResults.length} 个
                    </span>
                  )}
                  {discoveredCount > 0 && (
                    <>
                      <span className="text-gray-400">|</span>
                      <span className="text-gray-500">
                        累计发现库共 {discoveredCount} 个工具
                      </span>
                    </>
                  )}
                </>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Filters & Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar Filters - Desktop */}
          <aside className="hidden lg:block w-64 flex-shrink-0">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 sticky top-24">
              <div className="flex items-center justify-between mb-6">
                <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                  <Filter className="w-4 h-4" />
                  筛选
                </h3>
                {(selectedCategory !== 'all' || searchQuery) && (
                  <button
                    onClick={clearFilters}
                    className="text-sm text-[#7e43ff] hover:text-[#6527ec]"
                  >
                    清除
                  </button>
                )}
              </div>

              {/* Category Filter */}
              <div className="mb-6">
                <h4 className="text-sm font-medium text-gray-700 mb-3">功能分类</h4>
                <div className="space-y-2">
                  {categories.map((category) => (
                    <button
                      key={category}
                      onClick={() => setSelectedCategory(category)}
                      className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                        selectedCategory === category
                          ? 'bg-[#7e43ff] text-white'
                          : 'text-gray-600 hover:bg-gray-100'
                      }`}
                    >
                      {categoryLabels[category]}
                    </button>
                  ))}
                </div>
              </div>

              {/* Sort Options */}
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-3">排序方式</h4>
                <div className="space-y-2">
                  {sortOptions.map((option) => (
                    <button
                      key={option.value}
                      onClick={() => setSortOption(option.value)}
                      className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                        sortOption === option.value
                          ? 'bg-[#7e43ff] text-white'
                          : 'text-gray-600 hover:bg-gray-100'
                      }`}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </aside>

          {/* Mobile Filter Toggle */}
          <div className="lg:hidden">
            <Button
              variant="outline"
              onClick={() => setIsFilterOpen(!isFilterOpen)}
              className="w-full mb-4"
            >
              <Filter className="w-4 h-4 mr-2" />
              筛选与排序
            </Button>

            {isFilterOpen && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-4">
                <div className="mb-4">
                  <h4 className="text-sm font-medium text-gray-700 mb-2">功能分类</h4>
                  <div className="flex flex-wrap gap-2">
                    {categories.map((category) => (
                      <button
                        key={category}
                        onClick={() => setSelectedCategory(category)}
                        className={`px-3 py-1.5 rounded-full text-sm transition-colors ${
                          selectedCategory === category
                            ? 'bg-[#7e43ff] text-white'
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }`}
                      >
                        {categoryLabels[category]}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-2">排序方式</h4>
                  <div className="flex flex-wrap gap-2">
                    {sortOptions.map((option) => (
                      <button
                        key={option.value}
                        onClick={() => setSortOption(option.value)}
                        className={`px-3 py-1.5 rounded-full text-sm transition-colors ${
                          sortOption === option.value
                            ? 'bg-[#7e43ff] text-white'
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }`}
                      >
                        {option.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Main Content */}
          <div className="flex-1">
            {/* Toolbar */}
            <div className="flex items-center justify-between mb-6">
              <p className="text-gray-600">
                共 <span className="font-semibold text-gray-900">{filteredTools.length}</span> 款工具
              </p>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 rounded-lg transition-colors ${
                    viewMode === 'grid'
                      ? 'bg-[#7e43ff] text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  <Grid3X3 className="w-5 h-5" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 rounded-lg transition-colors ${
                    viewMode === 'list'
                      ? 'bg-[#7e43ff] text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  <List className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Tools Grid/List */}
            {filteredTools.length > 0 ? (
              <div
                className={
                  viewMode === 'grid'
                    ? 'grid md:grid-cols-2 xl:grid-cols-3 gap-6'
                    : 'space-y-4'
                }
              >
                {filteredTools.map((tool) => (
                  viewMode === 'grid' ? (
                    <ToolGridCard key={tool.id} tool={tool} />
                  ) : (
                    <ToolListCard key={tool.id} tool={tool} />
                  )
                ))}
              </div>
            ) : (
              <div className="text-center py-16">
                <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Search className="w-10 h-10 text-gray-400" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  没有找到匹配的工具
                </h3>
                <p className="text-gray-600 mb-2">当前搜索词："{searchQuery}"</p>
                <p className="text-gray-500 text-sm mb-4">
                  可以尝试以下关键词：简历、面试、求职、职业、技能、Jobscan、牛客网、LeetCode
                </p>
                <div className="flex gap-2 justify-center">
                  <Button onClick={clearFilters} variant="outline">
                    清除筛选
                  </Button>
                  <Button onClick={() => {
                    setSearchQuery('面试');
                    setSearchParams({ search: '面试' });
                    search('面试');
                  }} className="bg-[#7e43ff] hover:bg-[#6527ec]">
                    试试"面试"
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 搜索结果确认弹窗 */}
      <SearchResultsDialog
        isOpen={showResultsDialog}
        onClose={closeResultsDialog}
        tools={kimiResults}
        onSave={saveSelectedTools}
        isSaving={isSaving}
      />
    </div>
  );
};

// 链接验证状态组件
const LinkStatusBadge = ({ status }: { status?: { valid: boolean; status: number | null; checked: boolean } }) => {
  if (!status || !status.checked) {
    return (
      <Badge variant="outline" className="text-xs text-gray-400">
        <Loader2 className="w-3 h-3 mr-1 animate-spin" />
        验证中
      </Badge>
    );
  }
  
  if (status.valid) {
    return (
      <Badge className="bg-green-100 text-green-700 text-xs border-0">
        <CheckCircle2 className="w-3 h-3 mr-1" />
        已验证
      </Badge>
    );
  }
  
  return (
    <Badge variant="outline" className="text-xs text-orange-500 border-orange-200">
      <AlertCircle className="w-3 h-3 mr-1" />
      链接待确认
    </Badge>
  );
};

// 来源标签组件
const SourceBadge = ({ source }: { source?: string }) => {
  const sourceInfo = source && sourceLabels[source] 
    ? sourceLabels[source] 
    : { label: source || '其他', color: 'bg-gray-100 text-gray-600', icon: '📦' };
  
  return (
    <Badge className={`${sourceInfo.color} text-xs border-0 flex items-center gap-1`}>
      <span>{sourceInfo.icon}</span>
      <span>{sourceInfo.label}</span>
    </Badge>
  );
};

// 判断工具来源类型
const getToolSourceType = (tool: AITool): string => {
  if (tool.id.startsWith('kimi-') || tool.id.startsWith('discovered-')) {
    return 'kimi';
  }
  if (tool.source) {
    return tool.source;
  }
  return 'manual';
};

// 格式化日期显示
const formatDate = (dateString?: string): string => {
  if (!dateString) return '';
  try {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return '今天';
    if (diffDays === 1) return '昨天';
    if (diffDays < 7) return `${diffDays}天前`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)}周前`;
    
    return date.toLocaleDateString('zh-CN', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  } catch {
    return '';
  }
};

// 发现日期标签组件
const DiscoveredDateBadge = ({ date, discoveredFrom }: { date?: string; discoveredFrom?: string }) => {
  if (!date) return null;
  const formattedDate = formatDate(date);
  return (
    <Badge variant="outline" className="text-xs text-blue-600 border-blue-200 bg-blue-50">
      📅 {formattedDate}添加
      {discoveredFrom && <span className="ml-1 text-blue-400">(来自"{discoveredFrom}")</span>}
    </Badge>
  );
};

// GitHub Stars 显示组件
const GitHubStarsBadge = ({ url }: { url: string }) => {
  const { githubInfo, loading, fetchGitHubInfo, formatStars } = useGitHubStars();
  const [showDialog, setShowDialog] = useState(false);
  const hasFetched = useRef(false);
  
  useEffect(() => {
    if (url && url.includes('github.com') && !hasFetched.current) {
      hasFetched.current = true;
      fetchGitHubInfo(url);
    }
  }, [url]);
  
  const info = githubInfo[url];
  
  // 加载中
  if (loading[url]) {
    return (
      <Badge variant="outline" className="text-xs bg-gray-800 text-white border-gray-700">
        <Loader2 className="w-3 h-3 mr-1 animate-spin" />
        ⭐ ...
      </Badge>
    );
  }
  
  // 仓库不存在 (404) 或已被标记为失效
  if (info?.error?.includes('Not Found') || info?.error?.includes('404')) {
    return (
      <Badge 
        variant="outline" 
        className="text-xs bg-red-50 text-red-600 border-red-200 cursor-help"
        title="仓库不存在或已删除"
      >
        ⚠️ 链接失效
      </Badge>
    );
  }
  
  // API 限制
  if (info?.error?.includes('rate limit') || info?.error?.includes('403')) {
    return (
      <Badge 
        variant="outline" 
        className="text-xs bg-yellow-50 text-yellow-600 border-yellow-200"
        title="API 请求限制，请稍后重试"
      >
        🐙 GitHub
      </Badge>
    );
  }
  
  // 其他错误
  if (!info || info.error || info.stars === null) {
    return (
      <Badge 
        variant="outline" 
        className="text-xs bg-gray-100 text-gray-500 border-gray-300 cursor-pointer hover:bg-gray-200"
        onClick={() => fetchGitHubInfo(url)}
        title="点击重试"
      >
        🐙 GitHub
      </Badge>
    );
  }
  
  return (
    <Dialog open={showDialog} onOpenChange={setShowDialog}>
      <DialogTrigger asChild>
        <Badge 
          className="text-xs bg-gray-800 text-white border-gray-700 cursor-pointer hover:bg-gray-700"
        >
          ⭐ {formatStars(info.stars)}
          {info.language && <span className="ml-1 text-gray-300">· {info.language}</span>}
        </Badge>
      </DialogTrigger>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <span>🐙 {info.owner}/{info.repo}</span>
            <Badge className="bg-yellow-500 text-black">⭐ {info.stars?.toLocaleString()}</Badge>
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          {info.description && (
            <p className="text-gray-600 text-sm">{info.description}</p>
          )}
          <div className="flex gap-4 text-sm">
            {info.forks !== null && (
              <span className="text-gray-500">🍴 {info.forks?.toLocaleString()} forks</span>
            )}
            {info.openIssues !== null && (
              <span className="text-gray-500">📋 {info.openIssues?.toLocaleString()} issues</span>
            )}
            {info.language && (
              <span className="text-gray-500">💻 {info.language}</span>
            )}
          </div>
          {info.topics && info.topics.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {info.topics.map(topic => (
                <Badge key={topic} variant="secondary" className="text-xs">
                  {topic}
                </Badge>
              ))}
            </div>
          )}
          {info.starHistoryUrl && (
            <div className="mt-4">
              <p className="text-sm text-gray-500 mb-2">⭐ Star History</p>
              <img 
                src={info.starHistoryUrl} 
                alt="Star History" 
                className="w-full rounded-lg border"
              />
            </div>
          )}
          <a 
            href={url} 
            target="_blank" 
            rel="noopener noreferrer"
            className="block mt-4"
          >
            <Button className="w-full bg-gray-800 hover:bg-gray-700">
              <ExternalLink className="w-4 h-4 mr-2" />
              访问 GitHub 仓库
            </Button>
          </a>
        </div>
      </DialogContent>
    </Dialog>
  );
};

// 替代项目标记组件
const AlternativeBadge = ({ _replaces }: { _replaces?: string }) => (
  <Badge title={_replaces} className="bg-purple-100 text-purple-700 text-xs flex-shrink-0">
    🔄 智能替代
  </Badge>
);

const ToolGridCard = ({ tool }: { tool: AITool }) => {
  const sourceType = getToolSourceType(tool);
  const isDiscovered = sourceType === 'kimi';
  const isGitHub = tool.source === 'github' || (tool.website || '').includes('github.com');
  const isAlternative = (tool as any).isAlternative === true;
  
  return (
    <Card className={`group hover:shadow-xl transition-all duration-300 overflow-hidden border-0 shadow-md ${isAlternative ? 'ring-2 ring-purple-200' : ''}`}>
      <CardContent className="p-0">
        <div className="p-6">
          <div className="flex items-start gap-4 mb-4">
            <img
              src={tool.logoUrl}
              alt={tool.name}
              className="w-14 h-14 rounded-xl shadow-md group-hover:scale-110 transition-transform duration-300"
            />
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1 flex-wrap">
                <h3 className="font-bold text-gray-900 truncate">{tool.chineseName}</h3>
                {tool.isFeatured && (
                  <Badge className="bg-[#7e43ff]/10 text-[#7e43ff] text-xs flex-shrink-0">
                    精选
                  </Badge>
                )}
                {isDiscovered && (
                  <Badge className="bg-green-100 text-green-700 text-xs flex-shrink-0">
                    <Sparkles className="w-3 h-3 mr-1" />
                    AI发现
                  </Badge>
                )}
                {isAlternative && (
                  <AlternativeBadge _replaces={(tool as any).replaces} />
                )}
              </div>
              <p className="text-sm text-gray-500">{tool.name}</p>
            </div>
          </div>

          <p className="text-gray-600 mb-4 line-clamp-2 text-sm">{tool.tagline}</p>

          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2 flex-wrap">
              <SourceBadge source={tool.source} />
              <Badge variant="secondary" className="text-xs">
                {categoryLabels[tool.category]}
              </Badge>
            </div>
            <div className="flex items-center gap-2">
              {isGitHub ? (
                <GitHubStarsBadge url={tool.website} />
              ) : (
                <span className="inline-flex items-center gap-1 text-sm text-gray-500">
                  <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                  {tool.rating}
                </span>
              )}
              {'linkStatus' in tool && (tool as any).linkStatus && (
                <LinkStatusBadge status={(tool as any).linkStatus} />
              )}
            </div>
          </div>
          
          {/* 显示发现日期 */}
          {(tool as any).discoveredAt && (
            <div className="mb-3">
              <DiscoveredDateBadge 
                date={(tool as any).discoveredAt} 
                discoveredFrom={(tool as any).discoveredFrom}
              />
            </div>
          )}

          <div className="flex gap-2">
            <ResearchReport 
              tool={tool} 
              trigger={
                <Button 
                  variant="outline" 
                  className="flex-1 border-[#7e43ff] text-[#7e43ff] hover:bg-[#7e43ff] hover:text-white"
                >
                  <FileText className="w-4 h-4 mr-2" />
                  调研
                </Button>
              }
            />
            {isDiscovered ? (
              <a href={tool.website} target="_blank" rel="noopener noreferrer" className="flex-1">
                <Button className="w-full bg-green-600 hover:bg-green-700 text-white">
                  访问
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </a>
            ) : (
              <Link to={`/tool/${tool.slug}`} className="flex-1">
                <Button className="w-full bg-[#7e43ff] hover:bg-[#6527ec] text-white">
                  详情
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

// GitHub Stars 列表显示组件
const GitHubStarsListBadge = ({ url }: { url: string }) => {
  const { githubInfo, loading, fetchGitHubInfo, formatStars } = useGitHubStars();
  const hasFetched = useRef(false);
  
  useEffect(() => {
    if (url && url.includes('github.com') && !hasFetched.current) {
      hasFetched.current = true;
      fetchGitHubInfo(url);
    }
  }, [url]);
  
  const info = githubInfo[url];
  
  // 加载中
  if (loading[url]) {
    return (
      <Badge variant="outline" className="text-xs bg-gray-800 text-white border-gray-700">
        <Loader2 className="w-3 h-3 mr-1 animate-spin" />
        ⭐ ...
      </Badge>
    );
  }
  
  // 仓库不存在 (404)
  if (info?.error?.includes('Not Found') || info?.error?.includes('404')) {
    return (
      <Badge 
        variant="outline" 
        className="text-xs bg-red-50 text-red-600 border-red-200"
        title="仓库不存在或已删除"
      >
        ⚠️ 失效
      </Badge>
    );
  }
  
  // API 限制或其他错误
  if (!info || info.error || info.stars === null) {
    return (
      <Badge variant="outline" className="text-xs bg-gray-100 text-gray-500 border-gray-300">
        🐙 GitHub
      </Badge>
    );
  }
  
  return (
    <Badge className="text-xs bg-gray-800 text-white border-gray-700">
      ⭐ {formatStars(info.stars)}
    </Badge>
  );
};

const ToolListCard = ({ tool }: { tool: AITool }) => {
  const sourceType = getToolSourceType(tool);
  const isDiscovered = sourceType === 'kimi';
  const isGitHub = tool.source === 'github' || (tool.website || '').includes('github.com');
  const isAlternative = (tool as any).isAlternative === true;
  
  return (
    <Card className={`group hover:shadow-lg transition-all duration-300 border-0 shadow-md ${isAlternative ? 'ring-2 ring-purple-200' : ''}`}>
      <CardContent className="p-4">
        <div className="flex items-center gap-4">
          <img
            src={tool.logoUrl}
            alt={tool.name}
            className="w-12 h-12 rounded-lg shadow-md flex-shrink-0"
          />
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1 flex-wrap">
              <h3 className="font-bold text-gray-900">{tool.chineseName}</h3>
              <span className="text-sm text-gray-500">{tool.name}</span>
              {tool.isFeatured && (
                <Badge className="bg-[#7e43ff]/10 text-[#7e43ff] text-xs">
                  精选
                </Badge>
              )}
              {isDiscovered && (
                <Badge className="bg-green-100 text-green-700 text-xs">
                  <Sparkles className="w-3 h-3 mr-1" />
                  AI发现
                </Badge>
              )}
              {isAlternative && (
                <AlternativeBadge _replaces={(tool as any).replaces} />
              )}
              {isGitHub ? (
                <GitHubStarsListBadge url={tool.website} />
              ) : (
                <SourceBadge source={tool.source} />
              )}
              {'linkStatus' in tool && (tool as any).linkStatus && (
                <LinkStatusBadge status={(tool as any).linkStatus} />
              )}
            </div>
            <p className="text-gray-600 text-sm line-clamp-1">{tool.tagline}</p>
            {/* 显示发现日期 */}
            {(tool as any).discoveredAt && (
              <div className="mt-1">
                <DiscoveredDateBadge 
                  date={(tool as any).discoveredAt} 
                  discoveredFrom={(tool as any).discoveredFrom}
                />
              </div>
            )}
          </div>
          <div className="flex items-center gap-4 flex-shrink-0">
            <div className="flex items-center gap-3 text-sm text-gray-500">
              {!isGitHub && (
                <span className="inline-flex items-center gap-1">
                  <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                  {tool.rating}
                </span>
              )}
              <span>{tool.viewCount.toLocaleString()} 浏览</span>
            </div>
            <Badge variant="secondary">{categoryLabels[tool.category]}</Badge>
            {isDiscovered ? (
              <a href={tool.website} target="_blank" rel="noopener noreferrer">
                <Button size="sm" className="bg-green-600 hover:bg-green-700">
                  <ExternalLink className="w-3 h-3 mr-1" />
                  访问
                </Button>
              </a>
            ) : (
              <Link to={`/tool/${tool.slug}`}>
                <Button size="sm" className="bg-[#7e43ff] hover:bg-[#6527ec]">
                  查看
                </Button>
              </Link>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default Browse;
