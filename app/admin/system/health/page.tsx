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
            <div className="header-row">
                <div>
                    <h1 className="title">
                        <Activity className="text-danger" size={32} /> System Health
                    </h1>
                    <p className="subtitle">Monitor application infrastructure, cron jobs, and real-time logs.</p>
                </div>
                <button 
                    onClick={() => fetchHealth(true)} 
                    disabled={refreshing}
                    className="btn btn-secondary refresh-btn"
                >
                    <RefreshCcw size={18} className={refreshing ? 'spin' : ''} />
                    {refreshing ? 'Refreshing...' : 'Refresh Now'}
                </button>
            </div>

            {/* Top Status Grid */}
            <div className="status-grid">
                <StatusCard 
                    title="Database" 
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
                    title="Platform" 
                    value={data?.system.platform ? `${data.system.platform} (${data.system.arch})` : 'Unknown'} 
                    status="neutral"
                    icon={<Server size={24} />}
                />
                <StatusCard 
                    title="Node" 
                    value={data?.system.nodeVersion || 'Unknown'} 
                    status="neutral"
                    icon={<Box size={24} />}
                />
            </div>

            {/* PM2 Processes & Health Metrics */}
            <div className="main-grid">
                <div className="card processes-card" style={{ padding: 0 }}>
                    <div className="card-header">
                        <h3 className="card-title">Active PM2 Processes</h3>
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
                                    <th className="hide-mobile">Uptime</th>
                                    <th className="hide-mobile">Restarts</th>
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
                                        <td className="hide-mobile">{formatUptime(job.uptime)}</td>
                                        <td className="hide-mobile">{job.restarts}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                <div className="card resources-card">
                    <h3 className="card-title" style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
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
            <div className="card logs-card">
                <div className="card-header logs-header">
                    <h3 className="card-title" style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <Terminal size={20} /> Live Console Logs
                    </h3>
                    <div className="log-toggle">
                        <button 
                            onClick={() => { setLogType('out'); fetchLogs('out') }}
                            className={`log-btn ${logType === 'out' ? 'active' : ''}`}
                        >Output</button>
                        <button 
                            onClick={() => { setLogType('error'); fetchLogs('error') }}
                            className={`log-btn ${logType === 'error' ? 'active-error' : ''}`}
                        >Errors</button>
                    </div>
                </div>
                <div className="log-content">
                    {loadingLogs ? (
                        <div style={{ padding: 20, textAlign: 'center', color: '#6b7280' }}>Loading logs...</div>
                    ) : logs.length > 0 ? (
                        logs.map((log, i) => (
                            <div key={i} className="log-line" style={{ 
                                color: log.includes('❌') || log.includes('error') ? '#f87171' : 
                                       log.includes('✅') || log.includes('🚀') ? '#34d399' : '#d1d5db'
                            }}>
                                <span className="log-number">[{i+1}]</span>
                                {log}
                            </div>
                        ))
                    ) : (
                        <div style={{ padding: 20, textAlign: 'center', color: '#6b7280' }}>No logs available.</div>
                    )}
                </div>
            </div>

            <style jsx>{`
                .header-row {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 32px;
                }
                .title {
                    font-size: 28px;
                    font-weight: 800;
                    margin-bottom: 8px;
                    display: flex;
                    align-items: center;
                    gap: 12px;
                }
                .subtitle {
                    color: #64648b;
                }
                .refresh-btn {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                }
                .status-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
                    gap: 20px;
                    margin-bottom: 32px;
                }
                .main-grid {
                    display: grid;
                    grid-template-columns: 2fr 1fr;
                    gap: 24px;
                    margin-bottom: 32px;
                }
                .card {
                    background: #ffffff;
                    border: 1px solid #e5e7eb;
                    border-radius: 16px;
                    padding: 24px;
                    box-shadow: 0 4px 6px -1px rgba(0,0,0,0.02), 0 2px 4px -1px rgba(0,0,0,0.01);
                }
                .card-header {
                    padding: 20px 24px;
                    border-bottom: 1px solid #f1f1f4;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                }
                .card-title {
                    margin: 0;
                    font-size: 18px;
                    font-weight: 700;
                }
                .logs-card {
                    background: #111827;
                    color: #f3f4f6;
                    border-color: #374151;
                    padding: 0;
                }
                .logs-header {
                    border-bottom: 1px solid #374151;
                }
                .log-toggle {
                    display: flex;
                    gap: 8px;
                    background: #1f2937;
                    padding: 4px;
                    border-radius: 8px;
                }
                .log-btn {
                    padding: 6px 16px;
                    border-radius: 6px;
                    border: none;
                    cursor: pointer;
                    background: transparent;
                    color: #9ca3af;
                    font-size: 12px;
                    font-weight: 600;
                    transition: all 0.2s;
                }
                .log-btn.active { background: #374151; color: white; }
                .log-btn.active-error { background: #ef4444; color: white; }
                .log-content {
                    max-height: 400px;
                    overflow-y: auto;
                    padding: 20px 0;
                    font-family: 'monospace';
                    font-size: 12px;
                    line-height: 1.6;
                }
                .log-line {
                    padding: 2px 20px;
                }
                .log-number {
                    color: #4b5563;
                    margin-right: 15px;
                }
                .text-danger { color: #ef4444; }
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

                @media (max-width: 1024px) {
                    .main-grid {
                        grid-template-columns: 1fr;
                    }
                }

                @media (max-width: 768px) {
                    .header-row {
                        flex-direction: column;
                        align-items: flex-start;
                        gap: 16px;
                    }
                    .status-grid {
                        grid-template-columns: 1fr;
                    }
                    .hide-mobile {
                        display: none;
                    }
                    .card-header {
                        padding: 15px 20px;
                        flex-direction: column;
                        align-items: flex-start;
                        gap: 12px;
                    }
                    .log-toggle {
                        width: 100%;
                    }
                    .log-btn {
                        flex: 1;
                    }
                    .title {
                        font-size: 24px;
                    }
                }
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
