import Image from 'next/image'
import VerifyEmail from '@/components/VerifyEmail'

interface PageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}

export default async function VerifyEmailPage({ searchParams }: PageProps) {
  const params = await searchParams
  const token = params.token as string | undefined
  const toEmail = params.to as string | undefined

  return (
    <div className='container relative flex pt-20 flex-col items-center justify-center lg:px-0'>
      <div className='mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]'>
        {token ? (
          <VerifyEmail token={token} />
        ) : (
          <div className='flex h-full flex-col items-center justify-center space-y-1'>
            <div className='relative mb-4 h-60 w-60 text-muted-foreground'>
              <Image
                src='/pinkpig-email-sent.png'
                fill
                alt='the email was sent'
              />
            </div>
            <h3 className='font-semibold text-2xl'>Check your email</h3>
            {toEmail ? (
              <p className='text-muted-foreground text-center'>
                We&apos;ve sent a verification link to{' '}
                <span className='font-semibold'>{toEmail}</span>.
              </p>
            ) : (
              <p className='text-muted-foreground text-center'>
                We&apos;ve sent a verification link to your email.
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
