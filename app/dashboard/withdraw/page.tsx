'use client'

import { useState, useEffect } from 'react'
import { toast } from 'react-hot-toast'
import { ArrowUpCircle, ExternalLink } from 'lucide-react'

interface Withdrawal {
    id: string; amount: string; walletAddress: string; txHash: string | null; status: string; createdAt: string
}

export default function WithdrawPage() {
    const [amount, setAmount] = useState('')
    const [address, setAddress] = useState('')
    const [loading, setLoading] = useState(false)
    const [withdrawals, setWithdrawals] = useState<Withdrawal[]>([])
    const [balance, setBalance] = useState('0')
    const [minWithdraw, setMinWithdraw] = useState('10')
    const [maxWithdraw, setMaxWithdraw] = useState('1000')
    const [dailyLimit, setDailyLimit] = useState('1')

    useEffect(() => {
        fetch('/api/withdraw').then(r => r.json()).then(d => setWithdrawals(d.withdrawals || []))
        fetch('/api/wallet').then(r => r.json()).then(d => setBalance(d.balance))
        fetch('/api/settings/public').then(r => r.json()).then(d => {
            if (d.settings) {
                setMinWithdraw(d.settings.min_withdraw || '10')
                setMaxWithdraw(d.settings.max_withdraw || '1000')
                setDailyLimit(d.settings.withdraw_per_day || '1')
            }
        }).catch(err => console.error(err))
    }, [])

    const handleWithdraw = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        try {
            const res = await fetch('/api/withdraw', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ amount: parseFloat(amount), walletAddress: address }),
            })
            const data = await res.json()
            if (!res.ok) throw new Error(data.error)
            toast.success('Withdrawal request submitted!')
            setWithdrawals(prev => [data.withdrawal, ...prev])
            setAmount(''); setAddress('')
            // Refresh balance
            fetch('/api/wallet').then(r => r.json()).then(d => setBalance(d.balance))
        } catch (err: unknown) {
            toast.error(err instanceof Error ? err.message : 'Failed')
        } finally {
            setLoading(false)
        }
    }

    const statusBadge = (s: string) => {
        const map: Record<string, string> = { PENDING: 'badge-warning', SENT: 'badge-success', FAILED: 'badge-danger' }
        return map[s] || 'badge-info'
    }

    return (
        <div className="animate-fade-in">
            <div className="page-header"><h1>Withdraw USDT</h1></div>

            <div className="grid-2" style={{ marginBottom: 32 }}>
                <div className="card">
                    <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
                        <ArrowUpCircle size={18} style={{ color: 'var(--accent-primary)' }} /> New Withdrawal
                    </h3>
                    <div style={{ padding: '10px 14px', background: 'var(--bg-secondary)', borderRadius: 10, marginBottom: 16, fontSize: 13 }}>
                        Available: <strong style={{ color: 'var(--success)' }}>${parseFloat(balance).toFixed(2)} USDT</strong>
                    </div>
                    <form onSubmit={handleWithdraw} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                        <div className="input-group">
                            <label>Amount (USDT)</label>
                            <input className="input" type="number" value={amount} onChange={e => setAmount(e.target.value)} placeholder={`Min ${minWithdraw}, Max ${maxWithdraw}`} min={minWithdraw} max={maxWithdraw} step="any" required />
                        </div>
                        <div className="input-group">
                            <label>Destination Wallet (BEP20)</label>
                            <input className="input" value={address} onChange={e => setAddress(e.target.value)} placeholder="0x..." pattern="^0x[a-fA-F0-9]{40}$" required />
                        </div>
                        <button type="submit" className="btn btn-primary" disabled={loading}>
                            {loading ? <span className="spinner" /> : 'Submit Withdrawal'}
                        </button>
                    </form>
                    <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 12 }}>
                        • Min: {minWithdraw} USDT • Max: {maxWithdraw} USDT • {dailyLimit} withdrawal(s) per day
                    </div>
                </div>

                <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                    <h3 style={{ fontSize: 16, fontWeight: 700 }}>Withdrawal Rules</h3>
                    {[
                        { label: 'Minimum', value: `${minWithdraw} USDT` },
                        { label: 'Maximum', value: `${maxWithdraw} USDT` },
                        { label: 'Daily Limit', value: `${dailyLimit} withdrawal(s)` },
                        { label: 'Network', value: 'BEP20 (BSC)' },
                        { label: 'Processing', value: 'Automatic' },
                    ].map((r, i) => (
                        <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid var(--border-color)' }}>
                            <span style={{ color: 'var(--text-secondary)', fontSize: 14 }}>{r.label}</span>
                            <span style={{ fontWeight: 600, fontSize: 14 }}>{r.value}</span>
                        </div>
                    ))}
                </div>
            </div>

            <div className="card">
                <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 16 }}>Withdrawal History</h3>
                {withdrawals.length === 0 ? (
                    <div className="empty-state"><p>No withdrawals yet</p></div>
                ) : (
                    <>
                        {/* Desktop table */}
                        <div className="table-container desktop-only">
                            <table>
                                <thead><tr><th>Amount</th><th>Address</th><th>Status</th><th>TxHash</th><th>Date</th></tr></thead>
                                <tbody>
                                    {withdrawals.map(w => (
                                        <tr key={w.id}>
                                            <td style={{ fontWeight: 600 }}>${parseFloat(w.amount).toFixed(2)}</td>
                                            <td style={{ fontFamily: 'monospace', fontSize: 12 }}>{w.walletAddress.slice(0, 10)}...{w.walletAddress.slice(-6)}</td>
                                            <td><span className={`badge ${statusBadge(w.status)}`}>{w.status}</span></td>
                                            <td>{w.txHash ? (
                                                <a href={`https://bscscan.com/tx/${w.txHash}`} target="_blank" rel="noopener" style={{ color: 'var(--accent-secondary)', display: 'flex', alignItems: 'center', gap: 4 }}>
                                                    View <ExternalLink size={12} />
                                                </a>
                                            ) : '-'}</td>
                                            <td style={{ color: 'var(--text-muted)' }}>{new Date(w.createdAt).toLocaleDateString()}</td>
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
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                                        <span style={{ fontWeight: 700, fontSize: 16 }}>${parseFloat(w.amount).toFixed(2)}</span>
                                        <span className={`badge ${statusBadge(w.status)}`}>{w.status}</span>
                                    </div>
                                    <div style={{ fontSize: 11, fontFamily: 'monospace', color: 'var(--text-secondary)', wordBreak: 'break-all', marginBottom: 6 }}>
                                        {w.walletAddress.slice(0, 14)}...{w.walletAddress.slice(-8)}
                                    </div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 12, color: 'var(--text-muted)' }}>
                                        <span>{new Date(w.createdAt).toLocaleDateString()}</span>
                                        {w.txHash ? (
                                            <a href={`https://bscscan.com/tx/${w.txHash}`} target="_blank" rel="noopener" style={{ color: 'var(--accent-secondary)', display: 'flex', alignItems: 'center', gap: 4, fontSize: 12 }}>
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
        </div>
    )
}
