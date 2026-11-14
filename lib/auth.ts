import { headers } from 'next/headers'
import { getSessionFromCookieHeader } from '@/lib/cookie-session'

export async function auth() {
  const h = await headers()
  const session = getSessionFromCookieHeader(h.get('cookie'))
  if (!session.isLoggedIn) return null
  return {
    user: {
      name: session.user?.name || 'Admin',
      email: session.user?.email || '',
      image: session.user?.image || '',
    },
  }
}