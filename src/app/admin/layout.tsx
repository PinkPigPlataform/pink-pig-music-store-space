import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import '../globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Admin - Loja Digital',
  description: 'Painel Administrativo da Loja',
}

// Layout raiz do /admin — sem auth check.
// A proteção é feita pelo middleware (getToken) e pelo layout de (protected).
// A página /admin/login precisa ficar fora do layout protegido para evitar redirect loop.
export default function AdminRootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="pt-BR">
      <body className={inter.className}>{children}</body>
    </html>
  )
}
