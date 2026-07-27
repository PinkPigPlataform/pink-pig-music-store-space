import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import {NextIntlClientProvider} from 'next-intl';
import {getMessages} from 'next-intl/server';
import '../globals.css'
import { GoogleAnalytics } from '@/components/analytics/GoogleAnalytics'

const inter = Inter({ subsets: ['latin'] })

const STORE_NAME = process.env.NEXT_PUBLIC_STORE_NAME || 'Pink Pig Store'

export const metadata: Metadata = {
  metadataBase: new URL('https://www.pinkpigstore.com'),
  title: {
    default: STORE_NAME,
    template: `%s | ${STORE_NAME}`,
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
        <GoogleAnalytics />
      </body>
    </html>
  )
}
