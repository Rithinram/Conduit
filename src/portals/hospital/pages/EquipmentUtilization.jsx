import React from 'react';
import { Microscope, Zap, AlertTriangle, RefreshCcw, Layout, Maximize2, Move } from 'lucide-react';
import { motion } from 'framer-motion';

const equipment = [
    { id: 'mri1', name: 'MRI 1.5T', load: 95, status: 'Overloaded', color: 'var(--danger)' },
    { id: 'mri2', name: 'MRI 3.0T', load: 20, status: 'Idle', color: 'var(--success)' },
    { id: 'ct1', name: 'CT Scan Alpha', load: 65, status: 'Optimal', color: 'var(--warning)' },
    { id: 'v1', name: 'Ventilator V1', load: 88, status: 'High Use', color: 'var(--danger)' },
];

const EquipmentUtilization = () => {
    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-lg)' }}>
            {/* Interactive Controls */}
            <div className="card glass" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h3 style={{ margin: 0 }}>Equipment Utilization Heatmap</h3>
                <div style={{ display: 'flex', gap: 'var(--space-md)' }}>
                    <button className="btn glass"><Maximize2 size={16} /> Full Map</button>
                    <button className="btn glass"><Move size={16} /> Reallocate Mode</button>
                    <button className="btn btn-primary"><RefreshCcw size={16} /> Sync Live</button>
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 'var(--space-lg)' }}>
                {/* Mock Floor Map with Heatmap */}
                <div className="card" style={{ position: 'relative', height: '400px', background: 'var(--background)', overflow: 'hidden' }}>
                    <div style={{ position: 'absolute', inset: 'var(--space-xl)', border: '2px solid var(--surface-border)', borderRadius: 'var(--radius-lg)', background: 'white' }}>
                        {/* Simple Grid Representation of rooms */}
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gridTemplateRows: '1fr 1fr', height: '100%', gap: '1px', background: 'var(--surface-border)' }}>
                            {[...Array(6)].map((_, i) => (
                                <div key={i} style={{ background: 'white', padding: 'var(--space-md)', position: 'relative' }}>
                                    <span style={{ fontSize: '0.6rem', color: 'var(--text-muted)', fontWeight: 700 }}>ZONE 0{i + 1}</span>
                                    {i === 0 && (
                                        <motion.div
                                            animate={{ opacity: [0.4, 0.7, 0.4] }}
                                            transition={{ repeat: Infinity, duration: 2 }}
                                            style={{ position: 'absolute', inset: 0, background: 'rgba(239, 68, 68, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                                        >
                                            <Microscope size={32} color="var(--danger)" />
                                        </motion.div>
                                    )}
                                    {i === 2 && (
                                        <div style={{ position: 'absolute', inset: 0, background: 'rgba(16, 185, 129, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                            <Microscope size={32} color="var(--success)" />
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                    <div style={{ position: 'absolute', bottom: 'var(--space-lg)', right: 'var(--space-lg)', background: 'var(--glass-bg)', backdropFilter: 'var(--glass-blur)', padding: 'var(--space-sm)', borderRadius: 'var(--radius-sm)', fontSize: '0.7rem' }}>
                        🔴 Overloaded | 🟡 Moderate | 🟢 Idle
                    </div>
                </div>

                {/* Equipment Status List */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
                    {equipment.map((e) => (
                        <div key={e.id} className="card" style={{ padding: 'var(--space-md)' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                <div style={{ display: 'flex', gap: 'var(--space-sm)', alignItems: 'center' }}>
                                    <div style={{ background: 'var(--background)', padding: '8px', borderRadius: '8px' }}>
                                        <Microscope size={20} color="var(--primary)" />
                                    </div>
                                    <div>
                                        <div style={{ fontWeight: 700, fontSize: '0.9rem' }}>{e.name}</div>
                                        <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>ID: {e.id.toUpperCase()}</div>
                                    </div>
                                </div>
                                <span className="badge" style={{ background: `${e.color}15`, color: e.color, fontSize: '0.65rem' }}>{e.status.toUpperCase()}</span>
                            </div>

                            <div style={{ marginTop: 'var(--space-md)' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', marginBottom: '4px' }}>
                                    <span>Utilization</span>
                                    <span style={{ fontWeight: 700 }}>{e.load}%</span>
                                </div>
                                <div style={{ height: '6px', background: 'var(--background)', borderRadius: '3px', overflow: 'hidden' }}>
                                    <div style={{ width: `${e.load}%`, height: '100%', background: e.color }} />
                                </div>
                            </div>

                            {e.load > 90 && (
                                <div style={{ marginTop: 'var(--space-sm)', display: 'flex', gap: 'var(--space-sm)', color: 'var(--danger)', fontSize: '0.7rem' }}>
                                    <AlertTriangle size={14} />
                                    <span>Recommendation: Move non-urgent MRI scans to Unit 3.0T.</span>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </div>

            {/* Network Coordination Nudge */}
            <div className="card" style={{ background: 'var(--primary)', color: 'white', display: 'flex', gap: 'var(--space-xl)', alignItems: 'center' }}>
                <Zap size={32} color="var(--warning)" />
                <div style={{ flex: 1 }}>
                    <h4 style={{ margin: 0 }}>Inter-Hospital Equipment Sharing</h4>
                    <p style={{ margin: '4px 0 0 0', fontSize: '0.875rem', opacity: 0.9 }}>
                        Predictive demand shows <strong>Central General</strong> will experience a ventilator shortage in &lt;2h. 4 ventilators available for transfer from this facility.
                    </p>
                </div>
                <button className="btn glass" style={{ color: 'white', borderColor: 'rgba(255,255,255,0.3)' }}>INITIATE TRANSFER</button>
            </div>
        </div>
    );
};

export default EquipmentUtilization;
