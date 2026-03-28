import type { Metadata, Viewport } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Toaster } from 'react-hot-toast'

const inter = Inter({ subsets: ['latin'] })

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
}

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'https://dhanix.com'),
  title: {
    default: 'Dhanix – Crypto Staking Platform',
    template: '%s | Dhanix'
  },
  description: 'Dhanix is a secure USDT BEP20 staking platform. Stake your USDT, refer friends, and earn rewards.',
  keywords: 'crypto staking, USDT staking, BEP20, passive income, cryptocurrency, Dhanix',
  alternates: {
    canonical: './',
  },
  openGraph: {
    title: 'Dhanix – Crypto Staking Platform',
    description: 'Earn stable APY on your USDT with Dhanix. Secure, transparent, and rewarding.',
    type: 'website',
    siteName: 'Dhanix',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Dhanix Crypto Staking',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Dhanix – Crypto Staking Platform',
    description: 'Earn stable APY on your USDT with Dhanix.',
    images: ['/og-image.png'],
  },
  robots: {
    index: true,
    follow: true,
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={inter.className}>
      <body>
        {children}
        <Toaster
          position="top-right"
          toastOptions={{
            style: {
              background: '#ffffff',
              color: '#1a1a2e',
              border: '1px solid #e5e7eb',
              borderRadius: '12px',
              boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
            },
          }}
        />
      </body>
    </html>
  )
}
