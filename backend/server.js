import express from 'express';
import cors from 'cors';
import fetch from 'node-fetch';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// 加载环境变量
dotenv.config();

// 导入服务
import { RedisService } from './services/redisService.js';
import { AliyunSMSService } from './services/smsService.js';
import { AuthService } from './services/authService.js';

// 初始化服务
const redisService = new RedisService();

// 初始化阿里云短信服务（如果有配置）
let smsService = null;
if (process.env.ALIYUN_ACCESS_KEY_ID && process.env.ALIYUN_ACCESS_KEY_SECRET) {
  smsService = new AliyunSMSService(
    process.env.ALIYUN_ACCESS_KEY_ID,
    process.env.ALIYUN_ACCESS_KEY_SECRET
  );
  console.log('[SMS] 阿里云短信服务已初始化');
} else {
  console.log('[SMS] 阿里云短信服务未配置，使用开发模式');
}

// 初始化认证服务
const authService = new AuthService(smsService, redisService);

// 获取当前目录
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 发现工具的数据文件路径
const DISCOVERED_TOOLS_FILE = path.join(__dirname, 'data', 'discovered-tools.json');
const SEARCH_INDEX_FILE = path.join(__dirname, 'data', 'search-index.json');

// 确保数据目录存在
if (!fs.existsSync(path.dirname(DISCOVERED_TOOLS_FILE))) {
  fs.mkdirSync(path.dirname(DISCOVERED_TOOLS_FILE), { recursive: true });
}

// 加载已发现的工具
function loadDiscoveredTools() {
  try {
    if (fs.existsSync(DISCOVERED_TOOLS_FILE)) {
      const data = fs.readFileSync(DISCOVERED_TOOLS_FILE, 'utf-8');
      return JSON.parse(data);
    }
  } catch (error) {
    console.error('加载发现工具失败:', error);
  }
  return [];
}

// 保存发现的工具
function saveDiscoveredTools(tools) {
  try {
    fs.writeFileSync(DISCOVERED_TOOLS_FILE, JSON.stringify(tools, null, 2), 'utf-8');
    return true;
  } catch (error) {
    console.error('保存发现工具失败:', error);
    return false;
  }
}

// 加载搜索索引
function loadSearchIndex() {
  try {
    if (fs.existsSync(SEARCH_INDEX_FILE)) {
      const data = fs.readFileSync(SEARCH_INDEX_FILE, 'utf-8');
      return JSON.parse(data);
    }
  } catch (error) {
    console.error('加载搜索索引失败:', error);
  }
  return {};
}

// 保存搜索索引
function saveSearchIndex(index) {
  try {
    fs.writeFileSync(SEARCH_INDEX_FILE, JSON.stringify(index, null, 2), 'utf-8');
    return true;
  } catch (error) {
    console.error('保存搜索索引失败:', error);
    return false;
  }
}

// 检查工具是否已存在
function isToolExists(tools, slug, website) {
  return tools.some(tool => 
    tool.slug === slug || 
    tool.website === website ||
    (tool.website && website && tool.website.replace(/\/$/, '') === website.replace(/\/$/, ''))
  );
}

// 生成唯一 ID
function generateId() {
  return `discovered-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

const app = express();
const PORT = process.env.PORT || 3001;

// 配置
const KIMI_API_KEY = process.env.KIMI_API_KEY || '';
const KIMI_API_URL = 'https://api.moonshot.cn/v1/chat/completions';

// 中间件
const corsOptions = {
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
};
app.use(cors(corsOptions));
app.use(express.json());

// 从 GitHub URL 提取 owner 和 repo
function parseGitHubUrl(url) {
  try {
    const match = url.match(/github\.com\/([^\/]+)\/([^\/]+)/);
    if (match) {
      return { owner: match[1], repo: match[2].replace(/\.git$/, '') };
    }
  } catch (e) {
    console.error('解析 GitHub URL 失败:', e);
  }
  return null;
}

// 缓存时间：24小时
const GITHUB_CACHE_TTL = 86400;

// 从 Redis 获取缓存的 GitHub stars
async function getCachedGitHubStars(owner, repo) {
  const cacheKey = `github:stars:${owner}:${repo}`;
  try {
    const cached = await redisService.get(cacheKey);
    if (cached) {
      console.log(`[GitHub] ✅ 缓存命中: ${owner}/${repo}`);
      return JSON.parse(cached);
    }
  } catch (e) {
    console.log(`[GitHub] 缓存读取失败: ${e.message}`);
  }
  return null;
}

// 保存 GitHub stars 到 Redis
async function setCachedGitHubStars(owner, repo, data) {
  const cacheKey = `github:stars:${owner}:${repo}`;
  try {
    await redisService.set(cacheKey, JSON.stringify(data), GITHUB_CACHE_TTL);
    console.log(`[GitHub] 💾 已缓存: ${owner}/${repo} (24h)`);
  } catch (e) {
    console.log(`[GitHub] 缓存保存失败: ${e.message}`);
  }
}

// 获取 GitHub 项目 stars（带缓存）
async function getGitHubStars(owner, repo) {
  // 1. 先查缓存
  const cached = await getCachedGitHubStars(owner, repo);
  if (cached) {
    return cached;
  }

  // 2. 缓存未命中，调用 GitHub API
  try {
    console.log(`[GitHub] 🌐 请求 API: ${owner}/${repo}`);
    const response = await fetch(`https://api.github.com/repos/${owner}/${repo}`, {
      headers: {
        'Accept': 'application/vnd.github.v3+json',
        'User-Agent': 'JobAI-Scout'
      }
    });
    
    if (!response.ok) {
      if (response.status === 404) {
        return { error: 'Repository not found', stars: null };
      }
      if (response.status === 403) {
        return { error: 'API rate limit exceeded', stars: null };
      }
      return { error: `GitHub API error: ${response.status}`, stars: null };
    }
    
    const data = await response.json();
    const result = {
      stars: data.stargazers_count,
      forks: data.forks_count,
      openIssues: data.open_issues_count,
      language: data.language,
      description: data.description,
      updatedAt: data.updated_at,
      createdAt: data.created_at,
      topics: data.topics || [],
      homepage: data.homepage,
      error: null
    };

    // 3. 存入缓存
    await setCachedGitHubStars(owner, repo, result);
    
    return result;
  } catch (error) {
    console.error('获取 GitHub stars 失败:', error);
    return { error: error.message, stars: null };
  }
}

// 获取 GitHub star history 图片 URL
function getStarHistoryImageUrl(owner, repo) {
  // 使用 star-history.com 的服务
  return `https://api.star-history.com/svg?repos=${owner}/${repo}&type=Date`;
}

// 验证链接是否可访问
async function validateUrl(url, timeout = 5000) {
  if (!url || url === '#' || !url.startsWith('http')) {
    return { valid: false, status: null, error: 'Invalid URL' };
  }
  
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);
    
    const response = await fetch(url, {
      method: 'HEAD',
      signal: controller.signal,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    });
    
    clearTimeout(timeoutId);
    
    // 2xx 和 3xx 状态码都认为链接有效
    const valid = response.status >= 200 && response.status < 400;
    return {
      valid,
      status: response.status,
      error: null
    };
  } catch (error) {
    // 尝试 GET 请求（有些网站不支持 HEAD）
    try {
      const response = await fetch(url, {
        method: 'GET',
        timeout: timeout,
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        }
      });
      
      const valid = response.status >= 200 && response.status < 400;
      return {
        valid,
        status: response.status,
        error: null
      };
    } catch (getError) {
      return {
        valid: false,
        status: null,
        error: getError.message
      };
    }
  }
}

// 健康检查
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    kimiConfigured: !!KIMI_API_KEY,
    kimiKeyPrefix: KIMI_API_KEY ? KIMI_API_KEY.substring(0, 10) + '...' : null,
    redisConnected: redisService.isConnected(),
    smsConfigured: !!smsService
  });
});

// ============ 用户认证 API ============

// 发送验证码
app.post('/api/auth/send-code', async (req, res) => {
  try {
    const { phone } = req.body;
    
    if (!phone) {
      return res.status(400).json({ success: false, message: '请提供手机号' });
    }
    
    const result = await authService.sendCode(phone);
    res.json(result);
  } catch (error) {
    console.error('发送验证码失败:', error);
    res.status(500).json({ success: false, message: '服务器错误' });
  }
});

// 验证码登录
app.post('/api/auth/login', async (req, res) => {
  try {
    const { phone, code } = req.body;
    
    if (!phone || !code) {
      return res.status(400).json({ success: false, message: '请提供手机号和验证码' });
    }
    
    const result = await authService.verifyCode(phone, code);
    res.json(result);
  } catch (error) {
    console.error('登录失败:', error);
    res.status(500).json({ success: false, message: '服务器错误' });
  }
});

// 退出登录
app.post('/api/auth/logout', async (req, res) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    if (token) {
      await authService.logout(token);
    }
    res.json({ success: true, message: '已退出登录' });
  } catch (error) {
    console.error('退出登录失败:', error);
    res.status(500).json({ success: false, message: '服务器错误' });
  }
});

// 获取当前用户信息
app.get('/api/auth/me', async (req, res) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    if (!token) {
      return res.status(401).json({ success: false, message: '未登录' });
    }
    
    const user = await authService.validateToken(token);
    if (!user) {
      return res.status(401).json({ success: false, message: '登录已过期' });
    }
    
    res.json({ success: true, user });
  } catch (error) {
    console.error('获取用户信息失败:', error);
    res.status(500).json({ success: false, message: '服务器错误' });
  }
});

// 测试 Kimi API 连接
app.get('/api/test-kimi', async (req, res) => {
  try {
    if (!KIMI_API_KEY) {
      return res.status(500).json({ error: 'Kimi API Key 未配置' });
    }

    const response = await fetch(KIMI_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${KIMI_API_KEY}`
      },
      body: JSON.stringify({
        model: 'kimi-k2.5',
        messages: [
          {
            role: 'user',
            content: '你好，请回复"Kimi API 连接成功"'
          }
        ],
        temperature: 0.3
      })
    });

    const data = await response.json();
    
    if (!response.ok) {
      return res.status(response.status).json({
        error: 'Kimi API 测试失败',
        status: response.status,
        response: data
      });
    }

    res.json({
      success: true,
      message: data.choices?.[0]?.message?.content,
      model: data.model
    });
  } catch (error) {
    res.status(500).json({
      error: '测试出错',
      message: error.message
    });
  }
});

// 验证单个链接
app.post('/api/validate-url', async (req, res) => {
  const { url } = req.body;
  
  if (!url) {
    return res.status(400).json({ error: 'URL 不能为空' });
  }
  
  const result = await validateUrl(url);
  res.json({ url, ...result });
});

// 获取 GitHub 项目信息
app.post('/api/github-info', async (req, res) => {
  const { url } = req.body;
  
  if (!url) {
    return res.status(400).json({ error: 'URL 不能为空' });
  }
  
  const parsed = parseGitHubUrl(url);
  if (!parsed) {
    return res.status(400).json({ error: '无效的 GitHub URL' });
  }
  
  const { owner, repo } = parsed;
  console.log(`🔍 获取 GitHub 信息: ${owner}/${repo}`);
  
  const githubInfo = await getGitHubStars(owner, repo);
  
  res.json({
    owner,
    repo,
    url: `https://github.com/${owner}/${repo}`,
    starHistoryUrl: getStarHistoryImageUrl(owner, repo),
    ...githubInfo
  });
});

// 批量更新发现库中 GitHub 项目的 stars
app.post('/api/update-github-stars', async (req, res) => {
  try {
    const tools = loadDiscoveredTools();
    const githubTools = tools.filter(t => {
      const source = t.source?.toLowerCase() || '';
      const website = t.website || '';
      return source === 'github' || website.includes('github.com');
    });
    
    console.log(`🔄 开始更新 ${githubTools.length} 个 GitHub 项目的 stars...`);
    
    let updatedCount = 0;
    const updatedTools = [...tools];
    
    for (const tool of githubTools) {
      const parsed = parseGitHubUrl(tool.website);
      if (!parsed) continue;
      
      const { owner, repo } = parsed;
      const info = await getGitHubStars(owner, repo);
      
      if (!info.error && info.stars !== null) {
        const index = updatedTools.findIndex(t => t.id === tool.id);
        if (index !== -1) {
          updatedTools[index] = {
            ...updatedTools[index],
            githubStars: info.stars,
            githubForks: info.forks,
            githubLanguage: info.language,
            githubTopics: info.topics,
            githubUpdatedAt: info.updatedAt,
            starHistoryUrl: getStarHistoryImageUrl(owner, repo),
            starsUpdatedAt: new Date().toISOString()
          };
          updatedCount++;
          console.log(`  ✓ ${owner}/${repo}: ${info.stars} stars`);
        }
      }
      
      // 添加延迟避免触发 GitHub API 限制
      await new Promise(resolve => setTimeout(resolve, 500));
    }
    
    // 保存更新后的数据
    saveDiscoveredTools(updatedTools);
    
    res.json({
      success: true,
      updated: updatedCount,
      total: githubTools.length
    });
    
  } catch (error) {
    console.error('更新 GitHub stars 失败:', error);
    res.status(500).json({ error: error.message });
  }
});

// Kimi 搜索 API
app.post('/api/search', async (req, res) => {
  try {
    const { query } = req.body;
    
    if (!query || !query.trim()) {
      return res.status(400).json({ error: '搜索词不能为空' });
    }

    if (!KIMI_API_KEY) {
      return res.status(500).json({ 
        error: 'Kimi API Key 未配置',
        message: '请在环境变量中设置 KIMI_API_KEY'
      });
    }

    console.log(`[Search] 查询: "${query}"`);

    // 统一的高质量 prompt - 让 Kimi 自己判断搜索类型
    const prompt = `分析搜索词："${query}"

请判断这是"具体产品名"还是"需求类别描述"，然后给出相应的搜索结果。

## 判断标准：
- **产品名**：特定的工具/产品名称（如 Jobright, Resume.io, ChatGPT, Notion, Kimi, Midjourney 等）
- **需求类别**：描述性的需求（如"简历优化工具"、"面试准备"、"AI求职助手"、"好用的求职网站"等）

## 如果是具体产品名：
- 专门搜索该产品的官方信息
- 返回 1-2 个结果（官网优先）
- 确保信息准确，官网链接真实有效

## 如果是需求类别：
- 推荐 3-5 个该类别下的优质求职AI工具
- 必须包含至少 1 个 GitHub 开源项目
- 来源多样化（开源+商业产品）

## 统一返回格式（JSON数组）：
[{
  "name": "产品英文名（简洁准确）",
  "chineseName": "产品中文名（自然的中文名称，如无则音译或保持英文）",
  "tagline": "一句话描述（15字以内，突出核心功能）",
  "description": "详细介绍（2-3句话，说明主要功能、适用场景、核心优势）",
  "category": "工具类别，必须是以下之一：resume(简历), interview(面试), career(职业规划), skill(技能提升), matching(职位匹配), other(其他)",
  "website": "官网URL或GitHub链接（必须真实可访问）",
  "source": "来源类型，必须是以下之一：github(开源), website(官网), app(应用商店), extension(浏览器插件), producthunt(ProductHunt)"
}]

## 严格要求：
1. 只返回真实存在的产品，不要编造
2. 所有 URL 必须有效（官网优先，GitHub 其次）
3. 产品名要准确，不要混淆相似产品
4. 只返回 JSON 数组，不要其他文字说明
5. 确保 JSON 格式完整正确`;

    const response = await fetch(KIMI_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${KIMI_API_KEY}`
      },
      body: JSON.stringify({
        model: 'kimi-k2.5',
        messages: [
          {
            role: 'system',
            content: '你是专业的求职AI工具搜索专家。你熟悉 GitHub 开源项目、Product Hunt 热门产品、各类求职网站和 App。你只推荐真实存在的产品，严格遵循 JSON 格式要求，不要返回任何解释性文字。'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.2,
        max_tokens: 4000
      })
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error('[Search] Kimi API Error:', errorData);
      return res.status(response.status).json({ 
        error: 'Kimi API 调用失败',
        details: errorData
      });
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || '';
    
    console.log('[Search] Kimi 响应:', content.substring(0, 200));
    
    // 尝试解析JSON
    let searchResults = [];
    try {
      // 1. 先清理内容：去掉 markdown 代码块标记
      let cleanedContent = content
        .replace(/```json\s*/g, '')
        .replace(/```\s*$/g, '')
        .replace(/```/g, '')
        .trim();
      
      // 2. 尝试直接解析
      try {
        searchResults = JSON.parse(cleanedContent);
      } catch {
        // 3. 提取JSON数组部分
        const jsonMatch = cleanedContent.match(/\[[\s\S]*?\]/);
        if (jsonMatch) {
          searchResults = JSON.parse(jsonMatch[0]);
        }
      }
      
      // 确保结果是数组
      if (!Array.isArray(searchResults)) {
        console.error('Result is not array:', searchResults);
        searchResults = [];
      }
    } catch (e) {
      console.error('JSON Parse Error:', e.message);
      console.error('Raw content:', content.substring(0, 500));
    }

    // 补充 slug 字段（如果缺失）
    const enrichedResults = searchResults.map(tool => ({
      ...tool,
      slug: tool.slug || tool.name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
    }));

    console.log(`[Search] 返回 ${enrichedResults.length} 个结果`);

    res.json({
      query,
      count: enrichedResults.length,
      results: enrichedResults
    });

  } catch (error) {
    console.error('Search Error:', error);
    res.status(500).json({ 
      error: '搜索服务出错',
      message: error.message 
    });
  }
});

// 获取已发现的工具
app.get('/api/discovered-tools', (req, res) => {
  const tools = loadDiscoveredTools();
  res.json({ 
    count: tools.length,
    tools 
  });
});

// 保存新发现的工具
app.post('/api/save-tools', (req, res) => {
  try {
    const { tools, searchQuery } = req.body;
    
    if (!Array.isArray(tools) || tools.length === 0) {
      return res.status(400).json({ error: '工具数据不能为空' });
    }
    
    const existingTools = loadDiscoveredTools();
    const searchIndex = loadSearchIndex();
    let addedCount = 0;
    const newTools = [];
    
    for (const tool of tools) {
      // 检查是否已存在
      if (isToolExists(existingTools, tool.slug, tool.website)) {
        console.log(`工具已存在，跳过: ${tool.name}`);
        continue;
      }
      
      // 添加元数据
      const newTool = {
        ...tool,
        id: generateId(),
        discoveredAt: new Date().toISOString(),
        discoveredFrom: searchQuery || 'unknown',
        viewCount: 0,
        isFeatured: false
      };
      
      existingTools.push(newTool);
      newTools.push(newTool);
      addedCount++;
      
      // 更新搜索索引
      const keywords = [searchQuery, tool.category, tool.source].filter(Boolean);
      for (const keyword of keywords) {
        if (!searchIndex[keyword]) {
          searchIndex[keyword] = [];
        }
        if (!searchIndex[keyword].includes(newTool.id)) {
          searchIndex[keyword].push(newTool.id);
        }
      }
    }
    
    // 保存到文件
    if (addedCount > 0) {
      saveDiscoveredTools(existingTools);
      saveSearchIndex(searchIndex);
      console.log(`✅ 成功保存 ${addedCount} 个新工具，当前共 ${existingTools.length} 个`);
    }
    
    res.json({
      success: true,
      added: addedCount,
      total: existingTools.length,
      newTools
    });
    
  } catch (error) {
    console.error('保存工具失败:', error);
    res.status(500).json({ 
      error: '保存失败',
      message: error.message 
    });
  }
});

// 调研报告数据文件路径
const RESEARCH_DIR = path.join(__dirname, 'data', 'research');
if (!fs.existsSync(RESEARCH_DIR)) {
  fs.mkdirSync(RESEARCH_DIR, { recursive: true });
}

// 调研任务队列
const researchTasks = new Map();

// 生成任务ID
function generateTaskId() {
  return `task-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

// 保存任务状态
function saveTaskStatus(taskId, status) {
  try {
    const taskPath = path.join(RESEARCH_DIR, `tasks.json`);
    let tasks = {};
    if (fs.existsSync(taskPath)) {
      tasks = JSON.parse(fs.readFileSync(taskPath, 'utf-8'));
    }
    tasks[taskId] = { ...status, updatedAt: new Date().toISOString() };
    fs.writeFileSync(taskPath, JSON.stringify(tasks, null, 2), 'utf-8');
  } catch (error) {
    console.error('保存任务状态失败:', error);
  }
}

// 获取任务状态
function getTaskStatus(taskId) {
  try {
    const taskPath = path.join(RESEARCH_DIR, `tasks.json`);
    if (fs.existsSync(taskPath)) {
      const tasks = JSON.parse(fs.readFileSync(taskPath, 'utf-8'));
      return tasks[taskId] || null;
    }
  } catch (error) {
    console.error('获取任务状态失败:', error);
  }
  return null;
}

// 后台执行调研任务
async function executeResearchTask(taskId, tool) {
  console.log(`🔍 [任务 ${taskId}] 开始调研: ${tool.name}`);
  
  saveTaskStatus(taskId, {
    status: 'processing',
    progress: 10,
    message: '正在分析产品信息...',
    toolId: tool.id,
    toolName: tool.name
  });

  try {
    // 【求职AI产品调研专家模式】集成领导调研框架
    const prompt = `【求职AI产品调研专家模式】对以下求职AI产品进行深度市场调研分析。

参考分析框架（来自顶级风投调研方法论）：
1. 痛点-阶段映射：每个痛点对应求职具体阶段（准备期→前期→中期→后期）
2. How深挖：不是泛泛而谈，而是具体到产品"怎么解决"（如"AI提取技能点反向匹配"）
3. 数据驱动：每个结论要有ARR、用户量、增长数据支撑，标注数据来源
4. 国内外兼顾：海外产品（Jobright, Teal等）+ 国内产品（BOSS直聘, 超级简历等）
5. 突出最大痛点：识别影响求职周期的核心痛点

=== 产品基础信息 ===
- 名称：${tool.name}
- 中文名：${tool.chineseName || tool.name}
- 一句话描述：${tool.tagline || ''}
- 详细介绍：${tool.description || ''}
- 官网：${tool.website || ''}
- 产品类别：${tool.category || '未知'}
- 来源类型：${tool.source || 'unknown'}
${tool.githubStars ? `- GitHub Stars：${tool.githubStars}` : ''}

=== 分析框架要求 ===

1. **求职阶段定位**
   - 该产品主要解决哪个求职阶段的问题？
   - 准备期（职业规划/技能评估）/ 前期（简历/投递）/ 中期（面试/沟通）/ 后期（offer选择/入职）

2. **痛点-解决方案闭环（深挖How）**
   - 不是简单说"帮助改简历"，而是具体到"怎么改"
   - 例如："通过ATS关键词匹配，高亮显示JD关键词，逐条重写经历描述直到匹配度达标"

3. **数据驱动分析**
   - ARR（年经常性收入）或营收估算
   - 用户量（DAU/MAU/总用户数）
   - 增长情况（流量增长、融资情况）
   - 数据来源：财报、TechCrunch、Similarweb等

4. **竞品对标（国内外）**
   - 直接竞品（同赛道）：海外+国内各1-2个
   - 间接竞品（替代方案）
   - 差异化优势（护城河）

5. **最大痛点识别**
   - 该产品解决的是否是求职流程中的核心痛点？
   - 对求职周期的影响程度（参考：面试率低可影响27.5天）

=== 报告输出格式（JSON） ===

{
  "summary": "执行摘要：产品一句话定位 + 核心价值 + 主要结论（150字）",
  
  "jobSearchStage": {
    "primaryStage": "主要求职阶段（准备期/前期/中期/后期）",
    "stageDescription": "该阶段求职者的典型状态和需求（100字）",
    "painPoint": "该阶段核心痛点：具体描述用户遇到的困难（150字）"
  },
  
  "solutionHow": {
    "coreMechanism": "核心解决机制：具体怎么解决的，避免泛泛而谈（200-300字）",
    "keyFeatures": ["关键功能1：具体描述", "关键功能2：具体描述", "关键功能3：具体描述"],
    "userJourney": "典型用户使用路径：从接触到解决问题的完整流程（150字）"
  },
  
  "dataMetrics": {
    "arr": "ARR或营收估算，如'ARR超数百万美元'或'年营收约8.3亿美元'",
    "userBase": "用户量数据，如'MAU 4290万'或'用户量超100万'",
    "growth": "增长情况，如'24年流量爆发式增长'或'23年完成1100万美元融资'",
    "dataSources": ["数据来源1：如'TechCrunch融资报道'", "数据来源2：如'企业2023财报'"]
  },
  
  "competitiveLandscape": {
    "directCompetitors": [
      {
        "name": "竞品名称（海外）",
        "region": "海外",
        "solution": "如何解决同样痛点（100字）",
        "metrics": "关键数据"
      },
      {
        "name": "竞品名称（国内）",
        "region": "国内",
        "solution": "如何解决同样痛点（100字）",
        "metrics": "关键数据"
      }
    ],
    "differentiation": "与竞品的核心差异点（200字）",
    "moat": "护城河分析：为什么用户选择它而不是竞品（150字）"
  },
  
  "painPointSeverity": {
    "isCorePain": true,
    "severityLevel": "高/中/低",
    "impactDescription": "对求职周期的影响程度，如'影响27.5天，是最大差异痛点'（150字）",
    "frequency": "该痛点出现频率：求职过程中多少人会遇到"
  },
  
  "founderBackground": "创始人及团队背景（200字）：关键人物履历、之前的工作、教育背景",
  
  "targetUsers": "目标用户画像（200-300字）：人口统计、职业特征、行为特征、用户分层",
  
  "problemSolved": [
    "问题1：详细描述该问题场景，50-80字",
    "问题2：用户在此场景下的具体痛点",
    "问题3：现有解决方案的不足",
    "问题4：该问题的频率和重要性",
    "问题5：未被满足的需求点"
  ],
  
  "userValue": "用户价值主张深度分析（200-300字）：核心价值、差异化优势、ROI分析",
  
  "howToUse": [
    "步骤1：注册/上手流程，详细说明首次使用体验",
    "步骤2：核心功能使用路径",
    "步骤3：高级功能解锁",
    "步骤4：与其他工具集成",
    "步骤5：数据导出/迁移"
  ],
  
  "useCases": [
    {
      "title": "场景标题",
      "scenario": "详细场景描述（100-150字）：谁在什么情况下使用",
      "result": "具体成果和价值（100-150字）：量化收益或定性改善"
    }
  ],
  
  "commercialization": {
    "pricingModel": "定价模式：免费增值/订阅/按量付费等",
    "pricingTiers": [{"name": "版本", "price": "价格", "features": ["功能1"]}],
    "revenueStreams": ["收入来源1", "收入来源2"],
    "fundingStatus": "融资情况：轮次、金额、投资方"
  },
  
  "marketAnalysis": {
    "marketSize": "TAM/SAM/SOM市场规模",
    "marketGrowth": "市场增长率及驱动因素",
    "targetMarket": "目标市场细分及选择逻辑",
    "marketTrends": ["趋势1：如'AI大模型降低简历修改门槛'", "趋势2：如'远程办公改变求职地域限制'"],
    "opportunities": ["机会1", "机会2"],
    "threats": ["威胁1", "威胁2"]
  },
  
  "competitiveAnalysis": {
    "directCompetitors": [
      {
        "name": "竞品名称",
        "description": "竞品定位和产品特点",
        "strengths": ["核心优势1", "核心优势2"],
        "weaknesses": ["明显劣势1", "明显劣势2"]
      }
    ],
    "indirectCompetitors": [{"name": "间接竞品", "description": "替代方案"}],
    "competitiveAdvantages": ["优势1：独特价值", "优势2：技术壁垒", "优势3：资源优势"],
    "competitiveDisadvantages": ["劣势1：相对于竞品的不足", "劣势2：资源短板"],
    "marketPosition": "市场定位分析"
  },
  
  "userFeedback": {
    "satisfactionScore": 8.0,
    "positivePoints": ["好评点1：具体功能让用户满意", "好评点2：相比竞品的明显优势"],
    "negativePoints": ["抱怨点1：功能缺陷", "抱怨点2：体验问题"],
    "commonComplaints": ["常见投诉1：高频问题", "常见投诉2：影响体验的痛点"],
    "userRetention": "用户留存率分析及原因"
  },
  
  "strategicAdvice": {
    "viabilityScore": 8,
    "marketPotential": "市场潜力：高增长/稳定增长/红海",
    "recommendation": "战略建议（200-300字）：整体判断、关键成功要素、优先级建议",
    "keySuccessFactors": ["成功因素1", "成功因素2"],
    "risks": ["风险1", "风险2"],
    "opportunities": ["短期机会", "中长期战略机会"]
  }
}

=== 质量要求 ===
【调研维度完整】痛点→产品→解决方案→数据，形成闭环
【深挖How】解决方案具体到产品机制，不是泛泛而谈
【数据驱动】每个结论有数据支撑，标注来源
【阶段化思维】明确求职阶段，不同阶段痛点不同
【国内外兼顾】同时考虑海外和国内竞品
【突出痛点】识别是否是求职流程中的核心痛点
【字数要求】总字数不少于2000字，各字段充分展开
【格式要求】必须返回有效的JSON格式，所有字段必须存在`;

    saveTaskStatus(taskId, {
      status: 'processing',
      progress: 40,
      message: '正在调用 AI 分析...',
      toolId: tool.id,
      toolName: tool.name
    });

    const response = await fetch(KIMI_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${KIMI_API_KEY}`
      },
      body: JSON.stringify({
        model: 'kimi-k2.5',
        messages: [
          {
            role: 'system',
            content: '你是资深的产品市场研究专家，擅长进行深入的产品调研和竞争分析，为高层决策提供专业报告。'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 1,
        max_tokens: 200000
      })
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error(`[任务 ${taskId}] Kimi API 错误:`, response.status, errorData);
      throw new Error(`Kimi API 错误 (${response.status}): ${errorData.substring(0, 200)}`);
    }

    const data = await response.json();
    let content = data.choices?.[0]?.message?.content || '';
    
    console.log(`[任务 ${taskId}] Kimi 响应长度:`, content.length);
    
    // 检查是否被截断
    if (data.choices?.[0]?.finish_reason === 'length') {
      console.warn(`[任务 ${taskId}] 警告：响应被截断，尝试修复...`);
    }

    saveTaskStatus(taskId, {
      status: 'processing',
      progress: 80,
      message: '正在解析报告...',
      toolId: tool.id,
      toolName: tool.name
    });

    // 解析 JSON
    let researchData;
    try {
      // 清理内容
      let cleanedContent = content
        .replace(/```json\s*/g, '')
        .replace(/```\s*$/g, '')
        .replace(/```/g, '')
        .trim();
      
      // 尝试修复不完整的 JSON（如果被截断）
      if (!cleanedContent.endsWith('}')) {
        // 找到最后一个完整的对象
        const lastBrace = cleanedContent.lastIndexOf('}');
        if (lastBrace > 0) {
          cleanedContent = cleanedContent.substring(0, lastBrace + 1);
        }
        // 尝试补全 JSON
        if (!cleanedContent.endsWith('}')) {
          cleanedContent += '}';
        }
        // 检查括号是否匹配
        const openBraces = (cleanedContent.match(/\{/g) || []).length;
        const closeBraces = (cleanedContent.match(/\}/g) || []).length;
        while (closeBraces < openBraces) {
          cleanedContent += '}';
        }
      }
      
      researchData = JSON.parse(cleanedContent);
    } catch (e) {
      console.error(`[任务 ${taskId}] 解析失败:`, e);
      console.error(`[任务 ${taskId}] 原始内容前500字符:`, content.substring(0, 500));
      console.error(`[任务 ${taskId}] 原始内容后500字符:`, content.substring(content.length - 500));
      
      // 尝试提取关键信息创建简化报告
      console.log(`[任务 ${taskId}] 尝试创建简化报告...`);
      researchData = {
        summary: `关于 ${tool.name} 的调研报告（内容被截断，请重试）`,
        founderBackground: "由于内容长度限制，详细信息获取失败。建议直接访问官网了解。",
        problemSolved: ["信息获取失败"],
        userValue: "信息获取失败，请重试或查看官网",
        targetUsers: "信息获取失败",
        howToUse: ["访问官网了解详情"],
        useCases: [],
        commercialization: {
          pricingModel: "未知",
          pricingTiers: [],
          businessModel: "未知",
          revenueEstimate: "未知",
          fundingStatus: "未知"
        },
        marketAnalysis: {
          marketSize: "预估求职AI市场正在快速增长",
          marketGrowth: "预计年增长率超过30%",
          targetMarket: tool.category || "求职人群",
          marketTrends: ["AI辅助求职需求增长"],
          opportunities: ["市场处于早期阶段"],
          threats: ["竞争激烈"]
        },
        competitiveAnalysis: {
          directCompetitors: [],
          indirectCompetitors: [],
          competitiveAdvantages: ["需要进一步调研"],
          competitiveDisadvantages: ["需要进一步调研"],
          marketPosition: "需要进一步调研"
        },
        userFeedback: {
          satisfactionScore: 7,
          positivePoints: ["需要进一步调研"],
          negativePoints: ["需要进一步调研"],
          commonComplaints: [],
          userRetention: "未知"
        },
        strategicAdvice: {
          viabilityScore: 6,
          marketPotential: "市场潜力良好，但需要更详细调研",
          recommendation: "建议重新发起调研或人工深入研究",
          keySuccessFactors: ["产品质量", "用户体验", "市场推广"],
          risks: ["信息不完整"],
          opportunities: ["求职AI市场增长"]
        },
        _incomplete: true,
        _error: e.message
      };
    }
    
    // 构建完整的调研报告对象
    const research = {
      id: `research-${Date.now()}`,
      toolId: tool.id,
      toolName: tool.name,
      toolChineseName: tool.chineseName || tool.name,
      toolWebsite: tool.website || '',
      category: tool.category,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      ...researchData,
      rawResponse: content
    };
    
    // 保存调研报告
    saveResearch(tool.id, research);
    
    // 更新任务状态为完成
    saveTaskStatus(taskId, {
      status: 'completed',
      progress: 100,
      message: '调研完成',
      toolId: tool.id,
      toolName: tool.name,
      researchId: research.id
    });
    
    console.log(`✅ [任务 ${taskId}] 完成: ${tool.name}`);
    
    return research;
    
  } catch (error) {
    console.error(`[任务 ${taskId}] 失败:`, error);
    saveTaskStatus(taskId, {
      status: 'failed',
      progress: 0,
      message: error.message || '调研失败',
      toolId: tool.id,
      toolName: tool.name,
      error: error.message
    });
    return null;
  }
}

// 加载调研报告
function loadResearch(toolId) {
  try {
    const filePath = path.join(RESEARCH_DIR, `${toolId}.json`);
    if (fs.existsSync(filePath)) {
      const data = fs.readFileSync(filePath, 'utf-8');
      return JSON.parse(data);
    }
  } catch (error) {
    console.error('加载调研报告失败:', error);
  }
  return null;
}

// 保存调研报告
function saveResearch(toolId, research) {
  try {
    const filePath = path.join(RESEARCH_DIR, `${toolId}.json`);
    fs.writeFileSync(filePath, JSON.stringify(research, null, 2), 'utf-8');
    return true;
  } catch (error) {
    console.error('保存调研报告失败:', error);
    return false;
  }
}

// 获取所有调研报告列表
function loadAllResearch() {
  try {
    if (!fs.existsSync(RESEARCH_DIR)) return [];
    const files = fs.readdirSync(RESEARCH_DIR);
    const researchList = [];
    for (const file of files) {
      if (file.endsWith('.json')) {
        const data = fs.readFileSync(path.join(RESEARCH_DIR, file), 'utf-8');
        researchList.push(JSON.parse(data));
      }
    }
    return researchList.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  } catch (error) {
    console.error('加载所有调研报告失败:', error);
    return [];
  }
}

// 删除调研报告
app.delete('/api/research/:toolId', (req, res) => {
  try {
    const { toolId } = req.params;
    const researchPath = path.join(RESEARCH_DIR, `${toolId}.json`);
    
    if (fs.existsSync(researchPath)) {
      fs.unlinkSync(researchPath);
      console.log(`[API] 删除调研报告: ${toolId}`);
    }
    
    res.json({ success: true, message: '调研报告已删除' });
  } catch (error) {
    console.error('删除调研报告失败:', error);
    res.status(500).json({ error: '删除失败' });
  }
});

// 提交后台调研任务
app.post('/api/research-product', async (req, res) => {
  try {
    const { tool, force = false } = req.body;
    
    if (!tool || !tool.name) {
      return res.status(400).json({ error: '工具信息不能为空' });
    }
    
    // 检查是否已有调研报告（非强制模式）
    if (!force) {
      const existingResearch = loadResearch(tool.id);
      if (existingResearch) {
        return res.json({
          success: true,
          research: existingResearch,
          cached: true
        });
      }
    }
    
    // 检查是否已有进行中的任务
    const taskPath = path.join(RESEARCH_DIR, `tasks.json`);
    if (fs.existsSync(taskPath)) {
      const tasks = JSON.parse(fs.readFileSync(taskPath, 'utf-8'));
      const existingTask = Object.values(tasks).find(
        (t) => t.toolId === tool.id && t.status === 'processing'
      );
      if (existingTask) {
        return res.json({
          success: true,
          taskId: existingTask.taskId || Object.keys(tasks).find(k => tasks[k] === existingTask),
          status: 'processing',
          message: '该产品的调研任务已在进行中'
        });
      }
    }
    
    // 创建新任务
    const taskId = generateTaskId();
    
    // 立即返回任务ID
    res.json({
      success: true,
      taskId,
      status: 'queued',
      message: '调研任务已提交，将在后台执行'
    });
    
    // 在后台执行调研（不阻塞响应）
    setImmediate(async () => {
      await executeResearchTask(taskId, tool);
    });
    
  } catch (error) {
    console.error('提交调研任务失败:', error);
    res.status(500).json({ 
      error: '提交失败',
      message: error.message 
    });
  }
});

// 查询调研任务状态
app.get('/api/research-task/:taskId', (req, res) => {
  const { taskId } = req.params;
  const status = getTaskStatus(taskId);
  
  if (!status) {
    return res.status(404).json({ error: '任务不存在' });
  }
  
  // 如果任务完成，加载完整报告
  let research = null;
  if (status.status === 'completed' && status.toolId) {
    research = loadResearch(status.toolId);
  }
  
  res.json({
    success: true,
    taskId,
    status: status.status,
    progress: status.progress,
    message: status.message,
    research,
    error: status.error
  });
});

// 获取所有进行中的任务
app.get('/api/research-tasks', (req, res) => {
  try {
    const taskPath = path.join(RESEARCH_DIR, `tasks.json`);
    if (!fs.existsSync(taskPath)) {
      return res.json({ tasks: [] });
    }
    
    const tasks = JSON.parse(fs.readFileSync(taskPath, 'utf-8'));
    const activeTasks = Object.entries(tasks)
      .filter(([_, task]) => task.status === 'processing' || task.status === 'queued')
      .map(([taskId, task]) => ({ taskId, ...task }));
    
    res.json({
      success: true,
      tasks: activeTasks
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 获取产品调研报告
app.get('/api/research/:toolId', (req, res) => {
  const { toolId } = req.params;
  const research = loadResearch(toolId);
  
  if (!research) {
    return res.status(404).json({ error: '调研报告不存在' });
  }
  
  res.json({
    success: true,
    research
  });
});

// 获取所有调研报告
app.get('/api/research', (req, res) => {
  const researchList = loadAllResearch();
  res.json({
    success: true,
    count: researchList.length,
    researchList
  });
});

// 生成调研汇总报告
app.post('/api/research-summary', async (req, res) => {
  try {
    const researchList = loadAllResearch();
    
    if (researchList.length === 0) {
      return res.status(400).json({ error: '暂无调研报告，请先调研产品' });
    }
    
    // 构建详细的汇总分析数据（包含求职阶段、痛点等维度）
    const productsSummary = researchList.map(r => ({
      name: r.toolChineseName || r.toolName,
      category: r.category,
      summary: r.summary,
      // 求职阶段定位
      jobSearchStage: r.jobSearchStage || {
        primaryStage: '未知',
        painPoint: r.problemSolved?.[0] || '未知痛点'
      },
      // 解决方案深挖
      solutionHow: r.solutionHow || {
        coreMechanism: r.userValue || '未知机制',
        keyFeatures: r.howToUse || []
      },
      // 数据指标
      dataMetrics: r.dataMetrics || {
        arr: '未知',
        userBase: '未知',
        growth: '未知'
      },
      // 痛点严重程度
      painPointSeverity: r.painPointSeverity || {
        isCorePain: false,
        severityLevel: '中'
      },
      // 可行性分数
      viabilityScore: r.strategicAdvice?.viabilityScore || 5,
      marketPotential: r.strategicAdvice?.marketPotential || '未知'
    }));
    
    const prompt = `【战略汇总专家模式】基于以下求职AI产品的深度调研报告，生成一份面向公司高层的战略决策报告。

参考分析框架（来自顶级风投调研方法论）：
1. 按求职阶段分类：准备期→前期→中期→后期
2. 痛点-解决方案闭环：具体How，不是泛泛而谈
3. 数据驱动：ARR、用户量、增长数据
4. 识别最大痛点：对求职周期影响最大的痛点
5. 国内外市场对比：海外vs国内解决方案差异

已调研产品 (${researchList.length}个)：
${JSON.stringify(productsSummary, null, 2)}

请返回以下格式的JSON战略报告：

{
  "executiveSummary": "执行摘要：整体市场判断+核心结论+关键建议（200字）",
  
  "jobStageAnalysis": {
    "preparation": {
      "stage": "准备期",
      "painPoints": ["痛点1：具体描述", "痛点2：具体描述"],
      "products": [{"name": "产品名", "solution": "如何解决", "metrics": "关键数据"}],
      "keyInsight": "该阶段核心洞察（100字）"
    },
    "early": {
      "stage": "前期",
      "painPoints": ["简历优化", "薪资谈判", "海投效率"],
      "products": [{"name": "产品名", "solution": "如何解决", "metrics": "关键数据"}],
      "keyInsight": "该阶段核心洞察（100字）"
    },
    "mid": {
      "stage": "中期",
      "painPoints": ["面试准备", "沟通效率", "竞争红海"],
      "products": [{"name": "产品名", "solution": "如何解决", "metrics": "关键数据"}],
      "keyInsight": "该阶段核心洞察（100字）"
    },
    "late": {
      "stage": "后期",
      "painPoints": ["Offer选择", "入职准备"],
      "products": [],
      "keyInsight": "该阶段核心洞察（100字）"
    }
  },
  
  "biggestPainPoint": {
    "painPoint": "最大痛点名称",
    "impactDays": 27.5,
    "description": "为什么这是最大痛点，对求职周期的影响（150字）",
    "solutions": [{"product": "产品名", "effectiveness": "解决效果", "metrics": "数据支撑"}],
    "marketOpportunity": "该痛点的市场机会评估（100字）"
  },
  
  "domesticVsOverseas": {
    "overseasStrengths": ["海外产品优势1", "海外产品优势2"],
    "domesticStrengths": ["国内产品优势1", "国内产品优势2"],
    "gapAnalysis": "国内外市场差距分析（150字）",
    "opportunity": "国内市场机会点（100字）"
  },
  
  "keyInsights": ["关键洞察1：数据支撑", "关键洞察2：数据支撑", "关键洞察3：数据支撑"],
  
  "marketTrends": ["趋势1：具体描述+数据", "趋势2：具体描述+数据", "趋势3：具体描述+数据"],
  
  "hotCategories": [
    {
      "category": "类别名称",
      "productCount": 5,
      "avgSatisfaction": 8.2,
      "trend": "up",
      "keyInsight": "该类别的关键洞察",
      "topProduct": "代表产品名"
    }
  ],
  
  "topProducts": [
    {
      "name": "产品名称",
      "category": "类别",
      "stage": "求职阶段",
      "viabilityScore": 9,
      "marketPotential": "市场潜力描述",
      "keyStrength": "核心优势：具体How（100字）",
      "metrics": "ARR/用户量/增长数据"
    }
  ],
  
  "strategicRecommendations": [
    "战略建议1：具体可执行的动作",
    "战略建议2：具体可执行的动作", 
    "战略建议3：具体可执行的动作"
  ]
}

要求：
1. 按求职阶段分类展示，清晰呈现各阶段痛点和解决方案
2. 识别并突出最大痛点（参考影响27.5天的面试准备痛点）
3. 对比分析国内外产品差异
4. 每个结论都要有数据支撑
5. 给出具体可执行的战略建议
6. 面向CEO/产品总裁阅读，语言专业简洁`;

    const response = await fetch(KIMI_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${KIMI_API_KEY}`
      },
      body: JSON.stringify({
        model: 'kimi-k2.5',
        messages: [
          {
            role: 'system',
            content: '你是战略分析专家，擅长从大量产品调研中提炼关键洞察，为高层决策提供战略建议。'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.3
      })
    });

    if (!response.ok) {
      throw new Error('Kimi API 调用失败');
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || '';
    
    // 解析 JSON
    let summaryData;
    try {
      let cleanedContent = content
        .replace(/```json\s*/g, '')
        .replace(/```\s*$/g, '')
        .replace(/```/g, '')
        .trim();
      summaryData = JSON.parse(cleanedContent);
    } catch (e) {
      console.error('解析汇总报告失败:', e);
      return res.status(500).json({ error: '解析失败', raw: content });
    }
    
    const summary = {
      generatedAt: new Date().toISOString(),
      totalResearched: researchList.length,
      ...summaryData
    };
    
    // 保存汇总报告
    const summaryPath = path.join(RESEARCH_DIR, 'summary.json');
    fs.writeFileSync(summaryPath, JSON.stringify(summary, null, 2), 'utf-8');
    
    res.json({
      success: true,
      summary
    });
    
  } catch (error) {
    console.error('生成汇总报告失败:', error);
    res.status(500).json({ error: error.message });
  }
});

// 本地搜索（优先）
app.post('/api/local-search', (req, res) => {
  const { query } = req.body;
  
  if (!query || !query.trim()) {
    return res.status(400).json({ error: '搜索词不能为空' });
  }
  
  const discoveredTools = loadDiscoveredTools();
  const normalizedQuery = query.toLowerCase().trim();
  const queryWords = normalizedQuery.split(/\s+/).filter(w => w.length > 0);
  
  // 在发现的工具中搜索
  const results = discoveredTools.filter(tool => {
    const searchableText = `${tool.name} ${tool.chineseName} ${tool.tagline} ${tool.description} ${tool.category} ${tool.source}`.toLowerCase();
    return queryWords.some(word => searchableText.includes(word));
  });
  
  res.json({
    query,
    results,
    count: results.length
  });
});

// 检查链接是否曾经成功过
function hasLinkEverSucceeded(url) {
  const tools = loadDiscoveredTools();
  const tool = tools.find(t => 
    t.website === url || 
    t.website?.replace(/\/$/, '') === url.replace(/\/$/, '')
  );
  
  // 如果工具存在且有成功的记录（githubStars 或 linkStatus.valid）
  if (tool) {
    // 有过 stars 数据说明曾经成功过
    if (tool.githubStars !== undefined && tool.githubStars !== null) {
      return true;
    }
    // 有过验证成功的记录
    if (tool.linkStatus?.valid === true) {
      return true;
    }
    // 明确标记为从未成功过
    if (tool.githubNeverSucceeded === true) {
      return false;
    }
  }
  
  return false; // 默认认为从未成功过（新链接）
}

// 标记失效的 GitHub 链接
app.post('/api/mark-github-dead', async (req, res) => {
  try {
    const { url, checkAlternative = true } = req.body;
    
    if (!url) {
      return res.status(400).json({ error: 'URL 不能为空' });
    }
    
    // 检查是否曾经成功过
    const everSucceeded = hasLinkEverSucceeded(url);
    
    if (everSucceeded) {
      console.log(`⏭️ 跳过曾成功过的链接: ${url}`);
      return res.json({
        success: true,
        marked: 0,
        skipped: true,
        reason: '链接曾经成功过，可能是网络问题'
      });
    }
    
    const tools = loadDiscoveredTools();
    let markedCount = 0;
    let alternativeFound = null;
    
    // 找到失效的工具
    const deadTool = tools.find(t => 
      t.website === url || 
      t.website?.replace(/\/$/, '') === url.replace(/\/$/, '')
    );
    
    if (deadTool && checkAlternative) {
      // 寻找替代项目
      console.log(`🔍 为失效项目寻找替代: ${deadTool.name}`);
      alternativeFound = await findGitHubAlternative(deadTool);
      
      if (alternativeFound) {
        console.log(`✅ 找到替代项目: ${alternativeFound.name} (${alternativeFound.githubStars} stars)`);
      }
    }
    
    const updatedTools = tools.map(tool => {
      if (tool.website === url || tool.website?.replace(/\/$/, '') === url.replace(/\/$/, '')) {
        markedCount++;
        return {
          ...tool,
          githubDead: true,
          githubDeadMarkedAt: new Date().toISOString(),
          githubNeverSucceeded: true, // 标记为从未成功过
          replacedBy: alternativeFound ? alternativeFound.id : null
        };
      }
      return tool;
    });
    
    // 如果有替代项目，添加到发现库
    if (alternativeFound) {
      updatedTools.push(alternativeFound);
    }
    
    if (markedCount > 0 || alternativeFound) {
      saveDiscoveredTools(updatedTools);
      console.log(`⚠️ 标记 ${markedCount} 个失效链接，新增 ${alternativeFound ? 1 : 0} 个替代`);
    }
    
    res.json({
      success: true,
      marked: markedCount,
      alternative: alternativeFound,
      skipped: false
    });
    
  } catch (error) {
    console.error('标记失效链接失败:', error);
    res.status(500).json({ error: error.message });
  }
});

// 寻找 GitHub 替代项目
async function findGitHubAlternative(deadTool) {
  try {
    // 1. 使用 Kimi AI 搜索相似项目
    const searchQuery = `${deadTool.name} ${deadTool.chineseName} ${deadTool.tagline} github 开源`;
    
    const prompt = `请搜索与以下项目功能相似的 GitHub 开源项目：

原项目信息：
- 名称：${deadTool.name}
- 中文名：${deadTool.chineseName}
- 描述：${deadTool.tagline}
- 分类：${deadTool.category}

请返回3-5个最相似的 GitHub 开源项目，要求：
1. 必须是真实存在的 GitHub 仓库
2. 功能与原项目相似
3. 优先选择 stars 多的项目

返回JSON数组格式：
[{
  "name": "项目名称",
  "chineseName": "中文名称",
  "description": "项目描述",
  "githubUrl": "https://github.com/owner/repo"
}]

只返回JSON数组，不要其他文字。`;

    const response = await fetch(KIMI_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${KIMI_API_KEY}`
      },
      body: JSON.stringify({
        model: 'kimi-k2.5',
        messages: [
          {
            role: 'system',
            content: '你是GitHub开源项目搜索专家，擅长找到功能相似的开源替代品。'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.3
      })
    });

    if (!response.ok) {
      throw new Error('Kimi API 调用失败');
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || '';
    
    // 解析 JSON
    let candidates = [];
    try {
      const cleanedContent = content
        .replace(/```json\s*/g, '')
        .replace(/```\s*$/g, '')
        .replace(/```/g, '')
        .trim();
      
      candidates = JSON.parse(cleanedContent);
      if (!Array.isArray(candidates)) {
        candidates = [];
      }
    } catch (e) {
      console.error('解析替代项目失败:', e);
      return null;
    }
    
    // 2. 获取每个候选项目的 GitHub 信息
    const candidatesWithInfo = [];
    for (const candidate of candidates.slice(0, 3)) {
      const parsed = parseGitHubUrl(candidate.githubUrl);
      if (!parsed) continue;
      
      const info = await getGitHubStars(parsed.owner, parsed.repo);
      if (!info.error && info.stars !== null) {
        candidatesWithInfo.push({
          ...candidate,
          ...info,
          owner: parsed.owner,
          repo: parsed.repo,
          githubUrl: candidate.githubUrl
        });
      }
      
      // 添加延迟避免 API 限制
      await new Promise(resolve => setTimeout(resolve, 300));
    }
    
    if (candidatesWithInfo.length === 0) {
      return null;
    }
    
    // 3. 选择 stars 最多的项目
    candidatesWithInfo.sort((a, b) => (b.stars || 0) - (a.stars || 0));
    const bestAlternative = candidatesWithInfo[0];
    
    // 4. 构建替代工具对象
    const alternativeTool = {
      id: generateId(),
      slug: bestAlternative.repo.toLowerCase(),
      name: bestAlternative.repo,
      chineseName: bestAlternative.chineseName || bestAlternative.name || deadTool.chineseName,
      tagline: bestAlternative.description || deadTool.tagline,
      description: bestAlternative.description || deadTool.description,
      website: bestAlternative.githubUrl,
      logoUrl: `https://api.dicebear.com/7.x/shapes/svg?seed=${bestAlternative.repo}`,
      category: deadTool.category,
      status: 'published',
      content: {
        founderBackground: `替代失效项目 "${deadTool.name}" | 通过 Kimi AI 智能搜索发现`,
        problemSolved: deadTool.content?.problemSolved || [],
        userValue: deadTool.content?.userValue || [],
        targetUsers: deadTool.content?.targetUsers || '求职者',
        howToUse: ['访问 GitHub 仓库了解详情'],
        useCases: deadTool.content?.useCases || [],
        pricing: { free: '开源免费', pro: '查看仓库', premium: '查看仓库' },
        pros: ['GitHub 开源项目', `⭐ ${bestAlternative.stars} stars`, ...(deadTool.content?.pros || [])].slice(0, 5),
        cons: ['替代原失效项目', ...(deadTool.content?.cons || [])].slice(0, 3)
      },
      rating: 8.0,
      viewCount: 0,
      isFeatured: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      publishedAt: new Date().toISOString(),
      source: 'github',
      githubStars: bestAlternative.stars,
      githubForks: bestAlternative.forks,
      githubLanguage: bestAlternative.language,
      githubTopics: bestAlternative.topics,
      starHistoryUrl: getStarHistoryImageUrl(bestAlternative.owner, bestAlternative.repo),
      discoveredAt: new Date().toISOString(),
      discoveredFrom: `替代失效项目: ${deadTool.name}`,
      isAlternative: true,
      replaces: deadTool.id
    };
    
    return alternativeTool;
    
  } catch (error) {
    console.error('寻找替代项目失败:', error);
    return null;
  }
}

// 启动服务器
app.listen(PORT, () => {
  const discoveredTools = loadDiscoveredTools();
  console.log(`🚀 后端服务运行在 http://localhost:${PORT}`);
  console.log(`🔑 Kimi API ${KIMI_API_KEY ? '已配置' : '未配置'}`);
  console.log(`📱 阿里云短信 ${smsService ? '已配置' : '未配置（开发模式）'}`);
  console.log(`💾 Redis ${redisService.isConnected() ? '已连接' : '未连接'}`);
  console.log(`📦 已发现工具库: ${discoveredTools.length} 个`);
  console.log('');
  console.log('📖 使用说明：');
  console.log('   1. 设置环境变量 KIMI_API_KEY=your_api_key');
  console.log('   2. 配置阿里云短信: ALIYUN_ACCESS_KEY_ID, ALIYUN_ACCESS_KEY_SECRET');
  console.log('   3. 配置Redis: REDIS_HOST, REDIS_PORT（可选）');
  console.log('   4. 前端搜索时将调用 POST /api/search');
  console.log('   5. 用户认证: POST /api/auth/send-code, POST /api/auth/login');
  console.log('');
});
