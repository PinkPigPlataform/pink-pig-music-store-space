'use client'

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'

interface MonthData {
  month: string
  revenue: number
}

interface RevenueChartProps {
  data: MonthData[]
}

function formatCurrency(v: number) {
  return `R$ ${v.toLocaleString('pt-BR')}`
}

export function RevenueChart({ data }: RevenueChartProps) {
  return (
    <ResponsiveContainer width="100%" height={260}>
      <AreaChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
        <defs>
          <linearGradient id="revenueGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#D37B93" stopOpacity={0.25} />
            <stop offset="100%" stopColor="#D37B93" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
        <XAxis dataKey="month" tick={{ fontSize: 12, fill: '#6b7280' }} axisLine={false} tickLine={false} />
        <YAxis tickFormatter={(v) => `R$${v}`} tick={{ fontSize: 11, fill: '#6b7280' }} axisLine={false} tickLine={false} width={56} />
        <Tooltip
          formatter={(v: number | undefined) => [v != null ? formatCurrency(v) : '—', 'Receita']}
          contentStyle={{ borderRadius: 8, border: 'none', boxShadow: '0 4px 24px rgba(0,0,0,0.08)' }}
          labelStyle={{ fontWeight: 600 }}
        />
        <Area
          type="monotone"
          dataKey="revenue"
          stroke="#D37B93"
          strokeWidth={2.5}
          fill="url(#revenueGrad)"
          dot={{ fill: '#D37B93', r: 3, strokeWidth: 0 }}
          activeDot={{ r: 5, fill: '#D37B93' }}
        />
      </AreaChart>
    </ResponsiveContainer>
  )
}
