import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Search, Shuffle, ArrowRight, Star, TrendingUp, Users, Zap, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { mockTools, categoryLabels } from '@/data/mockData';
import type { AITool } from '@/types';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const Home = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [randomTool, setRandomTool] = useState<AITool | null>(null);
  const [featuredTools, setFeaturedTools] = useState<AITool[]>([]);
  const heroRef = useRef<HTMLDivElement>(null);
  const statsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Get featured tools
    const featured = mockTools.filter(tool => tool.isFeatured).slice(0, 3);
    setFeaturedTools(featured);

    // GSAP Animations
    const ctx = gsap.context(() => {
      // Hero animations
      gsap.from('.hero-title-line', {
        y: 60,
        opacity: 0,
        duration: 0.8,
        stagger: 0.15,
        ease: 'power3.out',
        delay: 0.3
      });

      gsap.from('.hero-subtitle', {
        y: 40,
        opacity: 0,
        duration: 0.6,
        ease: 'power3.out',
        delay: 0.8
      });

      gsap.from('.hero-cta', {
        y: 30,
        opacity: 0,
        duration: 0.5,
        stagger: 0.1,
        ease: 'power3.out',
        delay: 1
      });

      // Stats counter animation
      gsap.from('.stat-item', {
        scrollTrigger: {
          trigger: statsRef.current,
          start: 'top 80%',
          toggleActions: 'play none none none'
        },
        y: 40,
        opacity: 0,
        duration: 0.6,
        stagger: 0.15,
        ease: 'power3.out'
      });
    });

    return () => ctx.revert();
  }, []);

  const handleRandomPick = () => {
    const randomIndex = Math.floor(Math.random() * mockTools.length);
    setRandomTool(mockTools[randomIndex]);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      window.location.href = `/browse?search=${encodeURIComponent(searchQuery)}`;
    }
  };

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section
        ref={heroRef}
        className="relative min-h-screen flex items-center pt-20 overflow-hidden"
        style={{
          background: 'linear-gradient(135deg, #f8f1ff 0%, #f0e3ff 50%, #ffffff 100%)'
        }}
      >
        {/* Background Decorations */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-20 left-10 w-72 h-72 bg-[#7e43ff]/10 rounded-full blur-3xl animate-gentle-float" />
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-[#4361ee]/10 rounded-full blur-3xl animate-gentle-float" style={{ animationDelay: '3s' }} />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gradient-to-br from-[#7e43ff]/5 to-transparent rounded-full blur-3xl" />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 relative z-10">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left Content */}
            <div className="text-center lg:text-left">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/80 backdrop-blur rounded-full text-sm text-[#7e43ff] font-medium mb-6 shadow-sm">
                <SparklesIcon className="w-4 h-4" />
                每日发现一款求职AI神器
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 leading-tight mb-6">
                <span className="hero-title-line block">发现你的</span>
                <span className="hero-title-line block text-[#7e43ff]">理想工作</span>
                <span className="hero-title-line block">借助智能 AI</span>
              </h1>

              <p className="hero-subtitle text-lg sm:text-xl text-gray-600 mb-8 max-w-xl mx-auto lg:mx-0">
                自动调研 · 深度评测 · 帮你找到最适合的求职助手。
                让AI为你的求职之旅加速。
              </p>

              {/* Search Box */}
              <form onSubmit={handleSearch} className="hero-cta mb-6">
                <div className="flex gap-2 max-w-md mx-auto lg:mx-0">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <Input
                      type="text"
                      placeholder="输入AI工具名称..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10 h-12 bg-white border-0 shadow-lg focus:ring-2 focus:ring-[#7e43ff]"
                    />
                  </div>
                  <Button
                    type="submit"
                    className="h-12 px-6 bg-[#7e43ff] hover:bg-[#6527ec] text-white shadow-lg hover:shadow-xl transition-all"
                  >
                    搜索
                  </Button>
                </div>
              </form>

              {/* Random Pick Button */}
              <div className="hero-cta flex flex-wrap gap-4 justify-center lg:justify-start">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleRandomPick}
                  className="h-12 px-6 border-2 border-[#7e43ff] text-[#7e43ff] hover:bg-[#7e43ff] hover:text-white transition-all"
                >
                  <Shuffle className="w-5 h-5 mr-2" />
                  随机推荐
                </Button>
                <Link to="/browse">
                  <Button
                    variant="ghost"
                    className="h-12 px-6 text-gray-600 hover:text-gray-900"
                  >
                    查看全部工具
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </Button>
                </Link>
              </div>

              {/* Random Tool Result */}
              {randomTool && (
                <div className="mt-6 p-4 bg-white rounded-xl shadow-lg animate-fade-in-up">
                  <div className="flex items-center gap-4">
                    <img
                      src={randomTool.logoUrl}
                      alt={randomTool.name}
                      className="w-12 h-12 rounded-lg"
                    />
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900">{randomTool.chineseName}</h3>
                      <p className="text-sm text-gray-500">{randomTool.tagline}</p>
                    </div>
                    <Link to={`/tool/${randomTool.slug}`}>
                      <Button size="sm" className="bg-[#7e43ff] hover:bg-[#6527ec]">
                        查看
                      </Button>
                    </Link>
                  </div>
                </div>
              )}
            </div>

            {/* Right Content - Hero Image */}
            <div className="hidden lg:block relative">
              <div className="relative">
                {/* Main Image Card */}
                <div className="relative bg-white rounded-3xl shadow-2xl p-6 transform rotate-3 hover:rotate-0 transition-transform duration-500">
                  <div className="aspect-[4/3] bg-gradient-to-br from-[#7e43ff]/10 to-[#4361ee]/10 rounded-2xl flex items-center justify-center">
                    <div className="text-center">
                      <div className="w-24 h-24 mx-auto mb-4 bg-gradient-to-br from-[#7e43ff] to-[#6527ec] rounded-2xl flex items-center justify-center shadow-lg">
                        <Zap className="w-12 h-12 text-white" />
                      </div>
                      <p className="text-lg font-semibold text-gray-800">智能求职助手</p>
                      <p className="text-sm text-gray-500">AI驱动的求职工具聚合平台</p>
                    </div>
                  </div>

                  {/* Floating Cards */}
                  <div className="absolute -top-6 -right-6 bg-white rounded-xl shadow-lg p-4 animate-gentle-float">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                        <TrendingUp className="w-5 h-5 text-green-600" />
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">成功率提升</p>
                        <p className="text-lg font-bold text-gray-900">+85%</p>
                      </div>
                    </div>
                  </div>

                  <div className="absolute -bottom-6 -left-6 bg-white rounded-xl shadow-lg p-4 animate-gentle-float" style={{ animationDelay: '2s' }}>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                        <Users className="w-5 h-5 text-[#7e43ff]" />
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">活跃用户</p>
                        <p className="text-lg font-bold text-gray-900">10K+</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section ref={statsRef} className="py-20 bg-gradient-to-r from-[#7e43ff] to-[#6527ec]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center text-white">
            <div className="stat-item">
              <p className="text-4xl sm:text-5xl font-bold mb-2">10K+</p>
              <p className="text-white/80">活跃用户</p>
            </div>
            <div className="stat-item">
              <p className="text-4xl sm:text-5xl font-bold mb-2">50+</p>
              <p className="text-white/80">AI工具</p>
            </div>
            <div className="stat-item">
              <p className="text-4xl sm:text-5xl font-bold mb-2">98%</p>
              <p className="text-white/80">满意度</p>
            </div>
            <div className="stat-item">
              <p className="text-4xl sm:text-5xl font-bold mb-2">24/7</p>
              <p className="text-white/80">AI支持</p>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Tools Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <span className="inline-block px-4 py-1 bg-[#f0e3ff] text-[#7e43ff] rounded-full text-sm font-medium mb-4">
              今日推荐
            </span>
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              精选求职AI工具
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              我们的AI每日自动调研，为你筛选出最优质的求职工具
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {featuredTools.map((tool, index) => (
              <ToolCard key={tool.id} tool={tool} index={index} />
            ))}
          </div>

          <div className="mt-12 text-center">
            <Link to="/browse">
              <Button
                size="lg"
                className="bg-[#7e43ff] hover:bg-[#6527ec] text-white px-8"
              >
                查看全部工具
                <ChevronRight className="w-5 h-5 ml-2" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-[#f8f1ff]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <span className="inline-block px-4 py-1 bg-white text-[#7e43ff] rounded-full text-sm font-medium mb-4">
              功能特性
            </span>
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              让求职更智能的 AI 技术
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              我们的平台采用先进的人工智能技术，简化求职流程的每一个环节
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <FeatureCard
              icon={<Search className="w-8 h-8 text-white" />}
              title="AI 职位匹配"
              description="智能算法分析你的技能和经验，匹配最适合的职位机会。"
              color="from-[#7e43ff] to-[#6527ec]"
              delay={0}
            />
            <FeatureCard
              icon={<Zap className="w-8 h-8 text-white" />}
              title="简历优化"
              description="AI 驱动的简历分析，提供个性化改进建议，提升通过率。"
              color="from-[#4361ee] to-[#3a4fd1]"
              delay={0.1}
            />
            <FeatureCard
              icon={<Users className="w-8 h-8 text-white" />}
              title="面试准备"
              description="模拟面试场景，AI 反馈帮助你自信应对真实面试。"
              color="from-[#2ecc71] to-[#27ae60]"
              delay={0.2}
            />
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-gradient-to-br from-[#1a1a2e] to-[#16213e] relative overflow-hidden">
        {/* Background Effects */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-[#7e43ff]/20 rounded-full blur-3xl" />
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-[#4361ee]/20 rounded-full blur-3xl" />
        </div>

        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-6">
            准备好找到你的理想工作了吗？
          </h2>
          <p className="text-lg sm:text-xl text-gray-300 mb-10 max-w-2xl mx-auto">
            加入 10,000+ 求职者，让 AI 为你的求职之旅加速
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <Link to="/browse">
              <Button
                size="lg"
                className="bg-[#7e43ff] hover:bg-[#6527ec] text-white px-8 h-14 text-lg animate-breathe"
              >
                免费开始
              </Button>
            </Link>
            <Button
              size="lg"
              variant="outline"
              className="border-2 border-white/30 text-white hover:bg-white/10 px-8 h-14 text-lg"
            >
              了解更多
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
};

// Helper Components
const SparklesIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M9.937 15.5A2 2 0 0 0 8.5 14.063l-6.135-1.582a.5.5 0 0 1 0-.962L8.5 9.936A2 2 0 0 0 9.937 8.5l1.582-6.135a.5.5 0 0 1 .962 0L14.063 8.5A2 2 0 0 0 15.5 9.937l6.135 1.581a.5.5 0 0 1 0 .962L15.5 14.063a2 2 0 0 0-1.437 1.437l-1.582 6.135a.5.5 0 0 1-.962 0z" />
  </svg>
);

const ToolCard = ({ tool, index }: { tool: AITool; index: number }) => {
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from(cardRef.current, {
        scrollTrigger: {
          trigger: cardRef.current,
          start: 'top 85%',
          toggleActions: 'play none none none'
        },
        y: 50,
        opacity: 0,
        duration: 0.6,
        delay: index * 0.15,
        ease: 'power3.out'
      });
    });

    return () => ctx.revert();
  }, [index]);

  return (
    <div
      ref={cardRef}
      className="group bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 overflow-hidden card-hover"
    >
      <div className="p-6">
        <div className="flex items-start gap-4 mb-4">
          <img
            src={tool.logoUrl}
            alt={tool.name}
            className="w-14 h-14 rounded-xl shadow-md group-hover:scale-110 transition-transform duration-300"
          />
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="font-bold text-gray-900">{tool.chineseName}</h3>
              {tool.isFeatured && (
                <Badge className="bg-[#7e43ff]/10 text-[#7e43ff] text-xs">
                  精选
                </Badge>
              )}
            </div>
            <p className="text-sm text-gray-500">{tool.name}</p>
          </div>
        </div>

        <p className="text-gray-600 mb-4 line-clamp-2">{tool.tagline}</p>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="inline-flex items-center gap-1 text-sm text-gray-500">
              <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
              {tool.rating}
            </span>
            <span className="text-sm text-gray-400">
              {tool.viewCount.toLocaleString()} 浏览
            </span>
          </div>
          <Badge variant="secondary" className="text-xs">
            {categoryLabels[tool.category]}
          </Badge>
        </div>
      </div>

      <div className="px-6 pb-6">
        <Link to={`/tool/${tool.slug}`}>
          <Button className="w-full bg-[#7e43ff] hover:bg-[#6527ec] text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            查看详情
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </Link>
      </div>
    </div>
  );
};

const FeatureCard = ({ icon, title, description, color, delay }: {
  icon: React.ReactNode;
  title: string;
  description: string;
  color: string;
  delay: number;
}) => {
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from(cardRef.current, {
        scrollTrigger: {
          trigger: cardRef.current,
          start: 'top 85%',
          toggleActions: 'play none none none'
        },
        y: 40,
        opacity: 0,
        duration: 0.6,
        delay,
        ease: 'power3.out'
      });
    });

    return () => ctx.revert();
  }, [delay]);

  return (
    <div
      ref={cardRef}
      className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-500 card-hover"
    >
      <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${color} flex items-center justify-center mb-6 shadow-lg`}>
        {icon}
      </div>
      <h3 className="text-xl font-bold text-gray-900 mb-3">{title}</h3>
      <p className="text-gray-600 leading-relaxed">{description}</p>
    </div>
  );
};

export default Home;
