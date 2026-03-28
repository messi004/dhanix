'use client'

import { useState, useEffect } from 'react'
import { toast } from 'react-hot-toast'
import { Users, Copy, Gift, Link2, Share2 } from 'lucide-react'

interface ReferralData {
    referralCode: string
    referralLink: string
    totalRewards: string
    referredUsers: number
    referrals: Array<{
        id: string
        rewardAmount: string
        createdAt: string
        referredUser: { email: string; createdAt: string }
    }>
}

export default function ReferralPage() {
    const [data, setData] = useState<ReferralData | null>(null)
    const [loading, setLoading] = useState(true)

    const REFERRAL_REWARDS_ENABLED = process.env.NEXT_PUBLIC_REFERRAL_REWARDS_ENABLED !== 'false'

    useEffect(() => {
        if (!REFERRAL_REWARDS_ENABLED) {
            setLoading(false)
            return
        }
        fetch('/api/referral').then(r => r.json()).then(setData).finally(() => setLoading(false))
    }, [REFERRAL_REWARDS_ENABLED])

    const copyLink = () => {
        if (data?.referralLink) {
            navigator.clipboard.writeText(data.referralLink)
            toast.success('Referral link copied!')
        }
    }

    const shareLink = async () => {
        if (data?.referralLink && navigator.share) {
            try {
                await navigator.share({
                    title: 'Join Dhanix',
                    text: 'Start earning with USDT staking! Use my referral link:',
                    url: data.referralLink,
                })
            } catch {
                copyLink() // fallback to copy
            }
        } else {
            copyLink()
        }
    }

    if (!REFERRAL_REWARDS_ENABLED) {
        return (
            <div className="animate-fade-in">
                <div className="page-header"><h1>Referral Program</h1></div>
                <div className="card" style={{ textAlign: 'center', padding: '40px 20px' }}>
                    <h3 style={{ fontSize: 18, color: 'var(--danger)', marginBottom: 12 }}>Program Paused</h3>
                    <p style={{ color: 'var(--text-muted)' }}>The referral program is currently paused pending legal review. Please check back later.</p>
                </div>
            </div>
        )
    }

    if (loading) return <div className="loading-page"><div className="spinner" /></div>

    return (
        <div className="animate-fade-in">
            <div className="page-header"><h1>Referral Program</h1></div>

            <div style={{ background: 'rgba(234, 179, 8, 0.1)', border: '1px solid rgba(234, 179, 8, 0.3)', padding: 16, borderRadius: 12, marginBottom: 24, fontSize: 13, color: 'var(--warning)', lineHeight: 1.6 }}>
                <strong>Legal Notice:</strong> This program is currently under legal review to ensure compliance with financial promotion rules. It is void where prohibited by law and explicitly excludes residents of the US, UK, and Canada. Bonus generation may be paused or restricted during this review.
            </div>

            {/* Link Card - Mobile optimized */}
            <div className="card" style={{
                marginBottom: 24,
                background: 'linear-gradient(135deg, rgba(124,58,237,0.04), rgba(167,139,250,0.04))',
                border: '1px solid rgba(124,58,237,0.15)',
            }}>
                <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
                    <Link2 size={18} style={{ color: 'var(--accent-primary)' }} /> Your Referral Link
                </h3>

                {/* Referral link display - stacks on mobile */}
                <div style={{
                    padding: 12, background: 'var(--bg-primary)', borderRadius: 10,
                    fontFamily: 'monospace', fontSize: 12, wordBreak: 'break-all',
                    border: '1px solid var(--border-color)', marginBottom: 12,
                    lineHeight: 1.8,
                }}>
                    {data?.referralLink}
                </div>

                {/* Button row - stacks on mobile */}
                <div className="referral-btn-row" style={{ display: 'flex', gap: 10 }}>
                    <button onClick={copyLink} className="btn btn-primary btn-sm" style={{ flex: 1 }}>
                        <Copy size={14} /> Copy Link
                    </button>
                    <button onClick={shareLink} className="btn btn-secondary btn-sm" style={{ flex: 1 }}>
                        <Share2 size={14} /> Share
                    </button>
                </div>

                <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 12 }}>
                    Share this link with friends. Earn <strong style={{ color: 'var(--accent-secondary)' }}>2% reward</strong> on their first staking pool!
                </p>
            </div>

            {/* Stats - responsive grid */}
            <div className="referral-stats-grid" style={{ display: 'grid', gap: 12, marginBottom: 32 }}>
                <div className="stat-card">
                    <div className="stat-icon" style={{ background: 'rgba(124,58,237,0.1)', color: 'var(--accent-primary)' }}><Users size={22} /></div>
                    <div className="stat-value">{data?.referredUsers || 0}</div>
                    <div className="stat-label">Users Referred</div>
                </div>
                <div className="stat-card">
                    <div className="stat-icon" style={{ background: 'rgba(16,185,129,0.1)', color: 'var(--success)' }}><Gift size={22} /></div>
                    <div className="stat-value">${data?.totalRewards || '0'}</div>
                    <div className="stat-label">Total Rewards</div>
                </div>
                <div className="stat-card">
                    <div className="stat-icon" style={{ background: 'rgba(59,130,246,0.1)', color: 'var(--info)' }}>
                        <span style={{ fontSize: 18, fontWeight: 800 }}>%</span>
                    </div>
                    <div className="stat-value">2%</div>
                    <div className="stat-label">Reward Rate</div>
                </div>
            </div>

            {/* Referral History */}
            <div className="card">
                <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 16 }}>Referral History</h3>
                {!data?.referrals?.length ? (
                    <div className="empty-state"><p>No referrals yet. Share your link!</p></div>
                ) : (
                    <>
                        {/* Desktop table */}
                        <div className="table-container desktop-only">
                            <table>
                                <thead><tr><th>User</th><th>Reward</th><th>Date</th></tr></thead>
                                <tbody>
                                    {data.referrals.map(r => (
                                        <tr key={r.id}>
                                            <td>{r.referredUser.email}</td>
                                            <td style={{ color: 'var(--success)', fontWeight: 600 }}>${parseFloat(r.rewardAmount).toFixed(2)}</td>
                                            <td style={{ color: 'var(--text-muted)' }}>{new Date(r.createdAt).toLocaleDateString()}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* Mobile card list */}
                        <div className="mobile-only" style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                            {data.referrals.map(r => (
                                <div key={r.id} style={{
                                    padding: 14, borderRadius: 12,
                                    background: 'var(--bg-primary)', border: '1px solid var(--border-color)',
                                }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                                        <span style={{ fontSize: 14, fontWeight: 600, wordBreak: 'break-all', flex: 1 }}>{r.referredUser.email}</span>
                                        <span style={{ color: 'var(--success)', fontWeight: 700, fontSize: 15, marginLeft: 12 }}>
                                            ${parseFloat(r.rewardAmount).toFixed(2)}
                                        </span>
                                    </div>
                                    <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                                        {new Date(r.createdAt).toLocaleDateString()}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </>
                )}
            </div>

            <style jsx>{`
                .referral-stats-grid {
                    grid-template-columns: repeat(3, 1fr);
                }
                @media (max-width: 640px) {
                    .referral-stats-grid {
                        grid-template-columns: 1fr;
                    }
                    .referral-btn-row {
                        flex-direction: column;
                    }
                }
            `}</style>
        </div>
    )
}
