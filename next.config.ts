import type { NextConfig } from 'next'

const config: NextConfig = {
  reactStrictMode: true,
  async headers() {
    return [
      {
        // Allow iframe embedding on the share/preview route only
        source: '/dashboard/(.*)',
        headers: [
          { key: 'Content-Security-Policy', value: "frame-ancestors *" },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'X-XSS-Protection', value: '1; mode=block' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
        ],
      },
      {
        // All other routes: block iframe embedding to prevent clickjacking
        source: '/((?!dashboard).*)',
        headers: [
          { key: 'Content-Security-Policy', value: "frame-ancestors 'self'" },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'X-XSS-Protection', value: '1; mode=block' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
        ],
      },
    ]
  },
}

export default config
