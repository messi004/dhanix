import { Metadata } from 'next'
import LandingNav from '@/components/LandingNav'
import Footer from '@/components/Footer'
import ContactForm from '@/components/ContactForm'
import { MessageCircle } from 'lucide-react'

export const metadata: Metadata = {
    title: 'Contact Us',
    description: 'Get in touch with the Dhanix support team for help with USDT staking, deposits, or withdrawals.',
}

export default function ContactPage() {
    return (
        <div style={{ minHeight: '100vh', background: '#ffffff' }}>
            <LandingNav />

            <main style={{ padding: '120px 24px 80px', maxWidth: '800px', margin: '0 auto' }}>
                <h1 style={{ fontSize: 'clamp(32px, 5vw, 48px)', fontWeight: 900, color: '#1a1a2e', marginBottom: '24px', letterSpacing: '-1.5px', textAlign: 'center' }}>
                    Need <span style={{ background: 'var(--accent-gradient)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Support?</span>
                </h1>

                <p style={{ fontSize: '18px', color: '#64648b', lineHeight: 1.7, marginBottom: '64px', textAlign: 'center', maxWidth: '500px', margin: '0 auto 64px' }}>
                    Have questions about our platform or need assistance with your staking journey? We are here to help.
                </p>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '32px' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                        <div className="card" style={{ padding: '24px', display: 'flex', gap: '16px', alignItems: 'center' }}>
                            <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'rgba(124,58,237,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--accent-primary)', flexShrink: 0 }}>
                                <MessageCircle size={24} />
                            </div>
                            <div>
                                <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#1a1a2e', marginBottom: '4px' }}>Live Chat</h3>
                                <p style={{ color: '#64648b', fontSize: '14px', margin: 0 }}>Available on Dashboard</p>
                            </div>
                        </div>
                    </div>

                    <ContactForm />
                </div>
            </main>

            <Footer />
        </div>
    )
}
