import Navbar from '@/components/Navbar'
import Providers from '@/components/Providers'
import { LocaleProvider } from '@/components/LocaleProvider'
import { TenantThemeInjector } from '@/components/TenantThemeInjector'
import { cn, constructMetadata } from '@/lib/utils'
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { Toaster } from 'sonner'
import './globals.css'
import Footer from '@/components/Footer'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = constructMetadata()

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang='en' className='h-full'>
      <body className={cn('relative h-full font-sans antialiased', inter.className)}>
        <TenantThemeInjector />
        <main className='relative flex flex-col min-h-screen'>
          <Providers>
            <LocaleProvider>
              <Navbar />
              <div className='flex-grow flex-1'>{children}</div>
              <Footer />
            </LocaleProvider>
          </Providers>
        </main>
        <Toaster position='top-center' richColors />
      </body>
    </html>
  )
}
