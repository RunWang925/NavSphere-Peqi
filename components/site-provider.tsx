'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import type { SiteConfig } from '@/types/site'

const SiteContext = createContext<{
  siteInfo: SiteConfig | null
  isLoading: boolean
  error: Error | null
}>({
  siteInfo: null,
  isLoading: true,
  error: null,
})

export function useSiteInfo() {
  return useContext(SiteContext)
}

export function SiteProvider({ children }: { children: React.ReactNode }) {
  const [siteInfo, setSiteInfo] = useState<SiteConfig | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    async function loadSiteInfo() {
      try {
        const response = await fetch('/api/site-config')
        if (!response.ok) {
          throw new Error('Failed to fetch site config')
        }
        const data = await response.json()
        setSiteInfo(data)
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Unknown error'))
        // 设置默认值
        setSiteInfo({
          basic: {
            title: 'NavSphere Peiqi',
            description: 'NavSphere Peiqi — 基于 Cloudflare KV 的自托管导航站，后台修改实时生效，无需重新部署。',
            keywords: 'NavSphere Peiqi,导航,自托管,Cloudflare,KV,个人导航,网址收藏,网站导航'
          },
          appearance: {
            logo: '/logo.png',
            favicon: '/favicon.ico',
            theme: 'system'
          },
          navigation: {
            linkTarget: '_blank'
          }
        })
      } finally {
        setIsLoading(false)
      }
    }

    loadSiteInfo()
  }, [])

  return (
    <SiteContext.Provider value={{ siteInfo, isLoading, error }}>
      {children}
    </SiteContext.Provider>
  )
}
