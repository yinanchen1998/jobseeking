/**
 * 用户认证服务
 */

import { API_BASE_URL } from '@/config/api';

export interface User {
  userId: string;
  phone: string;
  createdAt: string;
}

export interface LoginResponse {
  success: boolean;
  message: string;
  token?: string;
  user?: User;
  devCode?: string;
}

// 存储 token
export function setToken(token: string) {
  localStorage.setItem('auth_token', token);
}

// 获取 token
export function getToken(): string | null {
  return localStorage.getItem('auth_token');
}

// 清除 token
export function clearToken() {
  localStorage.removeItem('auth_token');
}

// 发送验证码
export async function sendCode(phone: string): Promise<{ success: boolean; message: string; devCode?: string }> {
  const response = await fetch(`${API_BASE_URL}/api/auth/send-code`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ phone }),
  });
  return response.json();
}

// 验证码登录
export async function login(phone: string, code: string): Promise<LoginResponse> {
  const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ phone, code }),
  });
  const data = await response.json();
  
  if (data.success && data.token) {
    setToken(data.token);
  }
  
  return data;
}

// 退出登录
export async function logout(): Promise<void> {
  const token = getToken();
  if (token) {
    await fetch(`${API_BASE_URL}/api/auth/logout`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    });
  }
  clearToken();
}

// 获取当前用户
export async function getCurrentUser(): Promise<User | null> {
  const token = getToken();
  if (!token) return null;
  
  try {
    const response = await fetch(`${API_BASE_URL}/api/auth/me`, {
      headers: { 
        'Authorization': `Bearer ${token}`,
      },
    });
    
    if (!response.ok) {
      if (response.status === 401) {
        clearToken();
      }
      return null;
    }
    
    const data = await response.json();
    return data.success ? data.user : null;
  } catch (error) {
    console.error('获取用户信息失败:', error);
    return null;
  }
}

// 检查是否已登录
export function isAuthenticated(): boolean {
  return !!getToken();
}
