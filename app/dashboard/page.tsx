'use client'

import { useEffect, useState } from 'react'
import { Wallet, Layers, TrendingUp, Users, ArrowUpRight, ArrowDownRight } from 'lucide-react'

interface DashboardData {
    balance: string
    activePools: number
    activePoolsTotal: string
    totalEarnings: string
    referralEarnings: string
    recentTransactions: Array<{
        id: string
        type: string
        amount: string
        description: string
        createdAt: string
    }>
}

export default function DashboardPage() {
    const [data, setData] = useState<DashboardData | null>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        fetch('/api/dashboard')
            .then(r => r.json())
            .then(setData)
            .finally(() => setLoading(false))
    }, [])

    if (loading) return <div className="loading-page"><div className="spinner" /></div>

    const stats = [
        { icon: <Wallet size={22} />, label: 'Wallet Balance', value: `$${parseFloat(data?.balance || '0').toFixed(2)}`, color: '#7c3aed' },
        { icon: <Layers size={22} />, label: 'Active Pools', value: data?.activePools || 0, sub: `$${data?.activePoolsTotal || '0'} staked`, color: '#3b82f6' },
        { icon: <TrendingUp size={22} />, label: 'Total Earnings', value: `$${parseFloat(data?.totalEarnings || '0').toFixed(2)}`, color: '#10b981' },
        { icon: <Users size={22} />, label: 'Referral Earnings', value: `$${parseFloat(data?.referralEarnings || '0').toFixed(2)}`, color: '#f59e0b' },
    ]

    return (
        <div className="animate-fade-in">
            <div className="page-header">
                <h1>Dashboard</h1>
            </div>

            {/* Stats */}
            <div className="grid-4" style={{ marginBottom: 32 }}>
                {stats.map((s, i) => (
                    <div key={i} className="stat-card">
                        <div className="stat-icon" style={{ background: `${s.color}15`, color: s.color }}>
                            {s.icon}
                        </div>
                        <div className="stat-value">{s.value}</div>
                        <div className="stat-label">{s.label}</div>
                        {s.sub && <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{s.sub}</div>}
                    </div>
                ))}
            </div>

            {/* Recent Transactions */}
            <div className="card">
                <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 20 }}>Recent Transactions</h2>
                {data?.recentTransactions?.length === 0 ? (
                    <div className="empty-state">
                        <div className="empty-icon">📋</div>
                        <p>No transactions yet</p>
                    </div>
                ) : (
                    <div className="table-container">
                        <table>
                            <thead>
                                <tr>
                                    <th>Type</th>
                                    <th>Amount</th>
                                    <th>Description</th>
                                    <th>Date</th>
                                </tr>
                            </thead>
                            <tbody>
                                {data?.recentTransactions?.map(tx => (
                                    <tr key={tx.id}>
                                        <td>
                                            <span className={`badge ${parseFloat(tx.amount) > 0 ? 'badge-success' : 'badge-warning'}`}>
                                                {tx.type.replace('_', ' ')}
                                            </span>
                                        </td>
                                        <td style={{
                                            display: 'flex', alignItems: 'center', gap: 4,
                                            color: parseFloat(tx.amount) > 0 ? 'var(--success)' : 'var(--danger)',
                                            fontWeight: 600
                                        }}>
                                            {parseFloat(tx.amount) > 0 ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
                                            ${Math.abs(parseFloat(tx.amount)).toFixed(2)}
                                        </td>
                                        <td style={{ color: 'var(--text-secondary)', maxWidth: 250, overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                            {tx.description || '-'}
                                        </td>
                                        <td style={{ color: 'var(--text-muted)' }}>
                                            {new Date(tx.createdAt).toLocaleDateString()}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    )
}
