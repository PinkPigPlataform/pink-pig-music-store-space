import { z } from 'zod'
import { privateProcedure, router } from '../trpc'
import { TRPCError } from '@trpc/server'
import { stripe } from '../../lib/stripe'
import type Stripe from 'stripe'

export const paymentRouter = router({
  createSession: privateProcedure
    .input(z.object({ productIds: z.array(z.string()) }))
    .mutation(async ({ ctx, input }) => {
      const { user, payload } = ctx
      let { productIds } = input

      if (productIds.length === 0) {
        throw new TRPCError({ code: 'BAD_REQUEST' })
      }

      const { docs: products } = await payload.find({
        collection: 'products',
        where: { id: { in: productIds } },
      })

      const filteredProducts = products.filter((prod) => Boolean(prod.priceId))

      const order = await payload.create({
        collection: 'orders',
        data: {
          _isPaid: false,
          products: filteredProducts.map((prod) => prod.id),
          user: user.id,
        },
      })

      const line_items: Stripe.Checkout.SessionCreateParams.LineItem[] = []

      filteredProducts.forEach((product) => {
        line_items.push({ price: product.priceId!, quantity: 1 })
      })

      // Transaction fee — price ID from env, never hardcoded
      if (process.env.STRIPE_TRANSACTION_FEE_PRICE_ID) {
        line_items.push({
          price: process.env.STRIPE_TRANSACTION_FEE_PRICE_ID,
          quantity: 1,
          adjustable_quantity: { enabled: false },
        })
      }

      try {
        const stripeSession = await stripe.checkout.sessions.create({
          success_url: `${process.env.NEXT_PUBLIC_SERVER_URL}/thank-you?orderId=${order.id}`,
          cancel_url: `${process.env.NEXT_PUBLIC_SERVER_URL}/cart`,
          payment_method_types: ['card'],
          mode: 'payment',
          metadata: { userId: user.id, orderId: order.id },
          line_items,
        })

        return { url: stripeSession.url }
      } catch {
        return { url: null }
      }
    }),

  pollOrderStatus: privateProcedure
    .input(z.object({ orderId: z.string() }))
    .query(async ({ input, ctx }) => {
      const { orderId } = input
      const { payload } = ctx

      const { docs: orders } = await payload.find({
        collection: 'orders',
        where: { id: { equals: orderId } },
      })

      if (!orders.length) throw new TRPCError({ code: 'NOT_FOUND' })

      return { isPaid: orders[0]._isPaid }
    }),
})
