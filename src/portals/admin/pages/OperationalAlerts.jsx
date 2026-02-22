import React, { useState, useEffect } from 'react';
import { Bell, ShieldAlert, Zap, AlertTriangle, Info, Clock, CheckCircle2, MoreVertical, X, RefreshCw, Navigation } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { getSystemState, resetSystemState } from '../../../services/api';

const OperationalAlerts = () => {
    const navigate = useNavigate();
    const [systemState, setSystemState] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [acknowledged, setAcknowledged] = useState([]);

    const fetchData = async () => {
        const state = await getSystemState();
        setSystemState(state);
        setIsLoading(false);
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleReset = async () => {
        if (window.confirm('Are you sure you want to clear all operational alerts and stabilization protocols?')) {
            await resetSystemState();
            setAcknowledged([]);
            fetchData();
        }
    };

    const toggleAcknowledge = (id) => {
        setAcknowledged(prev =>
            prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
        );
    };

    if (isLoading) return <div>Monitoring Regional Nodes...</div>;

    const baseAlerts = systemState?.activeGlobalAlert && systemState.activeGlobalAlert !== 'System Normal' ? [
        { id: 'global-broadcast', type: systemState.globalAlertLevel === 'Critical' ? 'danger' : 'warning', title: 'GLOBAL BROADCAST', msg: systemState.activeGlobalAlert, time: 'Live' },
        { id: 'stabilization-node', type: 'primary', title: 'Network Update', msg: 'Stabilization protocols in effect across all modules.', time: 'System' }
    ] : [
        { id: 'system-normal', type: 'primary', title: 'System Normal', msg: 'No critical operational anomalies detected in the last 4 hours.', time: 'Stable' }
    ];

    const alerts = baseAlerts.filter(a => !acknowledged.includes(a.id));

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-lg)' }}>
            {/* Active Alerts Header */}
            <div className="card" style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                background: 'linear-gradient(135deg, var(--primary) 0%, var(--primary-dark) 100%)',
                color: 'white',
                border: 'none',
                boxShadow: 'var(--shadow-xl)'
            }}>
                <div style={{ display: 'flex', gap: 'var(--space-xl)', alignItems: 'center' }}>
                    <div style={{ position: 'relative' }}>
                        <Bell size={32} color="white" />
                        {alerts.some(a => a.type === 'danger') && (
                            <motion.div
                                animate={{ scale: [1, 1.2, 1] }}
                                transition={{ repeat: Infinity, duration: 1.5 }}
                                style={{ position: 'absolute', top: -4, right: -4, width: 16, height: 16, background: 'var(--danger)', borderRadius: '50%', border: '2px solid white' }}
                            />
                        )}
                    </div>
                    <div>
                        <h2 style={{ margin: 0, color: 'white' }}>Operational Alerts</h2>
                        <p style={{ margin: '4px 0 0 0', color: 'rgba(255,255,255,0.8)', fontSize: '0.9rem' }}>Real-time monitoring of all network nodes.</p>
                    </div>
                </div>
                <div style={{ display: 'flex', gap: 'var(--space-md)' }}>
                    <button onClick={fetchData} className="btn btn-glass-dark" style={{ border: '1px solid rgba(255,255,255,0.2)' }}><RefreshCw size={16} /></button>
                    <button
                        className={`btn ${alerts.some(a => a.type === 'danger') ? 'pulse-critical' : ''}`}
                        style={{ background: 'var(--secondary)', color: 'var(--text-main)', fontWeight: 900, border: 'none' }}
                        onClick={handleReset}
                    >
                        STABILIZE NETWORK
                    </button>
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 'var(--space-lg)' }}>
                {/* Alerts Feed */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
                    <AnimatePresence mode="popLayout">
                        {alerts.length > 0 ? alerts.map((a) => (
                            <motion.div
                                key={a.id}
                                layout
                                initial={{ x: -20, opacity: 0 }}
                                animate={{ x: 0, opacity: 1 }}
                                exit={{ x: 50, opacity: 0 }}
                                whileHover={{ x: 8, scale: 1.01 }}
                                className="card"
                                style={{
                                    borderLeft: `6px solid var(--${a.type})`,
                                    background: a.type === 'danger'
                                        ? 'linear-gradient(90deg, rgba(239, 68, 68, 0.05) 0%, white 100%)'
                                        : a.type === 'warning'
                                            ? 'linear-gradient(90deg, rgba(245, 158, 11, 0.05) 0%, white 100%)'
                                            : 'linear-gradient(90deg, rgba(59, 130, 246, 0.05) 0%, white 100%)',
                                    display: 'flex',
                                    gap: 'var(--space-lg)',
                                    alignItems: 'flex-start',
                                    transition: 'all 0.2s ease'
                                }}
                            >
                                <div style={{ background: `var(--${a.type}-bg)`, padding: '12px', borderRadius: '16px' }}>
                                    {a.type === 'danger' ? <ShieldAlert size={28} color="var(--danger)" /> : a.type === 'warning' ? <AlertTriangle size={28} color="var(--warning)" /> : <Info size={28} color="var(--primary)" />}
                                </div>
                                <div style={{ flex: 1 }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <h4 style={{ margin: 0, color: `var(--${a.type})`, fontSize: '1.1rem', fontWeight: 800 }}>{a.title}</h4>
                                        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}><Clock size={12} style={{ verticalAlign: 'middle', marginRight: '4px' }} /> {a.time.toUpperCase()}</span>
                                    </div>
                                    <p style={{ margin: '8px 0 0 0', fontSize: '0.95rem', color: 'var(--text-main)', lineHeight: 1.6, opacity: 0.9 }}>{a.msg}</p>
                                    <div style={{ display: 'flex', gap: 'var(--space-md)', marginTop: 'var(--space-lg)' }}>
                                        <button
                                            className="btn"
                                            style={{ fontSize: '0.75rem', padding: '0.6rem 1.2rem', gap: '8px', background: 'var(--text-main)', color: 'white' }}
                                            onClick={() => navigate('/admin/coordination')}
                                        >
                                            <Navigation size={14} /> RE-ROUTE COORDINATION
                                        </button>
                                        <button
                                            className="btn glass"
                                            style={{ fontSize: '0.75rem', padding: '0.6rem 1.2rem', fontWeight: 700 }}
                                            onClick={() => toggleAcknowledge(a.id)}
                                        >
                                            ACKNOWLEDGE
                                        </button>
                                    </div>
                                </div>
                                <button
                                    className="btn glass"
                                    style={{ border: 'none', padding: '8px', color: 'var(--text-muted)' }}
                                    onClick={() => toggleAcknowledge(a.id)}
                                >
                                    <X size={18} />
                                </button>
                            </motion.div>
                        )) : (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="card"
                                style={{ textAlign: 'center', padding: 'var(--space-xl)', background: 'var(--success-bg)', border: '1px dashed var(--success)' }}
                            >
                                <CheckCircle2 size={32} color="var(--success)" style={{ marginBottom: '8px' }} />
                                <div style={{ fontWeight: 700, color: 'var(--success-dark)' }}>All Clear</div>
                                <div style={{ fontSize: '0.8rem', opacity: 0.8 }}>No active alerts requiring attention.</div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                {/* Alert Stats */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-lg)' }}>
                    <div className="card">
                        <h4>Regional Stability Index</h4>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-lg)', marginTop: 'var(--space-md)' }}>
                            <div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', marginBottom: '8px', color: 'var(--text-muted)', fontWeight: 700 }}>
                                    <span>Resolution Efficiency</span>
                                    <span style={{ color: 'var(--success)' }}>92%</span>
                                </div>
                                <div style={{ height: '8px', background: 'var(--background)', borderRadius: '4px', overflow: 'hidden' }}>
                                    <motion.div
                                        initial={{ width: 0 }}
                                        animate={{ width: '92%' }}
                                        style={{ height: '100%', background: 'linear-gradient(90deg, #4ade80 0%, #22c55e 100%)' }}
                                    />
                                </div>
                            </div>
                            <div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', marginBottom: '8px', color: 'var(--text-muted)', fontWeight: 700 }}>
                                    <span>Network Latency</span>
                                    <span style={{ color: 'var(--primary)' }}>42ms</span>
                                </div>
                                <div style={{ height: '8px', background: 'var(--background)', borderRadius: '4px', overflow: 'hidden' }}>
                                    <motion.div
                                        initial={{ width: 0 }}
                                        animate={{ width: '95%' }}
                                        style={{ height: '100%', background: 'linear-gradient(90deg, #60a5fa 0%, #3b82f6 100%)' }}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="card" style={{
                        background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
                        color: 'white',
                        border: 'none',
                        boxShadow: 'var(--shadow-lg)'
                    }}>
                        <div style={{ display: 'flex', gap: 'var(--space-md)', alignItems: 'center', marginBottom: 'var(--space-md)' }}>
                            <div style={{ background: 'rgba(255,255,100,0.1)', padding: '8px', borderRadius: '12px' }}>
                                <Zap size={20} color="var(--warning)" />
                            </div>
                            <h4 style={{ margin: 0, color: 'white' }}>System Guard: <span style={{ color: 'var(--secondary)' }}>{systemState?.globalAlertLevel || 'Optimal'}</span></h4>
                        </div>
                        <p style={{ fontSize: '0.85rem', opacity: 0.8, lineHeight: 1.5 }}>
                            Redistribution Protocol: <strong style={{ color: systemState?.redistributionProtocolActive ? 'var(--success)' : 'var(--text-muted)' }}>{systemState?.redistributionProtocolActive ? 'ACTIVE' : 'IDLE'}</strong>.
                            Awaiting {alerts.length} acknowledgments.
                        </p>
                        <div className="card" style={{
                            border: 'none',
                            background: 'rgba(255,255,255,0.05)',
                            marginTop: 'var(--space-md)',
                            padding: '12px',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center'
                        }}>
                            <div style={{ fontSize: '0.75rem', color: '#4ade80', fontWeight: 800 }}>TRUST SCORE</div>
                            <div style={{ fontSize: '1.2rem', fontWeight: 900, color: '#4ade80', textShadow: '0 0 10px rgba(74, 222, 128, 0.3)' }}>98.4</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default OperationalAlerts;
