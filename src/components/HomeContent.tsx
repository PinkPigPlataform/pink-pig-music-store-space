'use client'

import { Button, buttonVariants } from '@/components/ui/button'
import { useLocale } from '@/hooks/use-locale'
import { ArrowDownToLine, CheckCircle, Sparkles } from 'lucide-react'
import Link from 'next/link'

export const HomeHero = () => {
  const { t } = useLocale()

  return (
    <div className='py-20 mx-auto text-center flex flex-col items-center max-w-3xl'>
      <h1 className='text-4xl font-bold tracking-tight text-gray-900 sm:text-6xl'>
        {t('home.title')}{' '}
        <span className='text-pink-600'>{t('home.titleHighlight')}</span>
        {t('home.titleEnd')}
      </h1>
      <p className='mt-6 text-lg max-w-prose text-muted-foreground'>
        {t('home.subtitle')}
      </p>
      <div className='flex flex-col sm:flex-row gap-4 mt-6'>
        <Link href='/products' className={buttonVariants()}>
          {t('home.browseTrending')}
        </Link>
        <Button variant='ghost'>{t('home.qualityPromise')} &rarr;</Button>
      </div>
    </div>
  )
}

export const HomePerks = () => {
  const { t } = useLocale()

  const perks = [
    {
      name: t('perk.instantDelivery'),
      Icon: ArrowDownToLine,
      description: t('perk.instantDeliveryDesc'),
    },
    {
      name: t('perk.guaranteedQuality'),
      Icon: CheckCircle,
      description: t('perk.guaranteedQualityDesc'),
    },
    {
      name: t('perk.forThePlanet'),
      Icon: Sparkles,
      description: t('perk.forThePlanetDesc'),
    },
  ]

  return (
    <section className='border-t border-gray-200 bg-gray-50'>
      <div className='py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
        <div className='grid grid-cols-1 gap-y-12 sm:grid-cols-2 sm:gap-x-6 lg:grid-cols-3 lg:gap-x-8 lg:gap-y-0'>
          {perks.map((perk) => (
            <div
              key={perk.name}
              className='text-center md:flex md:items-start md:text-left lg:block lg:text-center'>
              <div className='md:flex-shrink-0 flex justify-center'>
                <div className='h-16 w-16 flex items-center justify-center rounded-full bg-pink-100 text-pink-900'>
                  <perk.Icon aria-hidden='true' className='w-1/3 h-1/3' />
                </div>
              </div>
              <div className='mt-6 md:ml-4 md:mt-0 lg:ml-0 lg:mt-6'>
                <h3 className='text-base font-medium text-gray-900'>{perk.name}</h3>
                <p className='mt-3 text-sm text-muted-foreground'>{perk.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
