import type { Metadata } from 'next'
import { Toaster } from 'sonner'
import StoreNavbar from '@/components/store/navbar'
import StoreFooter from '@/components/store/footer'

export const metadata: Metadata = {
  title: `${process.env.NEXT_PUBLIC_STORE_NAME || 'Loja Digital'}`,
}

export default function StoreLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <>
      <StoreNavbar />
      <main className="min-h-[calc(100vh-64px-200px)]">{children}</main>
      <StoreFooter />
      <Toaster position="top-center" richColors />
    </>
  )
}
