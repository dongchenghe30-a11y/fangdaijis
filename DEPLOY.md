# 🚀 全球房贷计算器 — 服务器部署教程

> 本文档涵盖从零开始将房贷计算器部署到生产服务器的完整流程，
> 包括静态托管、Nginx 配置、HTTPS、CDN 加速、后端 API 部署等。

---

## 目录

1. [部署架构选择](#部署架构选择)
2. [方案一：纯静态托管（推荐）](#方案一纯静态托管推荐)
   - [Cloudflare Pages](#cloudflare-pages-免费最推荐)
   - [Vercel](#vercel)
   - [Nginx 自托管](#nginx-自托管)
3. [方案二：前端 + FastAPI 后端完整部署](#方案二前端--fastapi-后端完整部署)
4. [域名与 HTTPS 配置](#域名与-https-配置)
5. [SEO 优化部署检查清单](#seo-优化部署检查清单)
6. [CDN & 性能优化](#cdn--性能优化)
7. [常见问题排查](#常见问题排查)

---

## 部署架构选择

| 方案 | 适合场景 | 费用 | 难度 |
|------|---------|------|------|
| Cloudflare Pages | 纯静态，全球 CDN | 免费 | ⭐ 最简单 |
| Vercel | 静态 + Next.js | 免费（个人） | ⭐⭐ 简单 |
| Nginx 自托管 | VPS/云服务器 | 服务器费 | ⭐⭐⭐ 中等 |
| 完整前后端 | 需要 FastAPI 后端 | 服务器费 | ⭐⭐⭐⭐ 较复杂 |

**推荐：** 当前前端是纯 HTML + JS，无需服务器端渲染，优先使用 Cloudflare Pages 或 Vercel。

---

## 方案一：纯静态托管（推荐）

### Cloudflare Pages（免费，最推荐）

**适合对象：** 个人站长、小型项目，需要全球 CDN 加速

#### 步骤一：准备代码仓库

```bash
# 1. 初始化 Git 仓库
cd mortgage-calculator/frontend
git init
git add .
git commit -m "feat: 全球房贷计算器初始版本"

# 2. 推送到 GitHub
# 先在 GitHub 创建新仓库，然后：
git remote add origin https://github.com/你的用户名/mortgage-calculator.git
git branch -M main
git push -u origin main
```

#### 步骤二：连接 Cloudflare Pages

1. 登录 [Cloudflare Dashboard](https://dash.cloudflare.com/)
2. 左侧菜单 → **Pages** → **Create a project**
3. 选择 **Connect to Git** → 授权 GitHub → 选择仓库
4. 构建设置：
   - **Framework preset**: `None`（静态 HTML）
   - **Build command**: 留空
   - **Build output directory**: `/`（或 `frontend/`）
5. 点击 **Save and Deploy**

#### 步骤三：绑定自定义域名

1. Pages 项目 → **Custom domains** → Add domain
2. 输入你的域名（如 `mortgage-calc.com`）
3. 按提示在域名 DNS 添加 CNAME 记录：
   ```
   CNAME  www  your-project.pages.dev
   CNAME  @    your-project.pages.dev
   ```
4. Cloudflare 自动签发 SSL 证书（约 5 分钟生效）

#### 步骤四：更新 HTML 中的域名

打开 `index.html`，将所有 `mortgage-calc.example.com` 替换为你的实际域名：
```bash
# Windows PowerShell
(Get-Content index.html) -replace 'mortgage-calc.example.com', 'your-domain.com' | Set-Content index.html

# Linux/Mac
sed -i 's/mortgage-calc.example.com/your-domain.com/g' index.html
```

---

### Vercel

**适合对象：** 熟悉 Node.js 生态，未来可能扩展 Next.js

#### 步骤一：安装 Vercel CLI

```bash
npm install -g vercel
```

#### 步骤二：部署

```bash
cd mortgage-calculator/frontend
vercel

# 按提示操作：
# ? Set up and deploy? Yes
# ? Which scope? 选择你的账号
# ? Link to existing project? No
# ? Project name: mortgage-calculator
# ? In which directory is your code? ./
# ? Override settings? No
```

#### 步骤三：绑定域名

```bash
vercel domains add your-domain.com
```

或在 Vercel Dashboard → Project → Settings → Domains 中添加。

---

### Nginx 自托管

**适合对象：** 有 VPS/云服务器（腾讯云、阿里云、AWS EC2）

#### 步骤一：服务器准备

```bash
# Ubuntu/Debian
sudo apt update
sudo apt install -y nginx certbot python3-certbot-nginx

# CentOS/RHEL
sudo yum install -y nginx certbot python3-certbot-nginx
```

#### 步骤二：上传文件

```bash
# 方法一：scp 上传
scp -r mortgage-calculator/frontend/* user@your-server-ip:/var/www/mortgage/

# 方法二：rsync（推荐，增量同步）
rsync -avz --delete mortgage-calculator/frontend/ user@your-server-ip:/var/www/mortgage/
```

#### 步骤三：配置 Nginx

创建配置文件 `/etc/nginx/sites-available/mortgage`：

```nginx
server {
    listen 80;
    server_name your-domain.com www.your-domain.com;
    
    # 重定向 HTTP → HTTPS
    return 301 https://$host$request_uri;
}

server {
    listen 443 ssl http2;
    server_name your-domain.com www.your-domain.com;
    
    # SSL 证书（certbot 自动填充）
    ssl_certificate /etc/letsencrypt/live/your-domain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/your-domain.com/privkey.pem;
    include /etc/letsencrypt/options-ssl-nginx.conf;
    ssl_dhparam /etc/letsencrypt/ssl-dhparams.pem;
    
    root /var/www/mortgage;
    index index.html;
    
    # 开启 Gzip 压缩
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/html text/css text/javascript application/javascript application/json;
    
    # 静态资源缓存
    location ~* \.(css|js|ico|svg|png|jpg|woff2)$ {
        expires 30d;
        add_header Cache-Control "public, immutable";
    }
    
    # HTML 不缓存（SEO 更新即时生效）
    location ~* \.html$ {
        expires -1;
        add_header Cache-Control "no-cache, no-store, must-revalidate";
    }
    
    # 安全 Headers（有助于 SEO 信任分）
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;
    add_header Permissions-Policy "camera=(), microphone=(), geolocation=()" always;
    
    # 访问日志
    access_log /var/log/nginx/mortgage_access.log;
    error_log /var/log/nginx/mortgage_error.log;
    
    location / {
        try_files $uri $uri/ /index.html;
    }
}
```

#### 步骤四：启用配置 & 签发证书

```bash
# 启用站点
sudo ln -s /etc/nginx/sites-available/mortgage /etc/nginx/sites-enabled/
sudo nginx -t          # 检查配置语法
sudo systemctl reload nginx

# 签发免费 SSL 证书（Let's Encrypt）
sudo certbot --nginx -d your-domain.com -d www.your-domain.com

# 设置证书自动续期
sudo systemctl enable certbot.timer
sudo systemctl start certbot.timer
```

#### 步骤五：验证

```bash
# 检查 Nginx 状态
sudo systemctl status nginx

# 测试 HTTPS
curl -I https://your-domain.com
```

---

## 方案二：前端 + FastAPI 后端完整部署

如需同时运行 Python FastAPI 后端 API：

### 后端部署（FastAPI）

#### 步骤一：安装依赖

```bash
cd mortgage-calculator/backend
pip install -r requirements.txt
pip install gunicorn uvicorn[standard]
```

#### 步骤二：创建 systemd 服务

创建 `/etc/systemd/system/mortgage-api.service`：

```ini
[Unit]
Description=Mortgage Calculator FastAPI
After=network.target

[Service]
Type=simple
User=www-data
WorkingDirectory=/var/www/mortgage-api
ExecStart=/usr/local/bin/gunicorn main:app \
    --workers 4 \
    --worker-class uvicorn.workers.UvicornWorker \
    --bind 0.0.0.0:8000 \
    --timeout 60 \
    --access-logfile /var/log/mortgage-api/access.log \
    --error-logfile /var/log/mortgage-api/error.log
Restart=always
RestartSec=3

[Install]
WantedBy=multi-user.target
```

```bash
# 创建日志目录
sudo mkdir -p /var/log/mortgage-api
sudo chown www-data /var/log/mortgage-api

# 复制后端文件
sudo cp -r mortgage-calculator/backend/* /var/www/mortgage-api/

# 启动服务
sudo systemctl daemon-reload
sudo systemctl enable mortgage-api
sudo systemctl start mortgage-api
sudo systemctl status mortgage-api
```

#### 步骤三：Nginx 反向代理后端

在 Nginx 配置中添加 API 路由：

```nginx
server {
    # ... 其他配置 ...
    
    # API 反向代理
    location /api/ {
        proxy_pass http://127.0.0.1:8000/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        
        # CORS（如前端与后端不同域）
        add_header Access-Control-Allow-Origin "https://your-domain.com" always;
        add_header Access-Control-Allow-Methods "GET, POST, OPTIONS" always;
        add_header Access-Control-Allow-Headers "Content-Type, Authorization" always;
    }
}
```

---

## 域名与 HTTPS 配置

### 推荐域名选择

| 域名示例 | 目标用户 |
|---------|---------|
| `mortgage-calc.com` | 英语国际市场 |
| `房贷计算器.cn` | 中文市场（支持中文域名） |
| `mortgagecalculator.com.au` | 澳大利亚市场 |
| `home-loan-calculator.ca` | 加拿大市场 |

### DNS 推荐配置

```
A      @        服务器IP
CNAME  www      @
TXT    @        "v=spf1 include:sendgrid.net ~all"
```

---

## SEO 优化部署检查清单

部署后，逐一检查以下 SEO 项目：

### ✅ 技术 SEO

- [ ] **HTTPS** 已启用，HTTP 自动跳转 HTTPS
- [ ] **www 重定向** 已配置（统一到 www 或非 www）
- [ ] **favicon.ico** 可访问：`https://your-domain.com/favicon.ico`
- [ ] **页面加载速度** < 3 秒（可用 PageSpeed Insights 测试）
- [ ] **移动端友好**（Responsive Design 已实现）
- [ ] **robots.txt** 已创建（见下方）
- [ ] **sitemap.xml** 已提交（见下方）
- [ ] **Canonical URL** 已设置为实际域名

### 创建 robots.txt

在 `frontend/` 目录创建 `robots.txt`：

```
User-agent: *
Allow: /

Sitemap: https://your-domain.com/sitemap.xml
```

### 创建 sitemap.xml

在 `frontend/` 目录创建 `sitemap.xml`：

```xml
<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:xhtml="http://www.w3.org/1999/xhtml">
  <url>
    <loc>https://your-domain.com/</loc>
    <xhtml:link rel="alternate" hreflang="zh-CN" href="https://your-domain.com/?lang=zh"/>
    <xhtml:link rel="alternate" hreflang="en" href="https://your-domain.com/?lang=en"/>
    <lastmod>2026-03-22</lastmod>
    <changefreq>weekly</changefreq>
    <priority>1.0</priority>
  </url>
</urlset>
```

### 提交 Google Search Console

1. 访问 [Google Search Console](https://search.google.com/search-console/)
2. 添加属性 → 输入你的域名
3. 验证所有权（推荐 DNS TXT 验证）
4. 提交 Sitemap：Sitemaps → 输入 `sitemap.xml` → 提交
5. 申请索引：URL 检查 → 输入首页 URL → 请求编入索引

### 提交 Bing Webmaster Tools

1. 访问 [Bing Webmaster Tools](https://www.bing.com/webmasters/)
2. 添加站点 → 提交 sitemap

---

## CDN & 性能优化

### 使用 Cloudflare 免费 CDN

如果使用自托管服务器，可以在前面套一层 Cloudflare CDN：

1. 在 Cloudflare 添加你的域名
2. 修改域名 NS 记录指向 Cloudflare
3. 开启 **Auto Minify**（JS/CSS/HTML）
4. 开启 **Rocket Loader**
5. 开启 **Brotli 压缩**
6. 缓存规则：HTML `No Cache`，静态资源 `1 Month`

### 腾讯云 CDN（国内加速）

适合面向中国用户：

```bash
# 腾讯云 CDN 配置（需要 ICP 备案）
源站：你的服务器 IP
加速域名：your-domain.com
缓存规则：
  *.html → 不缓存
  *.js, *.css, *.ico → 缓存 30 天
  *.json → 缓存 1 天
```

---

## 常见问题排查

### 问题：页面加载空白

```bash
# 检查 Nginx 错误日志
sudo tail -f /var/log/nginx/mortgage_error.log

# 检查文件权限
sudo chown -R www-data:www-data /var/www/mortgage
sudo chmod -R 755 /var/www/mortgage
```

### 问题：HTTPS 证书过期

```bash
# 手动续期
sudo certbot renew

# 检查自动续期定时器
sudo systemctl status certbot.timer
```

### 问题：汇率 API 跨域报错

在 Nginx 配置中添加：
```nginx
# 允许跨域请求汇率 API
location /api/rates {
    add_header Access-Control-Allow-Origin * always;
}
```

### 问题：Google 搜索不收录

- 确认 `robots.txt` 未屏蔽爬虫
- 确认页面可正常加载 JS（Google 会执行 JS）
- 在 Search Console 手动请求编入索引
- 等待 1-4 周自然收录

### 问题：移动端显示异常

确认 HTML 中有正确的 viewport meta tag：
```html
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
```

---

## 一键部署脚本（Linux VPS）

保存为 `deploy.sh`，在服务器上运行：

```bash
#!/bin/bash
set -e

DOMAIN="your-domain.com"
WEB_ROOT="/var/www/mortgage"
REPO_URL="https://github.com/你的用户名/mortgage-calculator.git"

echo "📦 安装依赖..."
apt-get update -qq
apt-get install -y -qq nginx certbot python3-certbot-nginx git

echo "📁 拉取最新代码..."
if [ -d "$WEB_ROOT" ]; then
    cd $WEB_ROOT && git pull
else
    git clone $REPO_URL /tmp/mortgage-repo
    mkdir -p $WEB_ROOT
    cp -r /tmp/mortgage-repo/frontend/* $WEB_ROOT/
fi

echo "🔧 配置 Nginx..."
cat > /etc/nginx/sites-available/mortgage << EOF
server {
    listen 80;
    server_name $DOMAIN www.$DOMAIN;
    root $WEB_ROOT;
    index index.html;
    gzip on;
    gzip_types text/html text/css application/javascript;
    location / { try_files \$uri \$uri/ /index.html; }
}
EOF

ln -sf /etc/nginx/sites-available/mortgage /etc/nginx/sites-enabled/
nginx -t && systemctl reload nginx

echo "🔐 签发 SSL 证书..."
certbot --nginx -d $DOMAIN -d www.$DOMAIN --non-interactive --agree-tos -m admin@$DOMAIN

echo "✅ 部署完成！访问 https://$DOMAIN"
```

```bash
# 运行部署脚本
chmod +x deploy.sh
sudo ./deploy.sh
```

---

## 快速参考

| 操作 | 命令 |
|------|------|
| 重启 Nginx | `sudo systemctl restart nginx` |
| 查看 Nginx 日志 | `sudo tail -f /var/log/nginx/mortgage_access.log` |
| 手动续签证书 | `sudo certbot renew` |
| 同步新文件 | `rsync -avz frontend/ user@server:/var/www/mortgage/` |
| 检查证书到期 | `sudo certbot certificates` |

---

*最后更新：2026-03-22 | 全球房贷计算器部署文档 v1.0*
