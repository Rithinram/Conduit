import React from 'react';
import { Bell, ShieldAlert, Zap, AlertTriangle, Info, Clock, CheckCircle2, MoreVertical, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const OperationalAlerts = () => {
    const alerts = [
        { id: 1, type: 'danger', title: 'ER Intake Spike', msg: 'Central General ER intake exceeded threshold by 150% in last 15 mins.', time: '2m ago' },
        { id: 2, type: 'warning', title: 'MRI Shortage', msg: 'Saints Memorial MRI Unit 1 failing. Diverting all scheduled scans.', time: '14m ago' },
        { id: 3, type: 'primary', title: 'Staffing Update', msg: 'OPD Nursing Team redistribution successful at City Care.', time: '45m ago' },
    ];

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-lg)' }}>
            {/* Active Alerts Header */}
            <div className="card glass" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', gap: 'var(--space-xl)', alignItems: 'center' }}>
                    <div style={{ position: 'relative' }}>
                        <Bell size={32} color="var(--primary)" />
                        <div style={{ position: 'absolute', top: -4, right: -4, width: 16, height: 16, background: 'var(--danger)', borderRadius: '50%', border: '2px solid white' }} />
                    </div>
                    <div>
                        <h2 style={{ margin: 0 }}>Operational Alerts</h2>
                        <p style={{ margin: '4px 0 0 0', color: 'var(--text-muted)' }}>Real-time monitoring of all network nodes.</p>
                    </div>
                </div>
                <div style={{ display: 'flex', gap: 'var(--space-md)' }}>
                    <button className="btn glass">MUTE ALL</button>
                    <button className="btn btn-primary">CLEAR HISTORY</button>
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 'var(--space-lg)' }}>
                {/* Alerts Feed */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
                    <AnimatePresence>
                        {alerts.map((a) => (
                            <motion.div
                                key={a.id}
                                initial={{ x: -20, opacity: 0 }}
                                animate={{ x: 0, opacity: 1 }}
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
                                        <button className="btn btn-primary" style={{ fontSize: '0.75rem', padding: '0.5rem 1rem' }}>TAKE ACTION</button>
                                        <button className="btn glass" style={{ fontSize: '0.75rem', padding: '0.5rem 1rem' }}>ACKNOWLEDGE</button>
                                    </div>
                                </div>
                                <button className="btn glass" style={{ border: 'none', padding: '4px' }}><X size={16} /></button>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </div>

                {/* Alert Stats */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-lg)' }}>
                    <div className="card">
                        <h4>Response Performance</h4>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-lg)', marginTop: 'var(--space-md)' }}>
                            <div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', marginBottom: '4px' }}>
                                    <span>Avg. Resolution Time</span>
                                    <span style={{ fontWeight: 700 }}>4.2 mins</span>
                                </div>
                                <div style={{ height: '4px', background: 'var(--background)', borderRadius: '2px' }}>
                                    <div style={{ width: '85%', height: '100%', background: 'var(--success)' }} />
                                </div>
                            </div>
                            <div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', marginBottom: '4px' }}>
                                    <span>Critical Uptime</span>
                                    <span style={{ fontWeight: 700 }}>99.98%</span>
                                </div>
                                <div style={{ height: '4px', background: 'var(--background)', borderRadius: '2px' }}>
                                    <div style={{ width: '99.98%', height: '100%', background: 'var(--primary)' }} />
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="card" style={{ background: 'var(--text-main)', color: 'white' }}>
                        <div style={{ display: 'flex', gap: 'var(--space-md)', alignItems: 'center', marginBottom: 'var(--space-md)' }}>
                            <Zap size={20} color="var(--warning)" />
                            <h4 style={{ margin: 0 }}>Smart Alert Nudging</h4>
                        </div>
                        <p style={{ fontSize: '0.8rem', opacity: 0.8 }}>
                            Our AI is currently suppressing 12 redundant notifications to prevent operator fatigue. Showing only unique critical events.
                        </p>
                        <div className="card glass" style={{ border: 'none', background: 'rgba(255,255,255,0.05)', marginTop: 'var(--space-md)' }}>
                            <div style={{ fontSize: '0.7rem', color: 'var(--success)', fontWeight: 700 }}>SYSTEM HEALTH: OPTIMAL</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default OperationalAlerts;
