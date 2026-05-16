import type { NextConfig } from 'next';
import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin('./src/i18n/request.ts');

const apiOrigin = process.env.API_ORIGIN ?? 'http://localhost:3000';

// Vercel uses its own build output format and warns if `standalone` is set.
// Keep `standalone` only for non-Vercel targets (Docker / self-host).
const isVercel = process.env.VERCEL === '1';

const nextConfig: NextConfig = {
  reactStrictMode: true,
  ...(isVercel ? {} : { output: 'standalone' as const }),
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: `${apiOrigin}/api/:path*`,
      },
    ];
  },
};

export default withNextIntl(nextConfig);
