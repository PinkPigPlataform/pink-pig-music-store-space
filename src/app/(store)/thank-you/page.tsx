import { CheckCircle, ArrowRight } from 'lucide-react'
import Link from 'next/link'

export default function ThankYouPage({
  searchParams,
}: {
  searchParams: { orderId?: string }
}) {
  return (
    <div className="min-h-[60vh] flex items-center justify-center px-4 py-20">
      <div className="text-center max-w-md">
        <div className="inline-flex items-center justify-center w-20 h-20 bg-green-100 rounded-full mb-6">
          <CheckCircle className="w-10 h-10 text-green-500" />
        </div>
        <h1 className="text-3xl font-bold text-gray-900 mb-3">
          Pagamento confirmado!
        </h1>
        <p className="text-gray-600 mb-2">
          Obrigado pela sua compra. Você receberá um email com o recibo em breve.
        </p>
        {searchParams.orderId && (
          <p className="text-sm text-gray-500 mb-8">
            Pedido #{searchParams.orderId.slice(-6).toUpperCase()}
          </p>
        )}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/account/orders"
            className="inline-flex items-center justify-center gap-2 bg-pink-500 hover:bg-pink-600 text-white font-semibold px-6 py-3 rounded-full transition-colors"
          >
            Ver meus pedidos <ArrowRight className="w-4 h-4" />
          </Link>
          <Link
            href="/products"
            className="inline-flex items-center justify-center gap-2 border border-gray-200 text-gray-700 hover:bg-gray-50 font-medium px-6 py-3 rounded-full transition-colors"
          >
            Continuar comprando
          </Link>
        </div>
      </div>
    </div>
  )
}
