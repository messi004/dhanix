'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
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

    const statusBadge = (type: string) => {
        const map: Record<string, string> = {
            DEPOSIT: 'badge-success', WITHDRAW: 'badge-warning', STAKED: 'badge-info', INTEREST: 'badge-info',
            REFERRAL_REWARD: 'badge-success', WELCOME_BONUS: 'badge-info',
        }
        return map[type] || 'badge-info'
    }

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
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                    <h2 style={{ fontSize: 18, fontWeight: 700, margin: 0 }}>Recent Transactions</h2>
                    <Link href="/dashboard/transactions" className="btn btn-secondary btn-sm" style={{ padding: '6px 12px', fontSize: 13 }}>
                        View All
                    </Link>
                </div>
                {data?.recentTransactions?.length === 0 ? (
                    <div className="empty-state">
                        <div className="empty-icon">📋</div>
                        <p>No transactions yet</p>
                    </div>
                ) : (
                    <>
                        {/* Desktop table */}
                        <div className="table-container desktop-only">
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
                                                <span className={`badge ${statusBadge(tx.type)}`}>
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

                        {/* Mobile card list */}
                        <div className="mobile-only" style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                            {data?.recentTransactions?.map(tx => (
                                <div key={tx.id} style={{
                                    padding: 14, borderRadius: 12,
                                    background: 'var(--bg-secondary)', border: '1px solid var(--border-color)',
                                }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                                        <span className={`badge ${statusBadge(tx.type)}`}>
                                            {tx.type.replace('_', ' ')}
                                        </span>
                                        <span style={{
                                            fontWeight: 700, fontSize: 16,
                                            color: parseFloat(tx.amount) > 0 ? 'var(--success)' : 'var(--danger)',
                                            display: 'flex', alignItems: 'center', gap: 4,
                                        }}>
                                            {parseFloat(tx.amount) > 0 ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
                                            ${Math.abs(parseFloat(tx.amount)).toFixed(2)}
                                        </span>
                                    </div>
                                    {tx.description && (
                                        <div style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 6, lineHeight: 1.5, wordBreak: 'break-word' }}>
                                            {tx.description}
                                        </div>
                                    )}
                                    <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                                        {new Date(tx.createdAt).toLocaleDateString()}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </>
                )}
            </div>
        </div>
    )
}
