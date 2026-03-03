'use client'

import { useEffect, useState } from 'react'
import { AdminHeader } from '@/components/admin/header'
import { formatPrice, formatDate } from '@/lib/utils'
import { ShoppingCart } from 'lucide-react'

interface Order {
  _id: string
  user?: { name?: string; email?: string }
  products: Array<{ name: string }>
  total: number
  status: string
  createdAt: string
}

const STATUS_LABELS: Record<string, { label: string; color: string }> = {
  paid: { label: 'Pago', color: 'bg-green-100 text-green-700' },
  pending: { label: 'Pendente', color: 'bg-yellow-100 text-yellow-700' },
  failed: { label: 'Falhou', color: 'bg-red-100 text-red-700' },
  refunded: { label: 'Reembolsado', color: 'bg-gray-100 text-gray-600' },
}

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/admin/orders?limit=50')
      .then((r) => r.json())
      .then((d) => { setOrders(d.data ?? []); setLoading(false) })
  }, [])

  return (
    <div className="p-4 md:p-6 space-y-5">
      <AdminHeader title="Pedidos" />

      <div className="bg-white rounded-xl border shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-10 text-center text-gray-400">Carregando...</div>
        ) : orders.length === 0 ? (
          <div className="p-10 text-center">
            <ShoppingCart className="w-12 h-12 text-gray-200 mx-auto mb-3" />
            <p className="text-gray-500 font-medium">Nenhum pedido ainda</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-gray-50">
                  <th className="text-left px-5 py-3 font-medium text-gray-500">#</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-500">Cliente</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-500 hidden md:table-cell">Produtos</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-500">Total</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-500">Status</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-500 hidden sm:table-cell">Data</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {orders.map((o) => {
                  const s = STATUS_LABELS[o.status] ?? { label: o.status, color: 'bg-gray-100 text-gray-600' }
                  return (
                    <tr key={o._id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-5 py-3.5 font-mono text-xs text-gray-500">
                        #{o._id.slice(-6).toUpperCase()}
                      </td>
                      <td className="px-4 py-3.5">
                        <p className="font-medium text-gray-900">{o.user?.name ?? '—'}</p>
                        <p className="text-xs text-gray-400">{o.user?.email}</p>
                      </td>
                      <td className="px-4 py-3.5 text-gray-600 hidden md:table-cell max-w-xs truncate">
                        {o.products.map((p) => p.name).join(', ')}
                      </td>
                      <td className="px-4 py-3.5 font-semibold text-gray-900">
                        {formatPrice(o.total)}
                      </td>
                      <td className="px-4 py-3.5">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${s.color}`}>
                          {s.label}
                        </span>
                      </td>
                      <td className="px-4 py-3.5 text-gray-500 hidden sm:table-cell text-xs">
                        {formatDate(o.createdAt)}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
