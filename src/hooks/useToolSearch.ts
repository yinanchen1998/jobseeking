import { useState, useCallback, useEffect } from 'react';
import type { AITool } from '@/types';

import { API_BASE_URL } from '@/config/api';

interface SearchState {
  isSearching: boolean;
  isSaving: boolean;
  results: AITool[];
  localResults: AITool[];
  kimiResults: AITool[];
  error: string | null;
  hasSearched: boolean;
  discoveredCount: number;
  discoveredToolsList: DiscoveredTool[];
}

interface DiscoveredTool extends AITool {
  discoveredAt?: string;
  discoveredFrom?: string;
  linkStatus?: {
    valid: boolean;
    status: number | null;
    checked: boolean;
  };
}

export function useToolSearch() {
  const [state, setState] = useState<SearchState>({
    isSearching: false,
    isSaving: false,
    results: [],
    localResults: [],
    kimiResults: [],
    error: null,
    hasSearched: false,
    discoveredCount: 0,
    discoveredToolsList: []
  });

  // 加载已发现的工具数量
  const loadDiscoveredCount = useCallback(async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/discovered-tools`);
      const data = await response.json();
      setState(prev => ({ 
        ...prev, 
        discoveredCount: data.count || 0,
        // 同时保存发现库的工具列表，用于后续合并显示
        discoveredToolsList: data.tools || []
      }));
      return data.tools || [];
    } catch (error) {
      console.error('加载发现库失败:', error);
      return [];
    }
  }, []);

  // 组件挂载时加载
  useEffect(() => {
    loadDiscoveredCount();
  }, [loadDiscoveredCount]);

  // 本地搜索（已发现的工具）
  const searchLocal = useCallback(async (query: string): Promise<DiscoveredTool[]> => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/local-search`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query })
      });
      
      if (!response.ok) return [];
      
      const data = await response.json();
      return data.results || [];
    } catch (error) {
      console.error('本地搜索失败:', error);
      return [];
    }
  }, []);

  // Kimi AI 搜索
  const searchKimi = useCallback(async (query: string): Promise<DiscoveredTool[]> => {
    const response = await fetch(`${API_BASE_URL}/api/search`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query, validateLinks: true })
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || errorData.error || 'Kimi 搜索失败');
    }

    const data = await response.json();
    
    if (data.results && Array.isArray(data.results)) {
      return data.results.map((item: any, index: number) => ({
        id: `kimi-${Date.now()}-${index}`,
        slug: item.name?.toLowerCase().replace(/\s+/g, '-') || `search-result-${index}`,
        name: item.name || 'Unknown Tool',
        chineseName: item.chineseName || item.name || '未知工具',
        tagline: item.tagline || item.description?.slice(0, 50) + '...' || '暂无描述',
        description: item.description || '暂无详细描述',
        website: item.website || '#',
        logoUrl: `https://api.dicebear.com/7.x/shapes/svg?seed=${item.name || index}`,
        category: item.category || 'career',
        status: 'published',
        content: {
          founderBackground: '通过 Kimi AI 搜索发现',
          problemSolved: ['帮助求职者解决求职相关问题'],
          userValue: [{ feature: 'AI推荐', desc: '基于Kimi AI的搜索结果' }],
          targetUsers: '求职者',
          howToUse: ['访问官网了解详情'],
          useCases: [],
          pricing: { free: '请访问官网查看', pro: '请访问官网查看', premium: '请访问官网查看' },
          pros: ['Kimi AI 推荐'],
          cons: ['需要进一步了解']
        },
        rating: 8.0,
        viewCount: 0,
        isFeatured: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        publishedAt: new Date().toISOString(),
        source: item.source || 'kimi',
        linkStatus: item.linkStatus || { valid: false, status: null, checked: false }
      }));
    }
    
    return [];
  }, []);

  // 保存新发现的工具
  const saveTools = useCallback(async (tools: DiscoveredTool[], searchQuery: string) => {
    if (tools.length === 0) return;
    
    setState(prev => ({ ...prev, isSaving: true }));
    
    try {
      const response = await fetch(`${API_BASE_URL}/api/save-tools`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tools, searchQuery })
      });

      if (!response.ok) {
        console.error('保存工具失败');
        return;
      }

      const data = await response.json();
      console.log(`✅ 已保存 ${data.added} 个新工具，库中共有 ${data.total} 个`);
      
      // 保存成功后，重新加载发现库数量
      await loadDiscoveredCount();
      
      setState(prev => ({
        ...prev,
        isSaving: false
      }));
    } catch (error) {
      console.error('保存工具失败:', error);
      setState(prev => ({ ...prev, isSaving: false }));
    }
  }, [loadDiscoveredCount]);

  // 主搜索函数
  const search = useCallback(async (query: string) => {
    if (!query.trim()) return;

    setState(prev => ({
      ...prev,
      isSearching: true,
      error: null,
      hasSearched: true,
      localResults: [],
      kimiResults: []
    }));

    try {
      // 1. 同时进行本地搜索和 Kimi 搜索（并行执行）
      const [localResults, kimiResults] = await Promise.all([
        searchLocal(query),
        searchKimi(query).catch(err => {
          console.error('Kimi 搜索失败:', err);
          return [];
        })
      ]);
      
      // 2. 过滤 Kimi 结果：排除已在本地库中的
      const existingSlugs = new Set(localResults.map(t => t.slug));
      const existingWebsites = new Set(localResults.map(t => t.website));
      
      const newKimiResults = kimiResults.filter(tool => 
        !existingSlugs.has(tool.slug) && 
        !existingWebsites.has(tool.website) &&
        tool.website !== '#'
      );
      
      // 3. 合并结果：Kimi 新发现的 + 本地已有的
      const allResults = [...newKimiResults, ...localResults];
      
      setState(prev => ({
        ...prev,
        localResults,
        kimiResults: newKimiResults,
        results: allResults
      }));

      // 4. 保存新发现的工具到后端
      if (newKimiResults.length > 0) {
        await saveTools(newKimiResults, query);
      }
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : '搜索出错'
      }));
    } finally {
      setState(prev => ({ ...prev, isSearching: false }));
    }
  }, [searchLocal, searchKimi, saveTools]);

  // 清除搜索
  const clear = useCallback(() => {
    setState(prev => ({
      isSearching: false,
      isSaving: false,
      results: [],
      localResults: [],
      kimiResults: [],
      error: null,
      hasSearched: false,
      discoveredCount: prev.discoveredCount,
      discoveredToolsList: prev.discoveredToolsList
    }));
  }, []);

  return {
    ...state,
    search,
    clear
  };
}
