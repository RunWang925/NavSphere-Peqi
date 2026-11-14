import { NextResponse } from 'next/server'
import { getSiteCached } from '@/lib/kv'

export const runtime = process.env.CF_PAGES === '1' ? 'edge' : 'nodejs'

export async function GET() {
  try {
    const data = await getSiteCached()
    return NextResponse.json(data, {
      headers: {
        'Cache-Control': 's-maxage=60, stale-while-revalidate',
        'Content-Type': 'application/json'
      }
    })
  } catch (error) {
    console.error('Error in site API:', error)
    return NextResponse.json(
      { error: '获取站点数据失败' },
      { status: 500 }
    )
  }
}
