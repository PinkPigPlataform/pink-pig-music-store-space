'use client'

import { useCartStore } from '@/lib/stores/cart'
import { ShoppingCart, Check } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'

interface Product {
  id: string
  name: string
  price: number
  slug: string
  image?: string
}

export default function AddToCartButton({ product }: { product: Product }) {
  const { addItem, items } = useCartStore()
  const inCart = items.some((i) => i.id === product.id)
  const [added, setAdded] = useState(false)

  function handleAdd() {
    addItem({
      id: product.id,
      name: product.name,
      price: product.price,
      slug: product.slug,
      image: product.image,
    })
    setAdded(true)
    toast.success(`${product.name} adicionado ao carrinho`)
    setTimeout(() => setAdded(false), 2000)
  }

  if (inCart || added) {
    return (
      <div className="w-full bg-green-50 border border-green-200 text-green-700 font-semibold py-3.5 rounded-xl flex items-center justify-center gap-2">
        <Check className="w-5 h-5" />
        No carrinho
      </div>
    )
  }

  return (
    <button
      id="add-to-cart-btn"
      onClick={handleAdd}
      className="w-full bg-pink-500 hover:bg-pink-600 text-white font-semibold py-3.5 rounded-xl flex items-center justify-center gap-2 transition-colors shadow-lg shadow-pink-100"
    >
      <ShoppingCart className="w-5 h-5" />
      Adicionar ao carrinho
    </button>
  )
}
