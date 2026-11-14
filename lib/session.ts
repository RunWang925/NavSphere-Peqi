import { cookies } from 'next/headers'
import type { SessionData } from '@/types/session'

async function getSecret(): Promise<string> {
  if (process.env.CF_PAGES === '1') {
    try {
      const { getRequestContext } = await import('@cloudflare/next-on-pages')
      const env = getRequestContext().env as any
      if (env.SESSION_SECRET) return env.SESSION_SECRET
    } catch {}
  }
  if (process.env.SESSION_SECRET) return process.env.SESSION_SECRET
  return 'build-time-dummy-secret-at-least-32-characters-long'
}

function createFallbackSession(store: any): any {
  let data: SessionData = { isLoggedIn: false }
  const cookieValue = store.get('navsphere-session')?.value
  if (cookieValue) {
    try {
      data = JSON.parse(Buffer.from(cookieValue, 'base64').toString('utf8'))
    } catch {}
  }
  return new Proxy(data, {
    get(target: any, prop: string) {
      if (prop === 'save') {
        return async () => {
          const value = Buffer.from(JSON.stringify(target), 'utf8').toString('base64')
          store.set('navsphere-session', value, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax' as const,
            maxAge: 60 * 60 * 24 * 7,
          })
        }
      }
      if (prop === 'destroy') {
        return async () => { store.delete('navsphere-session') }
      }
      return target[prop]
    },
    set(target: any, prop: string, value: any) {
      target[prop] = value
      return true
    }
  })
}

export async function getSession(cookieStore?: any) {
  const store = cookieStore ?? (await cookies())

  if (process.env.CF_PAGES !== '1') {
    return createFallbackSession(store)
  }

  const password = await getSecret()
  try {
    const { getIronSession } = await import('iron-session')
    const session = await getIronSession<SessionData>(store, {
      password,
      cookieName: 'navsphere-session',
      cookieOptions: {
        secure: process.env.NODE_ENV === 'production',
        httpOnly: true,
        sameSite: 'lax' as const,
      },
    })
    if (!session.isLoggedIn) {
      session.isLoggedIn = false
    }
    return session
  } catch {
    return createFallbackSession(store)
  }
}