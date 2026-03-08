'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useSession } from 'next-auth/react'
import {
  LayoutDashboard, Package, Tags, ShoppingCart,
  Users, FolderOpen, Settings, LogOut, UsersRound,
} from 'lucide-react'
import { signOut } from 'next-auth/react'
import { cn } from '@/lib/utils'

type AdminRole = 'support' | 'admin' | 'super_admin'

const ALL_LINKS = [
  { href: '/admin',            label: 'Dashboard',     icon: LayoutDashboard, minRole: 'support'     as AdminRole },
  { href: '/admin/products',   label: 'Produtos',      icon: Package,         minRole: 'admin'       as AdminRole },
  { href: '/admin/categories', label: 'Categorias',    icon: Tags,            minRole: 'admin'       as AdminRole },
  { href: '/admin/orders',     label: 'Pedidos',       icon: ShoppingCart,    minRole: 'support'     as AdminRole },
  { href: '/admin/customers',  label: 'Clientes',      icon: Users,           minRole: 'support'     as AdminRole },
  { href: '/admin/files',      label: 'Arquivos',      icon: FolderOpen,      minRole: 'admin'       as AdminRole },
  { href: '/admin/team',       label: 'Equipe',        icon: UsersRound,      minRole: 'super_admin' as AdminRole },
  { href: '/admin/settings',   label: 'Configurações', icon: Settings,        minRole: 'support'     as AdminRole },
]

const ROLE_RANK: Record<AdminRole, number> = { support: 0, admin: 1, super_admin: 2 }

interface SidebarProps {
  onNavigate?: () => void
}

export function Sidebar({ onNavigate }: SidebarProps) {
  const pathname = usePathname()
  const { data: session } = useSession()
  const role = ((session?.user as { role?: string })?.role ?? 'support') as AdminRole
  const links = ALL_LINKS.filter(l => ROLE_RANK[role] >= ROLE_RANK[l.minRole])

  return (
    <aside className="w-64 shrink-0 bg-gray-950 text-white flex flex-col h-full border-r border-gray-800">
      {/* Logo */}
      <div className="px-5 py-5 border-b border-gray-800">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl overflow-hidden bg-gray-800 shrink-0">
            <img src="/favicon.ico" alt="Logo" className="w-full h-full object-contain" />
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
          const active = href === '/admin' ? pathname === '/admin' : pathname.startsWith(href)
          return (
            <Link
              key={href}
              href={href}
              onClick={onNavigate}
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

      {/* Footer: user info + sign out */}
      <div className="px-3 py-4 border-t border-gray-800 space-y-3">
        <div className="flex items-center gap-2 px-2">
          <div className="w-2 h-2 rounded-full bg-green-400 shrink-0" />
          <span className="text-xs text-gray-400 truncate flex-1">
            {(session?.user?.name ?? session?.user?.email ?? '').toString().split(' ')[0]}
          </span>
          <span className="text-[10px] text-pink-400 font-semibold uppercase tracking-wide shrink-0">
            {role.replace('_', ' ')}
          </span>
        </div>

        <button
          onClick={() => signOut({ callbackUrl: '/admin/login' })}
          className="flex items-center gap-3 px-3 py-2.5 w-full rounded-lg text-sm font-medium text-gray-400 hover:bg-gray-800 hover:text-white transition-colors"
        >
          <LogOut className="w-4 h-4 shrink-0" />
          Sair
        </button>
      </div>
    </aside>
  )
}
