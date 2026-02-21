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
            <div className="card glass" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', gap: 'var(--space-xl)', alignItems: 'center' }}>
                    <div style={{ position: 'relative' }}>
                        <Bell size={32} color="var(--primary)" />
                        {alerts.some(a => a.type === 'danger') && (
                            <div style={{ position: 'absolute', top: -4, right: -4, width: 16, height: 16, background: 'var(--danger)', borderRadius: '50%', border: '2px solid white' }} />
                        )}
                    </div>
                    <div>
                        <h2 style={{ margin: 0 }}>Operational Alerts</h2>
                        <p style={{ margin: '4px 0 0 0', color: 'var(--text-muted)' }}>Real-time monitoring of all network nodes.</p>
                    </div>
                </div>
                <div style={{ display: 'flex', gap: 'var(--space-md)' }}>
                    <button onClick={fetchData} className="btn glass"><RefreshCw size={16} /></button>
                    <button className="btn btn-primary" onClick={handleReset}>STABILIZE NETWORK</button>
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
                                className="card"
                                style={{
                                    borderLeft: `6px solid var(--${a.type})`,
                                    display: 'flex',
                                    gap: 'var(--space-lg)',
                                    alignItems: 'flex-start'
                                }}
                            >
                                <div style={{ background: `var(--${a.type}-bg)`, padding: '12px', borderRadius: 'var(--radius-md)' }}>
                                    {a.type === 'danger' ? <ShieldAlert size={24} color="var(--danger)" /> : a.type === 'warning' ? <AlertTriangle size={24} color="var(--warning)" /> : <Info size={24} color="var(--primary)" />}
                                </div>
                                <div style={{ flex: 1 }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <h4 style={{ margin: 0, color: `var(--${a.type})` }}>{a.title}</h4>
                                        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}><Clock size={12} style={{ verticalAlign: 'middle', marginRight: '4px' }} /> {a.time}</span>
                                    </div>
                                    <p style={{ margin: '8px 0 0 0', fontSize: '0.9rem', color: 'var(--text-main)', lineHeight: 1.5 }}>{a.msg}</p>
                                    <div style={{ display: 'flex', gap: 'var(--space-md)', marginTop: 'var(--space-lg)' }}>
                                        <button
                                            className="btn btn-primary"
                                            style={{ fontSize: '0.75rem', padding: '0.5rem 1rem', gap: '8px' }}
                                            onClick={() => navigate('/admin/coordination')}
                                        >
                                            <Navigation size={14} /> RE-ROUTE COORDINATION
                                        </button>
                                        <button
                                            className="btn glass"
                                            style={{ fontSize: '0.75rem', padding: '0.5rem 1rem' }}
                                            onClick={() => toggleAcknowledge(a.id)}
                                        >
                                            ACKNOWLEDGE
                                        </button>
                                    </div>
                                </div>
                                <button
                                    className="btn glass"
                                    style={{ border: 'none', padding: '4px' }}
                                    onClick={() => toggleAcknowledge(a.id)}
                                >
                                    <X size={16} />
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
                                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', marginBottom: '4px' }}>
                                    <span>Resolution Efficiency</span>
                                    <span style={{ fontWeight: 700 }}>92%</span>
                                </div>
                                <div style={{ height: '4px', background: 'var(--background)', borderRadius: '2px' }}>
                                    <div style={{ width: '92%', height: '100%', background: 'var(--success)' }} />
                                </div>
                            </div>
                            <div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', marginBottom: '4px' }}>
                                    <span>Network Latency</span>
                                    <span style={{ fontWeight: 700 }}>42ms</span>
                                </div>
                                <div style={{ height: '4px', background: 'var(--background)', borderRadius: '2px' }}>
                                    <div style={{ width: '95%', height: '100%', background: 'var(--primary)' }} />
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="card" style={{ background: 'var(--text-main)', color: 'white' }}>
                        <div style={{ display: 'flex', gap: 'var(--space-md)', alignItems: 'center', marginBottom: 'var(--space-md)' }}>
                            <Zap size={20} color="var(--warning)" />
                            <h4 style={{ margin: 0 }}>System Guard: {systemState?.globalAlertLevel || 'Optimal'}</h4>
                        </div>
                        <p style={{ fontSize: '0.8rem', opacity: 0.8 }}>
                            Redistribution Protocol: {systemState?.redistributionProtocolActive ? 'ACTIVE' : 'IDLE'}.
                            Awaiting {alerts.length} acknowledgments.
                        </p>
                        <div className="card glass" style={{ border: 'none', background: 'rgba(255,255,255,0.05)', marginTop: 'var(--space-md)' }}>
                            <div style={{ fontSize: '0.7rem', color: 'var(--success)', fontWeight: 700 }}>TRUST SCORE: 98.4</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default OperationalAlerts;
