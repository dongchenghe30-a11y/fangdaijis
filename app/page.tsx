/**
 * 全球房贷计算器 - Next.js 14 App Router 入口页面
 * 使用 Tailwind CSS + Recharts 构建
 */

import type { Metadata } from 'next'
import MortgageCalculator from '@/components/MortgageCalculator'

// SEO 元数据
export const metadata: Metadata = {
  title: '全球房贷计算器 - 免费在线房贷月供计算工具',
  description: '免费使用全球房贷计算器，支持中国、美国、香港、英国、新加坡等多国利率。精确计算等额本息/等额本金月供、总利息、还款计划表，支持提前还款模拟。',
  keywords: ['房贷计算器', '房贷月供计算', '等额本息', '等额本金', '提前还款', '按揭计算器'],
  openGraph: {
    title: '全球房贷计算器',
    description: '精确计算各国房贷月供、总利息及完整还款计划',
    type: 'website',
  },
}

export default function HomePage() {
  return (
    <main>
      <MortgageCalculator />
    </main>
  )
}
