import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: {
    default: process.env.NEXT_PUBLIC_STORE_NAME || 'Loja Digital',
    template: `%s | ${process.env.NEXT_PUBLIC_STORE_NAME || 'Loja Digital'}`,
  },
  description: 'Loja de produtos digitais',
}

export default function RootLayout({
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
