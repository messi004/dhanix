'use client'

import { useEffect, useState } from 'react'
import { toast } from 'react-hot-toast'
import { Trash2, User, Mail, Calendar, MessageSquare } from 'lucide-react'

interface ContactMessage {
    id: string
    name: string | null
    email: string
    message: string
    replied: boolean
    replyText: string | null
    createdAt: string
}

export default function AdminMessagesPage() {
    const [messages, setMessages] = useState<ContactMessage[]>([])
    const [loading, setLoading] = useState(true)
    const [selectedMessage, setSelectedMessage] = useState<ContactMessage | null>(null)
    const [replyText, setReplyText] = useState('')
    const [sending, setSending] = useState(false)

    const fetchMessages = async () => {
        try {
            const res = await fetch('/api/contact')
            const data = await res.json()
            if (!res.ok) throw new Error(data.error)
            setMessages(data.messages || [])
        } catch (err: any) {
            toast.error(err.message)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchMessages()
    }, [])

    const handleReply = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!selectedMessage || !replyText.trim()) return
        
        setSending(true)
        try {
            const res = await fetch('/api/contact/reply', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ messageId: selectedMessage.id, replyText }),
            })
            const data = await res.json()
            if (!res.ok) throw new Error(data.error)
            
            toast.success('Reply sent successfully')
            setMessages(prev => prev.map(m => m.id === selectedMessage.id ? { ...m, replied: true, replyText } : m))
            setSelectedMessage(prev => prev ? { ...prev, replied: true, replyText } : null)
            setReplyText('')
        } catch (err: any) {
            toast.error(err.message)
        } finally {
            setSending(false)
        }
    }

    const deleteMessage = async (id: string) => {
        if (!confirm('Are you sure you want to delete this message?')) return
        try {
            const res = await fetch(`/api/contact?id=${id}`, { method: 'DELETE' })
            if (!res.ok) throw new Error('Failed to delete')
            toast.success('Message deleted')
            setMessages(prev => prev.filter(m => m.id !== id))
            if (selectedMessage?.id === id) setSelectedMessage(null)
        } catch (err: any) {
            toast.error(err.message)
        }
    }

    if (loading) return <div className="loading-page"><div className="spinner" /></div>

    return (
        <div className="animate-fade-in" style={{ display: 'grid', gridTemplateColumns: selectedMessage ? '1fr 1fr' : '1fr', gap: '24px', transition: 'all 0.3s' }}>
            <div className="messages-list">
                <div className="page-header" style={{ marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h1 style={{ fontSize: '24px', fontWeight: 800, color: '#1a1a2e' }}>Contact Messages</h1>
                    <span style={{ fontSize: '13px', background: '#e5e7eb', padding: '4px 12px', borderRadius: '20px', fontWeight: 600 }}>{messages.length} Total</span>
                </div>

                <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
                    <div style={{ maxHeight: 'calc(100vh - 250px)', overflowY: 'auto' }}>
                        {messages.length === 0 ? (
                            <div style={{ padding: '40px', textAlign: 'center', color: '#64648b' }}>
                                <Mail size={48} style={{ marginBottom: '16px', opacity: 0.3 }} />
                                <p>No contact messages yet.</p>
                            </div>
                        ) : (
                            messages.map((m) => (
                                <div 
                                    key={m.id} 
                                    onClick={() => {
                                        setSelectedMessage(m)
                                        setReplyText('')
                                    }}
                                    style={{ 
                                        padding: '16px 20px', 
                                        borderBottom: '1px solid #f1f5f9', 
                                        cursor: 'pointer',
                                        background: selectedMessage?.id === m.id ? '#f8fafc' : 'transparent',
                                        transition: 'background 0.2s',
                                        borderLeft: selectedMessage?.id === m.id ? '4px solid var(--danger)' : '4px solid transparent'
                                    }}
                                >
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                            <div style={{ fontWeight: 700, fontSize: '15px', color: '#1a1a2e' }}>{m.name || 'Anonymous'}</div>
                                            {m.replied && <span style={{ fontSize: '10px', background: '#dcfce7', color: '#166534', padding: '2px 8px', borderRadius: '10px', fontWeight: 700 }}>REPLIED</span>}
                                        </div>
                                        <div style={{ fontSize: '12px', color: '#94a3b8' }}>{new Date(m.createdAt).toLocaleDateString()}</div>
                                    </div>
                                    <div style={{ fontSize: '13px', color: '#64748b', marginBottom: '8px' }}>{m.email}</div>
                                    <div style={{ fontSize: '14px', color: '#1e293b', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '100%' }}>
                                        {m.message}
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>

            {selectedMessage && (
                <div className="message-detail animate-fade-in">
                    <div className="card" style={{ position: 'sticky', top: '24px', padding: '32px', minHeight: '500px', display: 'flex', flexDirection: 'column' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px' }}>
                            <div>
                                <h2 style={{ fontSize: '20px', fontWeight: 800, color: '#1a1a2e', marginBottom: '8px' }}>{selectedMessage.name || 'Anonymous'}</h2>
                                <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: '#64748b' }}>
                                        <Mail size={14} /> {selectedMessage.email}
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: '#64748b' }}>
                                        <Calendar size={14} /> {new Date(selectedMessage.createdAt).toLocaleString()}
                                    </div>
                                </div>
                            </div>
                            <button 
                                onClick={() => deleteMessage(selectedMessage.id)}
                                style={{ background: '#fee2e2', color: '#ef4444', border: 'none', padding: '8px', borderRadius: '8px', cursor: 'pointer' }}
                            >
                                <Trash2 size={18} />
                            </button>
                        </div>
                        
                        <div style={{ marginBottom: '24px' }}>
                            <div style={{ fontSize: '12px', fontWeight: 700, color: '#94a3b8', marginBottom: '8px', textTransform: 'uppercase' }}>User Inquiry</div>
                            <div style={{ 
                                background: '#f8fafc', 
                                padding: '20px', 
                                borderRadius: '12px', 
                                fontSize: '15px', 
                                lineHeight: '1.6', 
                                color: '#334155',
                                whiteSpace: 'pre-wrap',
                                borderLeft: '3px solid #e2e8f0'
                            }}>
                                {selectedMessage.message}
                            </div>
                        </div>

                        {selectedMessage.replied ? (
                            <div style={{ marginBottom: '24px' }}>
                                <div style={{ fontSize: '12px', fontWeight: 700, color: '#166534', marginBottom: '8px', textTransform: 'uppercase' }}>Our Response</div>
                                <div style={{ 
                                    background: '#f0fdf4', 
                                    padding: '20px', 
                                    borderRadius: '12px', 
                                    fontSize: '15px', 
                                    lineHeight: '1.6', 
                                    color: '#166534',
                                    whiteSpace: 'pre-wrap',
                                    borderLeft: '3px solid #bbf7d0'
                                }}>
                                    {selectedMessage.replyText}
                                </div>
                            </div>
                        ) : (
                            <form onSubmit={handleReply} style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                                <div style={{ fontSize: '12px', fontWeight: 700, color: '#7c3aed', marginBottom: '8px', textTransform: 'uppercase' }}>Quick Reply</div>
                                <textarea 
                                    className="input"
                                    placeholder="Type your professional reply here..."
                                    value={replyText}
                                    onChange={(e) => setReplyText(e.target.value)}
                                    required
                                    style={{ flex: 1, resize: 'none', padding: '16px', borderRadius: '12px', marginBottom: '16px', fontSize: '14px' }}
                                />
                                <button type="submit" disabled={sending || !replyText.trim()} className="btn btn-primary" style={{ width: '100%', gap: 8 }}>
                                    <MessageSquare size={16} /> {sending ? 'Sending...' : 'Send Professional Reply'}
                                </button>
                            </form>
                        )}

                        <div style={{ marginTop: '24px', display: 'flex', gap: '12px' }}>
                            <button onClick={() => setSelectedMessage(null)} className="btn btn-secondary btn-sm" style={{ flex: 1 }}>
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <style jsx>{`
                @media (max-width: 992px) {
                    div { grid-template-columns: 1fr !important; }
                    .message-detail { margin-top: 24px; }
                }
            `}</style>
        </div>
    )
}
