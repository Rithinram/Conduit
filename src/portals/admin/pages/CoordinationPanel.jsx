import React from 'react';
import { Truck, Navigation, CheckCircle2, AlertTriangle, ArrowRight, UserCheck, Timer, Info } from 'lucide-react';
import { motion } from 'framer-motion';

const CoordinationPanel = () => {
    const transfers = [
        { id: 'T101', patient: 'Sam K.', from: 'Central General', to: 'Saints Memorial', status: 'In Transit', eta: '12 mins', type: 'Critical' },
        { id: 'T102', patient: 'Lee M.', from: 'City Care', to: 'Suburban Hub', status: 'Pending Approval', eta: '25 mins', type: 'Moderate' },
        { id: 'T103', patient: 'Anna B.', from: 'Central General', to: 'Community Clinic', status: 'Arrived', eta: '0 mins', type: 'Discharge' },
    ];

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-lg)' }}>
            {/* Transfer Pipeline */}
            <div className="card">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-lg)' }}>
                    <h3 style={{ margin: 0 }}>Active Patient Transfers (Network-Wide)</h3>
                    <button className="btn btn-primary" style={{ fontSize: '0.8rem' }}><UserCheck size={16} /> NEW COORDINATION REQUEST</button>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
                    {transfers.map((t) => (
                        <div key={t.id} className="glass" style={{ padding: 'var(--space-md)', borderRadius: 'var(--radius-md)', display: 'grid', gridTemplateColumns: '150px 1fr 1fr 150px', gap: 'var(--space-xl)', alignItems: 'center' }}>
                            <div>
                                <div style={{ fontWeight: 700 }}>{t.patient}</div>
                                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>ID: {t.id}</div>
                                <span className={`badge badge-${t.type === 'Critical' ? 'danger' : t.type === 'Moderate' ? 'warning' : 'success'}`} style={{ marginTop: '8px' }}>{t.type}</span>
                            </div>

                            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-md)' }}>
                                <div style={{ textAlign: 'center' }}>
                                    <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>FROM</div>
                                    <div style={{ fontWeight: 600, fontSize: '0.85rem' }}>{t.from}</div>
                                </div>
                                <ArrowRight size={16} color="var(--primary)" />
                                <div style={{ textAlign: 'center' }}>
                                    <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>TO</div>
                                    <div style={{ fontWeight: 600, fontSize: '0.85rem' }}>{t.to}</div>
                                </div>
                            </div>

                            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-md)' }}>
                                <Timer size={18} color="var(--primary)" />
                                <div>
                                    <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>EST. TRAVEL TIME</div>
                                    <div style={{ fontWeight: 700 }}>{t.eta}</div>
                                </div>
                            </div>

                            <div style={{ textAlign: 'right' }}>
                                <div style={{ fontSize: '0.75rem', fontWeight: 700, color: t.status === 'Arrived' ? 'var(--success)' : 'var(--primary)' }}>{t.status.toUpperCase()}</div>
                                <button className="btn glass" style={{ marginTop: '8px', fontSize: '0.7rem', padding: '0.4rem 0.8rem' }}>TRACK UNIT</button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.5fr', gap: 'var(--space-lg)' }}>
                {/* Logistics Optimization */}
                <div className="card">
                    <h4>Ambulance Fleet Status</h4>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-lg)', marginTop: 'var(--space-md)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-sm)' }}>
                                <Truck size={20} color="var(--success)" />
                                <span style={{ fontSize: '0.85rem' }}>Available Units</span>
                            </div>
                            <span style={{ fontWeight: 800 }}>14</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-sm)' }}>
                                <Truck size={20} color="var(--primary)" />
                                <span style={{ fontSize: '0.85rem' }}>Active Transfers</span>
                            </div>
                            <span style={{ fontWeight: 800 }}>8</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-sm)' }}>
                                <AlertTriangle size={20} color="var(--warning)" />
                                <span style={{ fontSize: '0.85rem' }}>Maintenance</span>
                            </div>
                            <span style={{ fontWeight: 800 }}>2</span>
                        </div>
                    </div>
                </div>

                {/* Coordination Nudges */}
                <div className="card" style={{ background: 'var(--text-main)', color: 'white' }}>
                    <div style={{ display: 'flex', gap: 'var(--space-md)' }}>
                        <Navigation size={32} color="var(--primary)" />
                        <div>
                            <h4 style={{ margin: 0 }}>Smart Routing Engine</h4>
                            <p style={{ margin: '8px 0 0 0', fontSize: '0.85rem', opacity: 0.8 }}>
                                Current traffic patterns suggest <strong>Suburban General</strong> is best reached via the East Corridor to avoid the construction surge on Main St. GPS updates pushed to all active units.
                            </p>
                            <div className="card glass" style={{ border: 'none', background: 'rgba(255,255,255,0.05)', marginTop: 'var(--space-lg)' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                    <span style={{ fontSize: '0.75rem', opacity: 0.7 }}>Voluntary Load Participant</span>
                                    <span style={{ color: 'var(--success)', fontWeight: 700 }}>+8 Users Today</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="card glass" style={{ border: 'none', background: 'var(--primary-light)', color: 'var(--primary)', display: 'flex', gap: 'var(--space-md)', alignItems: 'center' }}>
                <Info size={20} />
                <p style={{ margin: 0, fontSize: '0.85rem' }}>
                    <strong>Logistics Note:</strong> Regional inter-hospital coordination has reduced wait-time inequalities across the city by 35% in the last 4 hours.
                </p>
            </div>
        </div>
    );
};

export default CoordinationPanel;
