import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  FileText,
  Settings,
  LogOut,
  Plus,
  Edit,
  Trash2,
  Eye,
  CheckCircle,
  Clock,
  Search,
  Filter,
  Sparkles,
  BarChart3,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { mockTools, categoryLabels } from '@/data/mockData';
import type { AITool } from '@/types';

const Admin = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [tools] = useState<AITool[]>(mockTools);
  const [searchQuery, setSearchQuery] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    // Check authentication
    const token = localStorage.getItem('adminToken');
    if (!token) {
      navigate('/admin/login');
    } else {
      setIsAuthenticated(true);
    }
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    toast.success('已退出登录');
    navigate('/admin/login');
  };

  const filteredTools = tools.filter(
    (tool) =>
      tool.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tool.chineseName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const draftTools = filteredTools.filter((tool) => tool.status === 'draft');
  const publishedTools = filteredTools.filter((tool) => tool.status === 'published');
  const archivedTools = filteredTools.filter((tool) => tool.status === 'archived');

  const stats = {
    total: tools.length,
    published: tools.filter((t) => t.status === 'published').length,
    draft: tools.filter((t) => t.status === 'draft').length,
    views: tools.reduce((acc, t) => acc + t.viewCount, 0),
  };

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-20">
      <div className="flex">
        {/* Sidebar */}
        <aside className="w-64 bg-white border-r border-gray-200 min-h-[calc(100vh-80px)] fixed left-0 top-20">
          <div className="p-4">
            <div className="flex items-center gap-3 mb-8 px-2">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#7e43ff] to-[#6527ec] flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="font-semibold text-gray-900">管理后台</p>
                <p className="text-xs text-gray-500">JobAI Scout</p>
              </div>
            </div>

            <nav className="space-y-1">
              <SidebarItem
                icon={<LayoutDashboard className="w-5 h-5" />}
                label="概览"
                active={activeTab === 'dashboard'}
                onClick={() => setActiveTab('dashboard')}
              />
              <SidebarItem
                icon={<FileText className="w-5 h-5" />}
                label="内容管理"
                active={activeTab === 'content'}
                onClick={() => setActiveTab('content')}
              />
              <SidebarItem
                icon={<Settings className="w-5 h-5" />}
                label="设置"
                active={activeTab === 'settings'}
                onClick={() => setActiveTab('settings')}
              />
            </nav>
          </div>

          <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-200">
            <button
              onClick={handleLogout}
              className="flex items-center gap-3 px-3 py-2 w-full text-left text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            >
              <LogOut className="w-5 h-5" />
              退出登录
            </button>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 ml-64 p-8">
          {activeTab === 'dashboard' && (
            <div className="space-y-8">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">概览</h1>
                <p className="text-gray-600">欢迎回来，查看今日数据概况</p>
              </div>

              {/* Stats Grid */}
              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard
                  icon={<FileText className="w-6 h-6 text-white" />}
                  title="总工具数"
                  value={stats.total}
                  color="bg-[#7e43ff]"
                />
                <StatCard
                  icon={<CheckCircle className="w-6 h-6 text-white" />}
                  title="已发布"
                  value={stats.published}
                  color="bg-green-500"
                />
                <StatCard
                  icon={<Clock className="w-6 h-6 text-white" />}
                  title="待审核"
                  value={stats.draft}
                  color="bg-yellow-500"
                />
                <StatCard
                  icon={<BarChart3 className="w-6 h-6 text-white" />}
                  title="总浏览量"
                  value={stats.views.toLocaleString()}
                  color="bg-blue-500"
                />
              </div>

              {/* Recent Activity */}
              <Card>
                <CardHeader>
                  <CardTitle>最近活动</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <ActivityItem
                      icon={<Plus className="w-4 h-4" />}
                      text='新工具 "ResumeAI Pro" 已添加'
                      time="2小时前"
                      color="text-green-500 bg-green-50"
                    />
                    <ActivityItem
                      icon={<CheckCircle className="w-4 h-4" />}
                      text='"InterviewMaster" 已发布'
                      time="5小时前"
                      color="text-blue-500 bg-blue-50"
                    />
                    <ActivityItem
                      icon={<Eye className="w-4 h-4" />}
                      text='"CareerPath AI" 获得 1,234 次浏览'
                      time="1天前"
                      color="text-purple-500 bg-purple-50"
                    />
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {activeTab === 'content' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">内容管理</h1>
                  <p className="text-gray-600">管理所有求职AI工具内容</p>
                </div>
                <Button className="bg-[#7e43ff] hover:bg-[#6527ec]">
                  <Plus className="w-4 h-4 mr-2" />
                  添加工具
                </Button>
              </div>

              {/* Search */}
              <div className="flex gap-4">
                <div className="relative flex-1 max-w-md">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <Input
                    type="text"
                    placeholder="搜索工具..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <Button variant="outline">
                  <Filter className="w-4 h-4 mr-2" />
                  筛选
                </Button>
              </div>

              {/* Tools Tabs */}
              <Tabs defaultValue="published">
                <TabsList>
                  <TabsTrigger value="published">
                    已发布 ({publishedTools.length})
                  </TabsTrigger>
                  <TabsTrigger value="draft">
                    待审核 ({draftTools.length})
                  </TabsTrigger>
                  <TabsTrigger value="archived">
                    已归档 ({archivedTools.length})
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="published" className="mt-6">
                  <ToolsTable tools={publishedTools} />
                </TabsContent>

                <TabsContent value="draft" className="mt-6">
                  <ToolsTable tools={draftTools} />
                </TabsContent>

                <TabsContent value="archived" className="mt-6">
                  <ToolsTable tools={archivedTools} />
                </TabsContent>
              </Tabs>
            </div>
          )}

          {activeTab === 'settings' && (
            <div className="space-y-6">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">设置</h1>
                <p className="text-gray-600">管理网站配置和API设置</p>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>API 配置</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid gap-2">
                    <label className="text-sm font-medium">Kimi API Key</label>
                    <Input type="password" value="sk-xxxxxxxxxxxxxxxx" readOnly />
                  </div>
                  <div className="grid gap-2">
                    <label className="text-sm font-medium">Webhook URL</label>
                    <Input type="text" placeholder="https://..." />
                  </div>
                  <Button className="bg-[#7e43ff] hover:bg-[#6527ec]">
                    保存设置
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>自动调研设置</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium">每日自动调研</p>
                      <p className="text-sm text-gray-500">每天上午8点自动采集新产品</p>
                    </div>
                    <Badge className="bg-green-500">已启用</Badge>
                  </div>
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium">邮件通知</p>
                      <p className="text-sm text-gray-500">新工具待审核时发送邮件</p>
                    </div>
                    <Badge className="bg-green-500">已启用</Badge>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

const SidebarItem = ({
  icon,
  label,
  active,
  onClick,
}: {
  icon: React.ReactNode;
  label: string;
  active: boolean;
  onClick: () => void;
}) => (
  <button
    onClick={onClick}
    className={`flex items-center gap-3 px-3 py-2 w-full text-left rounded-lg transition-colors ${
      active
        ? 'bg-[#7e43ff] text-white'
        : 'text-gray-600 hover:bg-gray-100'
    }`}
  >
    {icon}
    <span>{label}</span>
  </button>
);

const StatCard = ({
  icon,
  title,
  value,
  color,
}: {
  icon: React.ReactNode;
  title: string;
  value: string | number;
  color: string;
}) => (
  <Card>
    <CardContent className="p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-500 mb-1">{title}</p>
          <p className="text-3xl font-bold text-gray-900">{value}</p>
        </div>
        <div className={`w-12 h-12 rounded-xl ${color} flex items-center justify-center`}>
          {icon}
        </div>
      </div>
    </CardContent>
  </Card>
);

const ActivityItem = ({
  icon,
  text,
  time,
  color,
}: {
  icon: React.ReactNode;
  text: string;
  time: string;
  color: string;
}) => (
  <div className="flex items-center gap-4">
    <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${color}`}>
      {icon}
    </div>
    <div className="flex-1">
      <p className="text-gray-700">{text}</p>
      <p className="text-sm text-gray-400">{time}</p>
    </div>
  </div>
);

const ToolsTable = ({ tools }: { tools: AITool[] }) => (
  <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
    <table className="w-full">
      <thead className="bg-gray-50 border-b border-gray-200">
        <tr>
          <th className="px-6 py-4 text-left text-sm font-medium text-gray-500">工具</th>
          <th className="px-6 py-4 text-left text-sm font-medium text-gray-500">分类</th>
          <th className="px-6 py-4 text-left text-sm font-medium text-gray-500">评分</th>
          <th className="px-6 py-4 text-left text-sm font-medium text-gray-500">浏览</th>
          <th className="px-6 py-4 text-left text-sm font-medium text-gray-500">状态</th>
          <th className="px-6 py-4 text-right text-sm font-medium text-gray-500">操作</th>
        </tr>
      </thead>
      <tbody className="divide-y divide-gray-200">
        {tools.length > 0 ? (
          tools.map((tool) => (
            <tr key={tool.id} className="hover:bg-gray-50">
              <td className="px-6 py-4">
                <div className="flex items-center gap-3">
                  <img
                    src={tool.logoUrl}
                    alt={tool.name}
                    className="w-10 h-10 rounded-lg"
                  />
                  <div>
                    <p className="font-medium text-gray-900">{tool.chineseName}</p>
                    <p className="text-sm text-gray-500">{tool.name}</p>
                  </div>
                </div>
              </td>
              <td className="px-6 py-4">
                <Badge variant="secondary">{categoryLabels[tool.category]}</Badge>
              </td>
              <td className="px-6 py-4">
                <div className="flex items-center gap-1">
                  <span className="text-yellow-500">★</span>
                  <span>{tool.rating}</span>
                </div>
              </td>
              <td className="px-6 py-4 text-gray-600">
                {tool.viewCount.toLocaleString()}
              </td>
              <td className="px-6 py-4">
                <StatusBadge status={tool.status} />
              </td>
              <td className="px-6 py-4 text-right">
                <div className="flex items-center justify-end gap-2">
                  <button className="p-2 hover:bg-gray-100 rounded-lg text-gray-600">
                    <Eye className="w-4 h-4" />
                  </button>
                  <button className="p-2 hover:bg-gray-100 rounded-lg text-gray-600">
                    <Edit className="w-4 h-4" />
                  </button>
                  <button className="p-2 hover:bg-gray-100 rounded-lg text-red-600">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </td>
            </tr>
          ))
        ) : (
          <tr>
            <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
              暂无数据
            </td>
          </tr>
        )}
      </tbody>
    </table>
  </div>
);

const StatusBadge = ({ status }: { status: string }) => {
  const styles = {
    published: 'bg-green-100 text-green-700',
    draft: 'bg-yellow-100 text-yellow-700',
    archived: 'bg-gray-100 text-gray-700',
  };

  const labels = {
    published: '已发布',
    draft: '草稿',
    archived: '已归档',
  };

  return (
    <span className={`px-2 py-1 rounded-full text-xs font-medium ${styles[status as keyof typeof styles]}`}>
      {labels[status as keyof typeof labels]}
    </span>
  );
};

export default Admin;
