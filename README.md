# 全球房贷计算器

一个功能完整的全球房贷计算器，包含：
- **后端**：Python FastAPI（端口 8000）
- **前端**：Next.js 14 + Tailwind CSS（端口 3000）
- **数据**：全球主要国家银行数据 + 中英双语 i18n

---

## 项目结构

```
mortgage-calculator/
├── backend/
│   ├── main.py          # FastAPI 主程序（全部计算逻辑）
│   └── requirements.txt
├── frontend/
│   ├── app/
│   │   ├── layout.tsx   # Next.js 根布局
│   │   ├── page.tsx     # 入口页面（SEO元数据）
│   │   └── globals.css
│   ├── components/
│   │   └── MortgageCalculator.tsx  # 主计算器组件
│   ├── index.html       # 独立 HTML 预览版（无需安装）
│   ├── package.json
│   ├── next.config.js
│   ├── tailwind.config.ts
│   └── tsconfig.json
└── data/
    ├── countries.json   # 全球银行与利率数据库
    └── i18n.json        # 中英双语配置
```

---

## 快速启动

### 方式一：直接预览（无需安装）

双击打开 `frontend/index.html`，即可在浏览器中使用完整功能（纯前端计算）。

---

### 方式二：完整部署（后端 + 前端）

#### 1. 启动后端

```bash
cd backend

# 安装依赖
pip install -r requirements.txt

# 启动服务
python main.py
# 或
uvicorn main:app --reload --port 8000
```

后端启动后访问：http://localhost:8000/docs 查看 Swagger API 文档

#### 2. 启动前端（Next.js）

```bash
cd frontend

# 安装依赖
npm install

# 开发模式
npm run dev
# 访问：http://localhost:3000

# 生产构建
npm run build && npm run start
```

---

## 后端 API 文档

### POST /api/calculate - 房贷计算

```json
{
  "loan_amount": 1000000,
  "annual_rate": 4.2,
  "loan_years": 30,
  "repayment_method": "equal_installment",  // 或 "equal_principal"
  "payment_frequency": "monthly",            // 或 "biweekly"
  "monthly_extra_payment": 500,
  "lump_sum_prepayments": [
    {"month": 12, "amount": 50000}
  ],
  "currency": "CNY"
}
```

**返回**：月供、总利息、总还款额、节省利息、完整还款计划表

---

### GET /api/exchange-rates?base=USD - 获取实时汇率

### POST /api/exchange - 货币换算

---

## 功能特性

| 功能 | 说明 |
|------|------|
| 等额本息 | 每月固定还款，前期多还利息 |
| 等额本金 | 本金固定，利息逐月递减 |
| 月还 / 双周还 | 双周还每年多还一期，节省利息 |
| 每月额外还款 | 持续性提前还款 |
| 一次性大额还款 | 指定月份大额提前还款 |
| 完整还款计划表 | 逐期本金/利息/余额，支持CSV导出 |
| 国家/利率切换 | 6国预设：中国、美国、香港、英国、新加坡、日本 |
| 实时汇率工具栏 | 11种主流货币，优先实时API，降级静态数据 |
| 饼图 | 本金与利息占比可视化 |
| 折线图 | 剩余本金随时间下降趋势 |
| SEO优化 | 语义化H1/H2、Meta Description、OG标签 |
| 多语言 | 中英双语 i18n 支持 |
| 免责声明 | 符合AdSense要求的法律文本 |

---

## 支持国家与利率

| 国家 | 基准利率 | 货币 |
|------|----------|------|
| 🇨🇳 中国 | LPR 3.95% | CNY |
| 🇺🇸 美国 | SOFR 5.3% | USD |
| 🇭🇰 香港 | HIBOR 4.6% | HKD |
| 🇬🇧 英国 | BOE 5.25% | GBP |
| 🇸🇬 新加坡 | SORA 3.7% | SGD |
| 🇯🇵 日本 | BOJ 0.1% | JPY |
