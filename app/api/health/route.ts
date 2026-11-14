import { NextResponse } from 'next/server'
export const runtime = process.env.CF_PAGES === '1' ? 'edge' : 'nodejs'

export async function GET() {
  return NextResponse.json({ 
    app:'NavSphere',
    status: 'ok', 
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  })
}