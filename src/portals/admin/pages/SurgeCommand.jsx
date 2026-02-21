import React, { useState } from 'react';
import { ShieldAlert, Zap, Globe, ArrowRight, CornerUpRight, BarChart, Info, Play } from 'lucide-react';
import { motion } from 'framer-motion';

const SurgeCommand = () => {
    const [isSimulating, setIsSimulating] = useState(false);

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-lg)' }}>
            {/* Simulation Header */}
            <div className="card glass" style={{ background: 'linear-gradient(135deg, var(--text-main) 0%, #1e293b 100%)', color: 'white', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', gap: 'var(--space-xl)', alignItems: 'center' }}>
                    <Globe size={40} color="var(--primary)" />
                    <div>
                        <h2 style={{ margin: 0 }}>Regional Surge Command</h2>
                        <p style={{ margin: '4px 0 0 0', opacity: 0.8 }}>Predictive redistribution engine across 3 medical zones.</p>
                    </div>
                </div>
                <button
                    onClick={() => setIsSimulating(!isSimulating)}
                    className="btn btn-primary"
                    style={{ padding: '1rem 2rem', background: isSimulating ? 'var(--danger)' : 'var(--primary)' }}
                >
                    {isSimulating ? 'STOP SIMULATION' : 'START "WHAT-IF" SIMULATION'} <Play size={18} fill="currentColor" />
                </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: 'var(--space-lg)' }}>
                {/* Surge Detection Graph Placeholder */}
                <div className="card">
                    <h3 style={{ marginBottom: 'var(--space-lg)' }}>Surge Detection & Impact Analysis</h3>
                    <div style={{ height: '300px', background: 'var(--background)', borderRadius: 'var(--radius-lg)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '2px dashed var(--surface-border)', position: 'relative' }}>
                        <BarChart size={48} color="var(--surface-border)" />
                        <div style={{ position: 'absolute', bottom: 'var(--space-md)', left: 'var(--space-md)', right: 'var(--space-md)' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', marginBottom: '4px' }}>
                                <span>Incoming Peak Demand</span>
                                <span style={{ color: 'var(--danger)', fontWeight: 700 }}>+120% Cluster Increase</span>
                            </div>
                            <div style={{ height: '8px', background: 'var(--surface-border)', borderRadius: '4px', overflow: 'hidden' }}>
                                <motion.div
                                    initial={{ width: '0%' }}
                                    animate={{ width: isSimulating ? '95%' : '45%' }}
                                    style={{ height: '100%', background: 'var(--danger)' }}
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* redistribution Panel */}
                <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
                    <h3 style={{ margin: 0 }}>Automated Redistribution</h3>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>The following transfers are recommended to stabilize the regional network.</p>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)', marginTop: 'var(--space-sm)' }}>
                        {[
                            { from: 'Central General', to: 'Saints Memorial', count: 8, priority: 'Critical' },
                            { from: 'City Care', to: 'Suburban Hub', count: 14, priority: 'Moderate' },
                        ].map((transfer, i) => (
                            <div key={i} className="glass" style={{ padding: 'var(--space-md)', borderRadius: 'var(--radius-md)' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--primary)' }}>TRANSFER PROPOSAL 0{i + 1}</div>
                                    <span className={`badge badge-${transfer.priority === 'Critical' ? 'danger' : 'warning'}`}>{transfer.priority}</span>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-md)', marginTop: 'var(--space-sm)' }}>
                                    <div style={{ flex: 1 }}>
                                        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>FROM</div>
                                        <div style={{ fontWeight: 600 }}>{transfer.from}</div>
                                    </div>
                                    <ArrowRight size={16} />
                                    <div style={{ flex: 1 }}>
                                        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>TO</div>
                                        <div style={{ fontWeight: 600 }}>{transfer.to}</div>
                                    </div>
                                </div>
                                <div style={{ marginTop: 'var(--space-md)', fontSize: '0.8rem', fontWeight: 700 }}>
                                    Volume: {transfer.count} Patients <span style={{ fontWeight: 400, color: 'var(--text-muted)' }}>(Expected Load Relief: 18%)</span>
                                </div>
                            </div>
                        ))}
                    </div>

                    <button className="btn btn-primary" style={{ marginTop: 'auto', width: '100%' }}>TRIGGER REGIONAL REDISTRIBUTION</button>
                </div>
            </div>

            <div className="card" style={{ background: 'var(--primary-light)', color: 'var(--primary)', border: 'none', display: 'flex', gap: 'var(--space-md)', alignItems: 'center' }}>
                <Info size={24} />
                <p style={{ margin: 0, fontSize: '0.85rem' }}>
                    <strong>Admin Note:</strong> Triggering a regional surge will push mandatory bypass protocols to all GPS/Ambulance services in the cluster.
                </p>
            </div>
        </div>
    );
};

export default SurgeCommand;
