// 产品调研报告类型定义

export interface ProductResearch {
  id: string;
  toolId: string;
  toolName: string;
  toolChineseName: string;
  toolWebsite: string;
  createdAt: string;
  updatedAt: string;
  
  // 调研内容
  summary: string; // 一句话概括
  founderBackground: string; // 创始人/团队背景
  problemSolved: string[]; // 解决了什么问题
  userValue: string; // 用户为什么愿意使用
  targetUsers: string; // 适合人群
  howToUse: string[]; // 使用说明
  useCases: UseCase[]; // 真实使用案例
  commercialization: Commercialization; // 商业化情况
  
  // 市场分析
  marketAnalysis: MarketAnalysis;
  
  // 竞争分析
  competitiveAnalysis: CompetitiveAnalysis;
  
  // 用户评价
  userFeedback: UserFeedback;
  
  // 战略建议
  strategicAdvice: StrategicAdvice;
  
  // 原始响应
  rawResponse?: string;
}

export interface UseCase {
  title: string;
  scenario: string;
  result: string;
}

export interface Commercialization {
  pricingModel: string; // 定价模式
  pricingTiers: PricingTier[]; // 定价层级
  revenueEstimate?: string; // 收入预估
  fundingStatus?: string; // 融资情况
  businessModel: string; // 商业模式
}

export interface PricingTier {
  name: string;
  price: string;
  features: string[];
}

export interface MarketAnalysis {
  marketSize: string; // 市场规模
  marketGrowth: string; // 市场增长率
  targetMarket: string; // 目标市场
  marketTrends: string[]; // 市场趋势
  opportunities: string[]; // 机会点
  threats: string[]; // 威胁
}

export interface CompetitiveAnalysis {
  directCompetitors: Competitor[]; // 直接竞品
  indirectCompetitors: Competitor[]; // 间接竞品
  competitiveAdvantages: string[]; // 竞争优势
  competitiveDisadvantages: string[]; // 竞争劣势
  marketPosition: string; // 市场地位
}

export interface Competitor {
  name: string;
  description: string;
  strengths: string[];
  weaknesses: string[];
}

export interface UserFeedback {
  satisfactionScore?: number; // 满意度评分
  positivePoints: string[]; // 用户好评点
  negativePoints: string[]; // 用户差评点
  commonComplaints: string[]; // 常见投诉
  userRetention?: string; // 用户留存率
}

export interface StrategicAdvice {
  viabilityScore: number; // 可行性评分 (1-10)
  marketPotential: string; // 市场潜力
  recommendation: string; // 建议
  keySuccessFactors: string[]; // 关键成功因素
  risks: string[]; // 风险点
  opportunities: string[]; // 机会点
}

// 汇总报告类型
export interface ResearchSummary {
  generatedAt: string;
  totalResearched: number;
  keyInsights: string[];
  marketTrends: string[];
  hotCategories: CategoryInsight[];
  topProducts: ProductInsight[];
  strategicRecommendations: string[];
}

export interface CategoryInsight {
  category: string;
  productCount: number;
  avgSatisfaction: number;
  trend: 'up' | 'down' | 'stable';
  keyInsight: string;
}

export interface ProductInsight {
  id: string;
  name: string;
  category: string;
  viabilityScore: number;
  marketPotential: string;
  keyStrength: string;
}
