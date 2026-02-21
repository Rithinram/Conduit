import React, { useState } from 'react';
import { Bed, UserMinus, Activity, ShieldAlert, CheckCircle2, AlertTriangle, TrendingDown, Zap, Clock, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const BedOptimization = () => {
    const [isAutoDischarging, setIsAutoDischarging] = useState(false);
    const [dischargedCount, setDischargedCount] = useState(0);

    const handleAutoDischarge = () => {
        setIsAutoDischarging(true);
        setTimeout(() => {
            setIsAutoDischarging(false);
            setDischargedCount(prev => prev + 12);
        }, 2500);
    };

    const stats = [
        {
            label: 'Total Beds',
            value: 250,
            sub: '88% Occupied',
            gradient: 'linear-gradient(135deg, #0ea5e9 0%, #2563eb 100%)'
        },
        {
            label: 'ICU Capacity',
            value: '4/45',
            sub: 'Critical Level',
            status: 'danger',
            gradient: 'linear-gradient(135deg, #f43f5e 0%, #e11d48 100%)'
        },
        {
            label: 'Est. Discharges',
            value: isAutoDischarging ? '...' : (12 - dischargedCount < 0 ? 0 : 12 - dischargedCount),
            sub: 'Optimized Flow',
            status: 'success',
            gradient: 'linear-gradient(135deg, #10b981 0%, #059669 100%)'
        },
    ];

    const dischargeCandidates = [
        { id: 'c1', name: 'Michael Chen', unit: 'Ward B-12', progress: 95, stay: '5 days', color: '#10b981' },
        { id: 'c2', name: 'Elena Rodriguez', unit: 'Ward A-04', progress: 92, stay: '3 days', color: '#3b82f6' },
        { id: 'c3', name: 'Samuel Wilson', unit: 'ICU-08', progress: 85, stay: '8 days', triage: 'ICU -> Ward', color: '#f59e0b' },
    ];

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-lg)', height: '100%' }}>
            {/* Top Stats */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 'var(--space-lg)' }}>
                {stats.map((s, i) => (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.1 }}
                        key={i}
                        className="card"
                        style={{
                            background: s.gradient,
                            color: 'white',
                            border: 'none',
                            boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)'
                        }}
                    >
                        <div style={{ fontSize: '0.85rem', opacity: 0.9, fontWeight: 600 }}>{s.label.toUpperCase()}</div>
                        <div style={{ fontSize: '2.4rem', fontWeight: 900, margin: '8px 0', letterSpacing: '-1px' }}>{s.value}</div>
                        <div style={{
                            fontSize: '0.7rem',
                            background: 'rgba(255,255,255,0.2)',
                            padding: '4px 8px',
                            borderRadius: '6px',
                            display: 'inline-block',
                            fontWeight: 800
                        }}>
                            {s.sub}
                        </div>
                    </motion.div>
                ))}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: 'var(--space-lg)', flex: 1 }}>
                {/* Discharge Optimizer */}
                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="card"
                    style={{
                        display: 'flex',
                        flexDirection: 'column',
                        background: 'linear-gradient(135deg, rgba(255,255,255,0.95) 0%, rgba(248,250,252,0.95) 100%)',
                        border: '1px solid #e2e8f0',
                        position: 'relative',
                        overflow: 'hidden'
                    }}
                >
                    <div style={{ position: 'absolute', top: 0, left: 0, width: '4px', height: '100%', background: 'linear-gradient(to bottom, #3b82f6, #10b981)' }} />
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-xl)', padding: '0 8px' }}>
                        <div>
                            <h3 style={{ margin: 0, fontWeight: 950, fontSize: '1.2rem', color: '#1e293b' }}>PREDICTIVE DISCHARGE OPTIMIZER</h3>
                            <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>Institutional Flow Optimization Hub</p>
                        </div>
                        <button
                            className="btn"
                            disabled={isAutoDischarging}
                            onClick={handleAutoDischarge}
                            style={{
                                background: isAutoDischarging ? '#e2e8f0' : '#0f172a',
                                color: isAutoDischarging ? '#64748b' : 'white',
                                fontWeight: 900,
                                fontSize: '0.7rem',
                                padding: '12px 20px',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px',
                                transition: 'all 0.3s ease'
                            }}
                        >
                            {isAutoDischarging ? (
                                <>
                                    <Clock size={14} className="animate-spin" /> SYNCHRONIZING...
                                </>
                            ) : (
                                <>
                                    <Zap size={14} fill="currentColor" /> AUTO-INITIATE DISCHARGE
                                </>
                            )}
                        </button>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
                        {dischargeCandidates.map((c, i) => (
                            <motion.div
                                whileHover={{ scale: 1.01, x: 5 }}
                                key={c.id}
                                className="glass"
                                style={{
                                    padding: '20px',
                                    borderRadius: '16px',
                                    border: `1px solid ${c.color}33`,
                                    background: `linear-gradient(90deg, white 0%, ${c.color}05 100%)`
                                }}
                            >
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                        <div style={{ width: 40, height: 40, borderRadius: '10px', background: `${c.color}22`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                            <Bed size={20} color={c.color} />
                                        </div>
                                        <div>
                                            <div style={{ fontWeight: 800, color: '#1e293b' }}>{c.name}</div>
                                            <div style={{ fontSize: '0.7rem', color: '#64748b', fontWeight: 600 }}>{c.unit} • Stay: {c.stay}</div>
                                        </div>
                                    </div>
                                    <div style={{ textAlign: 'right' }}>
                                        {c.triage ? (
                                            <span style={{ fontSize: '0.65rem', fontWeight: 900, background: '#fff7ed', color: '#c2410c', padding: '4px 8px', borderRadius: '6px' }}>{c.triage}</span>
                                        ) : (
                                            <span style={{ fontSize: '0.65rem', fontWeight: 900, background: '#f0fdf4', color: '#15803d', padding: '4px 8px', borderRadius: '6px' }}>READY FOR RELEASE</span>
                                        )}
                                    </div>
                                </div>
                                <div style={{ marginTop: '16px' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.65rem', color: '#64748b', marginBottom: '6px', fontWeight: 700 }}>
                                        <span>CLINICAL RECOVERY PROFILE</span>
                                        <span style={{ color: c.color }}>{c.progress}%</span>
                                    </div>
                                    <div style={{ height: '8px', background: '#f1f5f9', borderRadius: '4px', overflow: 'hidden' }}>
                                        <motion.div
                                            initial={{ width: 0 }}
                                            animate={{ width: `${c.progress}%` }}
                                            transition={{ duration: 1, delay: 0.5 + (i * 0.1) }}
                                            style={{ height: '100%', background: c.color, borderRadius: '4px' }}
                                        />
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </motion.div>

                {/* ICU High-Densitity Monitor */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-lg)' }}>
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{
                            opacity: 1, x: 0,
                            boxShadow: ['0 0 0px rgba(244,63,94,0)', '0 0 25px rgba(244,63,94,0.3)', '0 0 0px rgba(244,63,94,0)']
                        }}
                        transition={{ opacity: { duration: 0.5 }, x: { duration: 0.5 }, boxShadow: { duration: 2, repeat: Infinity } }}
                        className="card"
                        style={{ background: 'linear-gradient(135deg, #fff1f2 0%, #fee2e2 100%)', border: '2px solid #fda4af', padding: '24px' }}
                    >
                        <div style={{ display: 'flex', gap: '16px' }}>
                            <div style={{ background: 'linear-gradient(135deg, #f43f5e 0%, #e11d48 100%)', padding: '12px', borderRadius: '12px', boxShadow: '0 4px 12px rgba(225,29,72,0.2)' }}>
                                <ShieldAlert size={24} color="white" />
                            </div>
                            <div>
                                <h4 style={{ margin: 0, color: '#9f1239', fontWeight: 950, letterSpacing: '-0.5px' }}>ICU CRITICAL LOCKDOWN</h4>
                                <p style={{ margin: '6px 0 0 0', fontSize: '0.86rem', color: '#be123c', lineHeight: 1.5, fontWeight: 700 }}>
                                    Institutional capacity has breached **91% threshold**. Selective deferral protocols are now active for all non-critical procedural admissions.
                                </p>
                            </div>
                        </div>
                    </motion.div>

                    <div className="card" style={{ padding: '24px', background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)', border: '1px solid #e2e8f0', position: 'relative', overflow: 'hidden' }}>
                        <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '4px', background: 'linear-gradient(to right, #6366f1, #a855f7)' }} />
                        <h4 style={{ margin: '0 0 8px 0', fontWeight: 950, color: '#1e293b' }}>TRANSFER OPTIMIZATION</h4>
                        <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600, marginBottom: '20px' }}>
                            Recommended inter-ward movements to stabilize critical care density.
                        </p>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                            <div style={{ padding: '16px', background: 'linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)', borderRadius: '16px', border: '1px solid #bbf7d0', display: 'flex', alignItems: 'center', gap: '16px' }}>
                                <div style={{ background: 'white', padding: '10px', borderRadius: '10px', boxShadow: '0 2px 8px rgba(21,128,61,0.1)' }}>
                                    <TrendingDown size={20} color="#15803d" />
                                </div>
                                <div style={{ flex: 1 }}>
                                    <div style={{ fontWeight: 900, fontSize: '0.85rem', color: '#14532d' }}>DIVERT TO STEP-DOWN</div>
                                    <div style={{ fontSize: '0.7rem', color: '#166534', fontWeight: 700 }}>Freeing 3 ICU slots available</div>
                                </div>
                                <button className="btn" style={{ background: '#166534', color: 'white', fontSize: '0.65rem', fontWeight: 900, padding: '8px 16px', borderRadius: '8px' }}>EXECUTE</button>
                            </div>
                        </div>
                    </div>

                    <div className="card" style={{
                        background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)',
                        color: 'white',
                        border: 'none',
                        padding: '20px'
                    }}>
                        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                            <div className="animate-pulse" style={{ width: 10, height: 10, borderRadius: '50%', background: '#4ade80', boxShadow: '0 0 10px #4ade80' }}></div>
                            <div style={{ fontWeight: 900, fontSize: '0.85rem', letterSpacing: '0.5px' }}>LIVE SENSOR NETWORK: CONNECTED</div>
                            <Activity size={18} style={{ marginLeft: 'auto', opacity: 0.5 }} />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default BedOptimization;
