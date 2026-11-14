/** @type {import('next').NextConfig} */
const nextConfig = {
  // Docker 部署时设 DOCKER_BUILD=1 启用 standalone，EdgeOne/Vercel 等平台不需要
  ...(process.env.DOCKER_BUILD === '1' ? { output: 'standalone' } : {}),

  images: {
    domains: [
      'dash.cloudflare.com',
      'www.google.com',
      'ph-static.imgix.net',
      'app.leonardo.ai'
    ],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },
  async rewrites() {
    return [
      {
        source: '/api/auth/:path*',
        destination: '/api/auth/:path*'
      },
      {
        source: '/auth/:path*',
        destination: '/auth/:path*'
      }
    ]
  },
  // Cloudflare Pages configuration
  experimental: {
    serverActions: {
      allowedOrigins: ['localhost', 'newkit.site']
    },
    optimizePackageImports: ['lucide-react', 'date-fns']
  }
}

module.exports = nextConfig
