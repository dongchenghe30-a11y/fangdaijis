/** @type {import('next').NextConfig} */
const nextConfig = {
  // 生产环境时将 API 代理到后端
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: process.env.API_BASE_URL
          ? `${process.env.API_BASE_URL}/api/:path*`
          : 'http://localhost:8000/api/:path*',
      },
    ]
  },
}

module.exports = nextConfig
