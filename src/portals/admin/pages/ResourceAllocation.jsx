import React, { useState, useMemo } from 'react';
import {
    Zap, Activity, ShieldAlert, Navigation,
    ArrowRight, CheckCircle2, MoreVertical,
    RefreshCw, ChevronRight, Send, AlertCircle,
    UserCircle2, Laptop2, Thermometer, Box
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const MOCK_HOSPITALS = [
    {
        id: 'h1',
        name: 'Apollo Hospitals - Greams Road',
        resources: { ventilators: 45, icuBeds: 120, staff: 85, oxygen: 92 },
        nearby: 'SIMS Hospital'
    },
    {
        id: 'h2',
        name: 'Government General Hospital',
        resources: { ventilators: 30, icuBeds: 250, staff: 150, oxygen: 80 },
        nearby: 'Fortis Malar Hospital'
    },
    {
        id: 'h3',
        name: 'SIMS Hospital',
        resources: { ventilators: 25, icuBeds: 80, staff: 60, oxygen: 88 },
        nearby: 'Apollo Greams Road'
    },
    {
        id: 'h4',
        name: 'Sri Ramachandra Medical Centre',
        resources: { ventilators: 35, icuBeds: 180, staff: 110, oxygen: 95 },
        nearby: 'MIOT International'
    },
    {
        id: 'h5',
        name: 'MIOT International',
        resources: { ventilators: 40, icuBeds: 150, staff: 95, oxygen: 90 },
        nearby: 'Sri Ramachandra'
    },
    {
        id: 'h6',
        name: 'Fortis Malar Hospital',
        resources: { ventilators: 20, icuBeds: 60, staff: 45, oxygen: 85 },
        nearby: 'GGH'
    }
];

const ResourceAllocation = () => {
    const [selectedHospital, setSelectedHospital] = useState(MOCK_HOSPITALS[0]);
    const [allocationStep, setAllocationStep] = useState('idle'); // idle, approving, success
    const [lastTransfer, setLastTransfer] = useState(null);

    const handleTransfer = () => {
        setAllocationStep('approving');
        setTimeout(() => {
            setLastTransfer({
                from: selectedHospital.name,
                to: selectedHospital.nearby,
                time: new Date().toLocaleTimeString()
            });
            setAllocationStep('success');
            setTimeout(() => setAllocationStep('idle'), 4000);
        }, 1500);
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-lg)' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1.8fr', gap: 'var(--space-lg)', minHeight: '600px' }}>

                {/* AI Strategic Intelligence Box */}
                <div className="card" style={{
                    display: 'flex',
                    flexDirection: 'column',
                    padding: 0,
                    overflow: 'hidden',
                    border: '2px solid var(--primary)',
                    boxShadow: 'var(--shadow-xl)'
                }}>
                    <div style={{
                        background: 'linear-gradient(135deg, var(--primary) 0%, var(--primary-dark) 100%)',
                        padding: 'var(--space-md) var(--space-lg)',
                        color: 'white',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '10px'
                    }}>
                        <Zap size={22} color="var(--secondary)" />
                        <h3 style={{ margin: 0, fontSize: '1.1rem', letterSpacing: '0.5px', color: 'white' }}>AI STRATEGIC INTELLIGENCE</h3>
                    </div>

                    <div style={{ flex: 1, padding: 'var(--space-md)', display: 'flex', flexDirection: 'column', gap: 'var(--space-sm)' }}>
                        <div style={{ fontSize: '0.7rem', fontWeight: 900, color: 'var(--text-muted)', marginBottom: '4px' }}>SELECT HOSPITAL NODE</div>
                        {MOCK_HOSPITALS.map((h) => (
                            <motion.div
                                key={h.id}
                                onClick={() => setSelectedHospital(h)}
                                whileHover={{ x: 4 }}
                                style={{
                                    padding: '12px 16px',
                                    borderRadius: '12px',
                                    cursor: 'pointer',
                                    background: selectedHospital?.id === h.id ? 'var(--primary-light)' : 'var(--background)',
                                    border: `1px solid ${selectedHospital?.id === h.id ? 'var(--primary)' : 'var(--surface-border)'}`,
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center',
                                    transition: 'all 0.2s ease'
                                }}
                            >
                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                    <div style={{
                                        width: 8, height: 8, borderRadius: '50%',
                                        background: selectedHospital?.id === h.id ? 'var(--primary)' : 'var(--text-muted)'
                                    }} />
                                    <span style={{
                                        fontSize: '0.85rem',
                                        fontWeight: 700,
                                        color: selectedHospital?.id === h.id ? 'var(--primary-dark)' : 'var(--text-main)'
                                    }}>
                                        {h.name}
                                    </span>
                                </div>
                                <ChevronRight size={16} color={selectedHospital?.id === h.id ? 'var(--primary)' : 'var(--text-muted)'} />
                            </motion.div>
                        ))}

                        <div style={{ marginTop: 'auto', padding: 'var(--space-md)', background: 'var(--background)', borderRadius: '12px', border: '1px dashed var(--surface-border)' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: 'var(--text-muted)' }}>
                                <RefreshCw size={14} className="pulse-alert" />
                                <span style={{ fontSize: '0.7rem', fontWeight: 600 }}>NETWORK SYNC: OPTIMAL</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Resource Details & Control */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-lg)' }}>
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={selectedHospital?.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className="card"
                            style={{ flex: 1, display: 'flex', flexDirection: 'column' }}
                        >
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 'var(--space-xl)' }}>
                                <div>
                                    <h2 style={{ margin: 0, fontSize: '1.5rem', color: 'var(--primary)' }}>{selectedHospital.name}</h2>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '4px' }}>
                                        <Box size={14} color="var(--text-muted)" />
                                        <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>Strategic Resource Unit • ID: {selectedHospital.id.toUpperCase()}</span>
                                    </div>
                                </div>
                                <div className="badge badge-success">STABLE NODE</div>
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-lg)', flex: 1 }}>
                                {[
                                    { label: 'Ventilators', value: selectedHospital.resources.ventilators, max: 50, icon: <Activity size={20} /> },
                                    { label: 'ICU Beds', value: selectedHospital.resources.icuBeds, max: 300, icon: <Box size={20} /> },
                                    { label: 'Staff Capacity', value: selectedHospital.resources.staff, max: 200, icon: <UserCircle2 size={20} /> },
                                    { label: 'Oxygen Supply', value: selectedHospital.resources.oxygen, max: 100, unit: '%', icon: <Thermometer size={20} /> }
                                ].map((res, i) => (
                                    <div key={i} className="glass" style={{ padding: 'var(--space-md)', borderRadius: '16px' }}>
                                        <div style={{ display: 'flex', gap: '12px', alignItems: 'center', marginBottom: '12px' }}>
                                            <div style={{ background: 'var(--primary-light)', padding: '8px', borderRadius: '10px', color: 'var(--primary)' }}>
                                                {res.icon}
                                            </div>
                                            <span style={{ fontWeight: 800, fontSize: '0.9rem', color: 'var(--text-muted)' }}>{res.label}</span>
                                        </div>
                                        <div style={{ fontSize: '1.8rem', fontWeight: 900, marginBottom: '8px' }}>
                                            {res.value}{res.unit || ''}
                                        </div>
                                        <div style={{ height: '6px', background: 'var(--background)', borderRadius: '3px', overflow: 'hidden' }}>
                                            <motion.div
                                                initial={{ width: 0 }}
                                                animate={{ width: `${(res.value / res.max) * 100}%` }}
                                                style={{
                                                    height: '100%',
                                                    background: (res.value / res.max) > 0.8 ? 'var(--warning)' : 'var(--primary)',
                                                    borderRadius: '3px'
                                                }}
                                            />
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div style={{
                                marginTop: 'var(--space-xl)',
                                padding: 'var(--space-lg)',
                                borderRadius: '16px',
                                background: 'linear-gradient(135deg, #1e293b 0%, #334155 100%)',
                                color: 'white',
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                boxShadow: '0 10px 30px rgba(30, 41, 59, 0.2)'
                            }}>
                                <div>
                                    <div style={{ fontWeight: 800, fontSize: '0.8rem', color: '#818cf8', marginBottom: '4px' }}>EXCESS RESOURCE DETECTION</div>
                                    <p style={{ margin: 0, fontSize: '0.85rem', opacity: 0.9, fontWeight: 600 }}>AI detected surplus capacity. Potential to support <strong>{selectedHospital.nearby}</strong>.</p>
                                </div>
                                <button
                                    className="btn"
                                    style={{
                                        background: '#6366f1',
                                        color: 'white',
                                        fontWeight: 900,
                                        padding: '12px 24px',
                                        borderRadius: '12px',
                                        border: 'none',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '8px',
                                        boxShadow: '0 5px 15px rgba(99, 102, 241, 0.3)'
                                    }}
                                    onClick={handleTransfer}
                                    disabled={allocationStep !== 'idle'}
                                >
                                    {allocationStep === 'approving' ? 'APPROVING...' : 'SEND EXCESS'}
                                    <Send size={16} />
                                </button>
                            </div>
                        </motion.div>
                    </AnimatePresence>

                    {/* Operational Feedback */}
                    <AnimatePresence>
                        {lastTransfer && (
                            <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                                className="card glass"
                                style={{ border: 'none', background: 'var(--success-bg)', padding: 'var(--space-md) var(--space-xl)', display: 'flex', alignItems: 'center', gap: 'var(--space-lg)' }}
                            >
                                <CheckCircle2 size={24} color="var(--success)" />
                                <div style={{ flex: 1 }}>
                                    <div style={{ fontWeight: 800, fontSize: '0.9rem', color: 'var(--success-dark)' }}>TRANSFER PROTOCOL AUTHORIZED</div>
                                    <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--success-dark)', opacity: 0.8 }}>
                                        Excess resources from <strong>{lastTransfer.from}</strong> are now being rerouted to <strong>{lastTransfer.to}</strong>. (Sync: {lastTransfer.time})
                                    </p>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 'var(--space-lg)' }}>
                {[
                    { title: 'Global Reserve', value: '412 Units', color: 'var(--primary)' },
                    { title: 'Allocation Velocity', value: '1.2x/hr', color: 'var(--success)' },
                    { title: 'Deficit Risk', value: 'Low', color: 'var(--text-muted)' }
                ].map((stat, i) => (
                    <div key={i} className="card" style={{ textAlign: 'center', padding: 'var(--space-lg)' }}>
                        <div style={{ fontSize: '0.7rem', fontWeight: 800, color: 'var(--text-muted)', marginBottom: '8px' }}>{stat.title.toUpperCase()}</div>
                        <div style={{ fontSize: '1.5rem', fontWeight: 900, color: stat.color }}>{stat.value}</div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default ResourceAllocation;
