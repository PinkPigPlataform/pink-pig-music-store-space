'use client'

import { useEffect, useState } from 'react'
import { AdminHeader } from '@/components/admin/header'
import { formatPrice, formatDate } from '@/lib/utils'
import { RevenueChart } from '@/components/admin/charts/revenue-chart'
import { OrdersChart } from '@/components/admin/charts/orders-chart'
import { ShoppingCart, Users, Package, DollarSign, TrendingUp, Clock } from 'lucide-react'

interface DashboardData {
  totalOrders: number
  totalRevenue: number
  totalUsers: number
  totalProducts: number
  recentOrders: Array<{
    _id: string
    user?: { name?: string; email?: string }
    products: Array<{ name: string }>
    total: number
    createdAt: string
  }>
}

interface MonthlyData {
  month: string
  revenue: number
  orders: number
  pending: number
}

export default function AdminDashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null)
  const [monthly, setMonthly] = useState<MonthlyData[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      fetch('/api/admin/dashboard').then((r) => r.json()),
      fetch('/api/admin/stats/monthly').then((r) => r.json()),
    ]).then(([dash, stats]) => {
      setData(dash.data)
      setMonthly(stats.data ?? [])
      setLoading(false)
    })
  }, [])

  const stats = data
    ? [
        {
          label: 'Receita Total',
          value: formatPrice(data.totalRevenue),
          icon: DollarSign,
          color: 'bg-emerald-50 text-emerald-600',
          trend: 'geral',
        },
        {
          label: 'Pedidos Pagos',
          value: data.totalOrders.toString(),
          icon: ShoppingCart,
          color: 'bg-blue-50 text-blue-600',
          trend: 'geral',
        },
        {
          label: 'Clientes',
          value: data.totalUsers.toString(),
          icon: Users,
          color: 'bg-orange-50 text-orange-600',
          trend: 'geral',
        },
        {
          label: 'Produtos Ativos',
          value: data.totalProducts.toString(),
          icon: Package,
          color: 'bg-pink-50 text-pink-600',
          trend: 'geral',
        },
      ]
    : []

  if (loading) {
    return (
      <div className="p-6">
        <AdminHeader title="Dashboard" />
        <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="bg-white rounded-xl border p-5 h-24 animate-pulse bg-gray-100" />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="p-4 md:p-6 space-y-6">
      <AdminHeader title="Dashboard" />

      {/* Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map(({ label, value, icon: Icon, color }) => (
          <div
            key={label}
            className="bg-white rounded-xl border p-4 md:p-5 flex items-center gap-3 md:gap-4 shadow-sm"
          >
            <div className={`p-2.5 md:p-3 rounded-xl shrink-0 ${color}`}>
              <Icon className="w-4 h-4 md:w-5 md:h-5" />
            </div>
            <div className="min-w-0">
              <p className="text-xs md:text-sm text-gray-500 truncate">{label}</p>
              <p className="text-xl md:text-2xl font-bold text-gray-900 leading-tight">{value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
        <div className="bg-white rounded-xl border p-5 shadow-sm">
          <div className="flex items-center gap-2 mb-5">
            <div className="p-1.5 bg-pink-50 rounded-lg">
              <TrendingUp className="w-4 h-4 text-pink-500" />
            </div>
            <div>
              <h2 className="font-semibold text-gray-900 text-sm md:text-base">Receita Mensal</h2>
              <p className="text-xs text-gray-500">Últimos 12 meses</p>
            </div>
          </div>
          {monthly.length > 0 ? (
            <RevenueChart data={monthly} />
          ) : (
            <div className="h-64 flex items-center justify-center text-gray-400 text-sm">
              Sem dados ainda
            </div>
          )}
        </div>

        <div className="bg-white rounded-xl border p-5 shadow-sm">
          <div className="flex items-center gap-2 mb-5">
            <div className="p-1.5 bg-blue-50 rounded-lg">
              <ShoppingCart className="w-4 h-4 text-blue-500" />
            </div>
            <div>
              <h2 className="font-semibold text-gray-900 text-sm md:text-base">Pedidos por Mês</h2>
              <p className="text-xs text-gray-500">Pagos vs. Pendentes</p>
            </div>
          </div>
          {monthly.length > 0 ? (
            <OrdersChart data={monthly} />
          ) : (
            <div className="h-64 flex items-center justify-center text-gray-400 text-sm">
              Sem dados ainda
            </div>
          )}
        </div>
      </div>

      {/* Recent Orders */}
      <div className="bg-white rounded-xl border shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b flex items-center gap-2">
          <Clock className="w-4 h-4 text-gray-400" />
          <h2 className="font-semibold text-gray-900">Pedidos Recentes</h2>
        </div>
        <div className="divide-y overflow-x-auto">
          {!data?.recentOrders.length ? (
            <p className="px-6 py-10 text-center text-gray-400 text-sm">
              Nenhum pedido ainda. Os pedidos pós-pagamento aparecerão aqui.
            </p>
          ) : (
            data.recentOrders.map((order) => (
              <div
                key={order._id}
                className="px-5 py-3.5 flex items-center justify-between gap-4 min-w-[480px]"
              >
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-900 truncate">
                    {order.user?.name ?? order.user?.email ?? 'Cliente'}
                  </p>
                  <p className="text-xs text-gray-500 truncate">
                    {order.products.map((p) => p.name).join(', ')}
                  </p>
                </div>
                <div className="text-right shrink-0">
                  <p className="font-semibold text-gray-900">{formatPrice(order.total)}</p>
                  <p className="text-xs text-gray-500">{formatDate(order.createdAt)}</p>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
