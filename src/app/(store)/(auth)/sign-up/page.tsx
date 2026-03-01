'use client'

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
import { trpc } from '@/trpc/client'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'
import GoogleSignInButton from '@/components/GoogleSignInButton'
import { useLocale } from '@/hooks/use-locale'

export default function SignUpPage() {
  const router = useRouter()
  const { t } = useLocale()

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<TAuthCredentialsValidator>({
    resolver: zodResolver(AuthCredentialsValidator),
  })

  const { mutate: registerUser, isPending } = trpc.auth.createPayloadUser.useMutation({
    onError: (err) => {
      if (err.data?.code === 'CONFLICT') {
        toast.error('This email is already in use. Sign in instead?')
        return
      }
      toast.error(t('general.error'))
    },
    onSuccess: ({ sentToEmail }) => {
      toast.success(`${t('verify.sent')} ${sentToEmail}.`)
      router.push(`/verify-email?to=${sentToEmail}`)
    },
  })

  const onSubmit = ({ email, password }: TAuthCredentialsValidator) => {
    registerUser({ email, password })
  }

  return (
    <div className='container relative flex pt-20 flex-col items-center justify-center lg:px-0'>
      <div className='mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]'>
        <div className='flex flex-col items-center space-y-2 text-center'>
          <Icons.logo className='h-20 w-20' />
          <h1 className='text-2xl font-semibold tracking-tight'>{t('auth.signUpTitle')}</h1>
          <Link
            className={buttonVariants({ variant: 'link', className: 'gap-1.5' })}
            href='/sign-in'>
            {t('auth.hasAccount')}
            <ArrowRight className='h-4 w-4' />
          </Link>
        </div>

        <div className='grid gap-6'>
          <GoogleSignInButton label={t('auth.continueWithGoogle')} />

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
                {t('auth.signUpButton')}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
