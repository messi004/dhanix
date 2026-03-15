'use client'
export const runtime = "edge";

import { useEffect, useState } from 'react'
import { Users, ArrowDownCircle, ArrowUpCircle, Layers, LifeBuoy, DollarSign } from 'lucide-react'

interface Stats {
    totalUsers: number; totalDeposits: number; depositVolume: string
    totalWithdrawals: number; withdrawVolume: string
    totalPools: number; poolVolume: string; openTickets: number
}

export default function AdminDashboard() {
    const [stats, setStats] = useState<Stats | null>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        fetch('/api/admin?resource=stats').then(r => r.json()).then(setStats).finally(() => setLoading(false))
    }, [])

    if (loading) return <div className="loading-page"><div className="spinner" /></div>

    const cards = [
        { icon: <Users size={22} />, label: 'Total Users', value: stats?.totalUsers || 0, color: '#7c3aed' },
        { icon: <ArrowDownCircle size={22} />, label: 'Deposits', value: stats?.totalDeposits || 0, sub: `$${parseFloat(stats?.depositVolume || '0').toFixed(2)}`, color: '#10b981' },
        { icon: <ArrowUpCircle size={22} />, label: 'Withdrawals', value: stats?.totalWithdrawals || 0, sub: `$${parseFloat(stats?.withdrawVolume || '0').toFixed(2)}`, color: '#ef4444' },
        { icon: <Layers size={22} />, label: 'Staking Pools', value: stats?.totalPools || 0, sub: `$${parseFloat(stats?.poolVolume || '0').toFixed(2)}`, color: '#3b82f6' },
        { icon: <DollarSign size={22} />, label: 'Deposit Volume', value: `$${parseFloat(stats?.depositVolume || '0').toFixed(0)}`, color: '#f59e0b' },
        { icon: <LifeBuoy size={22} />, label: 'Open Tickets', value: stats?.openTickets || 0, color: '#f97316' },
    ]

    return (
        <div className="animate-fade-in">
            <div className="page-header"><h1>Admin Dashboard</h1></div>
            <div className="grid-3">
                {cards.map((c, i) => (
                    <div key={i} className="stat-card">
                        <div className="stat-icon" style={{ background: `${c.color}15`, color: c.color }}>{c.icon}</div>
                        <div className="stat-value">{c.value}</div>
                        <div className="stat-label">{c.label}</div>
                        {c.sub && <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{c.sub}</div>}
                    </div>
                ))}
            </div>
        </div>
    )
}
