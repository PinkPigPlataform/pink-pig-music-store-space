'use client'

import { Suspense } from 'react'

import { Icons } from '@/components/Icons'
import { Button, buttonVariants } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { cn } from '@/lib/utils'
import { zodResolver } from '@hookform/resolvers/zod'
import { ArrowRight, Loader2 } from 'lucide-react'
import Link from 'next/link'
import { useForm } from 'react-hook-form'
import {
  AuthCredentialsValidator,
  type TAuthCredentialsValidator,
} from '@/lib/validators/account-credentials-validator'
import { toast } from 'sonner'
import { useRouter, useSearchParams } from 'next/navigation'
import { useState, useEffect } from 'react'
import GoogleSignInButton from '@/components/GoogleSignInButton'
import { useLocale } from '@/hooks/use-locale'

function SignIn() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const { t } = useLocale()
  const isSeller = searchParams.get('as') === 'seller'
  const origin = searchParams.get('origin')
  const error = searchParams.get('error')

  const continueAsSeller = () => router.push('?as=seller')
  const continueAsBuyer = () => router.replace('/sign-in')
  const [isPending, setIsPending] = useState(false)

  useEffect(() => {
    if (error === 'google-denied') {
      toast.error(t('general.googleCancelled'))
    } else if (error) {
      toast.error(t('general.googleError'))
    }
  }, [error, t])

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<TAuthCredentialsValidator>({
    resolver: zodResolver(AuthCredentialsValidator),
  })

  const onSubmit = async ({ email, password }: TAuthCredentialsValidator) => {
    setIsPending(true)

    try {
      const response = await fetch('/api/auth/sign-in', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      })

      if (!response.ok) {
        toast.error(t('general.invalidCredentials'))
        return
      }

      toast.success(t('general.signedInSuccess'))
      router.refresh()

      if (origin) {
        router.push(`/${origin}`)
        return
      }
      if (isSeller) {
        router.push('/sell')
        return
      }
      router.push('/')
    } finally {
      setIsPending(false)
    }
  }

  return (
    <div className='container relative flex pt-20 flex-col items-center justify-center lg:px-0'>
      <div className='mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]'>
        <div className='flex flex-col items-center space-y-2 text-center'>
          <Icons.logo className='h-20 w-20' />
          <h1 className='text-2xl font-semibold tracking-tight'>
            {t('auth.signInTitle')} {isSeller ? t('auth.sellerAccount') : ''}
          </h1>
          <Link
            className={buttonVariants({ variant: 'link', className: 'gap-1.5' })}
            href='/sign-up'>
            {t('auth.noAccount')}
            <ArrowRight className='h-4 w-4' />
          </Link>
        </div>

        <div className='grid gap-6'>
          <GoogleSignInButton origin={origin} label={t('auth.continueWithGoogle')} />

          <div className='relative'>
            <div aria-hidden='true' className='absolute inset-0 flex items-center'>
              <span className='w-full border-t' />
            </div>
            <div className='relative flex justify-center text-xs uppercase'>
              <span className='bg-background px-2 text-muted-foreground'>{t('auth.orContinueWith')}</span>
            </div>
          </div>

          <form onSubmit={handleSubmit(onSubmit)}>
            <div className='grid gap-2'>
              <div className='grid gap-1 py-2'>
                <Label htmlFor='email'>{t('auth.email')}</Label>
                <Input
                  {...register('email')}
                  className={cn({ 'focus-visible:ring-red-500': errors.email })}
                  placeholder='you@example.com'
                />
                {errors?.email && (
                  <p className='text-sm text-red-500'>{errors.email.message}</p>
                )}
              </div>

              <div className='grid gap-1 py-2'>
                <Label htmlFor='password'>{t('auth.password')}</Label>
                <Input
                  {...register('password')}
                  type='password'
                  className={cn({ 'focus-visible:ring-red-500': errors.password })}
                  placeholder={t('auth.password')}
                />
                {errors?.password && (
                  <p className='text-sm text-red-500'>{errors.password.message}</p>
                )}
              </div>

              <Button disabled={isPending}>
                {isPending && <Loader2 className='mr-2 h-4 w-4 animate-spin' />}
                {t('auth.signInButton')}
              </Button>
            </div>
          </form>

          <div className='relative'>
            <div aria-hidden='true' className='absolute inset-0 flex items-center'>
              <span className='w-full border-t' />
            </div>
            <div className='relative flex justify-center text-xs uppercase'>
              <span className='bg-background px-2 text-muted-foreground'>{t('auth.or')}</span>
            </div>
          </div>

          {isSeller ? (
            <Button onClick={continueAsBuyer} variant='secondary' disabled={isPending}>
              {t('auth.continueAsCustomer')}
            </Button>
          ) : (
            <Button onClick={continueAsSeller} variant='secondary' disabled={isPending}>
              {t('auth.continueAsSeller')}
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}

export default function SignInPage() {
  return (
    <Suspense>
      <SignIn />
    </Suspense>
  )
}
