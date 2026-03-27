'use client'

import { useEffect, useState, useCallback } from 'react'
import { 
    Activity, Server, Database, Cpu, HardDrive, 
    RefreshCcw, AlertTriangle, CheckCircle2, Terminal,
    ChevronRight, Clock, ShieldCheck, Box
} from 'lucide-react'
import { toast } from 'react-hot-toast'

interface HealthData {
    database: string;
    system: {
        uptime: number;
        platform: string;
        arch: string;
        totalMemory: number;
        freeMemory: number;
        loadAverage: number[];
        nodeVersion: string;
    };
    cronJobs: any[];
    allProcesses: any[];
    timestamp: string;
}

export default function SystemHealthPage() {
    const [data, setData] = useState<HealthData | null>(null)
    const [loading, setLoading] = useState(true)
    const [refreshing, setRefreshing] = useState(false)
    const [logs, setLogs] = useState<string[]>([])
    const [logType, setLogType] = useState<'out' | 'error'>('out')
    const [loadingLogs, setLoadingLogs] = useState(false)

    const fetchHealth = useCallback(async (isRefresh = false) => {
        if (isRefresh) setRefreshing(true)
        try {
            const res = await fetch('/api/admin/system/health')
            const result = await res.json()
            if (result.status === 'success') {
                setData(result.data)
            } else {
                toast.error(result.message || 'Failed to fetch health data')
            }
        } catch (error) {
            toast.error('Connection to Health API failed')
        } finally {
            setLoading(false)
            setRefreshing(false)
        }
    }, [])

    const fetchLogs = useCallback(async (type: 'out' | 'error') => {
        setLoadingLogs(true)
        try {
            const res = await fetch(`/api/admin/system/logs?type=${type}&limit=50`)
            const result = await res.json()
            if (result.status === 'success') {
                setLogs(result.data.logs)
            }
        } catch (error) {
            toast.error('Failed to fetch logs')
        } finally {
            setLoadingLogs(false)
        }
    }, [])

    useEffect(() => {
        fetchHealth()
        fetchLogs(logType)
        const interval = setInterval(() => fetchHealth(true), 30000) // Auto-refresh every 30s
        return () => clearInterval(interval)
    }, [fetchHealth, fetchLogs, logType])

    const formatBytes = (bytes: number) => {
        if (bytes === 0) return '0 Bytes'
        const k = 1024
        const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB']
        const i = Math.floor(Math.log(bytes) / Math.log(k))
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
    }

    const formatUptime = (seconds: number) => {
        const d = Math.floor(seconds / (3600 * 24))
        const h = Math.floor((seconds % (3600 * 24)) / 3600)
        const m = Math.floor((seconds % 3600) / 60)
        return `${d}d ${h}h ${m}m`
    }

    if (loading) return <div className="loading-page"><div className="spinner" /></div>

    return (
        <div style={{ color: '#1a1a2e' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32 }}>
                <div>
                    <h1 style={{ fontSize: 28, fontWeight: 800, marginBottom: 8, display: 'flex', alignItems: 'center', gap: 12 }}>
                        <Activity className="text-danger" size={32} /> System Health
                    </h1>
                    <p style={{ color: '#64648b' }}>Monitor application infrastructure, cron jobs, and real-time logs.</p>
                </div>
                <button 
                    onClick={() => fetchHealth(true)} 
                    disabled={refreshing}
                    className="btn btn-secondary"
                    style={{ display: 'flex', alignItems: 'center', gap: 8 }}
                >
                    <RefreshCcw size={18} className={refreshing ? 'spin' : ''} />
                    {refreshing ? 'Refreshing...' : 'Refresh Now'}
                </button>
            </div>

            {/* Top Status Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 20, marginBottom: 32 }}>
                <StatusCard 
                    title="Database Connection" 
                    value={data?.database || 'Unknown'} 
                    status={data?.database === 'ONLINE' ? 'success' : 'error'}
                    icon={<Database size={24} />}
                />
                <StatusCard 
                    title="Cron Jobs" 
                    value={data?.cronJobs.some(j => j.status === 'online') ? 'RUNNING' : data?.cronJobs.length ? 'STOPPED' : 'NOT FOUND'} 
                    status={data?.cronJobs.some(j => j.status === 'online') ? 'success' : data?.cronJobs.length ? 'error' : 'warning'}
                    icon={<Clock size={24} />}
                />
                <StatusCard 
                    title="System Platform" 
                    value={data?.system.platform ? `${data.system.platform} (${data.system.arch})` : 'Unknown'} 
                    status="neutral"
                    icon={<Server size={24} />}
                />
                <StatusCard 
                    title="Node Version" 
                    value={data?.system.nodeVersion || 'Unknown'} 
                    status="neutral"
                    icon={<Box size={24} />}
                />
            </div>

            {/* PM2 Processes & Health Metrics */}
            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 24, marginBottom: 32 }}>
                <div className="card" style={{ padding: 0 }}>
                    <div style={{ padding: '20px 24px', borderBottom: '1px solid #f1f1f4', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <h3 style={{ margin: 0, fontSize: 18, fontWeight: 700 }}>Active PM2 Processes</h3>
                        <div className="badge badge-success">Online</div>
                    </div>
                    <div className="table-responsive">
                        <table className="table">
                            <thead>
                                <tr>
                                    <th>ID</th>
                                    <th>Process Name</th>
                                    <th>Status</th>
                                    <th>CPU</th>
                                    <th>Memory</th>
                                    <th>Uptime</th>
                                    <th>Restarts</th>
                                </tr>
                            </thead>
                            <tbody>
                                {data?.cronJobs.map(job => (
                                    <tr key={job.id}>
                                        <td style={{ fontWeight: 600 }}>#{job.id}</td>
                                        <td>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                                <div style={{ width: 8, height: 8, borderRadius: '50%', background: job.status === 'online' ? '#10b981' : '#ef4444' }} />
                                                {job.name}
                                            </div>
                                        </td>
                                        <td><span className={`badge badge-${job.status === 'online' ? 'success' : 'danger'}`}>{job.status}</span></td>
                                        <td>{job.cpu}%</td>
                                        <td>{formatBytes(job.memory)}</td>
                                        <td>{formatUptime(job.uptime)}</td>
                                        <td>{job.restarts}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                <div className="card">
                    <h3 style={{ marginBottom: 20, fontSize: 18, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 10 }}>
                        <Cpu className="text-danger" size={20} /> Resources
                    </h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                        <MetricRow 
                            label="CPU Load (1m)" 
                            value={`${data?.system.loadAverage[0].toFixed(2)}`} 
                            icon={<Activity size={16} />}
                        />
                        <MetricRow 
                            label="Used Memory" 
                            value={formatBytes((data?.system.totalMemory || 0) - (data?.system.freeMemory || 0))} 
                            icon={<HardDrive size={16} />}
                        />
                        <MetricRow 
                            label="Free Memory" 
                            value={formatBytes(data?.system.freeMemory || 0)} 
                            icon={<CheckCircle2 size={16} />}
                        />
                        <MetricRow 
                            label="System Uptime" 
                            value={formatUptime(data?.system.uptime || 0)} 
                            icon={<Clock size={16} />}
                        />
                    </div>
                </div>
            </div>

            {/* Logs Viewer */}
            <div className="card" style={{ background: '#111827', color: '#f3f4f6', borderColor: '#374151' }}>
                <div style={{ paddingBottom: 20, borderBottom: '1px solid #374151', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h3 style={{ margin: 0, fontSize: 18, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 10 }}>
                        <Terminal size={20} /> Live Console Logs
                    </h3>
                    <div style={{ display: 'flex', gap: 8, background: '#1f2937', padding: 4, borderRadius: 8 }}>
                        <button 
                            onClick={() => { setLogType('out'); fetchLogs('out') }}
                            style={{ 
                                padding: '6px 16px', borderRadius: 6, border: 'none', cursor: 'pointer',
                                background: logType === 'out' ? '#374151' : 'transparent',
                                color: logType === 'out' ? 'white' : '#9ca3af',
                                fontSize: 12, fontWeight: 600
                            }}
                        >Output</button>
                        <button 
                            onClick={() => { setLogType('error'); fetchLogs('error') }}
                            style={{ 
                                padding: '6px 16px', borderRadius: 6, border: 'none', cursor: 'pointer',
                                background: logType === 'error' ? '#ef4444' : 'transparent',
                                color: logType === 'error' ? 'white' : '#9ca3af',
                                fontSize: 12, fontWeight: 600
                            }}
                        >Errors</button>
                    </div>
                </div>
                <div style={{ 
                    maxHeight: 400, overflowY: 'auto', padding: '20px 0', 
                    fontFamily: 'monospace', fontSize: 12, lineHeight: 1.6 
                }}>
                    {loadingLogs ? (
                        <div style={{ padding: 20, textAlign: 'center', color: '#6b7280' }}>Loading logs...</div>
                    ) : logs.length > 0 ? (
                        logs.map((log, i) => (
                            <div key={i} style={{ 
                                padding: '2px 20px', 
                                color: log.includes('❌') || log.includes('error') ? '#f87171' : 
                                       log.includes('✅') || log.includes('🚀') ? '#34d399' : '#d1d5db'
                            }}>
                                <span style={{ color: '#4b5563', marginRight: 15 }}>[{i+1}]</span>
                                {log}
                            </div>
                        ))
                    ) : (
                        <div style={{ padding: 20, textAlign: 'center', color: '#6b7280' }}>No logs available.</div>
                    )}
                </div>
            </div>

            <style jsx>{`
                .card {
                    background: #ffffff;
                    border: 1px solid #e5e7eb;
                    border-radius: 16px;
                    padding: 24px;
                    box-shadow: 0 4px 6px -1px rgba(0,0,0,0.02), 0 2px 4px -1px rgba(0,0,0,0.01);
                }
                .text-danger { color: var(--danger); }
                .badge {
                    padding: 4px 10px;
                    border-radius: 6px;
                    font-size: 11px;
                    font-weight: 700;
                    text-transform: uppercase;
                }
                .badge-success { background: #d1fae5; color: #065f46; }
                .badge-danger { background: #fee2e2; color: #991b1b; }
                .badge-warning { background: #fef3c7; color: #92400e; }
                .spin { animation: spin 1s linear infinite; }
                @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
            `}</style>
        </div>
    )
}

function StatusCard({ title, value, status, icon }: { title: string, value: string, status: 'success' | 'error' | 'warning' | 'neutral', icon: any }) {
    const getStatusColor = () => {
        switch(status) {
            case 'success': return '#10b981'
            case 'error': return '#ef4444'
            case 'warning': return '#f59e0b'
            default: return '#6b7280'
        }
    }

    return (
        <div style={{ 
            background: '#ffffff', borderRadius: 16, padding: 20, border: '1px solid #e5e7eb',
            display: 'flex', alignItems: 'center', gap: 16
        }}>
            <div style={{ 
                width: 48, height: 48, borderRadius: 12, background: `${getStatusColor()}15`,
                display: 'flex', alignItems: 'center', justifyContent: 'center', color: getStatusColor()
            }}>
                {icon}
            </div>
            <div>
                <div style={{ fontSize: 13, color: '#6b7280', fontWeight: 500 }}>{title}</div>
                <div style={{ fontSize: 15, fontWeight: 700, color: '#111827' }}>{value}</div>
            </div>
        </div>
    )
}

function MetricRow({ label, value, icon }: { label: string, value: string, icon: any }) {
    return (
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, color: '#6b7280', fontSize: 14 }}>
                {icon}
                {label}
            </div>
            <div style={{ fontWeight: 600, fontSize: 14 }}>{value}</div>
        </div>
    )
}
