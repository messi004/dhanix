'use client'

import { useEffect, useState } from 'react'
import { ArrowUpRight, ArrowDownRight } from 'lucide-react'

interface Transaction {
    id: string; type: string; amount: string; description: string | null; createdAt: string
    user: { email: string }
}

export default function AdminTransactionsPage() {
    const [transactions, setTransactions] = useState<Transaction[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        fetch('/api/admin?resource=transactions').then(r => r.json()).then(d => setTransactions(d.transactions || [])).finally(() => setLoading(false))
    }, [])

    if (loading) return <div className="loading-page"><div className="spinner" /></div>

    return (
        <div className="animate-fade-in">
            <div className="page-header"><h1>All Transactions</h1></div>
            <div className="card">
                <div className="table-container">
                    <table>
                        <thead><tr><th>User</th><th>Type</th><th>Amount</th><th>Description</th><th>Date</th></tr></thead>
                        <tbody>
                            {transactions.map(tx => (
                                <tr key={tx.id}>
                                    <td>{tx.user.email}</td>
                                    <td><span className={`badge ${parseFloat(tx.amount) > 0 ? 'badge-success' : 'badge-warning'}`}>{tx.type.replace('_', ' ')}</span></td>
                                    <td style={{ display: 'flex', alignItems: 'center', gap: 4, color: parseFloat(tx.amount) >= 0 ? 'var(--success)' : 'var(--danger)', fontWeight: 600 }}>
                                        {parseFloat(tx.amount) >= 0 ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
                                        ${Math.abs(parseFloat(tx.amount)).toFixed(2)}
                                    </td>
                                    <td style={{ color: 'var(--text-secondary)', maxWidth: 250, overflow: 'hidden', textOverflow: 'ellipsis' }}>{tx.description || '-'}</td>
                                    <td style={{ color: 'var(--text-muted)' }}>{new Date(tx.createdAt).toLocaleDateString()}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    )
}
