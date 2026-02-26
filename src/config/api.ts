// API 配置
// 开发环境用相对路径（Vite 代理），生产环境用完整 URL

export const API_BASE_URL = import.meta.env.DEV 
  ? ''  // 开发环境用相对路径，Vite 代理
  : (import.meta.env.VITE_API_URL || 'http://localhost:3001'); // 生产环境
