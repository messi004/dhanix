'use client'

import { useState, useEffect } from 'react'
import { toast } from 'react-hot-toast'
import Link from 'next/link'
import { ArrowLeft, Send } from 'lucide-react'

interface Message {
    id: string; sender: string; message: string; createdAt: string
}

interface TicketData {
    id: string; subject: string; status: string; createdAt: string;
    messages: Message[]; user: { email: string }
}

export default function AdminTicketDetailPage({ params }: { params: { id: string } }) {
    const { id } = params
    const [ticket, setTicket] = useState<TicketData | null>(null)
    const [message, setMessage] = useState('')
    const [loading, setLoading] = useState(true)
    const [sending, setSending] = useState(false)

    useEffect(() => {
        fetch(`/api/admin/tickets/${id}`)
            .then(r => r.json())
            .then(d => setTicket(d.ticket))
            .finally(() => setLoading(false))
    }, [id])

    const handleSend = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!message.trim()) return

        setSending(true)
        try {
            const res = await fetch(`/api/admin/tickets/${id}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ message }),
            })
            const data = await res.json()
            if (!res.ok) throw new Error(data.error)

            // Add the new message to the list
            setTicket(prev => prev ? {
                ...prev,
                status: prev.status === 'CLOSED' ? 'OPEN' : prev.status,
                messages: [...prev.messages, data.data]
            } : prev)

            setMessage('')
            toast.success('Reply sent!')
        } catch (err: unknown) {
            toast.error(err instanceof Error ? err.message : 'Failed')
        } finally {
            setSending(false)
        }
    }

    if (loading) return <div className="loading-page"><div className="spinner" /></div>
    if (!ticket) return <div className="empty-state"><p>Ticket not found</p></div>

    return (
        <div className="animate-fade-in">
            <Link href="/admin/tickets" style={{
                display: 'inline-flex', alignItems: 'center', gap: 8,
                color: 'var(--text-secondary)', textDecoration: 'none', marginBottom: 16, fontSize: 14,
            }}>
                <ArrowLeft size={16} /> Back to Tickets
            </Link>

            <div className="page-header" style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: 8 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, width: '100%' }}>
                    <h1>{ticket.subject}</h1>
                    <span className={`badge badge-${ticket.status === 'OPEN' ? 'success' : ticket.status === 'PENDING' ? 'warning' : 'danger'}`}>
                        {ticket.status}
                    </span>
                </div>
                <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>
                    User: <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{ticket.user.email}</span>
                </div>
            </div>

            {/* Messages */}
            <div className="card" style={{ marginBottom: 16, maxHeight: 600, overflow: 'auto' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                    {ticket.messages.map(msg => (
                        <div key={msg.id} style={{
                            display: 'flex', justifyContent: msg.sender === 'ADMIN' ? 'flex-end' : 'flex-start',
                        }}>
                            <div style={{
                                maxWidth: '75%', padding: '10px 14px', borderRadius: 12,
                                background: msg.sender === 'ADMIN' ? 'rgba(124,58,237,0.1)' : 'var(--bg-primary)',
                                border: `1px solid ${msg.sender === 'ADMIN' ? 'rgba(124,58,237,0.2)' : 'var(--border-color)'}`,
                            }}>
                                <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 4, fontWeight: 600 }}>
                                    {msg.sender === 'ADMIN' ? 'You (Admin)' : 'User'}
                                </div>
                                <div style={{ fontSize: 14, lineHeight: 1.6 }}>{msg.message}</div>
                                <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4, textAlign: 'right' }}>
                                    {new Date(msg.createdAt).toLocaleString()}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            <form onSubmit={handleSend} className="card" style={{ display: 'flex', gap: 12 }}>
                <input className="input" value={message} onChange={e => setMessage(e.target.value)} placeholder="Type your admin reply..." required style={{ flex: 1 }} />
                <button type="submit" className="btn btn-primary" disabled={sending}>
                    {sending ? <span className="spinner" /> : <Send size={16} />}
                </button>
            </form>
        </div>
    )
}
