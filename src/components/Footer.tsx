'use client'

import { usePathname } from 'next/navigation'
import MaxWidthWrapper from './MaxWidthWrapper'
import { Icons } from './Icons'
import Link from 'next/link'
import { useLocale } from '@/hooks/use-locale'
import { tenantConfig } from '@/config/tenant'

const Footer = () => {
  const pathname = usePathname()
  const { t } = useLocale()
  const pathsToMinimize = [
    '/verify-email',
    '/sign-up',
    '/sign-in',
  ]

  return (
    <footer className='bg-white flex-grow-0'>
      <MaxWidthWrapper>
        <div className='border-t border-gray-200'>
          {pathsToMinimize.includes(pathname) ? null : (
            <div className='pb-8 pt-16'>
              <div className='flex justify-center'>
                <Icons.logo className='h-12 w-auto' />
              </div>
            </div>
          )}


        </div>

        <div className='py-10 md:flex md:items-center md:justify-between'>
          <div className='text-center md:text-left'>
            <p className='text-sm text-muted-foreground'>
              &copy; {new Date().getFullYear()} {tenantConfig.copyrightOwner}. All Rights Reserved.
              {tenantConfig.copyrightUrl && (
                <>{' '}Built by{' '}
                  <Link
                    href={tenantConfig.copyrightUrl}
                    target='_blank'
                    className='font-medium text-gray-900 hover:text-pink-600'>
                    {tenantConfig.copyrightUrl.replace(/^https?:\/\//, '')}
                  </Link>
                </>
              )}
            </p>
          </div>

          <div className='mt-4 flex items-center justify-center md:mt-0'>
            <div className='flex space-x-8'>
              <Link
                href='/terms'
                className='text-sm text-muted-foreground hover:text-gray-600'>
                {t('footer.terms')}
              </Link>
              <Link
                href='/privacy'
                className='text-sm text-muted-foreground hover:text-gray-600'>
                {t('footer.privacy')}
              </Link>
              <Link
                href='/cookies'
                className='text-sm text-muted-foreground hover:text-gray-600'>
                {t('footer.cookies')}
              </Link>
            </div>
          </div>
        </div>
      </MaxWidthWrapper>
    </footer>
  )
}

export default Footer
