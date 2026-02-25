import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Star, ExternalLink, Check, X, Users, Target, Rocket, DollarSign, Lightbulb, ThumbsUp, ThumbsDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { mockTools, categoryLabels } from '@/data/mockData';
import type { AITool } from '@/types';

const Detail = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const [tool, setTool] = useState<AITool | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate API call
    setLoading(true);
    const foundTool = mockTools.find((t) => t.slug === slug);
    
    if (foundTool) {
      setTool(foundTool);
      // Increment view count (in real app, this would be an API call)
      foundTool.viewCount += 1;
    }
    
    setTimeout(() => {
      setLoading(false);
    }, 300);
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 pt-20 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-[#7e43ff] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600">加载中...</p>
        </div>
      </div>
    );
  }

  if (!tool) {
    return (
      <div className="min-h-screen bg-gray-50 pt-20 flex items-center justify-center">
        <div className="text-center">
          <div className="w-20 h-20 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
            <X className="w-10 h-10 text-gray-400" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">工具未找到</h1>
          <p className="text-gray-600 mb-4">抱歉，您查找的工具不存在</p>
          <Link to="/browse">
            <Button className="bg-[#7e43ff] hover:bg-[#6527ec]">
              返回浏览
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const { content } = tool;

  return (
    <div className="min-h-screen bg-gray-50 pt-20">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <button
            onClick={() => navigate(-1)}
            className="inline-flex items-center text-gray-500 hover:text-gray-700 mb-4 transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            返回
          </button>

          <div className="flex flex-col sm:flex-row sm:items-start gap-6">
            <img
              src={tool.logoUrl}
              alt={tool.name}
              className="w-20 h-20 rounded-2xl shadow-lg"
            />
            <div className="flex-1">
              <div className="flex flex-wrap items-center gap-3 mb-2">
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
                  {tool.chineseName}
                </h1>
                <span className="text-lg text-gray-500">{tool.name}</span>
              </div>

              <p className="text-lg text-gray-600 mb-4">{tool.tagline}</p>

              <div className="flex flex-wrap items-center gap-4">
                <div className="flex items-center gap-1">
                  <Star className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                  <span className="font-semibold text-gray-900">{tool.rating}</span>
                  <span className="text-gray-500">/ 10</span>
                </div>
                <span className="text-gray-400">|</span>
                <span className="text-gray-600">
                  {tool.viewCount.toLocaleString()} 次浏览
                </span>
                <span className="text-gray-400">|</span>
                <Badge variant="secondary">{categoryLabels[tool.category]}</Badge>
                {tool.isFeatured && (
                  <Badge className="bg-[#7e43ff]/10 text-[#7e43ff]">精选</Badge>
                )}
              </div>
            </div>

            <a
              href={tool.website}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-shrink-0"
            >
              <Button className="bg-[#7e43ff] hover:bg-[#6527ec] text-white">
                访问官网
                <ExternalLink className="w-4 h-4 ml-2" />
              </Button>
            </a>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-8">
          {/* Founder Background */}
          <SectionCard
            icon={<Users className="w-5 h-5 text-white" />}
            title="创始人 / 团队背景"
            color="bg-blue-500"
          >
            <p className="text-gray-700 leading-relaxed">{content.founderBackground}</p>
          </SectionCard>

          {/* Problem Solved */}
          <SectionCard
            icon={<Lightbulb className="w-5 h-5 text-white" />}
            title="这个工具解决了什么问题？"
            color="bg-green-500"
          >
            <ul className="space-y-3">
              {content.problemSolved.map((problem, index) => (
                <li key={index} className="flex items-start gap-3">
                  <span className="w-6 h-6 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-green-600 text-sm font-bold">{index + 1}</span>
                  </span>
                  <span className="text-gray-700">{problem}</span>
                </li>
              ))}
            </ul>
          </SectionCard>

          {/* User Value */}
          <SectionCard
            icon={<ThumbsUp className="w-5 h-5 text-white" />}
            title="用户为什么愿意使用它？"
            color="bg-yellow-500"
          >
            <div className="grid gap-4">
              {content.userValue.map((item, index) => (
                <div
                  key={index}
                  className="flex items-start gap-3 p-4 bg-yellow-50 rounded-lg"
                >
                  <span className="text-yellow-600 font-bold text-lg">▸</span>
                  <div>
                    <span className="font-semibold text-gray-900">{item.feature}：</span>
                    <span className="text-gray-700">{item.desc}</span>
                  </div>
                </div>
              ))}
            </div>
          </SectionCard>

          {/* Target Users */}
          <SectionCard
            icon={<Target className="w-5 h-5 text-white" />}
            title="适合人群"
            color="bg-purple-500"
          >
            <p className="text-gray-700 leading-relaxed bg-purple-50 p-4 rounded-lg">
              {content.targetUsers}
            </p>
          </SectionCard>

          {/* How to Use */}
          <SectionCard
            icon={<Rocket className="w-5 h-5 text-white" />}
            title="使用说明（快速上手）"
            color="bg-red-500"
          >
            <ol className="space-y-4">
              {content.howToUse.map((step, index) => (
                <li key={index} className="flex items-start gap-4">
                  <span className="w-8 h-8 rounded-full bg-red-500 text-white flex items-center justify-center font-bold flex-shrink-0">
                    {index + 1}
                  </span>
                  <span className="text-gray-700 pt-1">{step}</span>
                </li>
              ))}
            </ol>
          </SectionCard>

          {/* Use Cases */}
          <SectionCard
            icon={<Check className="w-5 h-5 text-white" />}
            title="真实使用案例"
            color="bg-indigo-500"
          >
            <div className="space-y-6">
              {content.useCases.map((useCase, index) => (
                <div
                  key={index}
                  className="border-l-4 border-indigo-500 pl-4 bg-indigo-50 p-4 rounded-r-lg"
                >
                  <h4 className="font-bold text-indigo-900 mb-3">{useCase.scenario}</h4>
                  <div className="space-y-2 text-sm">
                    <p className="text-gray-600">
                      <span className="text-red-500 font-medium">之前：</span>
                      {useCase.before}
                    </p>
                    <p className="text-gray-600">
                      <span className="text-green-500 font-medium">之后：</span>
                      {useCase.after}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </SectionCard>

          {/* Pricing */}
          <SectionCard
            icon={<DollarSign className="w-5 h-5 text-white" />}
            title="定价方案"
            color="bg-emerald-500"
          >
            <div className="grid sm:grid-cols-3 gap-4">
              <PricingCard
                tier="免费版"
                price="¥0"
                period="/月"
                description={content.pricing.free}
                featured={false}
              />
              <PricingCard
                tier="Pro"
                price={content.pricing.pro.split(' - ')[0]}
                period="/月"
                description={content.pricing.pro.split(' - ')[1] || content.pricing.pro}
                featured={true}
              />
              <PricingCard
                tier="Premium"
                price={content.pricing.premium.split(' - ')[0]}
                period="/月"
                description={content.pricing.premium.split(' - ')[1] || content.pricing.premium}
                featured={false}
              />
            </div>
          </SectionCard>

          {/* Pros & Cons */}
          <div className="grid md:grid-cols-2 gap-6">
            <SectionCard
              icon={<ThumbsUp className="w-5 h-5 text-white" />}
              title="优点"
              color="bg-green-500"
            >
              <ul className="space-y-2">
                {content.pros.map((pro, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <Check className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-700">{pro}</span>
                  </li>
                ))}
              </ul>
            </SectionCard>

            <SectionCard
              icon={<ThumbsDown className="w-5 h-5 text-white" />}
              title="缺点"
              color="bg-red-500"
            >
              <ul className="space-y-2">
                {content.cons.map((con, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <X className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-700">{con}</span>
                  </li>
                ))}
              </ul>
            </SectionCard>
          </div>

          {/* CTA */}
          <div className="text-center py-8">
            <Separator className="mb-8" />
            <h3 className="text-xl font-bold text-gray-900 mb-4">
              准备好尝试 {tool.chineseName} 了吗？
            </h3>
            <a
              href={tool.website}
              target="_blank"
              rel="noopener noreferrer"
            >
              <Button
                size="lg"
                className="bg-[#7e43ff] hover:bg-[#6527ec] text-white px-8"
              >
                立即体验
                <ExternalLink className="w-5 h-5 ml-2" />
              </Button>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

const SectionCard = ({
  icon,
  title,
  color,
  children,
}: {
  icon: React.ReactNode;
  title: string;
  color: string;
  children: React.ReactNode;
}) => (
  <Card className="border-0 shadow-md overflow-hidden">
    <CardContent className="p-0">
      <div className="flex items-center gap-3 p-4 border-b border-gray-100">
        <div className={`w-10 h-10 rounded-lg ${color} flex items-center justify-center shadow-md`}>
          {icon}
        </div>
        <h2 className="text-lg font-bold text-gray-900">{title}</h2>
      </div>
      <div className="p-6">{children}</div>
    </CardContent>
  </Card>
);

const PricingCard = ({
  tier,
  price,
  period,
  description,
  featured,
}: {
  tier: string;
  price: string;
  period: string;
  description: string;
  featured: boolean;
}) => (
  <div
    className={`p-4 rounded-xl ${
      featured
        ? 'bg-gradient-to-br from-[#7e43ff] to-[#6527ec] text-white shadow-lg scale-105'
        : 'bg-gray-50 text-gray-900'
    }`}
  >
    <div className="mb-3">
      <span className={`text-sm font-medium ${featured ? 'text-white/80' : 'text-gray-500'}`}>
        {tier}
      </span>
      <div className="flex items-baseline gap-1 mt-1">
        <span className="text-2xl font-bold">{price}</span>
        <span className={`text-sm ${featured ? 'text-white/70' : 'text-gray-500'}`}>
          {period}
        </span>
      </div>
    </div>
    <p className={`text-sm ${featured ? 'text-white/90' : 'text-gray-600'}`}>
      {description}
    </p>
  </div>
);

export default Detail;
