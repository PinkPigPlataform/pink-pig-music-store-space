'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard,
  Package,
  Tags,
  ShoppingCart,
  Users,
  File,
  Settings,
  LogOut,
} from 'lucide-react'
import { signOut } from 'next-auth/react'
import { cn } from '@/lib/utils'

const links = [
  { href: '/admin', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/admin/products', label: 'Produtos', icon: Package },
  { href: '/admin/categories', label: 'Categorias', icon: Tags },
  { href: '/admin/orders', label: 'Pedidos', icon: ShoppingCart },
  { href: '/admin/customers', label: 'Clientes', icon: Users },
  { href: '/admin/files', label: 'Arquivos', icon: File },
  { href: '/admin/settings', label: 'Configurações', icon: Settings },
]

export function Sidebar() {
  const pathname = usePathname()

  return (
    <aside className="w-64 shrink-0 bg-gray-950 text-white flex flex-col h-screen sticky top-0 border-r border-gray-800">
      {/* Logo */}
      <div className="px-5 py-5 border-b border-gray-800">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl overflow-hidden bg-gray-800 shrink-0">
            <img
              src="/favicon.ico"
              alt="Logo"
              className="w-full h-full object-contain"
            />
          </div>
          <div>
            <p className="font-bold text-sm text-white leading-tight">
              {process.env.NEXT_PUBLIC_STORE_NAME || 'Minha Loja'}
            </p>
            <p className="text-[10px] text-pink-400 font-medium uppercase tracking-wider">Admin Panel</p>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        {links.map(({ href, label, icon: Icon }) => {
          const active =
            href === '/admin' ? pathname === '/admin' : pathname.startsWith(href)
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all',
                active
                  ? 'bg-pink-500 text-white shadow-sm'
                  : 'text-gray-400 hover:bg-gray-800 hover:text-white'
              )}
            >
              <Icon className="w-4 h-4 shrink-0" />
              {label}
            </Link>
          )
        })}
      </nav>

      {/* Footer */}
      <div className="px-3 py-4 border-t border-gray-800">
        <button
          onClick={() => signOut({ callbackUrl: '/admin/login' })}
          className="flex items-center gap-3 px-3 py-2.5 w-full rounded-lg text-sm font-medium text-gray-400 hover:bg-gray-800 hover:text-white transition-colors"
        >
          <LogOut className="w-4 h-4" />
          Sair
        </button>
      </div>
    </aside>
  )
}
