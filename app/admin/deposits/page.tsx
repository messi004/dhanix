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

    return (
        <div className="animate-fade-in">
            <div className="page-header"><h1>Deposits Management</h1></div>
            <div className="card">
                <div className="table-container">
                    <table>
                        <thead><tr><th>User</th><th>Amount</th><th>Address</th><th>Status</th><th>Date</th><th>Actions</th></tr></thead>
                        <tbody>
                            {deposits.map(d => (
                                <tr key={d.id}>
                                    <td>{d.user.email}</td>
                                    <td style={{ fontWeight: 600 }}>${parseFloat(d.amount).toFixed(2)}</td>
                                    <td style={{ fontFamily: 'monospace', fontSize: 12 }}>{d.address.slice(0, 10)}...</td>
                                    <td><span className={`badge ${d.status === 'CONFIRMED' ? 'badge-success' : d.status === 'FAILED' ? 'badge-danger' : 'badge-warning'}`}>{d.status}</span></td>
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
            </div>
        </div>
    )
}
