'use client'

import { useEffect, useState } from 'react'
import { Wallet as WalletIcon } from 'lucide-react'
import Link from 'next/link'

export default function WalletPage() {
    const [balance, setBalance] = useState('0')
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        fetch('/api/wallet').then(r => r.json()).then(d => setBalance(d.balance)).finally(() => setLoading(false))
    }, [])

    if (loading) return <div className="loading-page"><div className="spinner" /></div>

    return (
        <div className="animate-fade-in">
            <div className="page-header"><h1>Wallet</h1></div>

            <div className="card" style={{
                textAlign: 'center', padding: 48,
                background: 'linear-gradient(135deg, rgba(124,58,237,0.05), rgba(167,139,250,0.05))',
                border: '1px solid rgba(124,58,237,0.2)',
            }}>
                <WalletIcon size={48} style={{ color: 'var(--accent-secondary)', marginBottom: 16 }} />
                <div style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 8, textTransform: 'uppercase', letterSpacing: 1 }}>Available Balance</div>
                <div style={{ fontSize: 48, fontWeight: 900, letterSpacing: -2, marginBottom: 8 }}>
                    ${parseFloat(balance).toFixed(2)}
                </div>
                <div style={{ fontSize: 14, color: 'var(--text-secondary)', marginBottom: 32 }}>USDT BEP20</div>

                <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
                    <Link href="/dashboard/deposit" className="btn btn-primary">Deposit</Link>
                    <Link href="/dashboard/withdraw" className="btn btn-secondary">Withdraw</Link>
                    <Link href="/dashboard/pools" className="btn btn-secondary">Create Pool</Link>
                </div>
            </div>
        </div>
    )
}
