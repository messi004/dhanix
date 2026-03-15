'use client'
export const runtime = "edge";

import { useState, useEffect } from 'react'
import { toast } from 'react-hot-toast'
import { Layers, Clock, CheckCircle } from 'lucide-react'

interface Pool {
    id: string; amount: string; interestRate: string; startDate: string; endDate: string; status: string; createdAt: string
}

export default function PoolsPage() {
    const [amount, setAmount] = useState('')
    const [loading, setLoading] = useState(false)
    const [pools, setPools] = useState<Pool[]>([])
    const [balance, setBalance] = useState('0')
    const [fetchLoading, setFetchLoading] = useState(true)
    
    // Dynamic settings from backend
    const [globalInterestRate, setGlobalInterestRate] = useState('12')
    const [minDuration, setMinDuration] = useState(1)
    const [durationMonths, setDurationMonths] = useState(1)
    const [minStake, setMinStake] = useState('10')
    const [maxStake, setMaxStake] = useState('1000')

    useEffect(() => {
        Promise.all([
            fetch('/api/pools').then(r => r.json()),
            fetch('/api/wallet').then(r => r.json()),
            fetch('/api/settings/public').then(r => r.json()),
        ]).then(([p, w, s]) => {
            setPools(p.pools || [])
            if (s.settings) {
                setMinStake(s.settings.min_stake || '10')
                setMaxStake(s.settings.max_stake || '1000')
            }
            setGlobalInterestRate(p.interestRate || '12')
            const minDur = parseInt(p.minPoolDurationMonths) || 1
            setMinDuration(minDur)
            setDurationMonths(minDur)
            setBalance(w.balance)
        }).finally(() => setFetchLoading(false))
    }, [])

    const handleStake = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        try {
            const res = await fetch('/api/pools', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ amount: parseFloat(amount), durationMonths }),
            })
            const data = await res.json()
            if (!res.ok) throw new Error(data.error)
            toast.success(`Pool created! Expected return: $${data.totalReturn}`)
            setPools(prev => [data.pool, ...prev])
            setAmount('')
            fetch('/api/wallet').then(r => r.json()).then(d => setBalance(d.balance))
        } catch (err: unknown) {
            toast.error(err instanceof Error ? err.message : 'Failed')
        } finally {
            setLoading(false)
        }
    }

    const getDaysRemaining = (endDate: string) => {
        const days = Math.ceil((new Date(endDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
        return Math.max(0, days)
    }

    const getProgress = (start: string, end: string) => {
        const total = new Date(end).getTime() - new Date(start).getTime()
        const elapsed = Date.now() - new Date(start).getTime()
        return Math.min(100, Math.max(0, (elapsed / total) * 100))
    }

    const calcInterest = (amt: string, rate: string, start: string, end: string) => {
        const principal = parseFloat(amt)
        const r = parseFloat(rate) / 100
        const d1 = new Date(start)
        const d2 = new Date(end)
        const months = (d2.getFullYear() - d1.getFullYear()) * 12 + (d2.getMonth() - d1.getMonth())
        return (principal * r * (months / 12)).toFixed(2)
    }

    if (fetchLoading) return <div className="loading-page"><div className="spinner" /></div>

    const activePools = pools.filter(p => p.status === 'ACTIVE')
    const completedPools = pools.filter(p => p.status === 'COMPLETED')

    return (
        <div className="animate-fade-in">
            <div className="page-header"><h1>Staking Pools</h1></div>

            {/* Create Pool */}
            <div className="card" style={{ marginBottom: 32 }}>
                <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
                    <Layers size={18} style={{ color: 'var(--accent-primary)' }} /> Create New Pool
                </h3>
                <div className="pool-info-bar" style={{ padding: '10px 14px', background: 'var(--bg-primary)', borderRadius: 10, marginBottom: 16, fontSize: 13 }}>
                    Available: <strong style={{ color: 'var(--success)' }}>${parseFloat(balance).toFixed(2)} USDT</strong>
                    &nbsp;&nbsp;•&nbsp;&nbsp; APY: <strong style={{ color: 'var(--accent-secondary)' }}>{globalInterestRate}%</strong>
                    &nbsp;&nbsp;•&nbsp;&nbsp; Min Duration: <strong>{minDuration} {minDuration === 1 ? 'month' : 'months'}</strong>
                </div>
                <form onSubmit={handleStake} style={{ display: 'flex', gap: 12, alignItems: 'flex-end', flexWrap: 'wrap' }}>
                    <div className="input-group" style={{ flex: 1, minWidth: 200 }}>
                        <label>Stake Amount (USDT)</label>
                        <input className="input" type="number" value={amount} onChange={e => setAmount(e.target.value)} placeholder={`Min ${minStake}, Max ${maxStake}`} min={minStake} max={maxStake} step="any" required />
                    </div>
                    <div className="input-group" style={{ flex: 1, minWidth: 150 }}>
                        <label>Duration (Months)</label>
                        <input className="input" type="number" value={durationMonths} onChange={e => setDurationMonths(parseInt(e.target.value))} min={minDuration} required />
                    </div>
                    {amount && parseFloat(amount) >= parseFloat(minStake) && (
                        <div style={{ fontSize: 13, color: 'var(--text-secondary)', padding: '12px' }}>
                            Expected interest: <strong style={{ color: 'var(--success)' }}>${(parseFloat(amount) * (parseFloat(globalInterestRate) / 100) * (durationMonths / 12)).toFixed(2)}</strong>
                        </div>
                    )}
                    <button type="submit" className="btn btn-primary" disabled={loading}>
                        {loading ? <span className="spinner" /> : 'Create Pool'}
                    </button>
                </form>
            </div>

            {/* Active Pools */}
            <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
                <Clock size={18} style={{ color: 'var(--accent-primary)' }} /> Active Pools ({activePools.length})
            </h2>
            {activePools.length === 0 ? (
                <div className="card" style={{ marginBottom: 32 }}>
                    <div className="empty-state"><p>No active pools. Create one above!</p></div>
                </div>
            ) : (
                <div className="grid-2" style={{ marginBottom: 32 }}>
                    {activePools.map(pool => {
                        const days = getDaysRemaining(pool.endDate)
                        const progress = getProgress(pool.startDate, pool.endDate)
                        const interest = calcInterest(pool.amount, pool.interestRate, pool.startDate, pool.endDate)
                        return (
                            <div key={pool.id} className="card">
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                                    <span className="badge badge-success">ACTIVE</span>
                                    <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>{days} days remaining</span>
                                </div>
                                <div style={{ fontSize: 28, fontWeight: 800, marginBottom: 4 }}>${parseFloat(pool.amount).toFixed(2)}</div>
                                <div style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 16 }}>
                                    APY {parseFloat(pool.interestRate)}% • Interest: <span style={{ color: 'var(--success)' }}>${interest}</span>
                                </div>
                                {/* Progress bar */}
                                <div style={{ height: 6, background: 'var(--bg-primary)', borderRadius: 3, overflow: 'hidden', marginBottom: 12 }}>
                                    <div style={{ height: '100%', width: `${progress}%`, background: 'var(--accent-gradient)', borderRadius: 3, transition: 'width 0.3s' }} />
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: 'var(--text-muted)' }}>
                                    <span>{new Date(pool.startDate).toLocaleDateString()}</span>
                                    <span>{new Date(pool.endDate).toLocaleDateString()}</span>
                                </div>
                            </div>
                        )
                    })}
                </div>
            )}

            {/* Completed Pools */}
            {completedPools.length > 0 && (
                <>
                    <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
                        <CheckCircle size={18} style={{ color: 'var(--success)' }} /> Completed Pools ({completedPools.length})
                    </h2>
                    <>
                        {/* Desktop table */}
                        <div className="table-container desktop-only">
                            <table>
                                <thead><tr><th>Amount</th><th>APY</th><th>Interest</th><th>Total Return</th><th>Duration</th></tr></thead>
                                <tbody>
                                    {completedPools.map(p => {
                                        const interest = calcInterest(p.amount, p.interestRate, p.startDate, p.endDate)
                                        return (
                                            <tr key={p.id}>
                                                <td style={{ fontWeight: 600 }}>${parseFloat(p.amount).toFixed(2)}</td>
                                                <td>{parseFloat(p.interestRate)}%</td>
                                                <td style={{ color: 'var(--success)' }}>${interest}</td>
                                                <td style={{ fontWeight: 600 }}>${(parseFloat(p.amount) + parseFloat(interest)).toFixed(2)}</td>
                                                <td style={{ color: 'var(--text-muted)' }}>
                                                    {new Date(p.startDate).toLocaleDateString()} - {new Date(p.endDate).toLocaleDateString()}
                                                </td>
                                            </tr>
                                        )
                                    })}
                                </tbody>
                            </table>
                        </div>

                        {/* Mobile card list */}
                        <div className="mobile-only" style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                            {completedPools.map(p => {
                                const interest = calcInterest(p.amount, p.interestRate, p.startDate, p.endDate)
                                return (
                                    <div key={p.id} style={{
                                        padding: 14, borderRadius: 12,
                                        background: 'var(--bg-secondary)', border: '1px solid var(--border-color)',
                                    }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                                            <span style={{ fontWeight: 700, fontSize: 16 }}>${parseFloat(p.amount).toFixed(2)}</span>
                                            <span className="badge badge-info">COMPLETED</span>
                                        </div>
                                        <div style={{ display: 'flex', gap: 16, fontSize: 13, color: 'var(--text-secondary)', marginBottom: 6, flexWrap: 'wrap' }}>
                                            <span>APY: <strong style={{ color: 'var(--text-primary)' }}>{parseFloat(p.interestRate)}%</strong></span>
                                            <span>Interest: <strong style={{ color: 'var(--success)' }}>${interest}</strong></span>
                                            <span>Return: <strong style={{ color: 'var(--text-primary)' }}>${(parseFloat(p.amount) + parseFloat(interest)).toFixed(2)}</strong></span>
                                        </div>
                                        <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                                            {new Date(p.startDate).toLocaleDateString()} → {new Date(p.endDate).toLocaleDateString()}
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    </>
                </>
            )}
        </div>
    )
}
