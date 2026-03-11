import Link from 'next/link'
import { getTranslations } from 'next-intl/server'

export default async function StoreFooter() {
  const year = new Date().getFullYear()
  const name = process.env.NEXT_PUBLIC_STORE_NAME || 'Loja Digital'
  const t = await getTranslations('Footer')

  return (
    <footer className="bg-gray-900 text-gray-400 py-10 px-4">
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
        <p className="text-sm">
          © {year} {name}. {t('rights')}
        </p>
        <div className="flex gap-6 text-sm">
          <Link href="/termos" className="hover:text-white transition-colors">{t('terms')}</Link>
          <Link href="/privacidade" className="hover:text-white transition-colors">{t('privacy')}</Link>
          <Link href="/contato" className="hover:text-white transition-colors">{t('contact')}</Link>
        </div>
      </div>
    </footer>
  )
}

