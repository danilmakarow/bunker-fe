import type { MetadataRoute } from 'next';
import { themeColor } from '@/theme/tokens';

/**
 * Web app manifest — enables "Add to Home Screen" with a standalone
 * window, status-bar tinting, and a maskable adaptive icon. Icons are
 * generated dynamically by `app/icon.tsx` and `app/apple-icon.tsx`.
 */
const manifest = (): MetadataRoute.Manifest => ({
  name: 'Бункер',
  short_name: 'Бункер',
  description: 'Психологічна гра про виживання в укритті після апокаліпсису.',
  start_url: '/',
  display: 'standalone',
  orientation: 'portrait',
  background_color: themeColor,
  theme_color: themeColor,
  categories: ['games', 'social'],
  lang: 'uk',
  icons: [
    { src: '/icon', sizes: '512x512', type: 'image/png', purpose: 'any' },
    { src: '/apple-icon', sizes: '180x180', type: 'image/png', purpose: 'maskable' },
  ],
});

export default manifest;
