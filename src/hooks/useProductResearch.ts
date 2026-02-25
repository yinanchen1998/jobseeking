import { useState, useCallback, useRef, useEffect } from 'react';
import type { AITool } from '@/types';
import type { ProductResearch, ResearchSummary } from '@/types/research';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

interface ResearchTask {
  taskId: string;
  status: 'queued' | 'processing' | 'completed' | 'failed';
  progress: number;
  message: string;
  research?: ProductResearch;
  error?: string;
}

interface ResearchState {
  isLoading: boolean;
  research: ProductResearch | null;
  error: string | null;
  task: ResearchTask | null;
}

export function useProductResearch() {
  const [state, setState] = useState<ResearchState>({
    isLoading: false,
    research: null,
    error: null,
    task: null
  });
  
  const pollIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // 清理轮询
  const clearPoll = useCallback(() => {
    if (pollIntervalRef.current) {
      clearInterval(pollIntervalRef.current);
      pollIntervalRef.current = null;
    }
  }, []);

  // 获取产品调研报告
  const getResearch = useCallback(async (toolId: string): Promise<ProductResearch | null> => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/research/${toolId}`);
      if (!response.ok) return null;
      const data = await response.json();
      return data.research;
    } catch (error) {
      console.error('获取调研报告失败:', error);
      return null;
    }
  }, []);

  // 查询任务状态
  const checkTaskStatus = useCallback(async (taskId: string): Promise<ResearchTask | null> => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/research-task/${taskId}`);
      if (!response.ok) return null;
      const data = await response.json();
      return {
        taskId: data.taskId,
        status: data.status,
        progress: data.progress,
        message: data.message,
        research: data.research,
        error: data.error
      };
    } catch (error) {
      console.error('查询任务状态失败:', error);
      return null;
    }
  }, []);

  // 开始轮询任务状态
  const startPolling = useCallback((taskId: string) => {
    clearPoll();
    
    pollIntervalRef.current = setInterval(async () => {
      const task = await checkTaskStatus(taskId);
      
      if (!task) {
        clearPoll();
        setState(prev => ({
          ...prev,
          isLoading: false,
          error: '查询任务状态失败'
        }));
        return;
      }
      
      setState(prev => ({
        ...prev,
        task,
        research: task.research || prev.research
      }));
      
      // 任务完成或失败，停止轮询
      if (task.status === 'completed' || task.status === 'failed') {
        clearPoll();
        setState(prev => ({
          ...prev,
          isLoading: false
        }));
      }
    }, 2000); // 每2秒查询一次
  }, [checkTaskStatus, clearPoll]);

  // 提交调研任务
  const submitResearchTask = useCallback(async (tool: AITool): Promise<ResearchTask | null> => {
    setState(prev => ({ 
      ...prev, 
      isLoading: true, 
      error: null,
      task: null
    }));
    
    try {
      // 先检查是否已有报告
      const existingResearch = await getResearch(tool.id);
      if (existingResearch) {
        setState({
          isLoading: false,
          research: existingResearch,
          error: null,
          task: null
        });
        return null; // 已有报告，不需要任务
      }
      
      // 提交任务
      const response = await fetch(`${API_BASE_URL}/api/research-product`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tool })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || '提交调研任务失败');
      }

      const data = await response.json();
      
      // 如果直接返回了报告（已缓存）
      if (data.cached && data.research) {
        setState({
          isLoading: false,
          research: data.research,
          error: null,
          task: null
        });
        return null;
      }
      
      // 创建任务对象
      const task: ResearchTask = {
        taskId: data.taskId,
        status: data.status || 'queued',
        progress: 0,
        message: data.message || '任务已提交'
      };
      
      setState(prev => ({
        ...prev,
        task
      }));
      
      // 开始轮询
      startPolling(data.taskId);
      
      return task;
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : '提交调研任务失败';
      setState(prev => ({ 
        ...prev, 
        isLoading: false, 
        error: errorMsg 
      }));
      return null;
    }
  }, [getResearch, startPolling]);

  // 取消调研
  const cancelResearch = useCallback(() => {
    clearPoll();
    setState(prev => ({
      ...prev,
      isLoading: false,
      task: null
    }));
  }, [clearPoll]);

  // 获取所有调研报告
  const getAllResearch = useCallback(async (): Promise<ProductResearch[]> => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/research`);
      if (!response.ok) return [];
      const data = await response.json();
      return data.researchList || [];
    } catch (error) {
      console.error('获取所有调研报告失败:', error);
      return [];
    }
  }, []);

  // 生成汇总报告
  const generateSummary = useCallback(async (): Promise<ResearchSummary | null> => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/research-summary`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || '生成汇总报告失败');
      }

      const data = await response.json();
      return data.summary;
    } catch (error) {
      console.error('生成汇总报告失败:', error);
      return null;
    }
  }, []);

  // 获取汇总报告
  const getSummary = useCallback(async (): Promise<ResearchSummary | null> => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/research/summary`);
      if (!response.ok) return null;
      const data = await response.json();
      return data.research;
    } catch (error) {
      return null;
    }
  }, []);

  // 组件卸载时清理
  useEffect(() => {
    return () => {
      clearPoll();
    };
  }, [clearPoll]);

  return {
    ...state,
    submitResearchTask,
    cancelResearch,
    getResearch,
    getAllResearch,
    generateSummary,
    getSummary
  };
}
