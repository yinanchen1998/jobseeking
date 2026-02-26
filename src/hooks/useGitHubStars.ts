import { useState, useCallback } from 'react';

import { API_BASE_URL } from '@/config/api';

// 标记失效的 GitHub 链接
async function markGitHubDead(url: string) {
  try {
    await fetch(`${API_BASE_URL}/api/mark-github-dead`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url })
    });
  } catch (error) {
    console.error('标记失效链接失败:', error);
  }
}

interface GitHubInfo {
  owner: string;
  repo: string;
  url: string;
  stars: number | null;
  forks: number | null;
  openIssues: number | null;
  language: string | null;
  description: string | null;
  updatedAt: string | null;
  createdAt: string | null;
  topics: string[];
  homepage: string | null;
  starHistoryUrl: string;
  error: string | null;
}

export function useGitHubStars() {
  const [githubInfo, setGithubInfo] = useState<Record<string, GitHubInfo>>({});
  const [loading, setLoading] = useState<Record<string, boolean>>({});

  const fetchGitHubInfo = useCallback(async (url: string): Promise<GitHubInfo | null> => {
    if (!url || !url.includes('github.com')) return null;

    setLoading(prev => ({ ...prev, [url]: true }));

    try {
      const response = await fetch(`${API_BASE_URL}/api/github-info`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url })
      });

      if (!response.ok) {
        throw new Error('获取 GitHub 信息失败');
      }

      const data = await response.json();
      
      // 如果仓库不存在，自动标记为失效
      if (data.error && (data.error.includes('Not Found') || data.error.includes('404'))) {
        markGitHubDead(url);
      }
      
      setGithubInfo(prev => {
        // 避免重复设置相同的数据
        if (prev[url] && JSON.stringify(prev[url]) === JSON.stringify(data)) {
          return prev;
        }
        return { ...prev, [url]: data };
      });
      return data;
    } catch (error) {
      console.error('获取 GitHub 信息失败:', error);
      return null;
    } finally {
      setLoading(prev => ({ ...prev, [url]: false }));
    }
  }, []);

  const formatStars = (stars: number | null): string => {
    if (stars === null) return '-';
    if (stars >= 1000) {
      return (stars / 1000).toFixed(1) + 'k';
    }
    return stars.toString();
  };

  return {
    githubInfo,
    loading,
    fetchGitHubInfo,
    formatStars
  };
}
