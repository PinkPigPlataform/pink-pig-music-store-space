'use client'

import Link from 'next/link'
import { ShoppingCart, Menu, X, User, LogOut, Package } from 'lucide-react'
import { useState } from 'react'
import { useCartStore } from '@/lib/stores/cart'
import { useRouter } from 'next/navigation'
import { useTranslations } from 'next-intl'
import LanguageSwitcher from './LanguageSwitcher'

interface NavbarClientProps {
  user: { id: string; email: string } | null
}

export default function NavbarClient({ user }: NavbarClientProps) {
  const [open, setOpen] = useState(false)
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const itemCount = useCartStore((s) => s.items.length)
  const router = useRouter()
  const t = useTranslations('Navigation')

  async function handleLogout() {
    await fetch('/api/auth/user/logout', { method: 'POST' })
    router.refresh()
  }

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-sm border-b">
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2.5">
          <img src="/favicon.ico" alt="Logo" className="w-8 h-8 object-contain" />
          <span className="font-bold text-lg text-pink-500">
            {process.env.NEXT_PUBLIC_STORE_NAME || 'Loja'}
          </span>
        </Link>

        <nav className="hidden md:flex items-center gap-6">
          <Link href="/products" className="text-gray-600 hover:text-gray-900 font-medium text-sm">
            {t('products')}
          </Link>
          {user && (
            <Link href="/account/orders" className="text-gray-600 hover:text-gray-900 font-medium text-sm">
              {t('myOrders')}
            </Link>
          )}
        </nav>

        <div className="flex items-center gap-3">
          {user ? (
            <div className="relative hidden md:block">
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="flex items-center gap-1.5 text-sm text-gray-700 hover:text-gray-900 font-medium"
              >
                <div className="w-7 h-7 rounded-full bg-pink-100 flex items-center justify-center">
                  <User className="w-4 h-4 text-pink-500" />
                </div>
                <span className="max-w-[120px] truncate">{user.email.split('@')[0]}</span>
              </button>
              {dropdownOpen && (
                <div className="absolute right-0 top-10 w-48 bg-white rounded-xl border shadow-lg py-1 z-50">
                  <Link
                    href="/account/orders"
                    onClick={() => setDropdownOpen(false)}
                    className="flex items-center gap-2 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50"
                  >
                    <Package className="w-4 h-4" />
                    {t('myOrders')}
                  </Link>
                  <hr className="my-1" />
                  <button
                    onClick={() => { setDropdownOpen(false); handleLogout() }}
                    className="flex items-center gap-2 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 w-full text-left"
                  >
                    <LogOut className="w-4 h-4" />
                    {t('signOut')}
                  </button>
                </div>
              )}
            </div>
          ) : (
            <Link
              href="/sign-in"
              className="hidden md:flex items-center gap-1.5 text-sm text-gray-600 hover:text-gray-900"
            >
              <User className="w-4 h-4" />
              {t('signIn')}
            </Link>
          )}

          <Link
            href="/cart"
            className="relative flex items-center gap-1.5 bg-pink-500 hover:bg-pink-600 text-white px-4 py-2 rounded-full text-sm font-medium transition-colors"
          >
            <ShoppingCart className="w-4 h-4" />
            <span>{t('cart')}</span>
            {itemCount > 0 && (
              <span className="absolute -top-1.5 -right-1.5 bg-red-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center font-bold">
                {itemCount}
              </span>
            )}
          </Link>

          <LanguageSwitcher />

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
            {t('products')}
          </Link>
          {user ? (
            <>
              <Link href="/account/orders" className="block text-gray-700 font-medium" onClick={() => setOpen(false)}>
                {t('myOrders')}
              </Link>
              <button
                onClick={() => { setOpen(false); handleLogout() }}
                className="block text-red-600 font-medium w-full text-left"
              >
                {t('signOut')}
              </button>
            </>
          ) : (
            <Link href="/sign-in" className="block text-gray-700 font-medium" onClick={() => setOpen(false)}>
              {t('signIn')}
            </Link>
          )}
        </div>
      )}
    </header>
  )
}
