'use client'
export const runtime = "edge";

import { useState } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { toast } from 'react-hot-toast'
import { UserPlus, Eye, EyeOff, Mail, ShieldCheck } from 'lucide-react'
import { Suspense } from 'react'

function RegisterForm() {
    const [step, setStep] = useState<'email' | 'otp' | 'password'>('email')
    const [email, setEmail] = useState('')
    const [otp, setOtp] = useState('')
    const [password, setPassword] = useState('')
    const [showPassword, setShowPassword] = useState(false)
    const [loading, setLoading] = useState(false)
    const [countdown, setCountdown] = useState(0)
    const router = useRouter()
    const searchParams = useSearchParams()
    const ref = searchParams.get('ref') || ''

    // Countdown timer for resend
    const startCountdown = () => {
        setCountdown(60)
        const timer = setInterval(() => {
            setCountdown(prev => {
                if (prev <= 1) { clearInterval(timer); return 0 }
                return prev - 1
            })
        }, 1000)
    }

    const handleSendOtp = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        try {
            const res = await fetch('/api/auth/send-otp', {
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

    const handleVerifyOtp = async (e: React.FormEvent) => {
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
            toast.success('Email verified!')
            setStep('password')
        } catch (err: unknown) {
            toast.error(err instanceof Error ? err.message : 'Invalid OTP')
        } finally {
            setLoading(false)
        }
    }

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        try {
            const res = await fetch('/api/auth/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password, referralCode: ref || undefined }),
            })
            const data = await res.json()
            if (!res.ok) throw new Error(data.error)
            toast.success('Registration successful!')
            router.push('/dashboard')
        } catch (err: unknown) {
            toast.error(err instanceof Error ? err.message : 'Registration failed')
        } finally {
            setLoading(false)
        }
    }

    const resendOtp = async () => {
        if (countdown > 0) return
        setLoading(true)
        try {
            const res = await fetch('/api/auth/send-otp', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email }),
            })
            const data = await res.json()
            if (!res.ok) throw new Error(data.error)
            toast.success('OTP resent!')
            startCountdown()
        } catch (err: unknown) {
            toast.error(err instanceof Error ? err.message : 'Failed')
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
                    <h1 style={{ fontSize: 22, fontWeight: 700, marginBottom: 8 }}>Create Account</h1>
                    <p style={{ color: 'var(--text-secondary)', fontSize: 14 }}>Start earning with USDT staking</p>
                </div>

                {/* Step indicators */}
                <div style={{ display: 'flex', gap: 8, marginBottom: 28, justifyContent: 'center' }}>
                    {['Email', 'Verify', 'Password'].map((label, i) => {
                        const stepIndex = { email: 0, otp: 1, password: 2 }[step]
                        const active = i <= stepIndex
                        return (
                            <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                <div style={{
                                    width: 28, height: 28, borderRadius: '50%', fontSize: 12, fontWeight: 700,
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    background: active ? 'var(--accent-gradient)' : 'var(--bg-primary)',
                                    color: active ? 'white' : 'var(--text-muted)',
                                    border: `1px solid ${active ? 'transparent' : 'var(--border-color)'}`,
                                }}>{i + 1}</div>
                                <span style={{ fontSize: 12, fontWeight: 600, color: active ? 'var(--text-primary)' : 'var(--text-muted)' }}>{label}</span>
                                {i < 2 && <div style={{ width: 20, height: 1, background: active ? 'var(--accent-primary)' : 'var(--border-color)', margin: '0 2px' }} />}
                            </div>
                        )
                    })}
                </div>

                {/* Step 1: Email */}
                {step === 'email' && (
                    <form onSubmit={handleSendOtp} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                        <div className="input-group">
                            <label>Email Address</label>
                            <input className="input" type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="Enter your email" required />
                        </div>
                        <button type="submit" className="btn btn-primary btn-lg" disabled={loading} style={{ width: '100%' }}>
                            {loading ? <span className="spinner" /> : <><Mail size={18} /> Send Verification Code</>}
                        </button>
                    </form>
                )}

                {/* Step 2: OTP Verification */}
                {step === 'otp' && (
                    <form onSubmit={handleVerifyOtp} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
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
                        <button type="submit" className="btn btn-primary btn-lg" disabled={loading || otp.length !== 6} style={{ width: '100%' }}>
                            {loading ? <span className="spinner" /> : <><ShieldCheck size={18} /> Verify Code</>}
                        </button>
                        <div style={{ textAlign: 'center', fontSize: 13, color: 'var(--text-muted)' }}>
                            {countdown > 0 ? (
                                <span>Resend in <strong style={{ color: 'var(--accent-secondary)' }}>{countdown}s</strong></span>
                            ) : (
                                <button type="button" onClick={resendOtp} disabled={loading} style={{
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

                {/* Step 3: Password & Register */}
                {step === 'password' && (
                    <form onSubmit={handleRegister} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                        <div style={{ textAlign: 'center', marginBottom: 8 }}>
                            <div style={{
                                display: 'inline-flex', alignItems: 'center', gap: 6, padding: '6px 14px',
                                background: 'var(--success-bg)', borderRadius: 20, fontSize: 13, fontWeight: 600, color: 'var(--success)',
                            }}>
                                <ShieldCheck size={14} /> {email} verified
                            </div>
                        </div>

                        <div className="input-group">
                            <label>Create Password</label>
                            <div style={{ position: 'relative' }}>
                                <input className="input" type={showPassword ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)} placeholder="Min 8 characters" required minLength={8} />
                                <button type="button" onClick={() => setShowPassword(!showPassword)} style={{
                                    position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)',
                                    background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)'
                                }}>
                                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            </div>
                        </div>

                        {ref && (
                            <div className="input-group">
                                <label>Referral Code</label>
                                <input className="input" value={ref} readOnly style={{ opacity: 0.7 }} />
                            </div>
                        )}

                        <button type="submit" className="btn btn-primary btn-lg" disabled={loading} style={{ width: '100%', marginTop: 8 }}>
                            {loading ? <span className="spinner" /> : <><UserPlus size={18} /> Create Account</>}
                        </button>
                    </form>
                )}

                <p style={{ textAlign: 'center', marginTop: 24, fontSize: 14, color: 'var(--text-secondary)' }}>
                    Already have an account?{' '}
                    <Link href="/login" style={{ color: 'var(--accent-secondary)', textDecoration: 'none', fontWeight: 600 }}>Login</Link>
                </p>
            </div>
        </div>
    )
}

export default function RegisterPage() {
    return (
        <Suspense fallback={<div className="loading-page"><div className="spinner" /></div>}>
            <RegisterForm />
        </Suspense>
    )
}
