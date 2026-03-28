import { Metadata } from 'next'
import LandingNav from '@/components/LandingNav'
import Footer from '@/components/Footer'

export const metadata: Metadata = {
    title: 'Terms of Service',
    description: 'Terms of Service for Dhanix. Please read carefully before using our USDT staking services.',
}

export default function TermsPage() {
    return (
        <div style={{ minHeight: '100vh', background: '#ffffff' }}>
            <LandingNav />
            
            <main style={{ padding: '120px 24px 80px', maxWidth: '800px', margin: '0 auto' }}>
                <h1 style={{ fontSize: 'clamp(28px, 4vw, 36px)', fontWeight: 800, color: '#1a1a2e', marginBottom: '40px', letterSpacing: '-0.5px' }}>
                    Terms of <span style={{ background: 'var(--accent-gradient)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Service</span>
                </h1>
                
                <section style={{ marginBottom: '32px' }}>
                    <h2 style={{ fontSize: '18px', fontWeight: 700, color: '#1a1a2e', marginBottom: '16px' }}>1. Acceptance of Terms</h2>
                    <p style={{ color: '#64648b', fontSize: '15px', lineHeight: 1.7 }}>By accessing and using Dhanix, you agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use our services.</p>
                </section>

                <section style={{ marginBottom: '32px' }}>
                    <h2 style={{ fontSize: '18px', fontWeight: 700, color: '#1a1a2e', marginBottom: '16px' }}>2. USDT Staking</h2>
                    <p style={{ color: '#64648b', fontSize: '15px', lineHeight: 1.7 }}>Dhanix provides a staking platform for USDT BEP20. Staked funds are locked for the duration of the chosen pool. Interest is calculated based on the APY displayed at the time of pool creation. All staking reflects decentralized blockchain transactions.</p>
                </section>

                <section style={{ marginBottom: '32px' }}>
                    <h2 style={{ fontSize: '18px', fontWeight: 700, color: '#1a1a2e', marginBottom: '16px' }}>3. Risk Disclosure</h2>
                    <p style={{ color: '#64648b', fontSize: '15px', lineHeight: 1.7 }}>Cryptocurrency staking involves market risks. While our interest rates are stable, users should only stake amounts they can afford to lock for the specified duration. Dhanix is not responsible for losses due to network-level smart contract risks on BSC.</p>
                </section>

                <section style={{ marginBottom: '32px' }}>
                    <h2 style={{ fontSize: '18px', fontWeight: 700, color: '#1a1a2e', marginBottom: '16px' }}>4. Withdrawals & Deposits</h2>
                    <p style={{ color: '#64648b', fontSize: '15px', lineHeight: 1.7 }}>Deposits must be sent to the unique wallet address provided. Minimum and maximum thresholds apply to both deposits and withdrawals as stated in the platform settings.</p>
                </section>

                <section style={{ marginBottom: '32px' }}>
                    <h2 style={{ fontSize: '18px', fontWeight: 700, color: '#1a1a2e', marginBottom: '16px' }}>5. Account Termination</h2>
                    <p style={{ color: '#64648b', fontSize: '15px', lineHeight: 1.7 }}>We reserve the right to suspend or terminate accounts found to be in violation of our security policies or attempting fraudulent activities.</p>
                </section>

                <p style={{ fontSize: '14px', color: '#9ca3af', marginTop: '64px' }}>Last Updated: March 28, 2026</p>
            </main>

            <Footer />
        </div>
    )
}
