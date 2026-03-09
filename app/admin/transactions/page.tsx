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

    const statusBadge = (type: string) => {
        const map: Record<string, string> = {
            DEPOSIT: 'badge-success', WITHDRAW: 'badge-warning', STAKED: 'badge-info', INTEREST: 'badge-info',
            REFERRAL_REWARD: 'badge-success', WELCOME_BONUS: 'badge-info',
        }
        return map[type] || 'badge-info'
    }

    return (
        <div className="animate-fade-in">
            <div className="page-header"><h1>All Transactions</h1></div>
            <div className="card">
                {/* Desktop table */}
                <div className="table-container desktop-only">
                    <table>
                        <thead><tr><th>User</th><th>Type</th><th>Amount</th><th>Description</th><th>Date</th></tr></thead>
                        <tbody>
                            {transactions.map(tx => (
                                <tr key={tx.id}>
                                    <td>{tx.user.email}</td>
                                    <td><span className={`badge ${statusBadge(tx.type)}`}>{tx.type.replace('_', ' ')}</span></td>
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

                {/* Mobile card list */}
                <div className="mobile-only" style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    {transactions.map(tx => (
                        <div key={tx.id} style={{
                            padding: 14, borderRadius: 12,
                            background: 'var(--bg-secondary)', border: '1px solid var(--border-color)',
                        }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                                <span className={`badge ${statusBadge(tx.type)}`}>{tx.type.replace('_', ' ')}</span>
                                <span style={{
                                    fontWeight: 700, fontSize: 16,
                                    color: parseFloat(tx.amount) >= 0 ? 'var(--success)' : 'var(--danger)',
                                    display: 'flex', alignItems: 'center', gap: 4,
                                }}>
                                    {parseFloat(tx.amount) >= 0 ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
                                    ${Math.abs(parseFloat(tx.amount)).toFixed(2)}
                                </span>
                            </div>
                            <div style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 4 }}>{tx.user.email}</div>
                            {tx.description && (
                                <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 4, wordBreak: 'break-word' }}>{tx.description}</div>
                            )}
                            <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                                {new Date(tx.createdAt).toLocaleDateString()}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}
