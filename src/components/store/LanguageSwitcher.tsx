'use client'

import { useLocale } from 'next-intl'
import { useRouter, usePathname } from '@/i18n/routing'
import { Globe } from 'lucide-react'
import { useState, useTransition } from 'react'

export default function LanguageSwitcher() {
  const locale = useLocale()
  const router = useRouter()
  const pathname = usePathname()
  const [isPending, startTransition] = useTransition()
  const [isOpen, setIsOpen] = useState(false)

  const toggleLanguage = (newLocale: string) => {
    if (newLocale === locale) return
    setIsOpen(false)
    startTransition(() => {
      router.replace(pathname, { locale: newLocale })
    })
  }

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        disabled={isPending}
        className="flex items-center gap-1.5 text-sm font-medium text-gray-700 hover:text-gray-900 transition-colors"
        aria-label="Switch Language"
      >
        <Globe className="w-4 h-4 text-gray-500" />
        <span className="uppercase">{locale}</span>
      </button>

      {isOpen && (
        <div className="absolute right-0 top-8 w-32 bg-white rounded-xl border shadow-lg py-1 z-50">
          <button
            onClick={() => toggleLanguage('pt')}
            className={`flex items-center w-full px-4 py-2 text-sm text-left hover:bg-gray-50 ${locale === 'pt' ? 'font-bold text-pink-500 bg-pink-50' : 'text-gray-700'}`}
          >
            🇧🇷 Português
          </button>
          <button
            onClick={() => toggleLanguage('en')}
            className={`flex items-center w-full px-4 py-2 text-sm text-left hover:bg-gray-50 ${locale === 'en' ? 'font-bold text-pink-500 bg-pink-50' : 'text-gray-700'}`}
          >
            🇺🇸 English
          </button>
        </div>
      )}
    </div>
  )
}
