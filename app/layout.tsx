export const runtime = "edge";
import type { Metadata, Viewport } from 'next'
import './globals.css'
import { Toaster } from 'react-hot-toast'

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
}

export const metadata: Metadata = {
  title: 'Dhanix – Crypto Staking Platform | Earn Up To 24% APY on USDT',
  description: 'Dhanix is a secure USDT BEP20 staking platform where you can earn up to 24% annual interest. Stake your USDT, refer friends, and earn rewards.',
  keywords: 'crypto staking, USDT staking, BEP20, passive income, cryptocurrency, Dhanix',
  openGraph: {
    title: 'Dhanix – Crypto Staking Platform',
    description: 'Earn up to 24% APY on your USDT with Dhanix. Secure, transparent, and rewarding.',
    type: 'website',
    url: process.env.NEXT_PUBLIC_APP_URL || 'https://dhanix.com',
    siteName: 'Dhanix',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Dhanix – Crypto Staking Platform',
    description: 'Earn up to 24% APY on your USDT with Dhanix.',
  },
  robots: { index: true, follow: true },
  icons: {
    icon: '/logo.png',
    shortcut: '/logo.png',
    apple: '/logo.png',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'FinancialService',
    name: 'Dhanix Crypto Staking',
    url: process.env.NEXT_PUBLIC_APP_URL || 'https://dhanix.com',
    description: 'Earn up to 24% APY on your USDT with Dhanix secure crypto staking platform.',
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'USD',
      category: 'Crypto Staking'
    }
  }

  return (
    <html lang="en">
      <body>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
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
