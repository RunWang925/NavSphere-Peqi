import { NextResponse } from 'next/server'
import { getEnv } from '@/lib/kv'

export const runtime = process.env.CF_PAGES === '1' ? 'edge' : 'nodejs'

function detectPlatform(): string {
  if (process.env.CF_PAGES === '1') return 'cloudflare'
  if (process.env.NODE_ENV === 'development') return 'local'
  const custom = process.env.DEPLOY_PLATFORM
  if (custom) return custom
  return 'unknown'
}

export async function GET() {
  const env = await getEnv()
  const platform = detectPlatform()
  return NextResponse.json({
    kvAvailable: !!env?.NAV_KV,
    r2Available: !!env?.R2_BUCKET,
    platform
  })
}