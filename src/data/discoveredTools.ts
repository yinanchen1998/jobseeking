// 通过 Kimi AI 搜索发现的工具库
// 这个文件会自动增长，每次搜索到的新工具都会保存到这里

import type { AITool } from '@/types';

// 初始为空，随着搜索不断累积
export const discoveredTools: AITool[] = [
  // 示例格式（实际使用时会被搜索到的新工具填充）
  // {
  //   id: 'discovered-1',
  //   slug: 'example-tool',
  //   name: 'Example Tool',
  //   chineseName: '示例工具',
  //   tagline: '这是一个示例',
  //   description: '详细描述',
  //   website: 'https://example.com',
  //   logoUrl: 'https://api.dicebear.com/7.x/shapes/svg?seed=example',
  //   category: 'career',
  //   status: 'published',
  //   content: {
  //     founderBackground: '通过 Kimi AI 搜索发现',
  //     problemSolved: [],
  //     userValue: [],
  //     targetUsers: '求职者',
  //     howToUse: [],
  //     useCases: [],
  //     pricing: { free: '', pro: '', premium: '' },
  //     pros: [],
  //     cons: []
  //   },
  //   rating: 8.0,
  //   viewCount: 0,
  //   isFeatured: false,
  //   createdAt: new Date().toISOString(),
  //   updatedAt: new Date().toISOString(),
  //   publishedAt: new Date().toISOString(),
  //   source: 'kimi'
  // }
];

// 搜索关键词索引（用于快速查找）
export const searchIndex: Record<string, string[]> = {
  // '关键词': ['tool-id-1', 'tool-id-2']
};

// 合并所有工具（基础工具 + 发现的工具）
export function getAllTools(): AITool[] {
  // 动态导入 mockTools 避免循环依赖
  import { mockTools } from './mockData';
  return [...mockTools, ...discoveredTools];
}

// 根据关键词查找已发现的工具
export function findToolsByKeyword(keyword: string): AITool[] {
  const allTools = getAllTools();
  const normalizedKeyword = keyword.toLowerCase();
  
  return allTools.filter(tool => {
    const searchableText = `${tool.name} ${tool.chineseName} ${tool.tagline} ${tool.description} ${tool.category}`.toLowerCase();
    return searchableText.includes(normalizedKeyword);
  });
}

// 检查工具是否已存在（通过 slug 或 website）
export function isToolExists(slug: string, website: string): boolean {
  const allTools = getAllTools();
  return allTools.some(tool => 
    tool.slug === slug || 
    tool.website === website ||
    (tool.website && website && tool.website.replace(/\/$/, '') === website.replace(/\/$/, ''))
  );
}
