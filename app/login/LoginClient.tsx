'use client'

import { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { toast } from 'react-hot-toast'
import { LogIn, Eye, EyeOff, ShieldCheck } from 'lucide-react'

export default function LoginClient() {
    const [step, setStep] = useState<'credentials' | 'otp'>('credentials')
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [otp, setOtp] = useState('')
    const [showPassword, setShowPassword] = useState(false)
    const [loading, setLoading] = useState(false)
    const [countdown, setCountdown] = useState(0)
    const router = useRouter()
    const countdownTimerRef = useRef<ReturnType<typeof setInterval> | null>(null)

    useEffect(() => {
        return () => {
            if (countdownTimerRef.current) clearInterval(countdownTimerRef.current)
        }
    }, [])

    const startCountdown = () => {
        if (countdownTimerRef.current) clearInterval(countdownTimerRef.current)
        setCountdown(60)
        countdownTimerRef.current = setInterval(() => {
            setCountdown(prev => {
                if (prev <= 1) {
                    if (countdownTimerRef.current) clearInterval(countdownTimerRef.current)
                    countdownTimerRef.current = null
                    return 0
                }
                return prev - 1
            })
        }, 1000)
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        try {
            const body: Record<string, string> = { email, password }
            if (step === 'otp') body.otp = otp

            const res = await fetch('/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body),
            })
            const data = await res.json()
            if (!res.ok) throw new Error(data.error)

            if (data.requireOtp) {
                toast.success('OTP sent to your email!')
                setStep('otp')
                startCountdown()
            } else {
                toast.success('Welcome back!')
                if (data.user?.role === 'ADMIN') {
                    router.push('/admin')
                } else {
                    router.push('/dashboard')
                }
            }
        } catch (err: unknown) {
            toast.error(err instanceof Error ? err.message : 'Login failed')
        } finally {
            setLoading(false)
        }
    }

    const resendOtp = async () => {
        if (countdown > 0) return
        setLoading(true)
        try {
            const res = await fetch('/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password }), // Request OTP again
            })
            const data = await res.json()
            if (!res.ok) throw new Error(data.error)
            toast.success('OTP resent!')
            startCountdown()
        } catch (err: unknown) {
            toast.error(err instanceof Error ? err.message : 'Failed to resend OTP')
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
                    <h1 style={{ fontSize: 22, fontWeight: 700, marginBottom: 8 }}>Welcome Back</h1>
                    <p style={{ color: 'var(--text-secondary)', fontSize: 14 }}>
                        {step === 'credentials' ? 'Login to your account' : 'Verify your identity'}
                    </p>
                </div>

                {step === 'credentials' ? (
                    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                        <div className="input-group">
                            <label>Email</label>
                            <input className="input" type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="Enter your email" required />
                        </div>

                        <div className="input-group">
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <label style={{ marginBottom: 0 }}>Password</label>
                                <Link href="/forgot-password" style={{ fontSize: 13, color: 'var(--accent-secondary)', textDecoration: 'none', fontWeight: 500 }}>Forgot Password?</Link>
                            </div>
                            <div style={{ position: 'relative' }}>
                                <input className="input" type={showPassword ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)} placeholder="Enter your password" required />
                                <button type="button" onClick={() => setShowPassword(!showPassword)} aria-label={showPassword ? 'Hide password' : 'Show password'} style={{
                                    position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)',
                                    background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)'
                                }}>
                                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            </div>
                        </div>

                        <button type="submit" className="btn btn-primary btn-lg" disabled={loading} style={{ width: '100%', marginTop: 8 }}>
                            {loading ? <span className="spinner" /> : <><LogIn size={18} /> Continue</>}
                        </button>
                    </form>
                ) : (
                    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
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
                            {loading ? <span className="spinner" /> : <><ShieldCheck size={18} /> Verify & Login</>}
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
                            <button type="button" onClick={() => { setStep('credentials'); setOtp('') }} style={{
                                background: 'none', border: 'none', color: 'var(--text-muted)',
                                cursor: 'pointer', fontSize: 13, fontFamily: 'inherit',
                            }}>Back</button>
                        </div>
                    </form>
                )}

                <p style={{ textAlign: 'center', marginTop: 24, fontSize: 14, color: 'var(--text-secondary)' }}>
                    Don&apos;t have an account?{' '}
                    <Link href="/register" style={{ color: 'var(--accent-secondary)', textDecoration: 'none', fontWeight: 600 }}>Register</Link>
                </p>
            </div>
        </div>
    )
}
