'use client'

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
                <div className="table-container">
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
            </div>
        </div>
    )
}
