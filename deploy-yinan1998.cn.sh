#!/bin/bash

# 求职AI助手部署脚本 - yinan1998.cn 专用
# 用于阿里云服务器部署

echo "🚀 开始部署求职AI助手到 yinan1998.cn..."
echo ""

# 检查环境变量
if [ ! -f backend/.env ]; then
    echo "❌ 错误: backend/.env 文件不存在"
    echo "请复制 backend/.env.example 为 backend/.env 并填写配置"
    exit 1
fi

# 检查 SSL 证书
if [ ! -f "ssl/yinan1998.cn.crt" ] || [ ! -f "ssl/yinan1998.cn.key" ]; then
    echo "⚠️ 警告: SSL 证书文件不存在"
    echo "   期望路径:"
    echo "   - ssl/yinan1998.cn.crt"
    echo "   - ssl/yinan1998.cn.key"
    echo ""
    echo "请查看 SSL_SETUP.md 获取配置指南"
    echo ""
    read -p "是否继续部署（HTTP模式）? (y/n) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
fi

# 检查端口占用
echo "🔍 检查端口占用..."
if netstat -tuln | grep -q ":80 "; then
    echo "⚠️ 警告: 80 端口已被占用"
fi
if netstat -tuln | grep -q ":443 "; then
    echo "⚠️ 警告: 443 端口已被占用"
fi

# 构建并启动
echo ""
echo "📦 构建 Docker 镜像..."
docker-compose down 2>/dev/null
docker-compose build

echo ""
echo "🚀 启动服务..."
docker-compose up -d

# 检查状态
echo ""
echo "⏳ 等待服务启动..."
sleep 5

echo ""
echo "✅ 部署完成！"
echo ""
echo "📊 服务状态:"
docker-compose ps

echo ""
echo "🌐 访问地址:"
echo "   - 前端: https://yinan1998.cn"
echo "   - API: https://yinan1998.cn/api"
echo "   - 健康检查: https://yinan1998.cn/api/health"
echo ""
echo "📋 常用命令:"
echo "   查看日志: docker-compose logs -f"
echo "   停止服务: docker-compose down"
echo "   重启服务: docker-compose restart"
echo ""
echo "📖 查看 SSL_SETUP.md 了解 HTTPS 证书配置"
echo ""
