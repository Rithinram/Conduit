import React, { useState, useEffect, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    ShieldAlert, Zap, Users, BarChart, AlertTriangle, ArrowRight, CornerUpRight,
    Info, X, Activity, Thermometer, Flame, Shield, Globe, MapPin,
    CheckCircle2, Loader2, TrendingUp, Clock, AlertCircle, RefreshCw,
    Search, Filter, ChevronRight, TrendingDown, LayoutGrid, List
} from 'lucide-react';
import {
    LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    AreaChart, Area, PieChart, Pie, Cell
} from 'recharts';
import { getHospitals, getHospitalById } from '../../../services/api';

const COLORS = ['#E63946', '#f59e0b', '#3b82f6', '#10b981'];

const HospitalSurgeManagement = () => {
    const [hospital, setHospital] = useState(null);
    const [hospitals, setHospitals] = useState([]);
    const [surgeActive, setSurgeActive] = useState(false);
    const [triageStrictness, setTriageStrictness] = useState(1);
    const [isLoading, setIsLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('overview');
    const [showSiren, setShowSiren] = useState(false);
    const [activeDialog, setActiveDialog] = useState(null);

    // Dialog messages config
    const dialogMessages = {
        allocate: { title: 'Resource Allocated', description: 'Bed and personnel shifts have been confirmed for the requesting unit. EMS has been notified.', icon: CheckCircle2, color: '#10b981' },
        simulate: { title: 'Simulation Complete', description: 'Network load-balancing simulation indicates a 14% reduction in peak-hour pressure after redistribution.', icon: Activity, color: '#3b82f6' },
        target: { title: 'Intake Target Locked', description: 'St. Mary\'s Proxy has been designated as the primary intake overflow. Data synchronization in progress.', icon: Shield, color: '#E63946' },
        swift: { title: 'SWIFT Optimization Active', description: 'Forecasting engine has rerouted 4 upcoming high-acuity cases to specialized trauma centers.', icon: Zap, color: '#E63946' }
    };

    // Dynamic Button States
    const [actionStates, setActionStates] = useState({});

    const handleAction = (id, type) => {
        setActionStates(prev => ({ ...prev, [id]: 'processing' }));
        setTimeout(() => {
            setActionStates(prev => ({ ...prev, [id]: 'completed' }));
            setActiveDialog(type || id.split('-')[0]); // Fallback to prefix
            setTimeout(() => {
                setActionStates(prev => ({ ...prev, [id]: null }));
            }, 3000);
        }, 1500);
    };

    // Mock Forecast Data
    const forecastData = [
        { time: '00:00', actual: 45, forecast: 42 },
        { time: '04:00', actual: 38, forecast: 40 },
        { time: '08:00', actual: 65, forecast: 62 },
        { time: '12:00', actual: 88, forecast: 85 },
        { time: '16:00', actual: 95, forecast: 92 },
        { time: '20:00', actual: null, forecast: 110 },
        { time: '23:00', actual: null, forecast: 98 },
    ];

    const causeData = [
        { name: 'Seasonal Flu', value: 45 },
        { name: 'Accident/Trauma', value: 25 },
        { name: 'Infrastructure Failure', value: 15 },
        { name: 'Other', value: 15 },
    ];

    const urgentRequests = [
        { id: 1, type: 'ICU', urgency: 'CRITICAL', patient: 'ID-8821', time: '2m ago' },
        { id: 2, type: 'VENTILATOR', urgency: 'HIGH', patient: 'ID-9012', time: '5m ago' },
        { id: 3, type: 'OR', urgency: 'CRITICAL', patient: 'ID-1102', time: '12m ago' },
    ];

    useEffect(() => {
        const loadInitialData = async () => {
            try {
                const [allHospitals, myHospital] = await Promise.all([
                    getHospitals(),
                    getHospitalById('67936a29ec6b074477ca3a07') // Using a mock ID from codebase
                ]);
                setHospitals(allHospitals);
                setHospital(myHospital || allHospitals[0]);
            } catch (err) {
                console.error("Failed to load hospital data", err);
            } finally {
                setIsLoading(false);
            }
        };
        loadInitialData();
    }, []);

    const handleSurgeToggle = () => {
        if (!surgeActive) {
            setShowSiren(true);
            setTimeout(() => {
                setSurgeActive(true);
                setShowSiren(false);
            }, 3000);
        } else {
            setSurgeActive(false);
        }
    };

    if (isLoading) return (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '400px' }}>
            <Loader2 className="animate-spin" size={48} color="var(--primary)" />
        </div>
    );

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-lg)', padding: '20px' }}>

            {/* ALERT OVERLAY */}
            <AnimatePresence>
                {showSiren && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        style={{
                            position: 'fixed', inset: 0, zIndex: 9999,
                            background: 'rgba(230, 57, 70, 0.4)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center'
                        }}
                    >
                        <motion.div
                            animate={{ scale: [1, 1.2, 1], rotate: [0, 5, -5, 0] }}
                            transition={{ repeat: Infinity, duration: 0.5 }}
                            style={{ textAlign: 'center', color: 'white' }}
                        >
                            <ShieldAlert size={120} strokeWidth={3} />
                            <h1 style={{ fontSize: '4rem', fontWeight: 900, margin: 0 }}>INITIATING SURGE</h1>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* ACTION POPUP DIALOG */}
            <AnimatePresence>
                {activeDialog && dialogMessages[activeDialog] && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        style={{
                            position: 'fixed', inset: 0, zIndex: 10000,
                            background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(8px)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px'
                        }}
                        onClick={() => setActiveDialog(null)}
                    >
                        <motion.div
                            initial={{ scale: 0.9, y: 30 }}
                            animate={{ scale: 1, y: 0 }}
                            exit={{ scale: 0.9, y: 30 }}
                            onClick={(e) => e.stopPropagation()}
                            style={{
                                background: 'white', borderRadius: '32px', padding: '40px',
                                maxWidth: '450px', width: '100%', textAlign: 'center',
                                boxShadow: '0 50px 100px rgba(0,0,0,0.4)', position: 'relative'
                            }}
                        >
                            <div style={{
                                width: '80px', height: '80px', borderRadius: '24px',
                                background: `${dialogMessages[activeDialog].color}20`,
                                color: dialogMessages[activeDialog].color,
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                margin: '0 auto 24px'
                            }}>
                                {React.createElement(dialogMessages[activeDialog].icon, { size: 40 })}
                            </div>
                            <h2 style={{ fontSize: '1.8rem', fontWeight: 900, marginBottom: '12px', color: 'var(--primary)' }}>
                                {dialogMessages[activeDialog].title}
                            </h2>
                            <p style={{ fontSize: '1rem', color: 'var(--text-muted)', lineHeight: 1.6, margin: '0 0 32px 0' }}>
                                {dialogMessages[activeDialog].description}
                            </p>
                            <motion.button
                                whileTap={{ scale: 0.95 }}
                                onClick={() => setActiveDialog(null)}
                                style={{
                                    width: '100%', padding: '16px', borderRadius: '16px',
                                    background: 'var(--primary)', color: 'white', border: 'none',
                                    fontWeight: 900, fontSize: '1rem', cursor: 'pointer'
                                }}
                            >
                                ACKNOWLEDGE
                            </motion.button>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* COMMAND CENTER HEADER - VIBRANT RED */}
            <motion.div
                initial={{ y: -20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                style={{
                    background: 'linear-gradient(135deg, #E63946 0%, #991b1b 100%)',
                    borderRadius: '24px',
                    padding: 'var(--space-xxl)',
                    color: 'white',
                    position: 'relative',
                    overflow: 'hidden',
                    border: '1px solid rgba(255,255,255,0.3)',
                    boxShadow: '0 20px 50px rgba(230, 57, 70, 0.4)'
                }}
            >
                <motion.div
                    animate={{ opacity: [0.1, 0.2, 0.1] }}
                    transition={{ repeat: Infinity, duration: 2 }}
                    style={{ position: 'absolute', inset: 0, background: 'radial-gradient(circle, rgba(255,255,255,0.2) 0%, transparent 70%)' }}
                />

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'relative', zIndex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
                        <div style={{
                            width: '80px', height: '80px', borderRadius: '24px',
                            background: 'rgba(255,255,255,0.2)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            boxShadow: 'inset 0 0 15px rgba(255,255,255,0.2)'
                        }}>
                            <ShieldAlert size={40} className="pulse-alert" />
                        </div>
                        <div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px' }}>
                                <motion.div animate={{ opacity: [1, 0.4, 1] }} transition={{ repeat: Infinity, duration: 2 }} style={{ width: 10, height: 10, borderRadius: '50%', background: '#fff' }} />
                                <span style={{ fontSize: '0.8rem', fontWeight: 900, opacity: 0.9, letterSpacing: '1px' }}>HOSPITAL COMMAND CENTER</span>
                            </div>
                            <h1 style={{ fontSize: '2.5rem', fontWeight: 900, margin: 0, letterSpacing: '-1.5px' }}>{hospital?.name || 'Network Central Command'}</h1>
                        </div>
                    </div>

                    <div style={{ textAlign: 'right', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                        <div style={{ fontSize: '0.9rem', fontWeight: 800, opacity: 0.8 }}>EMERGENCY OVERRIDE</div>
                        <motion.button
                            whileTap={{ opacity: 0.8 }}
                            onClick={handleSurgeToggle}
                            style={{
                                background: surgeActive ? 'white' : 'rgba(255,255,255,0.1)',
                                color: surgeActive ? '#E63946' : 'white',
                                border: '2px solid rgba(255,255,255,0.3)',
                                padding: '12px 30px',
                                borderRadius: '15px',
                                fontWeight: 900,
                                fontSize: '1rem',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '10px',
                                boxShadow: '0 10px 20px rgba(0,0,0,0.2)'
                            }}
                        >
                            {surgeActive ? <><X size={20} /> DEACTIVATE SURGE</> : <><Flame size={20} /> ACTIVATE SURGE MODE</>}
                        </motion.button>
                    </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '20px', marginTop: '40px', position: 'relative', zIndex: 1 }}>
                    {[
                        { label: 'Network Stress', value: 'Critical', color: '#fff', icon: Activity },
                        { label: 'ICU Availability', value: hospital?.availableICU > 0 ? `${hospital.availableICU} Beds` : 'Zero', color: '#fff', icon: Thermometer },
                        { label: 'Triage Queue', value: '18 min avg', color: '#fff', icon: Clock },
                        { label: 'Staff Load', value: 'High (92%)', color: '#fff', icon: Users },
                    ].map((stat, i) => (
                        <div key={stat.label} style={{ background: 'rgba(255,255,255,0.1)', padding: '20px', borderRadius: '18px', border: '1px solid rgba(255,255,255,0.2)' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                                <span style={{ fontSize: '0.75rem', fontWeight: 900, opacity: 0.7 }}>{stat.label.toUpperCase()}</span>
                                <stat.icon size={16} />
                            </div>
                            <div style={{ fontSize: '1.5rem', fontWeight: 900 }}>{stat.value}</div>
                        </div>
                    ))}
                </div>
            </motion.div>

            {/* MAIN DASHBOARD GRID */}
            <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1.8fr', gap: 'var(--space-lg)' }}>

                {/* LEFT COLUMN: CONTROLS & URGENT TICKER */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-lg)' }}>

                    {/* Triage Strictness Slider */}
                    <div className="card glass" style={{ padding: 'var(--space-xl)', border: '2px solid rgba(59, 130, 246, 0.2)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                            <h2 style={{ fontSize: '1.5rem', fontWeight: 900, margin: 0 }}>Triage Intensity</h2>
                            <span className="badge" style={{ background: triageStrictness > 2 ? '#ef4444' : '#3b82f6', color: 'white' }}>LVL {triageStrictness}</span>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                            <input
                                type="range" min="1" max="4"
                                value={triageStrictness}
                                onChange={(e) => setTriageStrictness(parseInt(e.target.value))}
                                style={{ width: '100%', height: '8px', accentColor: triageStrictness > 2 ? '#ef4444' : '#3b82f6' }}
                            />
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', fontWeight: 900, color: 'var(--text-muted)' }}>
                                <span>STANDARD</span>
                                <span>MODERATE</span>
                                <span>RESTRICTIVE</span>
                                <span>CRITICAL ONLY</span>
                            </div>
                        </div>

                        <div style={{ marginTop: '24px', padding: '16px', borderRadius: '14px', background: 'rgba(59, 130, 246, 0.05)', border: '1px solid rgba(59, 130, 246, 0.1)' }}>
                            <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--primary)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <Info size={16} />
                                Impact Analysis: {triageStrictness === 4 ? 'Strictly trauma only. Redirecting all tier 3 cases.' : 'Managing standard admission rates.'}
                            </div>
                        </div>
                    </div>

                    {/* Urgent ICU Request Ticker */}
                    <div className="card glass" style={{ padding: 'var(--space-xl)', flex: 1 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                            <h2 style={{ fontSize: '1.5rem', fontWeight: 900, margin: 0 }}>Network ICU Requests</h2>
                            <RefreshCw size={18} className="animate-spin" style={{ opacity: 0.3 }} />
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                            {urgentRequests.map(req => (
                                <motion.div
                                    key={req.id}
                                    whileHover={{ x: 5 }}
                                    style={{
                                        padding: '16px', borderRadius: '16px',
                                        background: req.urgency === 'CRITICAL' ? 'rgba(239, 68, 68, 0.05)' : 'rgba(245, 158, 11, 0.05)',
                                        border: `1px solid ${req.urgency === 'CRITICAL' ? '#ef444440' : '#f59e0b40'}`,
                                        display: 'flex', alignItems: 'center', gap: '16px'
                                    }}
                                >
                                    <div style={{
                                        width: '40px', height: '40px', borderRadius: '12px',
                                        background: req.urgency === 'CRITICAL' ? '#ef4444' : '#f59e0b',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white'
                                    }}>
                                        <AlertCircle size={20} />
                                    </div>
                                    <div style={{ flex: 1 }}>
                                        <div style={{ fontWeight: 800, fontSize: '0.9rem' }}>{req.type} REQUIRED</div>
                                        <div style={{ fontSize: '0.75rem', opacity: 0.6 }}>Patient {req.patient} • {req.time}</div>
                                    </div>
                                    <motion.button
                                        whileTap={{ scale: 0.95 }}
                                        onClick={() => handleAction(`allocate-${req.id}`, 'allocate')}
                                        disabled={actionStates[`allocate-${req.id}`]}
                                        style={{
                                            background: actionStates[`allocate-${req.id}`] === 'completed' ? '#10b981' : 'var(--primary)',
                                            padding: '8px 16px', borderRadius: '8px', color: 'white', border: 'none',
                                            fontWeight: 900, fontSize: '0.75rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px'
                                        }}
                                    >
                                        {actionStates[`allocate-${req.id}`] === 'processing' ? <Loader2 size={12} className="animate-spin" /> :
                                            actionStates[`allocate-${req.id}`] === 'completed' ? <CheckCircle2 size={12} /> : 'ALLOCATE'}
                                    </motion.button>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* RIGHT COLUMN: FORECAST & REDISTRIBUTION */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-lg)' }}>

                    {/* Incoming Patient Forecast */}
                    <div className="card glass" style={{ padding: 'var(--space-xl)', height: '320px', display: 'flex', flexDirection: 'column' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
                            <div>
                                <h2 style={{ fontSize: '1.5rem', fontWeight: 900, margin: 0 }}>Patient Load Forecast</h2>
                                <p style={{ margin: 0, opacity: 0.6, fontSize: '0.85rem' }}>ML-driven projection for the next 24 hours.</p>
                            </div>
                            <div style={{ textAlign: 'right', display: 'flex', alignItems: 'center', gap: '10px' }}>
                                <div style={{ fontSize: '1.2rem', fontWeight: 900, color: '#ef4444' }}>+12% Trend</div>
                                <TrendingUp size={16} color="#ef4444" />
                                <motion.button
                                    whileTap={{ scale: 0.95 }}
                                    onClick={() => handleAction('swift', 'swift')}
                                    disabled={actionStates['swift']}
                                    style={{
                                        background: actionStates['swift'] === 'completed' ? '#10b981' : '#E63946',
                                        color: 'white', border: 'none', padding: '6px 14px', borderRadius: '8px',
                                        fontSize: '0.75rem', fontWeight: 900, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px'
                                    }}
                                >
                                    {actionStates['swift'] === 'processing' ? <Loader2 size={12} className="animate-spin" /> :
                                        actionStates['swift'] === 'completed' ? <CheckCircle2 size={12} /> : <><Zap size={12} /> SWIFT</>}
                                </motion.button>
                            </div>
                        </div>

                        <div style={{ flex: 1 }}>
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={forecastData}>
                                    <defs>
                                        <linearGradient id="colorArea" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                                            <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(0,0,0,0.05)" />
                                    <XAxis dataKey="time" axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 700 }} />
                                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 700 }} />
                                    <Tooltip
                                        contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px rgba(0,0,0,0.1)' }}
                                    />
                                    <Area type="monotone" dataKey="forecast" stroke="#3b82f6" strokeWidth={3} fillOpacity={1} fill="url(#colorArea)" />
                                    <Line type="monotone" dataKey="actual" stroke="#10b981" strokeWidth={3} dot={{ r: 4, fill: '#10b981' }} />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* REDISTRIBUTION DASHBOARD */}
                    <div className="card glass" style={{ padding: 'var(--space-xl)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                            <h2 style={{ fontSize: '1.5rem', fontWeight: 900, margin: 0 }}>Network Redistribution</h2>
                            <div style={{ display: 'flex', gap: '8px' }}>
                                <button className="btn btn-secondary" style={{ padding: '8px 12px' }}><LayoutGrid size={16} /></button>
                                <button className="btn btn-primary" style={{ padding: '8px 12px' }}><List size={16} /></button>
                            </div>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                            {/* Distribution Hub 1 */}
                            <div style={{ padding: '20px', borderRadius: '20px', background: 'rgba(0,0,0,0.02)', border: '1px solid #e2e8f0' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
                                    <span style={{ fontWeight: 800 }}>Surplus Overflow</span>
                                    <span style={{ color: '#ef4444', fontWeight: 900 }}>88% LOAD</span>
                                </div>
                                <div style={{ height: '8px', background: '#f1f5f9', borderRadius: '4px', overflow: 'hidden', marginBottom: '12px' }}>
                                    <motion.div initial={{ width: 0 }} animate={{ width: '88%' }} style={{ height: '100%', background: '#ef4444' }} />
                                </div>
                                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: 0 }}>4 non-critical patients flagged for rerouting.</p>
                                <motion.button
                                    whileTap={{ scale: 0.95 }}
                                    onClick={() => handleAction('simulate', 'simulate')}
                                    disabled={actionStates['simulate']}
                                    style={{
                                        width: '100%', marginTop: '16px', background: actionStates['simulate'] === 'completed' ? '#10b981' : 'var(--primary)',
                                        color: 'white', border: 'none', padding: '12px', borderRadius: '12px', fontWeight: 900, cursor: 'pointer',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px'
                                    }}
                                >
                                    {actionStates['simulate'] === 'processing' ? <Loader2 size={16} className="animate-spin" /> :
                                        actionStates['simulate'] === 'completed' ? <CheckCircle2 size={16} /> : 'SIMULATE SHIFT'}
                                </motion.button>
                            </div>

                            {/* Distribution Hub 2 */}
                            <div style={{ padding: '20px', borderRadius: '20px', background: 'rgba(0,0,0,0.02)', border: '1px solid #e2e8f0' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
                                    <span style={{ fontWeight: 800 }}>St. Mary's (Proxy)</span>
                                    <span style={{ color: '#10b981', fontWeight: 900 }}>42% LOAD</span>
                                </div>
                                <div style={{ height: '8px', background: '#f1f5f9', borderRadius: '4px', overflow: 'hidden', marginBottom: '12px' }}>
                                    <motion.div initial={{ width: 0 }} animate={{ width: '42%' }} style={{ height: '100%', background: '#10b981' }} />
                                </div>
                                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: 0 }}>12 ICU beds confirmed available for intake.</p>
                                <motion.button
                                    whileTap={{ scale: 0.95 }}
                                    onClick={() => handleAction('target', 'target')}
                                    disabled={actionStates['target']}
                                    style={{
                                        width: '100%', marginTop: '16px', background: actionStates['target'] === 'completed' ? '#10b981' : '#E63946',
                                        color: 'white', border: 'none', padding: '12px', borderRadius: '12px', fontWeight: 900, cursor: 'pointer',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px'
                                    }}
                                >
                                    {actionStates['target'] === 'processing' ? <Loader2 size={16} className="animate-spin" /> :
                                        actionStates['target'] === 'completed' ? <CheckCircle2 size={16} /> : 'TARGET INTAKE'}
                                </motion.button>
                            </div>
                        </div>
                    </div>
                </div>

            </div>

            {/* CAUSE ANALYSIS SECTION */}
            <div className="card glass" style={{ padding: 'var(--space-xl)', display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '40px' }}>
                <div>
                    <h2 style={{ fontSize: '1.8rem', fontWeight: 900, margin: '0 0 10px 0' }}>Surge Cause Analysis</h2>
                    <p style={{ color: 'var(--text-muted)', marginBottom: '30px' }}>Real-time attribution logic identifying the root source of network pressure.</p>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                        {causeData.map((c, i) => (
                            <div key={c.name} style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                                <div style={{ width: '12px', height: '12px', borderRadius: '3px', background: COLORS[i] }} />
                                <div style={{ flex: 1, fontWeight: 700 }}>{c.name}</div>
                                <div style={{ fontWeight: 900, color: COLORS[i] }}>{c.value}%</div>
                            </div>
                        ))}
                    </div>
                </div>

                <div style={{ height: '240px' }}>
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie
                                data={causeData}
                                cx="50%"
                                cy="50%"
                                innerRadius={60}
                                outerRadius={80}
                                paddingAngle={5}
                                dataKey="value"
                            >
                                {causeData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                            </Pie>
                            <Tooltip />
                        </PieChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* LIVE PULSE STATUS BAR */}
            <div style={{
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                padding: '16px 32px', background: 'black', color: 'white',
                borderRadius: '16px', boxShadow: '0 20px 40px rgba(0,0,0,0.3)'
            }}>
                <div style={{ display: 'flex', gap: '30px', alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <Activity size={18} color="#ef4444" />
                        <span style={{ fontSize: '0.8rem', fontWeight: 900, letterSpacing: '1px' }}>SYSTEM HEARTBEAT</span>
                    </div>
                    <div style={{ fontSize: '0.75rem', fontWeight: 700, opacity: 0.6 }}>NETWORK CAPACITY: 4,201 / 5,000 BEDS ACTIVE</div>
                </div>
                <div style={{ fontSize: '0.8rem', fontWeight: 900, color: '#10b981', display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <Globe size={18} /> GLOBAL SYNC: ACTIVE
                </div>
            </div>

            <style>{`
                .pulse-alert {
                    animation: pulse-ring 1.5s cubic-bezier(0.4, 0, 0.6, 1) infinite;
                }
                @keyframes pulse-ring {
                    0% { transform: scale(0.95); opacity: 1; }
                    50% { transform: scale(1.05); opacity: 0.8; }
                    100% { transform: scale(0.95); opacity: 1; }
                }
            `}</style>

        </div>
    );
};

export default HospitalSurgeManagement;
