import Link from 'next/link'

export default function LandingNav() {
    return (
        <nav className="landing-nav" style={{
            position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
            background: 'rgba(255,255,255,0.92)', backdropFilter: 'blur(20px)',
            borderBottom: '1px solid #e5e7eb',
            padding: '0 24px', height: '70px',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
            <div className="landing-nav-inner" style={{ display: 'flex', alignItems: 'center', gap: '24px', width: '100%', maxWidth: '1200px', margin: '0 auto', justifyContent: 'space-between' }}>
                <Link href="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{
                        width: 36, height: 36, borderRadius: 10,
                        background: 'var(--accent-gradient)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontWeight: 900, fontSize: 18, color: 'white'
                    }}>D</div>
                    <span style={{ fontWeight: 800, fontSize: 22, color: '#1a1a2e', letterSpacing: '-0.5px' }}>Dhanix</span>
                </Link>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <Link href="/login" className="btn btn-secondary btn-sm">Login</Link>
                    <Link href="/register" className="btn btn-primary btn-sm">Get Started</Link>
                </div>
            </div>
        </nav>
    )
}
