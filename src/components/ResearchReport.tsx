import { useState, useEffect, useRef } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { 
  Loader2, 
  FileText, 
  TrendingUp, 
  Users, 
  DollarSign, 
  Target, 
  Lightbulb, 
  AlertTriangle, 
  CheckCircle,
  X,
  Play,
  RefreshCw
} from 'lucide-react';
import { useProductResearch } from '@/hooks/useProductResearch';
import type { AITool } from '@/types';
import type { ProductResearch } from '@/types/research';

interface ResearchReportProps {
  tool: AITool;
  trigger?: React.ReactNode;
}

export function ResearchReport({ tool, trigger }: ResearchReportProps) {
  const [open, setOpen] = useState(false);
  const { 
    submitResearchTask, 
    cancelResearch,
    deleteResearch,
    getResearch, 
    isLoading, 
    research, 
    error,
    task 
  } = useProductResearch();

  // 本地状态存储报告（当从外部获取已有报告时使用）
  const [localResearch, setLocalResearch] = useState<ProductResearch | null>(null);
  const [loadingRestart, setLoadingRestart] = useState(false);
  const hasCheckedRef = useRef(false);

  // 打开对话框时检查是否有已有报告
  useEffect(() => {
    if (open && !research && !isLoading && !task && !localResearch && !hasCheckedRef.current) {
      hasCheckedRef.current = true;
      getResearch(tool.id).then(existing => {
        if (existing) {
          // 有已有报告，使用本地状态存储
          setLocalResearch(existing);
        } else {
          // 没有已有报告，自动开始调研
          submitResearchTask(tool);
        }
      });
    }
  }, [open]); // 只在打开时检查一次

  // 关闭时重置
  useEffect(() => {
    if (!open) {
      setLocalResearch(null);
      hasCheckedRef.current = false;
    }
  }, [open]);

  // 关闭时重置本地状态
  useEffect(() => {
    if (!open) {
      setLocalResearch(null);
    }
  }, [open]);

  // 合并报告数据（优先使用 hook 的，其次是本地的）
  const displayResearch = research || localResearch;

  // 关闭时取消进行中的任务
  const handleClose = () => {
    if (task?.status === 'processing' || task?.status === 'queued') {
      // 不取消，让用户可以继续查看进度
    }
    setOpen(false);
  };

  const handleStartResearch = () => {
    submitResearchTask(tool);
  };

  const handleRestartResearch = async () => {
    if (window.confirm('确定要重新调研吗？这将覆盖现有的调研报告。')) {
      setLoadingRestart(true);
      try {
        // 先删除服务器上的旧报告
        await deleteResearch(tool.id);
        // 清除本地报告状态
        setLocalResearch(null);
        hasCheckedRef.current = false;
        // 强制重新开始调研
        await submitResearchTask(tool, true);
      } catch (error) {
        console.error('重新调研失败:', error);
      } finally {
        setLoadingRestart(false);
      }
    }
  };

  const handleCancel = () => {
    cancelResearch();
  };

  const renderScoreBadge = (score: number) => {
    let color = 'bg-red-100 text-red-700';
    if (score >= 8) color = 'bg-green-100 text-green-700';
    else if (score >= 6) color = 'bg-yellow-100 text-yellow-700';
    else if (score >= 4) color = 'bg-orange-100 text-orange-700';
    
    return (
      <Badge className={`${color} text-lg px-3 py-1`}>
        {score}/10
      </Badge>
    );
  };

  const renderProgress = () => {
    if (!task) return null;
    
    return (
      <div className="flex flex-col items-center justify-center py-12 space-y-6">
        <div className="relative">
          <div className="w-24 h-24 rounded-full border-4 border-[#7e43ff]/20 flex items-center justify-center">
            <Loader2 className="w-12 h-12 animate-spin text-[#7e43ff]" />
          </div>
          {task.progress > 0 && (
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-2xl font-bold text-[#7e43ff]">{task.progress}%</span>
            </div>
          )}
        </div>
        
        <div className="text-center max-w-md">
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            Kimi AI 正在后台调研
          </h3>
          <p className="text-gray-600 mb-4">{task.message}</p>
          <Progress value={task.progress} className="w-64" />
        </div>
        
        <div className="bg-blue-50 p-4 rounded-lg max-w-md">
          <p className="text-sm text-blue-700">
            <Lightbulb className="w-4 h-4 inline mr-1" />
            您可以关闭此窗口，调研将在后台继续。完成后可在"调研报告"页面查看。
          </p>
        </div>
        
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleClose}>
            后台运行
          </Button>
          <Button variant="destructive" onClick={handleCancel}>
            <X className="w-4 h-4 mr-2" />
            取消
          </Button>
        </div>
      </div>
    );
  };

  const renderEmptyState = () => (
    <div className="flex flex-col items-center justify-center py-12">
      <FileText className="w-16 h-16 text-gray-300 mb-4" />
      <h3 className="text-xl font-semibold text-gray-900 mb-2">暂无调研报告</h3>
      <p className="text-gray-600 mb-6 text-center max-w-md">
        点击下方按钮启动 Kimi AI 进行深度产品调研
        <br />
        <span className="text-sm text-gray-400">预计需要 1-3 分钟，后台自动执行</span>
      </p>
      <Button 
        onClick={handleStartResearch}
        className="bg-[#7e43ff] hover:bg-[#6527ec]"
        size="lg"
      >
        <Play className="w-4 h-4 mr-2" />
        开始调研
      </Button>
    </div>
  );

  const renderResearchContent = (research: ProductResearch) => (
    <Tabs defaultValue="overview" className="w-full">
      {/* 顶部操作栏 */}
      <div className="flex items-center justify-between mb-4">
        <TabsList className="grid grid-cols-6 flex-1 mr-4">
          <TabsTrigger value="overview">概览</TabsTrigger>
          <TabsTrigger value="commercial">商业化</TabsTrigger>
          <TabsTrigger value="market">市场</TabsTrigger>
          <TabsTrigger value="competition">竞争</TabsTrigger>
          <TabsTrigger value="users">用户</TabsTrigger>
          <TabsTrigger value="strategy">战略</TabsTrigger>
        </TabsList>
        <Button
          variant="outline"
          size="sm"
          onClick={handleRestartResearch}
          disabled={loadingRestart || isLoading}
          className="gap-1 text-orange-600 border-orange-200 hover:bg-orange-50"
          title="重新调研会覆盖当前报告"
        >
          {loadingRestart ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <RefreshCw className="w-4 h-4" />
          )}
          {loadingRestart ? '重新调研中...' : '重新调研'}
        </Button>
      </div>

      {/* 概览 */}
      <TabsContent value="overview" className="space-y-4 max-h-[60vh] overflow-y-auto pr-2">
        <div className="bg-blue-50 p-4 rounded-lg">
          <h3 className="font-semibold text-blue-900 mb-2 flex items-center gap-2">
            <Lightbulb className="w-5 h-5" />
            一句话概括
          </h3>
          <p className="text-blue-800">{research.summary}</p>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="font-semibold mb-2">创始人/团队背景</h3>
            <p className="text-sm text-gray-700">{research.founderBackground}</p>
          </div>
          
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="font-semibold mb-2">目标用户</h3>
            <p className="text-sm text-gray-700">{research.targetUsers}</p>
          </div>
        </div>

        <div className="bg-gray-50 p-4 rounded-lg">
          <h3 className="font-semibold mb-2">解决的问题</h3>
          <ul className="list-disc list-inside space-y-1">
            {research.problemSolved?.map((problem, i) => (
              <li key={i} className="text-sm text-gray-700">{problem}</li>
            ))}
          </ul>
        </div>

        <div className="bg-green-50 p-4 rounded-lg">
          <h3 className="font-semibold text-green-900 mb-2">用户价值</h3>
          <p className="text-sm text-green-800">{research.userValue}</p>
        </div>

        <div className="bg-gray-50 p-4 rounded-lg">
          <h3 className="font-semibold mb-2">使用说明</h3>
          <ol className="list-decimal list-inside space-y-1">
            {research.howToUse?.map((step, i) => (
              <li key={i} className="text-sm text-gray-700">{step}</li>
            ))}
          </ol>
        </div>

        {research.useCases && research.useCases.length > 0 && (
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="font-semibold mb-2">真实使用案例</h3>
            <div className="space-y-3">
              {research.useCases.map((useCase, i) => (
                <div key={i} className="border-l-4 border-blue-500 pl-3">
                  <h4 className="font-medium text-sm">{useCase.title}</h4>
                  <p className="text-xs text-gray-600">{useCase.scenario}</p>
                  <p className="text-xs text-green-600 mt-1">{useCase.result}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </TabsContent>

      {/* 商业化 */}
      <TabsContent value="commercial" className="space-y-4 max-h-[60vh] overflow-y-auto pr-2">
        {research.commercialization ? (
          <>
            <div className="bg-purple-50 p-4 rounded-lg">
              <h3 className="font-semibold text-purple-900 mb-2 flex items-center gap-2">
                <DollarSign className="w-5 h-5" />
                商业模式
              </h3>
              <p className="text-purple-800">{research.commercialization.businessModel}</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {research.commercialization.pricingTiers?.map((tier, i) => (
                <div key={i} className="border rounded-lg p-4">
                  <h4 className="font-semibold text-lg mb-2">{tier.name}</h4>
                  <p className="text-2xl font-bold text-[#7e43ff] mb-3">{tier.price}</p>
                  <ul className="space-y-1">
                    {tier.features?.map((feature, j) => (
                      <li key={j} className="text-sm text-gray-600 flex items-center gap-1">
                        <CheckCircle className="w-3 h-3 text-green-500" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>

            {research.commercialization.revenueEstimate && (
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-semibold mb-2">收入预估</h3>
                <p className="text-sm text-gray-700">{research.commercialization.revenueEstimate}</p>
              </div>
            )}

            {research.commercialization.fundingStatus && (
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-semibold mb-2">融资情况</h3>
                <p className="text-sm text-gray-700">{research.commercialization.fundingStatus}</p>
              </div>
            )}
          </>
        ) : (
          <p className="text-gray-500">暂无商业化数据</p>
        )}
      </TabsContent>

      {/* 市场分析 */}
      <TabsContent value="market" className="space-y-4 max-h-[60vh] overflow-y-auto pr-2">
        {research.marketAnalysis ? (
          <>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-blue-50 p-4 rounded-lg">
                <h3 className="font-semibold text-blue-900 mb-2 flex items-center gap-2">
                  <TrendingUp className="w-5 h-5" />
                  市场规模
                </h3>
                <p className="text-blue-800">{research.marketAnalysis.marketSize}</p>
              </div>
              <div className="bg-green-50 p-4 rounded-lg">
                <h3 className="font-semibold text-green-900 mb-2">市场增长率</h3>
                <p className="text-green-800">{research.marketAnalysis.marketGrowth}</p>
              </div>
            </div>

            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-semibold mb-2">目标市场</h3>
              <p className="text-sm text-gray-700">{research.marketAnalysis.targetMarket}</p>
            </div>

            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-semibold mb-2">市场趋势</h3>
              <ul className="list-disc list-inside space-y-1">
                {research.marketAnalysis.marketTrends?.map((trend, i) => (
                  <li key={i} className="text-sm text-gray-700">{trend}</li>
                ))}
              </ul>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="bg-green-50 p-4 rounded-lg">
                <h3 className="font-semibold text-green-900 mb-2">机会点</h3>
                <ul className="list-disc list-inside space-y-1">
                  {research.marketAnalysis.opportunities?.map((opp, i) => (
                    <li key={i} className="text-sm text-green-800">{opp}</li>
                  ))}
                </ul>
              </div>
              <div className="bg-red-50 p-4 rounded-lg">
                <h3 className="font-semibold text-red-900 mb-2">威胁</h3>
                <ul className="list-disc list-inside space-y-1">
                  {research.marketAnalysis.threats?.map((threat, i) => (
                    <li key={i} className="text-sm text-red-800">{threat}</li>
                  ))}
                </ul>
              </div>
            </div>
          </>
        ) : (
          <p className="text-gray-500">暂无市场分析数据</p>
        )}
      </TabsContent>

      {/* 竞争分析 */}
      <TabsContent value="competition" className="space-y-4 max-h-[60vh] overflow-y-auto pr-2">
        {research.competitiveAnalysis ? (
          <>
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-semibold mb-2">市场地位</h3>
              <p className="text-sm text-gray-700">{research.competitiveAnalysis.marketPosition}</p>
            </div>

            {research.competitiveAnalysis.directCompetitors?.length > 0 && (
              <div>
                <h3 className="font-semibold mb-3">直接竞品</h3>
                <div className="space-y-3">
                  {research.competitiveAnalysis.directCompetitors.map((competitor, i) => (
                    <div key={i} className="border rounded-lg p-4">
                      <h4 className="font-medium">{competitor.name}</h4>
                      <p className="text-sm text-gray-600 mb-2">{competitor.description}</p>
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div>
                          <span className="text-green-600 font-medium">优势：</span>
                          {competitor.strengths?.join(', ')}
                        </div>
                        <div>
                          <span className="text-red-600 font-medium">劣势：</span>
                          {competitor.weaknesses?.join(', ')}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div className="bg-green-50 p-4 rounded-lg">
                <h3 className="font-semibold text-green-900 mb-2">竞争优势</h3>
                <ul className="list-disc list-inside space-y-1">
                  {research.competitiveAnalysis.competitiveAdvantages?.map((adv, i) => (
                    <li key={i} className="text-sm text-green-800">{adv}</li>
                  ))}
                </ul>
              </div>
              <div className="bg-orange-50 p-4 rounded-lg">
                <h3 className="font-semibold text-orange-900 mb-2">竞争劣势</h3>
                <ul className="list-disc list-inside space-y-1">
                  {research.competitiveAnalysis.competitiveDisadvantages?.map((dis, i) => (
                    <li key={i} className="text-sm text-orange-800">{dis}</li>
                  ))}
                </ul>
              </div>
            </div>
          </>
        ) : (
          <p className="text-gray-500">暂无竞争分析数据</p>
        )}
      </TabsContent>

      {/* 用户反馈 */}
      <TabsContent value="users" className="space-y-4 max-h-[60vh] overflow-y-auto pr-2">
        {research.userFeedback ? (
          <>
            <div className="flex items-center gap-4">
              <div className="bg-yellow-50 p-4 rounded-lg flex-1">
                <h3 className="font-semibold text-yellow-900 mb-2 flex items-center gap-2">
                  <Users className="w-5 h-5" />
                  用户满意度
                </h3>
                {research.userFeedback.satisfactionScore ? (
                  <div className="text-3xl font-bold text-yellow-600">
                    {research.userFeedback.satisfactionScore}/10
                  </div>
                ) : (
                  <p className="text-yellow-700">暂无数据</p>
                )}
              </div>
              {research.userFeedback.userRetention && (
                <div className="bg-blue-50 p-4 rounded-lg flex-1">
                  <h3 className="font-semibold text-blue-900 mb-2">用户留存率</h3>
                  <p className="text-blue-800">{research.userFeedback.userRetention}</p>
                </div>
              )}
            </div>

            <div className="bg-green-50 p-4 rounded-lg">
              <h3 className="font-semibold text-green-900 mb-2">用户好评</h3>
              <ul className="list-disc list-inside space-y-1">
                {research.userFeedback.positivePoints?.map((point, i) => (
                  <li key={i} className="text-sm text-green-800">{point}</li>
                ))}
              </ul>
            </div>

            <div className="bg-red-50 p-4 rounded-lg">
              <h3 className="font-semibold text-red-900 mb-2">用户差评</h3>
              <ul className="list-disc list-inside space-y-1">
                {research.userFeedback.negativePoints?.map((point, i) => (
                  <li key={i} className="text-sm text-red-800">{point}</li>
                ))}
              </ul>
            </div>

            {research.userFeedback.commonComplaints?.length > 0 && (
              <div className="bg-orange-50 p-4 rounded-lg">
                <h3 className="font-semibold text-orange-900 mb-2 flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5" />
                  常见投诉
                </h3>
                <ul className="list-disc list-inside space-y-1">
                  {research.userFeedback.commonComplaints.map((complaint, i) => (
                    <li key={i} className="text-sm text-orange-800">{complaint}</li>
                  ))}
                </ul>
              </div>
            )}
          </>
        ) : (
          <p className="text-gray-500">暂无用户反馈数据</p>
        )}
      </TabsContent>

      {/* 战略建议 */}
      <TabsContent value="strategy" className="space-y-4 max-h-[60vh] overflow-y-auto pr-2">
        {research.strategicAdvice ? (
          <>
            <div className="flex items-center gap-4">
              <div className="bg-blue-50 p-4 rounded-lg flex-1">
                <h3 className="font-semibold text-blue-900 mb-2">可行性评分</h3>
                <div className="flex items-center gap-2">
                  {renderScoreBadge(research.strategicAdvice.viabilityScore)}
                  <span className="text-sm text-blue-700">
                    {research.strategicAdvice.viabilityScore >= 8 ? '强烈推荐' :
                     research.strategicAdvice.viabilityScore >= 6 ? '值得考虑' : '谨慎评估'}
                  </span>
                </div>
              </div>
              <div className="bg-purple-50 p-4 rounded-lg flex-1">
                <h3 className="font-semibold text-purple-900 mb-2">市场潜力</h3>
                <p className="text-purple-800">{research.strategicAdvice.marketPotential}</p>
              </div>
            </div>

            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-semibold mb-2 flex items-center gap-2">
                <Target className="w-5 h-5" />
                战略建议
              </h3>
              <p className="text-gray-700">{research.strategicAdvice.recommendation}</p>
            </div>

            <div className="bg-green-50 p-4 rounded-lg">
              <h3 className="font-semibold text-green-900 mb-2">关键成功因素</h3>
              <ul className="list-disc list-inside space-y-1">
                {research.strategicAdvice.keySuccessFactors?.map((factor, i) => (
                  <li key={i} className="text-sm text-green-800">{factor}</li>
                ))}
              </ul>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="bg-green-50 p-4 rounded-lg">
                <h3 className="font-semibold text-green-900 mb-2">机会</h3>
                <ul className="list-disc list-inside space-y-1">
                  {research.strategicAdvice.opportunities?.map((opp, i) => (
                    <li key={i} className="text-sm text-green-800">{opp}</li>
                  ))}
                </ul>
              </div>
              <div className="bg-red-50 p-4 rounded-lg">
                <h3 className="font-semibold text-red-900 mb-2">风险</h3>
                <ul className="list-disc list-inside space-y-1">
                  {research.strategicAdvice.risks?.map((risk, i) => (
                    <li key={i} className="text-sm text-red-800">{risk}</li>
                  ))}
                </ul>
              </div>
            </div>
          </>
        ) : (
          <p className="text-gray-500">暂无战略建议数据</p>
        )}
      </TabsContent>
    </Tabs>
  );

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="outline" size="sm" className="gap-1">
            <FileText className="w-4 h-4" />
            调研报告
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="w-6 h-6 text-[#7e43ff]" />
            产品调研报告：{tool.chineseName || tool.name}
            {displayResearch && (
              <Badge className="bg-green-100 text-green-700 ml-2">
                已完成
              </Badge>
            )}
            {task?.status === 'processing' && (
              <Badge className="bg-blue-100 text-blue-700 ml-2">
                调研中 {task.progress}%
              </Badge>
            )}
          </DialogTitle>
        </DialogHeader>
        
        <div className="mt-4">
          {task?.status === 'processing' || task?.status === 'queued' ? (
            renderProgress()
          ) : error ? (
            <div className="bg-red-50 text-red-700 p-4 rounded-lg">
              <p>调研失败：{error}</p>
              <Button 
                onClick={handleStartResearch} 
                className="mt-2"
                variant="outline"
              >
                重试
              </Button>
            </div>
          ) : displayResearch ? (
            renderResearchContent(displayResearch)
          ) : (
            renderEmptyState()
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
