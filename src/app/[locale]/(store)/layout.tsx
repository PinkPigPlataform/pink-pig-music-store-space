import { Toaster } from 'sonner'
import StoreNavbar from '@/components/store/navbar'
import StoreFooter from '@/components/store/footer'

// Sem metadata.title aqui: o layout raiz ja define title.default e
// title.template. Redefinir gerava "Pink Pig Store | Pink Pig Store".

export default function StoreLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex flex-col min-h-screen">
      <StoreNavbar />
      <main className="flex-1">{children}</main>
      <StoreFooter />
      <Toaster position="top-center" richColors />
    </div>
  )
}
