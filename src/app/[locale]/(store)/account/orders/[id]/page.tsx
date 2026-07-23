import { cookies } from 'next/headers'
import { verifyUserToken } from '@/lib/user-auth'
import { connectMongo } from '@/lib/mongodb'
import OrderModel from '@/lib/models/Order'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { formatPrice, formatDate } from '@/lib/utils'
import { Download, ArrowLeft } from 'lucide-react'

async function getOrder(orderId: string, userId: string) {
  await connectMongo()
  try {
    return await OrderModel.findOne({ _id: orderId, user: userId, status: 'paid' })
      .populate({
        path: 'products',
        select: 'name price slug digitalFile',
        populate: { path: 'digitalFile', select: '_id name' },
      })
      .lean()
  } catch (error) {
    console.error('Error fetching order:', error)
    return null
  }
}

export default async function OrderDetailPage({
  params
}: {
  params: Promise<{ locale: string; id: string }>
}) {
  const cookieStore = await cookies()
  const token = cookieStore.get('user-token')?.value
  const { locale, id } = await params

  if (!token) redirect(`/sign-in?redirect=/account/orders/${id}`)

  const payload = verifyUserToken(token)
  if (!payload) redirect(`/sign-in?redirect=/account/orders/${id}`)

  const rawOrder = await getOrder(id, payload.id)

  if (!rawOrder) {
    redirect('/account/orders?error=not-found')
  }

  const order = rawOrder as unknown as {
    _id: { toString(): string }
    total: number
    createdAt: Date
    status: string
    products: Array<{
      _id: { toString(): string }
      name: string
      price: number
      digitalFile?: { _id: { toString(): string }; name: string }
    }>
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-10">
      <Link
        href="/account/orders"
        className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-900 mb-6"
      >
        <ArrowLeft className="w-4 h-4" />
        Voltar para meus pedidos
      </Link>

      <h1 className="text-2xl font-bold text-gray-900 mb-6">Pedido</h1>

      <div className="bg-white border rounded-xl overflow-hidden">
        <div className="px-6 py-4 border-b bg-gray-50 flex items-center justify-between">
          <div>
            <p className="text-xs text-gray-500">
              Pedido #{order._id.toString().slice(-6).toUpperCase()}
            </p>
            <p className="text-sm text-gray-700">{formatDate(order.createdAt)}</p>
            <span className="inline-flex items-center mt-1 px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-700">
              {order.status === 'paid' ? 'Pago' : order.status}
            </span>
          </div>
          <p className="font-bold text-gray-900">{formatPrice(order.total, locale)}</p>
        </div>
        <div className="divide-y">
          {order.products.map((product) => (
            <div
              key={product._id.toString()}
              className="px-6 py-4 flex items-center justify-between"
            >
              <div>
                <p className="font-medium text-gray-900">{product.name}</p>
                <p className="text-sm text-gray-500">
                  {formatPrice(Math.round(product.price * 100), locale)}
                </p>
              </div>
              {product.digitalFile && (
                <a
                  href={`/api/store/orders/${order._id}/download/${product.digitalFile._id}`}
                  className="flex items-center gap-2 bg-pink-50 hover:bg-pink-100 text-pink-600 font-medium text-sm px-4 py-2 rounded-lg transition-colors"
                >
                  <Download className="w-4 h-4" />
                  Download
                </a>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
