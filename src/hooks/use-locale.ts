'use client'

import { useContext } from 'react'
import { LocaleContext } from '../components/LocaleProvider'
import { translations, TranslationKey } from '../i18n/translations'

export const useLocale = () => {
    const context = useContext(LocaleContext)
    if (!context) {
        throw new Error('useLocale must be used within a LocaleProvider')
    }

    const { locale, setLocale } = context

    const t = (key: TranslationKey): string => {
        return translations[locale][key] || key
    }

    return { t, locale, setLocale }
}
