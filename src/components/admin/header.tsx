'use client'

import { useSession } from 'next-auth/react'
import { BellIcon, UserCircle } from 'lucide-react'

interface AdminHeaderProps {
  title: string
}

export function AdminHeader({ title }: AdminHeaderProps) {
  const { data: session } = useSession()

  return (
    <header className="h-16 border-b bg-white flex items-center justify-between px-6 shrink-0">
      <h1 className="text-xl font-semibold text-gray-900">{title}</h1>
      <div className="flex items-center gap-4">
        <button className="text-gray-500 hover:text-gray-700">
          <BellIcon className="w-5 h-5" />
        </button>
        <div className="flex items-center gap-2 text-sm text-gray-700">
          <UserCircle className="w-5 h-5" />
          <span>{session?.user?.name ?? session?.user?.email}</span>
        </div>
      </div>
    </header>
  )
}
