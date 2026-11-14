
export const dynamic = 'force-dynamic'

export default async function HomePage() {
  const results: string[] = []

  const tests: [string, () => Promise<any>][] = [
    ['@/lib/kv', async () => { const m = await import('@/lib/kv'); return typeof m.getNavigationCached }],
    ['@/components/ui/container', async () => { const m = await import('@/components/ui/container'); return typeof m.Container }],
    ['@/components/ScrollToTop', async () => { const m = await import('@/components/ScrollToTop'); return typeof m.ScrollToTop }],
    ['@/components/navigation-content', async () => { const m = await import('@/components/navigation-content'); return typeof m.NavigationContent }],
    ['@/navsphere/content/navigation.json', async () => { const m = await import('@/navsphere/content/navigation.json'); return typeof m.default }],
    ['@/navsphere/content/site.json', async () => { const m = await import('@/navsphere/content/site.json'); return typeof m.default }],
    ['@/navsphere/content/navigation-default.json', async () => { const m = await import('@/navsphere/content/navigation-default.json'); return typeof m.default }],
    ['@/navsphere/content/resource-metadata.json', async () => { const m = await import('@/navsphere/content/resource-metadata.json'); return typeof m.default }],
  ]

  for (const [name, test] of tests) {
    try {
      const r = await test()
      results.push(`✅ ${name} (${r})`)
    } catch (e: any) {
      results.push(`❌ ${name}: ${e?.message || String(e)}`)
    }
  }

  try {
    const { getNavigationCached, getSiteCached } = await import('@/lib/kv')
    const nav = await getNavigationCached()
    results.push(`✅ getNavigationCached() returned: ${nav ? 'data' : 'null'}`)
    const site = await getSiteCached()
    results.push(`✅ getSiteCached() returned: ${site ? 'data' : 'null'}`)
  } catch (e: any) {
    results.push(`❌ KV call: ${e?.message || String(e)} | ${e?.stack || ''}`)
  }

  return (
    <div style={{ padding: 40, fontFamily: 'monospace', fontSize: 14, lineHeight: 2 }}>
      <h2>Module Diagnostics</h2>
      {results.map((r, i) => (
        <div key={i} style={{ color: r.startsWith('❌') ? 'red' : 'green' }}>{r}</div>
      ))}
    </div>
  )
}
