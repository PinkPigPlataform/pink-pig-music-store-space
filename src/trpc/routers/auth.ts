import { AuthCredentialsValidator } from '../../lib/validators/account-credentials-validator'
import { publicProcedure, router } from '../trpc'
import { TRPCError } from '@trpc/server'
import { z } from 'zod'

export const authRouter = router({
  createPayloadUser: publicProcedure
    .input(AuthCredentialsValidator)
    .mutation(async ({ input, ctx }) => {
      const { email, password } = input
      const { payload } = ctx

      const { docs: users } = await payload.find({
        collection: 'users',
        where: { email: { equals: email } },
      })

      if (users.length !== 0) throw new TRPCError({ code: 'CONFLICT' })

      await payload.create({
        collection: 'users',
        data: { email, password, role: 'user' },
      })

      return { success: true, sentToEmail: email }
    }),

  verifyEmail: publicProcedure
    .input(z.object({ token: z.string() }))
    .query(async ({ input, ctx }) => {
      const { token } = input
      const { payload } = ctx

      const isVerified = await payload.verifyEmail({
        collection: 'users',
        token,
      })

      if (!isVerified) throw new TRPCError({ code: 'UNAUTHORIZED' })

      return { success: true }
    }),

  signIn: publicProcedure
    .input(AuthCredentialsValidator)
    .mutation(async ({ input, ctx }) => {
      const { email, password } = input
      const { payload, headers } = ctx

      try {
        // Use Payload's login — sets the cookie via the response
        const result = await payload.login({
          collection: 'users',
          data: { email, password },
          req: {
            headers,
          } as unknown as Request,
        })

        return { success: true, token: result.token }
      } catch {
        throw new TRPCError({ code: 'UNAUTHORIZED' })
      }
    }),
})
