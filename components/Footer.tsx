import Link from 'next/link'

export default function Footer() {
    return (
        <footer style={{
            padding: '60px 24px 40px',
            borderTop: '1px solid #e5e7eb',
            background: '#ffffff',
        }}>
            <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                    gap: '40px',
                    textAlign: 'left',
                    marginBottom: '40px'
                }}>
                    <div className="footer-brand">
                        <Link href="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
                            <div aria-hidden="true" style={{
                                width: 32, height: 32, borderRadius: 8,
                                background: 'var(--accent-gradient)',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                fontWeight: 900, fontSize: 16, color: 'white'
                            }}>D</div>
                            <span style={{ fontWeight: 800, fontSize: 20, color: '#1a1a2e' }}>Dhanix</span>
                        </Link>
                        <p style={{ color: '#64648b', fontSize: 14, lineHeight: 1.6, maxWidth: '300px' }}>
                            The most secure and rewarding USDT BEP20 staking platform on the Binance Smart Chain.
                        </p>
                    </div>

                    <div>
                        <h4 style={{ color: '#1a1a2e', fontSize: 15, fontWeight: 700, marginBottom: '20px' }}>Platform</h4>
                        <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '12px' }}>
                            <li><Link href="/about" style={{ color: '#64648b', textDecoration: 'none', fontSize: 14 }}>About Us</Link></li>
                            <li><Link href="/contact" style={{ color: '#64648b', textDecoration: 'none', fontSize: 14 }}>Contact Support</Link></li>
                            <li><Link href="/#how-it-works" style={{ color: '#64648b', textDecoration: 'none', fontSize: 14 }}>How it Works</Link></li>
                        </ul>
                    </div>

                    <div>
                        <h4 style={{ color: '#1a1a2e', fontSize: 15, fontWeight: 700, marginBottom: '20px' }}>Legal</h4>
                        <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '12px' }}>
                            <li><Link href="/privacy-policy" style={{ color: '#64648b', textDecoration: 'none', fontSize: 14 }}>Privacy Policy</Link></li>
                            <li><Link href="/terms" style={{ color: '#64648b', textDecoration: 'none', fontSize: 14 }}>Terms of Service</Link></li>
                        </ul>
                    </div>
                </div>

                <div style={{
                    paddingTop: '32px',
                    borderTop: '1px solid #f3f4f6',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    flexWrap: 'wrap',
                    gap: '16px',
                    color: '#9ca3af',
                    fontSize: 13
                }}>
                    <p style={{ margin: 0 }}>© 2026 Dhanix. All rights reserved. Built on BSC.</p>
                    <div style={{ display: 'flex', gap: '20px' }}>
                        <span>USDT BEP20</span>
                        <span>Secure Staking</span>
                    </div>
                </div>
            </div>
        </footer>
    )
}
