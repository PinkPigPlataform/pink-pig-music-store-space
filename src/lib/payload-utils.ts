import { getPayloadClient } from './payload'
import { cookies as nextCookies } from 'next/headers'

export const getServerSideUser = async () => {
  const cookieStore = await nextCookies()
  const token = cookieStore.get('payload-token')?.value

  if (!token) return { user: null }

  const payload = await getPayloadClient()

  try {
    const { user } = await payload.auth({
      headers: new Headers({ Authorization: `JWT ${token}` }),
    })
    return { user }
  } catch {
    return { user: null }
  }
}
