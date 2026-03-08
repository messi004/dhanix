'use client'

import { useState, useEffect } from 'react'
import { toast } from 'react-hot-toast'
import Link from 'next/link'
import { LifeBuoy, Plus, MessageSquare } from 'lucide-react'

interface Ticket {
    id: string; subject: string; status: string; createdAt: string; _count: { messages: number }
}

export default function SupportPage() {
    const [tickets, setTickets] = useState<Ticket[]>([])
    const [loading, setLoading] = useState(true)
    const [showForm, setShowForm] = useState(false)
    const [subject, setSubject] = useState('')
    const [message, setMessage] = useState('')
    const [creating, setCreating] = useState(false)

    useEffect(() => {
        fetch('/api/tickets').then(r => r.json()).then(d => setTickets(d.tickets || [])).finally(() => setLoading(false))
    }, [])

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault()
        setCreating(true)
        try {
            const res = await fetch('/api/tickets', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ subject, message }),
            })
            const data = await res.json()
            if (!res.ok) throw new Error(data.error)
            toast.success('Ticket created!')
            setTickets(prev => [data.ticket, ...prev])
            setShowForm(false); setSubject(''); setMessage('')
        } catch (err: unknown) {
            toast.error(err instanceof Error ? err.message : 'Failed')
        } finally {
            setCreating(false)
        }
    }

    const statusBadge = (s: string) => {
        const map: Record<string, string> = { OPEN: 'badge-success', PENDING: 'badge-warning', CLOSED: 'badge-danger' }
        return map[s] || 'badge-info'
    }

    if (loading) return <div className="loading-page"><div className="spinner" /></div>

    return (
        <div className="animate-fade-in">
            <div className="page-header">
                <h1>Support</h1>
                <button onClick={() => setShowForm(!showForm)} className="btn btn-primary btn-sm">
                    <Plus size={16} /> New Ticket
                </button>
            </div>

            {showForm && (
                <div className="card" style={{ marginBottom: 24 }}>
                    <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
                        <LifeBuoy size={18} style={{ color: 'var(--accent-primary)' }} /> Create Support Ticket
                    </h3>
                    <form onSubmit={handleCreate} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                        <div className="input-group">
                            <label>Subject</label>
                            <input className="input" value={subject} onChange={e => setSubject(e.target.value)} placeholder="Brief description of your issue" required minLength={3} />
                        </div>
                        <div className="input-group">
                            <label>Message</label>
                            <textarea className="input" value={message} onChange={e => setMessage(e.target.value)} placeholder="Describe your issue in detail..." required minLength={10} />
                        </div>
                        <div style={{ display: 'flex', gap: 12 }}>
                            <button type="submit" className="btn btn-primary" disabled={creating}>
                                {creating ? <span className="spinner" /> : 'Submit Ticket'}
                            </button>
                            <button type="button" onClick={() => setShowForm(false)} className="btn btn-secondary">Cancel</button>
                        </div>
                    </form>
                </div>
            )}

            <div className="card">
                <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 16 }}>Your Tickets</h3>
                {tickets.length === 0 ? (
                    <div className="empty-state"><p>No support tickets</p></div>
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                        {tickets.map(t => (
                            <Link key={t.id} href={`/dashboard/support/${t.id}`} style={{
                                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                                padding: '14px 16px', borderRadius: 10, textDecoration: 'none',
                                background: 'var(--bg-primary)', border: '1px solid var(--border-color)',
                                transition: 'all 0.2s', color: 'inherit',
                            }}>
                                <div>
                                    <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 4 }}>{t.subject}</div>
                                    <div style={{ fontSize: 12, color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 8 }}>
                                        <MessageSquare size={12} /> {t._count?.messages || 1} messages
                                        &nbsp;•&nbsp; {new Date(t.createdAt).toLocaleDateString()}
                                    </div>
                                </div>
                                <span className={`badge ${statusBadge(t.status)}`}>{t.status}</span>
                            </Link>
                        ))}
                    </div>
                )}
            </div>
        </div>
    )
}
