import Link from 'next/link'
import LandingNav from '@/components/LandingNav'
import Footer from '@/components/Footer'
import { FileQuestion } from 'lucide-react'

export default function NotFound() {
    return (
        <div style={{ minHeight: '100vh', background: '#ffffff', display: 'flex', flexDirection: 'column' }}>
            <LandingNav />
            
            <main style={{ 
                flex: 1,
                padding: '120px 24px 80px', 
                maxWidth: '600px', 
                margin: '0 auto',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                textAlign: 'center'
            }}>
                <div style={{ width: '80px', height: '80px', borderRadius: '20px', background: 'rgba(124,58,237,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--accent-primary)', marginBottom: '32px' }}>
                    <FileQuestion size={40} />
                </div>

                <h1 style={{ fontSize: 'clamp(32px, 5vw, 48px)', fontWeight: 900, color: '#1a1a2e', marginBottom: '16px', letterSpacing: '-1.5px' }}>
                    Page <span style={{ background: 'var(--accent-gradient)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Not Found</span>
                </h1>
                
                <p style={{ fontSize: '18px', color: '#64648b', lineHeight: 1.7, marginBottom: '40px' }}>
                    The page you are looking for might have been removed, had its name changed, or is temporarily unavailable.
                </p>

                <Link href="/" className="btn btn-primary btn-lg">
                    Back to Homepage
                </Link>
            </main>

            <Footer />
        </div>
    )
}
