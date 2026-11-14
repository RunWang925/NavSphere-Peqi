import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { isPasswordInitialized } from '@/lib/kv'

export const runtime = 'edge'

export async function GET() {
  try {
    const session = await auth()
    if (!session?.user) {
      return new Response('Unauthorized', { status: 401 })
    }

    const initialized = await isPasswordInitialized()
    return NextResponse.json({ initialized })
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : '检查失败' },
      { status: 500 }
    )
  }
}