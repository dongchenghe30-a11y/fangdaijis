/**
 * 全球房贷计算器 - 主组件
 * 包含：左侧输入面板 + 右侧结果面板 + 汇率工具栏 + FAQ
 */
'use client'

import { useState, useEffect, useCallback } from 'react'
import axios from 'axios'
import {
  PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer,
  LineChart, Line, XAxis, YAxis, CartesianGrid
} from 'recharts'

// ──────────────────────────────────────────────
// 类型定义
// ──────────────────────────────────────────────

interface ScheduleItem {
  period: number
  payment: number
  principal: number
  interest: number
  extra_payment: number
  balance: number
}

interface MortgageResult {
  monthly_payment: number
  total_payment: number
  total_interest: number
  total_principal: number
  actual_periods: number
  interest_saved: number
  schedule: ScheduleItem[]
  currency: string
}

interface LumpSum {
  id: number
  month: number
  amount: number
}

interface CountryPreset {
  name: string
  currency: string
  symbol: string
  rate: number
  years: number
}

// ──────────────────────────────────────────────
// 国家预设数据
// ──────────────────────────────────────────────

const COUNTRY_PRESETS: Record<string, CountryPreset> = {
  CN: { name: '🇨🇳 中国', currency: 'CNY', symbol: '¥', rate: 3.95, years: 30 },
  US: { name: '🇺🇸 美国', currency: 'USD', symbol: '$', rate: 7.2, years: 30 },
  HK: { name: '🇭🇰 香港', currency: 'HKD', symbol: 'HK$', rate: 4.625, years: 30 },
  GB: { name: '🇬🇧 英国', currency: 'GBP', symbol: '£', rate: 5.49, years: 25 },
  SG: { name: '🇸🇬 新加坡', currency: 'SGD', symbol: 'S$', rate: 3.75, years: 30 },
  JP: { name: '🇯🇵 日本', currency: 'JPY', symbol: '¥', rate: 0.375, years: 35 },
}

// FAQ 数据
const FAQ_DATA = [
  {
    q: '等额本息和等额本金有什么区别？',
    a: '等额本息是每月还款金额固定，前期利息占比高、本金占比低，适合收入稳定的工薪族；等额本金是每月本金固定，利息逐月递减，总利息比等额本息少，但前期月供较高，适合有一定资金积累的借款人。',
  },
  {
    q: '提前还款有什么好处？',
    a: '提前还款可以减少剩余本金，从而节省后续的利息支出，缩短还款年限。以100万、30年、4.2%利率为例，每月额外多还1000元，可节省约10万元利息，提前约5年还清。',
  },
  {
    q: '双周还款为什么能省利息？',
    a: '双周还款即每两周还一次，每年还款26次，相当于多还了一个月。这样每年等于多还了一个月的本金，从而加快了本金减少速度，节省了利息。',
  },
  {
    q: '什么是LPR？中国房贷利率怎么定？',
    a: 'LPR（贷款市场报价利率）是中国银行间贷款的基准利率，由中国人民银行每月公布。大多数个人房贷以5年期LPR为基准加减点形成，目前5年期LPR为3.95%，各地银行根据政策有所浮动。',
  },
]

// ──────────────────────────────────────────────
// 格式化工具
// ──────────────────────────────────────────────

function formatMoney(n: number, symbol: string) {
  return symbol + ' ' + Math.round(n).toLocaleString('zh-CN')
}

// ──────────────────────────────────────────────
// 主组件
// ──────────────────────────────────────────────

export default function MortgageCalculator() {
  // 表单状态
  const [country, setCountry] = useState('CN')
  const [loanAmount, setLoanAmount] = useState(1000000)
  const [annualRate, setAnnualRate] = useState(3.95)
  const [loanYears, setLoanYears] = useState(30)
  const [repayMethod, setRepayMethod] = useState<'equal_installment' | 'equal_principal'>('equal_installment')
  const [payFreq, setPayFreq] = useState<'monthly' | 'biweekly'>('monthly')
  const [extraMonthly, setExtraMonthly] = useState(0)
  const [lumpSums, setLumpSums] = useState<LumpSum[]>([])

  // 结果状态
  const [result, setResult] = useState<MortgageResult | null>(null)
  const [loading, setLoading] = useState(false)
  const [showFull, setShowFull] = useState(false)

  // 汇率状态
  const [rates, setRates] = useState<Record<string, number>>({})
  const [faqOpen, setFaqOpen] = useState<number | null>(null)

  const preset = COUNTRY_PRESETS[country]

  // 国家切换时自动填入默认利率
  const handleCountryChange = useCallback((code: string) => {
    setCountry(code)
    const p = COUNTRY_PRESETS[code]
    setAnnualRate(p.rate)
    setLoanYears(p.years)
  }, [])

  // 加载汇率
  useEffect(() => {
    fetch('/api/exchange-rates?base=USD')
      .then(r => r.json())
      .then(data => setRates(data.rates || {}))
      .catch(() => {})
  }, [])

  // 计算
  const handleCalculate = async () => {
    setLoading(true)
    try {
      const body = {
        loan_amount: loanAmount,
        annual_rate: annualRate,
        loan_years: loanYears,
        repayment_method: repayMethod,
        payment_frequency: payFreq,
        monthly_extra_payment: extraMonthly,
        lump_sum_prepayments: lumpSums.map(l => ({ month: l.month, amount: l.amount })),
        currency: preset.currency,
      }
      const { data } = await axios.post<MortgageResult>('/api/calculate', body)
      setResult(data)
      setShowFull(false)
    } catch (err: any) {
      alert('计算出错：' + (err?.response?.data?.detail || err.message))
    } finally {
      setLoading(false)
    }
  }

  // CSV 下载
  const downloadCSV = () => {
    if (!result) return
    const header = ['期次', '还款额', '本金', '利息', '额外还款', '剩余本金', '货币'].join(',')
    const rows = result.schedule.map(r =>
      [r.period, r.payment.toFixed(2), r.principal.toFixed(2),
       r.interest.toFixed(2), r.extra_payment.toFixed(2), r.balance.toFixed(2), preset.currency].join(',')
    )
    const csv = '\uFEFF' + header + '\n' + rows.join('\n')
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const a = document.createElement('a')
    a.href = URL.createObjectURL(blob)
    a.download = `还款计划_${preset.currency}.csv`
    a.click()
  }

  const displaySchedule = showFull ? result?.schedule : result?.schedule.slice(0, 24)
  const rateKeys = ['CNY', 'HKD', 'GBP', 'EUR', 'JPY', 'SGD']

  return (
    <div className="min-h-screen bg-slate-950">
      {/* ── 顶部导航 ── */}
      <nav className="sticky top-0 z-50 border-b border-slate-800 bg-slate-950/95 backdrop-blur">
        <div className="max-w-7xl mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-2xl">🏠</span>
            <span className="font-bold text-white">全球房贷计算器</span>
          </div>
          <div className="text-xs text-slate-500">
            {new Date().toLocaleDateString('zh-CN')} · 数据仅供参考
          </div>
        </div>
      </nav>

      {/* ── 汇率工具栏 ── */}
      <div className="border-b border-slate-800 bg-slate-900 overflow-x-auto">
        <div className="max-w-7xl mx-auto px-4 py-2 flex items-center gap-3">
          <span className="text-xs text-slate-500 shrink-0">实时汇率</span>
          <div className="flex gap-2">
            {rateKeys.map(cur => (
              <span key={cur} className="bg-slate-800 border border-slate-700 rounded-lg px-3 py-1 text-xs whitespace-nowrap">
                <span className="text-slate-500">USD/</span>
                <span className="text-white font-medium">{cur}</span>
                <span className="text-sky-400 ml-1.5">
                  {rates[cur] ? rates[cur].toFixed(cur === 'JPY' ? 1 : 4) : '—'}
                </span>
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* ── SEO H1 ── */}
      <div className="max-w-7xl mx-auto px-4 pt-8 pb-2">
        <h1 className="text-2xl font-bold text-white">全球房贷计算器</h1>
        <p className="text-slate-400 text-sm mt-1">
          支持中国、美国、香港、英国等多国利率 · 等额本息 / 等额本金 · 提前还款模拟
        </p>
      </div>

      {/* ── 主体 ── */}
      <main className="max-w-7xl mx-auto px-4 py-6 flex flex-col lg:flex-row gap-6">

        {/* ══ 左侧输入面板 ══ */}
        <div className="w-full lg:w-[420px] flex-shrink-0 space-y-4">

          {/* 国家选择 */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
            <h2 className="text-xs font-semibold text-slate-400 mb-3 uppercase tracking-wider">选择国家/地区</h2>
            <div className="flex flex-wrap gap-2">
              {Object.entries(COUNTRY_PRESETS).map(([code, p]) => (
                <button
                  key={code}
                  onClick={() => handleCountryChange(code)}
                  className={`px-3 py-2 rounded-xl text-xs border transition-all ${
                    country === code
                      ? 'border-sky-500 bg-sky-500/10 text-sky-400'
                      : 'border-slate-700 bg-slate-800 text-slate-400 hover:border-slate-600'
                  }`}
                >
                  {p.name}
                </button>
              ))}
            </div>
          </div>

          {/* 贷款参数 */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
            <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">贷款参数</h2>

            <div>
              <label className="text-xs text-slate-400 block mb-1.5">贷款金额</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">
                  {preset.symbol}
                </span>
                <input
                  type="number"
                  value={loanAmount}
                  onChange={e => setLoanAmount(+e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl text-slate-200 pl-7 pr-3 py-2.5 text-sm focus:border-sky-500 outline-none transition-colors"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-slate-400 block mb-1.5">年利率 (%)</label>
                <input
                  type="number"
                  value={annualRate}
                  step={0.01}
                  onChange={e => setAnnualRate(+e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl text-slate-200 px-3 py-2.5 text-sm focus:border-sky-500 outline-none transition-colors"
                />
              </div>
              <div>
                <label className="text-xs text-slate-400 block mb-1.5">贷款年限</label>
                <input
                  type="number"
                  value={loanYears}
                  onChange={e => setLoanYears(+e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl text-slate-200 px-3 py-2.5 text-sm focus:border-sky-500 outline-none transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="text-xs text-slate-400 block mb-1.5">还款方式</label>
              <select
                value={repayMethod}
                onChange={e => setRepayMethod(e.target.value as any)}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl text-slate-200 px-3 py-2.5 text-sm focus:border-sky-500 outline-none"
              >
                <option value="equal_installment">等额本息（每月固定）</option>
                <option value="equal_principal">等额本金（本金固定，利息递减）</option>
              </select>
            </div>

            <div>
              <label className="text-xs text-slate-400 block mb-1.5">还款频率</label>
              <select
                value={payFreq}
                onChange={e => setPayFreq(e.target.value as any)}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl text-slate-200 px-3 py-2.5 text-sm focus:border-sky-500 outline-none"
              >
                <option value="monthly">按月还款</option>
                <option value="biweekly">双周还款（每两周一次）</option>
              </select>
            </div>
          </div>

          {/* 提前还款 */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
            <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">提前还款（可选）</h2>

            <div>
              <label className="text-xs text-slate-400 block mb-1.5">每月额外还款</label>
              <input
                type="number"
                value={extraMonthly}
                min={0}
                onChange={e => setExtraMonthly(+e.target.value)}
                placeholder="如：1000"
                className="w-full bg-slate-800 border border-slate-700 rounded-xl text-slate-200 px-3 py-2.5 text-sm focus:border-sky-500 outline-none"
              />
            </div>

            <div>
              <label className="text-xs text-slate-400 block mb-2">一次性大额还款</label>
              {lumpSums.map((l, i) => (
                <div key={l.id} className="flex gap-2 mb-2">
                  <input
                    type="number"
                    placeholder="月份"
                    value={l.month}
                    onChange={e => {
                      const updated = [...lumpSums]
                      updated[i].month = +e.target.value
                      setLumpSums(updated)
                    }}
                    className="w-24 bg-slate-800 border border-slate-700 rounded-xl text-slate-200 px-3 py-2 text-sm outline-none"
                  />
                  <input
                    type="number"
                    placeholder="金额"
                    value={l.amount}
                    onChange={e => {
                      const updated = [...lumpSums]
                      updated[i].amount = +e.target.value
                      setLumpSums(updated)
                    }}
                    className="flex-1 bg-slate-800 border border-slate-700 rounded-xl text-slate-200 px-3 py-2 text-sm outline-none"
                  />
                  <button
                    onClick={() => setLumpSums(lumpSums.filter((_, j) => j !== i))}
                    className="text-slate-500 hover:text-red-400 text-xl leading-none"
                  >×</button>
                </div>
              ))}
              <button
                onClick={() => setLumpSums([...lumpSums, { id: Date.now(), month: 12, amount: 0 }])}
                className="text-xs text-sky-400 hover:text-sky-300 flex items-center gap-1 mt-1"
              >
                + 添加一次性还款
              </button>
            </div>
          </div>

          {/* 操作按钮 */}
          <div className="flex gap-3">
            <button
              onClick={handleCalculate}
              disabled={loading}
              className="flex-1 bg-gradient-to-r from-sky-500 to-indigo-500 hover:opacity-90 disabled:opacity-50 text-white font-semibold py-3 rounded-xl transition-all"
            >
              {loading ? '计算中...' : '立即计算'}
            </button>
            <button
              onClick={() => { setResult(null); setLumpSums([]); setExtraMonthly(0) }}
              className="bg-slate-800 hover:bg-slate-700 text-slate-400 font-medium py-3 px-5 rounded-xl transition-colors"
            >
              重置
            </button>
          </div>
        </div>

        {/* ══ 右侧结果面板 ══ */}
        <div className="flex-1 min-w-0">
          {!result ? (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-16 text-center">
              <div className="text-5xl mb-4">🏡</div>
              <p className="text-slate-400">填写左侧参数，点击「立即计算」</p>
              <p className="text-slate-600 text-sm mt-1">获取月供、总利息及完整还款计划</p>
            </div>
          ) : (
            <div className="space-y-5 animate-in fade-in slide-in-from-bottom-4 duration-300">

              {/* 核心数字卡片 */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="col-span-2 bg-slate-900 border border-slate-800 rounded-2xl p-5 text-center">
                  <p className="text-xs text-slate-400 mb-1">月供</p>
                  <p className="text-4xl font-bold bg-gradient-to-r from-sky-400 to-indigo-400 bg-clip-text text-transparent">
                    {formatMoney(result.monthly_payment, preset.symbol)}
                  </p>
                  <p className="text-xs text-slate-500 mt-1">{preset.currency} / 月</p>
                </div>
                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 text-center">
                  <p className="text-xs text-slate-400 mb-1">总还款额</p>
                  <p className="text-lg font-bold text-white">{formatMoney(result.total_payment, preset.symbol)}</p>
                </div>
                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 text-center">
                  <p className="text-xs text-slate-400 mb-1">总利息</p>
                  <p className="text-lg font-bold text-amber-400">{formatMoney(result.total_interest, preset.symbol)}</p>
                </div>
                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 text-center">
                  <p className="text-xs text-slate-400 mb-1">实际还款期</p>
                  <p className="text-lg font-bold text-white">{result.actual_periods} 期</p>
                </div>
                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 text-center">
                  <p className="text-xs text-slate-400 mb-1">节省利息</p>
                  <p className="text-lg font-bold text-emerald-400">
                    {result.interest_saved > 0 ? formatMoney(result.interest_saved, preset.symbol) : '-'}
                  </p>
                </div>
              </div>

              {/* 图表 */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* 饼图 */}
                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
                  <h2 className="text-xs font-semibold text-slate-400 mb-4 uppercase tracking-wider">本金与利息占比</h2>
                  <ResponsiveContainer width="100%" height={200}>
                    <PieChart>
                      <Pie
                        data={[
                          { name: '本金', value: Math.round(result.total_principal) },
                          { name: '利息', value: Math.round(result.total_interest) },
                        ]}
                        cx="50%" cy="50%"
                        innerRadius={55} outerRadius={80}
                        paddingAngle={3}
                        dataKey="value"
                      >
                        <Cell fill="#0ea5e9" />
                        <Cell fill="#f59e0b" />
                      </Pie>
                      <Tooltip formatter={(v: number) => Math.round(v).toLocaleString()} />
                      <Legend iconType="circle" wrapperStyle={{ fontSize: 12, color: '#94a3b8' }} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>

                {/* 折线图 */}
                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
                  <h2 className="text-xs font-semibold text-slate-400 mb-4 uppercase tracking-wider">剩余本金走势</h2>
                  <ResponsiveContainer width="100%" height={200}>
                    <LineChart
                      data={result.schedule.filter((_, i) =>
                        i % Math.max(1, Math.floor(result.schedule.length / 60)) === 0
                      )}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                      <XAxis dataKey="period" tick={{ fill: '#475569', fontSize: 10 }} tickLine={false} />
                      <YAxis
                        tick={{ fill: '#475569', fontSize: 10 }}
                        tickFormatter={v => (v / 10000).toFixed(0) + '万'}
                        tickLine={false}
                      />
                      <Tooltip formatter={(v: number) => Math.round(v).toLocaleString()} labelFormatter={l => `第${l}期`} />
                      <Line type="monotone" dataKey="balance" stroke="#0ea5e9" dot={false} strokeWidth={2} name="剩余本金" />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* 还款计划表 */}
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-sm font-semibold text-slate-300">还款计划表</h2>
                  <div className="flex gap-2">
                    <button
                      onClick={downloadCSV}
                      className="text-xs bg-slate-800 hover:bg-slate-700 text-slate-400 px-3 py-1.5 rounded-lg transition-colors"
                    >
                      ⬇ CSV
                    </button>
                    {result.schedule.length > 24 && (
                      <button
                        onClick={() => setShowFull(!showFull)}
                        className="text-xs bg-slate-800 hover:bg-slate-700 text-slate-400 px-3 py-1.5 rounded-lg transition-colors"
                      >
                        {showFull ? '收起' : '查看全部'}
                      </button>
                    )}
                  </div>
                </div>
                <div className="overflow-x-auto rounded-xl" style={{ maxHeight: 400, overflowY: 'auto' }}>
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="bg-slate-950 text-slate-500">
                        <th className="py-2.5 px-3 text-center font-medium">期次</th>
                        <th className="py-2.5 px-3 text-right font-medium">还款额</th>
                        <th className="py-2.5 px-3 text-right font-medium">本金</th>
                        <th className="py-2.5 px-3 text-right font-medium">利息</th>
                        <th className="py-2.5 px-3 text-right font-medium">额外还款</th>
                        <th className="py-2.5 px-3 text-right font-medium">剩余本金</th>
                      </tr>
                    </thead>
                    <tbody>
                      {displaySchedule?.map(row => (
                        <tr key={row.period} className="border-b border-slate-800 hover:bg-slate-800/50 transition-colors">
                          <td className="py-2 px-3 text-center text-slate-500">{row.period}</td>
                          <td className="py-2 px-3 text-right text-slate-300">{Math.round(row.payment).toLocaleString()}</td>
                          <td className="py-2 px-3 text-right text-sky-400">{Math.round(row.principal).toLocaleString()}</td>
                          <td className="py-2 px-3 text-right text-amber-400">{Math.round(row.interest).toLocaleString()}</td>
                          <td className="py-2 px-3 text-right text-emerald-400">{row.extra_payment > 0 ? Math.round(row.extra_payment).toLocaleString() : '-'}</td>
                          <td className="py-2 px-3 text-right text-slate-300">{Math.round(row.balance).toLocaleString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <p className="text-xs text-slate-600 mt-2">
                  {!showFull && result.schedule.length > 24
                    ? `显示前24期，共 ${result.schedule.length} 期`
                    : `共 ${result.schedule.length} 期`}
                </p>
              </div>

            </div>
          )}
        </div>
      </main>

      {/* ── FAQ ── */}
      <section className="max-w-7xl mx-auto px-4 py-10">
        <h2 className="text-xl font-bold text-white mb-6">房贷知识问答</h2>
        <div className="bg-slate-900 border border-slate-800 rounded-2xl divide-y divide-slate-800">
          {FAQ_DATA.map((item, i) => (
            <div key={i}>
              <button
                className="w-full text-left px-5 py-4 flex justify-between items-center text-sm font-medium text-slate-300 hover:text-white transition-colors"
                onClick={() => setFaqOpen(faqOpen === i ? null : i)}
              >
                {item.q}
                <span className="text-slate-500 text-lg ml-4">{faqOpen === i ? '−' : '+'}</span>
              </button>
              {faqOpen === i && (
                <div className="px-5 pb-4 text-sm text-slate-400 leading-relaxed">{item.a}</div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* ── 免责声明 ── */}
      <section className="max-w-7xl mx-auto px-4 py-6 border-t border-slate-800">
        <p className="text-xs text-slate-600 leading-relaxed">
          <strong className="text-slate-500">免责声明：</strong>
          本计算器提供的所有计算结果仅供参考，不构成任何财务建议或贷款承诺。实际贷款利率、还款金额及税费可能因银行政策、个人信用状况、地区差异及市场变化而有所不同。在做出任何贷款决策前，请咨询持牌金融机构或专业理财顾问。
        </p>
      </section>

      {/* ── 页脚 ── */}
      <footer className="border-t border-slate-800 py-6 text-center">
        <p className="text-slate-600 text-xs">© 2024 全球房贷计算器 · 仅供参考使用</p>
      </footer>
    </div>
  )
}
