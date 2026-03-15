'use client'
export const runtime = "edge";

import { useEffect, useState } from 'react'

interface Pool {
    id: string; amount: string; interestRate: string; startDate: string; endDate: string; status: string; user: { email: string }
}

export default function AdminPoolsPage() {
    const [pools, setPools] = useState<Pool[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        fetch('/api/admin?resource=pools').then(r => r.json()).then(d => setPools(d.pools || [])).finally(() => setLoading(false))
    }, [])

    if (loading) return <div className="loading-page"><div className="spinner" /></div>

    return (
        <div className="animate-fade-in">
            <div className="page-header"><h1>Staking Pools</h1></div>
            <div className="card">
                {/* Desktop table */}
                <div className="table-container desktop-only">
                    <table>
                        <thead><tr><th>User</th><th>Amount</th><th>APY</th><th>Start</th><th>End</th><th>Status</th></tr></thead>
                        <tbody>
                            {pools.map(p => (
                                <tr key={p.id}>
                                    <td>{p.user.email}</td>
                                    <td style={{ fontWeight: 600 }}>${parseFloat(p.amount).toFixed(2)}</td>
                                    <td>{parseFloat(p.interestRate)}%</td>
                                    <td style={{ color: 'var(--text-muted)' }}>{new Date(p.startDate).toLocaleDateString()}</td>
                                    <td style={{ color: 'var(--text-muted)' }}>{new Date(p.endDate).toLocaleDateString()}</td>
                                    <td><span className={`badge ${p.status === 'ACTIVE' ? 'badge-success' : 'badge-info'}`}>{p.status}</span></td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Mobile card list */}
                <div className="mobile-only" style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    {pools.map(p => (
                        <div key={p.id} style={{
                            padding: 14, borderRadius: 12,
                            background: 'var(--bg-secondary)', border: '1px solid var(--border-color)',
                        }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                                <span style={{ fontWeight: 700, fontSize: 16 }}>${parseFloat(p.amount).toFixed(2)}</span>
                                <span className={`badge ${p.status === 'ACTIVE' ? 'badge-success' : 'badge-info'}`}>{p.status}</span>
                            </div>
                            <div style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 4 }}>{p.user.email}</div>
                            <div style={{ display: 'flex', gap: 16, fontSize: 12, color: 'var(--text-muted)' }}>
                                <span>APY: <strong style={{ color: 'var(--text-primary)' }}>{parseFloat(p.interestRate)}%</strong></span>
                                <span>{new Date(p.startDate).toLocaleDateString()} → {new Date(p.endDate).toLocaleDateString()}</span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}
