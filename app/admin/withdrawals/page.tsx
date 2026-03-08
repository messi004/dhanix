'use client'

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

    return (
        <div className="animate-fade-in">
            <div className="page-header"><h1>Withdrawals Management</h1></div>
            <div className="card">
                <div className="table-container">
                    <table>
                        <thead><tr><th>User</th><th>Amount</th><th>Wallet</th><th>Status</th><th>Date</th><th>Actions</th></tr></thead>
                        <tbody>
                            {withdrawals.map(w => (
                                <tr key={w.id}>
                                    <td>{w.user.email}</td>
                                    <td style={{ fontWeight: 600 }}>${parseFloat(w.amount).toFixed(2)}</td>
                                    <td style={{ fontFamily: 'monospace', fontSize: 12 }}>{w.walletAddress.slice(0, 10)}...</td>
                                    <td><span className={`badge ${w.status === 'SENT' ? 'badge-success' : w.status === 'FAILED' ? 'badge-danger' : 'badge-warning'}`}>{w.status}</span></td>
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
            </div>
        </div>
    )
}
