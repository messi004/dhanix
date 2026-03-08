'use client'

import { useEffect, useState } from 'react'
import { toast } from 'react-hot-toast'
import Link from 'next/link'
import { XCircle, MessageSquare } from 'lucide-react'

interface Ticket {
    id: string; subject: string; status: string; createdAt: string
    user: { email: string }; _count: { messages: number }
}

export default function AdminTicketsPage() {
    const [tickets, setTickets] = useState<Ticket[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        fetch('/api/admin?resource=tickets').then(r => r.json()).then(d => setTickets(d.tickets || [])).finally(() => setLoading(false))
    }, [])

    const closeTicket = async (ticketId: string) => {
        try {
            const res = await fetch('/api/admin?action=close-ticket', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ticketId }),
            })
            const data = await res.json()
            if (!res.ok) throw new Error(data.error)
            toast.success('Ticket closed')
            setTickets(prev => prev.map(t => t.id === ticketId ? { ...t, status: 'CLOSED' } : t))
        } catch (err: unknown) {
            toast.error(err instanceof Error ? err.message : 'Failed')
        }
    }

    if (loading) return <div className="loading-page"><div className="spinner" /></div>

    const statusBadge = (s: string) => {
        const map: Record<string, string> = { OPEN: 'badge-success', PENDING: 'badge-warning', CLOSED: 'badge-danger' }
        return map[s] || 'badge-info'
    }

    return (
        <div className="animate-fade-in">
            <div className="page-header"><h1>Support Tickets</h1></div>
            <div className="card">
                <div className="table-container">
                    <table>
                        <thead><tr><th>User</th><th>Subject</th><th>Messages</th><th>Status</th><th>Date</th><th>Actions</th></tr></thead>
                        <tbody>
                            {tickets.map(t => (
                                <tr key={t.id}>
                                    <td>{t.user.email}</td>
                                    <td style={{ fontWeight: 600 }}>{t.subject}</td>
                                    <td><MessageSquare size={14} style={{ marginRight: 4 }} />{t._count.messages}</td>
                                    <td><span className={`badge ${statusBadge(t.status)}`}>{t.status}</span></td>
                                    <td style={{ color: 'var(--text-muted)' }}>{new Date(t.createdAt).toLocaleDateString()}</td>
                                    <td>
                                        <div style={{ display: 'flex', gap: 6 }}>
                                            <Link href={`/admin/tickets/${t.id}`} className="btn btn-secondary btn-sm">Reply</Link>
                                            {t.status !== 'CLOSED' && (
                                                <button onClick={() => closeTicket(t.id)} className="btn btn-danger btn-sm"><XCircle size={14} /> Close</button>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    )
}
