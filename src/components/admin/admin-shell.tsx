'use client'

import { useState, useEffect } from 'react'
import { Sidebar } from './sidebar'
import { Menu } from 'lucide-react'

export function AdminShell({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  // Close sidebar on route change (click on a link)
  useEffect(() => {
    const close = () => setSidebarOpen(false)
    window.addEventListener('popstate', close)
    return () => window.removeEventListener('popstate', close)
  }, [])

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar — fixed drawer on mobile, static on desktop */}
      <div className={`
        fixed inset-y-0 left-0 z-50 transition-transform duration-300 ease-in-out
        lg:relative lg:translate-x-0 lg:z-auto
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <Sidebar onNavigate={() => setSidebarOpen(false)} />
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden min-w-0">
        {/* Mobile topbar */}
        <div className="lg:hidden flex items-center gap-3 px-4 py-3 bg-gray-950 border-b border-gray-800 shrink-0">
          <button
            onClick={() => setSidebarOpen(true)}
            className="text-gray-400 hover:text-white transition-colors p-1"
            aria-label="Abrir menu"
          >
            <Menu className="w-6 h-6" />
          </button>
          <span className="text-white font-bold text-sm">
            {process.env.NEXT_PUBLIC_STORE_NAME || 'Admin Panel'}
          </span>
        </div>

        <main className="flex-1 overflow-y-auto">{children}</main>
      </div>
    </div>
  )
}
