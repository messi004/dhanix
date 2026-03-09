'use client'

import { useEffect, useState } from 'react'
import { toast } from 'react-hot-toast'
import { CheckCircle, XCircle } from 'lucide-react'

interface Deposit {
    id: string; amount: string; address: string; txHash: string | null; status: string; createdAt: string
    user: { email: string }
}

export default function AdminDepositsPage() {
    const [deposits, setDeposits] = useState<Deposit[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        fetch('/api/admin?resource=deposits').then(r => r.json()).then(d => setDeposits(d.deposits || [])).finally(() => setLoading(false))
    }, [])

    const handleAction = async (action: string, depositId: string) => {
        try {
            const res = await fetch(`/api/admin?action=${action}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ depositId }),
            })
            const data = await res.json()
            if (!res.ok) throw new Error(data.error)
            toast.success(data.message)
            setDeposits(prev => prev.map(d => d.id === depositId ? { ...d, status: action === 'confirm-deposit' ? 'CONFIRMED' : 'FAILED' } : d))
        } catch (err: unknown) {
            toast.error(err instanceof Error ? err.message : 'Failed')
        }
    }

    if (loading) return <div className="loading-page"><div className="spinner" /></div>

    const statusBadge = (s: string) => s === 'CONFIRMED' ? 'badge-success' : s === 'FAILED' ? 'badge-danger' : 'badge-warning'

    return (
        <div className="animate-fade-in">
            <div className="page-header"><h1>Deposits Management</h1></div>
            <div className="card">
                {/* Desktop table */}
                <div className="table-container desktop-only">
                    <table>
                        <thead><tr><th>User</th><th>Amount</th><th>Address</th><th>Status</th><th>Date</th><th>Actions</th></tr></thead>
                        <tbody>
                            {deposits.map(d => (
                                <tr key={d.id}>
                                    <td>{d.user.email}</td>
                                    <td style={{ fontWeight: 600 }}>${parseFloat(d.amount).toFixed(2)}</td>
                                    <td style={{ fontFamily: 'monospace', fontSize: 12 }}>{d.address.slice(0, 10)}...</td>
                                    <td><span className={`badge ${statusBadge(d.status)}`}>{d.status}</span></td>
                                    <td style={{ color: 'var(--text-muted)' }}>{new Date(d.createdAt).toLocaleDateString()}</td>
                                    <td>
                                        {d.status === 'PENDING' && (
                                            <div style={{ display: 'flex', gap: 6 }}>
                                                <button onClick={() => handleAction('confirm-deposit', d.id)} className="btn btn-success btn-sm"><CheckCircle size={14} /> Confirm</button>
                                                <button onClick={() => handleAction('reject-deposit', d.id)} className="btn btn-danger btn-sm"><XCircle size={14} /> Reject</button>
                                            </div>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Mobile card list */}
                <div className="mobile-only" style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    {deposits.map(d => (
                        <div key={d.id} style={{
                            padding: 14, borderRadius: 12,
                            background: 'var(--bg-secondary)', border: '1px solid var(--border-color)',
                        }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                                <span style={{ fontWeight: 700, fontSize: 16 }}>${parseFloat(d.amount).toFixed(2)}</span>
                                <span className={`badge ${statusBadge(d.status)}`}>{d.status}</span>
                            </div>
                            <div style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 4 }}>{d.user.email}</div>
                            <div style={{ fontSize: 11, fontFamily: 'monospace', color: 'var(--text-muted)', wordBreak: 'break-all', marginBottom: 6 }}>
                                {d.address.slice(0, 18)}...{d.address.slice(-8)}
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 12, color: 'var(--text-muted)' }}>
                                <span>{new Date(d.createdAt).toLocaleDateString()}</span>
                            </div>
                            {d.status === 'PENDING' && (
                                <div style={{ display: 'flex', gap: 8, marginTop: 10 }}>
                                    <button onClick={() => handleAction('confirm-deposit', d.id)} className="btn btn-success btn-sm" style={{ flex: 1 }}><CheckCircle size={14} /> Confirm</button>
                                    <button onClick={() => handleAction('reject-deposit', d.id)} className="btn btn-danger btn-sm" style={{ flex: 1 }}><XCircle size={14} /> Reject</button>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}
