import { useState, useEffect } from 'react';
import { 
  TrendingUp, Lightbulb, Target, CheckCircle, Loader2, RefreshCw,
  MapPin, Clock, Globe, Zap, BarChart3, Users
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useProductResearch } from '@/hooks/useProductResearch';
import type { ResearchSummary, StageDetail, BiggestPainPoint } from '@/types/research';

// 阶段颜色配置
const stageColors = {
  preparation: { bg: 'from-blue-50 to-blue-100', border: 'border-blue-200', badge: 'bg-blue-200 text-blue-800' },
  early: { bg: 'from-teal-50 to-teal-100', border: 'border-teal-200', badge: 'bg-teal-200 text-teal-800' },
  mid: { bg: 'from-purple-50 to-purple-100', border: 'border-purple-200', badge: 'bg-purple-200 text-purple-800' },
  late: { bg: 'from-amber-50 to-amber-100', border: 'border-amber-200', badge: 'bg-amber-200 text-amber-800' },
};

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
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">求职AI市场战略汇总</h1>
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
          
          {/* Executive Summary */}
          {summary.executiveSummary && (
            <Card className="mt-6 bg-gradient-to-r from-indigo-50 to-purple-50 border-indigo-200">
              <CardContent className="pt-6">
                <div className="flex items-start gap-3">
                  <Lightbulb className="w-6 h-6 text-indigo-600 flex-shrink-0 mt-1" />
                  <div>
                    <h3 className="font-semibold text-indigo-900 mb-1">执行摘要</h3>
                    <p className="text-indigo-800 leading-relaxed">{summary.executiveSummary}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* 最大痛点突出显示 */}
        {summary.biggestPainPoint && (
          <Card className="mb-8 border-2 border-rose-500 ring-4 ring-rose-100 overflow-hidden">
            <div className="bg-rose-500 text-white text-center py-2 text-sm font-semibold flex items-center justify-center gap-2">
              <Zap className="w-4 h-4" />
              最大差异痛点 (影响 {summary.biggestPainPoint.impactDays} 天)
            </div>
            <CardContent className="p-6">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-1">
                  <h3 className="text-xl font-bold text-gray-900 mb-3">{summary.biggestPainPoint.painPoint}</h3>
                  <p className="text-gray-700 text-sm leading-relaxed">{summary.biggestPainPoint.description}</p>
                </div>
                <div className="lg:col-span-2">
                  <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                    解决方案及效果
                  </h4>
                  <div className="space-y-3">
                    {summary.biggestPainPoint.solutions.map((sol, i) => (
                      <div key={i} className="bg-green-50 p-3 rounded-lg">
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-medium text-green-900">{sol.product}</span>
                          <Badge className="bg-green-100 text-green-700">{sol.effectiveness}</Badge>
                        </div>
                        <p className="text-sm text-green-700">{sol.metrics}</p>
                      </div>
                    ))}
                  </div>
                  <div className="mt-4 bg-amber-50 p-3 rounded-lg">
                    <span className="font-medium text-amber-900">市场机会：</span>
                    <span className="text-amber-800 text-sm">{summary.biggestPainPoint.marketOpportunity}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* 求职阶段分析 */}
        {summary.jobStageAnalysis && (
          <div className="mb-8">
            <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <MapPin className="w-6 h-6 text-[#7e43ff]" />
              求职全流程痛点分析
            </h2>
            <div className="space-y-4">
              {Object.entries(summary.jobStageAnalysis).map(([key, stage]) => {
                const colors = stageColors[key as keyof typeof stageColors] || stageColors.preparation;
                return (
                  <StageCard key={key} stageKey={key} stage={stage} colors={colors} />
                );
              })}
            </div>
          </div>
        )}

        {/* 国内外对比 */}
        {summary.domesticVsOverseas && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="w-5 h-5 text-blue-600" />
                国内外市场对比
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-blue-900 mb-3 flex items-center gap-2">
                    <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                    海外产品优势
                  </h4>
                  <ul className="space-y-2">
                    {summary.domesticVsOverseas.overseasStrengths.map((item, i) => (
                      <li key={i} className="text-sm text-blue-800 flex items-start gap-2">
                        <span className="text-blue-500 mt-1">•</span>
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="bg-red-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-red-900 mb-3 flex items-center gap-2">
                    <span className="w-2 h-2 bg-red-500 rounded-full"></span>
                    国内产品优势
                  </h4>
                  <ul className="space-y-2">
                    {summary.domesticVsOverseas.domesticStrengths.map((item, i) => (
                      <li key={i} className="text-sm text-red-800 flex items-start gap-2">
                        <span className="text-red-500 mt-1">•</span>
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
              <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-gray-900 mb-2">差距分析</h4>
                  <p className="text-sm text-gray-700">{summary.domesticVsOverseas.gapAnalysis}</p>
                </div>
                <div className="bg-green-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-green-900 mb-2">市场机会</h4>
                  <p className="text-sm text-green-700">{summary.domesticVsOverseas.opportunity}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* 市场趋势 */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-green-600" />
              市场趋势
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3">
              {summary.marketTrends?.map((trend, i) => (
                <li key={i} className="flex items-start gap-3 bg-gray-50 p-3 rounded-lg">
                  <TrendingUp className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-700">{trend}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        {/* 战略建议 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="w-5 h-5 text-purple-600" />
              战略建议
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {summary.strategicRecommendations?.map((rec, i) => (
                <div key={i} className="bg-purple-50 p-4 rounded-lg">
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-purple-500 text-white flex items-center justify-center flex-shrink-0 text-sm font-medium">
                      {i + 1}
                    </div>
                    <p className="text-purple-900">{rec}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// 阶段卡片组件
function StageCard({ stageKey, stage, colors }: { stageKey: string; stage: StageDetail; colors: typeof stageColors.preparation }) {
  const stageNames: Record<string, string> = {
    preparation: '准备期',
    early: '前期',
    mid: '中期',
    late: '后期',
  };

  return (
    <div className="bg-white rounded-xl shadow-sm overflow-hidden hover:shadow-md transition-shadow">
      <div className="flex flex-col lg:flex-row">
        {/* 阶段标签 */}
        <div className={`lg:w-1/5 p-5 bg-gradient-to-br ${colors.bg} border-b lg:border-b-0 lg:border-r ${colors.border}`}>
          <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${colors.badge} mb-2`}>
            {stageNames[stageKey] || stage.stage}
          </span>
          <h3 className="text-lg font-bold text-gray-900">{stage.stage}</h3>
        </div>

        {/* 痛点 */}
        <div className="lg:w-1/5 p-5 border-b lg:border-b-0 lg:border-r border-gray-200">
          <div className="text-sm text-gray-500 mb-2 flex items-center gap-1">
            <Zap className="w-4 h-4" />
            核心痛点
          </div>
          <ul className="space-y-1">
            {stage.painPoints.slice(0, 3).map((pain, i) => (
              <li key={i} className="text-sm text-gray-700">• {pain}</li>
            ))}
          </ul>
        </div>

        {/* 产品方案 */}
        <div className="lg:w-2/5 p-5 border-b lg:border-b-0 lg:border-r border-gray-200">
          <div className="text-sm text-gray-500 mb-2 flex items-center gap-1">
            <CheckCircle className="w-4 h-4" />
            代表产品 & 解决方案
          </div>
          <div className="space-y-2">
            {stage.products.slice(0, 2).map((product, i) => (
              <div key={i} className="bg-gray-50 p-2 rounded">
                <div className="font-medium text-gray-900 text-sm">{product.name}</div>
                <div className="text-xs text-gray-600 mt-1">{product.solution.substring(0, 60)}...</div>
              </div>
            ))}
          </div>
        </div>

        {/* 数据 & 洞察 */}
        <div className="lg:w-1/5 p-5 bg-gradient-to-br from-green-50 to-green-100">
          <div className="text-sm text-gray-500 mb-2 flex items-center gap-1">
            <Lightbulb className="w-4 h-4" />
            关键洞察
          </div>
          <p className="text-sm text-gray-700 leading-relaxed">{stage.keyInsight.substring(0, 80)}...</p>
        </div>
      </div>
    </div>
  );
}
