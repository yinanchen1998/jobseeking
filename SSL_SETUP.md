# SSL 证书配置指南

## 域名: yinan1998.cn

## 获取 SSL 证书

### 方式一：阿里云免费 SSL 证书（推荐）

1. 登录 [阿里云 SSL 证书控制台](https://www.aliyun.com/product/ssl?spm=5176.19720258.J_3207526240.1.6bbc76f4XaMFz8)
2. 点击"购买证书"，选择"免费版（个人/测试）"
3. 按提示完成域名验证（DNS 验证或文件验证）
4. 证书签发后，下载 **Nginx 格式**的证书
5. 解压后会得到两个文件：
   - `yinan1998.cn.pem` 或 `yinan1998.cn.crt`（证书）
   - `yinan1998.cn.key`（私钥）

### 方式二：Certbot (Let's Encrypt)

```bash
# 安装 Certbot
sudo yum install certbot  # CentOS
sudo apt install certbot  # Ubuntu

# 申请证书
sudo certbot certonly --standalone -d yinan1998.cn -d www.yinan1998.cn

# 证书位置（默认）
# /etc/letsencrypt/live/yinan1998.cn/fullchain.pem
# /etc/letsencrypt/live/yinan1998.cn/privkey.pem
```

## 上传证书到服务器

```bash
# 在服务器上创建 SSL 目录
mkdir -p /path/to/jobseeking/ssl

# 上传证书文件（本地执行）
scp yinan1998.cn.crt root@your-server-ip:/path/to/jobseeking/ssl/
scp yinan1998.cn.key root@your-server-ip:/path/to/jobseeking/ssl/

# 如果使用 Certbot，创建软链接
ln -s /etc/letsencrypt/live/yinan1998.cn/fullchain.pem /path/to/jobseeking/ssl/yinan1998.cn.crt
ln -s /etc/letsencrypt/live/yinan1998.cn/privkey.pem /path/to/jobseeking/ssl/yinan1998.cn.key
```

## 证书文件结构

```
jobseeking/
├── ssl/
│   ├── yinan1998.cn.crt    # 证书文件
│   └── yinan1998.cn.key    # 私钥文件
├── docker-compose.yml
├── nginx.conf
└── ...
```

## 重新部署

证书上传后，重新部署：

```bash
cd /path/to/jobseeking
docker-compose down
docker-compose up -d
```

## 验证 HTTPS

访问 https://yinan1998.cn，检查：
1. 浏览器地址栏显示 🔒 安全锁
2. 证书有效期正确
3. 没有安全警告

## 自动续期（Let's Encrypt）

如果使用 Certbot，添加定时任务：

```bash
# 编辑 crontab
sudo crontab -e

# 添加以下内容（每天凌晨2点检查续期）
0 2 * * * /usr/bin/certbot renew --quiet --deploy-hook "cd /path/to/jobseeking && docker-compose restart frontend"
```

## 常见问题

### 1. 证书权限错误
确保证书文件可读：
```bash
chmod 644 ssl/yinan1998.cn.crt
chmod 600 ssl/yinan1998.cn.key
```

### 2. 证书路径错误
检查 `nginx.conf` 中的路径：
```nginx
ssl_certificate /etc/nginx/ssl/yinan1998.cn.crt;
ssl_certificate_key /etc/nginx/ssl/yinan1998.cn.key;
```

注意：容器内的路径是 `/etc/nginx/ssl/`，对应宿主机的 `./ssl/` 目录。

### 3. 混合内容警告
如果前端使用 HTTPS，但 API 调用显示不安全，检查：
- 前端 `.env` 文件中的 `VITE_API_URL` 是否为 `https://yinan1998.cn`
- 后端 `FRONTEND_URL` 是否配置为 `https://yinan1998.cn`
