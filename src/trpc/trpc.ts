import { TRPCError, initTRPC } from '@trpc/server'
import type { Context } from './context'

const t = initTRPC.context<Context>().create()
const middleware = t.middleware

const isAuth = middleware(async ({ ctx, next }) => {
  if (!ctx.user || !ctx.user.id) {
    throw new TRPCError({ code: 'UNAUTHORIZED' })
  }
  return next({ ctx: { user: ctx.user } })
})

export const router = t.router
export const publicProcedure = t.procedure
export const privateProcedure = t.procedure.use(isAuth)
