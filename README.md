# 房贷计算器

一个功能完善、界面美观的房贷计算器，支持等额本息和等额本金两种还款方式。

## 功能特点

- **两种还款方式**：支持等额本息和等额本金计算
- **实时计算**：输入参数后即可计算结果
- **可视化图表**：使用Chart.js展示本金与利息比例
- **还款计划表**：详细展示每期还款明细
- **导出功能**：支持导出还款计划表为CSV文件
- **响应式设计**：完美适配桌面、平板和移动设备
- **滑块控制**：提供直观的滑块调整参数

## 文件结构

```
mortgage-calculator/
├── index.html          # 主页面
├── styles.css          # 样式文件
├── script.js           # JavaScript逻辑
├── .gitignore          # Git忽略文件
└── README.md           # 说明文档
```

## 部署到Cloudflare Pages

### 方法一：使用Cloudflare Pages控制台

1. 登录 [Cloudflare Dashboard](https://dash.cloudflare.com/)
2. 进入 Pages 页面
3. 点击 "Create a project"
4. 选择 "Upload assets"
5. 将以下文件压缩为ZIP文件并上传：
   - index.html
   - styles.css
   - script.js
6. 命名项目并点击部署

### 方法二：使用Wrangler CLI

1. 安装 Wrangler CLI：
```bash
npm install -g wrangler
```

2. 登录 Cloudflare：
```bash
wrangler login
```

3. 部署项目：
```bash
cd mortgage-calculator
wrangler pages project create mortgage-calculator
wrangler pages deploy . --project-name=mortgage-calculator
```

### 方法三：使用Git仓库

1. 将项目推送到GitHub/GitLab仓库
2. 在Cloudflare Pages中选择连接到仓库
3. 配置构建设置（静态项目无需构建命令）
4. 部署

## 本地预览

直接在浏览器中打开 `index.html` 文件即可预览。

或使用本地服务器：

```bash
# 使用Python
python -m http.server 8000

# 使用Node.js
npx serve .

# 然后访问 http://localhost:8000
```

## 使用说明

1. **贷款金额**：输入或拖动滑块设置贷款金额（单位：万元）
2. **贷款期限**：设置贷款年限（1-30年）
3. **年利率**：设置年化利率
4. **还款方式**：选择等额本息或等额本金
5. **计算**：点击"计算"按钮查看结果
6. **导出**：点击"导出还款计划"下载CSV文件

## 计算公式

### 等额本息

月供 = 贷款本金 × 月利率 × (1+月利率)^还款月数 / ((1+月利率)^还款月数 - 1)

### 等额本金

月供 = (贷款本金 / 还款月数) + (贷款本金 - 已还本金) × 月利率

## 浏览器兼容性

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## 技术栈

- HTML5
- CSS3（Grid & Flexbox）
- JavaScript（ES6+）
- Chart.js 4.4.1

## 注意事项

- 计算结果仅供参考，实际还款金额以银行公布为准
- 利率计算采用复利方式
- 所有金额保留两位小数

## 许可证

MIT License
