import type { Metadata, Viewport } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'tempo // OS',
  description:
    'A dense, dark, AI-built command center for your four lives — school, internship, gym, and trading.',
  applicationName: 'Tempo',
  // Installable / standalone behaviour when added to an iOS home screen.
  appleWebApp: {
    capable: true,
    title: 'Tempo',
    statusBarStyle: 'black-translucent',
  },
  formatDetection: { telephone: false },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  // Let the UI extend under the iOS notch / home indicator (paired with the
  // env(safe-area-inset-*) padding in globals.css).
  viewportFit: 'cover',
  themeColor: '#0c0b0a',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        {/* Match the prototype's typefaces exactly: Hanken Grotesk for the UI,
            JetBrains Mono for the terminal-style module labels. Loaded by name
            so the inline style strings ported from the design resolve. */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        {/* App Router loads this once in the root layout, so the
            pages/_document.js guidance behind this rule doesn't apply. */}
        {/* eslint-disable-next-line @next/next/no-page-custom-font */}
        <link
          href="https://fonts.googleapis.com/css2?family=Hanken+Grotesk:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500;600&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
