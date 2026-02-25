import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FileText, Calendar, ArrowRight, Loader2, TrendingUp, Star, Target } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ResearchReport } from '@/components/ResearchReport';
import { useProductResearch } from '@/hooks/useProductResearch';
import { mockTools } from '@/data/mockData';
import type { ProductResearch } from '@/types/research';

export default function ResearchHistory() {
  const [researchList, setResearchList] = useState<ProductResearch[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { getAllResearch } = useProductResearch();

  useEffect(() => {
    loadResearch();
  }, []);

  const loadResearch = async () => {
    setIsLoading(true);
    const list = await getAllResearch();
    setResearchList(list);
    setIsLoading(false);
  };

  const getToolById = (toolId: string) => {
    return mockTools.find(t => t.id === toolId) || {
      id: toolId,
      name: researchList.find(r => r.toolId === toolId)?.toolName || 'Unknown',
      chineseName: researchList.find(r => r.toolId === toolId)?.toolChineseName || 'Unknown',
      slug: '',
      description: '',
      tagline: '',
      website: '',
      logoUrl: '',
      category: 'career',
      status: 'published',
      content: {
        founderBackground: '',
        problemSolved: [],
        userValue: [],
        targetUsers: '',
        howToUse: [],
        useCases: [],
        pricing: { free: '', pro: '', premium: '' },
        pros: [],
        cons: []
      },
      rating: 0,
      viewCount: 0,
      isFeatured: false,
      createdAt: '',
      updatedAt: '',
      publishedAt: '',
      source: 'manual'
    };
  };

  const renderScoreBadge = (score: number) => {
    let color = 'bg-red-100 text-red-700';
    if (score >= 8) color = 'bg-green-100 text-green-700';
    else if (score >= 6) color = 'bg-yellow-100 text-yellow-700';
    else if (score >= 4) color = 'bg-orange-100 text-orange-700';
    
    return (
      <Badge className={`${color}`}>
        评分: {score}/10
      </Badge>
    );
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 pt-20 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-[#7e43ff] mx-auto mb-4" />
          <p className="text-gray-600">加载调研报告...</p>
        </div>
      </div>
    );
  }

  if (researchList.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 pt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center">
            <FileText className="w-20 h-20 text-gray-300 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-gray-900 mb-2">暂无调研报告</h1>
            <p className="text-gray-600 mb-6">您还没有生成任何产品调研报告</p>
            <Link to="/browse">
              <Button className="bg-[#7e43ff] hover:bg-[#6527ec]">
                去浏览产品
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">产品调研报告库</h1>
          <p className="text-gray-600">
            已生成 {researchList.length} 份详细调研报告，为战略决策提供数据支持
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <FileText className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{researchList.length}</p>
                  <p className="text-sm text-gray-500">调研报告</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <Star className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">
                    {(researchList.reduce((acc, r) => acc + (r.strategicAdvice?.viabilityScore || 0), 0) / researchList.length).toFixed(1)}
                  </p>
                  <p className="text-sm text-gray-500">平均可行性</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                  <Target className="w-6 h-6 text-purple-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">
                    {new Set(researchList.map(r => r.category)).size}
                  </p>
                  <p className="text-sm text-gray-500">覆盖类别</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                  <Calendar className="w-6 h-6 text-orange-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">
                    {new Date(researchList[0]?.createdAt).toLocaleDateString('zh-CN')}
                  </p>
                  <p className="text-sm text-gray-500">最新报告</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Research List */}
        <div className="grid gap-6">
          {researchList.map((research) => {
            const tool = getToolById(research.toolId);
            return (
              <ResearchReport 
                key={research.id} 
                tool={tool}
                trigger={
                  <Card className="hover:shadow-lg transition-shadow cursor-pointer group">
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-4">
                          <img
                            src={tool.logoUrl}
                            alt={tool.name}
                            className="w-16 h-16 rounded-xl shadow-md group-hover:scale-105 transition-transform"
                          />
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <h3 className="text-xl font-bold">{research.toolChineseName}</h3>
                              {research.strategicAdvice?.viabilityScore && (
                                renderScoreBadge(research.strategicAdvice.viabilityScore)
                              )}
                            </div>
                            <p className="text-gray-600 mb-3 line-clamp-2">{research.summary}</p>
                            <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500">
                              <span className="flex items-center gap-1">
                                <Calendar className="w-4 h-4" />
                                {new Date(research.createdAt).toLocaleDateString('zh-CN')}
                              </span>
                              {research.marketAnalysis?.marketSize && (
                                <span className="truncate max-w-[200px]">📊 {research.marketAnalysis.marketSize}</span>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 ml-4">
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="gap-1 bg-[#7e43ff] text-white hover:bg-[#6527ec] border-none"
                          >
                            <FileText className="w-4 h-4" />
                            查看完整报告
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                }
              />
            );
          })}
        </div>
      </div>
    </div>
  );
}
