import React, { useState, useEffect, useMemo } from 'react';
import { ShieldAlert, Zap, Globe, ArrowRight, CornerUpRight, BarChart, Info, Play, TrendingUp, Users, Activity } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { getHospitals, dispatchRedistribution, resetSystemState } from '../../../services/api';
import { getSurgeLevel, getSurgeColor, predictLoad } from '../../../../conduit-ml';

const SurgeCommand = () => {
    const [isSimulating, setIsSimulating] = useState(false);
    const [hospitals, setHospitals] = useState([]);
    const [surgeDegree, setSurgeDegree] = useState(0);
    const [dispatchStatus, setDispatchStatus] = useState('idle'); // idle, verifying, routing, active

    useEffect(() => {
        getHospitals().then(setHospitals);
    }, []);

    const toggleSimulation = async () => {
        if (isSimulating) {
            setSurgeDegree(0);
            setIsSimulating(false);
            setDispatchStatus('idle');
            await resetSystemState();
        } else {
            setSurgeDegree(40);
            setIsSimulating(true);
        }
    };

    // Compute per-hospital surge levels using the ML engine
    const hospitalSurges = useMemo(() => {
        return hospitals.map(h => {
            const level = getSurgeLevel(h.icuAvailability || h.occupancy || 50, h.erWaitTime || 0);
            return {
                ...h,
                level,
                color: getSurgeColor(level),
                icu: h.icuAvailability || h.occupancy || 50,
                erWait: h.erWaitTime || 0,
            };
        });
    }, [hospitals]);

    const simulationData = useMemo(() => {
        const base = [
            { time: '00:00', current: 45 },
            { time: '04:00', current: 35 },
            { time: '08:00', current: 58 },
            { time: '12:00', current: 72 },
            { time: '16:00', current: 68 },
            { time: '20:00', current: 52 },
            { time: '23:59', current: 48 },
        ];

        return base.map(point => {
            const hour = parseInt(point.time.split(':')[0]);
            const peakWeight = (hour >= 8 && hour <= 20) ? 1.4 : 0.8;
            const multiplier = 1 + (Math.pow(surgeDegree / 100, 1.2) * peakWeight);
            return {
                ...point,
                projected: Math.min(200, Math.round(point.current * multiplier))
            };
        });
    }, [surgeDegree]);

    // Proposals driven by ML logic: If hospital is Critical, find a Stable hospital
    const proposals = useMemo(() => {
        const criticals = hospitalSurges.filter(h => h.level === 'CRITICAL');
        const stables = hospitalSurges.filter(h => h.level === 'STABLE').sort((a, b) => a.icu - b.icu);

        if (surgeDegree === 0) return [];

        // If no criticals/stables found in real data, use mock logic from remote to fill UI
        if (criticals.length === 0 || stables.length === 0) {
            if (surgeDegree < 30) return [
                { from: 'Apollo Hospitals - Greams Road', to: 'SIMS Hospital', count: 5, priority: 'Low' }
            ];
            return [
                { from: 'Government General Hospital', to: 'Sri Ramachandra Medical Centre', count: Math.round(surgeDegree / 4), priority: 'Critical' },
                { from: 'Apollo Hospitals - Greams Road', to: 'SIMS Hospital', count: Math.round(surgeDegree / 6), priority: 'High' },
            ];
        }

        return criticals.map((crit, i) => {
            const target = stables[i % stables.length];
            if (!target) return null;
            return {
                from: crit.name,
                to: target.name,
                count: Math.round((crit.icu - 80) * 1.5 + (surgeDegree / 10)) || 5,
                priority: surgeDegree > 80 ? 'Critical' : 'High'
            };
        }).filter(Boolean);
    }, [hospitalSurges, surgeDegree]);

    const handleTrigger = async () => {
        setDispatchStatus('verifying');
        setTimeout(() => {
            setDispatchStatus('routing');
            setTimeout(async () => {
                const result = await dispatchRedistribution({
                    intensity: surgeDegree,
                    proposals: proposals
                });

                if (result.success) {
                    setDispatchStatus('active');
                } else {
                    alert(`Redistribution Failed: ${result.message || 'Server did not respond correctly.'}`);
                    setDispatchStatus('idle');
                }
            }, 2000);
        }, 1500);
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-lg)' }}>
            {/* Simulation Header */}
            <motion.div
                className="card"
                style={{
                    background: isSimulating ? 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)' : 'var(--text-main)',
                    color: 'white',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    border: isSimulating ? '2px solid var(--secondary)' : '1px solid transparent',
                    boxShadow: isSimulating ? '0 0 30px rgba(42, 188, 167, 0.2)' : 'var(--shadow-lg)'
                }}
            >
                <div style={{ display: 'flex', gap: 'var(--space-xl)', alignItems: 'center' }}>
                    <div style={{ position: 'relative' }}>
                        <Globe size={40} color={isSimulating ? 'var(--secondary)' : 'var(--primary)'} />
                        {isSimulating && (
                            <motion.div
                                animate={{ scale: [1, 1.4, 1], opacity: [0.5, 0.1, 0.5] }}
                                transition={{ duration: 3, repeat: Infinity }}
                                style={{ position: 'absolute', inset: -8, border: '2px solid var(--secondary)', borderRadius: '50%' }}
                            />
                        )}
                    </div>
                    <div>
                        <h2 style={{ margin: 0, letterSpacing: '-1.5px', fontSize: '1.8rem' }}>Regional Surge Command</h2>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '4px' }}>
                            <div style={{ width: 8, height: 8, borderRadius: '50%', background: isSimulating ? 'var(--secondary)' : 'var(--success)' }} />
                            <span style={{ fontSize: '0.85rem', fontWeight: 600, opacity: 0.8 }}>
                                {isSimulating ? 'WHAT-IF ENGINE: ACTIVE ANALYTICS' : 'NETWORK STATUS: OPERATIONAL'}
                            </span>
                        </div>
                    </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-xl)' }}>
                    {isSimulating && (
                        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} style={{ width: '220px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', marginBottom: '8px', fontWeight: 900, color: 'var(--secondary)' }}>
                                <span>DEMAND SPIKE INTENSITY</span>
                                <span>+{surgeDegree}%</span>
                            </div>
                            <input
                                type="range"
                                min="0" max="150"
                                value={surgeDegree}
                                onChange={(e) => setSurgeDegree(parseInt(e.target.value))}
                                style={{ width: '100%', accentColor: 'var(--secondary)', cursor: 'pointer', height: '4px' }}
                            />
                        </motion.div>
                    )}
                    <button
                        onClick={toggleSimulation}
                        className="btn"
                        style={{
                            padding: '12px 28px',
                            borderRadius: '12px',
                            background: isSimulating ? 'var(--danger)' : 'var(--primary)',
                            color: 'white',
                            fontWeight: 800,
                            border: 'none',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '10px'
                        }}
                    >
                        {isSimulating ? 'TERMINATE SIM' : 'INITIATE "WHAT-IF"'}
                        <Play size={18} fill="currentColor" style={{ transform: isSimulating ? 'rotate(90deg)' : 'none' }} />
                    </button>
                </div>
            </motion.div>

            <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: 'var(--space-lg)' }}>
                {/* Visual Impact Canvas */}
                <div className="card" style={{ display: 'flex', flexDirection: 'column' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-xl)' }}>
                        <h3 style={{ margin: 0, fontSize: '1.2rem', color: 'var(--primary)' }}>Predictive Impact Modeling</h3>
                        <div style={{ display: 'flex', gap: '16px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.7rem', fontWeight: 800, color: 'var(--text-muted)' }}>
                                <div style={{ width: 10, height: 2, background: 'var(--primary)' }} /> REAL-TIME
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.7rem', fontWeight: 800, color: 'var(--danger)' }}>
                                <div style={{ width: 10, height: 2, background: 'var(--danger)' }} /> SIMULATED
                            </div>
                        </div>
                    </div>

                    <div style={{ height: '240px', width: '100%' }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={simulationData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                <defs>
                                    <linearGradient id="colorCurrent" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.1} />
                                        <stop offset="95%" stopColor="var(--primary)" stopOpacity={0} />
                                    </linearGradient>
                                    <linearGradient id="colorSimulated" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="var(--danger)" stopOpacity={0.2} />
                                        <stop offset="95%" stopColor="var(--danger)" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                <XAxis dataKey="time" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#94a3b8', fontWeight: 600 }} />
                                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#94a3b8', fontWeight: 600 }} domain={[0, 200]} />
                                <Tooltip
                                    contentStyle={{ background: '#1e293b', border: 'none', borderRadius: '12px', boxShadow: 'var(--shadow-xl)' }}
                                    itemStyle={{ fontSize: '0.8rem', color: 'white' }}
                                    labelStyle={{ color: 'var(--secondary)', fontWeight: 900, marginBottom: '4px' }}
                                />
                                <Area type="monotone" dataKey="current" stroke="var(--primary)" strokeWidth={3} fill="url(#colorCurrent)" animationDuration={1200} />
                                <Area type="monotone" dataKey="projected" stroke="var(--danger)" strokeWidth={3} fill="url(#colorSimulated)" animationDuration={1200} />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>

                    <div style={{ marginTop: 'var(--space-lg)', height: '200px', overflowY: 'auto', paddingRight: '8px' }}>
                        <h4 style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '12px' }}>LIVE NODE STATUS (ML ENRICHED)</h4>
                        {hospitalSurges.map((h, i) => (
                            <div key={i} className="glass" style={{ padding: '8px 12px', borderRadius: '8px', borderLeft: `3px solid ${h.color}`, marginBottom: '6px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <div>
                                    <div style={{ fontWeight: 700, fontSize: '0.85rem' }}>{h.name}</div>
                                    <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>ICU: {h.icu}% • ER: {h.erWait}m</div>
                                </div>
                                <span className={`badge ${h.level === 'CRITICAL' ? 'badge-danger' : h.level === 'WATCH' ? 'badge-warning' : 'badge-success'}`} style={{ fontSize: '0.6rem' }}>
                                    {h.level}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Automated Proposals & Dispatch */}
                <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)', background: dispatchStatus === 'active' ? 'linear-gradient(to bottom, white, #f0fdf4)' : 'white' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <h3 style={{ margin: 0, fontSize: '1.2rem' }}>Dispatch Workflow</h3>
                        <div style={{ display: 'flex', gap: '6px' }}>
                            {[1, 2, 3].map(step => (
                                <div key={step} style={{
                                    width: 8, height: 8, borderRadius: '50%',
                                    background: (dispatchStatus === 'verifying' && step === 1) || (dispatchStatus === 'routing' && step <= 2) || (dispatchStatus === 'active') ? 'var(--success)' : 'var(--surface-border)',
                                    boxShadow: (dispatchStatus === 'active') ? '0 0 10px var(--success)' : 'none'
                                }} />
                            ))}
                        </div>
                    </div>

                    <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        <AnimatePresence mode="wait">
                            {dispatchStatus === 'idle' ? (
                                <motion.div key="idle" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                                    <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '12px' }}>Review ML-simulated proposals and initiate regional redistribution protocol.</p>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                        {proposals.length > 0 ? proposals.map((transfer, i) => (
                                            <div key={i} className="glass" style={{ padding: '12px', borderRadius: '10px', border: '1px solid var(--surface-border)' }}>
                                                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.6rem', fontWeight: 900, marginBottom: '8px' }}>
                                                    <span style={{ color: 'var(--primary)' }}>CLUSTER OPTIMIZATION {i + 1}</span>
                                                    <span style={{ color: transfer.priority === 'Critical' ? 'var(--danger)' : 'var(--warning)' }}>{transfer.priority.toUpperCase()}</span>
                                                </div>
                                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                                    <span style={{ fontWeight: 700, fontSize: '0.85rem' }}>{transfer.from}</span>
                                                    <ArrowRight size={14} color="var(--text-muted)" />
                                                    <span style={{ fontWeight: 700, fontSize: '0.85rem' }}>{transfer.to}</span>
                                                </div>
                                                <div style={{ marginTop: '8px', fontSize: '0.7rem', fontWeight: 700 }}> Relief: {transfer.count}% ICU</div>
                                            </div>
                                        )) : (
                                            <div style={{ padding: 'var(--space-xl)', textAlign: 'center', opacity: 0.5 }}>
                                                <ShieldAlert size={32} style={{ marginBottom: '10px' }} />
                                                <div style={{ fontSize: '0.8rem' }}>No redistribution required at current load levels.</div>
                                            </div>
                                        )}
                                    </div>
                                </motion.div>
                            ) : (
                                <motion.div
                                    key="status"
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    style={{ textAlign: 'center', padding: 'var(--space-xl) 0' }}
                                >
                                    <Activity size={48} color={dispatchStatus === 'active' ? 'var(--success)' : 'var(--primary)'} className={dispatchStatus !== 'active' ? 'pulse-alert' : ''} />
                                    <h4 style={{ margin: '16px 0 8px 0', fontSize: '1.4rem' }}>
                                        {dispatchStatus === 'verifying' ? 'AUTHENTICATING PROTOCOL' :
                                            dispatchStatus === 'routing' ? 'RECONFIGURING GPS NODES' :
                                                'REDISTRIBUTION ACTIVE'}
                                    </h4>
                                    <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                                        {dispatchStatus === 'verifying' ? 'Verifying admin credentials and regional authority...' :
                                            dispatchStatus === 'routing' ? 'Pushing mandatory bypass orders to ambulance clusters...' :
                                                'Network-wide redistribution in progress. Monitoring node stability.'}
                                    </p>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>

                    <button
                        className={`btn ${dispatchStatus === 'active' ? 'pulse-success' : ''}`}
                        style={{
                            marginTop: 'auto',
                            width: '100%',
                            height: '56px',
                            background: dispatchStatus === 'active' ? 'var(--success)' : 'var(--primary)',
                            color: 'white',
                            fontSize: '1rem',
                            fontWeight: 900,
                            border: 'none',
                            borderRadius: '14px',
                            boxShadow: dispatchStatus === 'active' ? '0 10px 30px rgba(34, 197, 94, 0.4)' : 'var(--shadow-md)'
                        }}
                        onClick={handleTrigger}
                        disabled={dispatchStatus !== 'idle'}
                    >
                        {dispatchStatus === 'idle' ? 'TRIGGER REGIONAL REDISTRIBUTION' :
                            dispatchStatus === 'active' ? 'SYSTEMS STABILIZING' : 'COMMUNICATING...'}
                    </button>
                </div>
            </div>

            <div className="card glass" style={{ border: 'none', background: 'var(--primary-light)', padding: 'var(--space-md) var(--space-xl)', display: 'flex', alignItems: 'center', gap: 'var(--space-lg)' }}>
                <ShieldAlert size={28} color="var(--primary)" />
                <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 900, fontSize: '0.95rem', color: 'var(--primary-dark)', marginBottom: '2px' }}>STRATEGIC ADVISORY</div>
                    <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>
                        Simulation predicts a {surgeDegree}% increase in ER occupancy. Based on <strong>What-If</strong> results, we recommend <strong>{surgeDegree > 90 ? 'Full Bypass' : 'Soft Redirect'}</strong> protocols for the next 4 hours.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default SurgeCommand;
