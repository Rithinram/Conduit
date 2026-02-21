import React from 'react';
import { Bed, UserMinus, Activity, ShieldAlert, CheckCircle2, AlertTriangle, TrendingDown } from 'lucide-react';
import { motion } from 'framer-motion';

const BedOptimization = () => {
    const stats = [
        { label: 'Total Beds', value: 250, sub: '88% Occupied' },
        { label: 'ICU Capacity', value: '4/45', sub: 'Critical Level', status: 'danger' },
        { label: 'Est. Discharges', value: 12, sub: 'Next 4 Hours', status: 'success' },
    ];

    const dischargeCandidates = [
        { id: 'c1', name: 'Michael Chen', unit: 'Ward B-12', progress: 95, stay: '5 days' },
        { id: 'c2', name: 'Elena Rodriguez', unit: 'Ward A-04', progress: 92, stay: '3 days' },
        { id: 'c3', name: 'Samuel Wilson', unit: 'ICU-08', progress: 85, stay: '8 days', triage: 'ICU -> Ward' },
    ];

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-lg)' }}>
            {/* Top Stats */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 'var(--space-lg)' }}>
                {stats.map((s, i) => (
                    <div key={i} className="card" style={{ borderLeft: s.status ? `4px solid var(--${s.status})` : 'none' }}>
                        <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>{s.label}</div>
                        <div style={{ fontSize: '2rem', fontWeight: 800, margin: '4px 0' }}>{s.value}</div>
                        <div style={{ fontSize: '0.75rem', color: s.status === 'danger' ? 'var(--danger)' : 'var(--text-muted)', fontWeight: 600 }}>{s.sub}</div>
                    </div>
                ))}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: 'var(--space-lg)' }}>
                {/* Discharge Optimizer */}
                <div className="card">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-lg)' }}>
                        <h3 style={{ margin: 0 }}>Predictive Discharge Optimizer</h3>
                        <button className="btn btn-primary" style={{ fontSize: '0.75rem' }}><CheckCircle2 size={14} /> AUTO-INITIATE DISCHARGE</button>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
                        {dischargeCandidates.map((c, i) => (
                            <div key={c.id} className="glass" style={{ padding: 'var(--space-md)', borderRadius: 'var(--radius-md)' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <div>
                                        <div style={{ fontWeight: 700 }}>{c.name}</div>
                                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{c.unit} • Length of Stay: {c.stay}</div>
                                    </div>
                                    {c.triage ? (
                                        <span className="badge badge-warning">{c.triage}</span>
                                    ) : (
                                        <span className="badge badge-success">READY</span>
                                    )}
                                </div>
                                <div style={{ marginTop: 'var(--space-sm)' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', color: 'var(--text-muted)', marginBottom: '4px' }}>
                                        <span>Recovery Profile</span>
                                        <span>{c.progress}%</span>
                                    </div>
                                    <div style={{ height: '6px', background: 'var(--surface-border)', borderRadius: '3px' }}>
                                        <motion.div
                                            initial={{ width: 0 }}
                                            animate={{ width: `${c.progress}%` }}
                                            style={{ height: '100%', background: 'var(--success)', borderRadius: '3px' }}
                                        />
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* ICU High-Densitity Monitor */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-lg)' }}>
                    <div className="card" style={{ background: 'var(--danger-bg)', border: '1px solid var(--danger)' }}>
                        <div style={{ display: 'flex', gap: 'var(--space-md)' }}>
                            <ShieldAlert size={24} color="var(--danger)" />
                            <div>
                                <h4 style={{ margin: 0, color: 'var(--danger)' }}>ICU Critical Lockdown</h4>
                                <p style={{ margin: '4px 0 0 0', fontSize: '0.8rem', color: '#991b1b' }}>
                                    ICU capacity is at 91%. Automatic lockdown protocol: All elective surgeries requiring post-op ICU are deferred for 48h.
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="card">
                        <h4>Transfer Optimization</h4>
                        <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
                            Recommended patient transfers to step-down units to free critical care beds.
                        </p>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)', marginTop: 'var(--space-md)' }}>
                            <div style={{ padding: 'var(--space-md)', background: 'var(--background)', borderRadius: 'var(--radius-md)', display: 'flex', alignItems: 'center', gap: 'var(--space-md)' }}>
                                <TrendingDown size={20} color="var(--success)" />
                                <div style={{ flex: 1 }}>
                                    <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>Divert to Step-Down</div>
                                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Potential to free 3 ICU beds in &lt;1h</div>
                                </div>
                                <button className="btn btn-primary" style={{ fontSize: '0.7rem', padding: '0.4rem 0.8rem' }}>EXECUTE</button>
                            </div>
                        </div>
                    </div>

                    <div className="card glass" style={{ border: 'none', background: 'var(--primary-light)', color: 'var(--primary)' }}>
                        <div style={{ display: 'flex', gap: 'var(--space-sm)', alignItems: 'center' }}>
                            <Activity size={18} />
                            <div style={{ fontWeight: 700, fontSize: '0.9rem' }}>Live Bed Sensor: ACTIVE</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default BedOptimization;
