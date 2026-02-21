import React, { useState } from 'react';
import {
    ShieldAlert, Zap, Users, BarChart, AlertTriangle,
    ArrowRight, CornerUpRight, Info, X, Activity,
    Thermometer, Flame, Shield, Globe, MapPin,
    CheckCircle2, Loader2, TrendingUp, Clock
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    AreaChart, Area, XAxis, YAxis, CartesianGrid,
    Tooltip, ResponsiveContainer
} from 'recharts';

const chartData = [
    { time: '08:00', icu: 12, overflow: 5, redistribute: 2 },
    { time: '09:00', icu: 18, overflow: 8, redistribute: 4 },
    { time: '10:00', icu: 25, overflow: 15, redistribute: 8 },
    { time: '11:00', icu: 32, overflow: 22, redistribute: 15 },
    { time: '12:00', icu: 45, overflow: 35, redistribute: 28 },
    { time: '13:00', icu: 38, overflow: 30, redistribute: 22 },
];

const SurgeManagement = () => {
    const [surgeActive, setSurgeActive] = useState(false);
    const [strictness, setStrictness] = useState(50); // 0-100
    const [activeDialog, setActiveDialog] = useState(null);
    const [alertMessage, setAlertMessage] = useState({ title: '', body: '', icon: null });
    const [isProcessing, setIsProcessing] = useState(false);

    const showAlert = (title, body, icon = <CheckCircle2 size={40} color="var(--success)" />) => {
        setAlertMessage({ title, body, icon });
        setActiveDialog('alert');
    };

    const handleSurgeToggle = () => {
        setIsProcessing(true);
        setTimeout(() => {
            setSurgeActive(!surgeActive);
            setIsProcessing(false);
            showAlert(
                surgeActive ? 'Surge Mode Deactivated' : 'SURGE PROTOCOL ACTIVE',
                surgeActive ? 'Hospital returning to standard clinical protocols.' : 'Advanced triage and resource mobilization initiated.',
                surgeActive ? <Shield size={40} color="var(--primary)" /> : <Flame size={40} color="var(--danger)" />
            );
        }, 1500);
    };

    const handleRedistribute = (hospital) => {
        showAlert(
            'Redistribution Initiated',
            `Diverting incoming ESI 3-5 cases to ${hospital}. Traffic optimization synced with EMS.`,
            <Globe size={40} color="var(--primary)" />
        );
    };

    const incomingPatients = [
        { id: 1, name: 'ESI 2: Cardiac', eta: '4m', status: 'En Route' },
        { id: 2, name: 'ESI 3: Resp Dist', eta: '8m', status: 'Diverting' },
        { id: 3, name: 'ESI 1: Trauma', eta: '2m', status: 'Critical' },
        { id: 4, name: 'ESI 4: Minor', eta: '15m', status: 'Delayed' },
    ];

    const getStrictnessLabel = (val) => {
        if (val < 30) return { label: 'OPTIMIZED', color: 'var(--success)' };
        if (val < 70) return { label: 'CONSERVATIVE', color: 'var(--warning)' };
        return { label: 'STRICT / CRITICAL', color: 'var(--danger)' };
    };

    const statusObj = getStrictnessLabel(strictness);

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-lg)' }}>
            {/* Surge Activation Header */}
            <motion.div
                animate={{
                    background: surgeActive ? 'var(--danger)' : 'var(--background)',
                    color: surgeActive ? 'white' : 'var(--text-main)',
                    borderColor: surgeActive ? 'var(--danger)' : 'var(--surface-border)'
                }}
                className="card"
                style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: 'var(--space-xl)', border: '2px solid transparent' }}
            >
                <div style={{ display: 'flex', gap: 'var(--space-xl)', alignItems: 'center' }}>
                    {surgeActive ? <Flame size={48} className="animate-pulse" /> : <ShieldAlert size={48} color="var(--primary)" />}
                    <div>
                        <h2 style={{ margin: 0 }}>SURGE MODE: {surgeActive ? 'ACTIVE' : 'READY'}</h2>
                        <p style={{ margin: '4px 0 0 0', opacity: 0.8 }}>
                            Global Threshold: 92% | Current Intensity: {surgeActive ? 'CRITICAL' : 'NOMINAL'}
                        </p>
                    </div>
                </div>
                <button
                    className={`btn ${surgeActive ? 'glass' : 'btn-primary'}`}
                    style={{ padding: '1rem 2.5rem', fontWeight: 800, color: surgeActive ? 'white' : 'white' }}
                    onClick={handleSurgeToggle}
                    disabled={isProcessing}
                >
                    {isProcessing ? <Loader2 className="animate-spin" /> : surgeActive ? 'DEACTIVATE PROTOCOL' : 'ACTIVATE SURGE'}
                </button>
            </motion.div>

            <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: 'var(--space-lg)' }}>
                {/* Advanced Diagnostics Graph */}
                <div className="card">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-lg)' }}>
                        <h3 style={{ margin: 0 }}>Surge Impact Analytics</h3>
                        <div style={{ display: 'flex', gap: '8px' }}>
                            <span className="badge badge-danger">ICU REQS</span>
                            <span className="badge badge-warning">OVERFLOW</span>
                        </div>
                    </div>
                    <div style={{ height: '320px', width: '100%' }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={chartData}>
                                <defs>
                                    <linearGradient id="colorIcu" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="var(--danger)" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="var(--danger)" stopOpacity={0} />
                                    </linearGradient>
                                    <linearGradient id="colorOverflow" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="var(--warning)" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="var(--warning)" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--surface-border)" />
                                <XAxis dataKey="time" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: surgeActive ? '#ccc' : '#666' }} />
                                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: surgeActive ? '#ccc' : '#666' }} />
                                <Tooltip
                                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: 'var(--shadow-lg)', background: 'white', color: 'black' }}
                                />
                                <Area type="monotone" dataKey="icu" stroke="var(--danger)" fillOpacity={1} fill="url(#colorIcu)" strokeWidth={3} />
                                <Area type="monotone" dataKey="overflow" stroke="var(--warning)" fillOpacity={1} fill="url(#colorOverflow)" strokeWidth={3} />
                                <Area type="monotone" dataKey="redistribute" stroke="var(--primary)" fill="transparent" strokeWidth={2} strokeDasharray="5 5" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Strictness & Triage Control */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-lg)' }}>
                    <div className="card">
                        <h3 style={{ margin: '0 0 var(--space-md) 0' }}>Triage Strictness</h3>
                        <div style={{ background: 'var(--background)', padding: 'var(--space-lg)', borderRadius: '16px', textAlign: 'center' }}>
                            <div style={{ fontSize: '1.2rem', fontWeight: 800, color: statusObj.color, marginBottom: 'var(--space-md)' }}>
                                {statusObj.label}
                            </div>
                            <input
                                type="range"
                                min="0" max="100"
                                value={strictness}
                                onChange={(e) => setStrictness(parseInt(e.target.value))}
                                style={{ width: '100%', cursor: 'pointer', height: '8px', borderRadius: '4px', accentColor: statusObj.color }}
                            />
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '8px', fontWeight: 700 }}>
                                <span>RELAXED</span>
                                <span>BALANCED</span>
                                <span>CRITICAL</span>
                            </div>
                        </div>
                        <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: 'var(--space-md)' }}>
                            Adjusting strictness automatically updates ER prioritization algorithms for all incoming clinical cases.
                        </p>
                    </div>

                    <div className="card" style={{ background: 'var(--text-main)', color: 'white' }}>
                        <div style={{ display: 'flex', gap: 'var(--space-md)', alignItems: 'center', marginBottom: 'var(--space-md)' }}>
                            <TrendingUp color="var(--success)" size={24} />
                            <h4 style={{ margin: 0 }}>Surge Cause Analysis</h4>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                                <span style={{ opacity: 0.7 }}>Regional Incident:</span>
                                <span style={{ fontWeight: 700 }}>45% Impact</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                                <span style={{ opacity: 0.7 }}>Post-Festival Flux:</span>
                                <span style={{ fontWeight: 700 }}>22% Impact</span>
                            </div>
                            <div style={{ height: '4px', background: 'rgba(255,255,255,0.1)', borderRadius: '2px', overflow: 'hidden' }}>
                                <motion.div animate={{ width: '67%' }} style={{ height: '100%', background: 'var(--success)' }} />
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-lg)' }}>
                {/* Hospital Redistribution Hub */}
                <div className="card">
                    <h3 style={{ marginBottom: 'var(--space-lg)' }}>Hospital Redistribution Hub</h3>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 'var(--space-md)' }}>
                        {[
                            { name: 'St. Jude Annex', type: 'Urgent Hub', load: 12 },
                            { name: 'City General', type: 'Tertiary', load: 45 },
                            { name: 'Metro Health', type: 'Trauma', load: 68 },
                        ].map((hosp) => (
                            <div key={hosp.name} className="glass" style={{ padding: 'var(--space-md)', borderRadius: '16px', textAlign: 'center' }}>
                                <MapPin size={24} color="var(--primary)" style={{ marginBottom: '8px' }} />
                                <div style={{ fontWeight: 700, fontSize: '0.85rem' }}>{hosp.name}</div>
                                <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', marginBottom: '12px' }}>{hosp.type} • {hosp.load}%</div>
                                <button
                                    className="btn btn-primary"
                                    style={{ width: '100%', fontSize: '0.65rem', padding: '6px' }}
                                    onClick={() => handleRedistribute(hosp.name)}
                                >
                                    REDISTRIBUTE
                                </button>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Incoming Patient Feed */}
                <div className="card">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-lg)' }}>
                        <h3 style={{ margin: 0 }}>Live Incoming Feed</h3>
                        <Activity size={18} className="animate-pulse" color="var(--danger)" />
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-sm)' }}>
                        {incomingPatients.map((p) => (
                            <div key={p.id} className="glass" style={{ padding: '10px 16px', borderRadius: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                                    <Clock size={16} color="var(--text-muted)" />
                                    <div>
                                        <div style={{ fontWeight: 700, fontSize: '0.85rem' }}>{p.name}</div>
                                        <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>ETA: {p.eta} • {p.status}</div>
                                    </div>
                                </div>
                                <div className={`badge ${p.status === 'Critical' ? 'badge-danger' : 'badge-primary'}`} style={{ fontSize: '0.6rem' }}>
                                    {p.status.toUpperCase()}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Global Command Actions */}
            <div className="card glass" style={{ borderColor: 'var(--danger)', padding: 'var(--space-lg)' }}>
                <div style={{ display: 'flex', gap: 'var(--space-md)', flexWrap: 'wrap' }}>
                    <button className="btn btn-secondary" onClick={() => showAlert('ICU Locked', 'Access restricted to ESI 1/2 critical cases only.')}>LOCK ICU</button>
                    <button className="btn btn-secondary" onClick={() => showAlert('Protocol Updated', 'Strict Urgency-Only triage initiated.')}>STRICT TRIAGE</button>
                    <button className="btn btn-secondary" onClick={() => showAlert('Facility Expansion', 'Day-ward converted to ER-B. 12 beds added.')}>DEPLOY TENTS</button>
                    <button className="btn btn-primary" style={{ marginLeft: 'auto' }} onClick={() => showAlert('Network Alert', 'Cross-hospital redistribution signals sent.')}>INITIATE NETWORK SYNC</button>
                </div>
            </div>

            {/* Centralized Alert Modal */}
            <AnimatePresence>
                {activeDialog === 'alert' && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} style={modalOverlayStyle} onClick={() => setActiveDialog(null)}>
                        <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }} style={{ ...modalContentStyle, textAlign: 'center' }} onClick={e => e.stopPropagation()}>
                            <div style={{ marginBottom: 'var(--space-md)' }}>
                                {alertMessage.icon}
                            </div>
                            <h3 style={{ margin: '0 0 8px 0' }}>{alertMessage.title}</h3>
                            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: 'var(--space-xl)' }}>
                                {alertMessage.body}
                            </p>
                            <button className="btn btn-primary" style={{ width: '100%' }} onClick={() => setActiveDialog(null)}>UNDERSTOOD</button>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

// Common Modal Styles
const modalOverlayStyle = {
    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
    background: 'rgba(0,0,0,0.5)', zIndex: 1000,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    backdropFilter: 'blur(4px)'
};

const modalContentStyle = {
    width: '440px', background: 'white', borderRadius: '24px',
    padding: 'var(--space-xl)', boxShadow: 'var(--shadow-lg)',
    border: '1px solid var(--surface-border)'
};

export default SurgeManagement;
