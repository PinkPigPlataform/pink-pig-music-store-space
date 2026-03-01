import { z } from 'zod'
import { authRouter } from './routers/auth'
import { publicProcedure, router } from './trpc'
import { QueryValidator } from '../lib/validators/query-validator'
import { paymentRouter } from './routers/payment'
import { getTransactionFeeCents } from '@/lib/billing'

export const appRouter = router({
  auth: authRouter,
  payment: paymentRouter,

  checkoutConfig: publicProcedure.query(async () => {
    const transactionFeeCents = await getTransactionFeeCents()

    return {
      transactionFeeCents,
    }
  }),

  getInfiniteProducts: publicProcedure
    .input(
      z.object({
        limit: z.number().min(1).max(100),
        cursor: z.number().nullish(),
        query: QueryValidator,
      })
    )
    .query(async ({ input, ctx }) => {
      const { query, cursor } = input
      const { sort, limit, ...queryOpts } = query
      const { payload } = ctx

      const parsedQueryOpts: Record<string, { equals: string }> = {}
      Object.entries(queryOpts).forEach(([key, value]) => {
        if (value) parsedQueryOpts[key] = { equals: value }
      })

      const page = cursor || 1

      const { docs: items, hasNextPage, nextPage } = await payload.find({
        collection: 'products',
        where: {
          ...parsedQueryOpts,
        },
        sort,
        depth: 1,
        limit,
        page,
      })

      return {
        items,
        nextPage: hasNextPage ? nextPage : null,
      }
    }),
})

export type AppRouter = typeof appRouter
