import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import {NextIntlClientProvider} from 'next-intl';
import {getMessages} from 'next-intl/server';
import '../globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: {
    default: process.env.NEXT_PUBLIC_STORE_NAME || 'Loja Digital',
    template: `%s | ${process.env.NEXT_PUBLIC_STORE_NAME || 'Loja Digital'}`,
  },
  description: 'Loja de produtos digitais',
}

export default async function RootLayout({
  children,
  params
}: {
  children: React.ReactNode
  params?: Promise<{ locale?: string }>
}) {
  let locale = 'pt';
  if (params) {
    const p = await params;
    if (p.locale) {
      locale = p.locale;
    }
  }

  const messages = await getMessages();

  return (
    <html lang={locale}>
      <body className={inter.className}>
        <NextIntlClientProvider messages={messages}>
          {children}
        </NextIntlClientProvider>
      </body>
    </html>
  )
}
