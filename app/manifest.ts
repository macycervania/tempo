import type { MetadataRoute } from 'next';

// Web app manifest — makes Tempo installable as a standalone app on iOS/Android.
// Next.js serves this at /manifest.webmanifest and links it automatically.
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'tempo // OS',
    short_name: 'Tempo',
    description:
      'A dense, dark, AI-built command center for school, internship, gym, and trading.',
    start_url: '/',
    display: 'standalone',
    background_color: '#0c0b0a',
    theme_color: '#0c0b0a',
    orientation: 'portrait',
    icons: [
      { src: '/icon.svg', sizes: 'any', type: 'image/svg+xml', purpose: 'any' },
    ],
  };
}
