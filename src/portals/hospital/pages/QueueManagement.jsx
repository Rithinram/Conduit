import React from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useNavigate } from 'react-router-dom';
import {
    Users, UserPlus, UserMinus, Clock, TrendingUp, AlertCircle,
    Info, ArrowRight, X, UserCheck, ShieldAlert
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const waitForecast = [
    { time: '12:00', wait: 35 },
    { time: '13:00', wait: 42 },
    { time: '14:00', wait: 58 },
    { time: '15:00', wait: 85 },
    { time: '16:00', wait: 65 },
    { time: '17:00', wait: 45 },
];

const QueueManagement = () => {
    const navigate = useNavigate();
    const [showRelocationModal, setShowRelocationModal] = React.useState(false);
    const [relocating, setRelocating] = React.useState(false);

    const handleRelocate = () => {
        setRelocating(true);
        setTimeout(() => {
            setRelocating(false);
            setShowRelocationModal(false);
        }, 2000);
    };

    const relocationData = [
        { id: 'QA-1092', from: 'Zone B (Low Density)', to: 'Waiting Complex (High Density)', priority: 'Urgent' },
        { id: 'QA-1105', from: 'Zone C (Low Density)', to: 'Waiting Complex (High Density)', priority: 'Standard' },
        { id: 'QA-1221', from: 'Zone A (Standard)', to: 'Waiting Complex (High Density)', priority: 'Urgent' },
    ];
    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-lg)' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: 'var(--space-lg)' }}>
                {/* Wait time forecasting */}
                <div className="card">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <h3 style={{ margin: 0 }}>Wait Time Forecast (Next 6h)</h3>
                        <div className="badge badge-danger">SURGE EXPECTED AT 15:00</div>
                    </div>
                    <div style={{ height: '300px', marginTop: 'var(--space-xl)' }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={waitForecast}>
                                <defs>
                                    <linearGradient id="colorWait" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="var(--danger)" stopOpacity={0.2} />
                                        <stop offset="95%" stopColor="var(--danger)" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                <XAxis dataKey="time" axisLine={false} tickLine={false} />
                                <YAxis axisLine={false} tickLine={false} label={{ value: 'Minutes', angle: -90, position: 'insideLeft' }} />
                                <Tooltip />
                                <Area type="monotone" dataKey="wait" stroke="var(--danger)" strokeWidth={3} fillOpacity={1} fill="url(#colorWait)" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Staff Allocation */}
                <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
                    <h3 style={{ margin: 0 }}>Dynamic Staff Allocation</h3>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                        AI-recommended staffing adjustments based on predicted patient inflow.
                    </p>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)', marginTop: 'var(--space-sm)' }}>
                        <div className="glass" style={{ padding: 'var(--space-md)', borderRadius: 'var(--radius-md)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-md)' }}>
                                <Users size={20} color="var(--primary)" />
                                <div>
                                    <div style={{ fontWeight: 600 }}>Triage Zone A</div>
                                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Currently: 4 Staff</div>
                                </div>
                            </div>
                            <div style={{ display: 'flex', gap: 'var(--space-sm)' }}>
                                <button className="btn glass" style={{ width: 32, height: 32, padding: 0 }}><UserMinus size={16} /></button>
                                <button className="btn btn-primary" style={{ height: 32, padding: '0 0.75rem' }}><UserPlus size={16} /> +1</button>
                            </div>
                        </div>

                        <motion.div
                            whileHover={{ scale: 1.01 }}
                            className="glass"
                            style={{
                                padding: 'var(--space-md)',
                                borderRadius: 'var(--radius-md)',
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                border: '1px solid var(--warning)',
                                background: 'linear-gradient(135deg, rgba(255,193,7,0.05) 0%, rgba(255,193,7,0.1) 100%)'
                            }}
                        >
                            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-md)' }}>
                                <Users size={20} color="var(--warning)" />
                                <div>
                                    <div style={{ fontWeight: 700 }}>Waiting Complex</div>
                                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>Shortage Predicted (15:00)</div>
                                </div>
                            </div>
                            <button
                                onClick={() => setShowRelocationModal(true)}
                                className="btn btn-primary"
                                style={{ background: 'var(--warning)', color: '#92400e', border: 'none', fontWeight: 900, fontSize: '0.7rem' }}
                            >
                                REALLOCATE 2
                            </button>
                        </motion.div>
                    </div>

                    <div className="card" style={{ background: 'var(--background)', marginTop: 'auto', padding: 'var(--space-md)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--primary)', fontWeight: 700, fontSize: '0.9rem' }}>
                            <TrendingUp size={18} /> EFFICIENCY IMPACT
                        </div>
                        <p style={{ margin: '8px 0 0 0', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                            Proposed allocations will reduce peak wait by 25 minutes (30% improvement).
                        </p>
                    </div>
                </div>
            </div>

            {/* Behavioral Nudges to Staff */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="card"
                style={{ background: '#1e293b', color: 'white', display: 'flex', justifyContent: 'space-between', alignItems: 'center', border: '1px solid rgba(255,255,255,0.1)' }}
            >
                <div style={{ display: 'flex', gap: 'var(--space-lg)', alignItems: 'center' }}>
                    <div style={{ background: 'rgba(245, 158, 11, 0.2)', padding: '12px', borderRadius: '12px' }}>
                        <ShieldAlert size={28} color="#f59e0b" />
                    </div>
                    <div>
                        <h4 style={{ margin: 0, fontWeight: 900, letterSpacing: '-0.5px' }}>PREDICTIVE STAFF NUDGE</h4>
                        <p style={{ margin: '4px 0 0 0', fontSize: '0.85rem', opacity: 0.7, lineHeight: 1.5, maxWidth: '600px' }}>
                            Institutional models indicate a workforce deficit at **16:00**. Recommend activating "Surge Protocol A" and notifying available nurses via the Staff Balancer portal.
                        </p>
                    </div>
                </div>
                <button
                    onClick={() => navigate('/hospital/staff')}
                    className="btn"
                    style={{ background: '#38bdf8', color: '#0f172a', fontWeight: 900, padding: '12px 24px', fontSize: '0.8rem' }}
                >
                    POST ANNOUNCEMENT
                </button>
            </motion.div>

            {/* Relocation Modal */}
            <AnimatePresence>
                {showRelocationModal && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        style={{
                            position: 'fixed',
                            top: 0,
                            left: 0,
                            right: 0,
                            bottom: 0,
                            background: 'rgba(15, 23, 42, 0.6)',
                            backdropFilter: 'blur(8px)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            zIndex: 1000,
                            padding: '24px'
                        }}
                    >
                        <motion.div
                            initial={{ scale: 0.9, y: 20 }}
                            animate={{ scale: 1, y: 0 }}
                            exit={{ scale: 0.9, y: 20 }}
                            style={{
                                background: 'white',
                                width: '100%',
                                maxWidth: '500px',
                                borderRadius: '24px',
                                padding: '32px',
                                boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)',
                                position: 'relative'
                            }}
                        >
                            <button
                                onClick={() => setShowRelocationModal(false)}
                                style={{ position: 'absolute', top: 20, right: 20, background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8' }}
                            >
                                <X size={24} />
                            </button>

                            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '24px' }}>
                                <div style={{ background: '#fef3c7', padding: '16px', borderRadius: '16px' }}>
                                    <Users size={24} color="#d97706" />
                                </div>
                                <div>
                                    <div style={{ fontSize: '0.75rem', fontWeight: 900, color: '#d97706' }}>QUEUE ORCHESTRATION</div>
                                    <h3 style={{ margin: 0, fontSize: '1.4rem' }}>REALLOCATION FLOW</h3>
                                </div>
                            </div>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '32px' }}>
                                {relocationData.map((item) => (
                                    <div key={item.id} style={{ background: '#f8fafc', padding: '16px', borderRadius: '16px', border: '1px solid #e2e8f0' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                                            <span style={{ fontWeight: 900, fontSize: '0.75rem', color: '#1e293b' }}>CASE {item.id}</span>
                                            <span style={{ fontSize: '0.65rem', fontWeight: 900, color: item.priority === 'Urgent' ? '#ef4444' : '#64748b' }}>{item.priority.toUpperCase()}</span>
                                        </div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '0.85rem', fontWeight: 600 }}>
                                            <span style={{ color: '#64748b' }}>{item.from}</span>
                                            <ArrowRight size={14} color="#94a3b8" />
                                            <span style={{ color: '#0f172a' }}>{item.to}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <button
                                className="btn"
                                disabled={relocating}
                                onClick={handleRelocate}
                                style={{
                                    background: '#0f172a',
                                    color: 'white',
                                    fontWeight: 900,
                                    width: '100%',
                                    padding: '16px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    gap: '12px',
                                    transition: 'all 0.3s ease'
                                }}
                            >
                                {relocating ? (
                                    <>SYNCHRONIZING...</>
                                ) : (
                                    <>
                                        <UserCheck size={18} /> CONFIRM INSTITUTIONAL REALLOCATION
                                    </>
                                )}
                            </button>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default QueueManagement;
