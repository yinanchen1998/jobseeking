# JobAI Scout 后端服务

这是 JobAI Scout 的后端代理服务，用于处理 Kimi API 的搜索请求，保护 API Key 不被前端暴露。

## 功能

- 代理 Kimi API 搜索请求
- CORS 支持
- 错误处理

## 安装

```bash
cd backend
npm install
```

## 配置

1. 复制环境变量示例文件：
```bash
cp .env.example .env
```

2. 编辑 `.env` 文件，添加你的 Kimi API Key：
```env
KIMI_API_KEY=your_kimi_api_key_here
PORT=3001
```

> 获取 Kimi API Key：https://platform.moonshot.cn/

## 启动

开发模式（带热重载）：
```bash
npm run dev
```

生产模式：
```bash
npm start
```

服务将在 http://localhost:3001 启动

## API 端点

### 健康检查
```
GET /api/health
```

### 搜索
```
POST /api/search
Content-Type: application/json

{
  "query": "简历优化工具"
}
```

## 前端配置

确保前端项目根目录的 `.env` 文件中设置了正确的 API URL：

```env
VITE_API_URL=http://localhost:3001
```
