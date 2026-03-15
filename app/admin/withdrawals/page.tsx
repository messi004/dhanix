'use client'
export const runtime = "edge";

import { useEffect, useState } from 'react'
import { toast } from 'react-hot-toast'
import { CheckCircle, XCircle } from 'lucide-react'

interface Withdrawal {
    id: string; amount: string; walletAddress: string; txHash: string | null; status: string; createdAt: string
    user: { email: string }
}

export default function AdminWithdrawalsPage() {
    const [withdrawals, setWithdrawals] = useState<Withdrawal[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        fetch('/api/admin?resource=withdrawals').then(r => r.json()).then(d => setWithdrawals(d.withdrawals || [])).finally(() => setLoading(false))
    }, [])

    const handleAction = async (action: string, withdrawalId: string) => {
        try {
            const res = await fetch(`/api/admin?action=${action}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ withdrawalId }),
            })
            const data = await res.json()
            if (!res.ok) throw new Error(data.error)
            toast.success(data.message)
            setWithdrawals(prev => prev.map(w => w.id === withdrawalId ? { ...w, status: action === 'approve-withdrawal' ? 'SENT' : 'FAILED' } : w))
        } catch (err: unknown) {
            toast.error(err instanceof Error ? err.message : 'Failed')
        }
    }

    if (loading) return <div className="loading-page"><div className="spinner" /></div>

    const statusBadge = (s: string) => s === 'SENT' ? 'badge-success' : s === 'FAILED' ? 'badge-danger' : 'badge-warning'

    return (
        <div className="animate-fade-in">
            <div className="page-header"><h1>Withdrawals Management</h1></div>
            <div className="card">
                {/* Desktop table */}
                <div className="table-container desktop-only">
                    <table>
                        <thead><tr><th>User</th><th>Amount</th><th>Wallet</th><th>Status</th><th>Date</th><th>Actions</th></tr></thead>
                        <tbody>
                            {withdrawals.map(w => (
                                <tr key={w.id}>
                                    <td>{w.user.email}</td>
                                    <td style={{ fontWeight: 600 }}>${parseFloat(w.amount).toFixed(2)}</td>
                                    <td style={{ fontFamily: 'monospace', fontSize: 12 }}>{w.walletAddress.slice(0, 10)}...</td>
                                    <td><span className={`badge ${statusBadge(w.status)}`}>{w.status}</span></td>
                                    <td style={{ color: 'var(--text-muted)' }}>{new Date(w.createdAt).toLocaleDateString()}</td>
                                    <td>
                                        {w.status === 'PENDING' && (
                                            <div style={{ display: 'flex', gap: 6 }}>
                                                <button onClick={() => handleAction('approve-withdrawal', w.id)} className="btn btn-success btn-sm"><CheckCircle size={14} /> Approve</button>
                                                <button onClick={() => handleAction('reject-withdrawal', w.id)} className="btn btn-danger btn-sm"><XCircle size={14} /> Reject</button>
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
                    {withdrawals.map(w => (
                        <div key={w.id} style={{
                            padding: 14, borderRadius: 12,
                            background: 'var(--bg-secondary)', border: '1px solid var(--border-color)',
                        }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                                <span style={{ fontWeight: 700, fontSize: 16 }}>${parseFloat(w.amount).toFixed(2)}</span>
                                <span className={`badge ${statusBadge(w.status)}`}>{w.status}</span>
                            </div>
                            <div style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 4 }}>{w.user.email}</div>
                            <div style={{ fontSize: 11, fontFamily: 'monospace', color: 'var(--text-muted)', wordBreak: 'break-all', marginBottom: 6 }}>
                                {w.walletAddress.slice(0, 18)}...{w.walletAddress.slice(-8)}
                            </div>
                            <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                                {new Date(w.createdAt).toLocaleDateString()}
                            </div>
                            {w.status === 'PENDING' && (
                                <div style={{ display: 'flex', gap: 8, marginTop: 10 }}>
                                    <button onClick={() => handleAction('approve-withdrawal', w.id)} className="btn btn-success btn-sm" style={{ flex: 1 }}><CheckCircle size={14} /> Approve</button>
                                    <button onClick={() => handleAction('reject-withdrawal', w.id)} className="btn btn-danger btn-sm" style={{ flex: 1 }}><XCircle size={14} /> Reject</button>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}
