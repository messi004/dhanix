'use client'
export const runtime = "edge";

import { useEffect, useState } from 'react'

interface UserData {
    id: string; email: string; role: string; referralCode: string; referredBy: string | null
    createdAt: string; wallet: { balance: string } | null; _count: { pools: number }
}

export default function AdminUsersPage() {
    const [users, setUsers] = useState<UserData[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        fetch('/api/admin?resource=users').then(r => r.json()).then(d => setUsers(d.users || [])).finally(() => setLoading(false))
    }, [])

    if (loading) return <div className="loading-page"><div className="spinner" /></div>

    return (
        <div className="animate-fade-in">
            <div className="page-header"><h1>User Management</h1></div>
            <div className="card">
                {/* Desktop table */}
                <div className="table-container desktop-only">
                    <table>
                        <thead><tr><th>Email</th><th>Role</th><th>Referral Code</th><th>Balance</th><th>Pools</th><th>Joined</th></tr></thead>
                        <tbody>
                            {users.map(u => (
                                <tr key={u.id}>
                                    <td style={{ fontWeight: 600 }}>{u.email}</td>
                                    <td><span className={`badge ${u.role === 'ADMIN' ? 'badge-danger' : 'badge-info'}`}>{u.role}</span></td>
                                    <td style={{ fontFamily: 'monospace', fontSize: 12 }}>{u.referralCode}</td>
                                    <td style={{ fontWeight: 600 }}>${parseFloat(u.wallet?.balance || '0').toFixed(2)}</td>
                                    <td>{u._count.pools}</td>
                                    <td style={{ color: 'var(--text-muted)' }}>{new Date(u.createdAt).toLocaleDateString()}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Mobile card list */}
                <div className="mobile-only" style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    {users.map(u => (
                        <div key={u.id} style={{
                            padding: 14, borderRadius: 12,
                            background: 'var(--bg-secondary)', border: '1px solid var(--border-color)',
                        }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                                <span style={{ fontWeight: 600, fontSize: 14, wordBreak: 'break-all', flex: 1 }}>{u.email}</span>
                                <span className={`badge ${u.role === 'ADMIN' ? 'badge-danger' : 'badge-info'}`} style={{ marginLeft: 8 }}>{u.role}</span>
                            </div>
                            <div style={{ display: 'flex', gap: 16, fontSize: 13, color: 'var(--text-secondary)', flexWrap: 'wrap' }}>
                                <span>Balance: <strong style={{ color: 'var(--text-primary)' }}>${parseFloat(u.wallet?.balance || '0').toFixed(2)}</strong></span>
                                <span>Pools: <strong style={{ color: 'var(--text-primary)' }}>{u._count.pools}</strong></span>
                            </div>
                            <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 6 }}>
                                Joined {new Date(u.createdAt).toLocaleDateString()} • Code: <span style={{ fontFamily: 'monospace' }}>{u.referralCode}</span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}
