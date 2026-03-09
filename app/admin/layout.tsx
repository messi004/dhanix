'use client'

import { useEffect, useState, useCallback } from 'react'
import Link from 'next/link'
import { useRouter, usePathname } from 'next/navigation'
import { toast } from 'react-hot-toast'
import {
    LayoutDashboard, Users, ArrowDownCircle, ArrowUpCircle,
    Layers, History, LifeBuoy, Settings, LogOut, Menu, X, Shield
} from 'lucide-react'

interface User {
    id: string; email: string; role: string
}

const navItems = [
    { href: '/admin', icon: LayoutDashboard, label: 'Dashboard' },
    { href: '/admin/users', icon: Users, label: 'Users' },
    { href: '/admin/deposits', icon: ArrowDownCircle, label: 'Deposits' },
    { href: '/admin/withdrawals', icon: ArrowUpCircle, label: 'Withdrawals' },
    { href: '/admin/pools', icon: Layers, label: 'Pools' },
    { href: '/admin/transactions', icon: History, label: 'Transactions' },
    { href: '/admin/tickets', icon: LifeBuoy, label: 'Tickets' },
    { href: '/admin/settings', icon: Settings, label: 'Settings' },
]

export default function AdminLayout({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null)
    const [loading, setLoading] = useState(true)
    const [sidebarOpen, setSidebarOpen] = useState(false)
    const router = useRouter()
    const pathname = usePathname()

    const fetchUser = useCallback(async () => {
        try {
            const res = await fetch('/api/auth/me')
            if (!res.ok) throw new Error()
            const data = await res.json()
            if (data.user?.role !== 'ADMIN') {
                router.push('/dashboard')
                return
            }
            setUser(data.user)
        } catch {
            router.push('/login')
        } finally {
            setLoading(false)
        }
    }, [router])

    useEffect(() => { fetchUser() }, [fetchUser])

    const handleLogout = async () => {
        await fetch('/api/auth/logout', { method: 'POST' })
        toast.success('Logged out')
        router.push('/login')
    }

    if (loading) return <div className="loading-page"><div className="spinner" /></div>

    return (
        <div style={{ display: 'flex', minHeight: '100vh' }}>
            {sidebarOpen && <div onClick={() => setSidebarOpen(false)} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.3)', zIndex: 40 }} />}

            <aside style={{
                width: 260, background: '#ffffff',
                borderRight: '1px solid #e5e7eb',
                display: 'flex', flexDirection: 'column',
                position: 'fixed', top: 0, bottom: 0, left: sidebarOpen ? 0 : -260,
                zIndex: 50, transition: 'left 0.3s ease',
            }} className="admin-sidebar">
                <div style={{
                    padding: '20px', borderBottom: '1px solid #e5e7eb',
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between'
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div style={{
                            width: 34, height: 34, borderRadius: 10,
                            background: 'linear-gradient(135deg, #ef4444, #f59e0b)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            color: 'white'
                        }}><Shield size={18} /></div>
                        <div>
                            <div style={{ fontWeight: 800, fontSize: 16, color: '#1a1a2e' }}>Dhanix</div>
                            <div style={{ fontSize: 11, color: 'var(--danger)', fontWeight: 600 }}>ADMIN PANEL</div>
                        </div>
                    </div>
                    <button onClick={() => setSidebarOpen(false)} style={{
                        background: 'none', border: 'none', color: '#9ca3af', cursor: 'pointer',
                        display: 'none'
                    }} className="admin-sidebar-close"><X size={20} /></button>
                </div>

                <nav style={{ flex: 1, padding: '12px', display: 'flex', flexDirection: 'column', gap: 2 }}>
                    {navItems.map(item => {
                        const isActive = pathname === item.href
                        const Icon = item.icon
                        return (
                            <Link key={item.href} href={item.href} onClick={() => setSidebarOpen(false)} style={{
                                display: 'flex', alignItems: 'center', gap: 12,
                                padding: '10px 14px', borderRadius: 10,
                                textDecoration: 'none', fontSize: 14, fontWeight: isActive ? 600 : 500,
                                color: isActive ? '#1a1a2e' : '#64648b',
                                background: isActive ? 'rgba(239,68,68,0.08)' : 'transparent',
                            }}>
                                <Icon size={18} style={{ color: isActive ? 'var(--danger)' : '#9ca3af' }} />
                                {item.label}
                            </Link>
                        )
                    })}
                </nav>

                <div style={{ padding: 16, borderTop: '1px solid #e5e7eb' }}>
                    <div style={{ fontSize: 13, color: '#9ca3af', marginBottom: 4 }}>Admin</div>
                    <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 12, wordBreak: 'break-all', color: '#1a1a2e' }}>{user?.email}</div>
                    <button onClick={handleLogout} className="btn btn-secondary btn-sm" style={{ width: '100%' }}>
                        <LogOut size={16} /> Logout
                    </button>
                </div>
            </aside>

            <main style={{ flex: 1, marginLeft: 260, minHeight: '100vh', background: '#f8f9fc' }} className="admin-main">
                <div style={{
                    padding: '16px 20px', borderBottom: '1px solid #e5e7eb',
                    display: 'none', alignItems: 'center', justifyContent: 'space-between',
                    background: '#ffffff',
                }} className="admin-mobile-header">
                    <button onClick={() => setSidebarOpen(true)} style={{
                        background: 'none', border: 'none', color: '#1a1a2e', cursor: 'pointer'
                    }}><Menu size={24} /></button>
                    <span style={{ fontWeight: 800, fontSize: 18, color: 'var(--danger)' }}>Admin</span>
                    <div style={{ width: 24 }} />
                </div>

                <div style={{ padding: '32px 28px', maxWidth: 1200 }} className="admin-content">{children}</div>
            </main>

            <style jsx global>{`
        @media (min-width: 769px) {
          .admin-sidebar { left: 0 !important; }
        }
        @media (max-width: 768px) {
          .admin-main { margin-left: 0 !important; }
          .admin-mobile-header { display: flex !important; }
          .admin-sidebar-close { display: block !important; }
          .admin-content { padding: 20px 16px !important; }
        }
      `}</style>
        </div>
    )
}
