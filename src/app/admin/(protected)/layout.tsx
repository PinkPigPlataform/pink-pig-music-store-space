import { SessionProvider } from 'next-auth/react'
import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { Sidebar } from '@/components/admin/sidebar'
import { Toaster } from 'sonner'

export const metadata = {
  title: 'Admin Panel',
  robots: { index: false, follow: false },
}

export default async function ProtectedAdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await auth()
  if (!session?.user) redirect('/admin/login')

  return (
    <SessionProvider session={session}>
      <div className="flex h-screen bg-gray-50 overflow-hidden">
        <Sidebar />
        <div className="flex-1 flex flex-col overflow-hidden">
          <main className="flex-1 overflow-y-auto">{children}</main>
        </div>
      </div>
      <Toaster position="top-center" richColors />
    </SessionProvider>
  )
}
