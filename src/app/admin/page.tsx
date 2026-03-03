import { AdminHeader } from '@/components/admin/header'
import { formatPrice, formatDate } from '@/lib/utils'
import { connectMongo } from '@/lib/mongodb'
import OrderModel from '@/lib/models/Order'
import UserModel from '@/lib/models/User'
import ProductModel from '@/lib/models/Product'
import { ShoppingCart, Users, Package, DollarSign } from 'lucide-react'

async function getDashboardData() {
  await connectMongo()
  const [totalOrders, revenueAgg, totalUsers, totalProducts, recentOrders] =
    await Promise.all([
      OrderModel.countDocuments({ status: 'paid' }),
      OrderModel.aggregate([
        { $match: { status: 'paid' } },
        { $group: { _id: null, total: { $sum: '$total' } } },
      ]),
      UserModel.countDocuments(),
      ProductModel.countDocuments({ active: true }),
      OrderModel.find({ status: 'paid' })
        .populate('user', 'name email')
        .populate('products', 'name')
        .sort({ createdAt: -1 })
        .limit(5)
        .lean(),
    ])
  return {
    totalOrders,
    totalRevenue: revenueAgg[0]?.total ?? 0,
    totalUsers,
    totalProducts,
    recentOrders,
  }
}

export default async function AdminDashboardPage() {
  const data = await getDashboardData()

  const stats = [
    {
      label: 'Receita Total',
      value: formatPrice(data.totalRevenue),
      icon: DollarSign,
      color: 'bg-green-100 text-green-700',
    },
    {
      label: 'Pedidos Pagos',
      value: data.totalOrders.toString(),
      icon: ShoppingCart,
      color: 'bg-blue-100 text-blue-700',
    },
    {
      label: 'Clientes',
      value: data.totalUsers.toString(),
      icon: Users,
      color: 'bg-orange-100 text-orange-700',
    },
    {
      label: 'Produtos Ativos',
      value: data.totalProducts.toString(),
      icon: Package,
      color: 'bg-pink-100 text-pink-700',
    },
  ]

  return (
    <div className="p-6 space-y-6">
      <AdminHeader title="Dashboard" />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {stats.map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="bg-white rounded-xl border p-5 flex items-center gap-4">
            <div className={`p-3 rounded-xl ${color}`}>
              <Icon className="w-5 h-5" />
            </div>
            <div>
              <p className="text-sm text-gray-500">{label}</p>
              <p className="text-2xl font-bold text-gray-900">{value}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-xl border">
        <div className="px-6 py-4 border-b">
          <h2 className="font-semibold text-gray-900">Pedidos Recentes</h2>
        </div>
        <div className="divide-y">
          {data.recentOrders.length === 0 ? (
            <p className="px-6 py-8 text-center text-gray-500">Nenhum pedido ainda</p>
          ) : (
            (data.recentOrders as unknown as Array<{
              _id: { toString(): string }
              user?: { name?: string; email?: string }
              products: Array<{ name: string }>
              total: number
              createdAt: Date
            }>).map((order) => (
              <div
                key={order._id.toString()}
                className="px-6 py-4 flex items-center justify-between"
              >
                <div>
                  <p className="font-medium text-gray-900">
                    {order.user?.name ?? order.user?.email ?? 'Cliente'}
                  </p>
                  <p className="text-sm text-gray-500">
                    {order.products.map((p) => p.name).join(', ')}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-semibold">{formatPrice(order.total)}</p>
                  <p className="text-sm text-gray-500">
                    {formatDate(order.createdAt)}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
