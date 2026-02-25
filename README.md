# JobAI Scout - 求职AI工具导航

一个聚合求职AI工具的导航平台，帮助求职者发现最适合的求职助手。

## 功能特性

- 🔍 **Kimi AI 智能搜索** - 使用 Kimi API 进行智能工具推荐
- 📊 **18+ 真实求职工具** - 包含国内外知名产品、GitHub 开源项目
- 🏷️ **分类筛选** - 按简历优化、面试模拟、职业规划、技能提升、职位匹配分类
- ⭐ **精选推荐** - 每日推荐优质工具
- 🌐 **国内外覆盖** - 支持国内外主流求职AI产品

## 技术栈

- 前端：React + TypeScript + Vite + Tailwind CSS + shadcn/ui
- 后端：Node.js + Express (代理 Kimi API)
- AI：Kimi API (Moonshot AI)

## 快速开始

### 1. 安装依赖

```bash
# 安装前端依赖
npm install

# 安装后端依赖
cd backend
npm install
```

### 2. 配置环境变量

前端配置：
```bash
cp .env.example .env
```
编辑 `.env`：
```env
VITE_API_URL=http://localhost:3001
```

后端配置：
```bash
cd backend
cp .env.example .env
```
编辑 `.env`：
```env
KIMI_API_KEY=your_kimi_api_key_here
PORT=3001
```

> 获取 Kimi API Key：https://platform.moonshot.cn/

### 3. 启动服务

启动后端（在 backend 目录）：
```bash
npm run dev
```

启动前端（在项目根目录）：
```bash
npm run dev
```

访问 http://localhost:5173 查看应用

## 数据说明

### 包含的真实产品（18款）

**简历优化类：**
- Jobscan - ATS简历扫描优化
- Rezi - AI简历生成器
- 超级简历 WonderCV - 国内智能简历
- 职徒简历 52cv - AI测评简历
- Resume Matcher (GitHub开源) - 开源简历匹配
- OpenResume (GitHub开源) - 开源简历生成器

**面试准备类：**
- interviewing.io - 匿名技术面试平台
- 牛客网 NowCoder - 笔试面试题库
- Yoodli - AI面试教练

**职业规划类：**
- Teal - 一站式求职管理平台
- 脉脉 - 职场社交社区
- 看准网 - 公司点评薪资查询

**技能提升类：**
- LeetCode 力扣 - 算法面试准备
- Pramp - 免费同伴模拟面试

**职位匹配类：**
- LazyApply - 自动求职投递
- Boss直聘 - 直接与老板谈
- 实习僧 - 大学生实习平台

**其他GitHub项目：**
- Ecoute - 实时面试助手

## 项目结构

```
├── src/                    # 前端源码
│   ├── components/         # 组件
│   ├── data/              # 数据（mockData.ts）
│   ├── pages/             # 页面
│   ├── types/             # 类型定义
│   └── ...
├── backend/               # 后端服务
│   ├── server.js          # 主服务
│   └── package.json
├── .env.example           # 环境变量示例
└── package.json
```

## Kimi AI 搜索功能

搜索功能现在支持两种方式：

1. **本地搜索** - 在已有的18款工具中搜索匹配
2. **Kimi AI 搜索** - 调用 Kimi API 智能推荐相关工具

当用户搜索时，系统会：
1. 先调用 Kimi API 获取智能推荐
2. 合并本地匹配结果
3. 去重展示

AI 推荐的工具会显示 "AI推荐" 标签，点击可直接访问官网。

## 注意事项

1. **API Key 安全** - 请勿将 `KIMI_API_KEY` 提交到代码仓库，使用 `.env` 文件管理
2. **后端必须启动** - 搜索功能依赖后端服务，请确保后端服务已启动
3. **网络访问** - 首次启动可能需要配置网络访问权限

## 许可证

MIT
