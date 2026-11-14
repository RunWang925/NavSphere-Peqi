import { NextResponse } from 'next/server'
import { clearSessionCookie } from '@/lib/cookie-session'

export const runtime = 'edge'

export async function POST() {
  const response = NextResponse.json({ success: true })
  response.headers.set('Set-Cookie', clearSessionCookie())
  return response
}