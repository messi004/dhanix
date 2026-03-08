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

export default function TicketDetailPage({ params }: { params: { id: string } }) {
    const { id } = params
    const [ticket, setTicket] = useState<TicketData | null>(null)
    const [message, setMessage] = useState('')
    const [loading, setLoading] = useState(true)
    const [sending, setSending] = useState(false)

    useEffect(() => {
        fetch(`/api/tickets/${id}`)
            .then(r => r.json())
            .then(d => setTicket(d.ticket))
            .finally(() => setLoading(false))
    }, [id])

    const handleSend = async (e: React.FormEvent) => {
        e.preventDefault()
        setSending(true)
        try {
            const res = await fetch(`/api/tickets/${id}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ message }),
            })
            const data = await res.json()
            if (!res.ok) throw new Error(data.error)
            setTicket(prev => prev ? { ...prev, messages: [...prev.messages, data.message] } : prev)
            setMessage('')
            toast.success('Message sent!')
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
            <Link href="/dashboard/support" style={{
                display: 'inline-flex', alignItems: 'center', gap: 8,
                color: 'var(--text-secondary)', textDecoration: 'none', marginBottom: 16, fontSize: 14,
            }}>
                <ArrowLeft size={16} /> Back to Support
            </Link>

            <div className="page-header">
                <h1>{ticket.subject}</h1>
                <span className={`badge badge-${ticket.status === 'OPEN' ? 'success' : ticket.status === 'PENDING' ? 'warning' : 'danger'}`}>
                    {ticket.status}
                </span>
            </div>

            {/* Messages */}
            <div className="card" style={{ marginBottom: 16, maxHeight: 500, overflow: 'auto' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                    {ticket.messages.map(msg => (
                        <div key={msg.id} style={{
                            display: 'flex', justifyContent: msg.sender === 'ADMIN' ? 'flex-start' : 'flex-end',
                        }}>
                            <div style={{
                                maxWidth: '75%', padding: '10px 14px', borderRadius: 12,
                                background: msg.sender === 'ADMIN' ? 'var(--bg-primary)' : 'rgba(124,58,237,0.1)',
                                border: `1px solid ${msg.sender === 'ADMIN' ? 'var(--border-color)' : 'rgba(124,58,237,0.2)'}`,
                            }}>
                                <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 4, fontWeight: 600 }}>
                                    {msg.sender === 'ADMIN' ? '🛡️ Admin' : 'You'}
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

            {ticket.status !== 'CLOSED' && (
                <form onSubmit={handleSend} className="card" style={{ display: 'flex', gap: 12 }}>
                    <input className="input" value={message} onChange={e => setMessage(e.target.value)} placeholder="Type your message..." required style={{ flex: 1 }} />
                    <button type="submit" className="btn btn-primary" disabled={sending}>
                        {sending ? <span className="spinner" /> : <Send size={16} />}
                    </button>
                </form>
            )}
        </div>
    )
}
