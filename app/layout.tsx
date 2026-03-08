import type { Metadata } from 'next'
import './globals.css'
import { Toaster } from 'react-hot-toast'

export const metadata: Metadata = {
  title: 'Dhanix – Crypto Staking Platform | Earn Up To 12% APY on USDT',
  description: 'Dhanix is a secure USDT BEP20 staking platform where you can earn up to 12% annual interest. Stake your USDT, refer friends, and earn rewards.',
  keywords: 'crypto staking, USDT staking, BEP20, passive income, cryptocurrency, Dhanix',
  openGraph: {
    title: 'Dhanix – Crypto Staking Platform',
    description: 'Earn up to 12% APY on your USDT with Dhanix. Secure, transparent, and rewarding.',
    type: 'website',
    url: process.env.NEXT_PUBLIC_APP_URL || 'https://dhanix.com',
    siteName: 'Dhanix',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Dhanix – Crypto Staking Platform',
    description: 'Earn up to 12% APY on your USDT with Dhanix.',
  },
  robots: { index: true, follow: true },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>
        {children}
        <Toaster
          position="top-right"
          toastOptions={{
            style: {
              background: '#16161f',
              color: '#f1f1f4',
              border: '1px solid rgba(255,255,255,0.06)',
              borderRadius: '12px',
            },
          }}
        />
      </body>
    </html>
  )
}
