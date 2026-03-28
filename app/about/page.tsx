import { Metadata } from 'next'
import LandingNav from '@/components/LandingNav'
import Footer from '@/components/Footer'
import { Shield, Target, Users } from 'lucide-react'

export const metadata: Metadata = {
    title: 'About Us',
    description: 'Learn more about Dhanix, the most secure and transparent USDT BEP20 staking platform.',
}

export default function AboutPage() {
    return (
        <div style={{ minHeight: '100vh', background: '#ffffff' }}>
            <LandingNav />
            
            <main style={{ padding: '120px 24px 80px', maxWidth: '800px', margin: '0 auto' }}>
                <h1 style={{ fontSize: 'clamp(32px, 5vw, 48px)', fontWeight: 900, color: '#1a1a2e', marginBottom: '24px', letterSpacing: '-1.5px' }}>
                    Empowering Your <span style={{ background: 'var(--accent-gradient)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Crypto Journey</span>
                </h1>
                
                <p style={{ fontSize: '18px', color: '#64648b', lineHeight: 1.7, marginBottom: '48px' }}>
                    Dhanix was founded with a single mission: to provide the most secure, transparent, and user-friendly USDT staking experience on the Binance Smart Chain.
                </p>

                <div style={{ display: 'grid', gap: '32px', marginBottom: '64px' }}>
                    <div style={{ display: 'flex', gap: '20px' }}>
                        <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'rgba(124,58,237,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--accent-primary)', flexShrink: 0 }}>
                            <Shield size={24} />
                        </div>
                        <div>
                            <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#1a1a2e', marginBottom: '8px' }}>Security First</h3>
                            <p style={{ color: '#64648b', fontSize: '15px', lineHeight: 1.6 }}>We prioritize the safety of your funds above all else, utilizing industry-leading encryption and secure smart contract standards.</p>
                        </div>
                    </div>

                    <div style={{ display: 'flex', gap: '20px' }}>
                        <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'rgba(124,58,237,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--accent-primary)', flexShrink: 0 }}>
                            <Target size={24} />
                        </div>
                        <div>
                            <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#1a1a2e', marginBottom: '8px' }}>Transparency</h3>
                            <p style={{ color: '#64648b', fontSize: '15px', lineHeight: 1.6 }}>Every transaction, stake, and reward is recorded on the blockchain, ensuring complete visibility and trust.</p>
                        </div>
                    </div>

                    <div style={{ display: 'flex', gap: '20px' }}>
                        <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'rgba(124,58,237,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--accent-primary)', flexShrink: 0 }}>
                            <Users size={24} />
                        </div>
                        <div>
                            <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#1a1a2e', marginBottom: '8px' }}>Community Focused</h3>
                            <p style={{ color: '#64648b', fontSize: '15px', lineHeight: 1.6 }}>We believe in shared growth. Our 3-level referral system and welcome bonuses are designed to reward our active community members.</p>
                        </div>
                    </div>
                </div>

                <div className="card" style={{ padding: '40px', textAlign: 'center' }}>
                    <h2 style={{ fontSize: '24px', fontWeight: 800, color: '#1a1a2e', marginBottom: '16px' }}>Our Vision</h2>
                    <p style={{ color: '#64648b', fontSize: '16px', lineHeight: 1.7, margin: 0 }}>
                        To become the global standard for decentralized passive income, making crypto staking accessible and profitable for everyone, regardless of their technical expertise.
                    </p>
                </div>
            </main>

            <Footer />
        </div>
    )
}
