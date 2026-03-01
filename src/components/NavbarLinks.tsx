'use client'

import Link from 'next/link'
import { buttonVariants } from './ui/button'
import { useLocale } from '@/hooks/use-locale'
import UserAccountNav from './UserAccountNav'
import { User } from '@/payload-types'
import LanguageSwitcher from './LanguageSwitcher'

const NavbarLinks = ({ user }: { user: User | null }) => {
  const { t } = useLocale()

  return (
    <div className='hidden lg:flex lg:flex-1 lg:items-center lg:justify-end lg:space-x-6'>
      <LanguageSwitcher />
      
      {!user && (
        <Link
          href='/sign-in'
          className={buttonVariants({
            variant: 'ghost',
          })}>
          {t('nav.signIn')}
        </Link>
      )}

      {!user && (
        <span
          className='h-6 w-px bg-gray-200'
          aria-hidden='true'
        />
      )}

      {user ? (
        <UserAccountNav user={user} />
      ) : (
        <Link
          href='/sign-up'
          className={buttonVariants({
            variant: 'ghost',
          })}>
          {t('nav.createAccount')}
        </Link>
      )}

      {user ? (
        <span
          className='h-6 w-px bg-gray-200'
          aria-hidden='true'
        />
      ) : null}

      {!user && (
        <div className='flex lg:ml-6'>
          <span
            className='h-6 w-px bg-gray-200'
            aria-hidden='true'
          />
        </div>
      )}
    </div>
  )
}

export default NavbarLinks
