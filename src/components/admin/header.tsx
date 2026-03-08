'use client'

import { useSession, signOut } from 'next-auth/react'
import { Bell, LogOut, Settings, ChevronDown, User } from 'lucide-react'
import Link from 'next/link'
import { useState, useEffect, useRef } from 'react'

interface AdminHeaderProps {
  title: string
}

export function AdminHeader({ title }: AdminHeaderProps) {
  const { data: session } = useSession()
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const [avatar, setAvatar] = useState<string | null>(null)
  const [dbName, setDbName] = useState<string | null>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)

  // Name from DB takes priority over potentially stale JWT
  const name = dbName ?? (session?.user?.name ?? session?.user?.email ?? 'Admin') as string
  const initials = name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()

  useEffect(() => {
    fetch('/api/admin/me')
      .then(r => r.json())
      .then(data => {
        if (data?.data?.avatar) setAvatar(data.data.avatar)
        if (data?.data?.name) setDbName(data.data.name)
      })
      .catch(() => null)
  }, [])

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  return (
    <header className="h-16 border-b bg-white flex items-center justify-between px-6 shrink-0 sticky top-0 z-30">
      {/* Page title */}
      <div>
        <h1 className="text-lg font-bold text-gray-900 tracking-tight">{title}</h1>
      </div>

      {/* Right controls */}
      <div className="flex items-center gap-3">
        {/* Notification bell */}
        <button className="relative w-9 h-9 flex items-center justify-center rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors">
          <Bell className="w-5 h-5" />
        </button>

        {/* Profile dropdown */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="flex items-center gap-2.5 pl-1 pr-2 py-1 rounded-full hover:bg-gray-100 transition-colors group"
          >
            {/* Avatar */}
            {avatar ? (
              <img
                src={avatar}
                alt={name}
                className="w-8 h-8 rounded-full object-cover ring-2 ring-pink-200"
              />
            ) : (
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-pink-400 to-pink-600 flex items-center justify-center ring-2 ring-pink-200 shrink-0">
                <span className="text-white text-xs font-bold">{initials}</span>
              </div>
            )}

            {/* Name */}
            <div className="hidden sm:block text-left">
              <p className="text-sm font-semibold text-gray-800 leading-tight truncate max-w-[120px]">
                {name.split(' ')[0]}
              </p>
              <p className="text-xs text-gray-400 leading-tight capitalize">
                {(session?.user as { role?: string })?.role?.replace('_', ' ') ?? 'Admin'}
              </p>
            </div>

            <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${dropdownOpen ? 'rotate-180' : ''}`} />
          </button>

          {/* Dropdown panel */}
          {dropdownOpen && (
            <div className="absolute right-0 top-12 w-56 bg-white border border-gray-100 rounded-2xl shadow-xl shadow-gray-200/60 py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
              {/* User info */}
              <div className="px-4 py-2.5 border-b border-gray-100 mb-1">
                <p className="text-sm font-semibold text-gray-900 truncate">{name}</p>
                <p className="text-xs text-gray-400 truncate">{session?.user?.email}</p>
              </div>

              <Link
                href="/admin/settings"
                onClick={() => setDropdownOpen(false)}
                className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
              >
                <User className="w-4 h-4 text-gray-400" />
                Meu perfil
              </Link>

              <Link
                href="/admin/settings"
                onClick={() => setDropdownOpen(false)}
                className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
              >
                <Settings className="w-4 h-4 text-gray-400" />
                Configurações
              </Link>

              <div className="border-t border-gray-100 mt-1 pt-1">
                <button
                  onClick={() => signOut({ callbackUrl: '/admin/login' })}
                  className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors w-full text-left rounded-b-2xl"
                >
                  <LogOut className="w-4 h-4" />
                  Sair
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
