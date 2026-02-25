import { useState, useEffect } from 'react';
import { TrendingUp, Lightbulb, Target, AlertTriangle, CheckCircle, Loader2, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useProductResearch } from '@/hooks/useProductResearch';
import type { ResearchSummary } from '@/types/research';

export default function StrategicSummary() {
  const [summary, setSummary] = useState<ResearchSummary | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const { generateSummary, getSummary } = useProductResearch();

  useEffect(() => {
    loadSummary();
  }, []);

  const loadSummary = async () => {
    setIsLoading(true);
    const existing = await getSummary();
    if (existing) {
      setSummary(existing);
    }
    setIsLoading(false);
  };

  const handleGenerate = async () => {
    setIsGenerating(true);
    const newSummary = await generateSummary();
    if (newSummary) {
      setSummary(newSummary);
    }
    setIsGenerating(false);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 pt-20 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-[#7e43ff] mx-auto mb-4" />
          <p className="text-gray-600">加载战略汇总...</p>
        </div>
      </div>
    );
  }

  if (!summary) {
    return (
      <div className="min-h-screen bg-gray-50 pt-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center">
            <TrendingUp className="w-20 h-20 text-gray-300 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-gray-900 mb-2">战略汇总报告</h1>
            <p className="text-gray-600 mb-6">
              基于所有产品调研报告，生成面向高层的战略决策建议
            </p>
            <Button 
              onClick={handleGenerate}
              disabled={isGenerating}
              className="bg-[#7e43ff] hover:bg-[#6527ec]"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  生成中...
                </>
              ) : (
                <>
                  <RefreshCw className="w-4 h-4 mr-2" />
                  生成战略汇总
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">战略决策汇总报告</h1>
            <p className="text-gray-600">
              基于 {summary.totalResearched} 份产品调研的战略洞察
              <span className="ml-2 text-sm text-gray-400">
                (生成于 {new Date(summary.generatedAt).toLocaleDateString('zh-CN')})
              </span>
            </p>
          </div>
          <Button 
            onClick={handleGenerate}
            disabled={isGenerating}
            variant="outline"
          >
            {isGenerating ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <RefreshCw className="w-4 h-4 mr-2" />
            )}
            更新报告
          </Button>
        </div>

        {/* Key Insights */}
        <Card className="mb-8 bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-blue-900">
              <Lightbulb className="w-6 h-6" />
              关键洞察
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {summary.keyInsights?.map((insight, i) => (
                <div key={i} className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-blue-500 text-white flex items-center justify-center flex-shrink-0 text-sm font-medium">
                    {i + 1}
                  </div>
                  <p className="text-blue-800 text-lg">{insight}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Two Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Market Trends */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-green-600" />
                市场趋势
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                {summary.marketTrends?.map((trend, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <div className="w-2 h-2 rounded-full bg-green-500 mt-2 flex-shrink-0" />
                    <span className="text-gray-700">{trend}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          {/* Strategic Recommendations */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="w-5 h-5 text-purple-600" />
                战略建议
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {summary.strategicRecommendations?.map((rec, i) => (
                  <div key={i} className="bg-purple-50 p-3 rounded-lg">
                    <div className="flex items-start gap-2">
                      <CheckCircle className="w-5 h-5 text-purple-600 flex-shrink-0 mt-0.5" />
                      <span className="text-purple-900">{rec}</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Hot Categories */}
        {summary.hotCategories && summary.hotCategories.length > 0 && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>热门类别分析</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {summary.hotCategories.map((category, i) => (
                  <div key={i} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-semibold">{category.category}</h4>
                      <Badge className={
                        category.trend === 'up' ? 'bg-green-100 text-green-700' :
                        category.trend === 'down' ? 'bg-red-100 text-red-700' :
                        'bg-gray-100 text-gray-700'
                      }>
                        {category.trend === 'up' ? '↑ 上升' :
                         category.trend === 'down' ? '↓ 下降' : '→ 稳定'}
                      </Badge>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-sm mb-2">
                      <div>
                        <span className="text-gray-500">产品数：</span>
                        <span className="font-medium">{category.productCount}</span>
                      </div>
                      <div>
                        <span className="text-gray-500">满意度：</span>
                        <span className="font-medium">{category.avgSatisfaction}/10</span>
                      </div>
                    </div>
                    <p className="text-sm text-gray-600">{category.keyInsight}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Top Products */}
        {summary.topProducts && summary.topProducts.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>重点关注产品</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {summary.topProducts.map((product, i) => (
                  <div key={i} className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
                    <div className="w-10 h-10 rounded-full bg-[#7e43ff] text-white flex items-center justify-center font-bold">
                      {i + 1}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h4 className="font-semibold text-lg">{product.name}</h4>
                        <Badge variant="secondary">{product.category}</Badge>
                      </div>
                      <p className="text-gray-600 text-sm">{product.keyStrength}</p>
                    </div>
                    <div className="text-right">
                      <Badge className={
                        product.viabilityScore >= 8 ? 'bg-green-100 text-green-700' :
                        product.viabilityScore >= 6 ? 'bg-yellow-100 text-yellow-700' :
                        'bg-orange-100 text-orange-700'
                      }>
                        可行性: {product.viabilityScore}/10
                      </Badge>
                      <p className="text-sm text-gray-500 mt-1">{product.marketPotential}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
