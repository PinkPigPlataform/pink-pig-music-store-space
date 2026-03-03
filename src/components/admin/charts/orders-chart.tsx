'use client'

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts'

interface MonthData {
  month: string
  orders: number
  pending: number
}

interface OrdersChartProps {
  data: MonthData[]
}

export function OrdersChart({ data }: OrdersChartProps) {
  return (
    <ResponsiveContainer width="100%" height={260}>
      <BarChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }} barGap={4}>
        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
        <XAxis dataKey="month" tick={{ fontSize: 12, fill: '#6b7280' }} axisLine={false} tickLine={false} />
        <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: '#6b7280' }} axisLine={false} tickLine={false} width={32} />
        <Tooltip
          contentStyle={{ borderRadius: 8, border: 'none', boxShadow: '0 4px 24px rgba(0,0,0,0.08)' }}
          labelStyle={{ fontWeight: 600 }}
        />
        <Legend
          wrapperStyle={{ fontSize: 12, paddingTop: 12 }}
          formatter={(val) => val === 'orders' ? 'Pagos' : 'Pendentes'}
        />
        <Bar dataKey="orders" fill="#D37B93" radius={[4, 4, 0, 0]} name="orders" />
        <Bar dataKey="pending" fill="#f2cad5" radius={[4, 4, 0, 0]} name="pending" />
      </BarChart>
    </ResponsiveContainer>
  )
}
