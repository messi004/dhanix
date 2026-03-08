'use client'

import { useEffect, useState } from 'react'
import { toast } from 'react-hot-toast'
import { Settings, Save } from 'lucide-react'

const settingsConfig = [
    { key: 'min_deposit', label: 'Minimum Deposit (USDT)', type: 'number' },
    { key: 'max_deposit', label: 'Maximum Deposit (USDT)', type: 'number' },
    { key: 'min_withdraw', label: 'Minimum Withdrawal (USDT)', type: 'number' },
    { key: 'max_withdraw', label: 'Maximum Withdrawal (USDT)', type: 'number' },
    { key: 'withdraw_per_day', label: 'Withdrawals Per Day', type: 'number' },
    { key: 'min_stake', label: 'Minimum Stake (USDT)', type: 'number' },
    { key: 'max_stake', label: 'Maximum Stake (USDT)', type: 'number' },
    { key: 'interest_rate', label: 'Interest Rate (% Annual)', type: 'number' },
    { key: 'min_pool_duration_months', label: 'Minimum Pool Duration (Months)', type: 'number' },
    { key: 'referral_percentage', label: 'Referral Reward (%)', type: 'number' },
    { key: 'welcome_bonus_percentage', label: 'Welcome Bonus (%)', type: 'number' },
]

export default function AdminSettingsPage() {
    const [settings, setSettings] = useState<Record<string, string>>({})
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)

    useEffect(() => {
        fetch('/api/admin?resource=settings').then(r => r.json()).then(d => setSettings(d.settings || {})).finally(() => setLoading(false))
    }, [])

    const handleSave = async () => {
        setSaving(true)
        try {
            const res = await fetch('/api/admin?action=update-settings', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ settings }),
            })
            const data = await res.json()
            if (!res.ok) throw new Error(data.error)
            toast.success('Settings saved!')
        } catch (err: unknown) {
            toast.error(err instanceof Error ? err.message : 'Failed')
        } finally {
            setSaving(false)
        }
    }

    if (loading) return <div className="loading-page"><div className="spinner" /></div>

    return (
        <div className="animate-fade-in">
            <div className="page-header">
                <h1>Platform Settings</h1>
                <button onClick={handleSave} className="btn btn-primary" disabled={saving}>
                    {saving ? <span className="spinner" /> : <><Save size={16} /> Save Settings</>}
                </button>
            </div>



            {/* Settings Grid */}
            <div className="card">
                <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 20, display: 'flex', alignItems: 'center', gap: 8 }}>
                    <Settings size={18} style={{ color: 'var(--accent-primary)' }} /> Configuration
                </h3>
                <div className="grid-2" style={{ gap: 20 }}>
                    {settingsConfig.map(s => (
                        <div key={s.key} className="input-group">
                            <label>{s.label}</label>
                            <input
                                className="input"
                                type={s.type}
                                value={settings[s.key] || ''}
                                onChange={e => setSettings(prev => ({ ...prev, [s.key]: e.target.value }))}
                                step="any"
                            />
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}
