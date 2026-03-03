'use client'

import Link from 'next/link'
import { ShoppingCart, Menu, X, User } from 'lucide-react'
import { useState } from 'react'
import { useCartStore } from '@/lib/stores/cart'

export default function StoreNavbar() {
  const [open, setOpen] = useState(false)
  const itemCount = useCartStore((s) => s.items.length)

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-sm border-b">
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/" className="font-bold text-xl text-pink-500">
          {process.env.NEXT_PUBLIC_STORE_NAME || '🐷 Loja'}
        </Link>

        <nav className="hidden md:flex items-center gap-6">
          <Link href="/products" className="text-gray-600 hover:text-gray-900 font-medium text-sm">
            Produtos
          </Link>
          <Link href="/account/orders" className="text-gray-600 hover:text-gray-900 font-medium text-sm">
            Meus pedidos
          </Link>
        </nav>

        <div className="flex items-center gap-3">
          <Link
            href="/sign-in"
            className="hidden md:flex items-center gap-1.5 text-sm text-gray-600 hover:text-gray-900"
          >
            <User className="w-4 h-4" />
            Entrar
          </Link>

          <Link
            href="/cart"
            className="relative flex items-center gap-1.5 bg-pink-500 hover:bg-pink-600 text-white px-4 py-2 rounded-full text-sm font-medium transition-colors"
          >
            <ShoppingCart className="w-4 h-4" />
            <span>Carrinho</span>
            {itemCount > 0 && (
              <span className="absolute -top-1.5 -right-1.5 bg-red-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center font-bold">
                {itemCount}
              </span>
            )}
          </Link>

          <button
            className="md:hidden text-gray-500 hover:text-gray-900"
            onClick={() => setOpen(!open)}
            aria-label="Menu"
          >
            {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="md:hidden border-t bg-white px-4 py-4 space-y-3">
          <Link href="/products" className="block text-gray-700 font-medium" onClick={() => setOpen(false)}>
            Produtos
          </Link>
          <Link href="/sign-in" className="block text-gray-700 font-medium" onClick={() => setOpen(false)}>
            Entrar
          </Link>
          <Link href="/account/orders" className="block text-gray-700 font-medium" onClick={() => setOpen(false)}>
            Meus pedidos
          </Link>
        </div>
      )}
    </header>
  )
}
