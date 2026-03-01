'use client'

import { useCart } from '@/hooks/use-cart'
import { formatPrice } from '@/lib/utils'
import { trpc } from '@/trpc/client'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { Button, buttonVariants } from './ui/button'
import CartItem from './CartItem'
import { Loader2 } from 'lucide-react'
import { toast } from 'sonner'

const CartClient = () => {
  const { items } = useCart()
  const [isMounted, setIsMounted] = useState(false)
  const router = useRouter()

  useEffect(() => setIsMounted(true), [])

  const cartTotal = items.reduce((total, { product }) => total + product.price, 0)

  const { data: checkoutConfig } = trpc.checkoutConfig.useQuery()
  const fee = (checkoutConfig?.transactionFeeCents ?? 0) / 100

  const { mutate: createCheckoutSession, isPending } =
    trpc.payment.createSession.useMutation({
      onSuccess: ({ url }) => {
        if (url) router.push(url)
        else toast.error('There was a problem. Please try again.')
      },
    })

  const handleCheckout = () => {
    createCheckoutSession({ productIds: items.map(({ product }) => product.id) })
  }

  if (!isMounted) return null

  return (
    <div className='bg-white'>
      <div className='mx-auto max-w-2xl px-4 pb-24 pt-16 sm:px-6 lg:max-w-7xl lg:px-8'>
        <h1 className='text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl'>
          Shopping Cart
        </h1>

        <div className='mt-12 lg:grid lg:grid-cols-12 lg:items-start lg:gap-x-12 xl:gap-x-16'>
          <div
            className={`lg:col-span-7 ${
              items.length === 0 ? 'rounded-lg border-2 border-dashed border-zinc-200 p-12' : ''
            }`}>
            {items.length === 0 ? (
              <div className='flex h-full flex-col items-center justify-center space-y-1'>
                <div className='relative mb-4 h-40 w-40 text-muted-foreground'>
                  <Image src='/pig-empty-cart.png' fill alt='empty shopping cart' />
                </div>
                <h3 className='font-semibold text-2xl'>Your cart is empty</h3>
                <p className='text-muted-foreground text-center'>
                  Whoops! Nothing to show here yet.
                </p>
              </div>
            ) : null}

            <ul className={items.length > 0 ? 'divide-y divide-gray-200 border-b border-t border-gray-200' : ''}>
              {items.map(({ product }) => (
                <CartItem key={product.id} product={product} />
              ))}
            </ul>
          </div>

          <section className='mt-16 rounded-lg bg-gray-50 px-4 py-6 sm:p-6 lg:col-span-5 lg:mt-0 lg:p-8'>
            <h2 className='text-lg font-medium text-gray-900'>Order summary</h2>

            <div className='mt-6 space-y-4'>
              <div className='flex items-center justify-between'>
                <p className='text-sm text-gray-600'>Subtotal</p>
                <p className='text-sm font-medium text-gray-900'>
                  {isMounted ? formatPrice(cartTotal) : <Loader2 className='h-4 w-4 animate-spin text-muted-foreground' />}
                </p>
              </div>

              <div className='flex items-center justify-between border-t border-gray-200 pt-4'>
                <div className='flex items-center text-sm text-muted-foreground'>
                  <span>Flat Transaction Fee</span>
                </div>
                <div className='text-sm font-medium text-gray-900'>
                  {isMounted ? formatPrice(fee) : <Loader2 className='h-4 w-4 animate-spin text-muted-foreground' />}
                </div>
              </div>

              <div className='flex items-center justify-between border-t border-gray-200 pt-4'>
                <div className='text-base font-medium text-gray-900'>Order total</div>
                <div className='text-base font-medium text-gray-900'>
                  {isMounted ? formatPrice(cartTotal + fee) : <Loader2 className='h-4 w-4 animate-spin text-muted-foreground' />}
                </div>
              </div>
            </div>

            <div className='mt-6'>
              <Button
                disabled={items.length === 0 || isPending}
                onClick={handleCheckout}
                className='w-full'>
                {isPending ? (
                  <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                ) : null}
                Checkout
              </Button>
            </div>
          </section>
        </div>
      </div>
    </div>
  )
}

export default CartClient
