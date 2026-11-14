import type { SessionData } from '@/types/session'

const COOKIE_NAME = 'navsphere-session'
const MAX_AGE = 60 * 60 * 24 * 7

function encode(data: SessionData): string {
  return Buffer.from(JSON.stringify(data), 'utf8').toString('base64')
}

function decode(value: string): SessionData {
  try {
    return JSON.parse(Buffer.from(value, 'base64').toString('utf8'))
  } catch {
    return { isLoggedIn: false }
  }
}

function parseCookieHeader(header: string | null): Record<string, string> {
  if (!header) return {}
  const result: Record<string, string> = {}
  for (const part of header.split(';')) {
    const [key, ...rest] = part.trim().split('=')
    if (key) result[key] = rest.join('=')
  }
  return result
}

export function getSessionFromCookieHeader(header: string | null): SessionData {
  const cookies = parseCookieHeader(header)
  const value = cookies[COOKIE_NAME]
  if (value) return decode(value)
  return { isLoggedIn: false }
}

export function getSessionFromRequest(request: Request): SessionData {
  return getSessionFromCookieHeader(request.headers.get('cookie'))
}

export function setSessionCookie(data: SessionData): string {
  const value = encode(data)
  const flags = [`Max-Age=${MAX_AGE}`, 'Path=/', 'HttpOnly', 'SameSite=Lax']
  if (process.env.NODE_ENV === 'production') flags.push('Secure')
  return `${COOKIE_NAME}=${value}; ${flags.join('; ')}`
}

export function clearSessionCookie(): string {
  return `${COOKIE_NAME}=; Max-Age=0; Path=/; HttpOnly; SameSite=Lax`
}