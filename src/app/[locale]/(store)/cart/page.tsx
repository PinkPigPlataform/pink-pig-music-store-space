'use client'

import { useCartStore } from '@/lib/stores/cart'
import { formatPrice } from '@/lib/utils'
import Image from 'next/image'
import Link from 'next/link'
import { Trash2, ShoppingBag, ArrowRight } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'

export default function CartPage() {
  const { items, removeItem, clearCart, total } = useCartStore()
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  async function handleCheckout() {
    setLoading(true)
    try {
      const res = await fetch('/api/store/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productIds: items.map((i) => i.id) }),
      })

      if (res.status === 401) {
        router.push('/sign-in?redirect=/cart')
        return
      }

      const data = await res.json()
      if (data.url) {
        clearCart()
        window.location.href = data.url
      } else {
        toast.error(data.error || 'Erro ao criar sessão de pagamento')
      }
    } catch {
      toast.error('Erro ao conectar com o servidor')
    } finally {
      setLoading(false)
    }
  }

  if (items.length === 0) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center">
        <ShoppingBag className="w-16 h-16 text-gray-200 mx-auto mb-4" />
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Carrinho vazio</h1>
        <p className="text-gray-500 mb-6">Adicione produtos para continuar</p>
        <Link
          href="/products"
          className="inline-flex items-center gap-2 bg-pink-500 hover:bg-pink-600 text-white font-semibold px-6 py-3 rounded-full transition-colors"
        >
          Ver produtos <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    )
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-10">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Carrinho</h1>

      <div className="space-y-4">
        {items.map((item) => (
          <div
            key={item.id}
            className="bg-white border rounded-xl p-4 flex items-center gap-4"
          >
            <div className="w-16 h-16 bg-gray-100 rounded-lg overflow-hidden relative shrink-0">
              {item.image ? (
                <Image src={item.image} alt={item.name} fill sizes="64px" className="object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-300 text-xs">
                  IMG
                </div>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-gray-900 truncate">{item.name}</h3>
              <p className="text-pink-500 font-bold">
                {formatPrice(Math.round(item.price * 100))}
              </p>
            </div>
            <button
              onClick={() => {
                removeItem(item.id)
                toast.info('Item removido do carrinho')
              }}
              className="text-gray-400 hover:text-red-500 transition-colors p-1.5"
              aria-label="Remover"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>

      <div className="mt-6 bg-white border rounded-xl p-6">
        <div className="flex justify-between text-lg font-bold text-gray-900 mb-4">
          <span>Total</span>
          <span>{formatPrice(Math.round(total() * 100))}</span>
        </div>
        <button
          id="checkout-btn"
          onClick={handleCheckout}
          disabled={loading}
          className="w-full bg-pink-500 hover:bg-pink-600 text-white font-semibold py-3.5 rounded-xl transition-colors disabled:opacity-60 shadow-lg shadow-pink-100"
        >
          {loading ? 'Carregando...' : 'Finalizar compra'}
        </button>
        <p className="text-xs text-center text-gray-500 mt-3">
          Você será redirecionado para o Stripe para concluir o pagamento
        </p>
      </div>
    </div>
  )
}
