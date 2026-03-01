'use client'

import { useLocale } from '../hooks/use-locale'
import { Button } from './ui/button'

const LanguageSwitcher = () => {
  const { locale, setLocale } = useLocale()

  return (
    <div className='flex items-center gap-2'>
      <Button
        variant={locale === 'pt-BR' ? 'default' : 'ghost'}
        size='sm'
        className='h-8 w-12 text-xs'
        onClick={() => setLocale('pt-BR')}>
        PT
      </Button>
      <div className='h-4 w-px bg-gray-200' />
      <Button
        variant={locale === 'en' ? 'default' : 'ghost'}
        size='sm'
        className='h-8 w-12 text-xs'
        onClick={() => setLocale('en')}>
        EN
      </Button>
    </div>
  )
}

export default LanguageSwitcher
