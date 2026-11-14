import { NextResponse } from 'next/server'
import { getSession } from '@/lib/session'
import { getAdminPassword } from '@/lib/kv'

export const runtime = 'edge'

function withTimeout<T>(promise: Promise<T>, ms: number, label: string): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) => setTimeout(() => reject(new Error(`${label} timeout (${ms}ms)`)), ms))
  ])
}

export async function POST(request: Request) {
  try {
    let password
    try {
      const body = await withTimeout(request.json(), 3000, 'json')
      password = body.password
    } catch (e: any) {
      return NextResponse.json({ error: 'Step1 json: ' + (e?.message || '') }, { status: 500 })
    }

    let adminPassword
    try {
      adminPassword = await withTimeout(getAdminPassword(), 3000, 'getAdminPassword')
    } catch (e: any) {
      return NextResponse.json({ error: 'Step2 getAdminPassword: ' + (e?.message || '') }, { status: 500 })
    }

    if (password !== adminPassword) {
      return NextResponse.json({ error: '密码错误' }, { status: 401 })
    }

    let session
    try {
      session = await withTimeout(getSession(), 5000, 'getSession')
    } catch (e: any) {
      return NextResponse.json({ error: 'Step3 getSession: ' + (e?.message || '') }, { status: 500 })
    }

    session.isLoggedIn = true
    session.user = { name: 'Admin', email: '', image: '' }

    try {
      await withTimeout(session.save(), 5000, 'save')
    } catch (e: any) {
      return NextResponse.json({ error: 'Step4 save: ' + (e?.message || '') }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error: any) {
    return NextResponse.json({ error: '登录失败: ' + (error?.message || '') }, { status: 500 })
  }
}