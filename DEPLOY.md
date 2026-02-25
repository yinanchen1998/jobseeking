# 求职AI助手 - 部署指南

## 阿里云部署步骤

### 1. 准备工作

#### 购买阿里云资源
- **ECS 服务器**: 建议 2核4G 以上，安装 CentOS 7+/Ubuntu 20.04+
- **域名**: 在阿里云购买并备案
- **Redis**: 可选，可以使用云数据库Redis版或本地安装

#### 安装 Docker 和 Docker Compose
```bash
# 安装 Docker
curl -fsSL https://get.docker.com | sh

# 安装 Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose
```

### 2. 配置阿里云短信服务

1. 登录 [阿里云控制台](https://www.aliyun.com/)
2. 开通 **号码认证服务** (Dypnsapi)
3. 申请短信签名和模板
4. 创建 AccessKey: [RAM 控制台](https://ram.console.aliyun.com/)

### 3. 配置环境变量

复制配置文件：
```bash
cp backend/.env.example backend/.env
```

编辑 `backend/.env`：
```bash
# Kimi API Key (从 https://platform.moonshot.cn/ 获取)
KIMI_API_KEY=your_kimi_api_key_here

# 阿里云短信配置
ALIYUN_ACCESS_KEY_ID=your_aliyun_access_key_id
ALIYUN_ACCESS_KEY_SECRET=your_aliyun_access_key_secret
ALIYUN_SMS_SIGN_NAME=你的短信签名
ALIYUN_SMS_TEMPLATE_CODE=SMS_XXXXXXXX

# Redis 配置（如果使用阿里云Redis，填写连接信息）
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=
REDIS_DB=0

# 前端域名
FRONTEND_URL=http://your-domain.com
```

### 4. 配置域名

1. 在阿里云控制台解析域名到服务器IP
2. 修改 `nginx.conf` 中的 `server_name`:
```nginx
server {
    listen 80;
    server_name your-domain.com;  # 修改为你的域名
    ...
}
```

### 5. 部署应用

```bash
# 进入项目目录
cd /path/to/jobseeking

# 执行部署脚本
chmod +x deploy.sh
./deploy.sh
```

### 6. 配置 HTTPS (SSL证书)

#### 使用阿里云 SSL 证书
1. 在阿里云申请免费 SSL 证书
2. 下载 Nginx 格式的证书
3. 上传到服务器 `ssl` 目录

```bash
mkdir -p ssl
# 上传 cert.pem 和 key.pem 到 ssl 目录
```

4. 启用 HTTPS 配置，修改 `nginx.conf` 取消注释 HTTPS 部分

#### 或使用 Certbot (Let's Encrypt)
```bash
# 安装 Certbot
docker run -it --rm \
  -v "$(pwd)/ssl:/etc/letsencrypt" \
  certbot/certbot certonly \
  --standalone \
  -d your-domain.com
```

### 7. 验证部署

```bash
# 检查服务状态
docker-compose ps

# 查看日志
docker-compose logs -f backend
docker-compose logs -f frontend

# 测试 API
curl http://your-domain.com/api/health
```

### 8. 更新应用

```bash
# 拉取最新代码
git pull origin main

# 重新构建并启动
docker-compose down
docker-compose up -d --build
```

## 常见问题

### Redis 连接失败
- 检查 Redis 是否启动: `docker-compose ps`
- 检查 Redis 配置是否正确

### 短信发送失败
- 检查阿里云 AccessKey 是否正确
- 检查短信签名和模板是否审核通过
- 查看后端日志: `docker-compose logs backend`

### 前端无法访问 API
- 检查 `FRONTEND_URL` 环境变量是否配置正确
- 检查 Nginx 配置中的代理设置
- 确认防火墙是否开放 80/443 端口

## 目录结构

```
jobseeking/
├── backend/           # 后端代码
│   ├── services/      # 服务模块
│   ├── data/          # 数据文件
│   ├── .env           # 环境变量（不提交到git）
│   └── server.js      # 主程序
├── src/               # 前端代码
├── nginx.conf         # Nginx 配置
├── docker-compose.yml # Docker 编排
├── Dockerfile         # 前端镜像
└── deploy.sh          # 部署脚本
```
