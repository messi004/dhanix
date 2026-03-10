'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'react-hot-toast'
import { Send, AlertCircle, RefreshCw } from 'lucide-react'

export default function TransferPage() {
    const [recipientEmail, setRecipientEmail] = useState('')
    const [amount, setAmount] = useState('')
    const [loading, setLoading] = useState(false)
    const [balance, setBalance] = useState<number>(0)
    const [fetchingBalance, setFetchingBalance] = useState(true)
    const router = useRouter()

    const fetchBalance = async () => {
        setFetchingBalance(true)
        try {
            const res = await fetch('/api/wallet')
            if (res.ok) {
                const data = await res.json()
                setBalance(data.wallet.balance)
            }
        } catch (error) {
            console.error('Failed to fetch balance', error)
        } finally {
            setFetchingBalance(false)
        }
    }

    useEffect(() => {
        fetchBalance()
    }, [])

    const handleTransfer = async (e: React.FormEvent) => {
        e.preventDefault()
        
        const numAmount = parseFloat(amount)
        if (isNaN(numAmount) || numAmount <= 0) {
            return toast.error('Please enter a valid amount')
        }

        if (numAmount > balance) {
            return toast.error('Insufficient balance')
        }

        if (!recipientEmail || !recipientEmail.includes('@')) {
            return toast.error('Please enter a valid recipient email')
        }

        setLoading(true)

        try {
            const res = await fetch('/api/transfer', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ recipientEmail, amount: numAmount }),
            })

            const data = await res.json()

            if (!res.ok) {
                throw new Error(data.error || 'Transfer failed')
            }

            toast.success('Transfer successful!')
            setRecipientEmail('')
            setAmount('')
            fetchBalance()
            router.refresh()
        } catch (error: unknown) {
            const message = error instanceof Error ? error.message : 'Transfer failed'
            toast.error(message)
        } finally {
            setLoading(false)
        }
    }

    return (
        <div>
            <div style={{ marginBottom: 32 }}>
                <h1 className="dashboard-heading">User Transfer</h1>
                <p style={{ color: '#64648b', fontSize: 15, marginTop: 4 }}>
                    Instantly transfer USDT to other users on the platform with zero fees.
                </p>
            </div>

            <div className="grid-2">
                <div className="card" style={{ padding: 24 }}>
                    <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 24, color: '#1a1a2e', display: 'flex', alignItems: 'center', gap: 8 }}>
                        <Send size={20} className="text-accent" />
                        Send USDT
                    </h2>

                    <div style={{
                        background: 'rgba(124, 58, 237, 0.05)',
                        border: '1px solid rgba(124, 58, 237, 0.1)',
                        padding: 16, borderRadius: 12, marginBottom: 24,
                        display: 'flex', justifyContent: 'space-between', alignItems: 'center'
                    }}>
                        <div>
                            <div style={{ fontSize: 13, color: '#64648b', marginBottom: 4 }}>Available Balance</div>
                            {fetchingBalance ? (
                                <div style={{ height: 28, width: 80, background: '#e5e7eb', borderRadius: 4, animation: 'pulse 2s infinite' }} />
                            ) : (
                                <div style={{ fontSize: 24, fontWeight: 800, color: '#1a1a2e' }}>
                                    {Number(balance).toFixed(2)} <span style={{ fontSize: 16, color: '#64648b' }}>USDT</span>
                                </div>
                            )}
                        </div>
                        <button 
                            onClick={fetchBalance}
                            disabled={fetchingBalance}
                            style={{ 
                                background: 'white', border: '1px solid #e5e7eb', borderRadius: 8,
                                width: 36, height: 36, display: 'flex', alignItems: 'center', justifyContent: 'center',
                                cursor: 'pointer', color: '#64648b'
                            }}
                        >
                            <RefreshCw size={16} className={fetchingBalance ? 'spin' : ''} />
                        </button>
                    </div>

                    <form onSubmit={handleTransfer}>
                        <div className="input-group" style={{ marginBottom: 16 }}>
                            <label>Recipient Email</label>
                            <input
                                type="email"
                                className="input"
                                value={recipientEmail}
                                onChange={(e) => setRecipientEmail(e.target.value)}
                                placeholder="user@example.com"
                                required
                            />
                        </div>
                        <div className="input-group" style={{ marginBottom: 24 }}>
                            <label>Amount (USDT)</label>
                            <input
                                type="number"
                                step="0.01"
                                min="0.01"
                                className="input"
                                value={amount}
                                onChange={(e) => setAmount(e.target.value)}
                                placeholder="0.00"
                                required
                            />
                        </div>
                        <button type="submit" className="btn btn-primary" style={{ width: '100%' }} disabled={loading || fetchingBalance}>
                            {loading ? <div className="spinner" style={{ width: 20, height: 20 }} /> : 'Send Transfer'}
                        </button>
                    </form>
                </div>

                <div>
                    <div className="card" style={{ padding: 24 }}>
                        <h2 style={{ fontSize: 16, fontWeight: 700, marginBottom: 16, color: '#1a1a2e', display: 'flex', alignItems: 'center', gap: 8 }}>
                            <AlertCircle size={18} style={{ color: '#ea580c' }} />
                            Transfer Rules
                        </h2>
                        <ul style={{ 
                            margin: 0, paddingLeft: 20, color: '#64648b', fontSize: 14, 
                            lineHeight: 1.7, display: 'flex', flexDirection: 'column', gap: 12 
                        }}>
                            <li>Transfers are <strong>instant</strong> and cannot be reversed.</li>
                            <li>Please ensure the recipient&apos;s email address is correctly registered on Dhanix.</li>
                            <li>There are <strong>zero fees</strong> for internal transfers.</li>
                            <li>Both sender and recipient will be notified via email upon a successful transfer.</li>
                        </ul>
                    </div>
                </div>
            </div>
            <style jsx>{`
                .text-accent { color: var(--accent-primary); }
                .spin { animation: spin 1s linear infinite; }
            `}</style>
        </div>
    )
}
