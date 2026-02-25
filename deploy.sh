#!/bin/bash

# 求职AI助手部署脚本
# 用于阿里云服务器部署

echo "🚀 开始部署求职AI助手..."

# 检查环境变量
if [ ! -f backend/.env ]; then
    echo "❌ 错误: backend/.env 文件不存在"
    echo "请复制 backend/.env.example 为 backend/.env 并填写配置"
    exit 1
fi

# 构建并启动
echo "📦 构建并启动服务..."
docker-compose down
docker-compose build
docker-compose up -d

# 检查状态
echo "⏳ 等待服务启动..."
sleep 5

echo ""
echo "✅ 部署完成！"
echo ""
echo "📊 服务状态:"
docker-compose ps

echo ""
echo "🌐 访问地址:"
echo "   - 前端: http://你的服务器IP"
echo "   - 后端API: http://你的服务器IP/api"
echo "   - 健康检查: http://你的服务器IP/api/health"
echo ""
echo "📋 常用命令:"
echo "   查看日志: docker-compose logs -f"
echo "   停止服务: docker-compose down"
echo "   重启服务: docker-compose restart"
echo ""
