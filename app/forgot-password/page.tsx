'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { toast } from 'react-hot-toast'
import { Lock, Eye, EyeOff, ShieldCheck, Mail } from 'lucide-react'

export default function ForgotPasswordPage() {
    const [step, setStep] = useState<'email' | 'otp' | 'password'>('email')
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [otp, setOtp] = useState('')
    const [showPassword, setShowPassword] = useState(false)
    const [loading, setLoading] = useState(false)
    const [countdown, setCountdown] = useState(0)
    const router = useRouter()

    const startCountdown = () => {
        setCountdown(60)
        const timer = setInterval(() => {
            setCountdown(prev => {
                if (prev <= 1) { clearInterval(timer); return 0 }
                return prev - 1
            })
        }, 1000)
    }

    const sendOtp = async (e?: React.FormEvent) => {
        if (e) e.preventDefault()
        if (countdown > 0) return
        setLoading(true)
        try {
            const res = await fetch('/api/auth/forgot-password', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email }),
            })
            const data = await res.json()
            if (!res.ok) throw new Error(data.error)
            toast.success('OTP sent to your email!')
            setStep('otp')
            startCountdown()
        } catch (err: unknown) {
            toast.error(err instanceof Error ? err.message : 'Failed to send OTP')
        } finally {
            setLoading(false)
        }
    }

    const verifyOtp = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        try {
            const res = await fetch('/api/auth/verify-otp', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, otp }),
            })
            const data = await res.json()
            if (!res.ok) throw new Error(data.error)
            toast.success('OTP Verified. Please create a new password.')
            setStep('password')
        } catch (err: unknown) {
            toast.error(err instanceof Error ? err.message : 'Invalid OTP')
        } finally {
            setLoading(false)
        }
    }

    const resetPassword = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        try {
            const res = await fetch('/api/auth/reset-password', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password }),
            })
            const data = await res.json()
            if (!res.ok) throw new Error(data.error)
            toast.success('Password reset successfully! You can now login.')
            router.push('/login')
        } catch (err: unknown) {
            toast.error(err instanceof Error ? err.message : 'Failed to reset password')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div style={{
            minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
            padding: 24, background: 'radial-gradient(ellipse at top, rgba(124,58,237,0.06) 0%, #f8f9fc 50%)',
        }}>
            <div className="card animate-fade-in" style={{ width: '100%', maxWidth: 420, padding: 32 }}>
                <div style={{ textAlign: 'center', marginBottom: 32 }}>
                    <Link href="/" style={{ textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 10, marginBottom: 24 }}>
                        <div style={{
                            width: 40, height: 40, borderRadius: 12,
                            background: 'var(--accent-gradient)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontWeight: 900, fontSize: 20, color: 'white'
                        }}>D</div>
                        <span style={{ fontWeight: 800, fontSize: 24, color: 'var(--text-primary)' }}>Dhanix</span>
                    </Link>
                    <h1 style={{ fontSize: 22, fontWeight: 700, marginBottom: 8 }}>Password Recovery</h1>
                    <p style={{ color: 'var(--text-secondary)', fontSize: 14 }}>
                        {step === 'email' && 'Enter your email to receive an OTP'}
                        {step === 'otp' && 'Verify your identity'}
                        {step === 'password' && 'Create a new secure password'}
                    </p>
                </div>

                {step === 'email' && (
                    <form onSubmit={sendOtp} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                        <div className="input-group">
                            <label>Email Address</label>
                            <input className="input" type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="name@example.com" required />
                        </div>
                        <button type="submit" className="btn btn-primary btn-lg" disabled={loading} style={{ width: '100%', marginTop: 8 }}>
                            {loading ? <span className="spinner" /> : <><Mail size={18} /> Send Reset OTP</>}
                        </button>
                    </form>
                )}

                {step === 'otp' && (
                    <form onSubmit={verifyOtp} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                        <div style={{ textAlign: 'center', marginBottom: 8 }}>
                            <p style={{ fontSize: 14, color: 'var(--text-secondary)' }}>
                                We sent a 6-digit code to<br />
                                <strong style={{ color: 'var(--accent-secondary)' }}>{email}</strong>
                            </p>
                        </div>
                        <div className="input-group">
                            <label>Verification Code</label>
                            <input
                                className="input" type="text" value={otp} onChange={e => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                                placeholder="Enter 6-digit code" required maxLength={6} minLength={6}
                                style={{ textAlign: 'center', fontSize: 20, letterSpacing: 6, fontWeight: 700 }}
                            />
                        </div>

                        <button type="submit" className="btn btn-primary btn-lg" disabled={loading || otp.length !== 6} style={{ width: '100%', marginTop: 8 }}>
                            {loading ? <span className="spinner" /> : <><ShieldCheck size={18} /> Verify OTP</>}
                        </button>

                        <div style={{ textAlign: 'center', fontSize: 13, color: 'var(--text-muted)' }}>
                            {countdown > 0 ? (
                                <span>Resend in <strong style={{ color: 'var(--accent-secondary)' }}>{countdown}s</strong></span>
                            ) : (
                                <button type="button" onClick={() => sendOtp()} disabled={loading} style={{
                                    background: 'none', border: 'none', color: 'var(--accent-secondary)',
                                    cursor: 'pointer', fontWeight: 600, fontSize: 13, fontFamily: 'inherit',
                                }}>Resend OTP</button>
                            )}
                            <span style={{ margin: '0 8px' }}>•</span>
                            <button type="button" onClick={() => { setStep('email'); setOtp('') }} style={{
                                background: 'none', border: 'none', color: 'var(--text-muted)',
                                cursor: 'pointer', fontSize: 13, fontFamily: 'inherit',
                            }}>Change Email</button>
                        </div>
                    </form>
                )}

                {step === 'password' && (
                    <form onSubmit={resetPassword} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                        <div className="input-group">
                            <label>New Password</label>
                            <div style={{ position: 'relative' }}>
                                <input className="input" type={showPassword ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)} placeholder="Minimum 8 characters" required minLength={8} />
                                <button type="button" onClick={() => setShowPassword(!showPassword)} style={{
                                    position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)',
                                    background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)'
                                }}>
                                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            </div>
                        </div>

                        <button type="submit" className="btn btn-primary btn-lg" disabled={loading || password.length < 8} style={{ width: '100%', marginTop: 8 }}>
                            {loading ? <span className="spinner" /> : <><Lock size={18} /> Update Password</>}
                        </button>
                    </form>
                )}

                <p style={{ textAlign: 'center', marginTop: 24, fontSize: 14, color: 'var(--text-secondary)' }}>
                    Remember your password?{' '}
                    <Link href="/login" style={{ color: 'var(--accent-secondary)', textDecoration: 'none', fontWeight: 600 }}>Login here</Link>
                </p>
            </div>
        </div>
    )
}
