import { Metadata } from 'next'
import LandingNav from '@/components/LandingNav'
import Footer from '@/components/Footer'

export const metadata: Metadata = {
    title: 'Privacy Policy',
    description: 'Privacy Policy for Dhanix Crypto Staking Platform. Learn how we handle your data.',
}

export default function PrivacyPolicyPage() {
    return (
        <div style={{ minHeight: '100vh', background: '#ffffff' }}>
            <LandingNav />
            
            <main style={{ padding: '120px 24px 80px', maxWidth: '800px', margin: '0 auto' }}>
                <h1 style={{ fontSize: 'clamp(28px, 4vw, 36px)', fontWeight: 800, color: '#1a1a2e', marginBottom: '40px', letterSpacing: '-0.5px' }}>
                    Privacy <span style={{ background: 'var(--accent-gradient)', backgroundClip: 'text', WebkitBackgroundClip: 'text', color: 'transparent', WebkitTextFillColor: 'transparent' }}>Policy</span>
                </h1>
                
                <section style={{ marginBottom: '32px' }}>
                    <h2 style={{ fontSize: '20px', fontWeight: 700, color: '#1a1a2e', marginBottom: '16px' }}>1. Information We Collect</h2>
                    <p style={{ color: '#64648b', fontSize: '15px', lineHeight: 1.7 }}>We collect minimal personal information required for platform security and operation. This includes your email address for account identification and wallet addresses for processing USDT transactions on the BSC network.</p>
                </section>

                <section style={{ marginBottom: '32px' }}>
                    <h2 style={{ fontSize: '20px', fontWeight: 700, color: '#1a1a2e', marginBottom: '16px' }}>2. How We Use Data</h2>
                    <p style={{ color: '#64648b', fontSize: '15px', lineHeight: 1.7 }}>Your data is used solely to provide services, process staking pools, verify identity through OTP, and ensure compliance with security protocols. We do not sell or share your personal data with third-party marketers.</p>
                </section>

                <section style={{ marginBottom: '32px' }}>
                    <h2 style={{ fontSize: '20px', fontWeight: 700, color: '#1a1a2e', marginBottom: '16px' }}>3. Blockchain Transparency</h2>
                    <p style={{ color: '#64648b', fontSize: '15px', lineHeight: 1.7 }}>All staking transactions occur on the Binance Smart Chain. While your identity on Dhanix is protected, transaction hashes and wallet address activities are public on the blockchain as per decentralized protocol standards.</p>
                </section>

                <section style={{ marginBottom: '32px' }}>
                    <h2 style={{ fontSize: '20px', fontWeight: 700, color: '#1a1a2e', marginBottom: '16px' }}>4. Data Security</h2>
                    <p style={{ color: '#64648b', fontSize: '15px', lineHeight: 1.7 }}>We implement robust encryption and multi-factor authentication (OTP) to protect your account. Users are responsible for maintaining the security of their own passwords and private keys.</p>
                </section>

                <section style={{ marginBottom: '32px' }}>
                    <h2 style={{ fontSize: '20px', fontWeight: 700, color: '#1a1a2e', marginBottom: '16px' }}>5. Updates</h2>
                    <p style={{ color: '#64648b', fontSize: '15px', lineHeight: 1.7 }}>This policy may be updated periodically. Significant changes will be announced via your registered email or through platform notifications.</p>
                </section>

                <p style={{ fontSize: '14px', color: '#9ca3af', marginTop: '64px' }}>Last Updated: March 28, 2026</p>
            </main>

            <Footer />
        </div>
    )
}
