'use client'

import { useEffect, useState, useCallback } from 'react'
import Link from 'next/link'
import { useRouter, usePathname } from 'next/navigation'
import { toast } from 'react-hot-toast'
import {
    LayoutDashboard, Wallet, ArrowDownCircle, ArrowUpCircle,
    Layers, History, Users, LifeBuoy, LogOut, Menu, X
} from 'lucide-react'

interface User {
    id: string
    email: string
    role: string
    referralCode: string
}

const navItems = [
    { href: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { href: '/dashboard/wallet', icon: Wallet, label: 'Wallet' },
    { href: '/dashboard/deposit', icon: ArrowDownCircle, label: 'Deposit' },
    { href: '/dashboard/withdraw', icon: ArrowUpCircle, label: 'Withdraw' },
    { href: '/dashboard/pools', icon: Layers, label: 'Pools' },
    { href: '/dashboard/transactions', icon: History, label: 'Transactions' },
    { href: '/dashboard/referral', icon: Users, label: 'Referral' },
    { href: '/dashboard/support', icon: LifeBuoy, label: 'Support' },
]

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null)
    const [loading, setLoading] = useState(true)
    const [sidebarOpen, setSidebarOpen] = useState(false)
    const router = useRouter()
    const pathname = usePathname()

    const fetchUser = useCallback(async () => {
        try {
            const res = await fetch('/api/auth/me')
            if (!res.ok) throw new Error('Not authenticated')
            const data = await res.json()
            setUser(data.user)
        } catch {
            router.push('/login')
        } finally {
            setLoading(false)
        }
    }, [router])

    useEffect(() => {
        fetchUser()
    }, [fetchUser])

    const handleLogout = async () => {
        await fetch('/api/auth/logout', { method: 'POST' })
        toast.success('Logged out')
        router.push('/login')
    }

    if (loading) {
        return <div className="loading-page"><div className="spinner" /></div>
    }

    return (
        <div style={{ display: 'flex', minHeight: '100vh' }}>
            {/* Mobile overlay */}
            {sidebarOpen && (
                <div onClick={() => setSidebarOpen(false)} style={{
                    position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.3)', zIndex: 40,
                }} />
            )}

            {/* Sidebar */}
            <aside style={{
                width: 260, background: '#ffffff',
                borderRight: '1px solid #e5e7eb',
                display: 'flex', flexDirection: 'column',
                position: 'fixed', top: 0, bottom: 0, left: sidebarOpen ? 0 : -260,
                zIndex: 50, transition: 'left 0.3s ease',
            }} className="sidebar-desktop">
                {/* Logo */}
                <div style={{
                    padding: '20px 20px', borderBottom: '1px solid #e5e7eb',
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between'
                }}>
                    <Link href="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div style={{
                            width: 34, height: 34, borderRadius: 10,
                            background: 'var(--accent-gradient)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontWeight: 900, fontSize: 16, color: 'white'
                        }}>D</div>
                        <span style={{ fontWeight: 800, fontSize: 20, color: '#1a1a2e' }}>Dhanix</span>
                    </Link>
                    <button onClick={() => setSidebarOpen(false)} style={{
                        background: 'none', border: 'none', color: '#9ca3af', cursor: 'pointer',
                        display: 'none',
                    }} className="sidebar-close-btn">
                        <X size={20} />
                    </button>
                </div>

                {/* Nav */}
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
                                background: isActive ? 'rgba(124,58,237,0.08)' : 'transparent',
                                transition: 'all 0.2s',
                            }}>
                                <Icon size={18} style={{ color: isActive ? 'var(--accent-primary)' : '#9ca3af' }} />
                                {item.label}
                            </Link>
                        )
                    })}
                </nav>

                {/* User */}
                <div style={{ padding: 16, borderTop: '1px solid #e5e7eb' }}>
                    <div style={{ fontSize: 13, color: '#9ca3af', marginBottom: 4 }}>Logged in as</div>
                    <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 12, wordBreak: 'break-all', color: '#1a1a2e' }}>{user?.email}</div>
                    <button onClick={handleLogout} className="btn btn-secondary btn-sm" style={{ width: '100%' }}>
                        <LogOut size={16} /> Logout
                    </button>
                </div>
            </aside>

            {/* Main content */}
            <main style={{ flex: 1, marginLeft: 260, minHeight: '100vh', background: '#f8f9fc' }} className="main-content">
                {/* Mobile header */}
                <div style={{
                    padding: '16px 20px', borderBottom: '1px solid #e5e7eb',
                    display: 'none', alignItems: 'center', justifyContent: 'space-between',
                    background: '#ffffff',
                }} className="mobile-header">
                    <button onClick={() => setSidebarOpen(true)} style={{
                        background: 'none', border: 'none', color: '#1a1a2e', cursor: 'pointer'
                    }}>
                        <Menu size={24} />
                    </button>
                    <span style={{ fontWeight: 800, fontSize: 18, color: '#1a1a2e' }}>Dhanix</span>
                    <div style={{ width: 24 }} />
                </div>

                <div style={{ padding: '32px 28px', maxWidth: 1100 }} className="dashboard-content">
                    {children}
                </div>
            </main>

            <style jsx global>{`
        @media (min-width: 769px) {
          .sidebar-desktop { left: 0 !important; }
        }
        @media (max-width: 768px) {
          .main-content { margin-left: 0 !important; }
          .mobile-header { display: flex !important; }
          .sidebar-close-btn { display: block !important; }
          .dashboard-content { padding: 20px 16px !important; }
        }
      `}</style>
        </div>
    )
}
