'use client'
export const runtime = "edge";

import { useState, useEffect } from 'react'
import { toast } from 'react-hot-toast'
import { ArrowDownCircle, Copy, ExternalLink } from 'lucide-react'

interface Deposit {
    id: string; amount: string; address: string; txHash: string | null; status: string; createdAt: string
}

export default function DepositPage() {
    const [amount, setAmount] = useState('')
    const [loading, setLoading] = useState(false)
    const [deposits, setDeposits] = useState<Deposit[]>([])
    const [newDeposit, setNewDeposit] = useState<Deposit | null>(null)
    const [minDeposit, setMinDeposit] = useState('10')
    const [maxDeposit, setMaxDeposit] = useState('1000')

    useEffect(() => {
        fetch('/api/deposit').then(r => r.json()).then(d => setDeposits(d.deposits || []))
        fetch('/api/settings/public').then(r => r.json()).then(d => {
            if (d.settings) {
                setMinDeposit(d.settings.min_deposit || '10')
                setMaxDeposit(d.settings.max_deposit || '1000')
            }
        }).catch(err => console.error(err))
    }, [])

    const handleDeposit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        try {
            const res = await fetch('/api/deposit', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ amount: parseFloat(amount) }),
            })
            const data = await res.json()
            if (!res.ok) throw new Error(data.error)
            setNewDeposit(data.deposit)
            setDeposits(prev => [data.deposit, ...prev])
            toast.success('Deposit address generated!')
            setAmount('')
        } catch (err: unknown) {
            toast.error(err instanceof Error ? err.message : 'Failed')
        } finally {
            setLoading(false)
        }
    }

    const copyAddress = (addr: string) => {
        navigator.clipboard.writeText(addr)
        toast.success('Address copied!')
    }

    const statusBadge = (s: string) => {
        const map: Record<string, string> = { PENDING: 'badge-warning', CONFIRMED: 'badge-success', FAILED: 'badge-danger' }
        return map[s] || 'badge-info'
    }

    return (
        <div className="animate-fade-in">
            <div className="page-header"><h1>Deposit USDT</h1></div>

            {/* New Deposit Form + Generated Address */}
            <div className="deposit-top-grid" style={{ display: 'grid', gap: 16, marginBottom: 32 }}>
                <div className="card">
                    <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
                        <ArrowDownCircle size={18} style={{ color: 'var(--accent-primary)' }} /> New Deposit
                    </h3>
                    <form onSubmit={handleDeposit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                        <div className="input-group">
                            <label>Amount (USDT)</label>
                            <input className="input" type="number" value={amount} onChange={e => setAmount(e.target.value)} placeholder={`Min ${minDeposit}, Max ${maxDeposit}`} min={minDeposit} max={maxDeposit} step="any" required />
                        </div>
                        <button type="submit" className="btn btn-primary" disabled={loading} style={{ width: '100%' }}>
                            {loading ? <span className="spinner" /> : 'Generate Deposit Address'}
                        </button>
                    </form>
                </div>

                {newDeposit && (
                    <div className="card" style={{ background: 'rgba(124,58,237,0.04)', border: '1px solid rgba(124,58,237,0.15)' }}>
                        <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 16 }}>Send USDT BEP20 Here</h3>
                        <div style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 8 }}>
                            Amount: <strong style={{ color: 'var(--text-primary)' }}>${parseFloat(newDeposit.amount).toFixed(2)} USDT</strong>
                        </div>
                        <div style={{
                            padding: 12, background: 'var(--bg-primary)', borderRadius: 10, fontSize: 11,
                            fontFamily: 'monospace', wordBreak: 'break-all', marginBottom: 12,
                            border: '1px solid var(--border-color)', lineHeight: 1.8,
                        }}>
                            {newDeposit.address}
                        </div>
                        <button onClick={() => copyAddress(newDeposit.address)} className="btn btn-secondary btn-sm" style={{ width: '100%' }}>
                            <Copy size={14} /> Copy Address
                        </button>
                        <p style={{ fontSize: 12, color: 'var(--warning)', marginTop: 12 }}>
                            ⚠️ Send only USDT BEP20 to this address. Other tokens will be lost.
                        </p>
                    </div>
                )}
            </div>

            {/* Deposit History - Mobile Card View + Desktop Table */}
            <div className="card">
                <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 16 }}>Deposit History</h3>
                {deposits.length === 0 ? (
                    <div className="empty-state"><p>No deposits yet</p></div>
                ) : (
                    <>
                        {/* Desktop table */}
                        <div className="table-container desktop-only">
                            <table>
                                <thead><tr><th>Amount</th><th>Address</th><th>Status</th><th>TxHash</th><th>Date</th></tr></thead>
                                <tbody>
                                    {deposits.map(d => (
                                        <tr key={d.id}>
                                            <td style={{ fontWeight: 600 }}>${parseFloat(d.amount).toFixed(2)}</td>
                                            <td style={{ fontFamily: 'monospace', fontSize: 12 }}>{d.address.slice(0, 10)}...{d.address.slice(-6)}</td>
                                            <td><span className={`badge ${statusBadge(d.status)}`}>{d.status}</span></td>
                                            <td>{d.txHash ? (
                                                <a href={`https://bscscan.com/tx/${d.txHash}`} target="_blank" rel="noopener" style={{ color: 'var(--accent-secondary)', display: 'flex', alignItems: 'center', gap: 4 }}>
                                                    View <ExternalLink size={12} />
                                                </a>
                                            ) : '-'}</td>
                                            <td style={{ color: 'var(--text-muted)' }}>{new Date(d.createdAt).toLocaleDateString()}</td>
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
                                    background: 'var(--bg-primary)', border: '1px solid var(--border-color)',
                                }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                                        <span style={{ fontWeight: 700, fontSize: 16 }}>${parseFloat(d.amount).toFixed(2)}</span>
                                        <span className={`badge ${statusBadge(d.status)}`}>{d.status}</span>
                                    </div>
                                    <div style={{ fontSize: 11, fontFamily: 'monospace', color: 'var(--text-secondary)', wordBreak: 'break-all', marginBottom: 6 }}>
                                        {d.address.slice(0, 14)}...{d.address.slice(-8)}
                                    </div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 12, color: 'var(--text-muted)' }}>
                                        <span>{new Date(d.createdAt).toLocaleDateString()}</span>
                                        {d.txHash ? (
                                            <a href={`https://bscscan.com/tx/${d.txHash}`} target="_blank" rel="noopener" style={{ color: 'var(--accent-secondary)', display: 'flex', alignItems: 'center', gap: 4, fontSize: 12 }}>
                                                View Tx <ExternalLink size={12} />
                                            </a>
                                        ) : null}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </>
                )}
            </div>

            <style jsx>{`
                .deposit-top-grid {
                    grid-template-columns: 1fr 1fr;
                }
                @media (max-width: 768px) {
                    .deposit-top-grid {
                        grid-template-columns: 1fr;
                    }
                }
            `}</style>
        </div>
    )
}
