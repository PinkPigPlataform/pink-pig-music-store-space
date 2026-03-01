import { headers } from 'next/headers'
import { getPayloadClient } from '../lib/payload'
import type { User } from '../payload-types'

export const createContext = async () => {
  const headersList = await headers()
  const payload = await getPayloadClient()

  const token = headersList
    .get('cookie')
    ?.split(';')
    .find((c) => c.trim().startsWith('payload-token='))
    ?.split('=')[1]

  let user: User | null = null

  if (token) {
    try {
      const authResult = await payload.auth({
        headers: new Headers({ Authorization: `JWT ${token}` }),
      })
      user = authResult.user as User | null
    } catch {
      user = null
    }
  }

  return { payload, user, headers: headersList }
}

export type Context = Awaited<ReturnType<typeof createContext>>
