'use client'
export const runtime = "edge";

import { useState, useEffect } from 'react'
import { ArrowUpRight, ArrowDownRight } from 'lucide-react'

interface Transaction {
    id: string; type: string; amount: string; description: string | null; createdAt: string
}

const types = ['ALL', 'DEPOSIT', 'WITHDRAW', 'STAKED', 'INTEREST', 'REFERRAL_REWARD', 'WELCOME_BONUS', 'TRANSFER']

export default function TransactionsPage() {
    const [transactions, setTransactions] = useState<Transaction[]>([])
    const [loading, setLoading] = useState(true)
    const [filter, setFilter] = useState('ALL')

    useEffect(() => {
        const url = filter === 'ALL' ? '/api/transactions' : `/api/transactions?type=${filter}`
        setLoading(true)
        fetch(url).then(r => r.json()).then(d => setTransactions(d.transactions || [])).finally(() => setLoading(false))
    }, [filter])

    const statusBadge = (type: string) => {
        const map: Record<string, string> = {
            DEPOSIT: 'badge-success', WITHDRAW: 'badge-warning', STAKED: 'badge-info', INTEREST: 'badge-info',
            REFERRAL_REWARD: 'badge-success', WELCOME_BONUS: 'badge-info', TRANSFER: 'badge-info'
        }
        return map[type] || 'badge-info'
    }

    return (
        <div className="animate-fade-in">
            <div className="page-header"><h1>Transaction History</h1></div>

            <div style={{ display: 'flex', gap: 8, marginBottom: 24, flexWrap: 'wrap' }}>
                {types.map(t => (
                    <button key={t} onClick={() => setFilter(t)} className={`btn ${filter === t ? 'btn-primary' : 'btn-secondary'} btn-sm`}>
                        {t.replace('_', ' ')}
                    </button>
                ))}
            </div>

            {loading ? (
                <div className="loading-page"><div className="spinner" /></div>
            ) : (
                <div className="card">
                    {transactions.length === 0 ? (
                        <div className="empty-state"><p>No transactions found</p></div>
                    ) : (
                        <>
                            {/* Desktop table */}
                            <div className="table-container desktop-only">
                                <table>
                                    <thead><tr><th>Type</th><th>Amount</th><th>Description</th><th>Date</th></tr></thead>
                                    <tbody>
                                        {transactions.map(tx => (
                                            <tr key={tx.id}>
                                                <td><span className={`badge ${statusBadge(tx.type)}`}>{tx.type.replace('_', ' ')}</span></td>
                                                <td style={{
                                                    display: 'flex', alignItems: 'center', gap: 4,
                                                    color: parseFloat(tx.amount) >= 0 ? 'var(--success)' : 'var(--danger)',
                                                    fontWeight: 600
                                                }}>
                                                    {parseFloat(tx.amount) >= 0 ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
                                                    ${Math.abs(parseFloat(tx.amount)).toFixed(2)}
                                                </td>
                                                <td style={{ color: 'var(--text-secondary)', maxWidth: 300, overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                                    {tx.description || '-'}
                                                </td>
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
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
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
            )}
        </div>
    )
}
