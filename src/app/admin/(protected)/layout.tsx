import { SessionProvider } from 'next-auth/react'
import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { AdminShell } from '@/components/admin/admin-shell'
import { Toaster } from 'sonner'

export const metadata = {
  title: 'Admin Panel | Pink Pig Plataform',
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
      <AdminShell>{children}</AdminShell>
      <Toaster position="top-center" richColors />
    </SessionProvider>
  )
}
