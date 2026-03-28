'use client'

import { useState } from 'react'
import { toast } from 'react-hot-toast'
import { Send } from 'lucide-react'

export default function ContactForm() {
    const [loading, setLoading] = useState(false)
    const [name, setName] = useState('')
    const [email, setEmail] = useState('')
    const [message, setMessage] = useState('')

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)

        try {
            const res = await fetch('/api/contact', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, email, message }),
            })

            const data = await res.json()

            if (!res.ok) throw new Error(data.error || 'Failed to send message')

            toast.success('Message sent! We will contact you soon.')
            setName('')
            setEmail('')
            setMessage('')
        } catch (err: any) {
            toast.error(err.message)
        } finally {
            setLoading(false)
        }
    }

    return (
        <form onSubmit={handleSubmit} className="card" style={{ padding: '32px', display: 'flex', flexDirection: 'column', gap: '20px', textAlign: 'left' }}>
            <div className="input-group">
                <label style={{ fontSize: '14px', fontWeight: 600, color: '#1a1a2e', marginBottom: '8px', display: 'block' }}>Name (Optional)</label>
                <input 
                    type="text" 
                    className="input" 
                    placeholder="Your Name" 
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                />
            </div>
            <div className="input-group">
                <label style={{ fontSize: '14px', fontWeight: 600, color: '#1a1a2e', marginBottom: '8px', display: 'block' }}>Email Address</label>
                <input 
                    type="email" 
                    className="input" 
                    placeholder="name@example.com" 
                    required 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                />
            </div>
            <div className="input-group">
                <label style={{ fontSize: '14px', fontWeight: 600, color: '#1a1a2e', marginBottom: '8px', display: 'block' }}>Message</label>
                <textarea 
                    className="input" 
                    rows={4} 
                    placeholder="How can we help?" 
                    style={{ resize: 'none' }} 
                    required 
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                />
            </div>
            <button type="submit" disabled={loading} className="btn btn-primary btn-lg" style={{ width: '100%' }}>
                {loading ? 'Sending...' : 'Send Message'}
            </button>
        </form>
    )
}
