import { NextResponse } from 'next/server'
import { getAdminPassword } from '@/lib/kv'
import { getSessionFromRequest, setSessionCookie } from '@/lib/cookie-session'

export const runtime = 'edge'

export async function POST(request: Request) {
  try {
    const { password } = await request.json()
    const adminPassword = await getAdminPassword()
    if (password !== adminPassword) {
      return NextResponse.json({ error: '密码错误' }, { status: 401 })
    }
    const session = getSessionFromRequest(request)
    session.isLoggedIn = true
    session.user = { name: 'Admin', email: '', image: '' }
    const response = NextResponse.json({ success: true })
    response.headers.set('Set-Cookie', setSessionCookie(session))
    return response
  } catch (error: any) {
    return NextResponse.json({ error: '登录失败: ' + (error?.message || '') }, { status: 500 })
  }
}