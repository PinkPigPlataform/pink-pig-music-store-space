import { cookies } from 'next/headers'
import { verifyUserToken } from '@/lib/user-auth'
import NavbarClient from './navbar-client'

export default async function StoreNavbar() {
  const cookieStore = await cookies()
  const token = cookieStore.get('user-token')?.value
  const payload = token ? verifyUserToken(token) : null

  return <NavbarClient user={payload ? { id: payload.id, email: payload.email } : null} />
}
